<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright (c) 2026 LEX Lead Exchange Standard Contributors -->
<!-- Canonical specification: https://lexstandard.org -->

# LEX Field Dictionary & Reference

## Overview
Complete reference of all fields in LEX message specifications. This document is the definitive source for field names, types, validation rules, and usage.

---

## Standard Field Types

| Type | Format/Range | Example | Notes |
|------|------|---------|-------|
| String | UTF-8 text | "John Doe" | Max 500 chars unless specified |
| Integer | Whole numbers | 2026 | Can be signed or unsigned |
| Decimal | Floating point | 28950.00 | Typically currency: 2 decimals |
| UUID | RFC 4122 | "550e8400-e29b..." | 36 chars with hyphens |
| ISO8601 | Date/time | "2026-03-23T14:30:00Z" | Always UTC |
| Enum | Predefined values | "SEDAN" | Case-sensitive |
| Boolean | true/false | true | JSON representation |
| Array | Ordered list | [1, 2, 3] | Type varies by content |
| Object | Key-value pairs | {...} | Structure varies by field |

---

## Header Fields

### messageId
**Type:** UUID  
**Required:** Yes  
**Description:** Unique identifier for this message  
**Rules:**
- Must be RFC 4122 compliant UUID v4
- If not provided, system generates one
- Used for deduplication and correlation

**Example:**
```json
"messageId": "550e8400-e29b-41d4-a716-446655440000"
```

### messageType
**Type:** Enum  
**Required:** Yes  
**Description:** Type of message being sent  
**Valid Values:** `LEAD`, `VEHICLE`, `ACKNOWLEDGMENT`, `SUBSCRIPTION`  
**Case-Sensitive:** Yes

**Example:**
```json
"messageType": "LEAD"
```

### timestamp
**Type:** ISO8601  
**Required:** Yes  
**Description:** When message was created  
**Rules:**
- Must be UTC timezone (ending with Z)
- Precision to seconds minimum
- Cannot be in future
- Older than 7 days are flagged as stale

**Example:**
```json
"timestamp": "2026-03-23T14:30:45Z"
```

### senderId
**Type:** String  
**Required:** Yes  
**Length:** 20-50 characters  
**Description:** Organization/system identifier of message sender  
**Format:** Alphanumeric, hyphens allowed, no spaces  
**Rules:**
- Must be registered in system
- Used for authentication and routing
- Case-sensitive

**Example:**
```json
"senderId": "DEALER-001"
```

### receiverId
**Type:** String  
**Required:** Yes  
**Length:** 20-50 characters  
**Description:** Organization/system identifier of message recipient  
**Format:** Alphanumeric, hyphens allowed, no spaces  
**Rules:**
- If "BROADCAST", message goes to all subscribed parties
- Used for message routing

**Example:**
```json
"receiverId": "MANUFACTURER-ABC"
```

### correlationId
**Type:** UUID  
**Required:** No  
**Description:** Links this message to a previous one (for request-response pairs)  
**Rules:**
- Should reference original messageId for responses
- Helps trace message chains
- Optional but recommended for ACKs

**Example:**
```json
"correlationId": "550e8400-e29b-41d4-a716-446655440000"
```

### version
**Type:** Semver String  
**Required:** Yes  
**Format:** MAJOR.MINOR.PATCH (e.g., "1.0.0")  
**Description:** LEX specification version for this message  
**Rules:**
- Currently: "1.0.0"
- Systems MUST handle other versions gracefully
- Major version changes indicate breaking changes

**Example:**
```json
"version": "1.0.0"
```

---

## Lead Fields

### leadId
**Type:** String  
**Required:** Yes  
**Max Length:** 50  
**Description:** Unique identifier for this lead  
**Format:** Alphanumeric, hyphens, underscores  
**Rules:**
- Must be unique per sender
- Recommended format: `LEAD-YYYY-XXXXXX`
- Used for updates and cross-reference

**Example:**
```json
"leadId": "LEAD-2026-001234"
```

### status
**Type:** Enum  
**Required:** Yes  
**Description:** Current lead lifecycle status  
**Valid Values:**
- `SHOPPING` - Browsing phase
- `EXPLORING` - Active comparison
- `TRADE_IN` - Trade-in evaluation
- `EXPRESSED_INTEREST` - Formal interest
- `RESERVATION` - Provisional booking
- `APPOINTMENT_REQUEST` - Visit scheduled
- `IN_NEGOTIATION` - Deal discussion
- `ORDER` - Purchase committed
- `ARCHIVED` - Historical

