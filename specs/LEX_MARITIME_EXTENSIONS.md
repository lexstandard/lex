<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright (c) 2026 LEX Lead Exchange Standard Contributors -->
<!-- Canonical specification: https://lexstandard.org -->

# LEX - Maritime Industry Extension

**Namespace:** `lex.core.maritime`  
**Version:** 1.0.0  
**Status:** Draft  
**Extends:** LEX_SPECIFICATION.md, LEX_MULTI_INDUSTRY.md  
**Registry Entry:** LEX_EXTENSION_REGISTRY.json

---

## Overview

Maritime procurement — new-build vessels, second-hand tonnage, and charter arrangements — operates through a global network of shipbrokers, shipyards, and owners with no dominant open lead-exchange standard. The closest standards are BIMCO (Baltic and International Maritime Council) contract templates and IHM (Inventory of Hazardous Materials) documentation, neither of which addresses procurement lead exchange.

This extension adds first-class support for:
1. **Vessel specification** — type, dimensions, capacity, classification data
2. **Broker information** — maritime deals almost exclusively flow through shipbrokers
3. **Shipyard details** — selected shipyard, build number, delivery berth
4. **Classification requirements** — class society notation and survey obligations
5. **Financing structures** — Korean/Norwegian ECA, sale and leaseback, bareboat charter
6. **Charter context** — intended charter market and deployment strategy

---

## 1. Extension Block

```json
{
  "namespace": "lex.core.maritime",
  "version": "1.0.0",
  "producer": "<sender-org-id>",
  "producedAt": "2025-11-05T08:00:00Z",
  "data": {
    "vesselSpec": { ... },
    "brokerInfo": { ... },
    "shipyardDetails": { ... },
    "classificationRequirements": { ... },
    "financingStructure": { ... },
    "charterContext": { ... }
  }
}
```

---

## 2. `vesselSpec`

```json
"vesselSpec": {
  "vesselType": "CONTAINER",
  "teuCapacity": 4500,
  "deadweightTonnage": 53000,
  "grossTonnage": 44000,
  "lengthOverallM": 259.0,
  "beamM": 37.3,
  "draughtM": 12.2,
  "mainEngineType": "MAN_B&W_2STROKE",
  "mainEnginePower": 15820,
  "speedServiceKnots": 18.5,
  "fuelType": "VLSFO",
  "dualFuelCapable": false,
  "scrubberFitted": false,
  "ammoniaDualFuelReady": false,
  "methanol": false,
  "iceClass": "NONE",
  "cranesFitted": 0,
  "reeferPlugs": 700,
  "flagState": "MH",
  "portOfRegistry": "Majuro",
  "desiredDeliveryYear": 2027,
  "buildStandard": "TIER_III_NOX"
}
```

### `vesselType` Enum

| Value | Description |
|---|---|
| `CONTAINER` | Container / box vessel |
| `BULK_CARRIER` | Dry bulk carrier |
| `TANKER_CRUDE` | Crude oil tanker (VLCC, Suezmax, Aframax) |
| `TANKER_PRODUCT` | Product / chemical tanker |
| `LNG_CARRIER` | LNG carrier |
| `LPG_CARRIER` | LPG / VLGC carrier |
| `CAR_CARRIER` | Pure Car Carrier (PCC) / PCTC |
| `RORO` | Roll-on/roll-off |
| `GENERAL_CARGO` | General cargo / MPP |
| `PASSENGER_FERRY` | Passenger ferry |
| `CRUISE` | Cruise vessel |
| `OFFSHORE_SUPPORT` | Offshore support / PSV / AHTS |
| `DRILLSHIP` | Drillship |
| `FPSO` | FPSO / FSO |
| `TUG` | Tug |
| `DREDGER` | Dredger |
| `YACHT_COMMERCIAL` | Commercial / charter yacht |

### `fuelType` Enum

`HFO`, `VLSFO`, `LSMGO`, `LNG`, `LPG`, `METHANOL`, `AMMONIA`, `HYDROGEN`, `BIOFUEL_BLEND`, `DUAL_FUEL`

