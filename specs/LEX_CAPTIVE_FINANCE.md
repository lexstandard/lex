<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright (c) 2026 LEX Lead Exchange Standard Contributors -->
<!-- Canonical specification: https://lexstandard.org -->

# LEX Captive Finance Spec

**Status:** Draft v1.0  
**Created:** March 28, 2026  
**Applies To:** LEAD (at `IN_NEGOTIATION`, `ORDER`), LEAD_CLOSURE  
**Related Specs:** LEX_SPECIFICATION.md, LEX_FINANCIAL_SUMMARY.md, LEX_DEAL_LINEAGE.md

---

## 1. Purpose

The `captiveFinance` block carries a snapshot of the OEM captive lender program and incentive terms that were evaluated when a deal was structured. It makes visible what was previously an invisible, frequently-stale, and non-portable piece of deal data — the specific program, its current rates, its eligibility conditions, and which system evaluated it.

**What this spec does NOT do:**
- It does not replace RouteOne, Dealertrack, DealerSocket, or OEM incentive APIs. It carries a portable snapshot of their output.
- It does not create a binding financing commitment. `bindingCommitment: false` is mandatory in LEAD messages.
- It does not provide live program data. `snapshotTimestamp` makes the point-in-time nature of the data explicit.
- It does not require OEM captive networks to integrate with LEX. Dealers or DMS systems that populate this block from their existing program feeds do so voluntarily.

**Cross-industry note:** The same block serves any industry with proprietary financing programs:
- Aviation: aircraft acquisition financing (Airbus Financial Services, Boeing Capital), PDP financing
- Maritime: vessel purchase financing programs, chattel mortgages
- Heavy equipment: Caterpillar Financial, John Deere Financial, Komatsu Financial programs  
- Real estate: builder/developer mortgage incentive programs
- Technology: hardware leasing and financing programs from Dell Financial, IBM Global Financing

---

## 2. Anti-Capture Design

**CF-RULE-1 — bindingCommitment: false is mandatory in LEAD.** No LEAD message may carry a `captiveFinance` block with `bindingCommitment: true`. The spec makes the non-binding nature explicit and machine-readable. Validation ERROR if violated.

**CF-RULE-2 — Snapshot, not live data.** The `snapshotTimestamp` field is required. This prevents any party from presenting a stale program snapshot as if it reflects current rates. Systems that receive a `captiveFinance` block SHOULD check `programExpiresAt` against the current timestamp and warn if the program has expired.

**CF-RULE-3 — No privileged program authority.** `evaluatedBy` tracks which system applied the program. Captive lenders, dealers, DMS systems, and CRM platforms can all evaluate and attach a `captiveFinance` block. No system has a privileged role as the "official evaluator." If two systems disagree, both records exist in `dealLineage`.

**CF-RULE-4 — Disclosure, not gating.** The `disclaimer` field is required when the block is present. This makes the spec's non-binding disclosure role explicit in human-readable form, visible to downstream systems and UIs.

---

## 3. The `captiveFinance` Block

### 3.1 Top-Level Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `captiveOrg` | string | Yes | LEX organization ID of the captive lender (e.g., `ORG-FORD-CREDIT-NA-001`). |
| `programId` | string | Yes | Unique identifier for this program (assigned by the captive lender). |
| `programName` | string | Yes | Human-readable program name. |
| `programType` | string (enum) | Yes | Type of program. See §3.2. |
| `dealStructure` | string (enum) | Yes | `RETAIL_FINANCE` or `LEASE`. Determines which sub-block (`retailFinance` vs `leaseTerms`) applies. |
| `snapshotTimestamp` | string (ISO 8601) | Yes | When this program data was retrieved or confirmed. |
| `programExpiresAt` | string (ISO 8601) | No | When this program offer expires. Validators warn if past `header.timestamp`. |
| `programVersion` | string | No | Version or iteration of the program (e.g., `"3"`, `"Q1-2026-v2"`). Informational. |
| `retailFinance` | object | Conditional | Required when `dealStructure: RETAIL_FINANCE`. See §3.3. |
| `leaseTerms` | object | Conditional | Required when `dealStructure: LEASE`. See §3.4. |
| `eligibility` | object | No | Program eligibility conditions. See §3.5. |
| `bonusIncentives` | array | No | Stackable incentives on top of the base program. See §3.6. |
| `appliedIncentivesTotal` | number | No | Sum of all applied `bonusIncentives[].amount`. Feeds into `financialSummary` as a `REBATE` line item. |
| `disclaimer` | string | Yes | Required human-readable non-binding disclosure. |
| `evaluatedBy` | string | Yes | LEX org ID of the system that evaluated and attached this block. |
| `evaluatedAt` | string (ISO 8601) | Yes | When the eligibility evaluation was performed. |
| `bindingCommitment` | boolean | Yes | **MUST be `false` in LEAD messages.** Only valid as `true` in formal loan documents — outside LEX scope. |

