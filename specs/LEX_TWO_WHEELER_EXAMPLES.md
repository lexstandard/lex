<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright (c) 2026 LEX Lead Exchange Standard Contributors -->
<!-- Canonical specification: https://lexstandard.org -->

# LEX - Two-Wheeler & Motorcycle Lead Examples

## Overview

This document provides comprehensive examples of LEX LEAD and LEAD_CLOSURE messages for two-wheelers, motorcycles, and other non-automobile products.

**Why This Matters:**
- Two-wheelers represent MASSIVE market, especially in India (50M+ annual sales)
- Motorcycles huge in US, Europe, Latin America
- E-scooters/E-bikes booming in urban markets
- LEX must support these equally to four-wheelers
- Same EDI spec, same routing, same reliability

---

## 1. India Two-Wheeler Market: Scooter Lead Example

### Scenario: Premium Scooter Lead from Manufacturer Site

**Context:**
- Customer visits Hero MotoCorp website
- Browses electric scooters
- Wants information on "Electric Dash" model
- Submits lead from Delhi

#### JSON-EDI LEAD Message (Scooter)

```json
{
  "LEX": {
    "header": {
      "messageId": "MSG-2026-LEAD-SCOOTER-001",
      "messageType": "LEAD",
      "version": "1.0",
      "timestamp": "2026-03-15T09:30:00Z",
      "senderId": "PLATFORM-HERO-WEBSITE-IN",
      "receiverId": "DMS-CDKGLOBAL-INDIA",
      "encryptionMethod": "TLS1.3"
    },
    "payload": {
      "lead": {
        // ===== LEAD IDENTIFICATION =====
        "leadId": "LEAD-2026-IN-HMC-001234",
        "status": "SHOPPING",
        "source": "MANUFACTURER_WEBSITE",
        
        // ===== DETAILED SOURCE INFORMATION =====
        "sourceDetail": {
          "sourceType": "MANUFACTURER_WEBSITE",
          "sourceURL": "https://heromotocorp.com/en-IN/scooters/electric-dash",
          "specificPage": "/electric-dash/leads",
          "campaignCode": "MONSOON_2026_SCOOTER_PROMO",
          "campaignName": "Monsoon 2026 Scooter Promotion",
          "deviceType": "MOBILE",
          "deviceOS": "Android",
          "browser": "Chrome",
          "submissionTimezone": "Asia/Kolkata",
          "submissionTime": "2026-03-15T09:30:00Z",
          "submissionDayOfWeek": "Sunday",
          "estimatedCustomerLocation": "Delhi",
          "languagePreference": "hi-IN",
          "leadQualityScore": 8.2,
          "formName": "ElectricScooterLeadForm_v3",
          "formCompletionTime": 180,
          "sessionId": "SESSION-2026-HERO-IN-123456",
          "countryCode": "IN"
        },
        
        // ===== CUSTOMER INFORMATION =====
        "customer": {
          "customerId": "CUST-2026-HERO-NEW-001",
          "firstName": "Rajesh",
          "lastName": "Singh",
          "emailAddress": "rajesh.singh@email.com",
          "phoneNumber": "+91-9876543210",
          "preferredContactMethod": "WHATSAPP",
          "phoneCountryCode": "IN",
          "ageRange": "25-34",
          "occupationType": "PROFESSIONAL",
          "incomeRange": "40L-60L_ANNUAL_INR",
          "maritalStatus": "MARRIED",
          "numberOfChildren": 1,
          
          "address": {
            "addressType": "RESIDENTIAL",
            "street1": "Plot 123, Sector 45",
            "street2": "Gurugram",
            "city": "Gurugram",
            "state": "Haryana",
            "postalCode": "122001",
            "countryCode": "IN",
            "coordinates": {
              "latitude": 28.4595,
              "longitude": 77.0266
            }
          },
          
          "buyingIntention": {
            "purchaseTimeline": "1-3_MONTHS",
            "budgetRange": "100k-150k_INR",
            "primaryUsageType": "DAILY_COMMUTE",
            "secondaryUsageTypes": ["WEEKEND_LEISURE", "SHORT_DISTANCE_TRAVEL"],
            "numberOfVehiclesNeeded": 1,
            "isFirstTimeVehicleBuyer": false,
            "willTradeIn": false,
            "preferredPaymentMethod": "EMI",
            "monthlyEmiCapacity": "4000-6000_INR",
            "governmentSubsidyEligible": true
          }
        },
        
        // ===== DESIRED PRODUCT: TWO-WHEELER (ELECTRIC SCOOTER) =====
        "desiredProduct": {
          "productType": "ELECTRIC_SCOOTER",        // Key: Two-wheeler type!
          "assetClass": "MOBILITY",
          
          // Core vehicle info (same for all types)
          "vehiclePreferences": {
            "preferredManufacturers": ["HERO_MOTOCORP", "BAJAJ", "ATHER"],
            "desiredModels": ["ELECTRIC_DASH", "CHETAK_ELECTRIC"],
            "desiredYear": 2026,
            "desiredColor": ["BLACK", "SILVER", "BLUE"],
            "desiredTrim": null
          },
          
          // Type-specific attributes for electric scooters
          "typeSpecificPreferences": {
            "motorPower": {
              "preferred": 4000,
              "minAcceptable": 3000,
              "maxAcceptable": 5000
            },
            "batteryCapacity": {
              "preferred": 60,
              "minAcceptable": 40,
              "maxAcceptable": 80
            },
            "range": {
              "preferred": 120,
              "minAcceptable": 100,
              "maxAcceptable": 150
            },
            "maxSpeed": {
              "preferred": 80,
              "minAcceptable": 60,
              "maxAcceptable": 100
            },
            "chargingTime": {
              "preferred": 5.5,
              "maxAcceptable": 7.0
            },
            "preferredFeatures": [
              "FAST_CHARGING",
              "APP_CONNECTIVITY",
              "GPS_TRACKING",
              "ABS_BRAKING",
              "CRUISE_CONTROL",
              "DIGITAL_DISPLAY",
              "REGENERATIVE_BRAKING"
            ],
            "waterResistance": "IPX7_OR_BETTER",
            "Weight": {
              "maxPreference": 130
            }
          },
          
          // Specific model
          "specificInterestModel": {
            "manufacturer": "Hero MotoCorp",
            "model": "Electric Dash",
            "year": 2026,
            "engineMotor": {
              "motorType": "BRUSHLESS_DC",
              "motorPower": 4000,
              "torque": 70
            },
            "battery": {
              "batteryCapacity": 60,
              "batteryType": "LITHIUM_ION",
              "chargingType": "FAST_CHARGE"
            },
            "performance": {
              "maxSpeed": 80,
              "acceleration_0_60": 6.2,
              "range": 120,
              "rangeInCity": 100
            }
          }
        },
        
        // ===== FINANCING PREFERENCES =====
        "financing": {
          "needsFinancing": true,
          "downPaymentCapacity": "20000-30000_INR",
          "preferredEMI": "4000-5000_INR_MONTHLY",
          "loanTerm": "36_MONTHS",
          "existingLoans": 0,
          "creditScore": "GOOD",
          "employmentType": "SALARIED",
          "governmentSubsidyApplicable": true,
          "subsidyAmount": "20000_INR"
        },
        
        // ===== ORG CONTEXT: MULTI-LAYER IDENTIFICATION =====
        "organizationContext": {
          "manufacturerData": {
            "mfgrLeadId": "HERO-IN-2026-001234",
            "regionCode": "IN-NORTH",
            "stateOffice": "DELHI_OFFICE",
            "campaignTracking": "MONSOON_2026_SCOOTER",
            "marketingChannel": "ORGANIC_HERO_WEBSITE",
            "subsidyProgramCode": "INDIA_EV_INCENTIVE_2026"
          },
          "dmsData": {
            "dmsProvider": "CDK_GLOBAL",
            "dmsLeadId": "CDK-2026-IN-HERO-001",
            "dmsStatus": "NEW",
            "dmsEntryTime": "2026-03-15T09:31:00Z"
          },
          "dealerNetworkData": {
            "networkCode": "DELHI_GURUGRAM_NETWORK",
            "preferredDealers": ["DEALER-HERO-GURUGRAM-01", "DEALER-HERO-DELHI-CENTRAL"],
            "allocationStrategy": "GEOGRAPHIC_PROXIMITY"
          }
        },
        
        // ===== METADATA =====
        "metadata": {
          "createdDate": "2026-03-15T09:30:00Z",
          "leadLanguage": "HINDI",
          "countryCode": "IN",
          "currencyCode": "INR",
          "complianceFlags": {
            "gdprCompliant": false,
            "ccpaCompliant": false,
            "indianPrivacyActCompliant": true
          },
          "ownershipChain": [
            {
              "owner": "PLATFORM-HERO-WEBSITE-IN",
              "timestamp": "2026-03-15T09:30:00Z",
              "action": "LEAD_CREATED"
            }
          ]
        }
      }
    }
  }
}
```

