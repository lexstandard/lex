<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright (c) 2026 LEX Lead Exchange Standard Contributors -->
<!-- Canonical specification: https://lexstandard.org -->

# LEX - Organization Extension Framework

## Overview

LEX is designed to support multiple organizations (Manufacturers, Retailers, Brokers, Management Systems, Third-party Platforms) across diverse industries while maintaining a standard core specification. This document defines how organization-specific data is integrated without fragmenting the ecosystem.

---

## 1. Organization Hierarchy & ID Management

### 1.1 Organization Types (Multi-Industry Model)

```
+-------------------------------------------------------------+
|                 MULTI-INDUSTRY ECOSYSTEM                    |
+-------------------------------------------------------------+
|                                                             |
|  +------------------+  +------------------+               |
|  |  MANUFACTURERS   |  |   PLATFORMS      |               |
|  |  (OEMs, Builders)|  |  (Third-party)   |               |
|  |                  |  |                  |               |
|  | * Boeing         |  | * AutoTrader     |               |
|  | * Toyota         |  | * Zillow (RE)    |               |
|  | * Caterpillar    |  | * Chrono24       |               |
|  | * Dell           |  | * BoatTrader     |               |
|  +------------------+  +------------------+               |
|         |                       |                          |
|         +-----------------------+                          |
|                         |                                  |
|         +-------------------------------+                  |
|         |   MANAGEMENT SYSTEMS          |                  |
|         |   (ERP, CRM, DMS, PMS)        |                  |
|         |                               |                  |
|         | * SAP / Oracle                |                  |
|         | * Salesforce                  |                  |
|         | * CDK Global                  |                  |
|         | * Reynolds & Reynolds         |                  |
|         +-------------------------------+                  |
|                         |                                  |
|         +-------------------------------+                  |
|         |                               |                  |
|    +----v--------------+   +------------v--------------+   |
|    | RETAILERS/BROKERS |   | FRANCHISES/NETWORKS       |   |
|    |                   |   |                           |   |
|    | * Single Location |   | * Multi-brand Auto Group  |   |
|    | * Brokerage Firm  |   | * Global Distributor      |   |
|    +-------------------+   +---------------------------+   |
|                                                             |
+-------------------------------------------------------------+
```

### 1.2 Organization Identifier Structure

Each organization has **multiple identifiers** in the system, reflecting the diverse systems they participate in:

```json
{
  "organizationId": {
    "lexId": "ORG-ABC-MANUFACTURER-001",           // LEX Primary ID
    
    "manufacturerIds": {
      "oemCode": "ABC",                            // OEM official code
      "commercialId": "BOEING-COM",                // Commercial division ID
      "isoCode": "TM",                             // ISO manufacturer code
      "proprietary": ["ABC-MFGR-123", "B787-OP"]   // Custom IDs
    },
    
    "managementSystemIds": {
      "sapErp": "SAP-ORG-999",                     // SAP account identifier
      "salesforce": "SF-001X",                     // Salesforce tenant
      "cdkGlobal": "CDK-DEALER-999",               // Automotive DMS
      "custom": {                                   // Extensible specific IDs
        "systemCode": "ABC",
        "accountNumber": "12345"
      }
    },
    
    "retailerIds": {
      "retailerCode": "ABC-MAIN",                  // Primary seller code
      "networkCode": "TOYOTA-ABC-MAIN",            // Franchise identifier
      "crm": "CRM-SYSTEM-ID-9999",                 // Local CRM system ID
      "inventory": "INV-SYS-ABC-001",              // Inventory system ID
      "locations": {
        "mainOffice": "LOC-001",
        "serviceCenter": "LOC-002"
      }
    },
    
    "legalEntity": {
      "legalName": "ABC Enterprise Group, LLC",
      "taxId": "12-3456789",
      "duns": "123456789",                         // D&B DUNS number
      "sec": "CIK0000000000"                       // SEC filing ID
    }
  }
}
```

### 1.3 Sender/Receiver ID Convention

In message headers, IDs follow a **hierarchical format**:

```
Format: [TYPE]-[ORGANIZATION]-[ENTITY]

Examples:
  "MFGR-TOYOTA-NA"                    // Manufacturer: Toyota, North America
  "ERP-SAP-PROD"                      // System: SAP, Production instance
  "RETAIL-ABC-MAIN"                   // Retailer: ABC Group, Main location
  "PLATFORM-AUTOTRADER-US"            // Platform: AutoTrader, US region
  "NETWORK-TOYOTA-CENTRAL-REGION"     // Franchise/Distribution network
  "BROKER-YACHT-SALES-INTL"           // Marine Brokerage
```

---

## 2. Custom Organization Metadata

### 2.1 Organization Context Object

Every LEX message can include organization-specific metadata without breaking the standard `payload`. These fields live in `organizationContext`.

```json
{
  "lex": {
    "version": "1.0.0",
    "header": { /* standard header */ },
    "payload": {
      "lead": {
        "leadId": "LEAD-2026-001234",
        "status": "EXPRESSED_INTEREST"
      }
    },
    "organizationContext": {
      
      // Manufacturer-specific data
      "manufacturerData": {
        "mfgrLeadId": "TY-LEAD-9999-ABC",      // Manufacturer internal ID
        "regionCode": "NA-WEST",                // Manufacturer regional code
        "divisionCode": "HEAVY-MACHINERY",      // Product division
        "incentiveProgram": "SPRING-2026-PROMO", // Corporate promotion
        "allocationPoolId": "POOL-2026-Q1",    // Inventory allocation
        "customFields": {
          "marketingSegment": "ENTERPRISE",
          "creditTierTarget": "EXCELLENT",
          "targetRetailerType": "AUTHORIZED_DISTRIBUTOR"
        }
      },
      
      // Management System (ERP/CRM/DMS) data
      "managementSystemData": {
        "provider": "SAP_ENTERPRISE",
        "systemLeadId": "SAP-2026-555-ABC",    // System internal reference
        "accountId": "SAP-ACCT-123",           // Account number
        "systemCode": "SAP-HANA",              // System version/identifier
        "syncStatus": "SYNCED_TO_ERP",         // Integration status
        "syncTimestamp": "2026-03-23T14:30:00Z", // Sync timestamp
        "workflow": "B2B_SALES",               // Process workflow type
        "metadata": {
          "route": "AUTOMATIC",
          "priority": "HIGH",
          "followUpDate": "2026-03-30"
        }
      },
      
      // Retailer/Broker/Dealer data
      "retailerData": {
        "retailerLeadId": "SELL-ABC-MAIN-5555", // Seller internal ID
        "branchCode": "MAIN",                   // Branch/location
        "departmentCode": "COMMERCIAL_SALES",   // Department
        "saleRepId": "SR-456",                  // Sales representative
        "managerId": "MGR-789",                 // Sales manager
        "sourceSystemCode": "SALESFORCE-V3.2",  // Local system version
        "internalNotes": "...",                 // Seller local notes
        "metrics": {
          "leadScore": 95,                      // Seller lead score
          "customerHistoryFlag": "NEW_ACCOUNT", // Account status
          "inventoryMatches": 5,                // Available assets
          "marketPosition": "COMPETITIVE"       // Market assessment
        }
      },
      
      // Third-party platform data
      "platformData": {
        "platform": "ZILLOW",
        "platformLeadId": "ZIL-2026-999-LED",  // Platform reference
        "campaignId": "ZIL-SPRING-2026",       // Campaign tracking
        "sourceUrl": "https://zillow.com/...", // Lead source
        "leadQualityScore": 8.5,               // Platform AI scoring
        "platformMetadata": {
          "pageType": "PROPERTY_COMPARISON",
          "timeOnSite": 1200,
          "viewedAssets": 3,
          "contactAttempts": 1
        }
      }
    }
  }
}
```

### 2.2 Why Extension Objects Are Separate

Do NOT inject proprietary tracking IDs or routing instructions into the main `lead` or `asset` properties. By isolating them in `organizationContext`:

1. **The Core Schema Remains Pure:** Validation passes universally across platforms.
2. **System Agnosticism:** An aviation CRM ignores `managementSystemData` meant for a maritime broker system.
3. **Auditable Scope:** It is clear which organization owns which metadata, preventing ID collisions (e.g., two CRMs attempting to use `leadId`).