### 3.2 `programType` Enum

| Value | Description |
|-------|-------------|
| `APR_SUBVENTION` | Below-market APR subsidized by the manufacturer/captive |
| `STANDARD_APR` | Standard (non-incentivized) captive rate |
| `LEASE_SUBVENTION` | Subvented money factor and/or residual |
| `LEASE_STANDARD` | Standard lease (non-subvented) |
| `BALLOON_FINANCE` | Balloon payment retail financing |
| `DEFERRED_PAYMENT` | Initial payment deferral program |
| `EMPLOYER_PROGRAM` | Fleet/employer purchase program |
| `LOYALTY_PROGRAM` | Loyalty/conquest bonus-primary programs |
| `CERTIFIED_PRE_OWNED` | CPO-specific financing programs |
| `OTHER` | Any program type not listed above |

### 3.3 `retailFinance` Sub-Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `offeredApr` | number | Yes | Program APR as a percentage (1.9 = 1.9%). |
| `standardApr` | number | No | Standard (non-incentivized) APR for reference. Allows "you save X% vs standard" comparison. |
| `termMonths` | integer | Yes | Loan term in months. |
| `maxLoanAmount` | number | No | Maximum loan amount eligible for this program. |
| `currency` | string | Yes | ISO 4217 currency code. |

### 3.4 `leaseTerms` Sub-Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `moneyFactor` | number | Yes | Money factor (e.g., 0.00125). Multiply by 2400 to approximate APR equivalent. |
| `residualValuePercent` | number | Yes | Residual value as a percentage of MSRP (e.g., 52 = 52%). |
| `termMonths` | integer | Yes | Lease term in months. |
| `annualMileageLimit` | integer | No | Annual mileage cap included in the base program. |
| `acquisitionFee` | number | No | Upfront acquisition/origination fee. |
| `capCostReduction` | number | No | Capitalized cost reduction applied (cash down or trade). |
| `captiveSubventionAmount` | number | No | Dollar value of the captive's subsidy built into this program (residual support + MF support). Informational. |
| `currency` | string | Yes | ISO 4217 currency code. |

### 3.5 `eligibility` Sub-Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `creditTierRequired` | string | No | Minimum credit tier (e.g., `TIER_1`, `TIER_2`). Tier definitions are captive-specific. |
| `minFicoScore` | integer | No | Minimum FICO score for program eligibility. |
| `regions` | array of strings | No | ISO 3166-2 region codes where the program applies. |
| `excludedRegions` | array of strings | No | ISO 3166-2 region codes explicitly excluded. |
| `vehicleModels` | array of strings | No | Eligible model names for this program. |
| `newVehicleOnly` | boolean | No | Whether the program is restricted to new (not used/CPO) units. |
| `maxVehicleMsrp` | number | No | Maximum MSRP for eligible vehicles. |
| `employeeDiscountStackable` | boolean | No | Whether an employee purchase program can stack with this program. |

### 3.6 `bonusIncentives[]` Items

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string (enum) | Yes | Incentive type. See §3.7. |
| `amount` | number | Yes | Dollar value of this incentive. |
| `currency` | string | Yes | ISO 4217 currency code. |
| `requiresPriorOwnership` | boolean | No | Loyalty bonus: requires prior ownership of brand. |
| `eligibleCompetitors` | array of strings | No | Conquest bonus: list of competitor brands that qualify the buyer. |
| `description` | string | No | Free-text description of the incentive. |

