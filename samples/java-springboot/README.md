# LEX Sample — Java / Spring Boot

Demonstrates multi-industry lead exchange using the LEX Java library.

## Prerequisites

- Java 17+
- Maven 3.8+
- LEX Java library installed locally

## Setup

```bash
# 1. Install LEX Java library to local Maven repo
mvn install -f ../../libraries/java/pom.xml

# 2. Build and run this sample
cd samples/java-springboot
mvn spring-boot:run
```

Server listens on `http://localhost:8080`.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `LEX_SENDER_ID` | `SAMPLE-JAVA-001` | Your LEX sender identifier |
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
curl -X POST http://localhost:8080/leads/aviation \
     -H "Content-Type: application/json" \
     -d '{"firstName":"Marcus","lastName":"Reid","email":"m.reid@skybridge.com"}'
```

## How it works

1. `application.properties` binds `LEX_*` env vars via `@ConfigurationProperties`  
2. The scenario JSON from `examples/<industry>/json/` supplies real-world product and customer data  
3. `Lex.newLead()` fluent builder constructs a valid LEX envelope  
4. `Lex.validate()` runs three-layer validation (schema → business rules → security)  
5. `RestTemplate` POSTs the envelope to the LEX API if validation passes  
6. The API response is returned to the caller  
