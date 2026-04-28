<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright (c) 2026 LEX Lead Exchange Standard Contributors -->
<!-- Canonical specification: https://lexstandard.org -->

# LEX - Lead Closure & Outcome Specification

## Overview

**Purpose:** Enable bidirectional lead lifecycle completion where retailercan push finalized deal results back to manufacturers, platforms, and original lead sources.

**Key Concept:** A lead created on manufacturer.com should allow the retailerwho closes it to report back on the outcome, enabling manufacturers to track lead conversion rates and update customer records.

---

## 1. The Problem: Missing Feedback Loop

### Current Flow (Incomplete)
```
Customer submits lead on manufacturer.com
    ↓
Lead forwarded to retailervia DMS
    ↓
retailerworks with customer
    ↓
Deal finalized
    ↓
❌ DEAD END - Nothing goes back to manufacturer or original source
```

**Issues:**
- Manufacturer has no visibility into lead outcome
- Original platform/website doesn't know if lead converted
- No closed-loop analytics
- No customer update capability at source
- retailercarries all customer intelligence but can't share outcome

### Required Flow (Complete)
```
Customer submits lead on manufacturer.com
    ↓
Lead forwarded to retailervia DMS
    ↓
retailerworks with customer for weeks/months
    ↓
Deal finalized (Order placed, payment received, delivery scheduled)
    ↓
retailersends LEAD_CLOSURE message back through DMS to manufacturer
    ↓
✅ Manufacturer updates customer record
✅ Platform updates lead status
✅ Original source notified of outcome
```

---

## 2. Lead Closure Message Type

### 2.1 Message Type: LEAD_CLOSURE

**Purpose:** Report final outcome of a lead that progressed to ORDER or was lost/abandoned

**Direction:** Bidirectional (retailer→ DMS/manufacturer → platform → original source)

**Trigger Points:**
- Deal finalized (ORDER status with actual order confirmation)
- Lead abandoned (customer stopped responding)
- Lead reassigned (transferred to another RETAILER)
- Deal cancelled (after initial order)

### 2.2 Message Structure

