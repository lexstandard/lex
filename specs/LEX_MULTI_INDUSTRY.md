<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright (c) 2026 LEX Lead Exchange Standard Contributors -->
<!-- Canonical specification: https://lexstandard.org -->

# LEX Multi-Industry & Fleet Extension Specification

**Version:** 1.0 Draft  
**Status:** Approved for Implementation  
**Extends:** LEX_SPECIFICATION.md  

---

## Overview

The LEX standard was originally designed for automotive lead exchange. This extension expands the platform to support procurement leads across **any asset class** — from aircraft and rolling stock to container ships, enterprise technology, and general goods — while fully preserving backward compatibility with all existing automotive messages.

Key additions:
1. **Expanded Asset Classes** — 9 new asset classes covering every major industry vertical
2. **Fleet / Multi-Unit Orders** — any buyer ordering more than one unit of any asset
3. **Organisation Buyer Model** — company, fleet, government, NGO buyer classification
4. **Generic Asset Identifier** — replaces VIN-only with a universal serial number field
5. **Industry Specification Blocks** — aviation, rail, maritime, technology spec blocks (parallel to EV)
6. **Generic Part-Exchange** — any asset type traded in, not just cars
7. **B2B Procurement Financing** — tender, framework, ECA, DaaS, and other complex deal structures
8. **Organisation Registry Expansion** — 12 new org types covering all new industry participants

---

## 1. Asset Classes

Defined in the `AssetClass` enum in `ProductRegistry.hx`. All are available in the `desiredProduct.assetClass` field of a `Lead`.

### Ground Transport

| Enum Value | Description |
|---|---|
| `VEHICLE` | Cars, SUVs, trucks, vans |
| `MOTORCYCLE` | Motorcycles, scooters, mopeds, e-bikes |
| `RECREATIONAL` | RVs, motorhomes, ATVs, snowmobiles, personal watercraft |
| `COMMERCIAL` | Heavy-duty trucks, semi-trailers, commercial vehicles |
| `MICROMOBILITY` | E-scooters, cargo bikes, shared pedal bikes |

### Financial & Service Products

| Enum Value | Description |
|---|---|
| `FINANCIAL` | Loan, lease, insurance products |
| `SERVICE` | Maintenance plans, subscriptions, warranties |

### Transport — Air, Rail, Water

| Enum Value | Description |
|---|---|
| `AVIATION` | Aircraft, helicopters, UAVs |
| `RAIL` | Locomotives, EMUs, DMUs, freight wagons, trams |
| `MARITIME` | Cargo ships, ferries, yachts, patrol vessels |

### Capital Goods & Heavy Industry

| Enum Value | Description |
|---|---|
| `HEAVY_EQUIPMENT` | Construction, mining, agricultural equipment |
| `ENERGY` | Wind turbines, solar equipment, generators, power infrastructure |
| `DEFENSE` | Military vehicles, aircraft, vessels, defense systems |
| `SPACE` | Satellites, launch vehicles, ground segment equipment |

### Technology & Digital Goods

| Enum Value | Description |
|---|---|
| `TECHNOLOGY` | Smartphones, tablets, laptops, servers, enterprise hardware |
| `TELECOM` | Network equipment, base stations, telecom infrastructure |

### Healthcare & Life Sciences

| Enum Value | Description |
|---|---|
| `HEALTHCARE` | Medical devices, imaging equipment, surgical robots, lab equipment |

### General Procurement

| Enum Value | Description |
|---|---|
| `GENERAL_GOODS` | Catch-all for B2B procurement not covered by the above classes |

### New Product Types Seeded

#### Aviation
- `AIRCRAFT_NEW` — New aircraft
- `AIRCRAFT_USED` — Pre-owned aircraft
- `HELICOPTER` — Helicopter
- `UAV_DRONE` — Unmanned aerial vehicle / drone

#### Rail
- `LOCOMOTIVE` — Locomotive
- `PASSENGER_TRAIN` — EMU / DMU / high-speed train set
- `TRAM_LRV` — Tram / light rail vehicle
- `FREIGHT_WAGON` — Freight wagon

