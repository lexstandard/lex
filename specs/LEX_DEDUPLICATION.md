<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright (c) 2026 LEX Lead Exchange Standard Contributors -->
<!-- Canonical specification: https://lexstandard.org -->

# LEX - Lead Deduplication Strategy

## Overview

Cross-platform lead deduplication is the most prevalent operational problem in CRM today. A single customer shopping for a specific asset (e.g. Toyota RAV4 or Boeing 787) may simultaneously generate leads on:

- `toyota.com` (Manufacturer website)
- AutoTrader listing click
- Cars.com inquiry form
- The retailer's own website
- Google Vehicle Ads conversion

All five arrive at the same retailer's Management System within minutes, each as a distinct lead. Without deduplication, a salesperson calls the same customer five times — a practice that drives customers away and generates TCPA liability.

LEX defines a **spec-level deduplication strategy** so DMS providers and OEM platforms can handle this consistently.

---

## 1. Deduplication Approach

LEX uses a **sender-signals, receiver-decides** model:
- Senders attach a `customerFingerprint` and `deduplicationHint` to every LEAD message
- Receivers (DMS, OEM platform) apply their own deduplication logic using these signals
- When a duplicate is detected, the receiver sends a LEAD with `closureStatus: DUPLICATE` via LEAD_CLOSURE

This avoids a central deduplication service while enabling consistent signals across all platforms.

---

## 2. Customer Fingerprint

The `customerFingerprint` is a **hashed, non-reversible** customer identifier derived from PII. It must never contain raw PII.

### Generation Algorithm

```
fingerprint = SHA-256(
  normalize(email) + "|" + normalize(phone) + "|" + normalize(lastName)
)
```

**Normalization rules:**
- `email`: lowercase, trim whitespace
- `phone`: strip all non-digits, strip leading country code, keep last 10 digits
- `lastName`: lowercase, trim, strip diacritics (é→e, ñ→n)

### Example

```python
import hashlib

def generate_fingerprint(email: str, phone: str, last_name: str) -> str:
    email_n = email.strip().lower()
    phone_n = re.sub(r'\D', '', phone)[-10:]
    name_n = last_name.strip().lower()
    # Diacritic stripping would be applied in production via unicodedata.normalize
    raw = f"{email_n}|{phone_n}|{name_n}"
    return hashlib.sha256(raw.encode('utf-8')).hexdigest()
```

### JSON Field

```json
"deduplication": {
  "customerFingerprint": "a3f8c2e1d9b74a0f1234567890abcdef1234567890abcdef1234567890abcdef",
  "fingerprintVersion": "SHA256_V1",
  "deduplicationWindowHours": 72,
  "senderLeadId": "AT-2026-LEAD-492910",
  "duplicateOfLeadId": null,
  "crossPlatformIds": [
    { "platform": "AUTOTRADER", "leadId": "AT-2026-492910" },
    { "platform": "CARS_COM", "leadId": "CC-2026-LEAD-887123" }
  ]
}
```

---

## 3. Deduplication Block Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `customerFingerprint` | String | Yes (when PII present) | SHA-256 hash of normalized email+phone+lastName |
| `fingerprintVersion` | Enum | Yes | Algorithm version: `SHA256_V1` (current) |
| `deduplicationWindowHours` | Integer | No | Sender hint: treat leads within this window as potential duplicates. Default: 72h |
| `senderLeadId` | String | No | Sender's own lead ID for cross-reference |
| `duplicateOfLeadId` | String | No | Set by receiver when duplicate is detected. References the canonical lead ID |
| `crossPlatformIds` | Array | No | Other platform IDs for the same lead, if known at send time |
| `deduplicationStatus` | Enum | No | `PENDING`, `UNIQUE`, `DUPLICATE`, `MERGED` — set by receiver |

---

## 4. Deduplication Decision Logic (Receiver)

Receivers SHOULD implement this decision flow:

```
Incoming LEAD message
    ↓
1. Extract customerFingerprint
    ↓
2. Query local store: fingerprint seen in last [deduplicationWindowHours]?
    ├── NO → Mark UNIQUE, create lead, store fingerprint
    └── YES → Candidate duplicate found
              ↓
         3. Compare status of existing lead
              ├── ARCHIVED / DELIVERED → Mark as new lead (customer re-engaged)
              └── Active (any other status) → Mark DUPLICATE
                    ↓
              4. Send LEAD_CLOSURE message with closureStatus = DUPLICATE
                   referencing the canonical leadId
```

**Key principle:** A customer who previously completed a purchase (DELIVERED/ARCHIVED) and returns as a new lead should NOT be deduplicated. The lifecycle has reset.

---

## 5. Merge Strategy

When two leads for the same customer are deemed duplicates, the canonical lead is the one with:
1. **Higher completeness** (more filled fields)
2. **Earlier creation timestamp** (if completeness equal)

The non-canonical lead's `deduplication.duplicateOfLeadId` is set to the canonical lead's ID, and a LEAD_CLOSURE with `closureStatus = DUPLICATE` is issued for the non-canonical lead.

---

## 6. `deduplicationWindowHours` Guidelines

| Scenario | Recommended Window |
|---|---|
| Manufacturer website + retailer network | 72 hours |
| Aggregator platform (AutoTrader, Cars.com) | 48 hours |
| Social media leads (Facebook, Google Ads) | 24 hours |
| OEM-to-OEM internal routing | 168 hours (7 days) |

---

## 7. Cross-Platform Lead Linkage

When an aggregator is aware that a lead also exists on another platform, it SHOULD populate `crossPlatformIds`. This allows the receiving DMS to merge records proactively rather than waiting for duplicate detection.

```json
"crossPlatformIds": [
  { "platform": "AUTOTRADER", "leadId": "AT-2026-492910", "leadTimestamp": "2026-03-25T08:50:00Z" },
  { "platform": "GOOGLE_VEHICLE_ADS", "leadId": "GVA-2026-1928374", "leadTimestamp": "2026-03-25T08:52:00Z" }
]
```

Supported `platform` values matching the LEX Lead Source registry:
`AUTOTRADER`, `CARS_COM`, `CARGURUS`, `TRUECAR`, `FACEBOOK_MARKETPLACE`, `GOOGLE_VEHICLE_ADS`, `EDMUNDS`, `KIJIJI`, `AUTOSCOUT24`, `MOBILE_DE`, `CARWALE`, `TEAM_BHP`, `ZIGWHEELS`

---

## 8. Privacy Considerations

- `customerFingerprint` is a one-way hash — it cannot be reversed to recover PII
- `crossPlatformIds` must not include customer PII, only opaque platform identifiers
- The fingerprint MUST be regenerated if the customer updates their contact information
- Receivers must not use `customerFingerprint` as a cross-system customer identifier for any purpose other than deduplication within the defined `deduplicationWindowHours`

