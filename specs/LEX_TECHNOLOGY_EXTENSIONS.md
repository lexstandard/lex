<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright (c) 2026 LEX Lead Exchange Standard Contributors -->
<!-- Canonical specification: https://lexstandard.org -->

# LEX - Technology Industry Extension

**Namespace:** `lex.core.technology`  
**Version:** 1.0.0  
**Status:** Draft  
**Extends:** LEX_SPECIFICATION.md, LEX_MULTI_INDUSTRY.md  
**Registry Entry:** LEX_EXTENSION_REGISTRY.json

---

## Overview

Enterprise technology procurement (hardware, software, managed services) has no open lead-exchange standard. Salesforce, HubSpot, and similar CRMs define internal pipeline stages but are not interoperable at the data level. This extension bridges the gap where an OEM (Dell, HP, Apple, Cisco), a VAR (value-added reseller), or a managed service provider needs to exchange procurement leads across organizations.

The extension covers:
1. **Procurement model** — purchase, DaaS, SaaS, subscription, lease, rental
2. **Device / software specification** — hardware specs, OS, software bundle
3. **Fleet deployment configuration** — MDM, provisioning, lifecycle management
4. **Compliance requirements** — regulatory certifications the supplier must hold
5. **Integration requirements** — existing systems the solution must connect with
6. **Subscription and licensing terms** — term, renewal, per-seat vs. per-device pricing
7. **DaaS-specific terms** — Device-as-a-Service parameters extending `procurementFinancing.DEVICE_AS_A_SERVICE`

---

## 1. Extension Block

```json
{
  "namespace": "lex.core.technology",
  "version": "1.0.0",
  "producer": "<sender-org-id>",
  "producedAt": "2026-01-15T10:00:00Z",
  "data": {
    "procurementModel": { ... },
    "deviceSpec": { ... },
    "softwareBundle": { ... },
    "deploymentConfig": { ... },
    "complianceRequirements": [ ... ],
    "integrationRequirements": [ ... ],
    "subscriptionTerms": { ... }
  }
}
```

---

## 2. `procurementModel`

Technology assets are acquired under more varied commercial models than any other asset class.

```json
"procurementModel": {
  "model": "DEVICE_AS_A_SERVICE",
  "termMonths": 36,
  "renewalOptions": ["EXTEND_12", "EXTEND_24", "BUYOUT", "REFRESH"],
  "endOfLifeOption": "BUYOUT_OR_RETURN",
  "assetOwnership": "SUPPLIER",
  "depreciationResponsibility": "SUPPLIER",
  "perUnitMonthlyFee": 56.0,
  "totalMonthlyFee": 42000.0,
  "currency": "USD",
  "paymentFrequency": "MONTHLY",
  "slaIncluded": true,
  "slaResponseHours": 4,
  "slaTier": "NEXT_BUSINESS_DAY"
}
```

### `model` Enum

| Value | Description |
|---|---|
| `OUTRIGHT_PURCHASE` | Full ownership transfer at payment |
| `FINANCE_LEASE` | Lease with ownership transfer at end |
| `OPERATING_LEASE` | Off-balance-sheet lease, returned at end |
| `DEVICE_AS_A_SERVICE` | Bundled hardware + lifecycle management subscription |
| `SAAS` | Software as a service (recurring subscription) |
| `PAAS` | Platform as a service |
| `IAAS` | Infrastructure as a service |
| `MANAGED_SERVICE` | Fully managed IT service |
| `RENTAL` | Short-term rental (event, project) |
| `EVALUATION` | Trial / proof-of-concept unit |

### `slaTier` Enum

`SAME_DAY`, `NEXT_BUSINESS_DAY`, `2_BUSINESS_DAYS`, `BEST_EFFORT`, `4_HOUR_ON_SITE`, `PROACTIVE_MONITORING`, `NONE`

---

## 3. `deviceSpec`

```json
"deviceSpec": {
  "deviceCategory": "LAPTOP",
  "manufacturer": "Dell",
  "modelLine": "Latitude",
  "modelNumber": "7450",
  "processorFamily": "Intel_Core_Ultra_7",
  "processorModel": "Intel Core Ultra 7 165H",
  "ramGb": 32,
  "storageGb": 512,
  "storageType": "NVME_SSD",
  "displayInch": 14.0,
  "displayResolution": "1920x1200",
  "touchscreen": false,
  "batteryLifeHours": 14,
  "weightKg": 1.44,
  "os": "WINDOWS_11_PRO",
  "formFactor": "CLAMSHELL",
  "connectivity": ["WIFI_6E", "BLUETOOTH_5.3", "USB_C_THUNDERBOLT_4"],
  "securityChip": "TPM_2.0",
  "biometrics": ["FINGERPRINT"],
  "militaryGrade": "MIL_STD_810H",
  "managedPrint": false,
  "quantity": 250
}
```

### `deviceCategory` Enum