#### Maritime
- `CARGO_VESSEL` — Cargo / container vessel
- `PASSENGER_FERRY` — Passenger ferry
- `YACHT` — Yacht / luxury vessel
- `OFFSHORE_VESSEL` — Offshore / patrol vessel

#### Heavy Equipment
- `CONSTRUCTION_EQUIPMENT` — Excavator, crane, etc.
- `AGRICULTURAL_EQUIPMENT` — Tractor, harvester, etc.
- `MINING_EQUIPMENT` — Haul truck, drill rig, etc.

#### Micromobility
- `ESCOOTER` — Electric shared / personal scooter
- `CARGO_BIKE` — Cargo / delivery bike

#### Technology
- `SMARTPHONE` — Mobile phone
- `TABLET` — Tablet device
- `LAPTOP` — Laptop / notebook
- `ENTERPRISE_SERVER` — Server / rack unit
- `NETWORK_EQUIPMENT` — Router, switch, firewall
- `IOT_DEVICE` — IoT / smart device
- `TECHNOLOGY_BUNDLE` — Mixed hardware fleet

#### Telecom
- `RADIO_BASE_STATION` — Cell site / RAN equipment
- `TELECOM_INFRASTRUCTURE` — Towers, cables, fibre

#### General Goods
- `GENERAL_PROCUREMENT` — Generic B2B procurement item

#### Healthcare
- `MEDICAL_DEVICE` — Implant, diagnostic, or therapeutic device
- `IMAGING_EQUIPMENT` — MRI, CT, X-Ray, Ultrasound
- `SURGICAL_SYSTEM` — Surgical / robotic surgery system
- `LAB_EQUIPMENT` — Laboratory / analytical equipment

#### Energy
- `WIND_TURBINE` — Onshore or offshore wind turbine
- `SOLAR_SYSTEM` — Solar PV / concentrated solar power system
- `GENERATOR` — Generator / backup power system
- `ENERGY_STORAGE` — Battery / grid energy storage system (BESS)
- `POWER_INFRASTRUCTURE` — Transformer, substation, cabling

#### Defense
- `MILITARY_VEHICLE` — Armoured, tactical, or support ground vehicle
- `MILITARY_AIRCRAFT` — Fighter, transport, rotary-wing
- `NAVAL_VESSEL` — Warship, submarine, patrol craft
- `DEFENSE_EQUIPMENT` — C4ISR, radar, communications systems

---

## 2. Fleet / Multi-Unit Order (`fleetOrder`)

Added as `?fleetOrder:FleetOrder` on the `Lead` typedef.

Use this block when a single lead represents procurement of **more than one unit** of any asset — from 5 corporate smartphones to 200 trains.

### `FleetOrder` Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `quantity` | `Int` | **Yes** | Total units requested (≥ 1) |
| `unitBudgetCapUsd` | `Float` | No | Per-unit price ceiling in USD |
| `totalBudgetCap` | `Float` | No | Aggregate budget ceiling |
| `currency` | `String` | No | ISO 4217 currency code (default: USD) |
| `deliverySchedule` | `Array<FleetDeliverySlot>` | No | Phased delivery schedule |
| `mixedConfigAllowed` | `Bool` | No | Allow different configurations within fleet |
| `unitSpecifications` | `Array<FleetUnitSpecification>` | No | Per-configuration breakdowns |
| `procurementReference` | `String` | No | PO / tender / RFQ reference number |
| `evaluationUnits` | `Int` | No | Trial units before full rollout |
| `preferredDeliveryWindow` | `String` | No | Target delivery period (e.g. "Q3 2025") |
| `frameworkContractId` | `String` | No | Government/enterprise framework reference |

### Validation Rules
- `quantity` must be present and ≥ 1
- When `deliverySchedule` is provided, slot quantities should sum to `quantity`
- When `unitSpecifications` are provided, total across specs must not exceed `quantity`
- Each `FleetDeliverySlot` must include `targetDate` (ISO 8601) and `targetLocation`
- Each `FleetUnitSpecification` must include `configurationCode`

### Example — Corporate Phone Fleet

