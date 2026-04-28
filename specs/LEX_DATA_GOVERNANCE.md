<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright (c) 2026 LEX Lead Exchange Standard Contributors -->
<!-- Canonical specification: https://lexstandard.org -->

# LEX Data Governance Spec

**Status:** Draft v1.0  
**Created:** March 28, 2026  
**Applies To:** All LEX message types  
**Related Specs:** LEX_SPECIFICATION.md, LEX_CONSENT_MODEL.md, LEX_EXTENSION_STANDARD.md

---

## 1. Purpose

The `dataGovernance` block gives the originating party — dealer, OEM, marketplace, or any organization — a machine-readable way to declare who may receive a LEX message downstream, whether their data may be used for analytics or ML training, and how long it should be retained.

This block directly addresses the structural mechanism by which DMS providers extract value from dealer data without dealer consent: **there was previously no standard way to signal data use restrictions in the data itself**. Policy existed only in contracts. Contracts are not checked before every data routing decision.

**What this spec does NOT do:**
- It does not technically enforce forwarding restrictions. Enforcement is contract, legal, and audit.
- It does not replace customer consent records (`consentRecord`). It governs organizational data, not customer PII.
- It does not resolve disputes between parties over data rights. It provides a standard, timestamped, spec-versioned record of stated intent — which has legal evidentiary value.
- It does not require a central authority to interpret forwarding policies.

**Cross-industry note:** `dataGovernance` is fully industry-agnostic:  
- Aviation: airline customer data vs MRO facility analytics rights  
- Real estate: buyer behavioral data vs portal platform resale  
- Maritime: cargo data vs freight forwarder analytics  
- Technology: enterprise SaaS lead data vs CRM platform behavioral training  
- Healthcare (adjacent): patient inquiry data routing restrictions

---

## 2. Anti-Capture Design

**DG-RULE-1 — Data belongs to the originating party (P7).** `dataOwner` is the organization that generated or holds direct contractual relationship with the customer. This is usually the dealer — even when the data physically resides in a DMS.

**DG-RULE-2 — dataCustodian ≠ dataOwner.** These are separate, explicitly typed fields. A DMS system is a custodian of dealer data; it is not the owner. Making this distinction machine-readable is a direct attack on the DMS capture mechanism: the implicit claim that "we hold the data, therefore we control it."

**DG-RULE-3 — analyticsAllowed and trainingDataAllowed are explicit opt-in/opt-out signals.** `false` means the data may not be aggregated into analytics products or used to train ML models. Any platform that ignores these fields and uses lead data for analytics is non-conformant at L2.

**DG-RULE-4 — Zero Trust forwarding.** Every system receiving a LEX message SHOULD check `forwardingPolicy` before routing. The spec does not enforce compliance — but a system that routes a `forwardingPolicy: RESTRICTED` message to a non-listed recipient is documented as non-conformant.

**DG-RULE-5 — LEX does not arbitrate.** When `forwardingPolicy: RESTRICTED` is declared and a routing dispute occurs, the resolution is legal/contractual. LEX provides the evidence (the original message with the declaration), not the outcome.

---

## 3. The `dataGovernance` Block

### 3.1 Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `dataOwner` | string | Yes | LEX organization ID of the organization that owns this data. Usually the originating dealer or platform. |
| `dataCustodian` | string | No | LEX organization ID of the system currently holding the data (e.g., DMS). Differs from `dataOwner` when the holder is not the owner. |
| `forwardingPolicy` | string (enum) | Yes | Controls downstream routing. See §3.2. |
| `allowedRecipients` | array of strings | Conditional | Required when `forwardingPolicy: RESTRICTED`. List of LEX org IDs that may receive this message. |
| `blockedRecipients` | array of strings | No | Explicit deny list. Applies even when `forwardingPolicy: OPEN`. |
| `analyticsAllowed` | boolean | Yes | Whether this data may be used in aggregated analytics products. `false` = opt-out. |
| `trainingDataAllowed` | boolean | Yes | Whether this data may be used to train ML or AI models. `false` = opt-out. |
| `retentionPolicy` | object | No | Retention constraints. See §3.3. |
| `auditRequired` | boolean | No | When `true`, systems that forward this message SHOULD log the forwarding event. |
| `governanceVersion` | string | No | Version of this governance declaration (for audit trail purposes). |
| `declaredAt` | string (ISO 8601) | Yes | When this governance declaration was made. |
| `declaredBy` | string | Yes | LEX org ID of the system/organization that declared this governance record. SHOULD match `dataOwner`. |

### 3.2 `forwardingPolicy` Enum

| Value | Meaning |
|-------|---------|
| `OPEN` | Any LEX participant in the routing chain may forward this message. No restrictions. |
| `RESTRICTED` | Only organizations listed in `allowedRecipients` may receive this message. `allowedRecipients` MUST be non-empty when this value is set. |
| `LOCKED` | No forwarding permitted beyond the direct receiver. The message must not be routed onward. |

