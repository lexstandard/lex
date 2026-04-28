<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright (c) 2026 LEX Lead Exchange Standard Contributors -->
<!-- Canonical specification: https://lexstandard.org -->

# LEX Capability Advertisement Spec

**Status:** Draft v1.0  
**Created:** March 28, 2026  
**Applies To:** SUBSCRIPTION message type  
**Related Specs:** LEX_CONFORMANCE.md, LEX_SPECIFICATION.md, LEX_EXTENSION_STANDARD.md

---

## 1. Purpose

The `systemCapabilities` block allows a LEX participant to declare what it can receive and process. This lets senders optionally tailor their outbound messages — omitting blocks the receiver has declared unsupported, or selecting an appropriate serialization format.

**Critical anti-capture constraint:** Capability advertisement is ADVISORY. It is never a gate. A sender that does not have capability data for a receiver MUST send the full message and rely on Passthrough Obligation (P4) for any blocks the receiver cannot process. A system that rejects a conformant LEX message because the sender did not check its capability record is non-conformant.

This spec explicitly addresses C5's anti-capture risk: **capability advertisement must not become a compatibility certification gate**, the mechanism by which CDK Fortellis and similar platforms charge per-field access fees by requiring certification before messages can include certain blocks.

---

## 2. Anti-Capture Design

**CAP-RULE-1 — Advisory, not prescriptive.** Capability records tell senders what a receiver can actively process. They do not tell senders what they are allowed to send. Non-negotiable.

**CAP-RULE-2 — No registration required to receive.** A system that has never registered a capability record MUST be treated as `conformanceLevel: L1` by default. It is not blocked from receiving messages.

**CAP-RULE-3 — No certification to expand capabilities.** A system updates its capability record by publishing a new SUBSCRIPTION message. There is no approval step. No fee. No waiting period.

**CAP-RULE-4 — Passthrough Obligation preserved.** If a receiver's `unsupportedBlocks` lists `dealLineage` but a message arrives with `dealLineage` present, the receiver MUST still forward the message intact. It may ignore the block internally; it may not strip it on pass-through.

---

## 3. The `systemCapabilities` Block

`systemCapabilities` is an optional property within the `payload.subscription` object.

### 3.1 Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `lexVersion` | string (semver) | Yes | Highest LEX specification version the system can process. |
| `conformanceLevel` | string (enum) | Yes | Declared conformance level. See §3.2. |
| `supportedMessageTypes` | array of strings | Yes | Which message types the system processes: `LEAD`, `ASSET`, `ACKNOWLEDGMENT`, `SUBSCRIPTION`, `LEAD_CLOSURE`. |
| `supportedBlocks` | array of strings | No | Named payload blocks the system actively processes (e.g., `financialSummary`, `dealLineage`). |
| `unsupportedBlocks` | array of strings | No | Named payload blocks the system cannot process. Senders MAY omit these when targeting this receiver. |
| `supportedFormats` | array of strings | No | Accepted serialization formats: `JSON_EDI`, `XML_EDI`, `X12`, `EDIFACT`. Default assumed: `JSON_EDI`. |
| `maxMessageSizeKb` | integer | No | Maximum accepted message size in kilobytes. |
| `supportedExtensionNamespaces` | array of strings | No | Extension namespaces from `extensions[]` this receiver will actively process. Unknown namespaces travel per P4. |
| `realtimeCapable` | boolean | No | Whether the system accepts real-time push delivery. |
| `batchOnly` | boolean | No | If true, system only accepts batch delivery. |
| `preferredBatchInterval` | string (ISO 8601 duration) | No | Preferred batch delivery cadence (e.g., `PT15M` = 15 minutes). |
| `lastUpdated` | string (ISO 8601) | Yes | When this capability record was last updated. |

### 3.2 `conformanceLevel` Enum

| Value | Meaning |
|-------|---------|
| `L1` | Basic — processes LEAD and ACKNOWLEDGMENT, JSON_EDI serialization, no extended blocks required. |
| `L2` | Standard — L1 + honors `forwardingPolicy`, `analyticsAllowed`, `trainingDataAllowed`, strips `DEALER_INTERNAL` notes on forward. |
| `L3` | Full — L2 + processes all optional blocks (`financialSummary`, `captiveFinance`, `dealLineage`, `structuredNotes`, `dataGovernance`), all serialization formats, real-time capable. |

The minimum conformance levels map directly to validation rule enforcement tiers in `LEX_CONFORMANCE.md`.

---

## 4. Full Example

### DMS System — Legacy with limited block support

