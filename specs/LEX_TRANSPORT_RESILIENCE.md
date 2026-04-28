<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright (c) 2026 LEX Lead Exchange Standard Contributors -->
<!-- Canonical specification: https://lexstandard.org -->

# LEX - Transport Resilience: Dead Letter Queues & Retry Strategy

## Overview

LEX messages flow through transport layers that can fail: networks go down, endpoints are temporarily unavailable, rate limits are hit, and payloads can be malformed. This document defines the standard retry and dead-letter strategy to ensure no lead is silently lost.

---

## 1. Message Delivery Categories

| Category | Description | Recovery Strategy |
|---|---|---|
| **Transient failure** | Network timeout, HTTP 5xx, temporary unavailability | Retry with exponential backoff |
| **Permanent failure** | Malformed message (parsing fails), invalid schema | Route to DLQ immediately — no retry |
| **Business rejection** | Validation error, unknown receiver ID | Send ACKNOWLEDGMENT with status=REJECTED |
| **TTL expiry** | Message not delivered within maximum age | Route to DLQ with expiry reason |

---

## 2. Message TTL (Time-To-Live)

Every LEX message carries retention metadata:

```json
"header": {
  "messageId": "...",
  "messageType": "LEAD",
  "timestamp": "2026-03-25T09:00:00Z",
  "ttl": {
    "maxAgeSeconds": 3600,
    "expiresAt": "2026-03-25T10:00:00Z",
    "onExpiry": "DLQ"
  }
}
```

### TTL Field Reference

| Field | Type | Required | Description |
|---|---|---|---|
| `maxAgeSeconds` | Integer | No | Maximum delivery window in seconds. Default: 3600 (1 hour) |
| `expiresAt` | ISO8601 | No | Absolute expiry timestamp (calculated from `timestamp + maxAgeSeconds`) |
| `onExpiry` | Enum | No | `DLQ` (route to dead letter), `DISCARD` (drop silently), `RETURN` (return to sender) |

**Default TTL by message type:**

| Message Type | Default TTL | Rationale |
|---|---|---|
| `LEAD` | 3600s (1h) | Leads are time-sensitive; stale leads cause customer experience failure |
| `ACKNOWLEDGMENT` | 300s (5m) | ACKs are real-time signals |
| `SUBSCRIPTION` | 86400s (24h) | Subscription updates are less time-sensitive |
| `VEHICLE` | 86400s (24h) | Inventory can tolerate short delays |
| `LEAD_CLOSURE` | 3600s (1h) | Closure data should reach source quickly |

---

## 3. Retry Strategy

### Standard Retry Policy

```
Attempt 1: Immediate
Attempt 2: +30 seconds
Attempt 3: +2 minutes
Attempt 4: +10 minutes
Attempt 5: +30 minutes
Attempt 6: Final attempt, +1 hour
    → FAILURE → Route to DLQ
```

**Exponential backoff formula:** `waitSeconds = baseDelay * (2 ^ (attempt - 1))`

Base delay = 30 seconds, with ±10% jitter to prevent thundering herd.

### Retry Envelope

When a message is retried, the `header.retryContext` block is added:

```json
"header": {
  "retryContext": {
    "originalTimestamp": "2026-03-25T09:00:00Z",
    "attemptNumber": 3,
    "maxAttempts": 6,
    "lastFailureReason": "HTTP_502_BAD_GATEWAY",
    "lastAttemptTimestamp": "2026-03-25T09:02:00Z",
    "nextAttemptTimestamp": "2026-03-25T09:12:00Z"
  }
}
```

### Last-Failure-Reason Values

| Value | Retriable |
|---|---|
| `HTTP_408_TIMEOUT` | Yes |
| `HTTP_429_RATE_LIMITED` | Yes (respect Retry-After header) |
| `HTTP_500_INTERNAL_ERROR` | Yes |
| `HTTP_502_BAD_GATEWAY` | Yes |
| `HTTP_503_SERVICE_UNAVAILABLE` | Yes |
| `HTTP_400_BAD_REQUEST` | **No** — schema error, route to DLQ |
| `HTTP_401_UNAUTHORIZED` | **No** — config error, alert operator |
| `HTTP_404_NOT_FOUND` | **No** — incorrect endpoint, alert operator |
| `NETWORK_UNREACHABLE` | Yes |
| `TLS_HANDSHAKE_FAILURE` | Yes (max 3x) |
| `PARSE_ERROR` | **No** — malformed payload, route to DLQ |
| `SCHEMA_VALIDATION_FAILED` | **No** — invalid LEX message, route to DLQ |