```json
{
  "LEX": {
    "header": {
      "messageId": "MSG-2026-CLO-000123",
      "messageType": "LEAD_CLOSURE",
      "version": "1.0",
      "timestamp": "2026-03-15T14:30:00Z",
      "senderId": "RETAILER-ABC-MAIN",
      "receiverId": "MFGR-TOYOTA-NA",
      "encryptionMethod": "TLS1.3"
    },
    "payload": {
      "leadClosure": {
        // === REFERENCE TO ORIGINAL LEAD ===
        "originalLeadId": "LEAD-2026-001234",
        "originalLeadSource": "MANUFACTURER_WEBSITE",
        "originalSourceURL": "https://toyota.com/shop/leads/intake",
        "leadCreatedDate": "2026-01-15T10:00:00Z",
        "leadClosureDate": "2026-03-15T14:30:00Z",
        "leadLifecycleDays": 59,
        
        // === CLOSURE OUTCOME ===
        "closureStatus": "WON",  // WON, LOST, ABANDONED, REASSIGNED
        "closureReason": "CUSTOMER_PURCHASED_asset",
        "closureDetail": {
          "purchaseConfirmed": true,
          "orderPlacedDate": "2026-03-10T09:15:00Z",
          "actualDeliveryDate": "2026-04-20",
          "dealAmount": 32500.00,
          "currency": "USD"
        },
        
        // === PRODUCT PURCHASED ===
        "purchasedProduct": {
          "productType": "asset",
          "VIN": "4T1BF1AK5CU123456",
          "manufacturer": "Toyota",
          "model": "Camry Hybrid",
          "year": 2026,
          "trim": "LE Plus",
          "color": "Celestial Silver"
        },
        
        // === CUSTOMER OUTCOME ===
        "customerOutcome": {
          "customerId": "CUST-ABC-12345",
          "purchaseConfirmed": true,
          "financingUsed": true,
          "financingType": "RETAILER_ARRANGED",
          "tradeInAccepted": false,
          "estimatedDeliveryDate": "2026-04-20T00:00:00Z"
        },
        
        // === retailerNOTES ===
        "RETAILERNotes": "Customer negotiated extensively on price. Final deal: $32,500 with Hybrid package. Extended warranty sold. Excellent customer satisfaction.",
        
        // === METRICS & ANALYTICS ===
        "metrics": {
          "interactionCount": 8,
          "showroomVisits": 2,
          "testDrivesCompleted": 1,
          "RETAILERQualityScore": 9.2,
          "customerSatisfactionRating": 4.8
        },
        
        // === ORGANIZATION CONTEXT ===
        "organizationContext": {
          "RETAILERData": {
            "RETAILERLeadId": "ABC-MAIN-5555",
            "saleRepId": "SR-456",
            "saleRepName": "John Smith",
            "closingManagerId": "MGR-789",
            "departmentCode": "NEW_asset_SALES"
          },
          "dmsData": {
            "dmsProvider": "CDK_GLOBAL",
            "dmsLeadId": "CDK-2026-555-ABC",
            "dmsOrderId": "ORD-CDK-2026-9876",
            "dmsStatus": "CLOSED_WON"
          },
          "manufacturerData": {
            "mfgrLeadId": "TY-LEAD-9999-ABC",
            "regionCode": "NA-WEST-CENTRAL",
            "regionOfficeCode": "TY-SF-OFFICE",
            "incentiveApplied": "SPRING_2026_HYBRID_REBATE",
            "incentiveAmount": 2100.00
          },
          "platformData": {
            "platforms": [
              {
                "platform": "AUTOTRADER",
                "platformLeadId": "AT-2026-999-LED",
                "leadSourceCampaign": "SPRING_2026_HYBRID_PROMOTION"
              }
            ]
          }
        },
        
        // === METADATA & AUDIT ===
        "metadata": {
          "createdBy": "RETAILER-ABC-MAIN",
          "createdBySystem": "CRM_v4.2.1",
          "updatedDate": "2026-03-15T14:30:00Z",
          "ownershipChain": [
            {
              "owner": "MANUFACTURER_WEBSITE",
              "timestamp": "2026-01-15T10:00:00Z",
              "action": "LEAD_CREATED"
            },
            {
              "owner": "DMS-CDKGLOBAL-PROD",
              "timestamp": "2026-01-15T10:05:00Z",
              "action": "LEAD_ROUTED"
            },
            {
              "owner": "RETAILER-ABC-MAIN",
              "timestamp": "2026-01-15T10:15:00Z",
              "action": "LEAD_ASSIGNED"
            },
            {
              "owner": "RETAILER-ABC-MAIN",
              "timestamp": "2026-03-15T14:30:00Z",
              "action": "LEAD_CLOSED"
            }
          ],
          "gdprCompliant": true,
          "ccpaCompliant": true,
          "datalakeSynced": false
        }
      }
    },
    "signature": {
      "algorithm": "RSA-2048",
      "timestamp": "2026-03-15T14:30:00Z",
      "signedBy": "RETAILER-ABC-MAIN",
      "value": "-----BEGIN SIGNATURE-----\nMIIEpAIBAAKCAQEA2Z..."
    }
  }
}
```

---

## 3. Closure Status Values

### 3.1 Status Definitions

| Status | Triggered By | Description | Next Steps |
|--------|--------------|-------------|-----------|
| **WON** | retailer| Lead converted to actual purchase order | Order processing, delivery scheduling, post-sale support |
| **LOST** | retailer| Customer chose different RETAILER/brand | Analytics, retargeting, quality review |
| **ABANDONED** | System | No activity for 60+ days OR customer explicitly declined | Lead quality analysis, follow-up opportunities |
| **REASSIGNED** | retailer| Lead transferred to different sales rep or retailer| Tracking, SLA adjustment, territory management |
| **CANCELLED** | retaileror Manufacturer | Active order was cancelled after initial purchase | Order management, return logistics, reversal |
| **DUPLICATE** | DMS/retailer| Lead is duplicate of existing record | Deduplication, data cleanup |

### 3.2 Closure Reasons (Won)

