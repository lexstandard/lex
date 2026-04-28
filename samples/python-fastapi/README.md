# LEX Sample — Python / FastAPI

Demonstrates multi-industry lead exchange using the LEX Python library.

## Prerequisites

- Python 3.9+
- pip

## Setup

```bash
cd samples/python-fastapi
pip install -e .
```

## Run

```bash
uvicorn app.main:app --reload
```

Server listens on `http://localhost:8000`. Interactive API docs at `http://localhost:8000/docs`.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `LEX_SENDER_ID` | `SAMPLE-PYTHON-001` | Your LEX sender identifier |
| `LEX_RECEIVER_ID` | `LEX-PLATFORM` | Target LEX receiver |
| `LEX_API_BASE` | `https://sandbox.lexstandard.org/v1` | LEX API base URL |
| `LEX_API_KEY` | _(empty)_ | Bearer token for authenticated endpoints |

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/industries` | List supported industries |
| GET | `/examples/{industry}` | Raw e2e scenario JSON |
| POST | `/leads/{industry}` | Build + validate + submit a lead |
| POST | `/validate` | Validate any raw LEX message |

### Industries

`automotive` · `aviation` · `maritime` · `heavy-equipment` · `real-estate` · `technology`

### Submit lead (example)

```bash
curl -X POST http://localhost:8000/leads/automotive \
     -H "Content-Type: application/json" \
     -d '{"firstName":"Jane","lastName":"Smith","email":"jane@example.com"}'
```

## How it works

1. The industry scenario from `examples/<industry>/json/` supplies real product and customer data  
2. The LEX DSL builder constructs a proper LEX envelope  
3. Local validation runs (three-layer: schema, business rules, security)  
4. If valid, the message is POSTed to the LEX sandbox API via `httpx`  
5. The API response (including ACK status) is returned  
