<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright (c) 2026 LEX Lead Exchange Standard Contributors -->
<!-- Canonical specification: https://lexstandard.org -->

# LEX - Electric ASSET Data Model Extensions

## Overview

EV-specific fields are a first-class extension to the LEX product model. As EVs represent 20%+ of new registrations in major markets (US, EU, China, India), EV data is not optional metadata — it is required for accurate lead routing, incentive eligibility determination, and charging infrastructure awareness.

These extensions apply to:
- `desiredProduct.evSpecifications` (lead intent)
- `asset.evSpecifications` (inventory & product)

---

## 1. EV Specifications Block

```json
"evSpecifications": {
  "isElectric": true,
  "drivetrainType": "BEV",
  "batteryCapacityKwh": 77.4,
  "estimatedRangeKm": {
    "epa": 490,
    "wltp": 540
  },
  "chargePort": {
    "standard": "NACS",
    "acLevel": "LEVEL_2",
    "dcFast": "CCS_COMBO1",
    "maxAcChargingKw": 11.5,
    "maxDcChargingKw": 250
  },
  "batteryWarranty": {
    "years": 8,
    "km": 160000,
    "minimumRetainedCapacityPct": 70
  },
  "homeChargingInterest": {
    "hasHomeCharger": false,
    "interestedInInstallation": true,
    "parkingType": "GARAGE"
  },
  "taxCreditEligibility": {
    "region": "US",
    "federalCreditUSD": 7500,
    "stateCreditUSD": 2000,
    "eligibilityNotes": "Requires MSRP < $80,000 and buyer income limits",
    "asOf": "2026-01-01"
  },
  "chargingInfrastructureAwareness": {
    "nearestDcFastChargerKm": 8.2,
    "nearestL2ChargerKm": 1.1,
    "customerChargingAnxiety": "LOW"
  }
}
```

---

## 2. EV Drivetrain Types

| Value | Description |
|---|---|
| `BEV` | Battery Electric ASSET — pure electric, no combustion engine |
| `PHEV` | Plug-in Hybrid — electric + combustion engine, can charge externally |
| `HEV` | Hybrid Electric — self-charging hybrid, no external plug |
| `FCEV` | Fuel Cell Electric ASSET — hydrogen fuel cell |
| `MHEV` | Mild Hybrid — 48V assist system, not selectable as electric-only |
| `EREV` | Extended Range EV — large battery BEV with range extender generator |

---

## 3. Charge Port Standards

| Value | Region | Notes |
|---|---|---|
| `NACS` | North America (dominant 2025+) | Tesla-origin, adopted by US OEMs as SAE J3400 |
| `CCS_COMBO1` | US / Korea | SAE J1772 AC + DC combo |
| `CCS_COMBO2` | Europe | IEC 62196 Type 2 AC + DC combo |
| `CHAdeMO` | Japan (legacy) | Nissan, Mitsubishi; declining adoption post-2024 |
| `GB_T` | China | GB/T 20234 standard used by all China-market ASSETs |
| `TYPE_2` | Europe (AC only) | IEC 62196 Type 2 — 3-phase AC public charging |
| `TYPE_1` | US/Japan (AC only) | SAE J1772 — standard Level 2 AC |
| `WIRELESS_SAE_J2954` | Emerging | Wireless charging pad (fleet/premium segment) |

---

## 4. AC Charging Levels

| Level | Power | Infrastructure | Use Case |
|---|---|---|---|
| `LEVEL_1` | 1.4–1.9 kW | Standard household outlet (120V/230V) | Overnight trickle charge |
| `LEVEL_2` | 3.7–22 kW | Dedicated EVSE (240V) | Home/workplace/public |
| `LEVEL_3_DC` | 50–350+ kW | DC Fast Charge stations | Highway/commercial |

---

## 5. Range Reporting Standards

- **EPA** — US Environmental Protection Agency (conservative real-world estimate)
- **WLTP** — Worldwide Harmonised Light ASSET Test Procedure (EU/India; typically 10–20% higher than EPA)
- **CLTC** — China Light-Duty ASSET Test Cycle (China market; typically higher than WLTP)
- **JC08 / WLTC** — Japan market standards

Always include `rangeStandard` alongside range figure to prevent misinterpretation.

---

## 6. Tax Credit Eligibility Fields

