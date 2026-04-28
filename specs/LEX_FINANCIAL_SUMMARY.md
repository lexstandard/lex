<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright (c) 2026 LEX Lead Exchange Standard Contributors -->
<!-- Canonical specification: https://lexstandard.org -->

# LEX Financial Summary Spec

**Status:** Draft v1.0  
**Created:** March 28, 2026  
**Applies To:** LEAD (at `IN_NEGOTIATION`, `ORDER`, `DELIVERED` status), LEAD_CLOSURE (when `closureStatus: WON`)
**Related Specs:** LEX_SPECIFICATION.md, LEX_CAPTIVE_FINANCE.md, LEX_DEAL_LINEAGE.md

---

## 1. Purpose

The `financialSummary` block gives any party in a LEX message chain a structured, attributed, line-item breakdown of pricing, taxes, fees, and the resulting payment. It replaces the informal practice of embedding deal numbers in free-text notes, which causes reconciliation failures whenever the calculation passes through a system boundary.

**What this spec does NOT do:**
- It does not replace tax engines (Vertex, Avalara, state DOR APIs). It carries their output.
- It does not replace F&I or desking tools. It carries what those tools produced.
- It does not enforce which tax rates are correct. It carries who calculated what and when.
- It does not create a central authority to adjudicate calculation disputes. When two systems disagree, both records exist and the discrepancy is visible in `dealLineage` (see `LEX_DEAL_LINEAGE.md`).

**Cross-industry note:** This block generalizes beyond automotive. The same structure covers aviation MRO quote breakdowns, real estate commission splits and buyer closing costs, maritime charter fee schedules, and any multi-party transaction with jurisdiction-variable fee structures.

---

## 2. The `financialSummary` Block

### 2.1 Top-Level Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `vehiclePrice` | number | No | Base asset price before negotiation. Any industry. |
| `negotiatedPrice` | number | No | Post-negotiation price. Must be ≤ `vehiclePrice` when both present. |
| `tradeInAllowance` | number | No | Gross trade-in credit offered. |
| `tradeInPayoff` | number | No | Outstanding loan balance on trade-in. |
| `netTradeIn` | number | No | `tradeInAllowance` − `tradeInPayoff`. Systems SHOULD validate this arithmetic. If present, must equal `tradeInAllowance - tradeInPayoff` within ±0.01. |
| `netCapCost` | number | No | Net capitalized cost (primarily for leases): `negotiatedPrice` − `netTradeIn` − `capCostReductions`. |
| `currency` | string | Yes (if block present) | ISO 4217 currency code (e.g., `USD`, `EUR`, `CAD`, `GBP`). |
| `taxesAndFees` | object | No | Line-item tax and fee breakdown. See §2.2. |

### 2.2 `taxesAndFees` Sub-Object

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `calculatedBy` | string | Yes (in block) | LEX organization ID of the system that produced these calculations. |
| `calculatedAt` | string (ISO 8601) | Yes (in block) | When the calculation was produced. |
| `jurisdictionCodes` | array of strings | Yes (in block) | ISO 3166-2 codes for each tax jurisdiction applied (e.g., `["US-IL", "US-IL-031"]` for Cook County, IL). |
| `lineItems` | array | Yes (in block) | See §2.3. |
| `totalTaxesAndFees` | number | Yes (in block) | Sum of all `lineItems[].amount` values. Systems SHOULD cross-validate this against the array sum within ±0.01. May be negative (net credit scenario). |
| `totalOutOfPocket` | number | No | `negotiatedPrice` − `netTradeIn` + `totalTaxesAndFees + lender/acquisition fees`. Final amount the buyer pays. |
| `estimatedMonthlyPayment` | number | No | Estimated periodic payment. Requires `isEstimate: true` in LEAD. |
| `taxCalculationVersion` | string | No | Identifies which tax engine and version produced the calculation (e.g., `VERTEX_TAX_ENGINE_v4.2`, `AVALARA_v23.6`). Informational. |
| `isEstimate` | boolean | Yes (in block) | **Always `true` in LEAD messages. Only `false` valid in LEAD_CLOSURE.** See §3 for enforcement. |
| `disclaimer` | string | No | Human-readable disclaimer text for display purposes. |

### 2.3 Line Item Structure

Each entry in `lineItems[]`:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `label` | string | Yes | Human-readable label for this line item. |
| `type` | string (enum) | Yes | Categorization. See §2.4 for valid values. |
| `rate` | number or null | No | Applicable tax rate as a decimal (0.0625 = 6.25%). Null for flat fees. |
| `amount` | number | Yes | Dollar amount for this line item. Negative values represent credits. |
| `basis` | string (enum) | No | Basis on which the rate was applied. See §2.5. |

### 2.4 Line Item `type` Enum