```json
{
  "fleetOrder": {
    "quantity": 500,
    "unitBudgetCapUsd": 1200,
    "currency": "USD",
    "mixedConfigAllowed": true,
    "unitSpecifications": [
      { "quantity": 350, "configurationCode": "IPHONE-16-PRO-256-BLK", "specificOptions": ["MDM_ENROLLED"] },
      { "quantity": 150, "configurationCode": "SAMSUNG-S25-256-GRY", "specificOptions": ["MDM_ENROLLED"] }
    ],
    "procurementReference": "PO-2025-IT-00842",
    "preferredDeliveryWindow": "Q2 2025"
  }
}
```

---

## 3. Organisation Buyer Model

### `buyerType` on `Customer`

The `Customer` typedef now includes:
- `?buyerType:String` — `INDIVIDUAL` or `ORGANIZATION`
- `?organizationBuyer:OrganizationBuyer` — populated when `buyerType = ORGANIZATION`

This is backward compatible — existing leads without these fields are treated as individual consumer leads.

### `OrganizationBuyer` Fields

| Field | Type | Description |
|---|---|---|
| `companyName` | `String` | **Required** when buyerType = ORGANIZATION |
| `companyRegistrationNumber` | `String` | National company registry number |
| `taxIdentificationNumber` | `String` | VAT / EIN / GST / TIN |
| `industryCode` | `String` | NAICS / SIC / ISIC code |
| `companySize` | `String` | `SME` \| `MID_MARKET` \| `ENTERPRISE` \| `GOVERNMENT` \| `NGO` |
| `existingFleetSize` | `Int` | Current number of assets operated |
| `procurementContact` | `ProcurementContact` | Named procurement officer |
| `governmentEntity` | `Bool` | `true` for public sector buyers |
| `procurementMethodology` | `String` | `TENDER` \| `DIRECT_AWARD` \| `FRAMEWORK` \| `RFP` \| `CONSORTIUM` |
| `existingRelationship` | `String` | `NEW_CUSTOMER` \| `RENEWAL` \| `EXPANSION` |
| `preferredSupplierStatus` | `Bool` | Vendor is on buyer's preferred list |
| `budgetApprovalStatus` | `String` | `APPROVED` \| `PENDING` \| `CONTINGENT` |

### Validation Rules
- When `buyerType = ORGANIZATION`, an `organizationBuyer` block is recommended (WARNING if absent)
- `companyName` is required within `organizationBuyer`
- `procurementContact.email` must be valid RFC 5322 format
- `procurementContact.firstName` and `lastName` are required when the block is provided
- Government entities (`governmentEntity: true`) should include `procurementMethodology` or `procurementFinancing` (WARNING if both absent)
- `companySize` must be one of the five allowed values

### Example — Government Fleet Lead (Trains)

```json
{
  "customer": {
    "firstName": "Sarah",
    "lastName": "Chen",
    "emailAddress": "s.chen@transport.gov.sg",
    "buyerType": "ORGANIZATION",
    "organizationBuyer": {
      "companyName": "Land Transport Authority Singapore",
      "companySize": "GOVERNMENT",
      "governmentEntity": true,
      "procurementMethodology": "TENDER",
      "existingFleetSize": 840,
      "procurementContact": {
        "firstName": "Sarah",
        "lastName": "Chen",
        "title": "Director, Rolling Stock",
        "email": "s.chen@transport.gov.sg",
        "department": "Engineering & Infrastructure"
      }
    }
  }
}
```

---

## 4. Generic Asset Identifier

New optional fields added to the `Vehicle` typedef (applicable to all asset classes):

| Field | Type | Description |
|---|---|---|
| `assetSerialNumber` | `String` | Universal serial / registration number |
| `serialNumberFormat` | `String` | Format type (see table below) |
| `configurationCode` | `String` | OEM/vendor configuration or variant code |
| `operatingHours` | `Float` | Flight hours, engine hours, undercarriage hours |
| `maintenanceCycleStatus` | `String` | `ON_SCHEDULE` \| `OVERDUE` \| `IN_MAINTENANCE` \| `QUARANTINED` |

### `serialNumberFormat` Values