---

## 2. India Two-Wheeler Lead Closure: From Submission to Sale

### LEAD_CLOSURE: Scooter Successfully Sold

**Scenario:** Customer from above lead purchased after 45 days of dealer engagement

```json
{
  "LEX": {
    "header": {
      "messageId": "MSG-2026-CLO-SCOOTER-001",
      "messageType": "LEAD_CLOSURE",
      "version": "1.0",
      "timestamp": "2026-04-30T16:45:00Z",
      "senderId": "DEALER-HERO-GURUGRAM-01",
      "receiverId": "MFGR-HERO-MOTOCORP-IN"
    },
    "payload": {
      "leadClosure": {
        // ===== REFERENCE TO ORIGINAL LEAD =====
        "originalLeadId": "LEAD-2026-IN-HMC-001234",
        "originalLeadSource": "MANUFACTURER_WEBSITE",
        "originalSourceURL": "https://heromotocorp.com/en-IN/scooters/electric-dash",
        "leadCreatedDate": "2026-03-15T09:30:00Z",
        "leadClosureDate": "2026-04-30T16:45:00Z",
        "leadLifecycleDays": 45,
        
        // ===== CLOSURE SUCCESS =====
        "closureStatus": "WON",
        "closureReason": "CUSTOMER_PURCHASED_VEHICLE",
        "closureDetail": {
          "purchaseConfirmed": true,
          "orderPlacedDate": "2026-04-28T14:00:00Z",
          "deliveryScheduledDate": "2026-05-15",
          "dealAmount": 125000.00,
          "currencyCode": "INR"
        },
        
        // ===== VEHICLE PURCHASED =====
        "purchasedProduct": {
          "productType": "ELECTRIC_SCOOTER",
          "assetClass": "MOBILITY",
          "manufacturer": "Hero MotoCorp",
          "model": "Electric Dash",
          "year": 2026,
          "color": "Pearl Black",
          "orderSKU": "HERO-ED-2026-BLK-60KWH",
          
          "typeSpecificAttributes": {
            "motorType": "BRUSHLESS_DC",
            "motorPower": 4000,
            "batteryCapacity": 60,
            "batteryType": "LITHIUM_ION",
            "maxSpeed": 80,
            "range": 120,
            "chargingTime": 5.5,
            "weight": 120,
            "seatHeight": 800,
            "groundClearance": 180,
            "LoadCapacity": 150,
            "waterResistance": "IPX7",
            "selectedFeatures": [
              "FAST_CHARGING",
              "APP_CONNECTIVITY",
              "GPS_TRACKING",
              "ABS_BRAKING",
              "CRUISE_CONTROL",
              "LED_DISPLAY",
              "REGENERATIVE_BRAKING"
            ]
          }
        },
        
        // ===== CUSTOMER & FINANCIAL OUTCOME =====
        "customerOutcome": {
          "customerId": "CUST-2026-HERO-NEW-001",
          "purchaseConfirmed": true,
          "financingUsed": true,
          "financingType": "GOVERNMENT_SUBSIDY_WITH_EMI",
          "downPaymentAmount": 25000.00,
          "totalFinanceAmount": 100000.00,
          "downPaymentPercentage": 20.0,
          "loanTerm": 36,
          "monthlyEMI": 2955.00,
          "governmentSubsidyApplied": true,
          "subsidyAmount": 20000.00,
          "subsidyAppliedTowardEMI": true,
          "estimatedDeliveryDate": "2026-05-15T00:00:00Z",
          "registrationFees": 5000.00,
          "insuranceMonthly": 500.00,
          "maintenancePackageIncluded": true,
          "maintenanceMonths": 24,
          "homeChargingStationIncluded": true,
          "chargingStallationCost": 8000.00
        },
        
        // ===== DEALER NOTES =====
        "dealerNotes": "Excellent customer experience. Waited 45 days for subsidy approval. Customer very knowledgeable about EV specs. Negotiated installation of fast-charge station at home. Will purchase additional two-wheeler in 2 years. Referred friend already.",
        
        // ===== ENGAGEMENT METRICS =====
        "metrics": {
          "firstContactDate": "2026-03-16T10:00:00Z",
          "lastContactDate": "2026-04-28T14:00:00Z",
          "totalDaysFromFirstContact": 44,
          "interactionCount": 12,
          "dealerVisits": 3,
          "testDrivesCompleted": 2,
          "phoneCallsCount": 5,
          "emailsCount": 4,
          "messagesCount": 3,
          "dealerQualityScore": 9.3,
          "customerSatisfactionRating": 4.9,
          "npsScore": 68
        },
        
        // ===== ORGANIZATION CONTEXT: ALL IDS PRESERVED =====
        "organizationContext": {
          "dealerData": {
            "dealerLeadId": "HERO-GURUGRAM-01-5555",
            "dealerName": "Hero Motors Gurugram",
            "dealerCity": "Gurugram",
            "dealerState": "Haryana",
            "dealerCountryCode": "IN",
            "dealerCode": "DEALER-HERO-GURUGRAM-01",
            "saleRepId": "SR-HERO-GURGAON-101",
            "saleRepName": "Priya Sharma",
            "closingManagerId": "MGR-HERO-GURGAON-05",
            "departmentCode": "EV_SALES",
            "highValueSalesIndicator": true
          },
          
          "dmsData": {
            "dmsProvider": "CDK_GLOBAL",
            "dmsLeadId": "CDK-2026-IN-HERO-001",
            "dmsOrderId": "ORD-CDK-2026-IN-12345",
            "dmsStatus": "CLOSED_WON",
            "dmsClosedDate": "2026-04-30T16:45:00Z",
            "dealValueRecorded": 125000.00
          },
          
          "manufacturerData": {
            "mfgrLeadId": "HERO-IN-2026-001234",
            "regionCode": "IN-NORTH",
            "stateOffice": "DELHI_OFFICE",
            "dealerTerritoryCode": "GGN-001",
            "subsidyProgramCode": "INDIA_EV_INCENTIVE_2026",
            "incentiveApplied": "20000_INR_EV_SUBSIDY",
            "netIncentiveApplied": 20000.00
          }
        },
        
        // ===== AUDIT TRAIL =====
        "metadata": {
          "createdBy": "DEALER-HERO-GURUGRAM-01",
          "createdBySystem": "CDK_DEALER_CMS_v7.2",
          "countryCode": "IN",
          "currencyCode": "INR",
          "createdDate": "2026-04-30T16:45:00Z",
          "ownershipChain": [
            {
              "owner": "PLATFORM-HERO-WEBSITE-IN",
              "timestamp": "2026-03-15T09:30:00Z",
              "action": "LEAD_CREATED"
            },
            {
              "owner": "DMS-CDKGLOBAL-INDIA",
              "timestamp": "2026-03-15T09:31:00Z",
              "action": "LEAD_ROUTED_TO_DEALER"
            },
            {
              "owner": "DEALER-HERO-GURUGRAM-01",
              "timestamp": "2026-03-16T10:00:00Z",
              "action": "LEAD_ASSIGNED"
            },
            {
              "owner": "DEALER-HERO-GURUGRAM-01",
              "timestamp": "2026-04-28T14:00:00Z",
              "action": "ORDER_CREATED"
            },
            {
              "owner": "DEALER-HERO-GURUGRAM-01",
              "timestamp": "2026-04-30T16:45:00Z",
              "action": "LEAD_CLOSED_WON"
            }
          ],
          "complianceFlags": {
            "indianPrivacyActCompliant": true,
            "gstCompliant": true,
            "subsidyDocumentationComplete": true
          }
        }
      }
    }
  }
}
```