```
CUSTOMER_PURCHASED_asset
CUSTOMER_PURCHASED_asset_DIFFERENT_TRIM
CUSTOMER_PURCHASED_asset_DIFFERENT_BRAND
CUSTOMER_FINANCED_WITH_RETAILER
CUSTOMER_FINANCED_WITH_THIRD_PARTY
TRADE_IN_ACCEPTED
EXTENDED_WARRANTY_ADDED
SERVICE_PACKAGE_ADDED
```

### 3.3 Closure Reasons (Lost)

```
CUSTOMER_CHOSE_COMPETITOR
CUSTOMER_PRICE_OBJECTION
CUSTOMER_TIMING_ISSUE
CUSTOMER_CREDIT_DECLINED
CUSTOMER_UNRESPONSIVE
CUSTOMER_ACCIDENT_OR_EVENT
CUSTOMER_DECEASED
DUPLICATE_LEAD
INVALID_CONTACT_INFO
```

---

## 4. Lead Source Enhancement: Detailed Source Information

### 4.1 Enhanced sourceDetail Structure

While the LEAD message has basic `source` enum, the LEAD_CLOSURE should include enriched source context:

```json
"originalLeadSource": "MANUFACTURER_WEBSITE",
"originalSourceURL": "https://toyota.com/shop/leads/intake",
"leadSourceDetail": {
  "sourceType": "MANUFACTURER_WEBSITE",
  "sourceURL": "https://toyota.com/camry/build-and-price",
  
  // ===== CHANNEL INFORMATION =====
  "channel": "DIGITAL",
  "subChannel": "MANUFACTURER_WEBSITE",
  "specificPage": "/camry/shop/leads",
  "campaignCode": "SPRING_2026_HYBRID",
  "campaignName": "Spring 2026 Hybrid Promotion",
  "marketingSource": "PAID_SEARCH",
  "adNetwork": "GOOGLE_ADS",
  
  // ===== DEVICE & BEHAVIOR =====
  "deviceType": "MOBILE",
  "deviceOS": "iOS",
  "referrerURL": "https://google.com/search?q=2026+toyota+camry+hybrid",
  "leadEntryMethod": "FORM_SUBMISSION",
  "formName": "BuildAndPrice_LeadCapture_v2",
  
  // ===== GEOGRAPHIC & TEMPORAL =====
  "submissionTimezone": "America/Los_Angeles",
  "submissionDayOfWeek": "Sunday",
  "estimatedLeadQualityTier": "HIGH",
  "leadScoreAtSubmission": 8.5,
  
  // ===== TRACKING =====
  "sessionId": "SESSION-2026-ABC-123456",
  "cookieConsent": true,
  "gclid": "Google_Click_ID_Value",
  "fbclid": "Facebook_Click_ID_Value"
}
```

### 4.2 Source Types & Examples

| Source Type | Example URLs | Details |
|-------------|--------------|---------|
| **MANUFACTURER_WEBSITE** | toyota.com, ford.com, harley-davidson.com | Direct OEM sales channel |
| **RETAILER_WEBSITE** | johndoe-toyota.com, RETAILER.com | Individual retaileror group site |
| **THIRD_PARTY_PORTAL** | autotrader.com, trucar.com, cargurus.com | Lead aggregators |
| **RETAILER_CRM** | CDK, Reynolds, Vroom CMS | Internal retailersystems |
| **MOBILE_APP** | ford-official-app, toyota-app | Native mobile applications |
| **SOCIAL_MEDIA** | facebook.com/retailer instagram.com/brand | Social platform leads |
| **PHONE_IVR** | +1-800-TOYOTA-1 | Phone system conversion |
| **SHOWROOM_KIOSK** | In-retail location iPad form | Physical location submission |
| **EMAIL_CAMPAIGN** | newsletter.example.com | Email marketing response |
| **FACEBOOK_LEAD_FORM** | facebook.com/lead | Facebook lead form |
| **GOOGLE_FORMS** | forms.google.com | Google form submission |
| **CUSTOM_INTEGRATION** | api.fleet-partner.com | B2B integrations |

---

## 5. Two-Wheeler & Motorcycles: Lead Closure Example

### Scenario: Harley-Davidson Motorcycle Lead