`LAPTOP`, `DESKTOP`, `WORKSTATION`, `TABLET`, `SMARTPHONE`, `THIN_CLIENT`, `SERVER_RACK`, `SERVER_BLADE`, `STORAGE_NAS`, `STORAGE_SAN`, `NETWORK_SWITCH`, `FIREWALL`, `ROUTER`, `WIFI_ACCESS_POINT`, `IOT_GATEWAY`, `SMART_DISPLAY`, `PRINTER_MFP`

### `os` Enum

`WINDOWS_11_PRO`, `WINDOWS_11_ENTERPRISE`, `WINDOWS_11_HOME`, `WINDOWS_10_ENTERPRISE`, `MACOS`, `IPADOS`, `IOS`, `ANDROID_ENTERPRISE`, `CHROMEOS_ENTERPRISE`, `LINUX_UBUNTU`, `LINUX_RHEL`, `LINUX_DEBIAN`, `VMWARE_HORIZON`, `CITRIX`, `OTHER`

---

## 4. `softwareBundle`

```json
"softwareBundle": {
  "officeSuite": "MICROSOFT_365_E3",
  "securitySuite": "MICROSOFT_DEFENDER_BUSINESS",
  "endpointProtection": "CROWDSTRIKE_FALCON",
  "vpn": "ZSCALER",
  "collaborationTools": ["MICROSOFT_TEAMS"],
  "erpIntegration": "SAP_S4HANA",
  "additionalSoftware": [
    { "name": "Adobe Acrobat Pro", "licenseType": "PER_DEVICE" },
    { "name": "AutoCAD LT", "licenseType": "PER_USER", "quantity": 50 }
  ],
  "bundledLicenses": true,
  "licenseModel": "PER_USER",
  "licenseCount": 250
}
```

### `licenseModel` Enum

`PER_USER`, `PER_DEVICE`, `SITE_LICENSE`, `CONCURRENT`, `NAMED_USER`, `FLOATING`, `SUBSCRIPTION_ANNUAL`, `SUBSCRIPTION_MONTHLY`, `PERPETUAL`, `OEM_PREINSTALLED`

---

## 5. `deploymentConfig`

```json
"deploymentConfig": {
  "mdmRequired": true,
  "mdmPlatform": "MICROSOFT_INTUNE",
  "zerotouch": true,
  "autopilotEnrollment": true,
  "imagingRequired": false,
  "customImageName": null,
  "adJoin": "AZURE_AD_JOIN",
  "encryptionRequired": true,
  "encryptionStandard": "BITLOCKER_AES256",
  "secureBootRequired": true,
  "assetTagging": true,
  "assetTaggingMethod": "BARCODE",
  "warehouseConsolidation": true,
  "deliverySite": "SINGLE_LOCATION",
  "deliveryAddresses": [
    { "addressType": "DELIVERY", "street": "1 Innovation Way", "city": "London", "country": "GB", "quantity": 250 },
    { "addressType": "DELIVERY", "street": "Av. de Berna 24", "city": "Lisbon", "country": "PT", "quantity": 250 },
    { "addressType": "DELIVERY", "street": "Schipholweg 97", "city": "Amsterdam", "country": "NL", "quantity": 250 }
  ],
  "stagedRollout": true,
  "stagedRolloutPhaseDays": 30,
  "endUserTrainingIncluded": true,
  "servicePortalRequired": true
}
```

### `adJoin` Enum

`ON_PREMISE_AD`, `AZURE_AD_JOIN`, `HYBRID_JOIN`, `GOOGLE_WORKSPACE`, `STANDALONE`, `NONE`

---

## 6. `complianceRequirements`

Enterprise buyers frequently mandate that suppliers hold specific security and privacy certifications as a non-negotiable procurement condition.

```json
"complianceRequirements": [
  { "standard": "ISO_27001", "required": true, "currentlyCertified": null },
  { "standard": "SOC2_TYPE_II", "required": true, "currentlyCertified": null },
  { "standard": "GDPR_PROCESSOR_DPA", "required": true, "currentlyCertified": null },
  { "standard": "CYBER_ESSENTIALS_PLUS", "required": true, "currentlyCertified": null },
  { "standard": "FEDRAMP_MODERATE", "required": false, "currentlyCertified": null },
  { "standard": "TISAX", "required": false, "currentlyCertified": null }
]
```

### `standard` Enum Values

`ISO_27001`, `ISO_27017`, `ISO_27018`, `SOC1_TYPE_I`, `SOC1_TYPE_II`, `SOC2_TYPE_I`, `SOC2_TYPE_II`, `SOC3`, `GDPR_PROCESSOR_DPA`, `CCPA_COMPLIANT`, `HIPAA`, `FedRAMP_LOW`, `FEDRAMP_MODERATE`, `FEDRAMP_HIGH`, `CYBER_ESSENTIALS`, `CYBER_ESSENTIALS_PLUS`, `IRAP` (Australia), `ENS` (Spain), `CC_EAL` (Common Criteria), `PCI_DSS`, `TISAX`, `NCSC_CERTIFIED`, `OTHER`

