<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright (c) 2026 LEX Lead Exchange Standard Contributors -->
<!-- Canonical specification: https://lexstandard.org -->

# LEX - Lead Exchange Standard Specification v1.0

## Document Overview
**Status:** Draft v1.0  
**Last Updated:** March 28, 2026  
**Specification Name:** LEX (Lead Exchange Standard)  
**Purpose:** Modern, flexible EDI-based specification for lead exchange between manufacturers, retailers, management systems, and third-party platforms across all product types.

---

## 0. Governance, License & Anti-Capture

### 0.1 License

This specification is published under the **Apache License, Version 2.0** (`SPDX-License-Identifier: Apache-2.0`).

Any entity — including any DMS provider, OEM, platform vendor, or individual developer — may implement LEX freely without payment, approval, or membership. No entity may claim a proprietary implementation of the core LEX specification.

**Why Apache 2.0 and not MIT:** Apache 2.0 includes an explicit patent retaliation clause. If any contributor or implementer brings a patent lawsuit asserting that the LEX specification or a conformant implementation infringes their patents, their license to the specification terminates. This protects the entire adopter ecosystem from patent ambush by contributors. MIT carries no such protection.

**Canonical specification notice:** The authoritative, canonical version of this specification is published at **https://lexstandard.org**. Any derivative specification, fork, or distribution must prominently disclose that it is derived from the LEX Lead Exchange Standard and is not the canonical specification.

### 0.2 Open Participation

Contributions to the LEX specification are open to all via public pull request on the GitHub repository. No financial contribution, dues payment, or membership fee is required to participate in specification development, propose changes, or be credited as a contributor.

All contributors are asked to sign the LEX Contributor License Agreement (CLA) before their pull request is merged. The CLA is available at `.github/CLA.md` in the repository. The CLA grants the project the rights necessary to distribute contributions under Apache 2.0 and keeps the patent chain clean for all downstream adopters. Signing is a one-time, irrevocable action per contributor.

### 0.3 No Mandatory Certification

Conformance levels (L1, L2, L3) are self-declared against published test vectors. Any third-party organization may offer certification services, but no certification body is mandatory. An implementation is not blocked from participating in the LEX ecosystem because it has not paid for certification.

### 0.4 Anti-Capture Clause

Any entity that introduces mandatory participation fees, access restrictions, proprietary data requirements, or vendor-specific dependencies into the core LEX specification — via governance capture, fork, or hosting agreement — is acting in violation of LEX governance. Implementations that impose such restrictions on conformant LEX participants are themselves non-conformant, regardless of what they call their product.

This clause is modeled on the governance protections in the HTTP/2 RFC (IESG governance), the Node.js OpenJS Foundation charter, and the principles that prevented the Java Community Process from becoming a lock-in mechanism after the Sun/Oracle transition.

The history this clause is designed to prevent: ADF/XML (automotive lead standard, circa 2001) was captured by incumbent DMS vendors within five years of publication. CDK and Reynolds & Reynolds implemented proprietary variants, charged integration fees, and the standard became a revenue mechanism for the incumbent platforms it was designed to bypass. STAR (Standards for Technology in Automotive Retail, also 1990s) became a dues-paying body with proportional representation — meaning its largest payers (CDK, R&R, major OEMs) effectively controlled the roadmap. LEX explicitly rejects this governance model.

### 0.5 Extension Registry Governance

The `LEX_EXTENSION_REGISTRY.json` accepts all namespace registrations that follow the naming convention (`{org}.{division}.{purpose}`). The only grounds for rejection of a namespace registration are:

1. Collision with the `lex.core.*` reserved namespace
2. Demonstrably malicious content (e.g., namespace impersonation of another organization)
3. Namespace does not follow the documented format

No editorial veto, no review fee, no approval delay beyond format validation. Namespace registration is not an endorsement by the LEX working group.

### 0.6 Simplicity Budget

