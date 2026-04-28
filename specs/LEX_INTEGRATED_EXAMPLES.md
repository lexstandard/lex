<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright (c) 2026 LEX Lead Exchange Standard Contributors -->
<!-- Canonical specification: https://lexstandard.org -->

# LEX - Integrated Examples: Organizations + Multi-Product Types

## Overview

Real-world examples demonstrating how **Organization Extensions** and **Multi-Product Types** work together in the LEX ecosystem.

---

## Example 1: Motorcycle Lead from Dealer through DMS to Manufacturer

### Scenario
A customer visits a Harley-Davidson dealer's website and expresses interest in a motorcycle. The dealer uses CDK Global's DMS system. The lead flows through the organization hierarchy.

### Message Structure

```json
{
  "LEX": {
    "version": "1.0.0",
    
    "header": {
      "messageId": "550e8400-e29b-41d4-a716-446655440000",
      "messageType": "LEAD",
      "timestamp": "2026-03-23T14:30:00Z",
      "senderId": "DEALER-HARLEY-CHICAGO-MAIN",
      "receiverId": "MFGR-HARLEY-DAVIDSON-NA",
      "correlationId": null
    },
    
    "payload": {
      "lead": {
        "leadId": "LEAD-2026-MOTO-001234",
        "status": "EXPRESSED_INTEREST",
        "source": "DEALER_WEBSITE",
        
        "sourceDetail": {
          "channel": "online",
          "platform": "dealership_website",
          "languageCode": "en-US",
          "pageType": "MOTORCYCLE_EXPLORER"
        },
        
        // ===== PRODUCT: MOTORCYCLE (NOT VEHICLE) =====
        "desiredProduct": {
          "productType": "MOTORCYCLE",        // KEY: Flexible product type
          "assetClass": "AUTOMOTIVE",
          
          "manufacturerPreferences": {
            "make": ["Harley-Davidson"],
            "excludedMakes": []
          },
          
          "modelPreferences": {
            "models": [
              "Street 750",
              "Street Glide"
            ],
            "yearRange": {
              "min": 2025,
              "max": 2026
            }
          },
          
          "features": {
            "desiredFeatures": [
              "ABS",
              "CRUISE_CONTROL",
              "ASSIST_SLIPPER_CLUTCH"
            ],
            "excludedFeatures": []
          },
          
          "priceRange": {
            "min": 6500,
            "max": 15000,
            "currency": "USD"
          },
          
          // TYPE-SPECIFIC: Motorcycle requirements
          "specificProductRequirements": {
            "forMotorcycle": {
              "maxEngineSize": 883,           // CC (interested in Street 750)
              "requiresAutomaticTransmission": false,
              "preferredTransmission": "MANUAL",
              "minSeatingHeight": 27,         // Inches (comfort requirement)
              "maxWeight": 550,               // Pounds
              "interestedInElectric": false
            }
          },
          
          "tradeInEligibility": {
            "acceptsTradeIn": true,
            "tradeInType": "SAME_CATEGORY",  // Only other motorcycles
            "minTradeInValue": null
          },
          
          "deliveryType": "IMMEDIATE"
        },
        
        // ===== TRADE-IN: Different product type allowed =====
        "tradeIn": {
          "hasTradeIn": true,
          "productType": "MOTORCYCLE",
          "make": "Yamaha",
          "model": "Bolt",
          "year": 2019,
          "condition": "GOOD",
          "estimatedValue": 4500,
          "mileage": 8200,
          "vin": "JY2RN13A4K2100001"
        },
        
        "customer": {
          "firstName": "James",
          "lastName": "Miller",
          "email": "james.miller@example.com",
          "phone": "+13125554321",
          "dateOfBirth": "1980-06-15",
          "gender": "M",
          "address": {
            "street1": "456 Oak Avenue",
            "city": "Chicago",
            "state": "IL",
            "postalCode": "60601",
            "country": "US"
          },
          "preferences": {
            "preferredContactMethod": "PHONE",
            "preferredContactTime": "EVENINGS",
            "doNotCall": false,
            "doNotEmail": false
          }
        },
        
        "financing": {
          "interestedInFinancing": true,
          "preferredLoanTerm": 60,
          "downPaymentRange": {
            "minUSD": 2000,
            "maxUSD": 4000
          },
          "creditTierPreference": "GOOD"
        },
        
        // ===== ORGANIZATION CONTEXT: Multi-layer identifiers =====
        "organizationContext": {
          
          // DEALER-SPECIFIC DATA
          "dealerData": {
            "dealerLeadId": "DEALER-HARLEY-CHI-5555",
            "dealerBranchCode": "MAIN",
            "dealerDepartmentCode": "MOTORCYCLE_SALES",
            "saleRepId": "SR-456",            // Sales rep handling lead
            "managerId": "MGR-789",            // Sales manager
            "sourceSystemCode": "CDK-GLOBAL-V3.2",
            "internalNotes": "Customer rode test bike (Street 750), interested in trade-in evaluation",
            "dealerMetrics": {
              "leadScore": 92,                // High quality lead
              "customerHistoryFlag": "NEW",
              "motorcycleInventoryMatches": 3,
              "tradeInAppraised": true,
              "testRideCompleted": true
            }
          },
          
          // DMS PROVIDER DATA (CDK GLOBAL)
          "dmsData": {
            "dmsProvider": "CDK_GLOBAL",
            "dmsLeadId": "CDK-MOTO-2026-555-CHI",
            "dmsAccountId": "CDK-HARLEY-CHICAGO-001",
            "dmsSystemCode": "CDK-POWER-DEALER-MOTO",
            "dmsStatus": "SYNCED_TO_DMS",
            "dmsTimestamp": "2026-03-23T14:35:00Z",
            "dmsWorkflow": "MOTORCYCLE_SALES_WORKFLOW",
            "dmsMetadata": {
              "route": "AUTOMATIC_TO_INVENTORY_MATCH",
              "priority": "HIGH",
              "followUpDate": "2026-03-25",
              "assignedTo": "HARLEY_LEAD_TEAM"
            }
          },
          
          // MANUFACTURER DATA (HARLEY-DAVIDSON)
          "manufacturerData": {
            "mfgrLeadId": "HD-LEAD-2026-55555",
            "regionCode": "NA-MIDWEST",
            "divisionCode": "HARLEY-STREET",     // Street models division
            "incentiveProgram": "SPRING-2026-RIDER-PROMO",
            "allocationPoolId": "POOL-2026-STREET-Q1",
            "customFields": {
              "targetMarketSegment": "EXPERIENCED_RIDER",
              "riderHistoryFlag": "RETURNING",
              "testRideEligible": true,
              "financingProgramCode": "HD-FIN-PRIME-PLUS"
            }
          }
        },
        
        "metadata": {
          "createdAt": "2026-03-23T14:30:00Z",
          "updatedAt": "2026-03-23T14:35:00Z",
          "expirationDate": "2026-04-23T14:30:00Z",
          "priority": "HIGH",
          "ownershipChain": [
            "DEALER-HARLEY-CHICAGO-MAIN",
            "DMS-CDKGLOBAL-PROD",
            "MFGR-HARLEY-DAVIDSON-NA"
          ],
          "sourceSystem": "CDK-POWER-DEALER-MOTO-v3.2",
          "compliance": {
            "gdprConsent": true,
            "ccpaOptOut": false,
            "marketingEmailConsent": true,
            "timestamp": "2026-03-23T14:30:00Z"
          }
        },
        
        "subscriptionPreferences": {
          "wantsPriceUpdates": true,
          "wantsInventoryUpdates": true,
          "wantsServiceReminders": false,
          "updateFrequency": "WEEKLY"
        }
      }
    },
    
    "validation": {
      "checksum": "sha256:abc123...",
      "signature": null
    }
  }
}
```

