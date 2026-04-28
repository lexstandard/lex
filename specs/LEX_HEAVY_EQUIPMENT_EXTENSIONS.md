<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright (c) 2026 LEX Lead Exchange Standard Contributors -->
<!-- Canonical specification: https://lexstandard.org -->

# LEX - Heavy Equipment Industry Extension

**Namespace:** `lex.core.heavyequipment`  
**Version:** 1.0.0  
**Status:** Draft  
**Extends:** LEX_SPECIFICATION.md, LEX_MULTI_INDUSTRY.md  
**Registry Entry:** LEX_EXTENSION_REGISTRY.json

---

## Overview

Heavy equipment procurement — construction, mining, agricultural — has no open lead-exchange standard. AEM (Association of Equipment Manufacturers) publishes statistical models; AEMP/ISO 15143 covers telematics data; neither addresses procurement leads. OEMs (Caterpillar, Komatsu, Deere, Liebherr) operate proprietary dealer management systems with no interoperability.

This extension adds first-class support for:
1. **Equipment specification** — rated capacity, operating weight, engine output targeted at work machine capabilities
2. **Attachments and implements** — equipment is often sold with required attachments; weighted preference list
3. **Job site context** — where the equipment will be deployed (altitude, terrain, climate) affects specification selection
4. **Utilization requirements** — hours per day/week drives service plan requirements
5. **Service and telematics** — maintenance plan, PM contract, fleet management platform
6. **Demo / site trial** — corresponds to `APPOINTMENT_REQUEST` lifecycle state
7. **Part-exchange complement** — supplements the generic `partExchange` block with equipment-specific data

---

## 1. Extension Block

```json
{
  "namespace": "lex.core.heavyequipment",
  "version": "1.0.0",
  "producer": "<sender-org-id>",
  "producedAt": "2026-01-10T09:15:00Z",
  "data": {
    "equipmentSpec": { ... },
    "attachments": [ ... ],
    "jobSiteContext": { ... },
    "utilizationRequirements": { ... },
    "servicePlan": { ... },
    "demoRequest": { ... }
  }
}
```

---

## 2. `equipmentSpec`

Work-machine attributes not supported by the generic `desiredProduct`.

```json
"equipmentSpec": {
  "equipmentCategory": "EXCAVATOR",
  "equipmentSubType": "HYDRAULIC_EXCAVATOR_LARGE",
  "operatingWeightKg": 90000,
  "bucketCapacityM3": 6.1,
  "enginePowerKw": 390,
  "engineTier": "TIER_4_FINAL",
  "hydraulicSystemFlowLpm": 2 ,
  "maxDiggingDepthM": 8.5,
  "maxReachM": 13.2,
  "maxDumpingHeightM": 9.1,
  "trackWidth": "DOUBLE_GROUSER",
  "undercarriageType": "CRAWLER",
  "swingBearing": "RING_GEAR",
  "cabType": "ROPS_FOPS_LEVEL_2",
  "fuelTankCapacityL": 880,
  "hydraulicFluidCapacityL": 520,
  "serialNumberOEM": null,
  "emissionStandard": "EPA_TIER_4F"
}
```

### `equipmentCategory` Enum

| Value | Description |
|---|---|
| `EXCAVATOR` | Crawler / wheeled hydraulic excavator |
| `WHEEL_LOADER` | Wheel loader |
| `BULLDOZER` | Track-type tractor / bulldozer |
| `MOTOR_GRADER` | Road grader |
| `ARTICULATED_HAULER` | Articulated dump truck |
| `RIGID_HAULER` | Rigid dump truck / haul truck |
| `CRANE_CRAWLER` | Crawler crane |
| `CRANE_MOBILE` | Mobile / all-terrain crane |
| `CRANE_TOWER` | Tower crane |
| `PIPELAYER` | Pipelayer |
| `DRAGLINE` | Dragline excavator |
| `SCRAPER` | Self-propelled scraper |
| `COMPACTOR` | Soil / landfill compactor |
| `PAVERS` | Asphalt paver |
| `MILLINGS` | Cold planer / milling machine |
| `TRACTOR_AGRICULTURAL` | Agricultural tractor |
| `COMBINE_HARVESTER` | Combine harvester |
| `FORKLIFT` | Counterbalance / reach / rough-terrain forklift |
| `TELEHANDLER` | Telescopic handler |
| `AERIAL_PLATFORM` | Boom lift / scissor lift |
| `DRILL_RIG` | Surface / underground drill rig |
| `LOADER_UNDERGROUND` | Underground loader / LHD |

