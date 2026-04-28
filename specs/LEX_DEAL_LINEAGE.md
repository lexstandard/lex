<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright (c) 2026 LEX Lead Exchange Standard Contributors -->
<!-- Canonical specification: https://lexstandard.org -->

# LEX Deal Lineage Spec

**Status:** Draft v1.0  
**Created:** March 28, 2026  
**Applies To:** LEAD (optional), LEAD_CLOSURE (recommended when `closureStatus: WON`)  
**Related Specs:** LEX_SPECIFICATION.md, LEX_FINANCIAL_SUMMARY.md, LEX_CAPTIVE_FINANCE.md

---

## 1. Purpose

The `dealLineage` block is a distributed, append-only audit trail of every significant change a deal undergoes as it passes through multiple systems — OEM platform, CRM, desking tool, F&I, DMS. Each system appends its own entry when it processes the lead. No central reconciler is required.

`structuredNotes[]` is a companion block in the same spec: it carries attributed, categorized context notes that explain *why* things changed, not just *what* changed.

**What this spec does NOT do:**  
- It does not require an approval step before any system can append an entry.  
- It does not require a central server to reconcile versions.  
- It does not prevent systems from disagreeing — it makes disagreements visible and attributable.  
- Entry order is normalized by `seq` + `timestamp`. Two systems that independently assign the same `seq` number produce a visible conflict that the receiving system can detect and flag.

**Cross-industry applicability:**  
`dealLineage` solves version drift universally:
- Aviation: MRO work order modifications across airline, MRO facility, parts supplier
- Real estate: offer price changes, inspection contingency modifications, closing date negotiations  
- Maritime: charter party amendments, port fee adjustments, cargo weight revisions  
- Heavy equipment: spec changes, delivery date revisions, fleet pricing tiers applied  
- Technology: SaaS contract amendments, pricing tier changes during sales cycle

---

## 2. Anti-Capture Design

**DL-RULE-1 — Append-only.** Entries are never modified or deleted. A system that rewrites a previous entry is non-conformant. This prevents any party from retroactively altering the official record.

**DL-RULE-2 — No central reconciler.** Any system participating in the LEX message chain can append. There is no designated "lineage authority." If a DMS receives a message with 3 lineage entries and adds a 4th, both the original 3 and the 4th travel with the lead.

**DL-RULE-3 — Passthrough Obligation applies.** Systems that do not process `dealLineage` MUST pass it forward intact. Dropping lineage entries is non-conformant at L2.

**DL-RULE-4 — Conflict detection without central arbitration.** If two systems independently append entries with the same `seq` number, the conflict is detectable by any downstream system via the `version` counter. The downstream system flags the conflict; it does not resolve it by choosing a winner.

---

## 3. The `dealLineage` Block

### 3.1 Top-Level Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | integer | Yes | Monotonically increasing counter. Incremented each time a system appends an entry. |
| `entries` | array | Yes | Ordered array of lineage entries. See §3.2. |

### 3.2 Entry Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `seq` | integer | Yes | Sequence number for this entry. MUST be greater than all prior `seq` values in this array. |
| `systemId` | string | Yes | LEX organization ID of the system appending this entry. |
| `systemType` | string (enum) | Yes | Role of the appending system. See §3.3. |
| `timestamp` | string (ISO 8601) | Yes | When this hop occurred. |
| `action` | string (enum) | Yes | What this system did. See §3.4. |
| `dealSnapshot` | object | No | Flexible key-value snapshot of deal values relevant to this hop. No rigid sub-schema — systems capture what matters to them. |
| `deltaFromPrevious` | object | No | Machine-readable diff of what changed at this hop. Required for modification actions (see §3.5). |

### 3.3 `systemType` Enum

`MANUFACTURER`, `CAPTIVE_LENDER`, `DEALER`, `DMS`, `CRM`, `FI_PLATFORM`, `DESKING_TOOL`, `MARKETPLACE`, `LOGISTICS`, `ANALYTICS`, `THIRD_PARTY`, `OTHER`

### 3.4 `action` Enum

| Value | Meaning |
|-------|---------|
| `LEAD_CREATED` | This system originated the lead |
| `LEAD_INGESTED` | This system received and processed an inbound lead |
| `LEAD_UPDATED` | Non-financial metadata updated |
| `DEAL_MODIFIED` | Deal terms changed (price, terms, configuration) |
| `INCENTIVE_APPLIED` | A captive finance program or bonus incentive was applied |
| `INCENTIVE_REMOVED` | A previously applied incentive was removed |
| `TAX_CALCULATED` | Tax/fee calculation added or revised |
| `PAYMENT_RECALCULATED` | Monthly payment recalculated |
| `PRICE_NEGOTIATED` | Selling price changed as result of negotiation |
| `TRADE_IN_APPRAISED` | Trade-in value evaluated or revised |
| `FINANCING_APPROVED` | Financing application approved |
| `ORDER_SUBMITTED` | Customer submitted purchase/order |
| `DEAL_CANCELLED` | Deal cancelled by any party |
| `DEAL_CLOSED` | Deal closed/won (typically final LEAD_CLOSURE entry) |
| `DATA_FORWARDED` | System forwarded lead to next party (Passthrough entry) |