**Transition Rules:**
```
SHOPPING → EXPLORING, SHOPPING
EXPLORING → SHOPPING, EXPRESSED_INTEREST, EXPLORING
...
(see LEX_MESSAGE_TYPES.md for full transition matrix)
```

**Example:**
```json
"status": "EXPRESSED_INTEREST"
```

### source
**Type:** Enum  
**Required:** Yes  
**Description:** System/channel where lead originated  
**Valid Values:**
- `RETAILER_WEBSITE`
- `RETAILER_CRM`
- `MANUFACTURER_WEBSITE`
- `THIRD_PARTY_PORTAL`
- `DIRECT_CALL`
- `SHOWROOM`
- `TRADE_IN_EVALUATION`
- `SERVICE_DEPARTMENT`
- `SOCIAL_MEDIA`
- `EMAIL_CAMPAIGN`
- `REFERRAL`
- `OTHER`

**Example:**
```json
"source": "RETAILER_WEBSITE"
```

### sourceDetail
**Type:** Object  
**Required:** No  
**Description:** Additional context about message source  
**Fields:**
- `channel` (string) - Delivery channel (online, phone, in-person)
- `platform` (string) - Specific platform
- `languageCode` (string) - ISO 639-1 language code
- `customData` (object) - Any custom source data

**Example:**
```json
"sourceDetail": {
  "channel": "online",
  "platform": "dealership_website",
  "languageCode": "en-US"
}
```

---

## Customer Fields

### customer.firstName
**Type:** String  
**Required:** Yes  
**Max Length:** 50  
**Description:** Customer's first name  
**Rules:**
- Required for all leads
- Use only for primary contact person
- No special characters except hyphens/apostrophes

**Example:**
```json
"firstName": "John"
```

### customer.lastName
**Type:** String  
**Required:** Yes  
**Max Length:** 50  
**Description:** Customer's last name  
**Rules:**
- Required for all leads
- No special characters except hyphens/apostrophes

**Example:**
```json
"lastName": "Doe"
```

### customer.email
**Type:** String  
**Required:** Yes (with exceptions)  
**Max Length:** 254  
**Description:** Customer's email address  
**Format:** RFC 5322 email format  
**Validation:** Must be valid email format  
**Exception:** May be null if phone provided

**Example:**
```json
"email": "john.doe@example.com"
```

### customer.phone
**Type:** String  
**Required:** Conditional  
**Max Length:** 20  
**Description:** Customer's phone number  
**Format:** E.164 international format preferred (+1XXXYYYZZZZ)  
**Rules:**
- At least one of email or phone required
- Country code recommended
- Can include extensions

**Example:**
```json
"phone": "+13125551234"
```

### customer.dateOfBirth
**Type:** ISO8601 (date only)  
**Required:** No  
**Format:** YYYY-MM-DD  
**Description:** Customer's date of birth  
**Rules:**
- Use for age validation
- Treated as PII - encrypted in transit

**Example:**
```json
"dateOfBirth": "1985-05-15"
```

### customer.gender
**Type:** Enum  
**Required:** No  
**Valid Values:** `M`, `F`, `O` (Other), `N` (Not specified)  
**Rules:**
- Single character
- Optional for privacy

**Example:**
```json
"gender": "M"
```

### customer.address (Object)
**Type:** Object  
**Required:** Yes  
**Description:** Customer's mailing address  
**Sub-fields:**

#### address.street1
**Type:** String  
**Required:** Yes  
**Max Length:** 100  
**Description:** Primary address line

#### address.street2
**Type:** String  
**Required:** No  
**Max Length:** 100  
**Description:** Secondary address line (apt, suite)

#### address.city
**Type:** String  
**Required:** Yes  
**Max Length:** 50  
**Description:** City name

#### address.state
**Type:** String  
**Required:** Yes (for US/CA)  
**Max Length:** 2 (for US)  
**Description:** State or province code (US: 2-letter abbreviation)

#### address.postalCode
**Type:** String  
**Required:** Yes  
**Max Length:** 20  
**Description:** ZIP/postal code