| Value | Description | Example |
|---|---|---|
| `VIN` | Vehicle Identification Number (automotive) | `1HGCM82633A123456` |
| `MSN` | Manufacturer Serial Number (aviation) | `36553` (Boeing MSN) |
| `TAIL_NUMBER` | Aircraft registration / tail number | `G-BOAC` |
| `UIC` | UIC rolling stock number (rail) | `91 84 1440 001-3 GB-ANG` |
| `IMO` | IMO ship identification number (maritime) | `9074729` |
| `IMEI` | International Mobile Equipment Identity (phones) | `354678901234567` |
| `SERVICE_TAG` | Vendor service tag (laptops, servers) | `7Q3K2V1` |
| `CUSTOM` | Custom / proprietary format | — |

---

## 5. Industry Specification Blocks

Four new optional specification blocks added to `Vehicle` (parallel to `evSpecifications`):

### `AviationSpecifications`
Applicable when `assetClass = AVIATION`.

Key fields: `drivetrainType`, `icaoTypeDesignator`, `tailNumber`, `mtowKg`, `seatingConfiguration`, `rangeKm`, `engineCount`, `engineModel`, `cabinWidth` (`NARROWBODY | WIDEBODY | REGIONAL | VIP`), `freightCapacityM3`, `icaoAircraftCategory` (`L | M | H | J`), `airworthinessCertNumber`, `avionicsStandard`

### `RailSpecifications`
Applicable when `assetClass = RAIL`.

Key fields: `unitType` (`LOCOMOTIVE | EMU | DMU | LRV | FREIGHT_WAGON | COACH | HST`), `trackGaugeM`, `tractionType` (`ELECTRIC_25KV | ELECTRIC_15KV | ELECTRIC_750V_DC | DIESEL | HYDROGEN | DUAL`), `maxSpeedKph`, `seatingCapacity`, `payloadTonnes`, `axleLoadTonnes`, `uicFleetNumber`, `multipleUnitCompatible`, `fleetLength`, `airConditioned`

### `MaritimeSpecifications`
Applicable when `assetClass = MARITIME`.

Key fields: `vesselType` (`CARGO | CONTAINER | TANKER | RO_RO | PASSENGER_FERRY | CRUISE | YACHT | PATROL | OFFSHORE`), `grossTonnage`, `deadweightTonnage`, `imoNumber`, `flagState`, `classificationSociety` (`LR | DNV | BV | ABS | RINA | CCS | NK`), `propulsionType`, `passengerCapacity`, `cargoCapacityTeu`, `hullMaterial`, `iceClass`, `buildYear`

### `TechnologySpecifications`
Applicable when `assetClass = TECHNOLOGY` or `TELECOM`.

Key fields: `deviceCategory` (`SMARTPHONE | TABLET | LAPTOP | DESKTOP | SERVER | NETWORK_EQUIPMENT | WEARABLE | IOT_DEVICE | STORAGE | PRINTER | DISPLAY | CUSTOM`), `manufacturer`, `productLine`, `storageGb`, `ramGb`, `processorModel`, `screenSizeInch`, `connectivity` (array), `operatingSystem`, `imeiNumber`, `serviceTag`, `mdmCompatible`, `enterpriseSecurityCertified`, `warrantyYears`, `bulkLicensingAvailable`, `accessoryBundle`

---

## 6. Generic Part-Exchange (`partExchange`)

Added as `?partExchange:PartExchange` on the `Lead` typedef. Works alongside the existing `?tradeIn` block for backward compatibility.

Use this block for any asset being traded in or disposed of as part of a new acquisition — cars, aircraft, a handset fleet, or decommissioned servers.