### 3.5 `deltaFromPrevious` Format

`deltaFromPrevious` is an object where each key is a field name (use dot-notation for nested fields) and each value has the shape:

```json
{
  "fieldName": {
    "from": <previous value>,
    "to": <new value>,
    "reason": "<optional human-readable reason string>"
  }
}
```

`reason` SHOULD be populated for modification actions. It is the machine-readable counterpart to `structuredNotes[].body`.

---

## 4. Full Example — 4-System Deal Evolution

```json
"dealLineage": {
  "version": 4,
  "entries": [
    {
      "seq": 1,
      "systemId": "ORG-TOYOTA-MFGR-NA-001",
      "systemType": "MANUFACTURER",
      "timestamp": "2026-03-01T09:00:00Z",
      "action": "LEAD_CREATED",
      "dealSnapshot": {
        "vehiclePrice": 36000.00,
        "estimatedMonthlyPayment": 459.00,
        "appliedProgram": "TOYOTA-APR-1.9-Q1-2026"
      },
      "deltaFromPrevious": null
    },
    {
      "seq": 2,
      "systemId": "CRM-SALESFORCE-DEALER-CHICAGO-001",
      "systemType": "CRM",
      "timestamp": "2026-03-01T09:05:00Z",
      "action": "LEAD_INGESTED",
      "dealSnapshot": {
        "crmLeadId": "SF-LEAD-890234",
        "assignedSalesRepId": "SR-456"
      },
      "deltaFromPrevious": null
    },
    {
      "seq": 3,
      "systemId": "DMS-CDK-DEALER-CHICAGO-001",
      "systemType": "DMS",
      "timestamp": "2026-03-15T14:00:00Z",
      "action": "PRICE_NEGOTIATED",
      "dealSnapshot": {
        "vehiclePrice": 35200.00,
        "estimatedMonthlyPayment": 447.00
      },
      "deltaFromPrevious": {
        "vehiclePrice": { "from": 36000.00, "to": 35200.00, "reason": "Manager approved $800 dealer discount to match nearby AutoNation offer" },
        "estimatedMonthlyPayment": { "from": 459.00, "to": 447.00 }
      }
    },
    {
      "seq": 4,
      "systemId": "DMS-CDK-DEALER-CHICAGO-001",
      "systemType": "DMS",
      "timestamp": "2026-03-20T10:00:00Z",
      "action": "TAX_CALCULATED",
      "dealSnapshot": {
        "totalTaxesAndFees": -2916.75,
        "totalOutOfPocket": 38783.25,
        "finalMonthlyPayment": 481.00
      },
      "deltaFromPrevious": {
        "estimatedMonthlyPayment": { "from": 447.00, "to": 481.00, "reason": "Illinois state + Cook County + City of Chicago taxes added via Vertex v4.2" }
      }
    }
  ]
}
```

---

## 5. `structuredNotes[]` — Contextual Notes Companion

`structuredNotes[]` is a companion array that carries attributed, categorized context notes — the "why" that dealLineage itself captures structurally as `reason` strings. It exists separately because notes may exist independently of deal changes (e.g., customer communication records, compliance notes).

### 5.1 Note Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `noteId` | string | Yes | Unique ID for this note. |
| `category` | string (enum) | Yes | See §5.2. |
| `visibility` | string (enum) | Yes | Controls which downstream parties may see this note. See §5.3. |
| `authorId` | string | Yes | System user or org ID of the note author. |
| `authorRole` | string | No | Role of author (e.g., `SALES_REP`, `FINANCE_MANAGER`, `COMPLIANCE_OFFICER`). |
| `timestamp` | string (ISO 8601) | Yes | When the note was created. |
| `subject` | string | No | Short summary heading. |
| `body` | string | Yes | Full note text. |
| `linkedTo` | object | No | Links this note to a specific dealLineage entry or field. See §5.4. |

### 5.2 Note `category` Enum

`DEAL_CHANGE`, `CUSTOMER_COMMUNICATION`, `COMPLIANCE_NOTE`, `ESCALATION`, `TRADE_IN_NOTE`, `FINANCING_NOTE`, `PRICING_NOTE`, `DELIVERY_NOTE`, `GENERAL`

### 5.3 `visibility` Enum and Strip-on-Forward Rule

| Value | Who sees it | Strip-on-forward rule |
|-------|-------------|----------------------|
| `DEALER_INTERNAL` | Only dealer systems | **MUST be stripped** before forwarding to any non-dealer recipient. This is the only mandatory technical enforcement in this block. |
| `DMS_ONLY` | Only the DMS | MUST be stripped before forwarding outside the DMS system. |
| `MANUFACTURER_SHARED` | Dealer + manufacturer | May forward to manufacturer org only. Strip for all others. |
| `PLATFORM_SHARED` | Dealer + platform (e.g., marketplace, lead provider) | May forward to originating platform only. Strip for all others. |
| `ALL_PARTIES` | Any conformant recipient | No stripping required. |