---

## Example 2: Electric Scooter Lead from Platform to Multi-Brand Dealer Network

### Scenario
An electric scooter lead comes from an online platform (sharing-economy focused). Multiple dealers in a network want to receive these leads.

```json
{
  "LEX": {
    "version": "1.0.0",
    
    "header": {
      "messageId": "e7b1f4c2-8d9a-11eb-8dcd-0242ac130003",
      "messageType": "LEAD",
      "timestamp": "2026-03-23T10:15:00Z",
      "senderId": "PLATFORM-SKOOTER-NETWORK",    // Scooter-focused platform
      "receiverId": "BROADCAST",                 // Send to all subscribed dealers
      "correlationId": null
    },
    
    "payload": {
      "lead": {
        "leadId": "LEAD-2026-SCOOTER-009876",
        "status": "SHOPPING",
        "source": "THIRD_PARTY_PORTAL",
        
        "sourceDetail": {
          "channel": "online",
          "platform": "skooter_network_app",
          "languageCode": "en-US",
          "pageType": "SCOOTER_MARKETPLACE",
          "referralSource": "INFLUENCER_PARTNERSHIP"
        },
        
        // ===== PRODUCT: ELECTRIC SCOOTER =====
        "desiredProduct": {
          "productType": "ELECTRIC_SCOOTER",   // Key: Product type flexibility
          "assetClass": "MOBILITY",
          
          "manufacturerPreferences": {
            "make": [
              "Xiaomi",
              "Segway",
              "Ninebot"
            ],
            "excludedMakes": []
          },
          
          "modelPreferences": {
            "models": [
              "Mi 3",
              "Ninebot Max",
              "Ninebot ES"
            ],
            "yearRange": {
              "min": 2024,
              "max": 2026
            }
          },
          
          "features": {
            "desiredFeatures": [
              "FOLDABLE",
              "LED_LIGHTS",
              "APP_CONTROL",
              "LONG_RANGE",
              "WATERPROOF"
            ],
            "excludedFeatures": []
          },
          
          "priceRange": {
            "min": 300,
            "max": 800,
            "currency": "USD"
          },
          
          // TYPE-SPECIFIC: Scooter requirements
          "specificProductRequirements": {
            "forElectricScooter": {
              "minRange": 20,                 // Miles per charge
              "maxWeight": 28,                // Lbs (portability)
              "foldable": true,               // Must fold
              "maxHeight": 44,                // Inches when folded
              "dualMotors": false,
              "waterResistanceMinimum": "IPX3"
            }
          },
          
          "tradeInEligibility": {
            "acceptsTradeIn": false,         // Scooters rarely traded in
            "tradeInType": "NONE",
            "minTradeInValue": null
          },
          
          "deliveryType": "FLEXIBLE"
        },
        
        "customer": {
          "firstName": "Sarah",
          "lastName": "Chen",
          "email": "sarah.chen@example.com",
          "phone": "+14155552299",
          "dateOfBirth": "1995-03-20",
          "gender": "F",
          "address": {
            "street1": "789 Market Street",
            "city": "San Francisco",
            "state": "CA",
            "postalCode": "94102",
            "country": "US"
          },
          "preferences": {
            "preferredContactMethod": "TEXT",
            "preferredContactTime": "ANYTIME",
            "doNotCall": true,               // Prefers text only
            "doNotEmail": false
          }
        },
        
        "financing": {
          "interestedInFinancing": false,   // Scooters usually not financed
          "preferredLoanTerm": null,
          "downPaymentRange": null,
          "creditTierPreference": null
        },
        
        // ===== ORGANIZATION CONTEXT: Platform + Dealer Network =====
        "organizationContext": {
          
          // PLATFORM DATA
          "platformData": {
            "platform": "SKOOTER_NETWORK",
            "platformLeadId": "SK-2026-9876-SF",
            "campaignId": "SK-SPRING-2026-INFLUENCER",
            "sourceUrl": "https://skooter.app/marketplace/mobility/scooters",
            "leadQualityScore": 8.3,
            "platformMetadata": {
              "pageType": "ELECTRIC_SCOOTER",
              "timeOnSite": 450,
              "viewedProducts": 4,
              "contactAttempts": 0,
              "userVerified": true,
              "paymentMethodOnFile": true
            }
          },
          
          // DEALER NETWORK DATA (Multi-dealer scenario)
          "dealerNetworkData": {
            "networkCode": "BAY_AREA_MOBILITY_NETWORK",
            "networkName": "Bay Area Micromobility Alliance",
            "regionalManager": "network-manager@bayareamobility.com",
            "memberDealers": [
              "DEALER-XYZ-SF-DOWNTOWN",
              "DEALER-XYZ-SF-MISSION",
              "DEALER-ABC-OAKLAND",
              "DEALER-ABC-BERKELEY"
            ],
            "networkMetrics": {
              "totalInventory": 850,
              "monthlyLeadGoal": 300,
              "avgLeadCost": 15,
              "bestPerformer": "DEALER-XYZ-SF-DOWNTOWN"
            },
            "leadDistributionRules": {
              "algorithm": "GEOGRAPHIC_PROXIMITY_FIRST",
              "geofence": "10_MILES",
              "fallbackToNetwork": true
            }
          }
        },
        
        "metadata": {
          "createdAt": "2026-03-23T10:15:00Z",
          "updatedAt": "2026-03-23T10:15:00Z",
          "expirationDate": "2026-04-06T10:15:00Z",   // 2 weeks for shopping status
          "priority": "NORMAL",
          "ownershipChain": [
            "PLATFORM-SKOOTER-NETWORK",
            "NETWORK-BAY-AREA-MOBILITY",
            "DEALER-XYZ-SF-DOWNTOWN"
          ],
          "sourceSystem": "SKOOTER-API-v2.1",
          "compliance": {
            "gdprConsent": true,
            "ccpaOptOut": false,
            "marketingEmailConsent": false,      // Text only preference
            "timestamp": "2026-03-23T10:15:00Z"
          }
        }
      }
    }
  }
}
```