### 3.3 `retentionPolicy` Sub-Object

| Field | Type | Description |
|-------|------|-------------|
| `maxRetentionDays` | integer | Maximum number of days the receiving system may retain this data after `declaredAt`. |
| `deleteOnClosure` | boolean | If `true`, data must be deleted when the related lead is closed. |
| `archiveOnClosure` | boolean | If `true`, data must be archived (not deleted) when the related lead is closed. |

---

## 4. Placement

`dataGovernance` MAY appear in any LEX message type. It SHOULD appear at the `lex` envelope level alongside `header` and `payload`:

```json
{
  "lex": {
    "header": { ... },
    "payload": { ... },
    "dataGovernance": { ... },
    "extensions": [ ... ]
  }
}
```

When present at the envelope level it applies to the entire message. A receiver MUST apply `forwardingPolicy` before routing any part of the message.

---

## 5. Full Example

### Automotive — Dealer restricting DMS analytics use

```json
"dataGovernance": {
  "dataOwner": "DEALER-ABC-MAIN-001",
  "dataCustodian": "DMS-CDK-DEALER-CHICAGO-001",
  "forwardingPolicy": "RESTRICTED",
  "allowedRecipients": [
    "ORG-TOYOTA-MFGR-NA-001",
    "PLATFORM-AUTOTRADER-001"
  ],
  "blockedRecipients": [],
  "analyticsAllowed": false,
  "trainingDataAllowed": false,
  "retentionPolicy": {
    "maxRetentionDays": 1825,
    "deleteOnClosure": false,
    "archiveOnClosure": true
  },
  "auditRequired": true,
  "governanceVersion": "1.0",
  "declaredAt": "2026-03-28T09:00:00Z",
  "declaredBy": "DEALER-ABC-MAIN-001"
}
```

**What this means structurally:**
- `dataCustodian: "DMS-CDK-DEALER-CHICAGO-001"` — CDK holds the data, but Dealer ABC owns it.
- `analyticsAllowed: false` — CDK may not include this lead data in platform analytics products.
- `trainingDataAllowed: false` — CDK may not use this lead data to train ML models for CDK Fortellis or any other CDK product.
- `forwardingPolicy: RESTRICTED` + `allowedRecipients` — CDK must not forward this lead to any recipient outside Toyota NA and AutoTrader.
- The dealer now has a spec-versioned, timestamped record of that stated intent.

### Real Estate — MLS platform data governance

```json
"dataGovernance": {
  "dataOwner": "BROKERAGE-COMPASS-NYC-001",
  "dataCustodian": "PLATFORM-ZILLOW-001",
  "forwardingPolicy": "RESTRICTED",
  "allowedRecipients": [
    "BROKERAGE-COMPASS-NYC-001",
    "TITLE-COMPANY-FIDELITY-001"
  ],
  "analyticsAllowed": false,
  "trainingDataAllowed": false,
  "retentionPolicy": {
    "maxRetentionDays": 365,
    "deleteOnClosure": false,
    "archiveOnClosure": true
  },
  "declaredAt": "2026-03-28T09:00:00Z",
  "declaredBy": "BROKERAGE-COMPASS-NYC-001"
}
```

**In real estate:** The brokerage generates the lead (buyer inquiry). Zillow (if used as the portal) is the custodian. The brokerage uses LEX data governance to say: Zillow may not use this buyer's inquiry to build competing buyer analytics products or train Zillow's "Zestimates" or recommendation models.

### Open Policy — Lead Generation Platform sharing freely

```json
"dataGovernance": {
  "dataOwner": "PLATFORM-CARS-COM-001",
  "forwardingPolicy": "OPEN",
  "analyticsAllowed": true,
  "trainingDataAllowed": false,
  "retentionPolicy": {
    "maxRetentionDays": 730
  },
  "declaredAt": "2026-03-28T09:00:00Z",
  "declaredBy": "PLATFORM-CARS-COM-001"
}
```

---

## 6. `aiGovernance`

The `aiGovernance` sub-object governs specifically **AI-related processing** of lead data. It is nested inside `dataGovernance` and is optional — present only when the message contains `leadIntelligence`, `aiInsights`, or when the platform applies AI-generated processing to the lead.

```json
"dataGovernance": {
  "dataOwner": "DEALER-SUNRIDGE-AUTO-001",
  "forwardingPolicy": "RESTRICTED",
  "allowedRecipients": ["DMS-ELEADCRM-001"],
  "analyticsAllowed": true,
  "trainingDataAllowed": false,
  "aiGovernance": {
    "aiGeneratedContentPresent": true,
    "humanReviewRequired": true,
    "explainabilityAvailable": true,
    "aiDecisionScope": "PRIORITIZATION_ONLY",
    "purposeLimitation": "ML scoring for internal lead routing only — no customer-facing AI output",
    "retentionLimitDays": 30
  },
  "declaredAt": "2026-04-12T09:00:00Z",
  "declaredBy": "DEALER-SUNRIDGE-AUTO-001"
}
```