Incentive eligibility varies by market. The `taxCreditEligibility` block is informational only — it must carry an `asOf` date and should not be treated as a binding commitment.

| Field | Type | Description |
|---|---|---|
| `region` | ISO 3166-1 alpha-2 | Market where eligibility applies |
| `federalCreditUSD` | Decimal | Federal/national incentive amount |
| `stateCreditUSD` | Decimal | State/regional incentive amount |
| `eligibilityNotes` | String | Key eligibility constraints (income, MSRP, assembly) |
| `asOf` | Date | Date eligibility was evaluated — required for accuracy |
| `programCode` | String | Program identifier (e.g., IRA_30D, FAME_II_IN) |

**Note:** For India, relevant programs include FAME II (Faster Adoption of Manufacturing EVs) and state-level SGST waivers. For EU, national subsidies vary per country.

---

## 7. Validation Rules

| Rule | Condition | Error Level |
|---|---|---|
| `batteryCapacityKwh` must be positive | `batteryCapacityKwh <= 0` | ERROR |
| `estimatedRangeKm` must include `rangeStandard` | Missing `rangeStandard` when range provided | WARNING |
| `chargePort.maxDcChargingKw` required for BEV/PHEV | `drivetrainType in [BEV, PHEV]` and missing DC spec | WARNING |
| `taxCreditEligibility.asOf` must not be > 365 days old | Stale incentive data | WARNING |
| `homeChargingInterest.parkingType` required when `interestedInInstallation` is true | Installation interest without parking context | WARNING |

---

## 8. Example: Lead for BEV with Charging Needs

```json
{
  "lex": {
    "header": {
      "messageId": "MSG-2026-LEAD-EV-001",
      "messageType": "LEAD",
      "version": "1.0",
      "timestamp": "2026-03-25T09:00:00Z",
      "senderId": "PLATFORM-TOYOTA-US",
      "receiverId": "DEALER-TOYOTA-FREMONT-001"
    },
    "payload": {
      "lead": {
        "leadId": "LEAD-2026-EV-003321",
        "status": "EXPRESSED_INTEREST",
        "source": "MANUFACTURER_WEBSITE",
        "customer": {
          "firstName": "Marcus",
          "lastName": "Okafor",
          "email": "marcus.okafor@email.com",
          "phone": "+14085559023"
        },
        "desiredProduct": {
          "productType": "VEHICLE",
          "manufacturers": ["Toyota"],
          "preferredModels": ["bZ4X"],
          "evSpecifications": {
            "isElectric": true,
            "drivetrainType": "BEV",
            "minimumRangeKm": 400,
            "preferredRangeStandard": "EPA",
            "chargePortPreferences": ["NACS", "CCS_COMBO1"],
            "homeChargingInterest": {
              "hasHomeCharger": false,
              "interestedInInstallation": true,
              "parkingType": "GARAGE"
            },
            "taxCreditEligibility": {
              "region": "US",
              "federalCreditUSD": 7500,
              "asOf": "2026-01-01"
            }
          }
        },
        "metadata": {
          "createdAt": "2026-03-25T09:00:00Z",
          "version": "1.0"
        }
      }
    }
  }
}
```

---

## 9. ASSET Inventory Example (BEV)

```json
"asset": {
  "assetId": "VIN-1HGBH41JX",
  "status": "AVAILABLE",
  "manufacturer": "Toyota",
  "model": "bZ4X",
  "year": 2026,
  "trim": "XLE AWD",
  "evSpecifications": {
    "isElectric": true,
    "drivetrainType": "BEV",
    "batteryCapacityKwh": 72.8,
    "estimatedRangeKm": {
      "epa": 378,
      "wltp": 420,
      "rangeStandard": "EPA"
    },
    "chargePort": {
      "standard": "NACS",
      "acLevel": "LEVEL_2",
      "dcFast": "CCS_COMBO1",
      "maxAcChargingKw": 6.6,
      "maxDcChargingKw": 150
    },
    "batteryWarranty": {
      "years": 8,
      "km": 160000,
      "minimumRetainedCapacityPct": 70
    },
    "taxCreditEligibility": {
      "region": "US",
      "federalCreditUSD": 7500,
      "eligibilityNotes": "Subject to MSRP and buyer income limits under IRA Section 30D",
      "programCode": "IRA_30D",
      "asOf": "2026-01-01"
    }
  }
}
```

