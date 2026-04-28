<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright (c) 2026 LEX Lead Exchange Standard Contributors -->
<!-- Canonical specification: https://lexstandard.org -->

# LEX - Consent Record Model

## Overview

Consent management is a **legal requirement** in every major retail market, not optional metadata. This document defines the `consentRecord` block, which must accompany any message containing Personally Identifiable Information (PII) for customer leads.

**Applicable regulations (Tier 1 — full structured support):**
- **US** — TCPA (Telephone Consumer Protection Act), CCPA/CPRA (California Privacy Rights Act), US State Privacy Laws (Virginia CDPA, Colorado CPA, Connecticut CTDPA, Texas TDPSA, Oregon OCPA, Montana MCDPA, and others)
- **EU / EEA** — GDPR Article 7, ePrivacy Directive
- **UK** — UK GDPR / Data Protection Act 2018
- **India** — DPDPA 2023 (Digital Personal Data Protection Act)
- **China** — PIPL (Personal Information Protection Law)
- **Brazil** — LGPD (Lei Geral de Proteção de Dados)
- **South Africa** — POPIA (Protection of Personal Information Act)
- **Canada** — PIPEDA / Quebec Law 25 (Law 25 = Bill 64)
- **Singapore** — PDPA 2012 (amended 2020)
- **Japan** — APPI (Act on Protection of Personal Information, 2022 amendment)
- **Switzerland** — nFADP (revised Federal Act on Data Protection, in force Sep 2023)
- **South Korea** — PIPA-K (Personal Information Protection Act, 2023 amendment)
- **Saudi Arabia** — PDPL (Personal Data Protection Law, in force Mar 2024)
- **Thailand** — PDPA (Personal Data Protection Act, in force Jun 2022)

**Tier 2 — acknowledged, no separate struct (included in `marketingConsent` and metadata):**
UAE PDPL, Malaysia PDPA, New Zealand Privacy Act 2020, Mexico LFPDPPP/LGPDPPSO, Nigeria NDPR/NDPA, Kenya Data Protection Act, Philippines DPA, Taiwan PDPA, Indonesia PDP Law 2022

---

## 1. Consent Record Block

The `consentRecord` object is placed at the `lead` level alongside `customer`. It is **required** for any LEAD message that includes customer email, phone, or address fields.

