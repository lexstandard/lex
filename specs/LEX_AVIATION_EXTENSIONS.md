<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright (c) 2026 LEX Lead Exchange Standard Contributors -->
<!-- Canonical specification: https://lexstandard.org -->

# LEX - Aviation Industry Extension

**Namespace:** `lex.core.aviation`  
**Version:** 1.0.0  
**Status:** Draft  
**Extends:** LEX_SPECIFICATION.md, LEX_MULTI_INDUSTRY.md  
**Registry Entry:** LEX_EXTENSION_REGISTRY.json

---

## Overview

Commercial aviation procurement involves multi-year procurement cycles, production slot management, ECA-backed financing, and strict regulatory certification requirements. No open standard currently covers the lead and procurement workflow stages; SPEC 2000 (ATA iSpec 2200) addresses MRO parts only, and ACRIS covers airport operations data. This extension fills the gap for aircraft acquisition leads.

This extension adds first-class support for:
1. **Aircraft technical specification** — performance, capacity, type certificate data
2. **Production slot / delivery position** — aircraft orders are placed against specific manufacturer build positions
3. **Regulatory and certification data** — FAA/EASA type certificate, operator AOC, noise/emissions compliance
4. **Financing structure** — ECA agency, EETC, sale-leaseback, operating lease structures
5. **Technical evaluation tracking** — multi-phase evaluation common in fleet acquisition
6. **Fleet context** — airline fleet composition, existing aircraft being replaced

---

## 1. Extension Block

```json
{
  "namespace": "lex.core.aviation",
  "version": "1.0.0",
  "producer": "<sender-org-id>",
  "producedAt": "2025-06-01T08:00:00Z",
  "data": {
    "aircraftSpec": { ... },
    "fleetContext": { ... },
    "deliveryPosition": { ... },
    "regulatoryData": { ... },
    "financingStructure": { ... },
    "technicalEvaluation": { ... }
  }
}
```

---

## 2. `aircraftSpec`

Type-specific aircraft attributes not covered by the generic `desiredProduct` or `typeSpecificAttributes`.

```json
"aircraftSpec": {
  "icaoTypeDesignator": "A20N",
  "iataTypeCode": "32N",
  "engineType": "CFM_LEAP-1A",
  "engineCount": 2,
  "maxTakeoffWeightKg": 79000,
  "maxLandingWeightKg": 67400,
  "operatingEmptyWeightKg": 44310,
  "fuelCapacityLitres": 26730,
  "rangeKm": 6300,
  "cruiseSpeedKtas": 453,
  "serviceceiling": 39800,
  "seatConfiguration": {
    "cabinLayout": "2-3",
    "singleClassCapacity": 194,
    "twoClassCapacity": 165,
    "businessClass": 12,
    "economyClass": 153
  },
  "cargoCapacityCubicM": 38.5,
  "wingspanM": 35.8,
  "lengthM": 37.6,
  "cabinWidthM": 3.53,
  "auxPowerUnit": "APS3200",
  "avionicsPackage": "AIRBUS_SKYWISE",
  "wifiCapable": true,
  "etops": "ETOPS-180"
}
```

### `engineType` Common Values

`CFM_LEAP-1A`, `CFM_LEAP-1B`, `PRATT_GTF_PW1100G`, `GE90`, `GEnx`, `TRENT_XWB`, `TRENT_7000`, `CF6`, `V2500`, `IAE_V2500`, `RR_TRENT_1000`

---

## 3. `fleetContext`

Airline's existing fleet and strategic acquisition rationale.

```json
"fleetContext": {
  "operatorIcaoCode": "SKB",
  "operatorIataCode": "SY",
  "operatorName": "SkyBridge Airlines Ltd",
  "aocNumber": "UK-AOC-0098",
  "currentFleetSize": 22,
  "currentFleetTypes": ["A319", "A320ceo"],
  "replacementUnits": 8,
  "addedCapacityUnits": 6,
  "primaryRouteNetwork": ["TRANSATLANTIC", "SHORT_HAUL_EUROPE"],
  "acquisitionRationale": "FLEET_RENEWAL",
  "retirementSchedule": [
    { "type": "A319", "quantity": 4, "targetRetirementYear": 2027 },
    { "type": "A320ceo", "quantity": 4, "targetRetirementYear": 2028 }
  ]
}
```

