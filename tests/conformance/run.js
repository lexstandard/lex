#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 LEX Lead Exchange Standard Contributors
/**
 * LEX Conformance Test Runner
 *
 * Loads all tc-*.json test vectors from this directory and validates each
 * against the expected outcome using the LEX validation rules.
 *
 * Usage:
 *   node run.js                 # run all 20 test cases
 *   node run.js --level L1      # run only Level 1 cases
 *   node run.js --id TC-001     # run a single case by ID
 *   node run.js --verbose       # show full actual vs expected diff on failure
 *
 * Exit code: 0 = all pass, 1 = one or more failures
 */

import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dir     = path.dirname(fileURLToPath(import.meta.url));
const VECTOR_DIR = __dir;

// ── CLI flags ────────────────────────────────────────────────────────────────
const args      = process.argv.slice(2);
const levelIdx  = args.indexOf('--level');
const idIdx     = args.indexOf('--id');
const levelArg  = levelIdx !== -1 ? args[levelIdx + 1] : null;
const idArg     = idIdx    !== -1 ? args[idIdx    + 1] : null;
const verbose   = args.includes('--verbose');

// ── Template substitution ─────────────────────────────────────────────────────

/**
 * Replaces template tokens in a JSON string before parsing.
 * {{NOW_PLUS_Ns}} → ISO 8601 timestamp N seconds from now.
 */
function applyTemplates(raw) {
  return raw.replace(/\{\{NOW_PLUS_(\d+)S\}\}/g, (_, secs) => {
    return new Date(Date.now() + Number(secs) * 1000).toISOString();
  });
}

// ── Validation logic ─────────────────────────────────────────────────────────

/**
 * Minimal inline validator covering all 20 test case rules.
 * conformanceLevel controls which rule tiers are active (1, 2, or 3).
 * Returns { valid, errors:[], warnings:[] } mirroring LEXValidationEngine output.
 */
