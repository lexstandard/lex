<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright (c) 2026 LEX Lead Exchange Standard Contributors -->
<!-- Canonical specification: https://lexstandard.org -->

# LEX - Product Type System & Generic Asset Model

## Overview

LEX is designed to support **any exchangeable product/asset**, not just automotive vehicles. This document defines the generic product model that accommodates:

- Automobiles (cars, SUVs, trucks, vans)
- Motorcycles, scooters, electric scooters
- Recreational vehicles (RVs, boats, aircraft)
- Commercial vehicles & equipment
- Any future product category an organization may need

---

## 1. Product Abstraction Model

### 1.1 Generic Product Structure

Instead of a fixed "Vehicle" entity, LEX uses a **flexible Product abstraction**:

```
Product (Generic)
├── Core Identification
│   ├── productId (unique)
│   ├── productType (VEHICLE, SCOOTER, RV, EQUIPMENT, etc.)
│   └── assetClass (AUTOMOTIVE, MOBILITY, RECREATIONAL, COMMERCIAL)
│
├── Specification (varies by type)
│   ├── Manufacturer Info (make, brand)
│   ├── Model Information
│   ├── Year/Production Date
│   ├── Type-Specific Attributes
│   │   ├── Engine/Motor specifications
│   │   ├── Dimensions & capacity
│   │   ├── Performance specs
│   │   └── Features & capabilities
│   └── Pricing
│
├── Organization-Specific Details
│   ├── OEM product code
│   ├── DMS product reference
│   ├── Dealer inventory code
│   └── Platform listing ID
│
└── Condition & Availability
    ├── Status (NEW, USED, CERTIFIED, ETC)
    ├── Inventory location
    ├── Availability window
    └── Special restrictions
```

### 1.2 Product Type Taxonomy

```
ProductType Enum:
├─ VEHICLE
│  ├─ SEDAN (4-door car)
│  ├─ COUPE (2-door car)
│  ├─ SUV (sport utility)
│  ├─ CROSSOVER (car-based utility)
│  ├─ TRUCK (light/heavy pickup)
│  ├─ VAN (passenger/cargo)
│  ├─ MINIVAN (family van)
│  ├─ WAGON (extended cargo car)
│  ├─ HATCHBACK (compact liftgate)
│  ├─ CONVERTIBLE (topless)
│  ├─ COMMERCIAL_VEHICLE (commercial use)
│  └─ OTHER_VEHICLE
│
├─ TWO_WHEELER
│  ├─ MOTORCYCLE (engine-powered bike)
│  ├─ SCOOTER (small engine bike)
│  ├─ ELECTRIC_SCOOTER (e-scooter)
│  ├─ ELECTRIC_BIKE (e-bike)
│  ├─ MOPED (bicycle hybrid)
│  └─ OTHER_TWO_WHEELER
│
├─ RECREATIONAL
│  ├─ RV (recreational vehicle)
│  ├─ BOAT (water vessel)
│  ├─ ATV (all-terrain)
│  ├─ SNOWMOBILE (snow vehicle)
│  ├─ AIRCRAFT (small aircraft)
│  ├─ DRONE (unmanned aerial)
│  ├─ GOLF_CART (utility)
│  └─ OTHER_RECREATIONAL
│
├─ COMMERCIAL
│  ├─ HEAVY_TRUCK (semi, dump truck)
│  ├─ LIGHT_COMMERCIAL (work van)
│  ├─ CONSTRUCTION_EQUIPMENT
│  ├─ AGRICULTURAL_EQUIPMENT
│  ├─ MATERIAL_HANDLING
│  └─ OTHER_COMMERCIAL
│
├─ MICROMOBILITY
│  ├─ ELECTRIC_SCOOTER (shared/owned)
│  ├─ BIKE_SHARE (bicycle)
│  ├─ KICK_SCOOTER
│  └─ SKATEBOARD_ELECTRIC
│
├─ FLEET
│  ├─ RENTAL_CAR
│  ├─ CORPORATE_FLEET
│  ├─ FRANCHISE_POOL
│  └─ SHARED_MOBILITY
│
└─ SPECIALTY
   ├─ VINTAGE_COLLECTOR
   ├─ CUSTOM_BUILD
   ├─ GOVERNMENT_VEHICLE
   └─ OTHER_SPECIALTY
```

### 1.3 Asset Class Grouping