---

## 3. `brokerInfo`

Maritime transactions almost universally involve one or more shipbrokers as intermediaries. This is a mandatory gap from the generic LEX model.

```json
"brokerInfo": {
  "brokerName": "Nordic Maritime Brokers AS",
  "brokerId": "ORG-NORDIC-MARITIME-BROKERS",
  "brokerContact": {
    "name": "Erik Lindqvist",
    "title": "Senior Shipbroker",
    "email": "e.lindqvist@nordicmaritime.com",
    "phone": "+4723456789",
    "mobile": "+4794567890"
  },
  "brokerRole": "SALE_AND_PURCHASE",
  "commission": {
    "pct": 1.0,
    "currency": "USD",
    "splitWithCounterpartBroker": true
  },
  "brokerageAssociation": "NSSA"
}
```

### `brokerRole` Enum

`SALE_AND_PURCHASE`, `CHARTERING`, `NEWBUILDING`, `DEMOLITION`, `INSURANCE`, `FINANCE`, `TECHNICAL`

### `brokerageAssociation` Enum

`NSSA` (Norwegian), `FONASBA` (International), `ITIC`, `BIMCO` (member), `OTHER`

---

## 4. `shipyardDetails`

Applicable when a new-build vessel is ordered.

```json
"shipyardDetails": {
  "shipyardName": "Hyundai Heavy Industries - Ulsan",
  "shipyardId": "SY-HHI-ULSAN",
  "shipyardCountry": "KR",
  "hullNumber": "HHI-3241",
  "berth": "Dock 7",
  "keelLayingDate": "2026-03-15",
  "launchDate": "2026-10-01",
  "seaTrialsDate": "2027-01-15",
  "deliveryBerth": "Ulsan Shipyard Main Quay",
  "builderClass": "DNV",
  "classNotationSetAtKeel": "1A2 Container Ship E0 TMON",
  "progressPayments": [
    { "milestone": "CONTRACT", "pct": 5.0, "dueDate": "2025-12-15" },
    { "milestone": "KEEL_LAID", "pct": 10.0, "dueDate": "2026-03-15" },
    { "milestone": "LAUNCH", "pct": 15.0, "dueDate": "2026-10-01" },
    { "milestone": "SEA_TRIALS", "pct": 10.0, "dueDate": "2027-01-15" },
    { "milestone": "DELIVERY", "pct": 60.0, "dueDate": "2027-02-28" }
  ]
}
```

---

## 5. `classificationRequirements`

Classification society assignment is non-negotiable for commercial vessels. This drives maintenance, survey cycles, and trading area eligibility.

```json
"classificationRequirements": {
  "preferredSociety": "DNV",
  "acceptableSocieties": ["DNV", "BV", "LR", "RINA"],
  "requiredNotations": [
    "Container Ship",
    "E0",
    "TMON",
    "SCM"
  ],
  "specialSurveyDue": "2031-02",
  "continuousSurveyProgram": true,
  "ihmRequired": true,
  "bwmcCompliant": true,
  "polarCode": false,
  "marpol": {
    "annexI": true,
    "annexII": false,
    "annexV": true,
    "annexVI": true,
    "eediCertified": true
  }
}
```

### `preferredSociety` / `acceptableSocieties` Enum Values

