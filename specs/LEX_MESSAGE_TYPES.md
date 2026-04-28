<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright (c) 2026 LEX Lead Exchange Standard Contributors -->
<!-- Canonical specification: https://lexstandard.org -->

# LEX Message Types Reference

## Overview

LEX defines four primary message types for the lead exchange ecosystem. Each message type has specific purposes, required fields, and response expectations.

---

## 1. LEAD Message

### Purpose
The primary message type for creating, updating, and querying lead information across the automotive ecosystem.

### Message Direction
**Bidirectional** - Both send and receive

### Use Cases
- retailer sends new lead to manufacturer
- Manufacturer sends lead status update back to retailer
- DMS requests lead information
- Updates on lead status transitions

### Message Structure

```json
{
  "lex": {
    "header": { /* Standard header */ },
    "payload": {
      "lead": {
        "leadId": "string",
        "status": "enum",
        "source": "enum",
        "sourceDetail": { /* optional */ },
        "customer": { /* required */ },
        "desiredProduct": { /* required */ },
        "tradeIn": { /* optional */ },
        "financing": { /* optional */ },
        "metadata": { /* required */ },
        "subscriptionPreferences": { /* optional */ }
      }
    }
  }
}
```

### Lead Status Values

The **full lead lifecycle** includes 15 distinct status values supporting:
- **Initial phases:** CART, SHOPPING, EXPLORING
- **Intent phases:** EXPRESSED_INTEREST, RESERVATION, APPOINTMENT_REQUEST
- **Negotiation phase:** IN_NEGOTIATION
- **Deal/Order phases:** ORDER, ORDER_CONFIRMED, IN_DELIVERY, DELIVERED
- **Test drive cycle:** TEST_DRIVE_REQUESTED, TEST_DRIVE_COMPLETED (can revert to SHOPPING)
- **Final states:** ARCHIVED

| Status | Meaning | Transitions | Description |
|--------|---------|-----------|-------------|
| CART | Shopping cart | → SHOPPING, EXPLORING, TEST_DRIVE_REQUESTED, ABANDONED | Customer adds asset to cart; data collection phase |
| SHOPPING | Customer browsing | → CART, EXPLORING, TEST_DRIVE_REQUESTED, EXPRESSED_INTEREST, SHOPPING (refresh) | Passive research phase, comparing options |
| EXPLORING | Active comparison | → SHOPPING, EXPRESSED_INTEREST, TRADE_IN, EXPLORING (refresh), ABANDONED | Customer actively comparing models, reviews, specs |
| TEST_DRIVE_REQUESTED | Test drive scheduled | → TEST_DRIVE_COMPLETED, SHOPPING, ABANDONED | Customer has requested test drive without purchase intent |
| TEST_DRIVE_COMPLETED | Test drive finished | → SHOPPING, EXPRESSED_INTEREST, EXPLORING, ABANDONED | Test drive completed; customer evaluating experience |
| TRADE_IN | Trade-in evaluation | → SHOPPING, EXPRESSED_INTEREST, EXPLORING, ABANDONED | Trade-in valuation in progress |
| EXPRESSED_INTEREST | Formal interest stated | → RESERVATION, APPOINTMENT_REQUEST, IN_NEGOTIATION, SHOPPING, ABANDONED | Customer explicitly interested in specific asset/variant |
| RESERVATION | Provisional booking | → APPOINTMENT_REQUEST, IN_NEGOTIATION, SHOPPING, ABANDONED | asset on hold; booking confirmed |
| APPOINTMENT_REQUEST | Visit scheduled | → IN_NEGOTIATION, SHOPPING, EXPLORING, ABANDONED | Showroom appointment scheduled or requested |
| IN_NEGOTIATION | Deal negotiation | → ORDER, SHOPPING, EXPLORING, ABANDONED | Active deal negotiation process with retailer |
| ORDER | Purchase committed | → ORDER_CONFIRMED, IN_DELIVERY, ABANDONED | Final order placed; pending confirmation |
| ORDER_CONFIRMED | Order confirmed | → IN_DELIVERY, ORDER, DELIVERED, ABANDONED | Order confirmed by retailer and customer; ready for delivery |
| IN_DELIVERY | In transit | → DELIVERED, ABANDONED | asset in delivery pipeline; not yet at customer |
| DELIVERED | asset delivered | → ARCHIVED | Final delivery completed; lead converted to customer |
| ARCHIVED | Historical record | (none - final state) | Completed, abandoned, or historical lead; no further transactions |