### `PartExchange` Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `assetType` | `String` | **Yes** | `VEHICLE \| AIRCRAFT \| TRAIN \| VESSEL \| EQUIPMENT \| TECHNOLOGY \| OTHER` |
| `quantity` | `Int` | **Yes** | Number of units being traded (usually 1; may be > 1 for fleet trade-ins) |
| `assetMake` | `String` | No | Manufacturer / brand |
| `assetModel` | `String` | No | Model designation |
| `assetYear` | `Int` | No | Year of manufacture |
| `serialNumber` | `String` | No | VIN / MSN / IMO / IMEI / service tag |
| `currentOwnerHours` | `Float` | No | Operating hours |
| `odometer` | `Int` | No | Mileage for wheeled assets |
| `conditionGrade` | `String` | No | `EXCELLENT \| GOOD \| FAIR \| POOR \| FOR_PARTS \| FOR_RECYCLING` |
| `estimatedValue` | `Float` | No | Assessed value |
| `currency` | `String` | No | ISO 4217 |
| `estimatedValueBasis` | `String` | No | `BOOK \| MARKET \| AS_IS \| CMV \| INSURERS` |
| `regulatoryStatus` | `String` | No | e.g. `AIRWORTHY \| SEAWORTHY \| UNSERVICEABLE` |
| `intendedDisposition` | `String` | No | `TRADE_IN \| PART_OUT \| DONATE \| SCRAP \| RECYCLE \| AUCTION` |

---

## 7. B2B Procurement Financing (`procurementFinancing`)

Added as `?procurementFinancing:ProcurementFinancing` on the `Lead` typedef. Extends the existing consumer `?financing` block for B2B and government deal structures.

### `procurementType` Values

| Value | Typical Use |
|---|---|
| `PURCHASE_ORDER` | Standard corporate PO |
| `TENDER` | Competitive government / public sector tender |
| `FRAMEWORK_CONTRACT` | UK/EU public framework or approved supplier list |
| `DIRECT_LEASE` | Operating lease or financial lease |
| `SALE_LEASEBACK` | Asset sold then leased back |
| `POWER_BY_THE_HOUR` | Aviation PBH engine/airframe contracts |
| `BOND_FINANCE` | Project bond or capital market financing |
| `EXPORT_CREDIT_AGENCY` | ECA-backed (US EXIM, UKEF, Coface, BPI France) |
| `GRANT` | Public grant / subsidy funding |
| `DEVICE_AS_A_SERVICE` | Managed hardware subscription (smartphones, laptops) |
| `SUBSCRIPTION` | Generic subscription / rental model |

### Example — ECA-Backed Aircraft Deal

```json
{
  "procurementFinancing": {
    "procurementType": "EXPORT_CREDIT_AGENCY",
    "leaseTerm": 144,
    "exportCreditAgency": "US_EXIM",
    "tenderReference": "RFP-2025-A320NEO-12",
    "deliveryCondition": "DDP",
    "escrowRequired": true,
    "downPaymentPct": 15.0,
    "currency": "USD",
    "progressPayments": [
      { "milestoneDescription": "Contract signature", "paymentPct": 2.0, "dueDate": "2025-06-01" },
      { "milestoneDescription": "First delivery", "paymentPct": 13.0, "dueDate": "2026-03-15" }
    ]
  }
}
```

### Example — Device-as-a-Service (Phones)

```json
{
  "procurementFinancing": {
    "procurementType": "DEVICE_AS_A_SERVICE",
    "leaseTerm": 36,
    "perUnitMonthlyFee": 42.50,
    "currency": "USD",
    "frameworkContractId": "GOVT-DaaS-2025-MOBILE"
  }
}
```

---

## 8. Organisation Registry Expansion

### New `OrgType` Values

| Value | Description |
|---|---|
| `FLEET_OPERATOR` | Organisation managing a fleet of assets |
| `AIRLINE` | Commercial airline or cargo carrier |
| `RAIL_OPERATOR` | Train operating company or freight rail operator |
| `MARITIME_OPERATOR` | Shipping line, ferry operator, port authority |
| `LESSOR` | Asset lessor (aircraft lessor, vehicle leasing company) |
| `MRO_PROVIDER` | Maintenance, Repair & Overhaul organisation |
| `PROCUREMENT_BROKER` | Independent procurement / sourcing broker |
| `EXPORT_CREDIT_AGENCY` | Governmental ECA (US EXIM, UKEF, Coface) |
| `TRANSIT_AUTHORITY` | Public transport authority (TfL, BART, SNCF) |
| `TECHNOLOGY_VENDOR` | Technology OEM or value-added reseller |
| `ENTERPRISE_BUYER` | Large corporate or government buyer of any goods |
| `TELECOM_OPERATOR` | Mobile network operator or telco |