**Why DEALER_INTERNAL strip-on-forward exists:** Internal dealer notes frequently contain competitive pricing strategy, manager approval thresholds, and customer negotiation observations. Forwarding these to OEMs or lead platforms without explicit dealer consent is a direct violation of P7 (data belongs to originating party). The strip-on-forward rule makes this enforceable without requiring manual editing of note content.

### 5.4 `linkedTo` Object

```json
"linkedTo": {
  "dealLineageSeq": 3,
  "fieldChanged": "vehiclePrice",
  "relatedNoteId": null
}
```

All fields are optional. `dealLineageSeq` links this note to a specific lineage entry. `fieldChanged` names the specific field this note elaborates on.

### 5.5 Example

```json
"structuredNotes": [
  {
    "noteId": "NOTE-2026-001",
    "category": "DEAL_CHANGE",
    "visibility": "DEALER_INTERNAL",
    "authorId": "SR-456",
    "authorRole": "SALES_REP",
    "timestamp": "2026-03-15T14:01:00Z",
    "subject": "Price adjustment approved",
    "body": "Manager approved $800 dealer discount. Customer showed AutoNation quote at $35,100 on same RAV4 trim. We matched to retain deal.",
    "linkedTo": { "dealLineageSeq": 3, "fieldChanged": "vehiclePrice" }
  },
  {
    "noteId": "NOTE-2026-002",
    "category": "COMPLIANCE_NOTE",
    "visibility": "ALL_PARTIES",
    "authorId": "FM-789",
    "authorRole": "FINANCE_MANAGER",
    "timestamp": "2026-03-20T10:05:00Z",
    "subject": "Tax calculation disclosure",
    "body": "Final numbers include IL state, Cook County, and Chicago city tax. Vertex v4.2 used. Customer signed payment disclosure form.",
    "linkedTo": { "dealLineageSeq": 4 }
  }
]
```

---

## 6. Validation Rules

### 6.1 Deal Lineage Rules

| Rule ID | Severity | Condition |
|---------|----------|-----------|
| DL-001 | ERROR | `dealLineage.version` absent when `dealLineage` block present |
| DL-002 | ERROR | `entries` absent or empty when `dealLineage` block present |
| DL-003 | ERROR | Any entry missing `seq`, `systemId`, `systemType`, `timestamp`, or `action` |
| DL-004 | ERROR | `seq` values in `entries` are not monotonically increasing (each seq > all previous) |
| DL-005 | ERROR | `action` value not in the defined enum |
| DL-006 | ERROR | `systemType` value not in the defined enum |
| DL-007 | WARNING | Two entries share the same `seq` value (lineage conflict — two systems appended independently) |
| DL-008 | WARNING | Modification action (`DEAL_MODIFIED`, `PRICE_NEGOTIATED`, `INCENTIVE_APPLIED`, etc.) without `deltaFromPrevious` |
| DL-009 | WARNING | `dealLineage.version` does not equal the count of entries in the array (version drift) |
| DL-010 | INFO | `dealLineage` absent from LEAD_CLOSURE with `closureStatus: WON` |

### 6.2 Structured Notes Rules

| Rule ID | Severity | Condition |
|---------|----------|-----------|
| SN-001 | ERROR | `noteId` absent or empty in a note entry |
| SN-002 | ERROR | `visibility` value not in enum |
| SN-003 | ERROR | `body` absent or empty in a note entry |
| SN-004 | ERROR | `authorId` absent or empty in a note entry |
| SN-005 | ERROR | `timestamp` absent or invalid ISO 8601 in a note entry |
| SN-006 | ERROR | Note with `visibility: DEALER_INTERNAL` present in a message forwarded to a non-dealer recipient (strip-on-forward violation) |
| SN-007 | WARNING | `linkedTo.dealLineageSeq` references a seq not present in `dealLineage.entries` |

---

## 7. Schema Placement

- `dealLineage`: optional property at `payload.lead` level in LEAD; recommended at `payload.leadClosure` level in LEAD_CLOSURE when `closureStatus: WON`.
- `structuredNotes`: optional property at `payload.lead` level (companion to `dealLineage`); also valid in LEAD_CLOSURE as the deal's canonical note record.

---

## 8. Related Specifications

- `LEX_FINANCIAL_SUMMARY.md` — financial summary changes are the primary inputs to `deltaFromPrevious`
- `LEX_CAPTIVE_FINANCE.md` — `INCENTIVE_APPLIED` / `INCENTIVE_REMOVED` entries reference captive finance changes
- `LEX_DATA_GOVERNANCE.md` — `DEALER_INTERNAL` visibility aligns with P7 data ownership principles
- `LEX_FIELD_DICTIONARY.md` — field-level reference
- `LEX_VALIDATION_RULES.md` — DL-001 through DL-010, SN-001 through SN-007