---

## 4. Dead Letter Queue (DLQ)

### DLQ Message Envelope

When a message is routed to the DLQ, the router wraps the original message:

```json
{
  "dlq": {
    "dlqId": "DLQ-2026-0001234",
    "originalMessageId": "MSG-2026-LEAD-001",
    "originalMessageType": "LEAD",
    "originalSenderId": "PLATFORM-TOYOTA-US",
    "originalReceiverId": "DEALER-ABC-001",
    "enqueuedAt": "2026-03-25T10:01:00Z",
    "failureCategory": "TRANSIENT_EXHAUSTED",
    "failureReason": "All 6 delivery attempts failed — HTTP_503_SERVICE_UNAVAILABLE",
    "attemptCount": 6,
    "lastAttemptTimestamp": "2026-03-25T10:00:00Z",
    "originalMessage": { /* complete original LEX message */ },
    "retryEligible": true,
    "notificationSent": false
  }
}
```

### Failure Categories

| Category | Description | Operator Action |
|---|---|---|
| `TRANSIENT_EXHAUSTED` | All retries used on a transient error | Alert operator; receiver may be down |
| `PERMANENT_SCHEMA_ERROR` | Message fails LEX schema validation | Fix sender implementation |
| `PERMANENT_AUTH_ERROR` | Authentication/authorization rejected | Fix credentials or receiver config |
| `TTL_EXPIRED` | Message exceeded max age before delivery | Review TTL settings; may indicate slow receiver |
| `POISON_MESSAGE` | Message causes receiver to crash deterministically | Quarantine and alert; do not retry |
| `MANUAL_DLQ` | Operator manually moved to DLQ | Operator-driven |

### Poison Message Detection

A message is classified as **poison** if:
1. It successfully passed LEX schema validation, AND
2. It caused a non-LEX-schema error on the receiver (e.g., unhandled null, logic exception), AND
3. This repeats on ≥ 2 independent retry attempts

Poison messages are quarantined (not retried) and an alert is sent to both sender and receiver operators.

---

## 5. DLQ Endpoints

DLQ endpoints are registered per organization in the Org Registry. Format:

```json
"organizationTransportConfig": {
  "primaryEndpoint": "https://api.dealer-abc.com/lex/inbound",
  "dlqEndpoint": "https://api.dealer-abc.com/lex/dlq",
  "notificationWebhook": "https://ops.dealer-abc.com/alerts",
  "retryPolicy": "STANDARD_6_ATTEMPT",
  "maxTtlSeconds": 7200
}
```

---

## 6. Sender-Side Guarantees

Senders MUST implement **at-least-once delivery** semantics for LEAD messages, meaning:

1. Store message in a local outbox before transmitting
2. Only delete from outbox after receiving:
   - A successful HTTP 2xx response from the receiver, OR
   - An ACKNOWLEDGMENT message with status `RECEIVED` or `PROCESSED`
3. If no ACK received within `header.ttl.maxAgeSeconds / 2`, retransmit

This prevents silent message loss due to network failures between send and ACK.

---

## 7. Idempotency

Because at-least-once delivery can result in duplicate transmissions, receivers MUST be idempotent for `messageId`:

- Cache received `messageId` values for at least `2 × deduplicationWindowHours`
- If a message with a known `messageId` arrives: process and return 200 OK (do not reprocess)
- The `messageId` is the idempotency key — senders MUST NOT reuse message IDs

---

## 8. Monitoring Metrics

Recommended metrics for transport health monitoring:

| Metric | Description | Alert Threshold |
|---|---|---|
| `lex.delivery.success_rate` | % of messages delivered on first attempt | < 99% |
| `lex.delivery.retry_rate` | % of messages requiring ≥ 1 retry | > 2% |
| `lex.dlq.queue_depth` | Number of messages in DLQ | > 10 |
| `lex.dlq.poison_message_count` | Number of quarantined poison messages | > 0 |
| `lex.lead.ttl_expired_count` | LEAD messages that expired before delivery | > 0 per hour |
| `lex.delivery.avg_latency_ms` | Average end-to-end delivery latency | > 500ms |