### Lead Type Values

LEX supports distinct lead types to categorize the nature of the lead:

| Type | Purpose | Typical Status Values | Description |
|------|---------|----------------------|-------------|
| PRIMARY | Primary asset purchase | CART → SHOPPING → ORDER → DELIVERED | Main asset lead; baseline product |
| CART | Shopping cart stage | CART, SHOPPING, ABANDONED | Customer browsing without purchase intent |
| TEST_DRIVE | Test drive request | TEST_DRIVE_REQUESTED, TEST_DRIVE_COMPLETED, SHOPPING, ABANDONED | Customer wants test drive; may not lead to purchase |
| TRADE_IN_EVALUATION | Trade-in appraisal | TRADE_IN, SHOPPING, ABANDONED | Customer evaluating trade-in of current asset |
| POST_ORDER | Post-order parent lead | ORDER, DELIVERED | Parent lead for tracking post-sale accessories/services |
| CROSS_SELL | Cross-sell opportunity | SHOPPING, EXPRESSED_INTEREST, ORDER, ABANDONED | Secondary asset or cross-sell offer |
| ACCESSORY | Accessories/add-ons | SHOPPING, EXPRESSED_INTEREST, ORDER, ABANDONED | asset accessories (seat packages, paint protection, wheels, audio) linked to primary order |
| PROTECTION_PLAN | Warranty/protection | SHOPPING, EXPRESSED_INTEREST, ORDER, ABANDONED | Extended warranty, gap insurance, maintenance plans |
| SUBSCRIPTION | Subscription services | SHOPPING, EXPRESSED_INTEREST, ORDER, ABANDONED | Telematics, charging network, navigation, roadside assistance |
| RETAILER_INSTALLED_OPTION | retailer upgrades | SHOPPING, EXPRESSED_INTEREST, ORDER, ABANDONED | Aftermarket retailer-installed options (performance, customization) |
| SERVICE_UPGRADE | Service offerings | SHOPPING, EXPRESSED_INTEREST, ORDER, ABANDONED | Service-related upgrades (detailing, maintenance, loaner programs) |

### Lead Source Values

| Source | Meaning | Category | Description |
|--------|---------|----------|-------------|
| CART | Shopping cart | Ecommerce | Active shopping cart baseline |
| TEST_DRIVE_REQUEST | Test drive request | Engagement | Customer requests test drive experience |
| ECOMMERCE_SHOPPING_CART | Ecommerce cart | Ecommerce | Abandoned or active shopping cart |
| RETAILER_WEBSITE | retailer's web portal | Web | Customer submitted form on retailer site |
| RETAILER_CRM | retailer CRM system | Internal | Entered directly in retailer CRM |
| MANUFACTURER_WEBSITE | Manufacturer portal | Web | Customer filled form on OEM website |
| THIRD_PARTY_PORTAL | External lead provider | Partner | From lead aggregator (AutoTrader, TrueCar, etc.) |
| DIRECT_CALL | Phone inquiry | Phone | Phone/voice lead converted to digital |
| SHOWROOM_WALK_IN | In-person showroom visit | Physical | Customer visited retailer location in person |
| SHOWROOM | In-person visit | Physical | Customer visited retailer location |
| TRADE_IN_EVALUATION | Trade-in inquiry | Engagement | Initiated by trade-in appraisal process |
| SERVICE_DEPARTMENT | Service upgrade | Internal | Existing customer from service records |
| SOCIAL_MEDIA | Social platform | Social | From Facebook, Instagram, TikTok |
| EMAIL_CAMPAIGN | Marketing email | Email | Response to promotional campaign |
| REFERRAL | Customer referral | Word-of-mouth | Referred by existing customer |
| MOBILE_APP | Native mobile application | App | From brand or retailer mobile app |
| SOCIAL_LEAD_FORM | Facebook/LinkedIn Lead Form | Social | Direct form from social platform |
| PHONE_IVR | Automated phone system | Phone | Phone system lead conversion |
| SHOWROOM_KIOSK | In-retailer location kiosk | Physical | Digital form at physical location |
| POST_ORDER_SUGGESTION | Post-order suggestion | Post-Order | Suggested after primary asset order |
| POST_DELIVERY_OFFER | Post-delivery offer | Post-Order | Offered after asset delivery |
| RETAILER_SUGGESTION | retailer-initiated suggestion | Sales | Suggested by sales or retailer staff |
| NURTURE_CAMPAIGN | Nurture/follow-up campaign | Marketing | Automated follow-up campaign |
| ECOMMERCE_PLATFORM | General ecommerce | Ecommerce | Generic ecommerce source |
| CARS_PLATFORM | Cars online platform | Platform | Standard ecommerce platform |
| OTHER | Custom source | Other | Any other source |

