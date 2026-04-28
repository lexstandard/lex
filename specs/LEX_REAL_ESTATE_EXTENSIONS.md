<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright (c) 2026 LEX Lead Exchange Standard Contributors -->
<!-- Canonical specification: https://lexstandard.org -->

# LEX - Real Estate Industry Extension

**Namespace:** `lex.core.realestate`  
**Version:** 1.0.0  
**Status:** Draft  
**Extends:** LEX_SPECIFICATION.md, LEX_MULTI_INDUSTRY.md  
**Registry Entry:** LEX_EXTENSION_REGISTRY.json

---

## Overview

Real estate lead exchange has no dominant open standard equivalent to ADF. The closest comparators are NAR/RESO Web API for property data (inventory-side) and MISMO (Mortgage Industry Standards Maintenance Organization) for loan data. Neither covers the lead lifecycle or buyer-intent signals that LEX addresses.

This extension adds first-class support for:
1. **Structured property attributes** — promoted from `typeSpecificAttributes` freeform bag to a typed schema
2. **Listing information** — MLS number, listing agent, buyer's agent as first-class fields
3. **Property-specific price types** — list price, offer price, appraisal, closing price (parallel to ADF's price model)
4. **Mortgage / pre-approval** — buyer financing qualification status
5. **Multi-party buyer support** — co-applicant / co-buyer for joint purchases
6. **Escrow and closing** — transaction milestone tracking for in-progress deals
7. **Property viewing** — corresponds to the `APPOINTMENT_REQUEST` lifecycle state

---

## 1. Extension Block: `propertyDetails`

Placed at `lex.payload.lead.extensions[]` with namespace `lex.core.realestate`.

```json
{
  "namespace": "lex.core.realestate",
  "version": "1.0.0",
  "producer": "<sender-org-id>",
  "producedAt": "2026-01-03T14:30:00Z",
  "data": {
    "propertyDetails": { ... },
    "listingInfo": { ... },
    "propertyPricing": { ... },
    "mortgageQualification": { ... },
    "coApplicant": { ... },
    "escrowInfo": { ... },
    "viewingHistory": [ ... ]
  }
}
```

---

## 2. `propertyDetails`

Replaces the freeform `typeSpecificAttributes` bag for real estate leads. All fields optional; include applicable ones.

```json
"propertyDetails": {
  "propertyType": "RESIDENTIAL_SINGLE_FAMILY",
  "listingAddress": {
    "street": "12847 Ridgewood Trail",
    "city": "Austin",
    "state": "TX",
    "zipCode": "78738",
    "county": "Travis",
    "country": "US"
  },
  "yearBuilt": 2019,
  "bedroomCount": 4,
  "bathroomCount": 3.5,
  "halfBathCount": 1,
  "squareFeetLiving": 3420,
  "squareFeetLot": 10890,
  "garageSpaces": 2,
  "storeys": 2,
  "pool": false,
  "masterOnMain": false,
  "basementType": "NONE",
  "heatingType": "FORCED_AIR",
  "coolingType": "CENTRAL_AC",
  "roofType": "COMPOSITION_SHINGLE",
  "foundationType": "SLAB",
  "schoolDistrict": "Lake Travis ISD",
  "elementarySchool": "Lake Travis Elementary",
  "hoaFeeMonthly": 185,
  "hoaName": "Ridgewood HOA",
  "zoning": "SF-1",
  "floodZone": "X",
  "taxAnnual": 18500,
  "taxYear": 2025,
  "parcelId": "R475821"
}
```

### `propertyType` Enum

| Value | Description |
|---|---|
| `RESIDENTIAL_SINGLE_FAMILY` | Detached single-family home |
| `RESIDENTIAL_CONDO` | Condominium unit |
| `RESIDENTIAL_TOWNHOUSE` | Townhouse / row home |
| `RESIDENTIAL_MULTI_FAMILY` | Duplex, triplex, small apartment building |
| `RESIDENTIAL_MOBILE` | Mobile / manufactured home |
| `RESIDENTIAL_LAND` | Vacant residential land |
| `COMMERCIAL_OFFICE` | Office building or suite |
| `COMMERCIAL_RETAIL` | Retail storefront or strip mall |
| `COMMERCIAL_INDUSTRIAL` | Warehouse, industrial, flex space |
| `COMMERCIAL_MIXED_USE` | Mixed residential and commercial |
| `COMMERCIAL_LAND` | Vacant commercial land |
| `AGRICULTURAL` | Farm, ranch, agricultural parcel |

---

## 3. `listingInfo`

```json
"listingInfo": {
  "mlsNumber": "MLS-ATX-2026-084712",
  "mlsBoard": "Austin Board of REALTORS",
  "mlsStatus": "ACTIVE",
  "listingDate": "2026-01-02",
  "daysOnMarket": 12,
  "listingUrl": "https://www.kwaustin.com/listings/12847-ridgewood-trail",
  "listingAgent": {
    "name": "Jennifer Park",
    "licenseNumber": "TX-RE-547891",
    "email": "j.park@kwaustin.com",
    "phone": "+15125550101",
    "brokerName": "Keller Williams Realty",
    "brokerId": "ORG-KW-AUSTIN-WESTLAKE"
  },
  "buyerAgent": {
    "name": "David Chen",
    "licenseNumber": "TX-RE-482034",
    "email": "d.chen@remax-austin.com",
    "phone": "+15125550202",
    "brokerName": "RE/MAX Capital City",
    "brokerId": "ORG-REMAX-AUSTIN"
  },
  "virtualTourUrl": "https://tours.kwaustin.com/12847-ridgewood",
  "photosAvailable": true,
  "photoCount": 48
}
```

### `mlsStatus` Enum

| Value | Description |
|---|---|
| `ACTIVE` | Actively listed, accepting offers |
| `PENDING` | Offer accepted, under contract |
| `UNDER_CONTRACT` | Contract signed, in due diligence |
| `CONTINGENT` | Under contract with contingencies |
| `SOLD` | Transaction completed |
| `WITHDRAWN` | Listing withdrawn by seller |
| `EXPIRED` | Listing period expired |
| `OFF_MARKET` | Not publicly listed |

---

## 4. `propertyPricing`

Structured price expression for real estate — extends the core `priceOffer` with real estate-specific price types.

```json
"propertyPricing": {
  "listingPrice": {
    "amount": 879000,
    "currency": "USD",
    "effectiveDate": "2026-01-02"
  },
  "priceHistory": [
    { "amount": 899000, "currency": "USD", "date": "2025-12-01", "event": "LISTED" },
    { "amount": 879000, "currency": "USD", "date": "2026-01-02", "event": "PRICE_REDUCTION" }
  ],
  "buyerOffer": {
    "amount": 860000,
    "currency": "USD",
    "offerDate": "2026-01-15",
    "contingencies": ["FINANCING", "INSPECTION", "APPRAISAL"],
    "closingDateRequested": "2026-03-15",
    "earnestMoneyAmount": 17200,
    "sellerConcessions": 8600
  },
  "appraisedValue": {
    "amount": 871000,
    "currency": "USD",
    "appraisalDate": "2026-01-28",
    "appraiserName": "Austin Appraisal Group",
    "appraisalMethod": "COMPARABLE_SALES"
  },
  "closingPrice": {
    "amount": 862500,
    "currency": "USD",
    "closingDate": "2026-03-10"
  },
  "pricePerSqFt": 252.19
}
```

### `contingencies` Enum Values

`FINANCING`, `INSPECTION`, `APPRAISAL`, `SALE_OF_EXISTING_HOME`, `TITLE`, `HOA_REVIEW`, `OTHER`

---

## 5. `mortgageQualification`

```json
"mortgageQualification": {
  "preApprovalStatus": "APPROVED",
  "preApprovalAmount": 900000,
  "currency": "USD",
  "preApprovalDate": "2025-12-15",
  "preApprovalExpiry": "2026-03-15",
  "lenderName": "Wells Fargo Home Mortgage",
  "lenderContact": "Sandra Liu",
  "loanType": "CONVENTIONAL",
  "downPaymentAmount": 175000,
  "downPaymentPercent": 20,
  "estimatedRate": 6.75,
  "loanTermYears": 30,
  "cashBuyer": false,
  "va": false,
  "fha": false
}
```

### `preApprovalStatus` Enum

`NOT_STARTED`, `IN_PROGRESS`, `APPROVED`, `CONDITIONALLY_APPROVED`, `DENIED`, `NOT_REQUIRED` (cash buyer)

### `loanType` Enum

`CONVENTIONAL`, `FHA`, `VA`, `USDA`, `JUMBO`, `ARM`, `BRIDGE`, `CONSTRUCTION`, `PORTFOLIO`, `HARD_MONEY`

---

## 6. `coApplicant`

Supports joint buyers (co-purchasers, spouses, business partners). Parallel to the customer contact block.

```json
"coApplicant": {
  "firstName": "Emma",
  "lastName": "Torres",
  "emailAddress": "emma.torres@email.com",
  "phoneNumber": "+15125550235",
  "relationship": "SPOUSE",
  "onTitle": true,
  "onLoan": true
}
```

### `relationship` Enum

`SPOUSE`, `DOMESTIC_PARTNER`, `SIBLING`, `PARENT`, `CHILD`, `BUSINESS_PARTNER`, `CO_INVESTOR`, `OTHER`

---

## 7. `escrowInfo`

Populated at `IN_NEGOTIATION` or `ORDER` status when a transaction is under contract.

```json
"escrowInfo": {
  "escrowCompany": "First American Title",
  "escrowOfficer": "Maria Gonzalez",
  "escrowEmail": "mgonzalez@firstam.com",
  "escrowNumber": "ESC-2026-ATX-48291",
  "openedDate": "2026-01-16",
  "scheduledClosingDate": "2026-03-10",
  "actualClosingDate": null,
  "titleCompany": "First American Title",
  "titleOrderNumber": "TTL-2026-ATX-48291",
  "inspectionPeriodEnd": "2026-01-30",
  "inspectionCompleted": true,
  "inspectionOutcome": "PASSED_WITH_REPAIRS",
  "repairCreditAmount": 3500,
  "currency": "USD"
}
```

### `inspectionOutcome` Enum

`PASSED`, `PASSED_WITH_REPAIRS`, `FAILED`, `BUYER_TERMINATED`, `NOT_COMPLETED`

---

## 8. `viewingHistory`

Captures property viewing / showing events, linked to `APPOINTMENT_REQUEST` lifecycle transitions.

```json
"viewingHistory": [
  {
    "viewingDate": "2026-01-07T14:00:00-06:00",
    "viewingType": "IN_PERSON",
    "duration": 45,
    "attendees": ["Michael Torres", "Emma Torres"],
    "agentPresent": true,
    "feedbackRating": 5,
    "feedbackNotes": "Loved the kitchen and backyard. Concerned about school district."
  },
  {
    "viewingDate": "2026-01-08T10:00:00Z",
    "viewingType": "VIRTUAL_TOUR",
    "duration": 20,
    "feedbackRating": 4,
    "feedbackNotes": "Second look via video call with parents."
  }
]
```

### `viewingType` Enum

`IN_PERSON`, `VIRTUAL_TOUR`, `OPEN_HOUSE`, `DRIVE_BY`, `VIDEO_CALL`

---

## 9. Gap Analysis vs. Comparable Standards

| Capability | RESO Web API | MISMO | LEX + This Extension |
|---|---|---|---|
| Property attributes (typed) | ✅ | Partial | ✅ |
| Lead lifecycle (9 states) | ❌ | ❌ | ✅ |
| Buyer intent / lead source | ❌ | ❌ | ✅ |
| Mortgage qualification | ❌ | ✅ | ✅ |
| Co-buyer support | ❌ | ✅ | ✅ |
| Viewing / showing history | ❌ | ❌ | ✅ |
| Offer with contingencies | ❌ | Partial | ✅ |
| Price history | Partial | ❌ | ✅ |
| Lead deduplication (SHA-256) | ❌ | ❌ | ✅ |
| Lead closure (WON/LOST/ACK) | ❌ | ❌ | ✅ |
| Multi-format (JSON/XML/X12/EDI) | ❌ | ❌ | ✅ |
| Agent assignment (named) | ❌ | ❌ | ✅ (via core assignedTo) |
| AI predictive signals (real estate) | ❌ | ❌ | ✅ |

---

## 11. `aiSignals`

Domain-specific AI-generated probability signals for real estate procurement. Carried inside the extension `data` block alongside `propertyRequirements`, `financialProfile`, etc. Cross-industry signals remain in `lex.payload.lead.leadIntelligence`.

```json
"aiSignals": {
  "neighborhoodAffinityScores": [
    { "neighborhoodId": "ZIP-60614", "name": "Lincoln Park", "affinityScore": 0.84 },
    { "neighborhoodId": "ZIP-60657", "name": "Wicker Park", "affinityScore": 0.61 }
  ],
  "priceFlexibilityScore": 0.42,
  "mortgageApprovalProbability": 0.76,
  "timeToOfferDays": 18,
  "investorProbability": 0.12,
  "competitorAgentRisk": 0.29,
  "signalScoredAt": "2026-04-12T09:00:00Z",
  "modelVersion": "RE_AI_SIGNALS_V1.0"
}
```

### Field Reference

| Field | Type | Description |
|---|---|---|
| `neighborhoodAffinityScores[]` | Array | Ranked list of neighborhoods matching buyer profile. `neighborhoodId` = ZIP/postal area, `affinityScore` = 0–1 |
| `priceFlexibilityScore` | Decimal (0–1) | Estimated buyer price flexibility — 0 = inflexible (hard budget), 1 = highly flexible |
| `mortgageApprovalProbability` | Decimal (0–1) | Estimated probability of mortgage/financing approval based on available financial profile signals |
| `timeToOfferDays` | Integer | Predicted days from first contact to signed offer |
| `investorProbability` | Decimal (0–1) | Probability this is an investment buyer rather than owner-occupier |
| `competitorAgentRisk` | Decimal (0–1) | Probability buyer is also working with a competing agent or brokerage |
| `signalScoredAt` | ISO 8601 | When these real-estate-specific signals were generated |
| `modelVersion` | String | Scoring model version |

---

## 10. Example Message (Minimal)

```json
{
  "lex": {
    "header": {
      "messageId": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
      "messageType": "LEAD",
      "version": "1.0",
      "timestamp": "2026-01-03T14:30:00Z",
      "senderId": "RETAILER-KW-AUSTIN-WESTLAKE",
      "receiverId": "LEX-PLATFORM"
    },
    "payload": {
      "lead": {
        "leadId": "LID-20260103-REES-001",
        "leadType": "PRIMARY",
        "status": "SHOPPING",
        "source": "RETAILER_WEBSITE",
        "purchaseTimeframe": {
          "description": "Within 90 days",
          "latestDate": "2026-04-03",
          "urgency": "THIS_QUARTER"
        },
        "assignedTo": {
          "name": "Jennifer Park",
          "email": "j.park@kwaustin.com",
          "role": "LISTING_AGENT",
          "organisationId": "ORG-KW-AUSTIN-WESTLAKE"
        },
        "customer": {
          "firstName": "Michael",
          "lastName": "Torres",
          "emailAddress": "michael.torres@email.com",
          "phoneNumbers": [
            { "number": "+15125550234", "type": "MOBILE", "bestTime": "EVENING", "preferred": true }
          ],
          "addresses": [
            { "addressType": "HOME", "primary": true, "street": "3410 Westover Hills Blvd", "city": "Austin", "state": "TX", "postalCode": "78731", "country": "US" }
          ]
        },
        "desiredProduct": {
          "productType": "GENERAL_PROCUREMENT",
          "assetClass": "GENERAL_GOODS",
          "budgetMin": 820000,
          "budgetMax": 900000,
          "currency": "USD",
          "priceOffer": {
            "type": "OFFER",
            "amount": 860000,
            "currency": "USD"
          },
          "featurePreferences": [
            { "feature": "4 Bedrooms", "weighting": 100, "category": "LAYOUT" },
            { "feature": "Pool", "weighting": 30, "category": "AMENITY" },
            { "feature": "Master on Main", "weighting": 60, "category": "LAYOUT" }
          ]
        }
      }
    },
    "extensions": [
      {
        "namespace": "lex.core.realestate",
        "version": "1.0.0",
        "producer": "RETAILER-KW-AUSTIN-WESTLAKE",
        "producedAt": "2026-01-03T14:30:00Z",
        "data": {
          "propertyDetails": {
            "propertyType": "RESIDENTIAL_SINGLE_FAMILY",
            "listingAddress": {
              "street": "12847 Ridgewood Trail",
              "city": "Austin",
              "state": "TX",
              "zipCode": "78738",
              "county": "Travis",
              "country": "US"
            },
            "yearBuilt": 2019,
            "bedroomCount": 4,
            "bathroomCount": 3.5,
            "squareFeetLiving": 3420,
            "schoolDistrict": "Lake Travis ISD",
            "hoaFeeMonthly": 185
          },
          "listingInfo": {
            "mlsNumber": "MLS-ATX-2026-084712",
            "mlsStatus": "ACTIVE",
            "daysOnMarket": 12,
            "listingAgent": {
              "name": "Jennifer Park",
              "email": "j.park@kwaustin.com",
              "brokerName": "Keller Williams Realty"
            }
          },
          "mortgageQualification": {
            "preApprovalStatus": "APPROVED",
            "preApprovalAmount": 900000,
            "currency": "USD",
            "downPaymentPercent": 20,
            "loanType": "CONVENTIONAL"
          },
          "coApplicant": {
            "firstName": "Emma",
            "lastName": "Torres",
            "emailAddress": "emma.torres@email.com",
            "relationship": "SPOUSE",
            "onTitle": true,
            "onLoan": true
          }
        }
      }
    ]
  }
}
```