```json
"systemCapabilities": {
  "lexVersion": "1.0.0",
  "conformanceLevel": "L2",
  "supportedMessageTypes": ["LEAD", "ACKNOWLEDGMENT", "LEAD_CLOSURE"],
  "supportedBlocks": [
    "deduplication",
    "consentRecord",
    "leadIntelligence",
    "financialSummary",
    "captiveFinance"
  ],
  "unsupportedBlocks": ["dealLineage", "evSpecifications"],
  "supportedFormats": ["JSON_EDI", "XML_EDI"],
  "maxMessageSizeKb": 512,
  "supportedExtensionNamespaces": ["cdk.global.dms.workflow", "toyota.na.captive"],
  "realtimeCapable": false,
  "batchOnly": true,
  "preferredBatchInterval": "PT15M",
  "lastUpdated": "2026-03-28T00:00:00Z"
}
```

### Modern Platform — Full L3 capability

```json
"systemCapabilities": {
  "lexVersion": "1.0.0",
  "conformanceLevel": "L3",
  "supportedMessageTypes": ["LEAD", "ASSET", "ACKNOWLEDGMENT", "SUBSCRIPTION", "LEAD_CLOSURE"],
  "supportedBlocks": [
    "deduplication",
    "consentRecord",
    "leadIntelligence",
    "financialSummary",
    "captiveFinance",
    "dealLineage",
    "structuredNotes",
    "dataGovernance",
    "evSpecifications"
  ],
  "supportedFormats": ["JSON_EDI", "XML_EDI", "X12", "EDIFACT"],
  "maxMessageSizeKb": 4096,
  "realtimeCapable": true,
  "batchOnly": false,
  "lastUpdated": "2026-03-28T00:00:00Z"
}
```

---

## 5. Sender Degradation Behavior

When a sender knows a receiver's capability record AND chooses to optimize delivery:

1. **Check `unsupportedBlocks`** — if `dealLineage` is listed, sender MAY omit the `dealLineage` block.
2. **Check `supportedFormats`** — if receiver only accepts `JSON_EDI`, sender picks that format.
3. **Check `maxMessageSizeKb`** — if message exceeds limit, sender MAY strip binary attachments first; if still over limit, send without non-essential optional blocks.
4. **Passthrough default** — if the sender has no capability data, it sends the full message as-is.

The sender MUST NOT:
- Fail to send a required LEAD because a receiver flagged a block as `unsupported`
- Wait for a capability record before sending time-sensitive leads
- Require capability registration before establishing a routing relationship

---

## 6. Validation Rules

| Rule ID | Severity | Condition |
|---------|----------|-----------|
| CAP-001 | ERROR | `lexVersion` absent when block is present |
| CAP-002 | ERROR | `lexVersion` not a valid semver string |
| CAP-003 | ERROR | `conformanceLevel` absent or not one of `L1`, `L2`, `L3` |
| CAP-004 | ERROR | `supportedMessageTypes` absent or empty when block is present |
| CAP-005 | ERROR | `lastUpdated` absent or invalid ISO 8601 datetime |
| CAP-006 | WARNING | `conformanceLevel` is `L2` but `unsupportedBlocks` contains `dealLineage` — L2 systems should support Passthrough Obligation for DL entries even if not processing them |
| CAP-007 | INFO | `systemCapabilities` absent from SUBSCRIPTION message — treated as `L1` by default |
| CAP-008 | WARNING | `unsupportedBlocks` contains a block name that is not a recognized LEX block name (may indicate a typo or future block; advisory) |

---

## 7. Conformance Additions

The capability advertisement system has the following impact on `LEX_CONFORMANCE.md`:

- **L1 minimum:** No `systemCapabilities` block required. Default behavior assumed.
- **L2 addition:** `systemCapabilities` SHOULD be published in SUBSCRIPTION registration. `conformanceLevel: "L2"` or higher MUST be declared.
- **L3 addition:** All supported blocks SHOULD be enumerated for sender optimization.

A system that claims `conformanceLevel: "L3"` in its capability record but ignores `forwardingPolicy: RESTRICTED` is non-conformant regardless of what it declared.

---

## 8. Cross-Industry Note

`systemCapabilities` is industry-agnostic:

| Industry | Usage |
|----------|-------|
| Automotive | DMS declares it cannot process `evSpecifications` — senders omit the EV block for non-EV-capable receivers |
| Aviation | MRO facility declares it only accepts `JSON_EDI` — senders skip EDIFACT transcoding |
| Real estate | Listing portal declares `batchOnly: true` with 4-hour interval — senders queue accordingly |
| Maritime | Freight management system declares `maxMessageSizeKb: 256` — senders strip large attachments |
| Technology | SaaS CRM declares all blocks supported — sender sends everything knowing it will all be processed |

---

## 9. Related Specifications

- `LEX_CONFORMANCE.md` — L1/L2/L3 definition and minimum required behavior
- `LEX_EXTENSION_STANDARD.md` — `extensions[]` and Passthrough Obligation (P4)
- `LEX_VALIDATION_RULES.md` — §14: CAP-001 through CAP-008