### Required Fields for LEAD

- `leadId` - Unique identifier
- `status` - Current lead status (enum)
- `source` - Lead source system
- `customer` - Customer information block
- `desiredProduct` - asset preferences
- `metadata` - Tracking and audit information

### Optional Fields

- `sourceDetail` - Additional source context
- `tradeIn` - Trade-in asset information
- `financing` - Financing preferences
- `subscriptionPreferences` - Notification preferences



### Non-Linear Lead Progression Examples

LEX supports **non-linear lead progression**, where customers can move back and forth between statuses as they reconsider options:

**Example 1: Cart → Test Drive → Back to Shopping**
```
Customer Journey:
1. CART (2024-01-05) - Customer adds Tesla Model 3 to cart
2. SHOPPING (2024-01-08) - Reviews asset details for 3 days
3. TEST_DRIVE_REQUESTED (2024-01-10) - Requests test drive
4. TEST_DRIVE_COMPLETED (2024-01-12) - Test drive completed, not ready to buy
5. SHOPPING (2024-01-15) - Returns to shopping after research
6. EXPRESSED_INTEREST (2024-01-20) - Now ready to discuss purchase
7. ORDER ( 2024-01-25) - Places order
8. DELIVERED (2024-02-10) - asset delivered

Status Flow: CART → SHOPPING → TEST_DRIVE_REQUESTED → TEST_DRIVE_COMPLETED → SHOPPING → EXPRESSED_INTEREST → ORDER → DELIVERED
(Note: Reversal from TEST_DRIVE_COMPLETED back to SHOPPING is non-linear but supported)
```

**Example 2: Negotiation → Reconsider → Back to Exploring**
```
Customer Journey:
1. SHOPPING (2024-01-10) - Initial browsing
2. EXPRESSED_INTEREST (2024-01-12) - Shows strong interest in BMW 3 Series
3. IN_NEGOTIATION (2024-01-15) - retailer makes offer, negotiation starts
4. SHOPPING (2024-01-18) - Customer wants more time to research, backs out of negotiation
5. EXPLORING (2024-01-22) - Exploring other brands (Mercedes, Audi)
6. EXPRESSED_INTEREST (2024-01-28) - Back interested in BMW after research
7. IN_NEGOTIATION (2024-02-01) - Renewed negotiation
8. ORDER (2024-02-05) - Deal closed
9. ORDER_CONFIRMED (2024-02-06) - Confirmed by retailer
10. IN_DELIVERY (2024-02-10) - asset in delivery pipeline
11. DELIVERED (2024-02-20) - Delivered to customer

Status Flow: SHOPPING → EXPRESSED_INTEREST → IN_NEGOTIATION → SHOPPING → EXPLORING → EXPRESSED_INTEREST → IN_NEGOTIATION → ORDER → ORDER_CONFIRMED → IN_DELIVERY → DELIVERED
(Note: Non-linear reversion from IN_NEGOTIATION → SHOPPING and back shows customer reconsideration)
```

**Example 3: Trade-In Evaluation Scenario**
```
Customer Journey:
1. SHOPPING (2024-01-10) - Browsing new assets
2. EXPRESSED_INTEREST (2024-01-12) - Interested in Toyota RAV4
3. TRADE_IN (2024-01-15) - Wants to trade in current Honda Civic
4. SHOPPING (2024-01-18) - Trade-in value too low, reconsidering
5. EXPLORING (2024-01-25) - Looking at other options without trade-in
6. EXPRESSED_INTEREST (2024-02-01) - Back to RAV4, without trade-in
7. IN_NEGOTIATION (2024-02-05) - Deal negotiation on pure purchase
8. ORDER (2024-02-10) - Order placed
9. DELIVERED (2024-03-01) - Delivered

Status Flow: SHOPPING → EXPRESSED_INTEREST → TRADE_IN → SHOPPING → EXPLORING → EXPRESSED_INTEREST → IN_NEGOTIATION → ORDER → DELIVERED
(Note: Reversion from TRADE_IN → SHOPPING shows customer changing strategy mid-process)
```

