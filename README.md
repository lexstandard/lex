# LEX — Lead Exchange Standard

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/LEX-v1.0-green.svg)](specs/LEX_SPECIFICATION.md)
[![IETF Draft](https://img.shields.io/badge/IETF-Internet--Draft-orange.svg)](standard/draft-lexstandard-lex-00.md)

**LEX** is an open data interchange standard for sales lead messages. It defines a common
message envelope, a 15-state lead lifecycle, a deterministic deduplication mechanism, a
structured consent model, and an additive extension system that lets any organisation add
industry-specific fields without breaking receivers that don't know about them.

One integration handles every counterparty. The same message structure works for automotive,
heavy equipment, maritime, aviation, real estate, and technology — any industry that sells
high-value assets through a distributed partner network.

> **Spec →** [lexstandard.org/spec](https://lexstandard.org/spec) &nbsp;|&nbsp;
> **Whitepaper →** [whitepaper/LEX_Whitepaper.pdf](whitepaper/LEX_Whitepaper.pdf) &nbsp;|&nbsp;
> **Libraries →** [lexstandard.org/libraries](https://lexstandard.org/libraries)

---

## What a LEX message looks like

A minimal lead — the only fields required for an L1-conformant message:

```json
{
  "lex": {
    "header": {
      "messageId":   "550e8400-e29b-41d4-a716-446655440000",
      "messageType": "LEAD",
      "lexVersion":  "1.0.0",
      "timestamp":   "2026-04-01T10:00:00Z",
      "senderId":    "my-portal",
      "receiverId":  "dealer-dms-42"
    },
    "payload": {
      "lead": {
        "leadId": "LEAD-2026-001234",
        "status": "EXPRESSED_INTEREST",
        "customer": {
          "firstName": "Alex",
          "lastName":  "Rivera",
          "email":     "alex.rivera@example.com",
          "phone":     "+1-555-010-0100"
        },
        "desiredProduct": {
          "assetClass": "VEHICLE",
          "make":  "Example",
          "model": "Crossover",
          "year":  2026
        },
        "source": {
          "channel":           "WEB",
          "originatingSystem": "my-portal"
        }
      }
    }
  }
}
```

See [`examples/`](examples/) for complete examples across all industries and all four wire
formats (JSON-EDI, XML-EDI, X12, EDIFACT).

---

## Quick Start

### Python

```bash
pip install lexstandard
```

```python
from lex_client import LexClient

client = LexClient(sender_id="my-portal", receiver_id="dealer-dms-42")

# Validate and send a lead
lead = client.create_message({
    "leadId": "LEAD-2026-001234",
    "status": "EXPRESSED_INTEREST",
    "customer": {"firstName": "Alex", "lastName": "Rivera", "email": "alex.rivera@example.com"},
    "desiredProduct": {"assetClass": "VEHICLE", "make": "Example", "model": "Crossover", "year": 2026},
    "source": {"channel": "WEB", "originatingSystem": "my-portal"}
}, message_type="LEAD")

result = client.validate(lead)
if result["valid"]:
    client.send(lead, endpoint="https://your-receiver.example/lex/messages")
```

### JavaScript / Node.js

```bash
npm install @lexstandard/lex-js
```

```javascript
const LexClient = require('@lexstandard/lex-js');
const client = new LexClient({ senderId: 'my-portal', receiverId: 'dealer-dms-42' });

const lead = client.createMessage({
  leadId: 'LEAD-2026-001234',
  status: 'EXPRESSED_INTEREST',
  customer: { firstName: 'Alex', lastName: 'Rivera', email: 'alex.rivera@example.com' },
  desiredProduct: { assetClass: 'VEHICLE', make: 'Example', model: 'Crossover', year: 2026 },
  source: { channel: 'WEB', originatingSystem: 'my-portal' }
}, 'LEAD');

const result = await client.validate(lead);
if (result.valid) {
  await client.send(lead, 'https://your-receiver.example/lex/messages');
}
```

### Java

```xml
<dependency>
  <groupId>io.lexstandard</groupId>
  <artifactId>lex-java</artifactId>
  <version>1.0.0</version>
</dependency>
```

```java
LexClient client = new LexClient("my-portal", "dealer-dms-42");
String leadJson = client.createMessage(payload, "LEAD");
ValidationResult result = client.validate(leadJson);
if (result.isValid()) {
    client.send(leadJson, "https://your-receiver.example/lex/messages");
}
```

### C# (.NET)

```bash
dotnet add package LexStandard
```

```csharp
var client = new LexClient(senderId: "my-portal", receiverId: "dealer-dms-42");
var lead = client.CreateMessage(payload, "LEAD");
var result = client.Validate(lead);
if (result.Valid) {
    await client.SendAsync(lead, "https://your-receiver.example/lex/messages");
}
```

Working integration samples are in [`samples/`](samples/):

| Sample | Stack |
|---|---|
| [`samples/python-fastapi/`](samples/python-fastapi/) | Python 3 + FastAPI |
| [`samples/nodejs-express/`](samples/nodejs-express/) | Node.js + Express |
| [`samples/java-springboot/`](samples/java-springboot/) | Java + Spring Boot |
| [`samples/dotnet-steeltoe/`](samples/dotnet-steeltoe/) | C# + .NET + Steeltoe |

---

## Receiving a Lead and Sending an Acknowledgment

```python
from lex_client import LexClient

client = LexClient(sender_id="dealer-dms-42", receiver_id="my-portal")

# Parse and validate inbound message
result = client.parse_json(raw_json_string)

if result["valid"]:
    lead = result["message"]["lex"]["payload"]["lead"]
    print(f"Received: {lead['leadId']}  status={lead['status']}")

    # Send acknowledgment
    ack = client.create_acknowledgment(
        correlation_id=result["message"]["lex"]["header"]["messageId"],
        status="ACCEPTED"
    )
    client.send(ack, endpoint="https://sender.example/lex/messages")
else:
    for err in result["errors"]:
        print(f"Validation error: {err['field']} — {err['message']}")
```

---

## Message Types

| Type | Direction | When to use |
|---|---|---|
| `LEAD` | Sender → Receiver | Every time a lead is created or its status changes |
| `ACKNOWLEDGMENT` | Receiver → Sender | Must be sent in response to every received message |
| `LEAD_CLOSURE` | Receiver → Sender | When a lead reaches a terminal state (won, lost, expired, duplicate) |
| `ASSET` | Supplier → Partner | Push inventory or product specification data |
| `SUBSCRIPTION` | Any → Any | Register routing preferences / webhook filters |

---

## Lead Lifecycle

A lead progresses through up to 15 defined states:

```
CART → SHOPPING → EXPLORING → TEST_DRIVE_REQUESTED → TEST_DRIVE_COMPLETED
  → TRADE_IN → EXPRESSED_INTEREST → RESERVATION → APPOINTMENT_REQUEST
  → IN_NEGOTIATION → ORDER → ORDER_CONFIRMED → IN_DELIVERY → DELIVERED
  → ARCHIVED
```

At any point a lead can move to `ARCHIVED` (terminal). The full state machine and
transition rules are in [`specs/LEX_LEAD_CLOSURE.md`](specs/LEX_LEAD_CLOSURE.md).

---

## Wire Formats

The same data model serialises to four wire formats — use whichever your counterparty requires:

| Format | Content-Type | Best for | Example |
|---|---|---|---|
| JSON-EDI | `application/lex+json` | REST APIs and cloud integrations | [`examples/json-edi-lead.json`](examples/json-edi-lead.json) |
| XML-EDI | `application/lex+xml` | Enterprise middleware, legacy DMS | [`examples/xml-edi-lead.xml`](examples/xml-edi-lead.xml) |
| X12 850 | `application/edi-x12` | EDI VANs, automotive retail networks | [`examples/x12-lead.txt`](examples/x12-lead.txt) |
| EDIFACT ORDERS | `application/edifact` | European markets, maritime trade | [`examples/edifact-lead.txt`](examples/edifact-lead.txt) |

---

## Industries

LEX is cross-industry by design. All verticals use the same core message structure;
industry-specific fields live in a named extension namespace that any receiver passes
through unchanged.

| Industry | Asset class | Example folder |
|---|---|---|
| Automotive | `VEHICLE` | [`examples/automotive/`](examples/automotive/) |
| Heavy Equipment | `HEAVY_EQUIPMENT` | [`examples/heavy-equipment/`](examples/heavy-equipment/) |
| Maritime | `MARITIME` | [`examples/maritime/`](examples/maritime/) |
| Aviation | `AVIATION` | [`examples/aviation/`](examples/aviation/) |
| Real Estate | `REAL_ESTATE` | [`examples/real-estate/`](examples/real-estate/) |
| Technology | `TECHNOLOGY` | [`examples/technology/`](examples/technology/) |

---

## Conformance

LEX defines three self-declared conformance levels — no external certification required:

| Level | Who it is for | What you implement |
|---|---|---|
| **L1 — Basic** | Portals, simple lead senders | LEAD + ACKNOWLEDGMENT, JSON-EDI, core validation |
| **L2 — Standard** | DMS vendors, CRM platforms, aggregators | + lifecycle transitions, LEAD_CLOSURE, deduplication |
| **L3 — Full** | OEM platforms, enterprise networks | + ASSET, SUBSCRIPTION, multi-format, consent records |

Full checklists and test vectors: [lexstandard.org/conformance](https://lexstandard.org/conformance)

---

## API Definitions

Machine-readable API contracts for toolchain integration:

| Definition | Format | URL |
|---|---|---|
| REST API | OpenAPI 3.1 | [`api/lex-openapi.yaml`](api/lex-openapi.yaml) |
| Event-driven messaging | AsyncAPI 3.0 | [`api/lex-asyncapi.yaml`](api/lex-asyncapi.yaml) |

```bash
# Try the REST API with Swagger UI
docker run -p 8080:8080 \
  -e SWAGGER_JSON_URL=https://lexstandard.org/api/lex-openapi.yaml \
  swaggerapi/swagger-ui

# Generate a client
openapi-generator-cli generate \
  -i https://lexstandard.org/api/lex-openapi.yaml \
  -g python -o lex-client-python
```

---

## Specification

The [`specs/`](specs/) folder contains the full normative standard:

| Document | Covers |
|---|---|
| [`LEX_SPECIFICATION.md`](specs/LEX_SPECIFICATION.md) | Core standard — message structure, versioning, transport |
| [`LEX_FIELD_DICTIONARY.md`](specs/LEX_FIELD_DICTIONARY.md) | Every field: type, constraints, examples |
| [`LEX_MESSAGE_TYPES.md`](specs/LEX_MESSAGE_TYPES.md) | All five message types in detail |
| [`LEX_PRODUCT_MODEL.md`](specs/LEX_PRODUCT_MODEL.md) | Product-agnostic model covering 50+ product types |
| [`LEX_EXTENSION_STANDARD.md`](specs/LEX_EXTENSION_STANDARD.md) | Adding custom fields without breaking compatibility |
| [`LEX_CONFORMANCE.md`](specs/LEX_CONFORMANCE.md) | Conformance levels and validation rules |
| [`LEX_CONSENT_MODEL.md`](specs/LEX_CONSENT_MODEL.md) | GDPR / CCPA / DPDPA consent record structure |
| [`LEX_DEDUPLICATION.md`](specs/LEX_DEDUPLICATION.md) | Deterministic customer fingerprint algorithm |

JSON Schemas for all message types: [`schemas/`](schemas/)

---

## Extending LEX

Register a free namespace at [lexstandard.org/registry](https://lexstandard.org/registry) and add
your fields under `lex.ext.<your-namespace>.*`:

```json
"extensions": {
  "lex.ext.acme.fleet": {
    "preferredDeliveryPort": "PORT-HOUSTON-TX",
    "maintenanceContractType": "FULL_SERVICE",
    "fleetSize": 12
  }
}
```

Receivers that do not recognise your namespace must pass it through unchanged — they cannot
reject a message because of it. See [`specs/LEX_EXTENSION_STANDARD.md`](specs/LEX_EXTENSION_STANDARD.md).

---

## Contributing

Contributions are open to all — no membership fee or dues required.

1. Open an issue describing the need or problem
2. Submit a pull request referencing the issue
3. Changes go through a public review period before merging

By submitting a pull request you agree to the [Contributor License Agreement](.github/CLA.md).

---

## License

Apache 2.0 — free to implement, embed, and build commercial products on top of.
No permission required. No certification body. No vendor controls access.

See [LICENSE](LICENSE) for the full text.

---

**Canonical specification:** [lexstandard.org](https://lexstandard.org)