```json
{
  "LEX": {
    "header": {
      "messageId": "MSG-2026-CLO-000456",
      "messageType": "LEAD_CLOSURE",
      "version": "1.0",
      "timestamp": "2026-03-15T16:45:00Z",
      "senderId": "RETAILER-HARLEY-CHICAGO",
      "receiverId": "MFGR-HARLEY-DAVIDSON"
    },
    "payload": {
      "leadClosure": {
        "originalLeadId": "LEAD-2026-MOTO-001",
        "originalLeadSource": "MANUFACTURER_WEBSITE",
        "originalSourceURL": "https://harley-davidson.com/shop",
        "leadCreatedDate": "2026-02-15T14:20:00Z",
        "leadClosureDate": "2026-03-15T16:45:00Z",
        "leadLifecycleDays": 28,
        
        "closureStatus": "WON",
        "closureReason": "CUSTOMER_PURCHASED_asset",
        "closureDetail": {
          "purchaseConfirmed": true,
          "orderPlacedDate": "2026-03-14T11:00:00Z",
          "actualDeliveryDate": "2026-05-10",
          "dealAmount": 18500.00,
          "currency": "USD"
        },
        
        // ===== TWO-WHEELER SPECIFIC =====
        "purchasedProduct": {
          "productType": "MOTORCYCLE",
          "assetClass": "AUTOMOTIVE",
          "manufacturer": "Harley-Davidson",
          "model": "Street 750",
          "year": 2026,
          "engineSize": 750,
          "engineType": "V-TWIN",
          "transmission": "BELT_DRIVE",
          "color": "Vivid Black",
          
          // Motorcycle-specific attributes
          "typeSpecificAttributes": {
            "engineDisplacement": 750,
            "enginePower": 53,
            "engineTorque": 50,
            "maxSpeed": 190,
            "fuelCapacity": 8.7,
            "seatHeight": 755,
            "dryCurb": 194,
            "groundClearance": 135,
            "brakeType": "ABS_EQUIPPED",
            "absAvailable": true,
            "tireSize": "100/90-R19",
            "licensingClass": "MOTORCYCLE_STANDARD"
          }
        },
        
        "customerOutcome": {
          "customerId": "CUST-HD-98765",
          "purchaseConfirmed": true,
          "financingUsed": true,
          "financingType": "RETAILER_ARRANGED",
          "financingAmount": 14000.00,
          "downPayment": 4500.00,
          "tradeInAccepted": true,
          "tradeInasset": "2015 Harley-Davidson Street 500",
          "tradeInValue": 5000.00,
          "estimatedDeliveryDate": "2026-05-10T00:00:00Z",
          "staffingerCourseIncluded": true,
          "insuranceRecommended": true
        },
        
        "RETAILERNotes": "First-time motorcycle buyer. Completed MSF safety course. Package includes ABS, custom seat, and riding gear. Customer very satisfied with experience.",
        
        "metrics": {
          "interactionCount": 3,
          "showroomVisits": 2,
          "testDrivesCompleted": 2,
          "RETAILERQualityScore": 9.5,
          "customerSatisfactionRating": 5.0
        },
        
        "organizationContext": {
          "RETAILERData": {
            "RETAILERLeadId": "HD-CHICAGO-7890",
            "saleRepId": "SR-101",
            "saleRepName": "Mike Harley",
            "specialization": "MOTORCYCLE_SALES"
          },
          "manufacturerData": {
            "mfgrLeadId": "HD-2026-STREET750-001",
            "regionCode": "NA-MIDWEST",
            "modelSpecialty": "STREET_SERIES"
          }
        },
        
        "metadata": {
          "createdBy": "RETAILER-HARLEY-CHICAGO",
          "createdBySystem": "HARLEY_CMS_v6.1",
          "gdprCompliant": true
        }
      }
    }
  }
}
```

---

## 6. Two-Wheeler-Focused Sourcing: India Market Example

### Scenario: Two-Wheeler Lead from Indian Manufacturer