`DNV`, `BV` (Bureau Veritas), `LR` (Lloyd's Register), `ABS` (American Bureau of Shipping), `RINA`, `CCS` (China Classification Society), `NK` (Nippon Kaiji Kyokai), `KR` (Korean Register), `RS` (Russian Maritime Register)

---

## 6. `financingStructure`

Maritime-specific financing structures extend the generic `procurementFinancing` block.

```json
"financingStructure": {
  "primaryStructure": "ECA_BACKED",
  "ecaAgency": "KOREA_KEXIM",
  "ecaCoverage": 80,
  "ecaTranche": {
    "amount": 54400000,
    "currency": "USD",
    "termYears": 12,
    "rateBasis": "SOFR_PLUS_MARGIN",
    "margin": 2.10
  },
  "equityContribution": {
    "amount": 13600000,
    "currency": "USD",
    "ownerEquityPct": 20
  },
  "mortgageRegistration": "MH",
  "shipFinanceLenders": ["Korea EXIM Bank", "DNB Bank ASA"],
  "assignmentOfEarnings": true,
  "mortgageFirstPriority": true,
  "flagState": "MH"
}
```

### `primaryStructure` Enum

`CASH`, `COMMERCIAL_BANK_LOAN`, `ECA_BACKED`, `BAREBOAT_CHARTER`, `SALE_LEASEBACK`, `BOND_FINANCE`, `ISLAMIC_FINANCE_IJARA`, `CONSORTIUM`, `GOVERNMENT_GRANT`

---

## 7. `charterContext`

Post-delivery commercial deployment intent — informs how the vessel will generate revenue to service debt.

```json
"charterContext": {
  "intendedCharter": "TIME_CHARTER",
  "targetCharterDuration": 5,
  "targetCharterDurationUnit": "YEARS",
  "targetCharterer": "MSC Mediterranean Shipping",
  "charterRateDailyUSD": 28000,
  "tradingArea": ["TRANSATLANTIC", "TRANSPACIFIC"],
  "seasonalTrading": false,
  "spotMarketFallback": true
}
```

### `intendedCharter` Enum

`SPOT`, `TIME_CHARTER`, `BAREBOAT_CHARTER`, `CONSECUTIVE_VOYAGE`, `CONTRACT_OF_AFFREIGHTMENT`, `OWNER_OPERATED`

---

## 8. Gap Analysis vs. BIMCO / FONASBA Standards

| Capability | BIMCO Contracts | FONASBA Forms | LEX + This Extension |
|---|---|---|---|
| Lead / RFQ lifecycle | ❌ | ❌ | ✅ |
| Vessel specification (typed) | Contract only | ❌ | ✅ |
| Broker role and commission | Partial | ✅ | ✅ |
| Classification requirements | Partial | ❌ | ✅ |
| ECA financing | ❌ | ❌ | ✅ |
| Progress payment schedule | Contract only | ❌ | ✅ |
| Lead deduplication | ❌ | ❌ | ✅ |
| Lead closure (WON/LOST) | ❌ | ❌ | ✅ |
| Multi-format (JSON/XML/X12/EDI) | ❌ | ❌ | ✅ |
| Acknowledgment / ACK | ❌ | ❌ | ✅ |
| AI predictive signals (maritime) | ❌ | ❌ | ✅ |

---

## 9. `aiSignals`

Domain-specific AI-generated probability signals for maritime procurement. Carried inside the extension `data` block alongside `vesselSpec`, `voyageProfile`, etc. Cross-industry signals remain in `lex.payload.lead.leadIntelligence`.

```json
"aiSignals": {
  "vesselTypeAffinityScore": 0.79,
  "carbonCompliancePropensity": 0.65,
  "fleetReplacementUrgency": "HIGH",
  "alternativeFuelReadinessScore": 0.44,
  "competitorWinRisk": 0.27,
  "signalScoredAt": "2026-04-12T09:00:00Z",
  "modelVersion": "MAR_AI_SIGNALS_V1.1"
}
```

### Field Reference

| Field | Type | Description |
|---|---|---|
| `vesselTypeAffinityScore` | Decimal (0–1) | How well the prospect's fleet profile matches the vessel type being quoted |
| `carbonCompliancePropensity` | Decimal (0–1) | Likelihood customer will prioritize IMO 2030/2050 compliance in selection criteria |
| `fleetReplacementUrgency` | Enum | `LOW`, `MEDIUM`, `HIGH` — based on fleet age profile and regulatory timeline signals |
| `alternativeFuelReadinessScore` | Decimal (0–1) | Probability that the operator is evaluating LNG, methanol, or ammonia-powered vessels |
| `competitorWinRisk` | Decimal (0–1) | Predicted probability a competitor wins this deal |
| `signalScoredAt` | ISO 8601 | When these maritime-specific signals were generated |
| `modelVersion` | String | Scoring model version for these maritime signals |