| Value | Description | Applies To |
|-------|-------------|-----------|
| `STATE_TAX` | State-level sales/use tax | All US transactions |
| `COUNTY_TAX` | County-level tax | US counties |
| `CITY_TAX` | Municipal/city tax | US municipalities |
| `LOCAL_TAX` | Generic sub-state tax not classified above | Any jurisdiction |
| `FEDERAL_TAX` | Federal excise or customs tax | Specific vehicle categories |
| `GST` | Goods and Services Tax | Canada, Australia, India |
| `VAT` | Value Added Tax | EU, UK, and other regions |
| `PST` | Provincial Sales Tax | Canadian provinces |
| `HST` | Harmonized Sales Tax | Canadian provinces |
| `TRADE_IN_CREDIT` | Tax credit for trade-in allowance (negative amount) | States with trade-in credit laws |
| `DOC_FEE` | Documentation/processing fee | Most US states |
| `TITLE_FEE` | Vehicle title transfer fee | US |
| `REGISTRATION_FEE` | Vehicle registration / licensing | US |
| `INSPECTION_FEE` | Emissions/safety inspection | Some US states |
| `DEALER_FEE` | Dealer-specific processing fee | Any |
| `LENDER_FEE` | Finance origination or lender fee | Finance deals |
| `ACQUISITION_FEE` | Lease acquisition fee | Lease deals |
| `DISPOSITION_FEE` | Lease-end disposition fee | Lease deals |
| `FEDERAL_CREDIT` | Federal tax credit / incentive (negative amount) | EV and clean energy |
| `STATE_CREDIT` | State-level tax credit (negative amount) | State rebates |
| `REBATE` | Manufacturer or dealer rebate (negative amount) | Any |
| `FREIGHT` | Destination / freight charge | Any |
| `STAMP_DUTY` | Stamp duty on vehicle transfer | Australia, UK |
| `OTHER_FEE` | Any fee not covered above | Any |
| `OTHER_CREDIT` | Any credit not covered above | Any |

### 2.5 Line Item `basis` Enum

| Value | Description |
|-------|-------------|
| `NEGOTIATED_PRICE` | Rate applies to `negotiatedPrice` |
| `MSRP` | Rate applies to manufacturer list price |
| `NET_TRADE_IN` | Rate applies to net trade-in value |
| `OUT_OF_POCKET` | Rate applies to total out-of-pocket |
| `CAP_COST` | Rate applies to capitalized cost (leases) |
| `VEHICLE_WEIGHT` | Fee based on declared vehicle weight |
| `STATE_SCHEDULE` | Fee from state-published fixed schedule |
| `FLAT_FEE` | No rate basis — fixed amount |
| `STATUTORY` | Defined by statute (e.g., EV federal credit) |

---

## 3. `isEstimate` Enforcement

This rule is the single most important anti-capture guardrail in this block:

**Rule FIN-003:** In a LEAD message, `taxesAndFees.isEstimate` MUST be `true`. Any LEAD message with `isEstimate: false` in `financialSummary.taxesAndFees` MUST produce a validation ERROR.

**Why:** OEM configurators, dealer websites, and CRM systems all calculate payments before a deal is finalized. None of these calculations are legally binding. The history of consumer complaints in automotive is littered with cases where a customer was shown $459/month online and arrived at the dealer to find $491/month — with no structured way to trace the discrepancy. `isEstimate: true` in LEAD messages makes the non-binding nature of upstream calculations machine-readable. Only the DMS recording the completed transaction (`LEAD_CLOSURE`) may set `isEstimate: false`.

**Industry generalization:** The same rule applies in any industry where an estimate precedes a final bill. Aviation MRO quotes are estimates until the work order is closed. Real estate commission structures are estimates until closing.

---

## 4. Jurisdiction Code Format

`jurisdictionCodes` MUST use ISO 3166-2 format:
- Country level: `US`, `CA`, `DE`, `AU`
- State/province level: `US-IL`, `US-CA`, `CA-ON`, `DE-BY`
- County/local level: `US-IL-031` (FIPS county code appended)

Multiple codes in one `taxesAndFees` block means the calculation spans multiple jurisdictions (e.g., cross-border delivery, county + city taxes).

---

## 5. Full Example

### Automotive — Illinois retail deal with EV credit