---

## 3. US Motorcycle Lead (Harley-Davidson)

### Detailed Motorcycle Lead: Easy Rider

**Scenario:** Customer interested in Harley-Davidson Street Glide from dealer website

```json
{
  "LEX": {
    "header": {
      "messageId": "MSG-2026-LEAD-MOTO-USA-001",
      "messageType": "LEAD",
      "version": "1.0",
      "timestamp": "2026-03-15T18:15:00Z",
      "senderId": "DEALER-HARLEY-MIAMI",
      "receiverId": "MFGR-HARLEY-DAVIDSON",
      "encryptionMethod": "TLS1.3"
    },
    "payload": {
      "lead": {
        "leadId": "LEAD-2026-USA-HD-001",
        "status": "EXPRESSED_INTEREST",
        "source": "DEALER_WEBSITE",
        
        "sourceDetail": {
          "sourceType": "DEALER_WEBSITE",
          "sourceURL": "https://miaminearlyharley.com/inventory/street-glide",
          "specificPage": "/request-more-info",
          "campaignCode": "MIAMI_SPRING_CRUISER",
          "campaignName": "Miami Spring Cruiser Sale",
          "deviceType": "DESKTOP",
          "deviceOS": "Windows",
          "browser": "Chrome",
          "submissionTimezone": "America/New_York",
          "submissionDayOfWeek": "Friday",
          "estimatedCustomerLocation": "Miami, FL",
          "languagePreference": "en-US",
          "leadQualityScore": 8.8,
          "formName": "MotorcycleLeadForm_v2",
          "formCompletionTime": 420
        },
        
        "customer": {
          "customerId": "CUST-2026-HD-NEW-001",
          "firstName": "David",
          "lastName": "Johnson",
          "emailAddress": "david.j@email.com",
          "phoneNumber": "+1-305-555-1234",
          "preferredContactMethod": "PHONE",
          "ageRange": "45-54",
          "occupationType": "BUSINESS_OWNER",
          "incomeRange": "150K_PLUS_USD",
          "maritalStatus": "MARRIED",
          
          "address": {
            "addressType": "RESIDENTIAL",
            "street1": "123 Coral Gables Ave",
            "city": "Coral Gables",
            "state": "FL",
            "postalCode": "33134",
            "countryCode": "US"
          },
          
          "buyingIntention": {
            "purchaseTimeline": "1-2_MONTHS",
            "budgetRange": "35000-50000_USD",
            "primaryUsageType": "WEEKEND_LEISURE",
            "isExistingHarleyOwner": true,
            "previousHarleyModels": ["Road King", "Street 750"],
            "monthlyRideEstimate": 2000,
            "preferredPaymentMethod": "CASH_WITH_FINANCING_OPTION",
            "tradeInVehicleAvailable": true,
            "tradeInYear": 2015,
            "tradeInModel": "Street 750"
          }
        },
        
        "desiredProduct": {
          "productType": "MOTORCYCLE",
          "assetClass": "AUTOMOTIVE",
          
          "vehiclePreferences": {
            "preferredManufacturers": ["HARLEY_DAVIDSON"],
            "desiredModels": ["STREET_GLIDE", "ULTRA_GLIDE"],
            "desiredYear": 2026,
            "desiredColor": ["PEARL_WHITE", "VIVID_BLACK"]
          },
          
          "typeSpecificPreferences": {
            "engineSize": {
              "preferred": 1746,
              "minAcceptable": 1650
            },
            "engineType": "V_TWIN",
            "preferredFeatures": [
              "ABS_BRAKING",
              "INFOTAINMENT_SYSTEM",
              "CRUISE_CONTROL",
              "HEATED_GRIPS",
              "ELECTRONIC_THROTTLE",
              "ADAPTIVE_SUSPENSION",
              "TIRE_PRESSURE_MONITORING"
            ],
            "seatingCapacity": 2,
            "preferredSeat": "COMFORTABLE_TOURING",
            "windshieldPreference": "LARGE_TOURING",
            "tourPackagePreferred": true
          },
          
          "specificInterestModel": {
            "manufacturer": "Harley-Davidson",
            "model": "Street Glide",
            "year": 2026,
            "engineDisplacement": 1746,
            "engineType": "V_TWIN_HIGH_OUTPUT",
            "transmission": "BELT_DRIVE",
            "maxPower": 86,
            "maxTorque": 94,
            "seatingType": "TOURING",
            "windshieldType": "FRONT_TOURING",
            "color": "Pearl White"
          }
        },
        
        "tradeIn": {
          "tradeInVehicleOffered": true,
          "tradeInYear": 2015,
          "tradeInMake": "Harley-Davidson",
          "tradeInModel": "Street 750",
          "tradeInMileage": 8500,
          "tradeInCondition": "EXCELLENT",
          "estimatedTradeInValue": 7000.00
        },
        
        "financing": {
          "needsFinancing": true,
          "downPaymentCapacity": 15000.00,
          "preferredMonthlyPayment": 400.00,
          "loanTerm": 60,
          "existingLoans": 0,
          "creditScore": "EXCELLENT",
          "employmentType": "SELF_EMPLOYED"
        },
        
        "organizationContext": {
          "dealerData": {
            "dealerLeadId": "HD-MIAMI-5555",
            "dealerName": "Miami Harley-Davidson",
            "dealerCity": "Miami",
            "dealerState": "FL"
          },
          "manufacturerData": {
            "mfgrLeadId": "HD-USA-2026-GLIDE-001",
            "regionCode": "USA-SOUTHEAST"
          }
        },
        
        "metadata": {
          "createdDate": "2026-03-15T18:15:00Z",
          "leadLanguage": "ENGLISH",
          "countryCode": "US",
          "currencyCode": "USD",
          "complianceFlags": {
            "gdprCompliant": false,
            "ccpaCompliant": true
          }
        }
      }
    }
  }
}
```