### 3.7 Bonus Incentive `type` Enum

`LOYALTY_BONUS`, `CONQUEST_BONUS`, `MILITARY_BONUS`, `FIRST_RESPONDER_BONUS`, `COLLEGE_GRAD_BONUS`, `RIDESHARE_DRIVER_BONUS`, `FLEET_BONUS`, `RETURNING_LESSEE_BONUS`, `CASH_ALLOWANCE`, `OEM_REBATE`, `REGIONAL_BONUS`, `OTHER_BONUS`

---

## 4. Full Example

### Retail Finance — Ford F-150 Q1 2026 APR Special

```json
"captiveFinance": {
  "captiveOrg": "ORG-FORD-CREDIT-NA-001",
  "programId": "FC-2026-Q1-APR-SPECIAL-TIER1",
  "programName": "Ford Credit Q1 2026 APR Special — 1.9% for 60 Months",
  "programType": "APR_SUBVENTION",
  "dealStructure": "RETAIL_FINANCE",
  "snapshotTimestamp": "2026-03-28T09:00:00Z",
  "programExpiresAt": "2026-03-31T23:59:59Z",
  "programVersion": "3",
  "retailFinance": {
    "offeredApr": 1.9,
    "standardApr": 7.4,
    "termMonths": 60,
    "maxLoanAmount": 55000.00,
    "currency": "USD"
  },
  "leaseTerms": null,
  "eligibility": {
    "creditTierRequired": "TIER_1",
    "minFicoScore": 720,
    "regions": ["US-48-STATES"],
    "excludedRegions": ["AK", "HI"],
    "vehicleModels": ["F-150", "MAVERICK"],
    "newVehicleOnly": true,
    "maxVehicleMsrp": 65000.00,
    "employeeDiscountStackable": false
  },
  "bonusIncentives": [
    {
      "type": "LOYALTY_BONUS",
      "amount": 500.00,
      "currency": "USD",
      "requiresPriorOwnership": true,
      "description": "Ford loyalty bonus for current Ford/Lincoln owners"
    },
    {
      "type": "CONQUEST_BONUS",
      "amount": 1000.00,
      "currency": "USD",
      "eligibleCompetitors": ["GM", "STELLANTIS", "TOYOTA", "HONDA"],
      "description": "Conquest bonus for switching from non-Ford brand"
    }
  ],
  "appliedIncentivesTotal": 1500.00,
  "disclaimer": "Financing subject to credit approval by Ford Motor Credit Company LLC. Not a commitment to lend. Program terms subject to change. 1.9% APR for 60 months available to qualified buyers. See dealer for complete program details.",
  "evaluatedBy": "DMS-CDK-FORD-DEALER-CHICAGO-001",
  "evaluatedAt": "2026-03-28T09:00:00Z",
  "bindingCommitment": false
}
```

### Lease — Toyota RAV4 Hybrid Q1 2026 Lease Subvention

```json
"captiveFinance": {
  "captiveOrg": "ORG-TOYOTA-FINANCIAL-NA-001",
  "programId": "TFS-2026-Q1-RAV4H-LEASE-36",
  "programName": "Toyota Financial Q1 2026 RAV4 Hybrid Lease",
  "programType": "LEASE_SUBVENTION",
  "dealStructure": "LEASE",
  "snapshotTimestamp": "2026-03-28T10:00:00Z",
  "programExpiresAt": "2026-03-31T23:59:59Z",
  "retailFinance": null,
  "leaseTerms": {
    "moneyFactor": 0.00142,
    "residualValuePercent": 54,
    "termMonths": 36,
    "annualMileageLimit": 12000,
    "acquisitionFee": 695.00,
    "capCostReduction": 2000.00,
    "captiveSubventionAmount": 1200.00,
    "currency": "USD"
  },
  "eligibility": {
    "creditTierRequired": "TIER_1_PLUS",
    "minFicoScore": 740,
    "newVehicleOnly": true
  },
  "bonusIncentives": [
    {
      "type": "RETURNING_LESSEE_BONUS",
      "amount": 500.00,
      "currency": "USD",
      "description": "Returning Toyota Financial lessee loyalty bonus"
    }
  ],
  "appliedIncentivesTotal": 500.00,
  "disclaimer": "Lease through Toyota Financial Services. Not a commitment to lend. NMLS #8027. Subject to credit approval. $695 acquisition fee due at lease signing. Residual and money factor subject to change.",
  "evaluatedBy": "PLATFORM-TOYOTA-SMART-PATH-001",
  "evaluatedAt": "2026-03-28T10:00:00Z",
  "bindingCommitment": false
}
```