### `industryVertical` on `OrganizationRecord`

New optional field `?industryVertical:Array<String>` added to `OrganizationRecord`.

Contains the asset class names this organisation operates in, e.g.:
```json
{ "industryVertical": ["AVIATION", "MARITIME"] }
```

Allows routing systems and lead aggregators to filter organisations by their active verticals.

---

## 11. Validation Flexibility

LEX validation is designed to be **configurable per product type**. A strict validation model appropriate for an established automotive dealer integration is often too burdensome for a new aviation integration or a pilot healthcare deployment.

### `validationStrictness` on `ProductTypeRecord`

Each product type in the registry can declare a `validationStrictness` level:

| Level | Behaviour |
|---|---|
| `PERMISSIVE` | All business rule violations produce `WARNING` instead of `ERROR`. Useful during onboarding or for exploratory integrations. |
| `STANDARD` | Fields declared in `fieldRequirements.requiredLeadFields` / `requiredAssetFields` produce `ERROR`; recommended fields produce `WARNING`. **This is the default.** |
| `STRICT` | Required **and** recommended fields produce `ERROR`. Any additional field gaps produce `WARNING`. |

Query via `ProductRegistry.getValidationStrictness(productType)`.

### `fieldRequirements` on `ProductTypeRecord`

Each product type can declare its own field-level requirements:

```haxe
typedef FieldRequirements = {
  var ?requiredLeadFields:Array<String>;        // Lead fields that must be present
  var ?recommendedLeadFields:Array<String>;     // Trigger WARNING if absent
  var ?requiredAssetFields:Array<String>;       // Vehicle/asset fields that must be present
  var ?recommendedAssetFields:Array<String>;    // Trigger WARNING if absent in asset record
}
```

Query via `ProductRegistry.getFieldRequirements(productType)`.

### Example — registering a product type with custom strictness

```haxe
var reg = new ProductRegistry();
reg.registerProductType({
  productType:          "AIRCRAFT_NEW",
  assetClass:           AVIATION,
  displayName:          "New Aircraft",
  validationStrictness: "STRICT",
  fieldRequirements: {
    requiredLeadFields:    ["customer.emailAddress", "fleetOrder.quantity"],
    requiredAssetFields:   ["assetSerialNumber", "aviationSpecifications"],
    recommendedAssetFields:["aviationSpecifications.icaoTypeDesignator",
                            "aviationSpecifications.mtowKg"]
  }
});

// In a validator:
var strictness = reg.getValidationStrictness("AIRCRAFT_NEW"); // "STRICT"
var reqs = reg.getFieldRequirements("AIRCRAFT_NEW");
// reqs.requiredAssetFields → ["assetSerialNumber", "aviationSpecifications"]
```

### Design principle: loose by default, configurable to strict

- All new industry verticals default to `STANDARD` strictness unless explicitly set
- Individual deployments can call `registerProductType()` to override with `PERMISSIVE` (during pilot) then tighten to `STRICT` once proven
- The `requiresVin` flag on `ProductTypeRecord` is a legacy convenience shorthand; prefer `fieldRequirements.requiredAssetFields` for new product types

---

## 9. Backward Compatibility

All changes are fully additive (`?` optional fields):

- Existing automotive leads with no `buyerType` or `fleetOrder` are treated as individual consumer automotive leads
- Existing `tradeIn` block is unchanged; use the new `partExchange` block for non-automotive trade-ins
- All existing `AssetClass` enum values and product types are unchanged
- All existing `OrgType` values are unchanged
- All existing validation rules continue to apply unchanged

---

## 10. Representative End-to-End Examples

### Government Train Fleet (Singapore LTA)

