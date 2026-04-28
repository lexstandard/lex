# LEX Sample — Node.js / Express

Demonstrates multi-industry lead exchange using the LEX JavaScript library against the LEX sandbox API.

## Prerequisites

- Node.js 18+
- `npm install`

## Setup

```bash
cd samples/nodejs-express
npm install
```

## Run

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Server listens on `http://localhost:3000` (override with `PORT` env var).

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `LEX_SENDER_ID` | `SAMPLE-NODE-001` | Your LEX sender identifier |
| `LEX_RECEIVER_ID` | `LEX-PLATFORM` | Target LEX receiver |
| `LEX_API_BASE` | `https://sandbox.lexstandard.org/v1` | LEX API base URL |
| `LEX_API_KEY` | _(empty)_ | Bearer token for authenticated endpoints |

## Endpoints

### List industries
```
GET /industries
```

### Get raw industry scenario
```
GET /examples/automotive
GET /examples/aviation
GET /examples/maritime
GET /examples/heavy-equipment
GET /examples/real-estate
GET /examples/technology
```

### Submit a lead for an industry
```
POST /leads/automotive
POST /leads/aviation
POST /leads/maritime
POST /leads/heavy-equipment
POST /leads/real-estate
POST /leads/technology
```
Optional JSON body to override customer fields:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "+13125559876"
}
```

### Validate a raw LEX message
```
POST /validate
Content-Type: application/json

{ "lex": { "header": { ... }, "payload": { ... } } }
```

## How it works

1. The industry scenario JSON from `examples/<industry>/json/` is loaded  
2. The first `LEAD` message in the scenario supplies product/customer data  
3. The LEX DSL builder constructs a proper LEX envelope  
4. Local validation runs (schema + business rules)  
5. If valid, the message is submitted to the LEX sandbox API  
6. The API response (including the ACK) is returned  