The LEX core message structure (header + payload) MUST remain understandable by a competent developer without reading more than two specification documents. This is an explicit design constraint.

Every new field proposed for the LEX core must be justified against this budget. Optional blocks (`financialSummary`, `captiveFinance`, `dealLineage`, `dataGovernance`, etc.) are additive — a developer does not need to understand them to implement a conformant L1 system. This separation of core from optional is what keeps the simplicity budget intact as the specification grows.

When a proposed addition to the core is rejected in favor of an optional block, the spec will document the reason explicitly so future contributors understand the constraint.

---

## 1. Executive Summary

LEX is a modern, extensible specification designed to replace the legacy ADF format. It supports:
- **Bidirectional lead lifecycle management** from shopping through order placement
- **Multiple EDI formats**: X12, EDIFACT, JSON-EDI, XML-EDI
- **30-year forward compatibility** with versioning and extensibility built-in
- **Cross-platform support** through Haxe-based core implementation
- **Rich metadata** for lead context, compliance, and audit trails

### Lead Lifecycle Stages (LEX)
1. **SHOPPING** - Customer browsing/research phase
2. **EXPLORING** - Active interest, comparing options
3. **TRADE_IN** - Trade-in asset evaluation
4. **EXPRESSED_INTEREST** - Formal interest declaration
5. **RESERVATION** - Provisional booking/hold
6. **APPOINTMENT_REQUEST** - Scheduling showroom visit
7. **IN_NEGOTIATION** - Active deal discussion
8. **ORDER** - Final purchase commitment
9. **ARCHIVED** - Historical/completed lead

### Bidirectional Flow
- **Inbound:** Leads created/updated from retailers, systems, third-party sources
- **Outbound:** Manufacturers/platforms push lead updates back to originators
- **Acknowledgments:** Receipt confirmation and validation responses

---

## 2. Message Architecture

### 2.1 Core Message Structure

```
LEX Message Envelope
├── Header (Message metadata)
│   ├── MessageID (UUID)
│   ├── MessageType (LEAD, ASSET, ACKNOWLEDGMENT, etc.)
│   ├── Version (1.0, 1.1, etc.)
│   ├── Timestamp
│   └── Sender/Receiver Identifiers
├── Payload (Message-specific content)
│   └── [Content varies by MessageType]
└── Signature/Validation
    ├── Checksum
    └── Digital Signature (optional)
```

### 2.2 Message Types

#### 2.2.1 LEAD Message
Primary message for lead data exchange (all product types)

**Purpose:** Create, update, or query lead information  
**Direction:** Bidirectional  
**Required Fields:**
- Lead ID (unique identifier)
- Lead Status (enum from Lead Lifecycle)
- Lead Source
- Customer Information (name, contact, preferences)
- Asset Information (desired make, model, year, options) (desired make, model, year, options)
- Metadata (created date, updated date, ownership chain)

#### 2.2.2 ASSET Message
Asset specification and availability

**Purpose:** Share asset inventory and specifications  
**Direction:** Typically one-way (seller → buyer)  
**Content:**
- VIN
- Make, Model, Year, Trim
- Features and Options
- Pricing
- Availability Status
- Retailer Location

#### 2.2.3 ACKNOWLEDGMENT Message
Confirmation of message receipt and processing

**Purpose:** Validate message delivery and processing status  
**Direction:** Response (reverse of original)  
**Content:**
- Original MessageID
- Acknowledgment Status (RECEIVED, PROCESSED, REJECTED, ERROR)
- Validation Errors (if any)
- Timestamp

#### 2.2.4 SUBSCRIPTION Message
Subscribe to lead updates or asset notifications

**Purpose:** Allow systems to opt-in to specific message types/filters  
**Content:**
- Subscription Type (LEAD_UPDATES, ASSET_AVAILABILITY, etc.)
- Filters (make, model, location, lead status)
- Delivery Endpoint

### 2.3 Field Definitions (Common)