### Post-Order Lead Relationships

After a primary asset order is placed and delivered, retailers create **related post-order leads** for cross-sell items:

**Example: Primary asset Order with Post-Order Accessories & Services**
```
Primary Lead: asset Order
├── leadId: ORD-20240115-ast-001
├── leadType: PRIMARY
├── status: DELIVERED (2024-02-20)
└── relatedLeadIds: [ACC-001, PROT-001, SUB-001, DIO-001]

Post-Order Child Leads (created after ORDER status):
├── ACC-001 (Accessory Lead)
│   ├── leadType: ACCESSORY
│   ├── parentOrderId: ORD-20240115-ast-001
│   ├── relatedProducts.accessories: [M-Sport Package, Premium Audio]
│   └── status: SHOPPING → EXPRESSED_INTEREST → ORDER
│
├── PROT-001 (Protection Plan Lead)
│   ├── leadType: PROTECTION_PLAN
│   ├── parentOrderId: ORD-20240115-ast-001
│   ├── relatedProducts.protectionPlans: [Extended Warranty, Gap Insurance]
│   └── status: SHOPPING → ORDER
│
├── SUB-001 (Subscription Lead)
│   ├── leadType: SUBSCRIPTION
│   ├── parentOrderId: ORD-20240115-ast-001
│   ├── relatedProducts.subscriptions: [Premium Telematics, Charging Network]
│   └── status: SHOPPING → EXPRESSED_INTEREST → ORDER
│
└── DIO-001 (retailer Options Lead)
    ├── leadType: RETAILER_INSTALLED_OPTION
    ├── parentOrderId: ORD-20240115-ast-001
    ├── relatedProducts.retailerInstalledOptions: [Roof Rack, Performance Suspension]
    └── status: SHOPPING → ABANDONED

Total Deal Value Tracking:
├── Primary asset: $50,000
├── Accessories: $2,500
├── Protection Plan: $1,500
├── Subscriptions (initial): $288 (first year)
└── Total: $54,288 (+8.6% cross-sell value)
```

### Lead Ancestry Tracking

LEX tracks the **complete origin and conversion path** of every lead:

**Example: Lead originating from shopping cart**
```json
"leadAncestry": {
  "originType": "ECOMMERCE_SHOPPING_CART",
  "originDate": "2024-01-05T08:15:00Z",
  "originSourceId": "CART-20240105-5f3c9",
  "conversionPath": [
    {
      "stage": "CART",
      "timestamp": "2024-01-05T08:15:00Z",
      "source": "ECOMMERCE_SHOPPING_CART"
    },
    {
      "stage": "SHOPPING",
      "timestamp": "2024-01-08T15:30:00Z",
      "source": "CUSTOMER_REVIEW"
    },
    {
      "stage": "TEST_DRIVE_REQUESTED",
      "timestamp": "2024-01-10T11:00:00Z",
      "source": "CUSTOMER_ACTION"
    },
    {
      "stage": "TEST_DRIVE_COMPLETED",
      "timestamp": "2024-01-12T14:00:00Z",
      "source": "RETAILER_SHOWROOM"
    },
    {
      "stage": "EXPRESSED_INTEREST",
      "timestamp": "2024-01-20T09:30:00Z",
      "source": "SALESPERSON"
    },
    {
      "stage": "ORDER",
      "timestamp": "2024-01-25T16:30:00Z",
      "source": "DEAL_CLOSED"
    },
    {
      "stage": "DELIVERED",
      "timestamp": "2024-02-20T14:00:00Z",
      "source": "DELIVERY"
    }
  ]
}
```

This ancestry allows tracking:
- **Time to conversion** (CART to DELIVERED = 46 days)
- **Key milestones** (test drive, deal closure)
- **Attribution** (which stage contributed to final sale)
- **Customer behavior** (reversion patterns, engagement depth)

---

## Lead Source Values & Expanded Categories

### Lead Source Detail (sourceDetail)

The optional `sourceDetail` field provides rich context about where a lead originated:

```json
"sourceDetail": {
  // === BASIC SOURCE INFORMATION ===
  "sourceType": "MANUFACTURER_WEBSITE",           // Which type
  "sourceURL": "https://toyota.com/camry/shop",  // Exact URL
  "specificPage": "/build-and-price",             // Page path
  "pageTitle": "Build and Price - 2026 Camry",   // Page name
  
  // === CHANNEL & CAMPAIGN INFO ===
  "channel": "DIGITAL",                           // DIGITAL, PHONE, PHYSICAL, PARTNER
  "subChannel": "MANUFACTURER_WEBSITE",           // More specific
  "campaignCode": "SPRING_2026_HYBRID",           // Marketing campaign
  "campaignName": "Spring 2026 Hybrid Promotion", // Campaign display name
  "marketingSource": "PAID_SEARCH",               // How customer arrived: ORGANIC, PAID_SEARCH, SOCIAL, EMAIL, REFERRAL, DIRECT
  "adNetwork": "GOOGLE_ADS",                      // GOOGLE_ADS, FACEBOOK, LINKEDIN, BING, etc.
  "adCampaignId": "campaign-12345",               // Ad platform ID
  "keywordUsed": "2026 Toyota Camry Hybrid",      // Search keyword that led here
  
  // === DEVICE & BROWSER INFO ===
  "deviceType": "MOBILE",                         // MOBILE, DESKTOP, TABLET, KIOSK
  "deviceOS": "iOS",                              // iOS, Android, Windows, MacOS
  "browser": "Safari",                            // Safari, Chrome, Firefox, Edge
  "referrerURL": "https://google.com/search",     // Referring website
  
  // === FORM & SUBMISSION ===
  "leadEntryMethod": "FORM_SUBMISSION",           // FORM_SUBMISSION, PHONE, CHAT, LIVE_AGENT, KIOSK
  "formName": "LeadCapture_BuildAndPrice_v2",     // Form identifier
  "formVersion": "2.1",                           // Form version
  "fieldsCompleted": 8,                           // How many form fields were filled
  "fieldsRequired": 8,                            // Total required fields
  "completionPercentage": 100,                    // Form completion %
  "formCompletionTime": 240,                      // Seconds to complete form
  
  // === TIMING & GEOGRAPHY ===
  "submissionTimezone": "America/Los_Angeles",    // Customer's timezone
  "submissionTime": "2026-03-15T14:30:00Z",       // When form submitted
  "submissionDayOfWeek": "Saturday",              // Behavioral data
  "estimatedCustomerLocation": "California",      // Geo-targeting
  "languagePreference": "en-US",                  // Language of submission
  
  // === LEAD QUALITY SIGNALS ===
  "estimatedLeadQuality": "HIGH",                 // HIGH, MEDIUM, LOW
  "leadQualityScore": 8.5,                        // 0-10 score at submission
  "emailValid": true,                             // Email validation
  "phoneValid": true,                             // Phone validation
  "fraudRiskScore": 0.1,                          // Fraud detection (0-1)
  "doesPhoneMatchEmail": true,                    // Consistency check
  
  // === TRACKING & ATTRIBUTION ===
  "sessionId": "SESSION-2026-ABC-123456",         // Tracking session
  "visitorId": "VIS-2026-XYZ-789",                // Repeat visitor tracking
  "cookieId": "COOKIE-2026-ABC-123",              // Browser cookie
  "cookieConsent": true,                          // Privacy consent given
  "gclid": "CjwKCAiA4JifBhAXEiwA8saucc...",       // Google Click ID
  "fbclid": "ABy2UCkxPqWj0l3h2V...",              // Facebook Click ID
  "utmSource": "google",                          // UTM parameters
  "utmMedium": "cpc",                             // UTM medium
  "utmCampaign": "spring_2026_hybrid",            // UTM campaign
  "utmContent": "camry_hybrid_ad",                // UTM content
  
  // === ADDITIONAL CONTEXT ===
  "parentCompanyDomain": "toyota.com",            // Company owning source
  "partnerNetwork": "TOYOTA_RETAILER_NETWORK",      // If partner/network lead
  "leadBrokerageCompany": null,                   // If from lead broker
  "customFields": {                               // Org-specific fields
    "companySpecificId": "123456",
    "departmentCode": "MARKETING"
  }
}
```

### Source Detail Examples by Source Type

#### Manufacturer Website
```json
"sourceDetail": {
  "sourceType": "MANUFACTURER_WEBSITE",
  "sourceURL": "https://toyota.com/camry/configure",
  "campaignCode": "SPRING_2026_HYBRID",
  "deviceType": "MOBILE",
  "referrerURL": "https://google.com/search?q=2026+camry+hybrid"
}
```