#### address.country
**Type:** String  
**Required:** Yes  
**Format:** ISO 3166-1 alpha-2 (US, CA, MX, etc.)  
**Description:** Country code

**Example:**
```json
"address": {
  "street1": "123 Main Street",
  "street2": "Suite 100",
  "city": "Springfield",
  "state": "IL",
  "postalCode": "62701",
  "country": "US"
}
```

### customer.preferences (Object)
**Type:** Object  
**Required:** No  
**Description:** Customer communication preferences  
**Sub-fields:**

#### preferences.preferredContactMethod
**Type:** Enum  
**Valid Values:** `EMAIL`, `PHONE`, `TEXT`, `MAIL`  
**Description:** Primary contact method

#### preferences.preferredContactTime
**Type:** Enum  
**Valid Values:** `MORNINGS`, `AFTERNOONS`, `EVENINGS`, `WEEKENDS`, `ANYTIME`  
**Description:** Best time to contact

#### preferences.doNotCall
**Type:** Boolean  
**Default:** false  
**Description:** Respect Do Not Call list

#### preferences.doNotEmail
**Type:** Boolean  
**Default:** false  
**Description:** No marketing emails

#### preferences.doNotText
**Type:** Boolean  
**Default:** false  
**Description:** No SMS messages

**Example:**
```json
"preferences": {
  "preferredContactMethod": "EMAIL",
  "preferredContactTime": "EVENINGS",
  "doNotCall": false,
  "doNotEmail": false
}
```

---

## Vehicle Fields

### desiredVehicle.make
**Type:** String  
**Required:** Yes  
**Max Length:** 50  
**Description:** Vehicle manufacturer name  
**Rules:**
- Use official brand name
- Case-insensitive for validation
- Examples: "Toyota", "Honda", "Ford"

**Example:**
```json
"make": "Toyota"
```

### desiredVehicle.model
**Type:** String  
**Required:** Yes  
**Max Length:** 50  
**Description:** Vehicle model name  
**Rules:**
- Use official model name
- Examples: "Camry", "Civic", "F-150"

**Example:**
```json
"model": "Camry"
```

### desiredVehicle.year
**Type:** Integer  
**Required:** Yes  
**Range:** 1990-2030  
**Description:** Model year  
**Rules:**
- Must be valid year
- Can be current or future (for pre-orders)

**Example:**
```json
"year": 2026
```

### desiredVehicle.trim
**Type:** String or Array of Strings  
**Required:** No  
**Max Length:** 50  
**Description:** Trim level(s) of interest  
**Examples:** "LE", "SE", "LTZ", "Premium"  
**Rules:**
- Can be single value or array for multiple preferences
- Trim-specific features

**Example:**
```json
"trim": "LE"
// or
"trim": ["LE", "SE"]
```

### desiredVehicle.bodyType
**Type:** Enum  
**Required:** No  
**Valid Values:**
- `SEDAN` - 4-door passenger car
- `COUPE` - 2-door sports car
- `HATCHBACK` - Compact with liftgate
- `WAGON` - Extended cargo
- `SUV` - Sport utility
- `CROSSOVER` - Car-based utility
- `TRUCK` - Pickup truck
- `VAN` - Multi-passenger van
- `MINIVAN` - Family van
- `CONVERTIBLE` - Topless
- `OTHER`

**Example:**
```json
"bodyType": "SEDAN"
```

### desiredVehicle.transmission
**Type:** Enum  
**Required:** No  
**Valid Values:** `AUTOMATIC`, `MANUAL`, `CVT`, `DUAL_CLUTCH`, `OTHER`  

**Example:**
```json
"transmission": "AUTOMATIC"
```

### desiredVehicle.fuelType
**Type:** Enum  
**Required:** No  
**Valid Values:**
- `GASOLINE` - Traditional petrol
- `DIESEL` - Diesel fuel
- `HYBRID` - Gas + electric
- `PLUG_IN_HYBRID` - PHEV
- `ELECTRIC` - Full battery
- `NATURAL_GAS` - CNG
- `HYDROGEN` - Fuel cell
- `OTHER`

**Example:**
```json
"fuelType": "HYBRID"
```