### `acquisitionRationale` Enum

`FLEET_RENEWAL`, `CAPACITY_EXPANSION`, `FUEL_EFFICIENCY`, `ROUTE_LAUNCH`, `LESSOR_RETURN`, `START_UP`

---

## 4. `deliveryPosition`

Aircraft are ordered against specific production slots in the manufacturer's build queue. This is a first-class data point in aviation procurement with no equivalent in other industries.

```json
"deliveryPosition": {
  "deliveryYear": 2027,
  "deliveryQuarter": "Q2",
  "deliverySlotNumber": "TUL-2027-Q2-047",
  "deliveryAirport": "ICAO:LFBO",
  "deliveryCenter": "Toulouse Final Assembly Line",
  "acceptanceFlightRequired": true,
  "customerAcceptanceTeam": "SkyBridge Tech Ops",
  "paintShopIncluded": true,
  "paintScheme": "SkyBridge full livery blue/white",
  "seatInstallationIncluded": true,
  "cabinConfigFrozenDate": "2026-09-01"
}
```

---

## 5. `regulatoryData`

Aviation procurement is tightly regulated. Certification data guards against purchasing an aircraft that cannot legally operate on intended routes.

```json
"regulatoryData": {
  "typeCertificateHolder": "Airbus SAS",
  "typeCertificateNumber": "EASA.A.064",
  "faaCertified": true,
  "easaCertified": true,
  "caaaCertified": false,
  "caacCertified": true,
  "noiseCertification": "ICAO_ANNEX_16_VOL1_CH14",
  "emissionsStandard": "ICAO_ANNEX_16_VOL2_CH3",
  "etopsApproval": "180_MINUTES",
  "requiredMaintenanceProgram": "MSG-3",
  "airworthinessCertificateType": "STANDARD",
  "flagState": "GB",
  "registrationPrefix": "G-"
}
```

---

## 6. `financingStructure`

Aviation financing is specialized — ECA agencies, EETCs, sale-leaseback, and lessor structures are all common. This block extends the generic `procurementFinancing` with aviation-specific terms.

```json
"financingStructure": {
  "primaryStructure": "ECA_BACKED",
  "ecaAgency": "UK_UKEF",
  "ecaCoverage": 85,
  "ecaTranche": {
    "amount": 85000000,
    "currency": "USD",
    "termYears": 12,
    "rateBasis": "SOFR_PLUS_MARGIN",
    "margin": 1.85
  },
  "commercialTranche": {
    "amount": 17000000,
    "currency": "USD",
    "lenderGroup": ["Lloyds Bank", "Natwest"]
  },
  "leaseback": false,
  "lessorInvolved": false,
  "deliveryPaymentStructure": [
    { "milestone": "CONTRACT_SIGNING", "pct": 1.0 },
    { "milestone": "DELIVERY_MINUS_24_MONTHS", "pct": 2.5 },
    { "milestone": "DELIVERY_MINUS_12_MONTHS", "pct": 2.5 },
    { "milestone": "DELIVERY", "pct": 94.0 }
  ]
}
```

### `primaryStructure` Enum

`CASH`, `COMMERCIAL_BANK_LOAN`, `ECA_BACKED`, `EETC`, `OPERATING_LEASE`, `FINANCE_LEASE`, `SALE_LEASEBACK`, `ISLAMIC_FINANCE_IJARA`, `GOVERNMENT_GRANT`, `CONSORTIUM`

### `ecaAgency` Enum

`US_EXIM`, `UK_UKEF`, `FRANCE_BPI`, `GERMANY_EULER_HERMES`, `SWEDEN_EKN`, `CANADA_EDC`, `KOREA_KEXIM`, `JAPAN_JBIC`, `BRAZIL_BNDES`, `OTHER`

---

## 7. `technicalEvaluation`

Aviation procurement typically includes formal technical evaluation stages before commercial negotiation. Tracking these stages provides lifecycle visibility beyond the core LEX status machine.