### `engineTier` Enum

`TIER_1`, `TIER_2`, `TIER_3`, `TIER_4_INTERIM`, `TIER_4_FINAL`, `STAGE_V` (EU), `STAGE_IV` (EU), `CHINA_4`, `NON_ROAD_EU_5`

---

## 3. `attachments`

Equipment is frequently purchased with one or more required attachments. The core `featurePreferences[]` covers basic weighting; this block adds attachment-specific commercial details.

```json
"attachments": [
  {
    "attachmentType": "BUCKET_GENERAL_PURPOSE",
    "manufacturer": "Caterpillar",
    "partNumber": "CAT-375-6P-GP",
    "capacityM3": 6.1,
    "weighting": 100,
    "quickCouplerRequired": true,
    "quickCouplerStandard": "CATERPILLAR_WEDGE_LOCK"
  },
  {
    "attachmentType": "HYDRAULIC_THUMB",
    "manufacturer": "Caterpillar",
    "weighting": 80,
    "description": "Required for demo handling"
  },
  {
    "attachmentType": "HYDRAULIC_HAMMER",
    "manufacturer": "INDECO",
    "partNumber": "INDECO_HP12000",
    "weighting": 60,
    "description": "Rock breaking — secondary requirement"
  }
]
```

### `attachmentType` Enum Values (selection)

`BUCKET_GENERAL_PURPOSE`, `BUCKET_ROCK`, `BUCKET_CLEANUP`, `BUCKET_TILTING`, `HYDRAULIC_THUMB`, `HYDRAULIC_HAMMER`, `RIPPER`, `QUICK_COUPLER`, `GRAPPLE`, `COMPACTION_WHEEL`, `GRADING_BLADE`, `AUGER`, `PALLET_FORKS`, `WORK_TOOL_OTHER`

---

## 4. `jobSiteContext`

Equipment performance varies significantly based on site conditions. Dealers use this data to verify specification suitability before quoting.

```json
"jobSiteContext": {
  "projectName": "Granite Peak I-81 Highway Expansion",
  "deliveryAddress": {
    "street": "Mile Marker 142, US-Route 81",
    "city": "Harrisburg",
    "state": "PA",
    "postalCode": "17101",
    "country": "US"
  },
  "siteElevationM": 120,
  "terrain": "MIXED_SOIL_ROCK",
  "climate": "TEMPERATE",
  "siteConditions": ["WET_GROUND", "CONFINED_SPACE"],
  "projectType": "ROAD_CONSTRUCTION",
  "projectDurationMonths": 18,
  "soilType": "CLAY_GRAVEL",
  "rockHardnessMpa": null,
  "operatingAltitudeM": 120,
  "requiredCertifications": ["OSHA_30", "OPERATOR_TRAINING"]
}
```

### `terrain` Enum

`FLAT_STABLE`, `FLAT_SOFT`, `SLOPED`, `ROCKY`, `MIXED_SOIL_ROCK`, `UNDERGROUND`, `UNDERWATER`, `PERMAFROST`

### `projectType` Enum

`ROAD_CONSTRUCTION`, `BUILDING_EXCAVATION`, `PIPELINE`, `MINING_SURFACE`, `MINING_UNDERGROUND`, `AGRICULTURAL_LAND`, `DEMOLITION`, `UTILITIES`, `PORTS_MARINE`, `QUARRYING`, `GENERAL_EARTHWORKS`

---

## 5. `utilizationRequirements`

Drives warranty class, service interval planning, and financing term alignment.

```json
"utilizationRequirements": {
  "averageHoursPerDay": 10,
  "expectedAnnualHours": 2500,
  "shifts": 2,
  "operatingEnvironment": "HARSH",
  "preferredServiceInterval": 500,
  "expectedLifespanYears": 8,
  "smrAtEndOfLife": 20000
}
```

### `operatingEnvironment` Enum

`LIGHT_DUTY`, `STANDARD`, `SEVERE`, `HARSH`, `EXTREME_COLD`, `EXTREME_HEAT`, `HIGH_ALTITUDE`, `CORROSIVE`

---

## 6. `servicePlan`

