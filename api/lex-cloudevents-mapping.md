<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright (c) 2026 LEX Lead Exchange Standard Contributors -->
<!-- Canonical specification: https://lexstandard.org -->

# LEX — CloudEvents Envelope Alignment

## Overview

[CNCF CloudEvents v1.0.2](https://cloudevents.io/) is the dominant standard for event envelopes in cloud-native event-driven architectures. AWS EventBridge, Azure Event Grid, Google Eventarc, Confluent Kafka, and Knative all support CloudEvents natively.

By aligning LEX messages with CloudEvents, they can flow through any cloud event bus without transformation, enabling:

- **AWS EventBridge** routing rules on LEX events
- **Azure Event Grid** subscription filtering
- **Google Eventarc** trigger integration
- **Kafka Schema Registry** CloudEvents-aware serialization
- **Knative Eventing** broker/trigger model

---

## 1. CloudEvents Attribute Mapping

LEX header fields map to CloudEvents required/optional attributes as follows:

| CloudEvents Attribute | Required | LEX Equivalent | Notes |
|---|---|---|---|
| `specversion` | Yes | n/a | Always `"1.0"` |
| `id` | Yes | `lex.header.messageId` | Unique event ID |
| `source` | Yes | `lex.header.senderId` | Formatted as URI |
| `type` | Yes | `lex.header.messageType` | Prefixed — see §2 |
| `time` | No (use it) | `lex.header.timestamp` | ISO 8601 UTC |
| `subject` | No | `lex.payload.lead.leadId` (or assetId) | The entity being acted on |
| `datacontenttype` | No | `"application/json"` | Always JSON |
| `dataschema` | No | Schema URL | Points to LEX JSON Schema |
| `data` | No | `lex.payload` | The full payload |

---

## 2. Event Type Naming Convention

CloudEvents `type` uses a reverse-DNS namespace convention. LEX event types follow:

```
org.lexstandard.{messageType}.{action}
```

| LEX Message Type | CloudEvents `type` |
|---|---|
| `LEAD` (create/update) | `org.lexstandard.lead.submitted` |
| `LEAD` (status transition) | `org.lexstandard.lead.status.updated` |
| `ASSET` | `org.lexstandard.asset.submitted` |
| `ACKNOWLEDGMENT` | `org.lexstandard.message.acknowledged` |
| `SUBSCRIPTION` | `org.lexstandard.subscription.registered` |
| `LEAD_CLOSURE` | `org.lexstandard.lead.closed` |
| DLQ entry | `org.lexstandard.message.dlq.enqueued` |

---

## 3. CloudEvents Wire Format

### Structured Content Mode (JSON)

The full CloudEvents + LEX payload in the standard structured JSON format:

```json
{
  "specversion": "1.0",
  "id": "MSG-2026-LEAD-001234",
  "source": "https://platforms.lexstandard.org/senders/PLATFORM-TOYOTA-US",
  "type": "org.lexstandard.lead.submitted",
  "time": "2026-03-25T09:00:00Z",
  "subject": "LEAD-2026-003321",
  "datacontenttype": "application/json",
  "dataschema": "https://lexstandard.org/schemas/v1/LEX_LEAD_SCHEMA.json",
  "lex-version": "1.0",
  "lex-receiver": "RETAILER-TOYOTA-FREMONT-001",
  "lex-encryption": "TLS1.3",
  "data": {
    "lead": {
      "leadId": "LEAD-2026-003321",
      "status": "EXPRESSED_INTEREST",
      "source": "MANUFACTURER_WEBSITE",
      "customer": {
        "firstName": "Marcus",
        "lastName": "Okafor",
        "email": "marcus.okafor@email.com",
        "phone": "+14085559023"
      },
      "desiredProduct": {
        "productType": "VEHICLE",
        "manufacturers": ["Toyota"],
        "preferredModels": ["RAV4 Hybrid"]
      },
      "metadata": {
        "createdAt": "2026-03-25T09:00:00Z",
        "version": "1.0"
      }
    }
  }
}
```

### LEX Extension Attributes

CloudEvents allows vendor extension attributes (prefixed with the vendor name). LEX defines:

| Extension Attribute | Type | Description |
|---|---|---|
| `lex-version` | String | LEX spec version (e.g., `"1.0"`) |
| `lex-receiver` | String | `lex.header.receiverId` |
| `lex-encryption` | String | `lex.header.encryptionMethod` |
| `lex-correlationid` | String | `lex.header.correlationId` (optional) |
| `lex-ttlseconds` | Integer | `lex.header.ttl.maxAgeSeconds` |
| `lex-attempt` | Integer | `lex.header.retryContext.attemptNumber` (on retries) |

---

## 4. Binary Content Mode (HTTP Headers)

For high-performance transports, LEX fields can be carried in HTTP headers (CloudEvents binary mode). The payload is the raw LEX JSON without the CloudEvents envelope:

```http
POST /lex/inbound HTTP/1.1
Content-Type: application/json
ce-specversion: 1.0
ce-id: MSG-2026-LEAD-001234
ce-source: https://platforms.lexstandard.org/senders/PLATFORM-TOYOTA-US
ce-type: org.lexstandard.lead.submitted
ce-time: 2026-03-25T09:00:00Z
ce-subject: LEAD-2026-003321
ce-dataschema: https://lexstandard.org/schemas/v1/LEX_LEAD_SCHEMA.json
ce-lex-version: 1.0
ce-lex-receiver: RETAILER-TOYOTA-FREMONT-001

{
  "lex": {
    "header": { ... },
    "payload": { ... }
  }
}
```

**When to use binary mode:** Prefer binary mode when the CloudEvents metadata and LEX message are processed by different middleware layers (e.g., the event bus reads `ce-type` for routing but the application reads the LEX body for validation).

---

## 5. AWS EventBridge Integration

Map LEX CloudEvents to EventBridge custom event buses:

```json
// EventBridge rule targeting high-intent leads
{
  "source": ["org.lexstandard"],
  "detail-type": ["org.lexstandard.lead.submitted"],
  "detail": {
    "subject": [{ "prefix": "LEAD-" }],
    "data": {
      "lead": {
        "status": ["EXPRESSED_INTEREST", "IN_NEGOTIATION", "ORDER"]
      }
    }
  }
}
```

### EventBridge PutEvents mapping

```python
import boto3

def send_lex_to_eventbridge(lex_message: dict, lead_id: str) -> None:
    client = boto3.client('events')
    client.put_events(
        Entries=[{
            'Time': datetime.utcnow(),
            'Source': 'org.lexstandard',
            'DetailType': 'org.lexstandard.lead.submitted',
            'Detail': json.dumps({
                'specversion': '1.0',
                'id': lex_message['lex']['header']['messageId'],
                'subject': lead_id,
                'data': lex_message['lex']['payload']
            }),
            'EventBusName': 'lex-lead-events'
        }]
    )
```

---

## 6. Azure Event Grid Integration

Register a LEX CloudEvents schema in Event Grid:

```json
{
  "name": "LEXLeadSubmitted",
  "schemaId": "org.lexstandard.lead.submitted",
  "schemaVersion": "1.0",
  "compatibilityMode": "None"
}
```

### Azure Event Grid subscription filter for high-priority leads:

```json
{
  "filter": {
    "includedEventTypes": ["org.lexstandard.lead.submitted"],
    "advancedFilters": [
      {
        "operatorType": "StringIn",
        "key": "data.lead.status",
        "values": ["ORDER", "IN_NEGOTIATION", "EXPRESSED_INTEREST"]
      }
    ]
  }
}
```

---

## 7. Kafka Schema Registry

For Confluent/Kafka deployments, register the LEX CloudEvents schema in the Schema Registry:

```bash
# Register schema
curl -X POST https://schema-registry:8081/subjects/lex-lead-submitted-value/versions \
  -H "Content-Type: application/vnd.schemaregistry.v1+json" \
  -d '{
    "schemaType": "JSON",
    "schema": "<contents of LEX_LEAD_SCHEMA.json>"
  }'
```

Kafka producer configuration:
```properties
key.serializer=org.apache.kafka.common.serialization.StringSerializer
value.serializer=io.confluent.kafka.serializers.json.KafkaJsonSchemaSerializer
auto.register.schemas=false
use.latest.version=true
```

---

## 8. Full LEX → CloudEvents Conversion Reference

### LEX → CloudEvents attribute mapping function

```javascript
function lexToCloudEvent(lexMessage) {
  const header = lexMessage.lex.header;
  const payload = lexMessage.lex.payload;
  
  // Determine subject from payload
  let subject = header.messageId;
  if (payload.lead) subject = payload.lead.leadId;
  else if (payload.asset) subject = payload.asset.assetId;
  else if (payload.leadClosure) subject = payload.leadClosure.originalLeadId;
  
  // Map messageType to CloudEvents type
  const typeMap = {
    LEAD:          'org.lexstandard.lead.submitted',
    ASSET:   'org.lexstandard.asset.submitted',
    ACKNOWLEDGMENT:'org.lexstandard.message.acknowledged',
    SUBSCRIPTION:  'org.lexstandard.subscription.registered',
    LEAD_CLOSURE:  'org.lexstandard.lead.closed'
  };

  return {
    specversion: '1.0',
    id: header.messageId,
    source: `https://platforms.lexstandard.org/senders/${header.senderId}`,
    type: typeMap[header.messageType] || `org.lexstandard.${header.messageType.toLowerCase()}.submitted`,
    time: header.timestamp,
    subject,
    datacontenttype: 'application/json',
    dataschema: `https://lexstandard.org/schemas/v1/LEX_${header.messageType}_SCHEMA.json`,
    'lex-version': header.version,
    'lex-receiver': header.receiverId,
    'lex-encryption': header.encryptionMethod || 'TLS1.3',
    data: payload
  };
}
```

### CloudEvents → LEX reconstruction

```javascript
function cloudEventToLex(cloudEvent) {
  return {
    lex: {
      header: {
        messageId: cloudEvent.id,
        messageType: cloudEvent.type.split('.')[2].toUpperCase(),  // e.g., 'lead' → 'LEAD'
        version: cloudEvent['lex-version'] || '1.0',
        timestamp: cloudEvent.time,
        senderId: cloudEvent.source.split('/').pop(),
        receiverId: cloudEvent['lex-receiver'],
        encryptionMethod: cloudEvent['lex-encryption'] || 'TLS1.3'
      },
      payload: cloudEvent.data
    }
  };
}
```