```json
"consentRecord": {
  "tcpa": {
    "granted": true,
    "timestamp": "2026-03-25T09:00:00Z",
    "channels": ["SMS", "CALL"],
    "ipAddress": "203.0.113.45",
    "userAgent": "Mozilla/5.0 (iPhone; ...)",
    "consentVersion": "TCPA_FORM_V2.1",
    "expiryDate": null
  },
  "gdpr": {
    "legalBasis": "CONSENT",
    "purposeCodes": ["LEAD_FOLLOW_UP", "PRODUCT_RECOMMENDATIONS"],
    "dataController": "RETAILER-ACME-BERLIN-001",
    "processorList": ["DMS-CDK-EU", "PLATFORM-AUTOTRADER-EU"],
    "retentionPeriodDays": 730,
    "subjectRights": {
      "rightToAccess": true,
      "rightToErasure": true,
      "rightToPortability": true,
      "rightToObject": true
    },
    "consentWithdrawnAt": null
  },
  "ukGdpr": {
    "legalBasis": "CONSENT",
    "purposeCodes": ["LEAD_FOLLOW_UP"],
    "dataController": "RETAILER-ACME-LONDON-001",
    "retentionPeriodDays": 365,
    "icoRegistrationNumber": "ZA123456",
    "consentWithdrawnAt": null
  },
  "ccpa": {
    "doNotSell": false,
    "doNotShare": false,
    "optOutTimestamp": null,
    "gpcSignalHonored": false
  },
  "usStatePrivacy": {
    "statesOptedOut": [],
    "universalOptOut": false,
    "gpcHonored": false
  },
  "dpdp": {
    "consentGranted": true,
    "purposeId": "ASSET_PURCHASE_LEAD",
    "consentTimestamp": "2026-03-25T09:00:00Z",
    "nomineeDefined": false
  },
  "pipl": {
    "consentGranted": true,
    "processingPurpose": "ASSET_PURCHASE_LEAD",
    "sensitiveDataIncluded": false,
    "crossBorderTransferApproved": false,
    "consentTimestamp": "2026-03-25T09:00:00Z"
  },
  "lgpd": {
    "legalBasis": "CONSENT",
    "consentGranted": true,
    "purposeDescription": "Lead follow-up for asset acquisition",
    "dataControllerCnpj": "00.000.000/0001-00",
    "retentionPeriodDays": 365,
    "consentTimestamp": "2026-03-25T09:00:00Z"
  },
  "popia": {
    "consentGranted": true,
    "purposeDescription": "Asset purchase lead processing",
    "responsiblePartyName": "RETAILER-ACME-ZA-001",
    "consentTimestamp": "2026-03-25T09:00:00Z",
    "dataSubjectRightsNotified": true
  },
  "pipeda": {
    "consentGranted": true,
    "purposeDescription": "Lead follow-up for vehicle acquisition",
    "impliedConsent": false,
    "quebecLaw25Applicable": false,
    "consentTimestamp": "2026-03-25T09:00:00Z"
  },
  "pdpaSg": {
    "consentGranted": true,
    "purposeDescription": "Asset purchase lead inquiry",
    "doNotCallRegistryChecked": true,
    "consentTimestamp": "2026-03-25T09:00:00Z"
  },
  "appi": {
    "consentGranted": true,
    "purposeDescription": "Asset purchase lead processing",
    "thirdPartyProvisionConsent": false,
    "crossBorderTransferConsent": false,
    "consentTimestamp": "2026-03-25T09:00:00Z"
  },
  "nfadp": {
    "legalBasis": "CONSENT",
    "purposeDescription": "Asset purchase lead inquiry",
    "dataControllerName": "RETAILER-ACME-CH-001",
    "retentionPeriodDays": 365,
    "consentTimestamp": "2026-03-25T09:00:00Z"
  },
  "pipaKr": {
    "consentGranted": true,
    "purposeDescription": "Asset purchase lead processing",
    "sensitiveDataIncluded": false,
    "thirdPartyProvisionConsent": false,
    "consentTimestamp": "2026-03-25T09:00:00Z"
  },
  "pdplSa": {
    "consentGranted": true,
    "processingPurpose": "ASSET_PURCHASE_LEAD",
    "sensitiveDataIncluded": false,
    "crossBorderTransferApproved": false,
    "consentTimestamp": "2026-03-25T09:00:00Z"
  },
  "pdpaTh": {
    "legalBasis": "CONSENT",
    "consentGranted": true,
    "purposeDescription": "Asset purchase lead processing",
    "dataControllerName": "RETAILER-ACME-TH-001",
    "retentionPeriodDays": 365,
    "consentTimestamp": "2026-03-25T09:00:00Z"
  },
  "marketingConsent": {
    "email": true,
    "sms": false,
    "pushNotification": true,
    "whatsapp": false,
    "postalMail": false,
    "thirdPartySharing": false,
    "profilingAllowed": true
  },
  "consentCollectionMethod": "WEB_FORM",
  "consentFormVersion": "v3.2",
  "consentFormUrl": "https://retailer.example.com/consent/v3.2",
  "collectedAt": "2026-03-25T09:00:00Z"
}
```

---

## 2. Field Reference

### `tcpa` — US Telephone Consumer Protection Act

| Field | Type | Required | Description |
|---|---|---|---|
| `granted` | Boolean | Yes | Whether TCPA consent was granted |
| `timestamp` | ISO8601 | Yes | Exact moment consent was captured |
| `channels` | Array[Enum] | Yes | `SMS`, `CALL`, `AUTODIALER`, `PRERECORDED` |
| `ipAddress` | String | Yes | IPv4 or IPv6 of consenting session |
| `userAgent` | String | No | Browser/device user agent string |
| `consentVersion` | String | Yes | Version of consent language shown |
| `expiryDate` | ISO8601 | No | Consent expiry (null = indefinite) |