```json
{
  "lex": {
    "header": {
      "messageId": "f1a2b3c4-d5e6-7890-abcd-ef1234567890",
      "messageType": "LEAD",
      "version": "1.0",
      "timestamp": "2025-06-01T08:00:00Z",
      "senderId": "LTA-SG"
    },
    "payload": {
      "lead": {
        "leadId": "LEAD-2025-RAIL-001",
        "leadType": "FLEET",
        "status": "EXPRESSED_INTEREST",
        "source": "DIRECT",
        "leadCreatedDate": "2025-06-01T08:00:00Z",
        "leadVersion": 1,
        "customer": {
          "firstName": "Sarah",
          "lastName": "Chen",
          "emailAddress": "s.chen@lta.gov.sg",
          "buyerType": "ORGANIZATION",
          "organizationBuyer": {
            "companyName": "Land Transport Authority Singapore",
            "companySize": "GOVERNMENT",
            "governmentEntity": true,
            "procurementMethodology": "TENDER",
            "existingFleetSize": 840,
            "procurementContact": {
              "firstName": "Sarah",
              "lastName": "Chen",
              "title": "Director, Rolling Stock",
              "email": "s.chen@lta.gov.sg"
            }
          }
        },
        "desiredProduct": {
          "productType": "PASSENGER_TRAIN",
          "assetClass": "RAIL",
          "manufacturers": ["Alstom", "CRRC", "Siemens Mobility"]
        },
        "fleetOrder": {
          "quantity": 120,
          "currency": "USD",
          "mixedConfigAllowed": false,
          "procurementReference": "TENDER-LTA-2025-RS-042",
          "preferredDeliveryWindow": "2027–2029",
          "deliverySchedule": [
            { "quantity": 40, "targetDate": "2027-06-30", "targetLocation": "Depot A, Bishan" },
            { "quantity": 40, "targetDate": "2028-06-30", "targetLocation": "Depot A, Bishan" },
            { "quantity": 40, "targetDate": "2029-06-30", "targetLocation": "Depot B, Ulu Pandan" }
          ]
        },
        "procurementFinancing": {
          "procurementType": "TENDER",
          "leaseTerm": 300,
          "tenderReference": "TENDER-LTA-2025-RS-042",
          "currency": "SGD",
          "escrowRequired": true
        }
      }
    }
  }
}
```

### Enterprise Smartphone Fleet (Corporate IT)

```json
{
  "lex": {
    "header": {
      "messageId": "a1b2c3d4-e5f6-7890-abcd-1234567890ef",
      "messageType": "LEAD",
      "version": "1.0",
      "timestamp": "2025-06-01T08:00:00Z",
      "senderId": "CORP-IT-ACME"
    },
    "payload": {
      "lead": {
        "leadId": "LEAD-2025-TECH-007",
        "leadType": "FLEET",
        "status": "SHOPPING",
        "source": "DIRECT",
        "leadCreatedDate": "2025-06-01T08:00:00Z",
        "leadVersion": 1,
        "customer": {
          "firstName": "James",
          "lastName": "Okafor",
          "emailAddress": "j.okafor@acme.com",
          "buyerType": "ORGANIZATION",
          "organizationBuyer": {
            "companyName": "ACME Corporation",
            "companySize": "ENTERPRISE",
            "governmentEntity": false,
            "existingFleetSize": 2000,
            "procurementMethodology": "DIRECT_AWARD",
            "procurementContact": {
              "firstName": "James",
              "lastName": "Okafor",
              "title": "VP IT Procurement",
              "email": "j.okafor@acme.com"
            }
          }
        },
        "desiredProduct": {
          "productType": "SMARTPHONE",
          "assetClass": "TECHNOLOGY",
          "manufacturers": ["Apple", "Samsung"],
          "typeSpecificPreferences": {
            "mdmRequired": true,
            "osPreference": "iOS",
            "minStorageGb": 256
          }
        },
        "fleetOrder": {
          "quantity": 2500,
          "unitBudgetCapUsd": 1100,
          "currency": "USD",
          "mixedConfigAllowed": false,
          "procurementReference": "PO-2025-ACME-MOBILE-001",
          "preferredDeliveryWindow": "Q3 2025"
        },
        "procurementFinancing": {
          "procurementType": "DEVICE_AS_A_SERVICE",
          "leaseTerm": 36,
          "perUnitMonthlyFee": 38.00,
          "currency": "USD"
        }
      }
    }
  }
}
```