```json
{
  "LEX": {
    "header": {
      "messageId": "MSG-2026-CLO-000789",
      "messageType": "LEAD_CLOSURE",
      "version": "1.0",
      "timestamp": "2026-03-15T18:30:00Z",
      "senderId": "RETAILER-HERO-DELHI",
      "receiverId": "MFGR-HERO-MOTORCYCLES"
    },
    "payload": {
      "leadClosure": {
        "originalLeadId": "LEAD-2026-TW-IN-001",
        "originalLeadSource": "MANUFACTURER_WEBSITE",
        "originalSourceURL": "https://heromotocorp.com/en-IN/2-wheelers",
        "leadSourceDetail": {
          "sourceType": "MANUFACTURER_WEBSITE",
          "channel": "DIGITAL",
          "subChannel": "MANUFACTURER_WEBSITE_INDIA",
          "campaignCode": "MONSOON_2026_SCOOTER",
          "campaignName": "Monsoon 2026 Scooter Promotion",
          "deviceType": "MOBILE",
          "submissionTimezone": "Asia/Kolkata"
        },
        
        "leadCreatedDate": "2026-01-20T09:15:00Z",
        "leadClosureDate": "2026-03-15T18:30:00Z",
        "leadLifecycleDays": 54,
        
        "closureStatus": "WON",
        "closureReason": "CUSTOMER_PURCHASED_asset",
        
        // ===== TWO-WHEELER (SCOOTER) SPECIFIC =====
        "purchasedProduct": {
          "productType": "ELECTRIC_SCOOTER",  // Increasingly popular in India
          "assetClass": "MOBILITY",
          "manufacturer": "Hero MotoCorp",
          "model": "Electric Dash",
          "year": 2026,
          
          "typeSpecificAttributes": {
            "motorPower": 4000,
            "motorType": "BRUSHLESS_DC",
            "batteryCapacity": 60,
            "batteryType": "LITHIUM_ION",
            "maxSpeed": 80,
            "range": 120,
            "chargingTime": 5.5,
            "weight": 120,
            "seatHeight": 800,
            "groundClearance": 180,
            "maximumLoadCapacity": 150,
            "waterResistance": "IPX7",
            "features": [
              "REGENERATIVE_BRAKING",
              "APP_CONTROL",
              "GPS_TRACKING",
              "EMERGENCY_BRAKE_LIGHT",
              "CRUISE_CONTROL",
              "DIGITAL_DISPLAY"
            ]
          }
        },
        
        "customerOutcome": {
          "customerId": "CUST-HERO-IN-45123",
          "purchaseConfirmed": true,
          "financingUsed": true,
          "financingType": "GOVERNMENT_SUBSIDY_WITH_EMI",
          "financingAmount": 60000,
          "downPayment": 15000,
          "monthlyEMI": 3500,
          "governmentSubsidyApplied": true,
          "subsidyAmount": 20000,
          "estimatedDeliveryDate": "2026-04-05T00:00:00Z"
        },
        
        "RETAILERNotes": "Customer purchased for daily commute to office. Applied for government EV subsidy. Opted for home charging installation. Delivery to residential address in Delhi suburbs.",
        
        "organizationContext": {
          "RETAILERData": {
            "RETAILERLeadId": "HERO-DELHI-001",
            "RETAILERName": "Hero Delhi Central",
            "RETAILERCity": "New Delhi",
            "RETAILERState": "Delhi",
            "RETAILERCountry": "India"
          },
          "manufacturerData": {
            "mfgrLeadId": "HERO-IN-2026-ESCOOTER-001",
            "regionCode": "IN-NORTH",
            "stateOffice": "DELHI_OFFICE",
            "subsidyProgramCode": "INDIA_EV_INCENTIVE_2026"
          }
        },
        
        "metadata": {
          "createdBy": "RETAILER-HERO-DELHI",
          "createdBySystem": "HERO_RETAILER_CMS_v5.2",
          "countryCode": "IN",
          "currencyCode": "INR",
          "gdprCompliant": true
        }
      }
    }
  }
}
```

---

## 7. Routing & Message Flow

### 7.1 LEAD_CLOSURE Routing Decision Tree

