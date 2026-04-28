<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright (c) 2026 LEX Lead Exchange Standard Contributors -->
<!-- Canonical specification: https://lexstandard.org -->

# LEX - Conformance & Sandbox Testing Specification

## Overview

Enterprise adopters (OEM platforms, DMS vendors, aggregators) require a way to certify that their LEX integration is correct before connecting to production systems. This document defines:

1. **Conformance Levels** — tiered certification requirements
2. **Test Case Library** — canonical test cases with expected outcomes
3. **Sandbox Endpoint Specification** — mock server behavior
4. **Certification Process** — how to achieve certified status

---

## 1. Conformance Levels

### Level 1 — Basic (Minimum for production)
Required for any system that sends or receives LEX messages.

| Requirement | Description |
|---|---|
| Valid message envelope | Can produce and parse `lex.header` + `lex.payload` |
| Required field compliance | All required fields present in every message |
| MessageID uniqueness | No duplicate messageIds sent within a session |
| Timestamp validity | Timestamps within ±60s |
| ACKNOWLEDGMENT response | Sends ACK for every received LEAD |

### Level 2 — Standard (Required for DMS integration)
All Level 1 requirements, plus:

| Requirement | Description |
|---|---|
| Full lifecycle support | Can send and receive all 15 lead status values |
| Status transition validation | Rejects invalid status transitions with correct error |
| Business rule validation | Email, phone, VIN, financing field rules |
| Lead Closure support | Can send and receive LEAD_CLOSURE messages |
| Bidirectional flow | Can both initiate and respond to lead messages |

### Level 3 — Full (Required for OEM and platform certification)
All Level 2 requirements, plus:

| Requirement | Description |
|---|---|
| Consent record compliance | `consentRecord` present and valid for PII-bearing messages |
| Deduplication support | Sends `customerFingerprint`, handles `DUPLICATE` closure |
| EV extensions | Can parse and produce `evSpecifications` block |
| Lead intelligence passthrough | Preserves `leadIntelligence` without modification |
| Retry and DLQ headers | Produces `retryContext` on retry; routes to DLQ on permanent failure |
| Multi-format support | Can parse JSON-EDI and XML-EDI |
| Subscription management | Full SUBSCRIPTION message send/receive |
| Organization context | `organizationContext` correctly populated |

---

## 2. Test Case Library

### TC-001: Valid Primary Lead (Level 1)
**Input:** A well-formed LEAD message with all required fields  
**Expected:** `valid: true`, ACKNOWLEDGMENT with status `RECEIVED`

### TC-002: Missing Required Field (Level 1)
**Input:** LEAD message missing `customer.firstName`  
**Expected:** `valid: false`, error on `payload.lead.customer.firstName`, code `REQUIRED_FIELD_MISSING`

### TC-003: Invalid MessageType (Level 1)
**Input:** Header with `messageType: "INQUIRY"` (not in enum)  
**Expected:** `valid: false`, CRITICAL error on `lex.header.messageType`

### TC-004: Duplicate MessageID (Level 1)
**Input:** Two LEAD messages with identical `messageId` sent ≤60s apart  
**Expected:** Second message returns 200 OK (idempotency), no duplicate processing

### TC-005: Future Timestamp (Level 1)
**Input:** LEAD with `timestamp` 5 minutes in the future  
**Expected:** `valid: false`, error on `lex.header.timestamp`, code `TIMESTAMP_IN_FUTURE`

### TC-006: Invalid Email Format (Level 2)
**Input:** `customer.emailAddress: "not-an-email"`  
**Expected:** `valid: false`, error on `customer.emailAddress`, code `INVALID_EMAIL_FORMAT`

### TC-007: Invalid Phone (Level 2)
**Input:** `customer.phoneNumber: "123"` (too short for E.164)  
**Expected:** `valid: false`, error on `customer.phoneNumber`, code `INVALID_PHONE_FORMAT`

### TC-008: Invalid Status Transition (Level 2)
**Input:** Lead update moving status from `DELIVERED` to `IN_NEGOTIATION`  
**Expected:** `valid: false`, error on `lead.status`, code `INVALID_STATUS_TRANSITION`

