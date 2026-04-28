# LEX Sample — C# / ASP.NET Core + Steeltoe

Demonstrates multi-industry lead exchange using the LEX C# library with ASP.NET Core Minimal APIs and Steeltoe management endpoints.

## Prerequisites

- .NET 8 SDK

## Setup

```bash
cd samples/dotnet-steeltoe
dotnet restore
dotnet run
```

Server listens on `http://localhost:5000`.  
Steeltoe actuators available at `/actuator/health`, `/actuator/info`.

## Environment Variables / appsettings.json

| Key | Default | Description |
|---|---|---|
| `Lex__SenderId` | `SAMPLE-DOTNET-001` | Your LEX sender identifier |
| `Lex__ReceiverId` | `LEX-PLATFORM` | Target LEX receiver |
| `Lex__ApiBase` | `https://sandbox.lexstandard.org/v1` | LEX API base URL |
| `Lex__ApiKey` | _(empty)_ | Bearer token for authenticated endpoints |

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/industries` | List supported industries |
| GET | `/examples/{industry}` | Raw e2e scenario JSON |
| POST | `/leads/{industry}` | Build + validate + submit a lead |
| POST | `/validate` | Validate any raw LEX message |
| GET | `/actuator/health` | Steeltoe health endpoint |

### Industries

`automotive` · `aviation` · `maritime` · `heavy-equipment` · `real-estate` · `technology`

### Submit lead (example)

```bash
curl -X POST http://localhost:5000/leads/maritime \
     -H "Content-Type: application/json" \
     -d '{"firstName":"Carlos","lastName":"Reyes","email":"c.reyes@globeship.com"}'
```

## How it works

1. `LexOptions` is bound from `appsettings.json` or environment variables  
2. The scenario JSON from `examples/<industry>/json/` supplies real product and customer data  
3. `LexLeadBuilder` constructs a valid LEX envelope  
4. `LexClient.Validate()` runs three-layer validation  
5. `IHttpClientFactory` POSTs the envelope to the LEX API if validation passes  
6. Steeltoe management endpoints provide health and info without additional configuration  