---

## Example 3: Subscription for Organizations Carrying Multiple Product Types

### Scenario
A dealer network carries multiple product types and wants fine-grained subscriptions:

```json
{
  "LEX": {
    "version": "1.0.0",
    
    "header": {
      "messageId": "f9d8e3b1-7c6a-11eb-9e4f-0242ac130004",
      "messageType": "SUBSCRIPTION",
      "timestamp": "2026-03-23T15:00:00Z",
      "senderId": "NETWORK-BAY-AREA-MOBILITY",
      "receiverId": "MANUFACTURER-ECOSYSTEM"
    },
    
    "payload": {
      "subscription": {
        "subscriptionId": "SUB-BAYAREA-NETWORK-001",
        "action": "SUBSCRIBE",
        "subscriptionType": "LEAD_UPDATES",
        
        "filters": {
          // ===== FILTER BY MULTIPLE PRODUCT TYPES =====
          "productTypes": [
            "ELECTRIC_SCOOTER",
            "ELECTRIC_BIKE",
            "MOTORCYCLE",
            "VEHICLE"
          ],
          
          "assetClasses": [
            "MOBILITY",
            "AUTOMOTIVE"
          ],
          
          // Product-specific filters work side-by-side
          "productTypeSpecificFilters": {
            "ELECTRIC_SCOOTER": {
              "manufacturerNames": ["Xiaomi", "Segway"],
              "minRange": 15,                  // Miles
              "maxPrice": 1000
            },
            
            "MOTORCYCLE": {
              "manufacturerNames": ["Harley-Davidson", "Ducati"],
              "maxEngineSize": 1200,           // CC
              "minPrice": 5000,
              "maxPrice": 25000
            },
            
            "VEHICLE": {
              "manufacturerNames": ["Toyota", "Honda", "Tesla"],
              "fuelTypes": ["HYBRID", "ELECTRIC"],
              "minPrice": 20000,
              "maxPrice": 75000
            }
          },
          
          "locationFilters": {
            "zipCodes": ["94102", "94103", "94104"],  // SF
            "radius": 10                              // Miles
          },
          
          "leadStatusFilters": [
            "SHOPPING",
            "EXPLORING",
            "EXPRESSED_INTEREST",
            "RESERVATION"
          ]
        },
        
        "deliveryEndpoint": "https://api.bayareamobility.com/LEX/webhook",
        "deliveryFormat": "JSON_EDI",
        "active": true,
        
        // Organization subscription context
        "organizationContext": {
          "dealerNetworkData": {
            "networkCode": "BAY_AREA_MOBILITY_NETWORK",
            "carriedProductTypes": [
              "VEHICLE",
              "MOTORCYCLE",
              "ELECTRIC_SCOOTER",
              "ELECTRIC_BIKE"
            ],
            "inventoryByType": {
              "VEHICLE": 120,
              "MOTORCYCLE": 45,
              "ELECTRIC_SCOOTER": 200,
              "ELECTRIC_BIKE": 180
            },
            "preferredRouting": "GEOGRAPHIC_PROXIMITY",
            "backupRouting": "NETWORK_DISTRIBUTION"
          }
        }
      }
    }
  }
}
```