```json
{
  "assetClass": {
    "AUTOMOTIVE": {
      "description": "Traditional and electric automobiles",
      "types": ["VEHICLE", "COMMERCIAL_VEHICLE"],
      "regulations": ["EPA", "NHTSA", "STATE_REGISTRATION"]
    },
    
    "MOBILITY": {
      "description": "Personal mobility devices",
      "types": ["TWO_WHEELER", "MICROMOBILITY"],
      "regulations": ["LOCAL_HELMET_LAWS", "TRAFFIC_RULES"],
      "characteristics": {
        "maxOccupants": 2,
        "licenseRequired": [true, false],
        "insuranceRequired": [true, false]
      }
    },
    
    "RECREATIONAL": {
      "description": "Recreation and leisure vehicles",
      "types": ["RECREATIONAL", "SPECIALTY"],
      "regulations": ["BOATING_LICENSE", "PILOT_LICENSE", "PARK_REGULATIONS"],
      "seasonal": true
    },
    
    "COMMERCIAL": {
      "description": "Commercial and industrial equipment",
      "types": ["COMMERCIAL", "FLEET"],
      "regulations": ["DOT", "OSHA", "INDUSTRY_SPECIFIC"],
      "bUsiness": true
    }
  }
}
```

---

## 2. Generic Product Specification

### 2.1 Universal Product Fields

Every product has these **common core fields**:

```json
{
  "product": {
    "productId": "PROD-2026-001234",        // Unique product ID
    "productType": "ELECTRIC_SCOOTER",      // Type (from taxonomy)
    "assetClass": "MOBILITY",               // Class grouping
    
    "coreSpecification": {
      "manufacturer": "Xiaomi",             // Brand/brand name
      "model": "Mi 3",                      // Model identifier
      "year": 2026,                         // Year/vintage
      "generationCode": "GEN3",             // Generation/variant
      "condition": "NEW",                    // NEW, USED, CERTIFIED, REFURBISHED
      
      // Type-specific naming
      "typeSpecificId": {
        "vin": "XMI2026ABC123DEF",         // VIN (cars only) - optional
        "serialNumber": "SN-2026-999-ABC",  // Universal serial
        "modelCode": "MI-3-2026-BLK",       // Model code
        "sku": "SKU-MI3-2026"               // Stock keeping unit
      },
      
      "description": "Xiaomi Mi 3 Electric Scooter (2026 Model)",
      "imageUrl": ["https://...", "https://..."],
      "videoUrl": "https://..."
    },
    
    "typeSpecificAttributes": {
      // These change based on productType
      // Examples below...
    },
    
    "pricing": {
      "msrp": 299.99,
      "dealerCost": 200.00,
      "currentPrice": 299.99,
      "currency": "USD",
      "specialOffers": [
        {
          "description": "First-time buyer discount",
          "discount": 50,
          "expirationDate": "2026-04-30"
        }
      ]
    },
    
    "availability": {
      "status": "IN_STOCK",                 // IN_STOCK, BACKORDER, DISCONTINUED
      "location": "DEALER-ABC-MAIN",       // Where it's located
      "quantity": 5,                        // Available units
      "dateAvailable": "2026-03-23",       // When available
      "holdUntil": null                     // Hold for customer
    },
    
    "organizationProductIds": {
      "manufacturerCode": "XIAOMI-MI3-2026",
      "dmsReference": "CDK-PROD-555-MI3",
      "dealerInventoryCode": "ABC-SCOOTER-001",
      "platformListingId": "AMAZON-B0123456789"
    }
  }
}
```

### 2.2 Type-Specific Attributes by Product Type

#### For Automobiles (Vehicles)