### `aiGovernance` Field Reference

| Field | Type | Required | Description |
|---|---|---|---|
| `aiGeneratedContentPresent` | Boolean | Yes | `true` if any field in this message was produced by an AI or ML model (includes `leadIntelligence` and `aiInsights`) |
| `humanReviewRequired` | Boolean | Yes | `true` if downstream operators MUST apply human review before acting on AI-generated content (required for `CUSTOMER_FACING` scope) |
| `explainabilityAvailable` | Boolean | No | `true` if the model that produced the AI content can provide an explainability report on request |
| `aiDecisionScope` | Enum | Yes | Permitted scope of AI output (see §6.1) |
| `purposeLimitation` | String | No | Human-readable description of the intended and permitted AI processing purpose |
| `retentionLimitDays` | Integer (≥1) | No | Maximum days AI-generated artefacts in this message may be retained by downstream systems |

### 6.1 `aiDecisionScope` Enum

| Value | Meaning |
|---|---|
| `ROUTING_ADVISORY` | AI output is used only for internal lead routing decisions. Not customer-facing, not priority escalation |
| `PRIORITIZATION_ONLY` | AI may influence lead priority within the receiving system. Not customer-facing |
| `CUSTOMER_FACING` | AI-generated content will be displayed to or communicated with the customer. Requires `humanReviewRequired: true` |
| `NONE` | No AI-driven decisions are made on this lead. Block is present for documentation purposes only |

### 6.2 Validation Rules (Phase E additions)

| Rule ID | Severity | Condition |
|---|---|---|
| DG-011 | ERROR | `aiGovernance.aiGeneratedContentPresent` absent when `aiGovernance` is present |
| DG-012 | ERROR | `aiGovernance.humanReviewRequired` absent when `aiGovernance` is present |
| DG-013 | ERROR | `aiGovernance.aiDecisionScope` absent when `aiGovernance` is present |
| DG-014 | ERROR | `aiDecisionScope: CUSTOMER_FACING` but `humanReviewRequired: false` |
| DG-015 | WARNING | `aiInsights` block is present but `aiGovernance` is absent |
| DG-016 | ERROR | `aiGovernance.retentionLimitDays` is present and < 1 |

---

## 7. Validation Rules

| Rule ID | Severity | Condition |
|---------|----------|-----------|
| DG-001 | ERROR | `dataOwner` absent when block is present |
| DG-002 | ERROR | `forwardingPolicy` absent when block is present |
| DG-003 | ERROR | `analyticsAllowed` absent when block is present |
| DG-004 | ERROR | `trainingDataAllowed` absent when block is present |
| DG-005 | ERROR | `declaredAt` absent or invalid ISO 8601 |
| DG-006 | ERROR | `declaredBy` absent when block is present |
| DG-007 | ERROR | `forwardingPolicy: RESTRICTED` and `allowedRecipients` is empty or absent |
| DG-008 | WARNING | `declaredBy` does not match `dataOwner` (governance declared by non-owner) |
| DG-009 | WARNING | `forwardingPolicy: RESTRICTED` and the message's `header.receiverId` is not in `allowedRecipients` |
| DG-010 | INFO | `dataGovernance` absent from message (no governance declaration — defaults to OPEN behavior) |

---

## 8. Conformance Language

Systems that route LEX messages with `forwardingPolicy: RESTRICTED` to recipients not in `allowedRecipients` are **non-conformant at L2**. This violation is documented in the LEX Conformance spec (`LEX_CONFORMANCE.md`).

Systems that ignore `analyticsAllowed: false` and include lead data in analytics or ML training pipelines are **non-conformant at L2**.

LEX does not technically prevent non-conformant behavior. The value of this block is that it creates a machine-readable, timestamped, spec-versioned record of the data owner's stated intent. This record's legal and evidentiary value is independent of LEX enforcement capability.

---

## 9. Relationship to `consentRecord`

`dataGovernance` governs **organizational data flows** (who may receive and use the message).  
`consentRecord` governs **customer PII consent** (GDPR, TCPA, CCPA, PIPEDA — what the customer consented to).  

These are independent. A message may have both. `dataGovernance` does not replace customer consent; it adds organizational routing governance on top.

---

## 10. Related Specifications

- `LEX_CONSENT_MODEL.md` — customer PII consent records (distinct from organizational governance)
- `LEX_CONFORMANCE.md` — L2 conformance requires honoring `forwardingPolicy: RESTRICTED`
- `LEX_VALIDATION_RULES.md` — DG-001 through DG-016 (includes aiGovernance rules)
- `LEX_AI_INSIGHTS.md` — AIInsights block spec (aiGovernance governs its usage scope)
- `LEX_FIELD_DICTIONARY.md` — field-level reference