---

## Example 4: Acknowledgment with Multi-Organization Context

### Scenario
Manufacturer acknowledges a lead received from a dealer through a DMS, preserving all organization context:

```json
{
  "LEX": {
    "version": "1.0.0",
    
    "header": {
      "messageId": "ack-msg-77777",
      "messageType": "ACKNOWLEDGMENT",
      "timestamp": "2026-03-23T14:36:00Z",
      "senderId": "MFGR-HARLEY-DAVIDSON-NA",
      "receiverId": "DEALER-HARLEY-CHICAGO-MAIN",
      "correlationId": "550e8400-e29b-41d4-a716-446655440000"  // Links to original LEAD
    },
    
    "payload": {
      "acknowledgment": {
        "originalMessageId": "550e8400-e29b-41d4-a716-446655440000",
        "status": "PROCESSED",
        "processedAt": "2026-03-23T14:36:00Z",
        
        // Acknowledgment includes organization context validation
        "organizationContextValidation": {
          "dealerData": {
            "status": "VALID",
            "dealerLeadId": "DEALER-HARLEY-CHI-5555",
            "message": "Lead registered in manufacturer system"
          },
          "dmsData": {
            "status": "VALID",
            "dmsLeadId": "CDK-MOTO-2026-555-CHI",
            "message": "DMS routing confirmed"
          },
          "manufacturerData": {
            "status": "VALID",
            "mfgrLeadId": "HD-LEAD-2026-55555",
            "message": "Assigned to regional sales team"
          }
        },
        
        "productValidation": {
          "productType": "MOTORCYCLE",
          "status": "VALID",
          "inventoryMatches": 2,
          "message": "Found 2 matching Street 750 models in Chicago area"
        },
        
        "nextSteps": {
          "leadId": "LEAD-2026-MOTO-001234",
          "assignedTo": "HARLEY_CHICAGO_SALES_TEAM",
          "expectedFollowUp": "2026-03-24T09:00:00Z",
          "message": "Lead assigned to regional sales team. Test ride scheduled for tomorrow at 10 AM.",
          "organizationNotifications": {
            "dealerReceives": {
              "leadStatus": "REGISTERED",
              "nextAction": "Confirm test ride appointment"
            },
            "dmsUpdate": "Lead synced with full organization context",
            "manufacturerUpdate": "Regional team engaged"
          }
        }
      }
    }
  }
}
```