```json
"financialSummary": {
  "vehiclePrice": 48950.00,
  "negotiatedPrice": 46500.00,
  "tradeInAllowance": 8200.00,
  "tradeInPayoff": 3400.00,
  "netTradeIn": 4800.00,
  "netCapCost": 41700.00,
  "currency": "USD",
  "taxesAndFees": {
    "calculatedBy": "DMS-CDK-DEALER-CHICAGO-001",
    "calculatedAt": "2026-03-28T11:00:00Z",
    "jurisdictionCodes": ["US-IL", "US-IL-031"],
    "isEstimate": true,
    "disclaimer": "Tax amounts are estimates. Final amounts may vary based on registration details.",
    "taxCalculationVersion": "VERTEX_TAX_ENGINE_v4.2",
    "lineItems": [
      { "label": "State Sales Tax",      "type": "STATE_TAX",       "rate": 0.0625, "amount": 2906.25,  "basis": "NEGOTIATED_PRICE" },
      { "label": "County Tax (Cook)",     "type": "COUNTY_TAX",      "rate": 0.0175, "amount": 813.75,   "basis": "NEGOTIATED_PRICE" },
      { "label": "City Tax (Chicago)",    "type": "CITY_TAX",        "rate": 0.0125, "amount": 581.25,   "basis": "NEGOTIATED_PRICE" },
      { "label": "Trade-In Tax Credit",   "type": "TRADE_IN_CREDIT", "rate": null,   "amount": -300.00,  "basis": "NET_TRADE_IN" },
      { "label": "Documentation Fee",     "type": "DOC_FEE",         "rate": null,   "amount": 299.00,   "basis": "FLAT_FEE" },
      { "label": "Title Fee",             "type": "TITLE_FEE",       "rate": null,   "amount": 58.00,    "basis": "STATE_SCHEDULE" },
      { "label": "Registration Fee",      "type": "REGISTRATION_FEE","rate": null,   "amount": 225.00,   "basis": "VEHICLE_WEIGHT" },
      { "label": "Federal EV Tax Credit", "type": "FEDERAL_CREDIT",  "rate": null,   "amount": -7500.00, "basis": "STATUTORY" }
    ],
    "totalTaxesAndFees": -2916.75,
    "totalOutOfPocket": 38783.25,
    "estimatedMonthlyPayment": 476.10
  }
}
```

### Aviation — MRO work quote (generalized)

```json
"financialSummary": {
  "vehiclePrice": 185000.00,
  "negotiatedPrice": 185000.00,
  "currency": "USD",
  "taxesAndFees": {
    "calculatedBy": "MRO-DELTA-TECHOPS-001",
    "calculatedAt": "2026-03-28T08:00:00Z",
    "jurisdictionCodes": ["US-GA"],
    "isEstimate": true,
    "disclaimer": "Work order estimate. Final invoiced amount subject to parts availability and labor actuals.",
    "lineItems": [
      { "label": "Labor — C-Check",     "type": "OTHER_FEE",  "rate": null, "amount": 95000.00, "basis": "FLAT_FEE" },
      { "label": "Parts — Engine AOG",  "type": "OTHER_FEE",  "rate": null, "amount": 72000.00, "basis": "FLAT_FEE" },
      { "label": "State Use Tax",       "type": "STATE_TAX",  "rate": 0.04, "amount": 7400.00,  "basis": "NEGOTIATED_PRICE" },
      { "label": "Freight / Logistics", "type": "FREIGHT",    "rate": null, "amount": 3200.00,  "basis": "FLAT_FEE" }
    ],
    "totalTaxesAndFees": 177600.00,
    "totalOutOfPocket": 177600.00
  }
}
```

---

## 6. Validation Rules Summary

| Rule ID | Severity | Condition |
|---------|----------|-----------|
| FIN-001 | ERROR | `currency` absent when `financialSummary` block present |
| FIN-002 | ERROR | `taxesAndFees.calculatedBy` absent when `taxesAndFees` block present |
| FIN-003 | ERROR | `taxesAndFees.isEstimate: false` in a LEAD message |
| FIN-004 | ERROR | `taxesAndFees.calculatedAt` absent when `taxesAndFees` block present |
| FIN-005 | ERROR | `taxesAndFees.jurisdictionCodes` empty array or absent when `taxesAndFees` block present |
| FIN-006 | ERROR | `lineItems` absent when `taxesAndFees` block present |
| FIN-007 | WARNING | `totalTaxesAndFees` differs from sum of `lineItems[].amount` by more than 0.01 |
| FIN-008 | WARNING | `netTradeIn` differs from `tradeInAllowance - tradeInPayoff` by more than 0.01 |
| FIN-009 | WARNING | `negotiatedPrice` > `vehiclePrice` when both are present |
| FIN-010 | WARNING | `taxesAndFees.calculatedAt` is more than 30 days before `header.timestamp` (stale calculation) |
| FIN-011 | INFO | `taxesAndFees.isEstimate: true` in LEAD_CLOSURE — expected but worth flagging for DMS reconciliation |

---

## 7. Schema Placement

`financialSummary` is an optional property at the `payload.lead` level in LEAD messages and at `payload.leadClosure` level in LEAD_CLOSURE messages.

Status gating (enforced by validators):
- **LEAD:** `financialSummary` is only meaningful at `IN_NEGOTIATION`, `ORDER`, or `DELIVERED` status. If present at earlier statuses (e.g., `SHOPPING`), validators issue a WARNING.
- **LEAD_CLOSURE:** `financialSummary` is RECOMMENDED when `closureStatus: WON`. Absence produces an INFO.

---

## 8. Related Specifications

- `LEX_CAPTIVE_FINANCE.md` — OEM incentive programs; `captiveFinance.appliedIncentivesTotal` feeds into `financialSummary` as a `REBATE` line item
- `LEX_DEAL_LINEAGE.md` — tracks when and why `financialSummary` values changed across system hops
- `LEX_FIELD_DICTIONARY.md` — field-level reference for all `financialSummary` properties
- `LEX_VALIDATION_RULES.md` — FIN-001 through FIN-011