---

## 4. E-Bicycle Lead (Europe Market)

### Germany: Premium E-Bike Lead

**Scenario:** German urbanite interested in high-end cargo e-bike

```json
{
  "LEX": {
    "header": {
      "messageId": "MSG-2026-LEAD-EBIKE-DE-001",
      "messageType": "LEAD",
      "version": "1.0",
      "timestamp": "2026-03-15T14:20:00Z",
      "senderId": "DEALER-RIESE-MUELLER-BERLIN",
      "receiverId": "MFGR-RIESE-MUELLER"
    },
    "payload": {
      "lead": {
        "leadId": "LEAD-2026-DE-RM-001",
        "status": "EXPLORING",
        "source": "MANUFACTURER_WEBSITE",
        
        "sourceDetail": {
          "sourceType": "MANUFACTURER_WEBSITE",
          "sourceURL": "https://riese-mueller.de/en/load-75",
          "campaignCode": "SPRING_2026_CARGO_BIKES",
          "deviceType": "MOBILE",
          "deviceOS": "iOS",
          "submissionTimezone": "Europe/Berlin",
          "languagePreference": "de-DE",
          "leadQualityScore": 7.9
        },
        
        "customer": {
          "customerId": "CUST-2026-RM-NEW-001",
          "firstName": "Anna",
          "lastName": "Mueller",
          "emailAddress": "anna.mueller@email.de",
          "phoneNumber": "+49-30-555-1234",
          "ageRange": "35-44",
          "occupationType": "FREELANCER",
          "city": "Berlin",
          "countryCode": "DE",
          
          "buyingIntention": {
            "purchaseTimeline": "1_MONTH",
            "budgetRange": "4000-6000_EUR",
            "primaryUsageType": "CARGO_TRANSPORT",
            "secondaryUsageTypes": ["DAILY_COMMUTE", "FAMILY_OUTINGS"],
            "preferredPaymentMethod": "INSTALLMENT"
          }
        },
        
        "desiredProduct": {
          "productType": "ELECTRIC_BICYCLE",
          "assetClass": "MICROMOBILITY",
          
          "typeSpecificPreferences": {
            "motorPower": {
              "preferred": 250,
              "maxAcceptable": 750
            },
            "batteryCapacity": {
              "preferred": 900
            },
            "cargoCapacity": {
              "required": true,
              "minCapacity": 100
            },
            "preferredFeatures": [
              "LOAD_75_CARGO_FRAME",
              "INTEGRATED_LIGHTS",
              "HYDRAULIC_BRAKES",
              "SHIMANO_GEARS"
            ]
          },
          
          "specificInterestModel": {
            "manufacturer": "Riese & Müller",
            "model": "Load 75",
            "motorType": "BOSCH_PEDAL_ASSIST",
            "batteryCapacity": 900,
            "range": 150,
            "cargoCapacity": 200,
            "maxSpeed": 32
          }
        },
        
        "financing": {
          "needsFinancing": true,
          "preferredMonthlyPayment": 150.00,
          "monthlyCapacity": 200.00
        },
        
        "metadata": {
          "createdDate": "2026-03-15T14:20:00Z",
          "countryCode": "DE",
          "currencyCode": "EUR",
          "complianceFlags": {
            "gdprCompliant": true
          }
        }
      }
    }
  }
}
```