| Field | Type | Required | Description | Notes |
|-------|------|----------|-------------|-------|
| MessageID | UUID | Yes | Unique message identifier | Generated by sender |
| CorrelationID | UUID | No | Links related messages (response to request) | For request-response pairs |
| Timestamp | ISO8601 | Yes | Message creation time | UTC |
| SenderID | String | Yes | Organization/System identifier | 20-50 chars, alphanumeric |
| ReceiverID | String | Yes | Target organization/system | 20-50 chars, alphanumeric |
| Version | Semver | Yes | LEX version | e.g., "1.0.0", "1.1.5" |
| MessageType | Enum | Yes | Type of message | LEAD, ASSET, ACKNOWLEDGMENT, etc. |

---

## 3. EDI Format Implementations

### 3.1 JSON-EDI Format (Recommended for modern systems)

```json
{
  "lex": {
    "version": "1.0.0",
    "header": {
      "messageId": "550e8400-e29b-41d4-a716-446655440000",
      "messageType": "LEAD",
      "timestamp": "2026-03-23T14:30:00Z",
      "senderId": "RETAILER-001",
      "receiverId": "MANUFACTURER-ABC",
      "correlationId": null
    },
    "payload": {
      "lead": {
        "leadId": "LEAD-2026-001234",
        "status": "EXPRESSED_INTEREST",
        "source": "RETAILER_WEBSITE",
        "customer": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com",
          "phone": "+1234567890",
          "address": {
            "street": "123 Main St",
            "city": "Springfield",
            "state": "IL",
            "postalCode": "62701",
            "country": "US"
          }
        },
        "desiredProduct": {
          "make": "Toyota",
          "model": "Camry",
          "year": 2026,
          "trim": "LE",
          "priceRange": {
            "min": 25000,
            "max": 35000,
            "currency": "USD"
          }
        },
        "metadata": {
          "createdAt": "2026-03-20T10:15:00Z",
          "updatedAt": "2026-03-23T14:30:00Z",
          "ownershipChain": ["RETAILER-001", "MANUFACTURER-ABC"],
          "priority": "HIGH",
          "expirationDate": "2026-04-23T14:30:00Z"
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

### 3.2 XML-EDI Format

```xml
<?xml version="1.0" encoding="UTF-8"?>
<LEXMessage version="1.0.0">
  <Header>
    <MessageID>550e8400-e29b-41d4-a716-446655440000</MessageID>
    <MessageType>LEAD</MessageType>
    <Timestamp>2026-03-23T14:30:00Z</Timestamp>
    <SenderID>RETAILER-001</SenderID>
    <ReceiverID>MANUFACTURER-ABC</ReceiverID>
  </Header>
  <Payload>
    <Lead>
      <LeadID>LEAD-2026-001234</LeadID>
      <Status>EXPRESSED_INTEREST</Status>
      <!-- Additional fields... -->
    </Lead>
  </Payload>
  <Validation>
    <Checksum algorithm="sha256">abc123...</Checksum>
  </Validation>