```
Lead closure received at retailerCRM
    ↓
[STEP 1] Extract original lead source
    ├─ MANUFACTURER_WEBSITE → Route to Manufacturer  
    ├─ RETAILER_WEBSITE → Route to RETAILER
    ├─ THIRD_PARTY_PORTAL → Route to Platform/Aggregator
    └─ OTHER → Route to source system in organizationContext
    ↓
[STEP 2] Enrich with DMS information
    ├─ Add dmsLeadId from organizationContext.dmsData
    ├─ Update DMS status from "OPEN" to "CLOSED_WON" or "CLOSED_LOST"
    └─ Update DMS metrics (cycle time, deal amount)
    ↓
[STEP 3] Route through chain
    retailer→ DMS → Manufacturer/Platform → Original Source
    ↓
[STEP 4] Update all endpoints
    ├─ Manufacturer updates internal lead record
    ├─ DMS marks lead closed
    ├─ Platform updates lead status  
    └─ Original source shows lead converted
```

### 7.2 Multi-Organizational Reference Chain

```
LEAD_CLOSURE preserves all org IDs in single message:

{
  "organizationContext": {
    "RETAILERData": {
      "RETAILERLeadId": "ABC-MAIN-5555"      // retailers ID
    },
    "dmsData": {
      "dmsLeadId": "CDK-2026-555-ABC"      // DMS's ID
    },
    "manufacturerData": {
      "mfgrLeadId": "TY-LEAD-9999-ABC"     // Manufacturer's ID
    },
    "platformData": {
      "platformLeadId": "AT-2026-999-LED"  // Platform's ID
    }
  }
}

All four systems can track the same Lead using their own ID!
```

---

## 8. Message Sequence Diagrams

### 8.1 Complete Lead Lifecycle with Closure

```
TIMELINE:
Day 1     → Lead created by customer on manufacturer.com
Day 1     → Lead reaches retailervia DMS
Day 1-28  → retailerengages customer (visits, calls, test drives)
Day 28    → Customer decides to purchase
Day 28    → retailercompletes order paperwork
Day 28    → retailersends LEAD_CLOSURE(WON) message
Day 29    → Message reaches DMS, updates to CLOSED_WON
Day 29    → Message reaches Manufacturer, updates customer record
Day 29    → Message reaches AutoTrader, marks lead converted
Day 29    → Manufacturer can send promotions to customer for accessories
Day 60    → asset delivered to customer

SENDER CHAIN:
retailer→ DMS → Manufacturer → Platform → Original Lead Source Updates
```

### 8.2 Lost Lead with Feedback

```
TIMELINE:
Day 1     → Lead created on retailerwebsite
Day 1     → retailerapproaches customer
Day 7     → Customer unresponsive, no follow-up
Day 30    → retailersends LEAD_CLOSURE(ABANDONED) message
Day 30    → Message reaches retailers system, archives lead
Day 31    → retailerCRM can retarget customer with different offer
Day 35    → Marketing team analyzes abandoned leads for insights

CLOSURE MESSAGE INCLUDES:
- Reason: "CUSTOMER_UNRESPONSIVE"
- Lifecycle length: 30 days
- Total interactions: 2
- Final quality score: 3.2/10
- Decision: Not worth further outreach
```

---

## 9. Implementation: Developer Guidance

### 9.1 Required Fields for LEAD_CLOSURE

```
Required (Must always include):
- messageType: "LEAD_CLOSURE"
- originalLeadId: Reference to original LEAD message
- closureStatus: WON, LOST, ABANDONED, REASSIGNED, CANCELLED, DUPLICATE
- closureDate: When lead was closed
- organizationContext: All org IDs from original lead

If closureStatus = WON (Very Required):
- purchasedProduct: What customer actually bought
- customerOutcome: Final disposition
- dealAmount: Final deal amount

If closureStatus = LOST (Recommended):
- closureReason: Why lead was lost
- RETAILERNotes: What happened

Metadata (Always):
- ownershipChain: Complete audit trail
- createdBy: Which system created closure
- timestamp: When closure was recorded
```

### 9.2 Validation Rules

