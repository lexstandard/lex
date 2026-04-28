/**
 * report.js — Console report renderer for the e2e integrity simulation.
 *
 * Renders two sections:
 *   1. Per-scenario table  — one row per industry × format
 *   2. Summary block       — overall pass/fail counts and library coverage stats
 */

// ── ANSI colour helpers (no external deps) ────────────────────────────────────

const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  green:  '\x1b[32m',
  red:    '\x1b[31m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  white:  '\x1b[37m',
  bgGreen: '\x1b[42m',
  bgRed:   '\x1b[41m',
};

const g = (s) => `${C.green}${s}${C.reset}`;
const r = (s) => `${C.red}${s}${C.reset}`;
const y = (s) => `${C.yellow}${s}${C.reset}`;
const c = (s) => `${C.cyan}${s}${C.reset}`;
const b = (s) => `${C.bold}${s}${C.reset}`;
const d = (s) => `${C.dim}${s}${C.reset}`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function pad(str, len, align = 'left') {
  const s = String(str ?? '');
  if (s.length >= len) return s.slice(0, len);
  const padding = ' '.repeat(len - s.length);
  return align === 'right' ? padding + s : s + padding;
}

function passIcon(pass)  { return pass  ? g('✔ PASS') : r('✘ FAIL'); }
function boolIcon(value) { return value ? g('yes')    : r('no');     }

function coverageBar(captured, total) {
  const pct = total > 0 ? Math.round((captured / total) * 100) : 0;
  const filled = Math.round((captured / total) * 10);
  const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);
  const colour = pct === 100 ? C.green : pct >= 70 ? C.yellow : C.red;
  return `${colour}${bar}${C.reset} ${pct}%`;
}

// ── Main renderer ─────────────────────────────────────────────────────────────

/**
 * @typedef {import('./receiver.js').ReceiveResult} ReceiveResult
 *
 * @param {ReceiveResult[]} results
 */