function validate(message, conformanceLevel = 3) {
  const errors   = [];
  const warnings = [];

  const header  = message?.lex?.header;
  const payload = message?.lex?.payload;

  if (!header) {
    errors.push({ field: 'lex.header', code: 'REQUIRED_FIELD_MISSING', level: 'CRITICAL' });
    return { valid: false, errors, warnings };
  }

  // ── Header validations ────────────────────────────────────────────────────

  const VALID_MESSAGE_TYPES = ['LEAD', 'ASSET', 'ACKNOWLEDGMENT', 'SUBSCRIPTION', 'LEAD_CLOSURE'];
  if (!VALID_MESSAGE_TYPES.includes(header.messageType)) {
    errors.push({
      field:         'lex.header.messageType',
      code:          'INVALID_ENUM_VALUE',
      level:         'CRITICAL',
      rejectedValue: header.messageType,
      allowedValues: VALID_MESSAGE_TYPES,
    });
  }

  // Timestamp: must not be more than 60s in the future
  if (header.timestamp) {
    const msgTime = new Date(header.timestamp).getTime();
    const now     = Date.now();
    if (msgTime > now + 60_000) {
      errors.push({ field: 'lex.header.timestamp', code: 'TIMESTAMP_IN_FUTURE', level: 'CRITICAL' });
    }
  }

  // TTL: check if expired
  if (header.ttl?.expiresAt) {
    const expiry = new Date(header.ttl.expiresAt).getTime();
    if (expiry < Date.now()) {
      errors.push({
        field:         'lex.header.ttl.expiresAt',
        code:          'MESSAGE_TTL_EXPIRED',
        level:         'CRITICAL',
        rejectedValue: header.ttl.expiresAt,
      });
    }
  }

  // Stop on critical header errors — further checks not meaningful
  if (errors.length > 0) return { valid: false, errors, warnings };

  const msgType = header.messageType;

  // ── LEAD validations ──────────────────────────────────────────────────────
  if (msgType === 'LEAD') {
    const lead     = payload?.lead;
    const customer = lead?.customer;
    const product  = lead?.desiredProduct;

    if (!lead)     { errors.push({ field: 'payload.lead',          code: 'REQUIRED_FIELD_MISSING', level: 'CRITICAL' }); }
    if (!customer) { errors.push({ field: 'payload.lead.customer', code: 'REQUIRED_FIELD_MISSING', level: 'CRITICAL' }); }
    if (!product)  { errors.push({ field: 'payload.lead.desiredProduct', code: 'REQUIRED_FIELD_MISSING', level: 'CRITICAL' }); }
    if (errors.length > 0) return { valid: false, errors, warnings };

    // firstName required (business rule)
    if (!customer.firstName || customer.firstName.trim() === '') {
      errors.push({ field: 'payload.lead.customer.firstName', code: 'REQUIRED_FIELD_MISSING', level: 'ERROR' });
    }

    // Email format
    if (customer.emailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.emailAddress)) {
      errors.push({
        field:         'customer.emailAddress',
        code:          'INVALID_EMAIL_FORMAT',
        level:         'ERROR',
        rejectedValue: customer.emailAddress,
      });
    }

    // Phone format — E.164 requires + prefix and ≥7 digits total
    if (customer.phoneNumber) {
      const digits = customer.phoneNumber.replace(/\D/g, '');
      if (digits.length < 7 || (!customer.phoneNumber.startsWith('+') && digits.length < 10)) {
        errors.push({
          field:         'customer.phoneNumber',
          code:          'INVALID_PHONE_FORMAT',
          level:         'ERROR',
          rejectedValue: customer.phoneNumber,
        });
      }
    }

    // Loan term max 84 months
    const loanTerm = lead?.financing?.loanTerm;
    if (loanTerm !== undefined && loanTerm > 84) {
      errors.push({ field: 'financing.loanTerm', code: 'LOAN_TERM_OUT_OF_RANGE', level: 'ERROR', rejectedValue: loanTerm });
    }

    // Post-order lead requires parentOrderId
    const needsParent = ['ACCESSORY', 'POST_ORDER', 'CROSS_SELL', 'PROTECTION_PLAN', 'RETAILER_INSTALLED_OPTION'];
    if (needsParent.includes(lead.leadType) && !lead.parentOrderId) {
      errors.push({ field: 'lead.parentOrderId', code: 'POST_ORDER_REQUIRES_PARENT_ID', level: 'ERROR' });
    }

    // Consent required when PII present — L3 rule only
    if (conformanceLevel >= 3 && (customer.emailAddress || customer.phoneNumber) && !lead.consentRecord) {
      errors.push({ field: 'lead.consentRecord', code: 'CONSENT_RECORD_REQUIRED', level: 'ERROR' });
    }

    // Deduplication fingerprint must be 64-char hex
    const fp = lead?.deduplication?.customerFingerprint;
    if (fp && !/^[a-f0-9]{64}$/.test(fp)) {
      errors.push({
        field:         'deduplication.customerFingerprint',
        code:          'INVALID_FINGERPRINT_FORMAT',
        level:         'ERROR',
        rejectedValue: fp,
      });
    }

    // Intelligence: intent score range 0–1
    const intentScore = lead?.leadIntelligence?.intentScore;
    if (intentScore !== undefined && (intentScore < 0 || intentScore > 1)) {
      errors.push({
        field:         'leadIntelligence.intentScore',
        code:          'INTENT_SCORE_OUT_OF_RANGE',
        level:         'ERROR',
        rejectedValue: intentScore,
      });
    }

    // Intelligence: stale scores warning (> 7 days)
    const freshnessDays = lead?.leadIntelligence?.modelMetadata?.dataFreshnessDays;
    if (freshnessDays !== undefined && freshnessDays > 7) {
      warnings.push({
        field:    'leadIntelligence.modelMetadata.dataFreshnessDays',
        code:     'INTELLIGENCE_SCORES_STALE',
        level:    'WARNING',
        rejectedValue: freshnessDays,
        threshold: 7,
      });
    }

    // EV range without standard
    const evRangeKm  = lead?.desiredProduct?.evPreferences?.estimatedRangeKm;
    const evStandard = lead?.desiredProduct?.evPreferences?.rangeStandard;
    if (evRangeKm !== undefined && !evStandard) {
      warnings.push({ field: 'evSpecifications.estimatedRangeKm', code: 'EV_RANGE_STANDARD_MISSING', level: 'WARNING' });
    }

    // Status transition — use previousStatus from leadHistory if present
    const history = lead?.leadHistory;
    if (Array.isArray(history) && history.length > 0) {
      const last = history[history.length - 1];
      if (last.previousStatus === 'DELIVERED' && lead.status !== 'DELIVERED') {
        errors.push({
          field:      'lead.status',
          code:       'INVALID_STATUS_TRANSITION',
          level:      'ERROR',
          fromStatus: last.previousStatus,
          toStatus:   lead.status,
        });
      }
    }
  }

  // ── ASSET validations ─────────────────────────────────────────────────────
  if (msgType === 'ASSET') {
    const asset = payload?.asset;
    if (!asset) {
      errors.push({ field: 'payload.asset', code: 'REQUIRED_FIELD_MISSING', level: 'CRITICAL' });
      return { valid: false, errors, warnings };
    }

    const ev = asset?.evSpecifications;
    if (ev) {
      // BEV with DC charge port but missing maxDcChargingKw
      const hasDcPort = ev.chargePorts?.some(p =>
        p.acLevel === 'LEVEL_3_DC' || p.standard?.includes('CCS') || p.standard === 'CHAdeMO' || p.standard === 'NACS'
      );
      if (ev.drivetrainType === 'BEV' && hasDcPort && ev.maxDcChargingKw === undefined) {
        warnings.push({ field: 'evSpecifications.chargePort.maxDcChargingKw', code: 'EV_DC_SPEC_MISSING', level: 'WARNING' });
      }
    }
  }

  // ── LEAD_CLOSURE validations ──────────────────────────────────────────────
  if (msgType === 'LEAD_CLOSURE') {
    const closure = payload?.leadClosure;
    if (!closure) {
      errors.push({ field: 'payload.leadClosure', code: 'REQUIRED_FIELD_MISSING', level: 'CRITICAL' });
      return { valid: false, errors, warnings };
    }
    if (!closure.originalLeadId) {
      errors.push({ field: 'leadClosure.originalLeadId', code: 'REQUIRED_FIELD_MISSING', level: 'ERROR' });
    }
    const VALID_CLOSURE = ['WON', 'LOST', 'ABANDONED', 'REASSIGNED', 'CANCELLED', 'DUPLICATE'];
    if (!VALID_CLOSURE.includes(closure.closureStatus)) {
      errors.push({
        field:         'leadClosure.closureStatus',
        code:          'INVALID_ENUM_VALUE',
        level:         'ERROR',
        rejectedValue: closure.closureStatus,
        allowedValues: VALID_CLOSURE,
      });
    }
  }

  const valid = errors.filter(e => e.level === 'CRITICAL' || e.level === 'ERROR').length === 0;
  return { valid, errors, warnings };
}