**Note:** TCPA litigation in retail and lead generation is the most frequent cause of regulatory penalties. `ipAddress` + `timestamp` + `consentVersion` are the evidentiary minimum required to defend a TCPA claim.

### `gdpr` — EU General Data Protection Regulation

| Field | Type | Required | Description |
|---|---|---|---|
| `legalBasis` | Enum | Yes | `CONSENT`, `LEGITIMATE_INTEREST`, `CONTRACT`, `LEGAL_OBLIGATION`, `VITAL_INTEREST`, `PUBLIC_TASK` |
| `purposeCodes` | Array[String] | Yes | Purposes for which data is processed |
| `dataController` | String | Yes | LEX organization ID of data controller |
| `processorList` | Array[String] | No | LEX org IDs of data processors |
| `retentionPeriodDays` | Integer | Yes | How long data is retained |
| `consentWithdrawnAt` | ISO8601 | No | Timestamp if consent was later withdrawn |

### `ukGdpr` — UK GDPR / Data Protection Act 2018

| Field | Type | Required | Description |
|---|---|---|---|
| `legalBasis` | Enum | Yes | Same values as `gdpr.legalBasis` |
| `purposeCodes` | Array[String] | Yes | UK-specific processing purposes |
| `dataController` | String | Yes | LEX organization ID of UK data controller |
| `retentionPeriodDays` | Integer | Yes | Retention duration |
| `icoRegistrationNumber` | String | No | UK ICO registration number |
| `consentWithdrawnAt` | ISO8601 | No | Timestamp if consent was later withdrawn |

**Note:** UK GDPR applies from January 2021 following Brexit. It mirrors EU GDPR structurally but is maintained separately by the UK ICO.

### `ccpa` — California Consumer Privacy Act / CPRA

| Field | Type | Required | Description |
|---|---|---|---|
| `doNotSell` | Boolean | Yes | Customer opted out of data sale |
| `doNotShare` | Boolean | Yes | Customer opted out of cross-context behavioral advertising sharing |
| `optOutTimestamp` | ISO8601 | No | When opt-out was exercised |
| `gpcSignalHonored` | Boolean | Yes | Whether the browser's Global Privacy Control signal was respected |

### `dpdp` — India Digital Personal Data Protection Act 2023 (DPDPA)

| Field | Type | Required | Description |
|---|---|---|---|
| `consentGranted` | Boolean | Yes | Whether consent was granted under DPDPA |
| `purposeId` | String | Yes | Processing purpose as registered with Data Fiduciary |
| `consentTimestamp` | ISO8601 | Yes | When consent was obtained |
| `nomineeDefined` | Boolean | No | Whether a nominee was designated for data post-death |

**Note:** India's DPDPA 2023 replaced the earlier draft PDPB. Rules are expected under notification during 2025.

### `pipl` — China Personal Information Protection Law (Nov 2021)

| Field | Type | Required | Description |
|---|---|---|---|
| `consentGranted` | Boolean | Yes | Express consent granted |
| `processingPurpose` | String | Yes | Stated data processing purpose |
| `sensitiveDataIncluded` | Boolean | Yes | Whether sensitive PI (biometrics, finance) is processed |
| `crossBorderTransferApproved` | Boolean | Yes | Cross-border transfer has CAC approval or SCCs |
| `consentTimestamp` | ISO8601 | Yes | When consent was obtained |

**Note:** PIPL requires separate consent for sensitive data and explicit approval for cross-border transfers.

### `lgpd` — Brazil Lei Geral de Proteção de Dados (Aug 2020)