### TC-009: Post-Order Lead Without parentOrderId (Level 2)
**Input:** Lead with `leadType: "ACCESSORY"` but no `parentOrderId`  
**Expected:** `valid: false`, error on `lead.parentOrderId`, code `POST_ORDER_REQUIRES_PARENT_ID`

### TC-010: Financing Validation — Invalid Loan Term (Level 2)
**Input:** `financing.loanTerm: 96` (max is 84)  
**Expected:** `valid: false`, error on `financing.loanTerm`, code `LOAN_TERM_OUT_OF_RANGE`

### TC-011: Consent Record Missing for PII Lead (Level 3)
**Input:** LEAD with `customer.email` and `customer.phone` but no `consentRecord`  
**Expected:** `valid: false`, error on `lead.consentRecord`, code `CONSENT_RECORD_REQUIRED`

### TC-012: Invalid Customer Fingerprint Format (Level 3)
**Input:** `deduplication.customerFingerprint` is not a 64-character hex string  
**Expected:** `valid: false`, error on `deduplication.customerFingerprint`, code `INVALID_FINGERPRINT_FORMAT`

### TC-013: EV Range Without Standard Specified (Level 3)
**Input:** `evSpecifications.estimatedRangeKm` present but `rangeStandard` missing  
**Expected:** WARNING on `evSpecifications.estimatedRangeKm`, code `EV_RANGE_STANDARD_MISSING`

### TC-014: Lead Intelligence — Stale Scores (Level 3)
**Input:** `leadIntelligence.modelMetadata.dataFreshnessDays: 14`  
**Expected:** WARNING on `leadIntelligence.modelMetadata.dataFreshnessDays`, code `INTELLIGENCE_SCORES_STALE`

### TC-015: Lead Intelligence — Out-of-Range Intent Score (Level 3)
**Input:** `leadIntelligence.intentScore: 1.5`  
**Expected:** `valid: false`, error on `leadIntelligence.intentScore`, code `INTENT_SCORE_OUT_OF_RANGE`

### TC-016: Valid Lead Closure (Level 2)
**Input:** LEAD_CLOSURE with `closureStatus: "WON"` referencing a valid `originalLeadId`  
**Expected:** `valid: true`, ACKNOWLEDGMENT with status `PROCESSED`

### TC-017: ASSET Message — BEV with chargePort (Level 3)
**Input:** ASSET Message with `evSpecifications.drivetrainType: "BEV"` and full `chargePort` block  
**Expected:** `valid: true`

### TC-018: ASSET Message — BEV missing DC charging spec (Level 3)
**Input:** ASSET BEV with `chargePort` but no `maxDcChargingKw`  
**Expected:** WARNING on `evSpecifications.chargePort.maxDcChargingKw`, code `EV_DC_SPEC_MISSING`

### TC-019: Message TTL Expired (Level 3)
**Input:** Message with `header.ttl.expiresAt` in the past  
**Expected:** Message routed to DLQ, sender receives notification if `notificationWebhook` registered

### TC-020: Retry Context on Retransmission (Level 3)
**Input:** LEAD with `header.retryContext.attemptNumber: 3`  
**Expected:** Receiver processes idempotently; no duplicate lead created if `messageId` matches existing record

---

## 3. Sandbox Endpoint Specification

The LEX sandbox provides a hosted mock server for integration testing without connecting to production systems.

### Base URL
```
https://sandbox.lexstandard.org/v1
```
*(Or self-hosted using the reference Docker image: `lexstandard/sandbox:latest`)*

### Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/messages` | Submit any LEX message for validation |
| `GET` | `/messages/{messageId}` | Retrieve a previously submitted message |
| `GET` | `/messages/{messageId}/ack` | Get acknowledgment for a message |
| `POST` | `/conformance/run` | Run full conformance test suite for a Level |
| `GET` | `/conformance/report/{sessionId}` | Get conformance test results |
| `GET` | `/schema/{messageType}` | Retrieve JSON Schema for a message type |
| `GET` | `/health` | Sandbox health check |

### Sandbox Behaviors

**Predictable test IDs:** Using specific `messageId` prefixes triggers deterministic sandbox behaviors:

| Prefix | Sandbox Behavior |
|---|---|
| `TEST-VALID-` | Always returns valid |
| `TEST-REJECT-` | Returns validation failure with all error codes |
| `TEST-TIMEOUT-` | Simulates 5-second delay (for retry testing) |
| `TEST-DLQ-` | Simulates permanent failure after 1 attempt |
| `TEST-DUP-` | Returns DUPLICATE detection if sent within 30s |

### Conformance Run Request

```json
POST /conformance/run
{
  "organizationId": "DEALER-MY-SYSTEM-001",
  "targetLevel": 2,
  "contactEmail": "dev@example.com",
  "includeTestCases": ["TC-001", "TC-002", "TC-006", "TC-016"]
}
```

### Conformance Report Response

```json
{
  "sessionId": "CONF-2026-0042",
  "organizationId": "DEALER-MY-SYSTEM-001",
  "targetLevel": 2,
  "runAt": "2026-03-25T09:00:00Z",
  "result": "PASS",
  "passCount": 18,
  "failCount": 0,
  "warnCount": 2,
  "testResults": [
    {
      "testCaseId": "TC-001",
      "status": "PASS",
      "durationMs": 34
    },
    {
      "testCaseId": "TC-006",
      "status": "PASS",
      "durationMs": 12
    }
  ],
  "certificationToken": "LEX-L2-CERT-2026-DEALER-MY-SYSTEM-001-abc123"
}
```

---

## 4. Certification Process

1. **Register** your organization in the LEX Organization Registry
2. **Run conformance suite** for your target level via `/conformance/run`
3. **Receive certification token** — valid for 12 months
4. **Display certified badge** in integration documentation
5. **Re-certify** annually or after major implementation changes

### Certification Tokens

Certification tokens are opaque strings that encode:
- Organization ID
- Certification level
- Expiry date
- Issuing authority signature

Format: `LEX-L{level}-CERT-{year}-{orgId}-{signature}`

Example: `LEX-L2-CERT-2026-DEALER-ABC-MAIN-4f8e2a1b`

---

## 5. Self-Hosted Sandbox

For organizations that cannot use the public sandbox (air-gapped networks, regulated environments):

```bash
docker run -p 8080:8080 \
  -e LEX_VERSION=1.0 \
  -e STRICT_MODE=false \
  lexstandard/sandbox:latest
```

The self-hosted sandbox implements all endpoints identically to the public version but with no external network dependencies.

---

## 6. Conformance Test Data Files

Reference test data for all 20 test cases is available in `tests/` directory:

| File | Contents |
|---|---|
| `tests/conformance/tc-001-valid-lead.json` | TC-001 valid lead |
| `tests/conformance/tc-002-missing-field.json` | TC-002 missing required field |
| `tests/conformance/tc-003-invalid-type.json` | TC-003 invalid message type |
| `tests/conformance/tc-004-duplicate-id.json` | TC-004 duplicate message ID |
| `tests/conformance/tc-005-future-timestamp.json` | TC-005 future timestamp |
| `tests/conformance/tc-006-invalid-email.json` | TC-006 invalid email |
| `tests/conformance/tc-007-invalid-phone.json` | TC-007 invalid phone |
| `tests/conformance/tc-008-invalid-transition.json` | TC-008 bad status transition |
| `tests/conformance/tc-009-post-order-no-parent.json` | TC-009 post-order missing parentOrderId |
| `tests/conformance/tc-010-loan-term.json` | TC-010 loan term out of range |
| `tests/conformance/tc-011-consent-missing.json` | TC-011 PII without consent |
| `tests/conformance/tc-012-bad-fingerprint.json` | TC-012 invalid fingerprint |
| `tests/conformance/tc-013-ev-no-standard.json` | TC-013 EV range without standard |
| `tests/conformance/tc-014-stale-intelligence.json` | TC-014 stale ML scores |
| `tests/conformance/tc-015-intent-score-range.json` | TC-015 intent score out of range |
| `tests/conformance/tc-016-lead-closure.json` | TC-016 valid lead closure |
| `tests/conformance/tc-017-bev-asset.json` | TC-017 BEV ASSET Message |
| `tests/conformance/tc-018-bev-missing-dc.json` | TC-018 BEV missing DC spec |
| `tests/conformance/tc-019-ttl-expired.json` | TC-019 expired TTL |
| `tests/conformance/tc-020-retry-context.json` | TC-020 retry context |