```json
{
  "typeSpecificAttributes": {
    "automation": "VEHICLE",
    
    "engineSpecification": {
      "fuelType": "HYBRID",           // GASOLINE, DIESEL, HYBRID, ELECTRIC, HYDROGEN
      "engineDisplacement": 2.5,      // Liters (null for EV)
      "horsepower": 203,              // HP
      "torque": 184,                  // lb-ft
      "transmission": "AUTOMATIC",    // AUTOMATIC, MANUAL, CVT
      "driveType": "AWD"              // FWD, RWD, AWD
    },
    
    "dimensions": {
      "length": 191,                  // Inches
      "width": 72,
      "height": 57,
      "wheelbase": 112,
      "bodyType": "SEDAN"
    },
    
    "capacity": {
      "passengers": 5,
      "cargoVolume": 15.1,           // Cubic feet
      "towingCapacity": 1500         // Pounds (if applicable)
    },
    
    "performance": {
      "mpgCity": 28.5,
      "mpgHighway": 39.2,
      "mpgCombined": 33,
      "acceleration0to60": 8.2,      // Seconds
      "topSpeed": 112,               // MPH
      "electricRange": 650,          // Miles (for PHEV/EV)
      "fuelTankCapacity": 14.5       // Gallons
    },
    
    "features": [
      "ALL_WHEEL_DRIVE",
      "LEATHER_INTERIOR",
      "SUNROOF",
      "NAVIGATION_SYSTEM",
      "BACKUP_CAMERA",
      "APPLE_CARPLAY",
      "COLLISION_AVOIDANCE"
    ],
    
    "safetyRating": {
      "nhtsa": 5,                    // 5-star rating
      "iihs": "GOOD"                 // TOP_SAFETY_PICK, GOOD, ACCEPTABLE, POOR
    },
    
    "warranty": {
      "basic": 36,                   // Months
      "powertrain": 60,              // Months
      "hybridBattery": 96            // Months (for hybrid)
    }
  }
}
```

#### For Electric Scooters

```json
{
  "typeSpecificAttributes": {
    "productType": "ELECTRIC_SCOOTER",
    
    "motorSpecification": {
      "motorType": "BRUSHLESS_DC",
      "motorPower": 250,             // Watts
      "maxTorque": 5.2,              // Nm (Newton-meters)
      "motorPlacement": "HUB_REAR"   // HUB_FRONT, HUB_REAR, DIRECT_DRIVE
    },
    
    "battery": {
      "type": "LITHIUM_ION",
      "capacity": 36,                // Wh (Watt-hours)
      "voltage": 36,                 // Volts
      "chargingTime": 240,           // Minutes
      "chargesPerCycle": 1000
    },
    
    "performance": {
      "maxSpeed": 15.5,              // MPH
      "range": 15,                   // Miles per charge
      "climbGrade": 15,              // Percent (hill climbing)
      "waterResistance": "IPX4"      // IP rating
    },
    
    "dimensions": {
      "weight": 26.5,                // Pounds
      "lengthFolded": 39,            // Inches
      "lengthUnfolded": 44,          // Inches
      "width": 8.3,
      "wheelDiameter": 8.5,          // Inches
      "standingPlatformWidth": 6     // Inches
    },
    
    "capacity": {
      "maxWeight": 265,              // Pounds (rider + cargo)
      "standType": "DOUBLE_KICKSTAND" // SINGLE, DOUBLE
    },
    
    "features": [
      "FOLDABLE",
      "LED_HEADLIGHT",
      "LED_TAILLIGHT",
      "CRUISE_CONTROL",
      "SMARTPHONE_APP",
      "REGENERATIVE_BRAKING",
      "DUAL_BRAKES"
    ],
    
    "safety": {
      "brakeType": "MECHANICAL_DISC_DUAL",
      "brakingDistance": 9.8,        // Feet (from 15 MPH)
      "reflectors": true,
      "lightingSystem": "LED"
    },
    
    "warranty": {
      "motor": 12,                   // Months
      "battery": 12,                 // Months
      "frame": 24                    // Months
    },
    
    "certification": {
      "ce": true,                    // EU safety
      "fcc": true,                   // US electronics
      "iceee": true                  // Electric safety
    }
  }
}
```

#### For Motorcycles

```json
{
  "typeSpecificAttributes": {
    "productType": "MOTORCYCLE",
    
    "engineSpecification": {
      "fuelType": "GASOLINE",        // Fuel type
      "displacement": 750,           // CC (cubic centimeters)
      "horsepower": 75,
      "torque": 57,                  // lb-ft
      "cylinders": 2,
      "transmission": "MANUAL"       // MANUAL, AUTOMATIC, DCT
    },
    
    "dimensions": {
      "seatHeight": 32,              // Inches (from ground)
      "overallLength": 82,           // Inches
      "wheelbase": 56,               // Inches
      "dryWeight": 380,              // Pounds (without fuel/fluids)
      "wtWeight": 410,               // Pounds (with fuel/fluids)
      "fuelTankCapacity": 4.2        // Gallons
    },
    
    "performance": {
      "maxSpeed": 130,               // MPH
      "acceleration0to60": 3.2,      // Seconds
      "mpg": 45,                     // Average highway MPG
      "range": 140                   // Miles (with full tank)
    },
    
    "features": [
      "ABS",
      "TRACTION_CONTROL",
      "ASSIST_SLIPPER_CLUTCH",
      "ASSIST_COMFORT_SEAT",
      "LED_HEADLIGHT",
      "QUICKSHIFTER_READY"
    ],
    
    "braking": {
      "frontBrake": "RADIAL_CALIPER",
      "rearBrake": "SINGLE_PISTON",
      "brakeDisc": 320,              // MM front rotor
      "absSystemVersion": "ABS_CORNERING_V2"
    },
    
    "licensing": {
      "licenseRequired": true,
      "licenseCategoryUSA": "M",     // US motorcycle class
      "helmetRequired": true,
      "minAge": 16                   // Minimum age requirement
    }
  }
}
```