| Field | Type | Required | Description |
|---|---|---|---|
| `legalBasis` | Enum | Yes | `CONSENT`, `LEGITIMATE_INTEREST`, `CONTRACT`, `LEGAL_OBLIGATION`, `VITAL_INTEREST`, `RESEARCH`, `CREDIT_PROTECTION`, `JUDICIAL`, `HEALTH`, `REGULATORY` |
| `consentGranted` | Boolean | Yes | Consent status |
| `purposeDescription` | String | Yes | Human-readable processing purpose in Portuguese or English |
| `dataControllerCnpj` | String | No | Brazilian CNPJ of the data controller |
| `retentionPeriodDays` | Integer | Yes | Retention duration |
| `consentTimestamp` | ISO8601 | Yes | When consent was obtained |

### `popia` — South Africa Protection of Personal Information Act (Jul 2021)

| Field | Type | Required | Description |
|---|---|---|---|
| `consentGranted` | Boolean | Yes | Consent granted |
| `purposeDescription` | String | Yes | Processing purpose |
| `responsiblePartyName` | String | Yes | Responsible party (data controller) name |
| `consentTimestamp` | ISO8601 | Yes | When consent was obtained |
| `dataSubjectRightsNotified` | Boolean | Yes | Whether data subject was notified of rights |

### `pipeda` — Canada PIPEDA / Quebec Law 25

| Field | Type | Required | Description |
|---|---|---|---|
| `consentGranted` | Boolean | Yes | Consent status |
| `purposeDescription` | String | Yes | Processing purpose |
| `impliedConsent` | Boolean | Yes | Whether implied (vs. express) consent is relied on |
| `quebecLaw25Applicable` | Boolean | Yes | Whether Quebec's enhanced Law 25 (Bill 64) applies |
| `consentTimestamp` | ISO8601 | Yes | When consent was obtained |

**Note:** Quebec Law 25 imposes GDPR-equivalent rights including mandatory privacy impact assessments effective Sep 2023.

### `pdpaSg` — Singapore Personal Data Protection Act (2012, amended 2020)

| Field | Type | Required | Description |
|---|---|---|---|
| `consentGranted` | Boolean | Yes | Consent status |
| `purposeDescription` | String | Yes | Processing purpose |
| `doNotCallRegistryChecked` | Boolean | Yes | Whether the Singapore Do Not Call Registry was checked before contact |
| `consentTimestamp` | ISO8601 | Yes | When consent was obtained |

### `appi` — Japan Act on Protection of Personal Information (2022 amendment)

| Field | Type | Required | Description |
|---|---|---|---|
| `consentGranted` | Boolean | Yes | Consent status |
| `purposeDescription` | String | Yes | Processing purpose |
| `thirdPartyProvisionConsent` | Boolean | Yes | Consent for third-party provision of personal data |
| `crossBorderTransferConsent` | Boolean | Yes | Consent for cross-border transfer |
| `consentTimestamp` | ISO8601 | Yes | When consent was obtained |

### `nfadp` — Switzerland revised Federal Act on Data Protection (Sep 2023)

| Field | Type | Required | Description |
|---|---|---|---|
| `legalBasis` | Enum | Yes | `CONSENT`, `LEGITIMATE_INTEREST`, `CONTRACT`, `LEGAL_OBLIGATION` |
| `purposeDescription` | String | Yes | Processing purpose |
| `dataControllerName` | String | Yes | Swiss data controller name |
| `retentionPeriodDays` | Integer | Yes | Retention duration |
| `consentTimestamp` | ISO8601 | Yes | When consent was obtained |

**Note:** nFADP is structurally aligned with GDPR and applies to all processors handling Swiss residents' data.

### `pipaKr` — South Korea Personal Information Protection Act (2023 amendment)

| Field | Type | Required | Description |
|---|---|---|---|
| `consentGranted` | Boolean | Yes | Consent status |
| `purposeDescription` | String | Yes | Processing purpose |
| `sensitiveDataIncluded` | Boolean | Yes | Whether sensitive information is processed |
| `thirdPartyProvisionConsent` | Boolean | Yes | Consent for third-party provision |
| `consentTimestamp` | ISO8601 | Yes | When consent was obtained |