### Aviation — Aircraft Financing Program (Generalized)

```json
"captiveFinance": {
  "captiveOrg": "ORG-AIRBUS-FINANCIAL-SERVICES-001",
  "programId": "AFS-2026-A220-STEP-UP-LEASE",
  "programName": "Airbus Financial Services A220 Step-Up Lease Program",
  "programType": "LEASE_SUBVENTION",
  "dealStructure": "LEASE",
  "snapshotTimestamp": "2026-03-01T00:00:00Z",
  "programExpiresAt": "2026-06-30T23:59:59Z",
  "retailFinance": null,
  "leaseTerms": {
    "moneyFactor": 0.000583,
    "residualValuePercent": 42,
    "termMonths": 144,
    "currency": "USD"
  },
  "disclaimer": "Aircraft lease subject to credit approval and final term sheet. Not a binding commitment.",
  "evaluatedBy": "ORG-DELTA-TREASURY-001",
  "evaluatedAt": "2026-03-01T00:00:00Z",
  "bindingCommitment": false
}
```

---

## 5. Validation Rules Summary

| Rule ID | Severity | Condition |
|---------|----------|-----------|
| CF-001 | ERROR | `bindingCommitment: true` in a LEAD message |
| CF-002 | ERROR | `snapshotTimestamp` absent when block is present |
| CF-003 | ERROR | `captiveOrg` absent when block is present |
| CF-004 | ERROR | `programId` absent when block is present |
| CF-005 | ERROR | `evaluatedBy` absent when block is present |
| CF-006 | ERROR | `evaluatedAt` absent when block is present |
| CF-007 | ERROR | `disclaimer` absent when block is present |
| CF-008 | ERROR | `dealStructure: RETAIL_FINANCE` but `retailFinance` block absent |
| CF-009 | ERROR | `dealStructure: LEASE` but `leaseTerms` block absent |
| CF-010 | WARNING | `programExpiresAt` is before `header.timestamp` (program has expired) |
| CF-011 | WARNING | `appliedIncentivesTotal` does not equal sum of `bonusIncentives[].amount` within ±0.01 |
| CF-012 | INFO | `captiveFinance` present at lead `status` earlier than `IN_NEGOTIATION` |

---

## 6. Integration with Other Blocks

- `captiveFinance.appliedIncentivesTotal` feeds into `financialSummary.taxesAndFees.lineItems` as one or more `REBATE` entries.
- `captiveFinance` changes across system hops are captured in `dealLineage` with action `INCENTIVE_APPLIED` or `INCENTIVE_REMOVED`.
- `captiveFinance` eligibility restrictions SHOULD be cross-referenced against `customer.financing.creditScore` when present — validators emit a WARNING if `minFicoScore` is declared and `creditScore` is present and below threshold.

---

## 7. Related Specifications

- `LEX_FINANCIAL_SUMMARY.md` — `appliedIncentivesTotal` feeds into financial summary as a REBATE line item
- `LEX_DEAL_LINEAGE.md` — `INCENTIVE_APPLIED` / `INCENTIVE_REMOVED` action entries track program changes
- `LEX_FIELD_DICTIONARY.md` — field-level reference for all `captiveFinance` properties
- `LEX_VALIDATION_RULES.md` — CF-001 through CF-012