#### For RVs (Recreational Vehicles)

```json
{
  "typeSpecificAttributes": {
    "productType": "RV",
    "rvType": "CLASS_C",             // CLASS_A, CLASS_B, CLASS_C, TRAVEL_TRAILER, FIFTH_WHEEL
    
    "engineSpecification": {
      "fuelType": "DIESEL",          // Fuel for RV engine
      "displacement": 6.7,           // Liters
      "horsepower": 320,
      "torque": 700,                 // lb-ft
      "transmission": "AUTOMATIC"    // Usually automatic
    },
    
    "dimensions": {
      "length": 32,                  // Feet
      "width": 8,                    // Feet
      "height": 12,                  // Feet
      "freshWaterCapacity": 75,      // Gallons
      "greyWaterCapacity": 50,       // Gallons
      "blackWaterCapacity": 40,      // Gallons
      "propaneCapacity": 30          // Pounds
    },
    
    "sleeping": {
      "maxSleepers": 6,
      "bedrooms": 1,
      "bathrooms": 1,
      "bedsConfiguration": ["MASTER_QUEEN", "BUNK_BEDS"]
    },
    
    "living": {
      "kitchenette": true,
      "bathWithShower": true,
      "sittingArea": true,
      "diningArea": true,
      "entertainmentSystem": "SMART_TV"
    },
    
    "utilities": {
      "hvacSystem": "HEAT_AND_AC",
      "heatingBtu": 30000,
      "coolingBtu": 15000,
      "waterHeater": "TANK_STYLE",   // TANK_STYLE, TANKLESS
      "batteryBank": 800,            // Amp-hours
      "generatorKw": 7.5
    },
    
    "features": [
      "FULL_HOOKUP_CAPABLE",
      "BACKUP_CAMERA",
      "LEVELING_SYSTEM_AUTO",
      "WIFI_HOTSPOT",
      "SECURITY_SYSTEM"
    ],
    
    "towing": {
      "towingCapacity": 12000,       // Pounds
      "coupler": "GOOSENECK_HITCH"
    },
    
    "warranty": {
      "structural": 24,              // Months
      "appliances": 12,              // Months
      "chassis": 24                  // Months
    }
  }
}
```

#### For Commercial Equipment

```json
{
  "typeSpecificAttributes": {
    "productType": "CONSTRUCTION_EQUIPMENT",
    "equipmentCategory": "EXCAVATOR", // EXCAVATOR, BULLDOZER, LOADER, COMPACTOR, etc.
    
    "engineSpecification": {
      "fuelType": "DIESEL",
      "displacement": 4.5,
      "horsepower": 100,
      "torque": 280                  // lb-ft
    },
    
    "dimensions": {
      "length": 20,                  // Feet
      "width": 10,                   // Feet
      "height": 11,                  // Feet (with boom at rest)
      "weight": 45000,               // Pounds
      "groundClearance": 1.2         // Feet
    },
    
    "operationalSpecs": {
      "bucketCapacity": 1.2,         // Cubic yards
      "maxDigDepth": 20,             // Feet
      "maxReach": 25,                // Feet
      "swingSpeed": 10,              // RPM
      "maxGrade": 35                 // Percent
    },
    
    "features": [
      "THUMB_ATTACHMENT",
      "INTEGRATED_CAMERA",
      "TELEMATICS",
      "GPS_MONITORING",
      "IDLER_COUNTERWEIGHT"
    ]
  }
}
```

---

## 3. Lead Model for Multiple Product Types

Instead of `desiredVehicle`, LEX uses generic `desiredProduct`:

```json
{
  "lead": {
    "leadId": "LEAD-2026-001234",
    "status": "EXPRESSED_INTEREST",
    
    "desiredProduct": {
      "productType": "ELECTRIC_SCOOTER",  // or VEHICLE, MOTORCYCLE, RV, etc.
      "assetClass": "MOBILITY",
      
      // Core preferences that work for ANY product type
      "manufacturerPreferences": {
        "make": ["Xiaomi", "Segway"],   // Brand
        "excludedMakes": []
      },
      
      "modelPreferences": {
        "models": ["Mi 3", "Ninebot Max"],
        "excludedModels": [],
        "yearRange": {
          "min": 2024,
          "max": 2026
        }
      },
      
      // Type-agnostic features
      "features": {
        "desiredFeatures": [
          "FOLDABLE",
          "LED_LIGHTS",
          "LONG_RANGE"
        ],
        "excludedFeatures": [
          "HEAVY"
        ]
      },
      
      "priceRange": {
        "min": 200,
        "max": 500,
        "currency": "USD"
      },
      
      "specificProductRequirements": {
        // Type-specific nested data
        "forElectricScooter": {
          "minRange": 10,              // Miles
          "maxWeight": 30,             // Lbs
          "portability": "MUST_FOLD"
        },
        "forVehicle": {
          "fuelType": ["HYBRID", "ELECTRIC"],
          "minHorsepower": 150
        },
        "forMotorcycle": {
          "maxEngineSize": 1000,       // CC
          "requiresAutomaticTransmission": true
        }
      },
      
      "tradeInEligibility": {
        "acceptsTradeIn": true,
        "tradeInType": "SAME_CATEGORY",  // SAME_CATEGORY, ANY, NONE
        "minTradeInValue": null
      },
      
      "deliveryType": "IMMEDIATE"
    },
    
    "tradeIn": {
      "hasTradeIn": true,
      "productType": "ELECTRIC_SCOOTER",  // Same type or different
      "make": "Segway",
      "model": "Ninebot ES2",
      "year": 2020,
      "condition": "GOOD",
      "estimatedValue": 150
    }
  }
}
```

---

## 4. Inventory & Availability for Multiple Product Types

```json
{
  "inventory": {
    "productId": "PROD-2026-001234",
    "productType": "ELECTRIC_SCOOTER",
    "assetClass": "MOBILITY",
    
    "basicInfo": {
      "sku": "SKU-MI3-2026-BLK",
      "description": "Xiaomi Mi 3 Electric Scooter (2026 Black)",
      "quantity": 15,
      "reorderLevel": 5
    },
    
    "availability": {
      "status": "IN_STOCK",
      "locations": [
        {
          "location": "DEALER-ABC-MAIN-SHOWROOM",
          "quantity": 10,
          "display": true
        },
        {
          "location": "DEALER-ABC-WAREHOUSE",
          "quantity": 5,
          "display": false
        }
      ],
      "nextShipmentDate": null,
      "availabilityZip": "90210"     // Delivery availability
    },
    
    "pricing": {
      "msrp": 299.99,
      "dealerPrice": 299.99,
      "costs": {
        "acquisitionCost": 180,
        "displayCost": 10,
        "marketingShare": 5
      }
    },
    
    "organization": {
      "manufacturerCode": "XIAOMI-MI3-BLK-2026",
      "dmsCode": "CDK-SKU-55555"
    }
  }
}
```

---

## 5. Product Type Schema Registry

Each product type can have its own schema validation:

```json
{
  "productTypeSchemas": {
    "VEHICLE": {
      "requiredFields": ["make", "model", "year", "vin"],
      "optionalFields": ["trim", "color", "fuelType"],
      "specialFields": ["safetyRating", "warranty"]
    },
    
    "ELECTRIC_SCOOTER": {
      "requiredFields": ["motorPower", "batteryCapacity", "maxSpeed"],
      "optionalFields": ["weight", "range", "foldable"],
      "specialFields": ["certification", "waterResistance"]
    },
    
    "MOTORCYCLE": {
      "requiredFields": ["displacement", "horsepower", "seatHeight"],
      "optionalFields": ["transmission", "brakeType"],
      "specialFields": ["licensing", "abilityToRide"]
    },
    
    "RV": {
      "requiredFields": ["rvType", "length", "sleepers"],
      "optionalFields": ["bathrooms", "kitchenette"],
      "specialFields": ["campgroundCompatibility", "utilities"]
    }
  }
}
```

---

## 6. Product-Agnostic Lead Routing

How leads route differently based on product type:

```
Lead comes in with:
  productType = "ELECTRIC_SCOOTER"
  assetClass = "MOBILITY"
  
Lead Router Logic:
  ├─ Is assetClass = MOBILITY?
  │  └─ Route to MOBILITY_DEALERS
  │
  ├─ Is productType = ELECTRIC_SCOOTER?
  │  └─ Filter for dealers with SCOOTER inventory
  │
  ├─ Check financing:
  │  ├─ VEHICLE: Standard auto financing check
  │  ├─ ELECTRIC_SCOOTER: Check if financing available
  │  └─ RV: Check RV financing specialists
  │
  └─ Check regulatory:
     ├─ VEHICLE: EPA, NHTSA check
     ├─ MOTORCYCLE: License requirement
     ├─ ELECTRIC_SCOOTER: Local regulations
     └─ RV: Campground availability
```

---

## 7. Flexible Search & Subscription Filtering

Organizations can filter by product type in subscriptions:

```json
{
  "subscription": {
    "subscriptionType": "LEAD_UPDATES",
    "filters": {
      "productTypes": [
        "ELECTRIC_SCOOTER",
        "MOTORCYCLE"
      ],
      "assetClasses": ["MOBILITY"],
      "priceRange": {
        "min": 100,
        "max": 5000
      },
      "locations": ["CA", "NY", "TX"]
    }
  }
}
```

Dealer can get leads for only products they carry:

```json
{
  "dealerData": {
    "carriedProductTypes": [
      "VEHICLE",
      "VEHICLE_COMMERCIAL",
      "MOTORCYCLE"
    ],
    "excludedProductTypes": [
      "RV",
      "EQUIPMENT"
    ],
    "specialtyLines": {
      "ELECTRIC_VEHICLES": {
        "offer": true,
        "expertise": "HIGH",
        "inventory": 25
      }
    }
  }
}
```

---

## 8. Migration from Vehicle-Specific Spec

### Old Spec (ADF-style):

```json
{
  "vehicle": {
    "make": "Toyota",
    "model": "Camry",
    "year": 2026
  }
}
```

### New LEX (Product-Agnostic):

```json
{
  "product": {
    "productType": "VEHICLE",  // Flexible product type
    "assetClass": "AUTOMOTIVE", // Class grouping
    "coreSpecification": {
      "manufacturer": "Toyota",
      "model": "Camry",
      "year": 2026
    },
    "typeSpecificAttributes": {
      "engineSpecification": {...},
      "dimensions": {...}
    }
  }
}
```

**Backward Compatibility:** Systems expecting `vehicle` field can still receive it (mapped from `product` with `productType=VEHICLE`)

---

## 9. Future Product Type Examples

The system is ready for new product types **without spec changes**:

### Electric Bikes (E-Bikes)
```json
{
  "productType": "ELECTRIC_BIKE",
  "assetClass": "MOBILITY",
  "typeSpecificAttributes": {
    "motorType": "MID_DRIVE",
    "motorPower": 750,              // Watts
    "batteryType": "LITHIUM",
    "range": 50,                    // Miles
    "wheelSize": 27.5,              // Inches
    "maxWeight": 205                // Pounds user + bike
  }
}
```

### Shared Mobility Equipment
```json
{
  "productType": "BIKE_SHARE_UNIT",
  "assetClass": "MICROMOBILITY",
  "typeSpecificAttributes": {
    "dockingCapacity": 50,
    "maintenanceFrequency": "DAILY",
    "gpsTracking": true,
    "removalLock": "ELECTRONIC"
  }
}
```

### Heavy Equipment Rental
```json
{
  "productType": "TELESCOPIC_HANDLER",
  "assetClass": "COMMERCIAL",
  "typeSpecificAttributes": {
    "maxLift": 6000,                // Pounds
    "maxReach": 55,                 // Feet
    "minRentalPeriod": 1,           // Days
    "insuranceRequired": true,
    "operatorCertification": "OSHA"
  }
}
```

---

## 10. Implementation Checklist

- [ ] Define `production` object instead of fixed `vehicle`
- [ ] Create `productType` enum with all categories
- [ ] Create `assetClass` enum for grouping
- [ ] Define `typeSpecificAttributes` structure
- [ ] Create schema for each product type
- [ ] Update validators for generic product
- [ ] Update parsers to handle type variations
- [ ] Create type-specific examples
- [ ] Update documentation with all product types
- [ ] Build routing logic based on product type
- [ ] Test with multiple product types

---

**Last Updated:** March 23, 2026  
**Version:** 1.0 (Product Model Definition)