---

## 7. `integrationRequirements`

Supplier must integrate with or support the buyer's existing systems.

```json
"integrationRequirements": [
  {
    "systemType": "ITSM",
    "systemName": "ServiceNow",
    "integrationMethod": "API",
    "priority": "REQUIRED",
    "notes": "Asset must auto-register in CMDB via ServiceNow Discovery"
  },
  {
    "systemType": "IAM",
    "systemName": "Okta",
    "integrationMethod": "SAML_SSO",
    "priority": "REQUIRED"
  },
  {
    "systemType": "MONITOR",
    "systemName": "Microsoft Sentinel",
    "integrationMethod": "SYSLOG_CEF",
    "priority": "PREFERRED"
  }
]
```

### `systemType` Enum

`ERP`, `CRM`, `ITSM`, `CMDB`, `IAM`, `MDM`, `MONITOR`, `SIEM`, `BACKUP`, `COLLABORATION`, `PRINT_MANAGEMENT`, `TELECOM_EXPENSE`, `OTHER`

### `integrationMethod` Enum

`API`, `SAML_SSO`, `OAUTH`, `LDAP`, `SCIM`, `SYSLOG_CEF`, `WEBHOOK`, `FILE_TRANSFER`, `NATIVE_INTEGRATION`, `NO_INTEGRATION_NEEDED`

### `priority` Enum

`REQUIRED`, `PREFERRED`, `NICE_TO_HAVE`

---

## 8. `subscriptionTerms`

For DaaS, SaaS, or subscription procurement models.

```json
"subscriptionTerms": {
  "termMonths": 36,
  "autoRenewal": false,
  "noticePeriodDays": 90,
  "earlyTerminationFeeMonths": 3,
  "annualEscalationPct": 3.0,
  "refreshCycle": "EVERY_36_MONTHS",
  "refreshIncluded": true,
  "refreshCondition": "STANDARD_SPEC_EQUIVALENT",
  "dataWipeOnReturn": true,
  "dataWipeStandard": "NIST_SP800-88",
  "sustainabilityReport": true,
  "certifiedRefurb": true
}
```

---

## 9. Gap Analysis vs. Salesforce / HubSpot CRM Models

| Capability | Salesforce CRM | HubSpot CRM | LEX + This Extension |
|---|---|---|---|
| Lead exchange (interoperable) | ❌ proprietary | ❌ proprietary | ✅ open spec |
| Procurement model typed enum | ❌ free text | ❌ free text | ✅ |
| Device specification (typed) | ❌ | ❌ | ✅ |
| DaaS term / refresh cycle | ❌ | ❌ | ✅ |
| Compliance requirements | ❌ | ❌ | ✅ |
| Integration requirements | ❌ | ❌ | ✅ |
| MDM / deployment config | ❌ | ❌ | ✅ |
| Lead lifecycle (9 states) | Proprietary | Proprietary | ✅ open |
| Lead deduplication (SHA-256) | ❌ | ❌ | ✅ |
| Lead closure (WON/LOST/ACK) | ✅ internal | ✅ internal | ✅ interoperable |
| Multi-format (JSON/XML/X12/EDI) | ❌ | ❌ | ✅ |
| Open governance / no lock-in | ❌ | ❌ | ✅ |
| AI predictive signals (tech) | ❌ | ❌ | ✅ |

---

## 10. `aiSignals`

Domain-specific AI-generated probability signals for technology procurement. Carried inside the extension `data` block alongside `deviceSpec`, `deploymentRequirements`, etc. Cross-industry signals remain in `lex.payload.lead.leadIntelligence`.

```json
"aiSignals": {
  "digitalMaturityScore": 0.68,
  "cloudReadinessScore": 0.74,
  "multiYearContractPropensity": 0.55,
  "enterpriseBuyingCommitteeSize": 4,
  "securityRfpLikelihood": 0.49,
  "competitorWinRisk": 0.38,
  "signalScoredAt": "2026-04-12T09:00:00Z",
  "modelVersion": "TECH_AI_SIGNALS_V1.0"
}
```

### Field Reference

| Field | Type | Description |
|---|---|---|
| `digitalMaturityScore` | Decimal (0–1) | Organization's digital transformation maturity — high scores indicate readiness for advanced solutions |
| `cloudReadinessScore` | Decimal (0–1) | Probability of opting for cloud/SaaS deployment over on-premise |
| `multiYearContractPropensity` | Decimal (0–1) | Likelihood customer will commit to a 2+ year agreement |
| `enterpriseBuyingCommitteeSize` | Integer | Predicted number of stakeholders involved in the purchase decision |
| `securityRfpLikelihood` | Decimal (0–1) | Probability customer will conduct a formal security/compliance RFP before purchasing |
| `competitorWinRisk` | Decimal (0–1) | Predicted probability a competitor wins this deal |
| `signalScoredAt` | ISO 8601 | When these technology-specific signals were generated |
| `modelVersion` | String | Scoring model version |