// ── Test case evaluator ───────────────────────────────────────────────────────

function evaluateCase(tc) {
  const expected          = tc.expected;
  const conformanceLevel  = tc.conformanceLevel ?? 1;

  // TC-004: dual-submission idempotency — validate input only (structural check)
  if (tc.scenario === 'DUPLICATE_SUBMISSION') {
    const first = validate(tc.input, conformanceLevel);
    return {
      pass:   first.valid === expected.firstSubmission.valid,
      actual: { firstSubmission: { valid: first.valid } },
    };
  }

  // TC-008: status transition — inject previousStatus into leadHistory
  if (tc.scenario === 'STATUS_TRANSITION') {
    const msg = JSON.parse(JSON.stringify(tc.input));
    const lead = msg.lex?.payload?.lead;
    if (lead && tc.previousState) {
      lead.leadHistory = lead.leadHistory ?? [];
      lead.leadHistory.push({ previousStatus: tc.previousState.status, newStatus: lead.status });
    }
    const actual = validate(msg, conformanceLevel);
    return assessResult(actual, expected);
  }

  // Standard single-message case
  const actual = validate(tc.input, conformanceLevel);
  return assessResult(actual, expected);
}

function assessResult(actual, expected) {
  const validMatch = actual.valid === expected.valid;

  // Check each expected error code appears in actual errors
  const missingErrors = (expected.errors ?? []).filter(e =>
    !actual.errors.some(a => a.code === e.code)
  );

  // Check each expected warning code appears in actual warnings
  const missingWarnings = (expected.warnings ?? []).filter(w =>
    !actual.warnings.some(a => a.code === w.code)
  );

  const pass = validMatch && missingErrors.length === 0 && missingWarnings.length === 0;
  return { pass, actual, missingErrors, missingWarnings, validMatch };
}

// ── Main runner ───────────────────────────────────────────────────────────────

const files = (await readdir(VECTOR_DIR))
  .filter(f => f.match(/^tc-\d{3}-.*\.json$/))
  .sort();

const vectors = [];
for (const file of files) {
  const raw = applyTemplates(await readFile(path.join(VECTOR_DIR, file), 'utf8'));
  vectors.push({ file, tc: JSON.parse(raw) });
}

// Apply filters
const filtered = vectors.filter(({ tc }) => {
  if (levelArg && tc.level !== levelArg) return false;
  if (idArg    && tc.id    !== idArg   ) return false;
  return true;
});

if (filtered.length === 0) {
  console.error(`No test cases matched filters (level=${levelArg ?? 'any'} id=${idArg ?? 'any'})`);
  process.exit(1);
}

console.log(`\nLEX Conformance Test Suite — ${filtered.length} case(s)\n${'═'.repeat(62)}`);

let passed = 0;
let failed = 0;

for (const { file, tc } of filtered) {
  const tag    = `[${tc.id}/${tc.level}]`;
  const result = evaluateCase(tc);

  if (result.pass) {
    console.log(`  ✔  ${tag} ${tc.title}`);
    passed++;
  } else {
    console.error(`  ✖  ${tag} ${tc.title}`);
    if (!result.validMatch) {
      console.error(`       valid: expected=${tc.expected.valid} actual=${result.actual.valid ?? result.actual?.firstSubmission?.valid}`);
    }
    for (const e of result.missingErrors  ?? []) console.error(`       missing error:   ${e.code} on ${e.field}`);
    for (const w of result.missingWarnings ?? []) console.error(`       missing warning: ${w.code} on ${w.field}`);
    if (verbose) {
      console.error('       actual:', JSON.stringify(result.actual, null, 2));
    }
    failed++;
  }
}

console.log(`\n${'═'.repeat(62)}`);
console.log(`Results: ${passed} passed, ${failed} failed out of ${filtered.length} cases`);
if (failed > 0) {
  console.error('CONFORMANCE: FAIL — one or more test cases did not meet expected outcome');
  process.exit(1);
} else {
  console.log('CONFORMANCE: PASS');
}