```
Rule 1: Every LEAD_CLOSURE must reference a valid originalLeadId
Rule 2: closureStatus value must match defined enum
Rule 3: If status = WON, dealAmount must be >= 0
Rule 4: If status = WON, purchasedProduct is required
Rule 5: leadClosureDate must be >= leadCreatedDate
Rule 6: All org IDs from original lead must be preserved
Rule 7: ownershipChain must show complete path
```

---

## 10. Compliance & Data Management

### 10.1 GDPR / CCPA Considerations

```
Lead Closure contains:
- Actual purchase amount (sensitive)
- Final order ID (identifies customer transaction)
- Deal negotiation details (sensitive)
- Customer satisfaction rating

Handling:
✓ Encrypt sensitive fields in transit (TLS 1.3)
✓ Mask deal amount for storage > 1 year
✓ Allow customer to request deletion
✓ Track data retention period (default: 7 years for tax/compliance)
✓ Separate PII from deal metrics
✓ Enable export of customer data (GDPR right to portability)
```

### 10.2 Data Retention Policies

| Data Type | Retention | Purpose |
|-----------|---------|---------|
| LEAD + LEAD_CLOSURE | 7 years | Tax compliance, warranty |
| Deal Amount | 7 years | Financial audit trail |
| Customer Satisfaction Rating | 2 years | Quality metrics |
| retailerNotes (Free Text) | 1 year | CRM history |
| Session/Device/Click Data | 90 days | Analytics, retargeting |

---

## 11. Real-World Scenarios for Two-Wheelers

### 11.1 Scenario: Three-Wheeler Lead (India Auto-Rickshaw)

```json
"purchasedProduct": {
  "productType": "THREE_WHEELER",
  "assetClass": "COMMERCIAL",
  "manufacturer": "Bajaj Auto",
  "model": "RE Compact Plus",
  "year": 2026,
  "typeSpecificAttributes": {
    "passengerCapacity": 3,
    "engineType": "CNG_PETROL",
    "fuelType": "CNG",
    "txnCapacity": 500,
    "maxSpeed": 50,
    "registrationCategory": "COMMERCIAL",
    "licensingClass": "AUTORICKSHAW"
  }
}
```

### 11.2 Scenario: Electric Bicycle Lead (Europe)

```json
"purchasedProduct": {
  "productType": "ELECTRIC_BICYCLE",
  "assetClass": "MICROMOBILITY",
  "manufacturer": "Riese & Müller",
  "model": "Load 75",
  "year": 2026,
  "typeSpecificAttributes": {
    "motorType": "PEDAL_ASSIST",
    "motorPower": 250,
    "batteryCapacity": 900,
    "range": 150,
    "maximumLoadCapacity": 200,
    "wheelSize": "20_INCH",
    "frameSize": "XL"
  }
}
```

---

## 12. Summary: Why Lead Closure Matters

### For Manufacturers
✅ Track lead conversion rates  
✅ Calculate ROI on marketing campaigns  
✅ Identify high-performing retailer 
✅ Update customer records for post-purchase support  
✅ Enable accessory/service upsells  

### For RETAILERs
✅ Demonstrate closed deals to DMS  
✅ Get credit for sales pipeline contribution  
✅ Close feedback loop with customer sources  
✅ Build relationships with manufacturers  

### For Platforms/Aggregators
✅ Show advertisers their lead quality  
✅ Improve lead scoring algorithms  
✅ Identify which channels convert best  
✅ Charge premium for closed leads  

### For Customers
✅ Manufacturers can follow up appropriately  
✅ retailerremember their preferences  
✅ Right promotions at right time  
✅ Closed-loop customer experience  

---

## 13. Next Steps for Specification

- [ ] Define LEAD_CLOSURE message format formally in LEX_MESSAGE_TYPES.md
- [ ] Create organization-specific closure fields
- [ ] Build closure status validation rules
- [ ] Create closure routing algorithms
- [ ] Define two-wheeler-specific closure payloads
- [ ] Build closure analytics dashboard specifications
- [ ] Create closure event webhook specifications

---

**Last Updated:** March 23, 2026  
**Status:** Ready for Integration with Core LEX Specification  
**Target Implementation:** Phase 2 (Haxe Core Development)