</LEXMessage>
```

### 3.3 X12 EDI Format

X12 implementation will use:
- **Functional Group:** 850 (Purchase Order) adapted for lead
- **Transaction Set:** Custom LEX segment (pending X12 authority coordination)
- **Key Segments:** NM1 (Names), N3/N4 (Address), IT1 (Item), etc.

### 3.4 EDIFACT Format

EDIFACT implementation will use:
- **Message Type:** LEXLDE (LEX Lead Message)
- **Segments:** UNA, UNB, UNH, etc. (standard EDIFACT envelope)
- **Custom segments** for lead-specific data

---

## 4. Versioning & Extensibility

### 4.1 Semantic Versioning
LEX uses MAJOR.MINOR.PATCH versioning:
- **MAJOR:** Breaking changes (different message structure)
- **MINOR:** New optional fields, new message types
- **PATCH:** Bug fixes, clarifications

### 4.2 Forward Compatibility Strategy
- Optional fields are ignored by older systems
- New message types are handled gracefully with acknowledgment errors
- Custom extensions can be added via `extensions` object without breaking compatibility

### 4.3 Deprecation Policy
- Features marked deprecated in version N remain functional until version N+2
- Minimum 2-year grace period for deprecations
- Clear migration guidance provided

---

## 5. Security & Compliance

### 5.1 Authentication
- **Sender Verification:** MessageID signing with sender's private key
- **API Keys:** Organization-level credentials for system-to-system
- **OAuth2/JWT:** For web-based integrations

### 5.2 Data Protection
- PII encrypted in transit (TLS 1.3+)
- Optional end-to-end encryption for sensitive fields
- Data classification tags (PUBLIC, INTERNAL, CONFIDENTIAL)

### 5.3 Audit Trail
Every LEX message includes:
- Complete sender/receiver chain (ownershipChain)
- Timestamp with UTC timezone
- User/system responsible for changes (optional)
- Compliance with GDPR, CCPA, HIPAA guidelines

### 5.4 Rate Limiting & Throttling
- Per-sender quotas (e.g., 10,000 messages/hour)
- Backoff strategies for high-volume scenarios
- Queue management with priority levels

---

## 6. Error Handling

### 6.1 Error Codes

| Code | Name | HTTP | Description |
|------|------|------|-------------|
| LEX-001 | INVALID_FORMAT | 400 | Message structure invalid |
| LEX-002 | UNKNOWN_SENDER | 401 | Sender not recognized |
| LEX-003 | MISSING_REQUIRED_FIELD | 400 | Required field missing |
| LEX-004 | INVALID_LEAD_STATUS | 422 | Invalid status transition |
| LEX-005 | DUPLICATE_LEAD | 409 | Lead already exists |
| LEX-006 | UNKNOWN_MESSAGE_TYPE | 400 | MessageType not supported |
| LEX-100 | VALIDATION_ERROR | 400 | Custom validation failed |
| LEX-500 | INTERNAL_ERROR | 500 | Server error |

### 6.2 Error Response Format

```json
{
  "lex": {
    "header": { /* Echo original */ },
    "error": {
      "code": "LEX-003",
      "message": "Missing required field: customer.email",
      "field": "customer.email",
      "details": "Email address is required for all leads"
    }
  }
}
```

---

## 7. Implementation Roadmap

### Phase 1 (Q2 2026)
- [ ] Finalize JSON-EDI format
- [ ] Core Haxe library implementation
- [ ] Java library generation/wrapper
- [ ] Unit tests (80%+ coverage)
- [ ] Basic example implementations

### Phase 2 (Q3 2026)
- [ ] XML-EDI and X12 format support
- [ ] Python library generation
- [ ] C# library generation
- [ ] Integration test suite
- [ ] Documentation (technical & user guides)

### Phase 3 (Q4 2026)
- [ ] EDIFACT format support
- [ ] Additional language libraries (Go, Node.js, Ruby)
- [ ] REST API reference implementation
- [ ] GraphQL API option
- [ ] Performance optimization

### Phase 4 (2027+)
- [ ] Advanced features (real-time subscriptions, webhooks)
- [ ] Machine learning integrations
- [ ] Analytics dashboard
- [ ] Certified partner ecosystem

---

## 8. References & Related Standards

- EDI Standards: X12, EDIFACT
- Data Formats: JSON Schema, XML Schema
- Security: OAuth 2.0, TLS 1.3, JWT
- Transport: HTTP/1.1, HTTP/2, AMQP
- Automotive Standards: VIN standards, OEM data dictionaries

---

## APPENDIX A: Message Type Definitions (Detailed)

*See separate LEX_MESSAGE_TYPES.md*

## APPENDIX B: Field Reference Dictionary

*See separate LEX_FIELD_DICTIONARY.md*

## APPENDIX C: Examples by Scenario

*See /examples directory*

---

**Status:** Draft v1.0 | **Last Review:** March 23, 2026

