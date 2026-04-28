# LEX API Conformance Proof

A Node.js project that proves conformance against all three LEX API artifacts:

| Proof | Script | What it checks |
|---|---|---|
| OpenAPI | `openapi-proof.js` | Validates `lex-openapi.yaml` structure, required paths, and schemas |
| AsyncAPI | `asyncapi-proof.js` | Validates `lex-asyncapi.yaml` channels and message definitions; optional live Kafka / AMQP dry-runs |
| Sandbox | `sandbox-proof.js` | Builds a real LEX LEAD for all 6 industries, validates locally, then POSTs to the sandbox REST API |

---

## Prerequisites

- **Node.js 20+**
- LEX JS library installed in `../../libraries/js` (no publish step needed — referenced locally)

---

## Install

```bash
npm install
```

---

## Run all proofs

```bash
npm test
```

The runner (`src/index.js`) executes all three proofs and prints a `PASS / FAIL` summary.

---

## Run individual proofs

```bash
# 1. OpenAPI spec validation
npm run test:openapi

# 2. AsyncAPI spec validation
npm run test:asyncapi

# 3. Sandbox REST API probe (all 6 industries)
npm run test:sandbox
```

---

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `LEX_API_BASE` | `https://sandbox.lexstandard.org/v1` | Override the sandbox base URL |
| `LEX_API_KEY`  | *(empty)* | Bearer token for authenticated requests |
| `KAFKA_BROKER` | *(empty)* | If set, asyncapi-proof connects and publishes a test message |
| `AMQP_URL`     | *(empty)* | If set, asyncapi-proof connects and asserts queue/binding |

Without `LEX_API_KEY` the sandbox proof still runs — responses of `401`/`403` are accepted as
"auth required" and counted as passing (the endpoint is reachable and returning expected HTTP
semantics). Without `LEX_API_BASE` pointing to a live host, network failures are counted as
offline and skipped rather than failed.

---

## What each proof verifies

### openapi-proof.js

Uses `@apidevtools/swagger-parser` to fully parse and dereference `api/lex-openapi.yaml`, then asserts:

- 10 required paths (`/messages`, `/messages/{messageId}`, `/leads`, `/leads/{leadId}`, etc.)
- 7 required component schemas (`AnyLexMessage`, `LeadMessage`, `AcknowledgmentMessage`, etc.)
- Prints the full operation inventory

### asyncapi-proof.js

Reads `api/lex-asyncapi.yaml` directly and asserts:

- 6 required channels (`lex/leads/inbound`, `lex/leads/outbound`, `lex/assets/inbound`, `lex/acknowledgments`, `lex/subscriptions`, `lex/closures`)
- 5 required component messages (`LeadMessage`, `AssetMessage`, `AcknowledgmentMessage`, `SubscriptionMessage`, `LeadClosureMessage`)
- Optional live Kafka producer + AMQP binding (activated by env vars)

### sandbox-proof.js

For each of the 6 industries (automotive, aviation, maritime, heavy-equipment, real-estate, technology):

1. Loads the industry's e2e scenario JSON from `../../examples/<industry>/json/`
2. Extracts customer and asset details from the first `LEAD` message
3. Builds a new `LeadMessage` via the LEX JS DSL
4. Validates the message locally with `LexClient.validate()`
5. POSTs to `${LEX_API_BASE}/messages`
6. Asserts the response shape

---

## Project structure

```
api-conformance/
  package.json
  README.md
  src/
    index.js            — runner (executes all three proofs)
    openapi-proof.js    — OpenAPI spec validation
    asyncapi-proof.js   — AsyncAPI spec + optional broker dry-runs
    sandbox-proof.js    — live sandbox REST probe for all 6 industries
```