```json
"servicePlan": {
  "pmContractRequired": true,
  "pmContractType": "FULL_MAINTENANCE",
  "pmContractYears": 5,
  "telematicsRequired": true,
  "telematicsPlatform": "CAT_VISIONLINK",
  "lubricantsSupplied": "OEM",
  "warrantyExtensionYears": 2,
  "customerValueAgreement": true,
  "preventiveMaintenanceKits": true,
  "serviceDealer": "CAT-MIDWEST",
  "slaResponseHours": 4
}
```

### `pmContractType` Enum

`PREVENTIVE_ONLY`, `FULL_MAINTENANCE`, `PRIORITY_MAINTENANCE`, `PARTS_ONLY`, `INSPECTION_ONLY`

---

## 7. `demoRequest`

Site demonstration is the primary first physical interaction in heavy equipment sales — equivalent to a test drive in automotive. Corresponds to the `APPOINTMENT_REQUEST` lifecycle state.

```json
"demoRequest": {
  "demoRequested": true,
  "demoType": "ON_SITE",
  "preferredDate": "2026-01-18",
  "siteContactName": "Jim Walsh",
  "siteContactPhone": "+17175550123",
  "machineToDemo": "Cat 390 Excavator",
  "attachmentsForDemo": ["BUCKET_GENERAL_PURPOSE", "HYDRAULIC_HAMMER"],
  "competitorMachineForComparison": "Komatsu PC800",
  "demoCompleted": false,
  "demoOutcome": null,
  "demoNotes": null
}
```

### `demoType` Enum

`ON_SITE`, `DEALER_YARD`, `QUARRY_DAY`, `FACTORY_TOUR`, `VIRTUAL`, `VIDEO_ONLY`

---

## 8. Gap Analysis vs. AEM / AEMP Standards

| Capability | AEM Stats | AEMP/ISO 15143 | LEX + This Extension |
|---|---|---|---|
| Procurement lead lifecycle | ❌ | ❌ | ✅ |
| Equipment specification (typed) | ❌ | Partial (telematics) | ✅ |
| Attachment weighting | ❌ | ❌ | ✅ |
| Job site context | ❌ | ❌ | ✅ |
| Utilization requirements | ❌ | ✅ (SMR reporting) | ✅ |
| Telematics platform preference | ❌ | ✅ | ✅ |
| Service plan requirements | ❌ | ❌ | ✅ |
| Demo / site trial tracking | ❌ | ❌ | ✅ |
| Part-exchange (equipment) | ❌ | ❌ | ✅ (via core partExchange) |
| Lead closure (WON/LOST) | ❌ | ❌ | ✅ |
| Lead deduplication | ❌ | ❌ | ✅ |
| Multi-format (JSON/XML/X12/EDI) | ❌ | ❌ | ✅ |
| AI predictive signals (heavy eq.) | ❌ | ❌ | ✅ |

---

## 9. `aiSignals`

Domain-specific AI-generated probability signals for heavy equipment procurement. Carried inside the extension `data` block. Cross-industry signals remain in `lex.payload.lead.leadIntelligence`.

```json
"aiSignals": {
  "jobSiteFitScore": 0.83,
  "attachmentBundleLikelihood": 0.61,
  "predictedAnnualUtilizationHours": 1840,
  "servicePlanUptakeProbability": 0.72,
  "fleetExpansionIndicator": "REPLACING_SINGLE_UNIT",
  "competitorWinRisk": 0.19,
  "signalScoredAt": "2026-04-12T09:00:00Z",
  "modelVersion": "HEQ_AI_SIGNALS_V1.0"
}
```

### Field Reference

| Field | Type | Description |
|---|---|---|
| `jobSiteFitScore` | Decimal (0–1) | How well the equipment specification matches the buyer's stated job site and operational requirements |
| `attachmentBundleLikelihood` | Decimal (0–1) | Probability customer will purchase attachments / work tools alongside the primary unit |
| `predictedAnnualUtilizationHours` | Integer | ML-estimated annual machine hours based on buyer profile and job site signals |
| `servicePlanUptakeProbability` | Decimal (0–1) | Probability customer will enroll in an extended service / maintenance plan |
| `fleetExpansionIndicator` | Enum | `NEW_PURCHASE`, `REPLACING_SINGLE_UNIT`, `FLEET_EXPANSION`, `RENTAL_CONVERSION` — predicted procurement mode |
| `competitorWinRisk` | Decimal (0–1) | Predicted probability a competitor wins this deal |
| `signalScoredAt` | ISO 8601 | When these heavy-equipment-specific signals were generated |
| `modelVersion` | String | Scoring model version |