#### retailer Website
```json
"sourceDetail": {
  "sourceType": "RETAILER_WEBSITE",
  "sourceURL": "https://johnsontoyota.com/inventory",
  "retailerCode": "retailer-ABC-MAIN",
  "leadEntryMethod": "FORM_SUBMISSION",
  "formName": "InventoryLead"
}
```

#### Third-Party Portal (AutoTrader, TrueCar, etc.)
```json
"sourceDetail": {
  "sourceType": "THIRD_PARTY_PORTAL",
  "sourceURL": "https://autotrader.com/cars/2026-toyota-camry",
  "platformCode": "AUTOTRADER",
  "platformLeadId": "AT-2026-999-LED",
  "leadQualityScore": 7.8,
  "fraudRiskScore": 0.05
}
```

#### Facebook Lead Form
```json
"sourceDetail": {
  "sourceType": "SOCIAL_LEAD_FORM",
  "sourceURL": "https://facebook.com/toyotaofficial",
  "deviceType": "MOBILE",
  "adNetwork": "FACEBOOK",
  "fbclid": "ABy2UCk...",
  "campaignCode": "FB_SPRING_HYBRID_2026"
}
```

#### Phone IVR / Call Center
```json
"sourceDetail": {
  "sourceType": "PHONE_IVR",
  "channel": "PHONE",
  "phoneNumber": "+1-800-TOYOTA-1",
  "ivrMenuPath": "1->2->3",
  "agentId": "AGENT-2458",
  "callDuration": 420,
  "callRecordingId": "CALL-20260315-ABC"
}
```

---

### Example LEAD Message

See `examples/json-edi-lead.json` and `examples/xml-edi-lead.xml`

---

## 2. ASSET Message

### Purpose
Share asset specifications, availability, inventory status, and pricing information between systems.

### Message Direction
**Typically one-way** (manufacturer/retailer → interested parties)

### Use Cases
- Manufacturer publishes new model availability
- retailer updates inventory status
- System queries available assets
- asset specification publication

### Message Structure

```json
{
  "lex": {
    "header": { /* Standard header */ },
    "payload": {
      "asset": {
        "assetId": "string",
        "vin": "string",
        "specification": { /* required */ },
        "availability": { /* required */ },
        "pricing": { /* required */ },
        "images": { /* optional */ },
        "metadata": { /* required */ }
      }
    }
  }
}
```

### asset specification

| Field | Type | Example |
|-------|------|---------|
| Make | String | "Toyota" |
| Model | String | "Camry" |
| Year | Integer | 2026 |
| Trim | String | "LE" |
| BodyType | Enum | "SEDAN", "SUV", "TRUCK" |
| Transmission | Enum | "AUTOMATIC", "MANUAL", "CVT" |
| FuelType | Enum | "GASOLINE", "HYBRID", "ELECTRIC", "DIESEL" |
| Engine | String | "2.5L 4-Cylinder" |
| Horsepower | Integer | 203 |
| MPG_City | Float | 28.5 |
| MPG_Highway | Float | 39.2 |
| Seating | Integer | 5 |
| Cargo | String | "15.1 cu ft" |
| MSRP | Decimal | 28950.00 |
| FeatureList | Array | ["ABS", "Airbags", "Backup Camera"] |

### Availability Status Values

| Status | Meaning |
|--------|---------|
| IN_STOCK | Asset physically available at location |
| ORDERED | Custom order confirmed |
| DISCONTINUED | Model no longer available |
| BACKORDER | On order, expected arrival |
| RESERVED | Held for customer |
| SOLD | Already sold |
| TRANSFERABLE | At another location, can transfer |

### Example ASSET Message