### `pdplSa` — Saudi Arabia Personal Data Protection Law (effective Mar 2024)

| Field | Type | Required | Description |
|---|---|---|---|
| `consentGranted` | Boolean | Yes | Consent status |
| `processingPurpose` | String | Yes | Stated processing purpose |
| `sensitiveDataIncluded` | Boolean | Yes | Whether sensitive categories are processed |
| `crossBorderTransferApproved` | Boolean | Yes | Cross-border transfer approved by NDMO |
| `consentTimestamp` | ISO8601 | Yes | When consent was obtained |

### `pdpaTh` — Thailand Personal Data Protection Act (Jun 2022)

| Field | Type | Required | Description |
|---|---|---|---|
| `legalBasis` | Enum | Yes | `CONSENT`, `CONTRACT`, `LEGAL_OBLIGATION`, `VITAL_INTEREST`, `PUBLIC_TASK`, `LEGITIMATE_INTEREST` |
| `consentGranted` | Boolean | Yes | Consent status |
| `purposeDescription` | String | Yes | Processing purpose |
| `dataControllerName` | String | Yes | Thai data controller name |
| `retentionPeriodDays` | Integer | Yes | Retention duration |
| `consentTimestamp` | ISO8601 | Yes | When consent was obtained |

### `usStatePrivacy` — US State Privacy Laws (non-California)

| Field | Type | Required | Description |
|---|---|---|---|
| `statesOptedOut` | Array[String] | No | State codes where the customer has exercised opt-out (e.g., `["VA", "CO", "CT"]`) |
| `universalOptOut` | Boolean | No | Customer has universally opted out under supported state laws |
| `gpcHonored` | Boolean | No | Global Privacy Control signal was honored |

**Applicable states include:** Virginia (CDPA), Colorado (CPA), Connecticut (CTDPA), Texas (TDPSA), Montana (MCDPA), Oregon (OCPA), and others as enacted. CCPA/CPRA (California) uses the dedicated `ccpa` block.

### `marketingConsent`

| Field | Type | Description |
|---|---|---|
| `email` | Boolean | Consent for marketing emails |
| `sms` | Boolean | Consent for marketing SMS |
| `pushNotification` | Boolean | Consent for push notifications |
| `whatsapp` | Boolean | Consent for WhatsApp marketing |
| `postalMail` | Boolean | Consent for postal marketing |
| `thirdPartySharing` | Boolean | Consent to share data with third-party marketers |
| `profilingAllowed` | Boolean | Consent for automated profiling and scoring |

### `consentCollectionMethod`

| Value | Description |
|---|---|
| `WEB_FORM` | Standard HTML form with checkbox |
| `MOBILE_APP` | In-app consent screen |
| `PAPER_FORM` | Physical signed document |
| `VERBAL_RECORDED` | Recorded verbal consent (e.g., call center) |
| `PRE_EXISTING_RELATIONSHIP` | Implied consent from existing business relationship |
| `IMPORTED` | Consent record imported from legacy system |

---

## 3. Validation Rules