### desiredVehicle.desiredFeatures
**Type:** Array of Strings  
**Required:** No  
**Description:** List of desired vehicle features  
**Common Values:**
- `ALL_WHEEL_DRIVE` / `AWD`
- `LEATHER_INTERIOR`
- `SUNROOF`
- `NAVIGATION_SYSTEM`
- `BACKUP_CAMERA`
- `BLUETOOTH`
- `SEAT_WARMERS`
- `ADAPTIVE_CRUISE_CONTROL`
- `LANE_KEEPING_ASSIST`
- `REMOTE_START`
- `POWER_WINDOWS`
- `POWER_LOCKS`

**Example:**
```json
"desiredFeatures": ["AWD", "LEATHER_INTERIOR", "SUNROOF"]
```

### desiredVehicle.excludedFeatures
**Type:** Array of Strings  
**Required:** No  
**Description:** Features customer explicitly does NOT want  

**Example:**
```json
"excludedFeatures": ["REMOTE_START"]
```

### desiredVehicle.priceRange
**Type:** Object  
**Required:** No  
**Description:** Customer's budget  
**Sub-fields:**
- `minUSD` (Decimal) - Minimum price
- `maxUSD` (Decimal) - Maximum price
- `currency` (String) - Currency code (default: USD)

**Rules:**
- Minimum must be less than or equal to maximum
- Positive values only
- 2 decimal places for currency

**Example:**
```json
"priceRange": {
  "minUSD": 25000,
  "maxUSD": 35000,
  "currency": "USD"
}
```

### desiredVehicle.deliveryType
**Type:** Enum  
**Valid Values:**
- `IMMEDIATE` - ASAP
- `FLEXIBLE` - No time constraint
- `SPECIFIC_DATE` - (see deliveryDate)

**Example:**
```json
"deliveryType": "IMMEDIATE"
```

---

## Trade-In Fields

### tradeIn.hasTradeIn
**Type:** Boolean  
**Required:** No  
**Default:** false  
**Description:** Whether customer has trade-in vehicle  

### tradeIn.year
**Type:** Integer  
**Description:** Trade-in vehicle year  

### tradeIn.make
**Type:** String  
**Description:** Trade-in vehicle manufacturer  

### tradeIn.model
**Type:** String  
**Description:** Trade-in vehicle model  

### tradeIn.vin
**Type:** String  
**Format:** 17 alphanumeric characters  
**Description:** Vehicle Identification Number  
**Validation:** Must pass VIN checksum

**Example:**
```json
"vin": "1HGCV1F32JA123456"
```

### tradeIn.mileage
**Type:** Integer  
**Description:** Odometer reading  
**Unit:** Miles (for US)

### tradeIn.condition
**Type:** Enum  
**Valid Values:** `EXCELLENT`, `GOOD`, `FAIR`, `POOR`  

### tradeIn.estimatedValue
**Type:** Decimal  
**Description:** Estimated trade-in value (USD)  

---

## Financing Fields

### financing.interestedInFinancing
**Type:** Boolean  
**Required:** No  
**Description:** Whether customer wants financing options  

### financing.preferredLoanTerm
**Type:** Integer  
**Unit:** Months  
**Description:** Desired loan duration  
**Common Values:** 24, 36, 48, 60, 72, 84  

### financing.downPaymentRange
**Type:** Object  
**Description:** Down payment budget  
**Sub-fields:**
- `minUSD` (Decimal)
- `maxUSD` (Decimal)

### financing.creditTierPreference
**Type:** Enum  
**Valid Values:** `EXCELLENT`, `GOOD`, `FAIR`, `POOR`  
**Description:** Self-reported credit tier  

---

## Metadata Fields

### metadata.createdAt
**Type:** ISO8601  
**Required:** Yes  
**Description:** When lead was initially created  
**Rules:**
- Set once, never changed
- Always UTC

### metadata.updatedAt
**Type:** ISO8601  
**Required:** Yes  
**Description:** Last modification time  
**Rules:**
- Updated each time lead changes
- Always UTC

### metadata.expirationDate
**Type:** ISO8601  
**Required:** No  
**Description:** When lead becomes stale/invalid  
**Rules:**
- Recommended: 30-90 days from creation
- Systems may archive expired leads
- Can be extended by updates

### metadata.priority
**Type:** Enum  
**Valid Values:** `LOW`, `NORMAL`, `HIGH`, `URGENT`  
**Default:** `NORMAL`  