```json
{
  "lex": {
    "version": "1.0.0",
    "header": {
      "messageId": "asset-msg-001",
      "messageType": "asset",
      "timestamp": "2026-03-23T14:30:00Z",
      "senderId": "MANUFACTURER-TOYOTA",
      "receiverId": "retailer-001"
    },
    "payload": {
      "asset": {
        "assetId": "ast-2026-CAMRY-LE-001",
        "vin": "4T1BF1AK6CU000001",
        "specification": {
          "make": "Toyota",
          "model": "Camry",
          "year": 2026,
          "trim": "LE",
          "bodyType": "SEDAN",
          "transmission": "AUTOMATIC",
          "fuelType": "HYBRID",
          "engine": "2.5L 4-Cylinder Hybrid",
          "horsepower": 203,
          "mpgCity": 28.5,
          "mpgHighway": 39.2,
          "seating": 5,
          "cargo": "15.1 cu ft",
          "features": ["ABS", "Airbags", "Backup Camera", "Electronics Parking Brake"]
        },
        "availability": {
          "status": "IN_STOCK",
          "location": "retailer-001",
          "quantityAvailable": 1,
          "lastUpdated": "2026-03-23T14:00:00Z"
        },
        "pricing": {
          "msrp": 28950.00,
          "retailerCost": 25200.00,
          "specialOffers": [
            {
              "description": "Spring Promotion - $1,500 rebate",
              "discount": 1500.00,
              "expirationDate": "2026-04-30"
            }
          ],
          "currency": "USD"
        },
        "images": {
          "exterior": [
            "https://cdn.example.com/toyota-camry-2026-1.jpg",
            "https://cdn.example.com/toyota-camry-2026-2.jpg"
          ],
          "interior": [
            "https://cdn.example.com/toyota-camry-2026-interior-1.jpg"
          ]
        },
        "metadata": {
          "createdAt": "2026-02-01T10:00:00Z",
          "updatedAt": "2026-03-23T14:00:00Z",
          "sourceSystem": "INVENTORY_MANAGEMENT_v3.1",
          "expirationDate": "2026-06-23T14:00:00Z"
        }
      }
    }
  }
}
```

---

## 3. ACKNOWLEDGMENT Message

### Purpose
Confirm receipt, validate processing, and report status of previously sent messages.

### Message Direction
**Response** (always sent in response to another message)

### Use Cases
- Confirm lead receipt
- Validate message format
- Report processing errors
- Request missing information

### Message Structure

```json
{
  "lex": {
    "header": { /* Standard header */ },
    "payload": {
      "acknowledgment": {
        "originalMessageId": "string",
        "status": "enum",
        "errors": [ /* optional */ ],
        "warnings": [ /* optional */ ],
        "processedAt": "datetime",
        "nextSteps": { /* optional */ }
      }
    }
  }
}
```

### Acknowledgment Status Values

| Status | Meaning | HTTP Equivalent | Action Required |
|--------|---------|-----------------|-----------------|
| RECEIVED | Message received, validation in progress | 202 Accepted | Proceed, await further status |
| PROCESSED | Message processed successfully | 200 OK | No action needed |
| REJECTED | Message rejected, errors prevent processing | 400/422 | Fix errors and resubmit |
| ERROR | Server-side error during processing | 500 | Contact support |
| DUPLICATE | Duplicate message detected | 409 Conflict | OK to ignore |

### Error Element

```json
{
  "code": "LEX-003",
  "message": "Missing required field",
  "field": "customer.email",
  "severity": "ERROR",
  "suggestedAction": "Provide email address"
}
```

### Example ACKNOWLEDGMENT Message

```json
{
  "lex": {
    "version": "1.0.0",
    "header": {
      "messageId": "ack-msg-001",
      "messageType": "ACKNOWLEDGMENT",
      "timestamp": "2026-03-23T14:31:00Z",
      "senderId": "MANUFACTURER-ABC",
      "receiverId": "retailer-001",
      "correlationId": "550e8400-e29b-41d4-a716-446655440000"
    },
    "payload": {
      "acknowledgment": {
        "originalMessageId": "550e8400-e29b-41d4-a716-446655440000",
        "status": "PROCESSED",
        "processedAt": "2026-03-23T14:31:00Z",
        "warnings": [
          {
            "code": "LEX-WARN-001",
            "message": "Phone number format assumed US, no country code provided",
            "field": "customer.phone"
          }
        ],
        "nextSteps": {
          "leadId": "LEAD-2026-001234",
          "message": "Lead registered. Awaiting appointment confirmation."
        }
      }
    }
  }
}
```

---

## 4. SUBSCRIPTION Message

### Purpose
Allow systems to subscribe/unsubscribe from specific event streams and lead updates.

### Message Direction
**Bidirectional** - Subscribe and confirmation

### Use Cases
- Subscribe to all new leads from a region
- Request updates for specific asset types only
- Disable specific notification types
- Manage bulk subscription changes

### Message Structure

```json
{
  "lex": {
    "header": { /* Standard header */ },
    "payload": {
      "subscription": {
        "subscriptionId": "string",
        "action": "enum",
        "subscriptionType": "enum",
        "filters": { /* optional */ },
        "deliveryEndpoint": "string",
        "deliveryFormat": "enum",
        "active": "boolean"
      }
    }
  }
}
```