---

## Example 5: Organization + Product Type Routing Decision Tree

```
Lead Received:
├─ Product Type = ELECTRIC_SCOOTER
├─ Asset Class = MOBILITY
└─ Organization = PLATFORM-SKOOTER

ROUTER DECISION TREE:
│
├─→ Step 1: Validate Product Type
│   ├─ productType: ELECTRIC_SCOOTER ✓ Valid
│   ├─ assetClass: MOBILITY ✓ Valid
│   └─ Schema: typeSpecificAttributes ✓ Valid
│
├─→ Step 2: Validate Organization Context
│   ├─ platformData.leadQualityScore: 8.3 ✓ Good
│   ├─ platformData.userVerified: true ✓ Verified
│   └─ paymentMethodOnFile: true ✓ Trustworthy
│
├─→ Step 3: Route by Asset Class
│   └─ MOBILITY → Send to MOBILITY_DEALERS only
│
├─→ Step 4: Filter by Product Type
│   ├─ Query: All dealers carrying ELECTRIC_SCOOTER
│   ├─ Found: 45 dealers in network
│   └─ Narrowing...
│
├─→ Step 5: Apply Organization/Geographic Filters
│   ├─ Network filter: BAY_AREA_MOBILITY_NETWORK
│   ├─ Geo: SF 94102 area, 10-mile radius
│   ├─ Product availability: ELECTRIC_SCOOTER
│   └─ Matching dealers: 4
│
├─→ Step 6: Rank & Route
│   ├─ Dealer 1: DEALER-XYZ-SF-DOWNTOWN (closest, highest score)
│   ├─ Dealer 2: DEALER-XYZ-SF-MISSION (backup)
│   ├─ Dealer 3: DEALER-ABC-OAKLAND (secondary)
│   └─ Dealer 4: DEALER-ABC-BERKELEY (fallback)
│
└─→ Step 7: Send with Full Context Preserved
    └─ All organization identifiers intact
       ✓ Platform IDs preserved
       ✓ Dealer network info included
       ✓ Product type information complete
       ✓ All compliance data attached
```

---

## Key Takeaways

###✅ Benefits of This Architecture

| Aspect | Benefit |
|--------|---------|
| **Flexibility** | Same spec handles vehicles, scooters, motorcycles, RVs |
| **Organization Clarity** | Each org can add identifiers without breaking spec |
| **Routing Power** | Can route on product type + organization context |
| **Scalability** | New product types don't require spec changes |
| **Backward Compat** | Added fields don't break existing systems |
| **Governance** | Organization data self-managed by each org |

### 📊 Organization ID Preservation Flow

```
Dealer (ABC-MAIN-5555)
    ↓
  +→ organizationContext.dealerData.dealerLeadId
  +→ organizationContext.dealerData.saleRepId
  │
DMS (CDK-GLOBAL)
    ↓
  +→ organizationContext.dmsData.dmsLeadId
  +→ organizationContext.dmsData.dmsAccountId
  │
Manufacturer (HARLEY-DAVIDSON)
    ↓
  +→ organizationContext.manufacturerData.mfgrLeadId
  +→ organizationContext.manufacturerData.regionCode
  │
  └→ All preserved, all queryable, all usable!
```

---

**Last Updated:** March 23, 2026  
**Version:** 1.0 (Integrated Examples)
