<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright (c) 2026 LEX Lead Exchange Standard Contributors -->
<!-- Canonical specification: https://lexstandard.org -->

# LEX API Specifications

LEX provides two machine-readable API definitions that allow you to generate clients,
validate implementations, and integrate with API tooling without manual coding:

| Specification | File | Version | Purpose |
|---|---|---|---|
| OpenAPI | `api/lex-openapi.yaml` | 3.1.0 | REST/Webhook endpoints |
| AsyncAPI | `api/lex-asyncapi.yaml` | 3.0.0 | Event-driven messaging channels |
| CloudEvents | `api/lex-cloudevents-mapping.md` | — | CloudEvents envelope alignment |

---

## 1. OpenAPI 3.1 — REST API

**File:** `api/lex-openapi.yaml`  
**Version:** OpenAPI 3.1.0  
**Base URL:** `https://api.lexstandard.org/v1`  
**Sandbox URL:** `https://sandbox.lexstandard.org/v1`  
**Auth:** OAuth 2.0 Client Credentials (adopter-implemented) — configure your platform's token endpoint in the `securitySchemes.oauth2.flows.clientCredentials.tokenUrl` field

### 1.1 Endpoints

| Method | Path | Operation | Description |
|---|---|---|---|
| `POST` | `/messages` | `submitMessage` | Submit any LEX message type |
| `GET` | `/messages/{messageId}` | `getMessage` | Retrieve a submitted message |
| `GET` | `/messages/{messageId}/acknowledgment` | `getAcknowledgment` | Get ACK for a message |
| `POST` | `/messages/batch` | `submitBatch` | Submit up to 100 messages in one call |
| `POST` | `/leads` | `submitLead` | LEAD-specific shorthand endpoint |
| `POST` | `/leads/{leadId}/closure` | `submitLeadClosure` | Submit LEAD_CLOSURE for a lead |
| `POST` | `/assets` | `submitAsset` | Submit an ASSET inventory message |
| `POST` | `/subscriptions` | `createSubscription` | Register a webhook subscription |
| `GET` | `/subscriptions` | `listSubscriptions` | List active subscriptions |
| `DELETE` | `/subscriptions/{subscriptionId}` | `cancelSubscription` | Cancel a subscription |
| `POST` | `/conformance/run` | `runConformance` | Run the conformance test suite |
| `GET` | `/conformance/report/{sessionId}` | `getConformanceReport` | Retrieve a conformance report |
| `GET` | `/schema/{messageType}` | `getSchema` | Retrieve JSON Schema for a message type |
| `GET` | `/health` | `healthCheck` | API health check (no auth required) |

### 1.2 OAuth 2.0 Scopes

| Scope | Purpose |
|---|---|
| `lex:leads:read` | Read LEAD messages |
| `lex:leads:write` | Submit and update LEAD messages |
| `lex:assets:read` | Read ASSET messages |
| `lex:assets:write` | Submit ASSET messages |
| `lex:closures:write` | Submit LEAD_CLOSURE messages |
| `lex:subscriptions:manage` | Create and manage subscriptions |
| `lex:conformance` | Run conformance tests |

### 1.3 Idempotency

All `POST` endpoints are idempotent on `messageId`. Submitting the same `messageId` a
second time returns `200 OK` with the original response — no duplicate processing occurs.
Clients SHOULD implement retry with idempotent IDs for resilience.

### 1.4 Rate Limits

| Tier | Limit |
|---|---|
| Standard | 1,000 requests/minute |
| Enterprise | 10,000 requests/minute |
| Batch endpoint | 100 messages/call |

Rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`. Retry after `Retry-After`
seconds on `429 Too Many Requests`.

### 1.5 Tooling

Import `api/lex-openapi.yaml` directly into:
- **Swagger UI** — interactive browser-based explorer
- **Postman** — import as a collection
- **Insomnia** — REST client
- **Any OpenAPI 3.1-compatible code generator** (openapi-generator, oapi-codegen, etc.)

---

## 2. AsyncAPI 3.0 — Event-Driven Messaging

**File:** `api/lex-asyncapi.yaml`  
**Version:** AsyncAPI 3.0.0  
**Production host:** `api.lexstandard.org`  
**Sandbox host:** `sandbox.lexstandard.org`  
**Auth (production):** OAuth 2.0 Client Credentials  
**Auth (sandbox):** API key — `X-LEX-API-Key` header

### 2.1 Channels

| Channel address | Direction | Message type | Description |
|---|---|---|---|
| `lex/leads/inbound` | receive | `LEAD` | Inbound leads from dealers, platforms, DMS |
| `lex/leads/outbound` | send | `LEAD` | Outbound lead status updates from OEM/platform |
| `lex/assets/inbound` | receive | `ASSET` | Asset inventory messages |
| `lex/acknowledgments` | send | `ACKNOWLEDGMENT` | Receipt confirmation and validation failures |
| `lex/subscriptions` | send | `SUBSCRIPTION` | Register or update event subscriptions |
| `lex/closures` | send | `LEAD_CLOSURE` | Deal outcome from dealer back to originating platform |
| `lex/dlq` | receive | DLQ | Failed messages after all delivery retries exhausted |

### 2.2 Supported Transport Bindings

| Transport | Protocol | Typical use |
|---|---|---|
| REST/Webhook | HTTPS POST | Web integrations, portals, SaaS platforms |
| AMQP | RabbitMQ / Azure Service Bus | On-premise DMS, enterprise middleware |
| Kafka | Topic-per-channel | High-volume OEM platforms (millions of events/day) |
| SFTP | File-drop EDI | Legacy systems, batch file exchange |

### 2.3 Operations

| Operation ID | Action | Channel | Description |
|---|---|---|---|
| `receiveLead` | receive | `lex/leads/inbound` | Process an inbound LEAD |
| `sendLeadUpdate` | send | `lex/leads/outbound` | Publish a lead status update |
| `sendAcknowledgment` | send | `lex/acknowledgments` | Send ACK for any received message |
| `receiveAsset` | receive | `lex/assets/inbound` | Process an ASSET message |
| `manageSubscription` | send | `lex/subscriptions` | Register or update a subscription |
| `sendLeadClosure` | send | `lex/closures` | Submit final deal outcome |

### 2.4 Message Headers (AsyncAPI)

All LEX messages carry typed headers that event infrastructure can use for routing:

| Header | Type | Values | Description |
|---|---|---|---|
| `lex-message-type` | string | `LEAD`, `ASSET`, `ACKNOWLEDGMENT`, `SUBSCRIPTION`, `LEAD_CLOSURE` | Message discriminator |
| `lex-version` | string | `1.0` | LEX spec version |
| `lex-encryption` | string | `NONE`, `TLS1.2`, `TLS1.3`, `END_TO_END` | Transport security indicator |

### 2.5 Dead Letter Queue

Messages that fail all delivery retries land on `lex/dlq` with a `DlqMessage` envelope:

| Field | Description |
|---|---|
| `dlqId` | Unique DLQ entry identifier |
| `originalMessageId` | The message that failed |
| `failureCategory` | `TRANSIENT_EXHAUSTED`, `PERMANENT_SCHEMA_ERROR`, `TTL_EXPIRED`, `POISON_MESSAGE`, etc. |
| `attemptCount` | Number of delivery attempts made |
| `originalMessage` | The complete original message |

### 2.6 Tooling

Import `api/lex-asyncapi.yaml` into:
- **AsyncAPI Studio** — interactive documentation browser (`studio.asyncapi.com`)
- **Microcks** — API mocking and contract testing for event-driven systems
- **Any AsyncAPI 3.0-compatible code generator** (`asyncapi generate`)

---

## 3. CloudEvents Alignment

**File:** `api/lex-cloudevents-mapping.md`

LEX messages map to the [CNCF CloudEvents v1.0.2](https://cloudevents.io/) envelope,
enabling LEX events to flow through cloud-native event buses without transformation.

### 3.1 Event Type Convention

```
org.lexstandard.{messageType}.{action}
```

| LEX Message Type | CloudEvents `type` |
|---|---|
| `LEAD` (create/update) | `org.lexstandard.lead.submitted` |
| `LEAD` (status change) | `org.lexstandard.lead.status.updated` |
| `ASSET` | `org.lexstandard.asset.submitted` |
| `ACKNOWLEDGMENT` | `org.lexstandard.message.acknowledged` |
| `SUBSCRIPTION` | `org.lexstandard.subscription.registered` |
| `LEAD_CLOSURE` | `org.lexstandard.lead.closed` |
| DLQ entry | `org.lexstandard.message.dlq.enqueued` |

### 3.2 Supported Event Buses

- **AWS EventBridge** — route LEX events using `detail-type` filter rules
- **Azure Event Grid** — subscribe to specific `type` patterns
- **Google Eventarc** — trigger Cloud Run / Cloud Functions on LEX events
- **Confluent Kafka** — Schema Registry-aware serialization with CloudEvents headers
- **Knative Eventing** — Broker/Trigger model using `type` selectors

Full mapping tables, structured content mode examples, binary mode HTTP headers, and
conversion code are in `api/lex-cloudevents-mapping.md`.

---

## 4. Schema Reference

JSON Schemas for all five message types are in `schemas/`:

| File | Message type | Description |
|---|---|---|
| `LEX_MESSAGE_SCHEMA.json` | Envelope | Root schema — wraps all message types |
| `LEX_LEAD_SCHEMA.json` | `LEAD` | Lead lifecycle, customer, product, consent |
| `LEX_ASSET_SCHEMA.json` | `ASSET` | Universal asset inventory — 18 asset classes |
| `LEX_ACKNOWLEDGMENT_SCHEMA.json` | `ACKNOWLEDGMENT` | Receipt confirmation |
| `LEX_SUBSCRIPTION_SCHEMA.json` | `SUBSCRIPTION` | Event subscription preferences |
| `LEX_LEAD_CLOSURE_SCHEMA.json` | `LEAD_CLOSURE` | Deal outcome |

All schemas are JSON Schema Draft-07 (`http://json-schema.org/draft-07/schema#`).  
Published at: `https://lexstandard.org/schemas`

---

## 5. Versioning

Both API definitions follow the LEX specification version. The current version is `1.0`.

| Component | Current Version |
|---|---|
| LEX Specification | 1.0 |
| OpenAPI definition | 3.1.0 (format), LEX 1.0 (content version) |
| AsyncAPI definition | 3.0.0 (format), LEX 1.0 (content version) |
| JSON Schema | Draft-07 |
| CloudEvents | 1.0.2 |

Breaking changes to the API definitions will result in a new LEX major version.
Non-breaking additions (new optional fields, new message types) increment the minor version.