### Subscription Action Values

| Action | Meaning |
|--------|---------|
| SUBSCRIBE | Create new subscription |
| UNSUBSCRIBE | Remove existing subscription |
| UPDATE | Modify existing subscription |
| TEST | Send test message to verify endpoint |

### Subscription Type Values

| Type | Meaning | Example Use |
|------|---------|------------|
| LEAD_UPDATES | All lead status changes | Track all leads from region |
| ASSET_AVAILABILITY | Asset inventory changes | Get new inventory notifications |
| PRICE_UPDATES | Pricing changes | Monitor competitor pricing |
| SERVICE_NOTIFICATIONS | Service reminders | Send maintenance reminders |
| APPOINTMENT_REMINDERS | Appointment coming up | Confirm scheduled visits |
| PROMOTIONAL_OFFERS | Marketing campaigns | Notify current leads of offers |

### Filter Options

```json
{
  "make": ["Toyota", "Honda"],
  "model": ["Camry", "Civic"],
  "year": { "min": 2025, "max": 2026 },
  "bodyType": ["SEDAN", "SUV"],
  "fuelType": ["HYBRID", "ELECTRIC"],
  "priceRange": { "min": 20000, "max": 40000 },
  "location": ["IL", "IN", "MI"],
  "leadStatus": ["EXPRESSED_INTEREST", "RESERVATION"]
}
```

### Example SUBSCRIPTION Message

```json
{
  "lex": {
    "version": "1.0.0",
    "header": {
      "messageId": "sub-msg-001",
      "messageType": "SUBSCRIPTION",
      "timestamp": "2026-03-23T14:30:00Z",
      "senderId": "retailer-001",
      "receiverId": "MANUFACTURER-ABC"
    },
    "payload": {
      "subscription": {
        "subscriptionId": "SUB-retailer-001-HYBRID",
        "action": "SUBSCRIBE",
        "subscriptionType": "LEAD_UPDATES",
        "filters": {
          "fuelType": ["HYBRID", "ELECTRIC"],
          "priceRange": { "min": 25000, "max": 50000 },
          "leadStatus": ["EXPRESSED_INTEREST", "RESERVATION"]
        },
        "deliveryEndpoint": "https://retailer001.api.example.com/lex/webhook",
        "deliveryFormat": "JSON_EDI",
        "active": true
      }
    }
  }
}
```

---

## Message Routing Rules

### When to Send Each Type

| Scenario | Send Message Type | Recipient |
|----------|-------------------|-----------|
| Customer submits lead form | LEAD | Manufacturer/Platform |
| Lead status changes | LEAD (updated) | Lead originator/subscribers |
| Acknowledge message receipt | ACKNOWLEDGMENT | Sender of original |
| New inventory available | asset | Subscribed retailers |
| Subscribe to notifications | SUBSCRIPTION | Manufacturer/Platform |

---

## Message Header Reference

Every lex message shares the following header:

```json
{
  "messageId": "UUID",
  "messageType": "LEAD|ASSET|ACKNOWLEDGMENT|SUBSCRIPTION",
  "timestamp": "ISO8601",
  "senderId": "String (20-50 chars)",
  "receiverId": "String (20-50 chars)",
  "correlationId": "UUID (for responses)",
  "version": "1.0.0"
}
```

---

## Error Codes by Message Type

### LEAD Message Errors

| Code | HTTP | Description |
|------|------|-------------|
| LEX-001 | 400 | Invalid LEAD message format |
| LEX-003 | 400 | Missing required field in LEAD |
| LEX-004 | 422 | Invalid lead status transition |
| LEX-005 | 409 | Duplicate lead (leadId already exists) |
| LEX-010 | 400 | Invalid customer data |
| LEX-011 | 400 | Invalid asset specification |

### ASSET Message Errors

| Code | HTTP | Description |
|------|------|-------------|
| LEX-020 | 400 | Invalid ASSET Message format |
| LEX-021 | 400 | Invalid VIN format |
| LEX-022 | 409 | Duplicate asset (VIN already registered) |

### SUBSCRIPTION Message Errors

| Code | HTTP | Description |
|------|------|-------------|
| LEX-040 | 400 | Invalid SUBSCRIPTION format |
| LEX-041 | 400 | Invalid subscription filter |
| LEX-042 | 422 | Invalid delivery endpoint |

---

**Last Updated:** March 23, 2026  
**Version:** 1.0 (Draft)