---

## 5. Summary: Two-Wheeler Support in LEX

### Product Types Covered in LEX

| Product Type | Examples | Market Size | LEX Status |
|--------------|----------|------------|-----------|
| **MOTORCYCLE** | Harley, Ducati, Honda, Yamaha | Millions/year globally | ✅ Fully Supported |
| **ELECTRIC_SCOOTER** | Xiaomi, Segway, Hero | 50M+ in India | ✅ Fully Supported |
| **ELECTRIC_BICYCLE** | Riese & Müller, Trek | Growing in Europe | ✅ Fully Supported |
| **THREE_WHEELER** | Bajaj, Auto-rickshaw | Massive in India | ✅ Fully Supported |
| **MOPED** | Vespa, Piaggio | Popular in Europe | ✅ Fully Supported |
| **ELECTRIC_SCOOTER_SHARE** | Bird, Lime | Urban transport | ✅ Fully Supported |
| **KICK_SCOOTER** | Razor, Microfluidics | Kids/commuting | ✅ Fully Supported |

### Key Points: Why LEX Works for Two-Wheelers

1. **Generic Product Model** - Not vehicle-specific, everything is a "product"
2. **Type-Specific Attributes** - Each type defines its own specs (not forced into car model)
3. **Global Currency/Language** - Support INR, EUR, USD, all languages
4. **Org Context** - Regional offices, subsidy programs, local DMS providers
5. **Lead Source Detail** - Tracks exactly where lead came from (URL, URL, campaign, device)
6. **Lead Closure** - Dealer can report back finalized deal to manufacturer
7. **Same EDI** - X12, EDIFACT, JSON-EDI work for all product types
8. **Same Libraries** - Haxe core works for motorcycles, scooters, e-bikes, everything

### Next Steps for Implementation

- [ ] Define two-wheeler-specific validation rules
- [ ] Create routing rules for two-wheeler dealers
- [ ] Build lead scoring algorithms for scooters/motorcycles
- [ ] Develop multi-country tax/subsidy framework
- [ ] Create insurance integration for motorcycles
- [ ] Build safety course tracking for motorcycle leads

---

**Last Updated:** March 23, 2026  
**Coverage Level:** Comprehensive (5 major two-wheeler markets)  
**LEX Version:** 1.0 with Organization Extensions & Lead Closure