export function renderReport(results) {
  const LINE = '─'.repeat(120);
  const DLINE = '═'.repeat(120);

  console.log(`\n${C.cyan}${DLINE}${C.reset}`);
  console.log(b(c('  LEX END-TO-END INTEGRITY SIMULATION — RESULTS REPORT')));
  console.log(`  Generated: ${new Date().toISOString()}`);
  console.log(`${C.cyan}${DLINE}${C.reset}\n`);

  // ── Section 1: Per-scenario results ────────────────────────────────────────

  console.log(b('  SCENARIO RESULTS  (1 row = 1 industry × format)\n'));

  // Table header
  const H = [
    pad('Industry',          15),
    pad('Format',            8),
    pad('Integrity',         10),
    pad('Size',              8),
    pad('Hash (first 16…)',  20),
    pad('Field Coverage',    20),
    pad('LEX Valid',         10),
    pad('Missing Fields',    24),
  ];
  console.log(`  ${b(H.join('  '))}`);
  console.log(`  ${LINE.slice(0, 120)}`);

  for (const res of results) {
    const hashStr = res.integrityPass
      ? g(res.computedHash.slice(0, 16) + '…')
      : r(res.computedHash.slice(0, 16) + '… ≠ ' + res.expectedHash.slice(0, 8) + '…');

    const missing = res.fields.missingFields.length > 0
      ? y(res.fields.missingFields.join(', ').slice(0, 22))
      : g('none');

    const lexCol = res.format === 'json'
      ? res.lexValid
        ? boolIcon(true)
        : res.lexOnlyTemporalErrors
          ? y('exp (ts)')
          : r('no')
      : d('n/a (non-JSON)');

    const row = [
      pad(res.industry,    15),
      pad(res.format,      8),
      pad(passIcon(res.integrityPass), 18),   // extra room for ANSI codes
      pad(`${(res.sizeBytes / 1024).toFixed(1)}KB`, 8),
      pad(hashStr, 28),
      coverageBar(res.fields.fieldsCaptured, res.fields.totalFields),
    ];

    // Build fixed-width line manually for columns after coverageBar
    console.log(`  ${row.join('  ')}  ${pad(lexCol, 18)}  ${missing}`);
  }

  console.log(`  ${LINE.slice(0, 120)}\n`);

  // ── Section 2: Summary ─────────────────────────────────────────────────────

  const total        = results.length;
  const passed       = results.filter(r => r.integrityPass).length;
  const failed       = total - passed;
  const jsonResults  = results.filter(r => r.format === 'json');
  const lexPassed    = jsonResults.filter(r => r.lexValid).length;
  const lexTemporalOnly = jsonResults.filter(r => !r.lexValid && r.lexOnlyTemporalErrors).length;
  const lexStructural   = jsonResults.filter(r => !r.lexValid && !r.lexOnlyTemporalErrors).length;
  const avgCoverage  = results.reduce((sum, r) =>
    sum + r.fields.fieldsCaptured / r.fields.totalFields, 0) / total;

  const allFieldsMissing = {};
  for (const res of results) {
    for (const f of res.fields.missingFields) {
      allFieldsMissing[f] = (allFieldsMissing[f] ?? 0) + 1;
    }
  }

  console.log(b('  SUMMARY\n'));
  console.log(`  Total scenarios   :  ${b(total)}`);
  console.log(`  Integrity PASS    :  ${g(String(passed))} / ${total}`);
  console.log(`  Integrity FAIL    :  ${failed > 0 ? r(String(failed)) : g('0')} / ${total}`);
  console.log(`  LEX schema valid  :  ${g(String(lexPassed))} / ${jsonResults.length} (JSON messages only)`);
  if (lexTemporalOnly > 0) {
    console.log(`  └─ timestamp-only :  ${y(String(lexTemporalOnly))} / ${jsonResults.length}  ${d('(static example files have historical timestamps — expected in simulation)')}`);
  }
  if (lexStructural > 0) {
    console.log(`  └─ structural err :  ${r(String(lexStructural))} / ${jsonResults.length}  (schema/business-rule violations — investigate)`);
  }
  console.log(`  Avg field coverage:  ${coverageBar(Math.round(avgCoverage * 10), 10)}\n`);

  if (Object.keys(allFieldsMissing).length > 0) {
    console.log(b('  FIELD COVERAGE GAPS  (fields not extractable by format)\n'));
    for (const [field, count] of Object.entries(allFieldsMissing).sort((a, b) => b[1] - a[1])) {
      const bar = '█'.repeat(count) + '░'.repeat(total - count);
      console.log(`  ${pad(field, 18)}  ${y(bar)}  missing in ${count}/${total} scenarios`);
    }
    console.log('');
  }

  // ── Section 3: ACK summary (first few) ─────────────────────────────────────

  console.log(b('  SAMPLE ACK MESSAGES  (first 3 scenarios)\n'));
  for (const res of results.slice(0, 3)) {
    const ack = res.ack.lex.payload.acknowledgment;
    console.log(`  ${c(ack.acknowledgmentId)}`);
    console.log(`  ${d('correlationId :')} ${ack.correlationId ?? 'n/a'}`);
    console.log(`  ${d('status        :')} ${ack.status === 'VALIDATED' ? g(ack.status) : r(ack.status)}`);
    console.log(`  ${d('statusReason  :')} ${ack.statusReason}`);
    console.log('');
  }

  // ── Final verdict ─────────────────────────────────────────────────────────

  console.log(`${C.cyan}${DLINE}${C.reset}`);
  if (failed === 0) {
    console.log(b(g('  ✔  ALL INTEGRITY CHECKS PASSED — no data loss detected across all formats')));
  } else {
    console.log(b(r(`  ✘  ${failed} INTEGRITY CHECK(S) FAILED — investigate hash mismatches above`)));
  }
  console.log(`${C.cyan}${DLINE}${C.reset}\n`);
}