### metadata.ownershipChain
**Type:** Array of Strings  
**Required:** No  
**Description:** Complete path of message through systems  
**Example:**
```json
"ownershipChain": [
  "DEALER-001",
  "MANUFACTURER-ABC",
  "DMS-SYSTEM"
]
```

### metadata.customFields
**Type:** Object  
**Required:** No  
**Status:** ⚠️ DEPRECATED as of LEX 1.1 — use `extensions[]` instead (see below)  
**Description:** Legacy flat string key-value custom data  
**Rules:**
- No reserved key names
- Max 50 custom fields
- **String values only** — type information is destroyed at system boundaries
- Will be removed in LEX 2.0
- New implementations MUST NOT use `customFields` for typed or structured data

---

## Extensions Fields

### extensions[]
**Type:** Array of Extension objects  
**Required:** No  
**Placement:** Top-level `lex` envelope (alongside `header` and `payload`)  
**Description:** Typed, namespaced, versioned custom data envelopes. Replaces `metadata.customFields`. Any valid JSON value may appear in `data`. Full spec: `specs/LEX_EXTENSION_STANDARD.md`.  
**Passthrough Obligation:** Any conformant system MUST forward unknown extensions intact. Dropping an unknown extension is non-conformant at L2.

### extensions[].namespace
**Type:** String  
**Required:** Yes (within each extension entry)  
**Format:** `{org}.{division}.{purpose}` — dot-separated, lowercase  
**Rules:**
- `lex.core.*` prefix is reserved for the LEX working group only
- All other namespaces are self-asserted — no approval required
- First segment SHOULD match the producing org's domain or LEX prefix

**Example:** `"toyota.na.captive"`, `"cdk.global.dms.workflow"`, `"dealer.abc.crm"`

### extensions[].version
**Type:** String (semver)  
**Required:** Yes  
**Format:** `MAJOR.MINOR.PATCH` (e.g., `1.2.0`)  
**Rules:** Must follow semantic versioning. Pre-release suffixes allowed (e.g., `1.0.0-beta`).

### extensions[].producer
**Type:** String  
**Required:** Yes  
**Description:** LEX organization ID of the system that produced this extension entry. Auditable; not validated against registry at runtime.

### extensions[].producedAt
**Type:** ISO 8601 timestamp  
**Required:** Yes  
**Description:** When this extension entry was produced.

### extensions[].schemaUri
**Type:** URI string  
**Required:** No  
**Description:** Optional URI to a JSON Schema for the `data` object. Resolving it is optional for receivers. Message is valid whether or not `schemaUri` is present or reachable.

### extensions[].data
**Type:** Any valid JSON (object, array, number, string, boolean)  
**Required:** Yes  
**Description:** The extension payload. No type restriction — this is the key improvement over `metadata.customFields` which allowed strings only.

**Example:**
```json
"extensions": [
  {
    "namespace": "toyota.na.captive",
    "version": "1.2.0",
    "producer": "ORG-TOYOTA-MFGR-NA-001",
    "producedAt": "2026-03-28T10:00:00Z",
    "data": {
      "programCode": "SPRING-2026-APR-SPECIAL",
      "aprRate": 1.9,
      "termMonths": 60,
      "eligibleRegions": ["CA", "WA", "OR"]
    }
  }
]
```

---

## Validation Fields

### validation.checksum
**Type:** String  
**Format:** "algorithm:hash"  
**Example:** `"sha256:e3b0c44298fc1c149..."`  
**Description:** Message integrity checksum  

### validation.signature
**Type:** String (base64)  
**Description:** Digital signature (optional)  
**Algorithm:** RSA-2048 or ECDSA recommended

---

## Field Validation Rules (Summary)

| Field | Type | Required | Max Length | Validation |
|-------|------|----------|-----------|-----------|
| leadId | String | Yes | 50 | Alphanumeric + hyphens/underscores |
| customer.email | String | Yes* | 254 | Valid email format |
| customer.phone | String | Yes* | 20 | E.164 format |
| desiredVehicle.make | String | Yes | 50 | Known manufacturer |
| desiredVehicle.model | String | Yes | 50 | Valid for make |
| desiredVehicle.year | Integer | Yes | N/A | 1990-2030 |
| vin | String | No | 17 | VIN checksum |
| timestamp | ISO8601 | Yes | N/A | Not future date |

*At least one required

---

**Last Updated:** March 23, 2026  
**Version:** 1.0 (Draft)