| Rule | Condition | Level |
|---|---|---|
| `consentRecord` required when PII present | LEAD message with any of: email, phone, address | ERROR |
| `tcpa` required for US customers | `customer.address.countryCode = "US"` | ERROR |
| `tcpa.ipAddress` must be valid IP | Not valid IPv4 or IPv6 | ERROR |
| `tcpa.timestamp` must not be in future | Future consent timestamp | ERROR |
| `gdpr` required for EU/EEA customers | Country code in EU/EEA list | ERROR |
| `gdpr.legalBasis` must be recognised value | Not in valid enum | ERROR |
| `gdpr.retentionPeriodDays` must be positive | `<= 0` | ERROR |
| Consent withdrawal must have `consentWithdrawnAt` | `gdpr.consentWithdrawnAt` null but GDPR consent revoked | WARNING |
| `ukGdpr` required for GB customers | `customer.address.countryCode = "GB"` | ERROR |
| `ukGdpr.legalBasis` must be recognised value | Not in valid enum | ERROR |
| `dpdp` required for IN customers | `customer.address.countryCode = "IN"` | ERROR |
| `ccpa` required for CA (California, US) customers | State = CA, country = US | WARNING |
| `pipl` required for CN customers | `customer.address.countryCode = "CN"` | ERROR |
| `lgpd` required for BR customers | `customer.address.countryCode = "BR"` | ERROR |
| `lgpd.legalBasis` must be recognised value | Not in valid enum | ERROR |
| `popia` required for ZA customers | `customer.address.countryCode = "ZA"` | ERROR |
| `pipeda` required for CA (Canada) customers | `customer.address.countryCode = "CA"` | WARNING |
| `pdpaSg` required for SG customers | `customer.address.countryCode = "SG"` | ERROR |
| `appi` required for JP customers | `customer.address.countryCode = "JP"` | ERROR |
| `nfadp` required for CH customers | `customer.address.countryCode = "CH"` | ERROR |
| `pipaKr` required for KR customers | `customer.address.countryCode = "KR"` | ERROR |
| `pdplSa` required for SA customers | `customer.address.countryCode = "SA"` | ERROR |
| `pdpaTh` required for TH customers | `customer.address.countryCode = "TH"` | ERROR |
| `pdpaTh.legalBasis` must be recognised value | Not in valid enum | ERROR |
| `usStatePrivacy.statesOptedOut` values must be valid state codes | Not in US state code list | WARNING |

---

## 4. Consent Withdrawal Flow

When a customer withdraws consent, a new LEAD message must be sent with the updated `consentRecord` where:
- `gdpr.consentWithdrawnAt` is set (for EU/EEA customers)
- `ccpa.doNotSell = true` and `ccpa.optOutTimestamp` is set (for California customers)  
- `marketingConsent` fields are set to `false` for revoked channels

The receiving system is responsible for:
1. Propagating the withdrawal to all registered processors
2. Marking the lead as consent-restricted
3. Ceasing outbound communications on revoked channels within regulatory timeframes

**Regulatory timeframes:**
- GDPR / UK GDPR: Without undue delay (typically ≤ 30 days)
- TCPA: Immediate (no grace period)
- CCPA/CPRA: 15 business days
- DPDPA (India): 30 days
- PIPL (China): Without undue delay
- LGPD (Brazil): Without undue delay
- POPIA (South Africa): Without undue delay
- APPI (Japan): Without undue delay
- PIPEDA / Quebec Law 25: Without undue delay (Quebec Law 25: 30 days)
- PIPA-K (South Korea): Without undue delay
- nFADP (Switzerland): Without undue delay
- PDPL (Saudi Arabia): Without undue delay
- PDPA (Thailand): Without undue delay

---

## 5. Data Minimization Principle

Per GDPR Article 5(1)(c) and DPDPA Section 4(1)(b), only fields required for the stated processing purpose should be included. The `consentRecord.purposeCodes` array defines the basis — downstream systems must not process data fields beyond what those purposes cover.

**Recommended purpose codes:**

| Code | Description |
|---|---|
| `LEAD_FOLLOW_UP` | Retailer/manufacturer follow-up on lead |
| `PRODUCT_RECOMMENDATIONS` | Personalized asset recommendations |
| `PRICE_QUOTE` | Generating and sending price quotes |
| `TEST_DRIVE_SCHEDULING` | Scheduling test drives |
| `FINANCING_PRE_APPROVAL` | Finance pre-qualification |
| `POST_SALE_SERVICE` | Service reminders, maintenance scheduling |
| `MARKET_RESEARCH` | Anonymized aggregate analytics |
| `THIRD_PARTY_CREDIT` | Sharing with financing/insurance providers |