```json
"technicalEvaluation": {
  "status": "COMPLETED",
  "evaluationPhases": [
    {
      "phase": "PROJECT_DEFINITION",
      "startDate": "2025-06-01",
      "completedDate": "2025-07-15",
      "outcome": "PASSED",
      "notes": "A320neo selected over Boeing 737 MAX"
    },
    {
      "phase": "TECHNICAL_SPECIFICATION",
      "startDate": "2025-07-20",
      "completedDate": "2025-09-30",
      "outcome": "PASSED",
      "notes": "Seat config, avionics, and cabin spec agreed"
    },
    {
      "phase": "COMMERCIAL_EVALUATION",
      "startDate": "2025-10-01",
      "completedDate": "2025-11-30",
      "outcome": "PASSED",
      "notes": "Final pricing and delivery schedule agreed"
    }
  ],
  "competitorsEvaluated": ["Boeing 737 MAX 8", "Airbus A220-300"],
  "selectedOEM": "Airbus",
  "evaluationDocumentRef": "RFP-2025-SKYBRIDGE-A320-NEO"
}
```

### `phase` Enum

`PROJECT_DEFINITION`, `TECHNICAL_SPECIFICATION`, `COMMERCIAL_EVALUATION`, `CONTRACT_NEGOTIATION`, `BOARD_APPROVAL`, `REGULATORY_REVIEW`

### `outcome` Enum

`IN_PROGRESS`, `PASSED`, `FAILED`, `DEFERRED`, `CANCELLED`

---

## 8. Gap Analysis vs. SPEC 2000 / ACRIS

| Capability | SPEC 2000 | ACRIS | LEX + This Extension |
|---|---|---|---|
| Aircraft lead / procurement intent | ❌ | ❌ | ✅ |
| Lead lifecycle (9 states) | ❌ | ❌ | ✅ |
| Production slot tracking | ❌ | ❌ | ✅ |
| ECA / EETC financing | ❌ | ❌ | ✅ |
| Technical evaluation stages | ❌ | ❌ | ✅ |
| Type certificate / regulatory data | Partial | ❌ | ✅ |
| MRO parts procurement | ✅ | ❌ | Out of scope (SPEC 2000) |
| Airport ops / turnaround | ❌ | ✅ | Out of scope (ACRIS) |
| Fleet composition context | ❌ | ❌ | ✅ |
| Lead closure (WON/LOST) | ❌ | ❌ | ✅ |
| Multi-format (JSON/XML/X12/EDI) | ❌ | ❌ | ✅ |
| AI predictive signals (aviation) | ❌ | ❌ | ✅ |

---

## 9. `aiSignals`

Domain-specific AI-generated probability signals for aviation procurement. Carried inside the extension `data` block alongside `aircraftSpec`, `fleetContext`, etc. Cross-industry signals (intent score, quality tier, etc.) remain in `lex.payload.lead.leadIntelligence`.

```json
"aiSignals": {
  "fleetFitScore": 0.82,
  "decisionMakerScore": 0.76,
  "procurementStageProbability": {
    "MARKET_SURVEY": 0.08,
    "RFP_PREPARATION": 0.21,
    "ACTIVE_EVALUATION": 0.57,
    "CONTRACT_NEGOTIATION": 0.14
  },
  "ecaFinancingLikelihood": 0.69,
  "competitorWinRisk": 0.31,
  "signalScoredAt": "2026-04-12T09:00:00Z",
  "modelVersion": "AVN_AI_SIGNALS_V1.2"
}
```

### Field Reference

| Field | Type | Description |
|---|---|---|
| `fleetFitScore` | Decimal (0–1) | How well the prospect's fleet profile matches the product type being quoted. High score = strong operational fit |
| `decisionMakerScore` | Decimal (0–1) | Probability that the lead contact is the final procurement decision-maker (vs. influencer or evaluator) |
| `procurementStageProbability` | Object | Probability mass over procurement stages — helps OEM sales teams calibrate engagement depth |
| `ecaFinancingLikelihood` | Decimal (0–1) | Probability customer will require ECA (Export Credit Agency) backed financing |
| `competitorWinRisk` | Decimal (0–1) | Predicted probability that a competitor will win this deal (0 = low risk, 1 = near-certain competitor win) |
| `signalScoredAt` | ISO 8601 | When these aviation-specific signals were generated |
| `modelVersion` | String | Scoring model version for these aviation signals |
