# LEX — End-to-End Integrity Simulation

Simulates the full sender → channel → receiver pipeline for every industry and format combination in `examples/`, producing a data-loss and field-coverage report.

## What it does

| Step | Actor | Action |
|------|-------|--------|
| 1 | **Sender** | Reads example file (raw bytes, no transformation) |
| 2 | **Sender** | Computes SHA-256 hash of the content |
| 3 | **Sender** | Wraps in a `TransferEnvelope` (hash + metadata + raw content) |
| 4 | **Channel** | Delivers envelope synchronously to the receiver (in-process) |
| 5 | **Receiver** | Re-computes SHA-256 of the received `rawContent` |
| 6 | **Receiver** | Compares hashes → **integrity verdict** |
| 7 | **Receiver** | Extracts structured fields (format-aware) → **coverage verdict** |
| 8 | **Receiver** | Validates JSON messages via `@lexstandard/lex` → **schema verdict** |
| 9 | **Receiver** | Returns a full LEX `ACKNOWLEDGMENT` message |
| 10 | **Report** | Renders consolidated table + summary to the console |

## Coverage matrix

24 scenarios are run by default (6 industries × 4 formats):

| Industry | JSON (e2e) | XML | X12 EDI | EDIFACT |
|---|:---:|:---:|:---:|:---:|
| Automotive | ✔ | ✔ | ✔ | ✔ |
| Aviation | ✔ | ✔ | ✔ | ✔ |
| Maritime | ✔ | ✔ | ✔ | ✔ |
| Heavy Equipment | ✔ | ✔ | ✔ | ✔ |
| Real Estate | ✔ | ✔ | ✔ | ✔ |
| Technology | ✔ | ✔ | ✔ | ✔ |

## Fields verified per scenario

`messageId`, `messageType`, `leadId`, `senderId`, `receiverId`, `leadStatus`, `leadType`, `assetClass`, `customerName`, `customerEmail`

Fields not extractable in a given format are reported as **coverage gaps** — not as data-loss bugs — because EDI formats encode the same data differently.

## Prerequisites

- Node.js ≥ 18
- `npm install` (installs `@lexstandard/lex` from `../../libraries/js`)

## Run

```bash
# All 24 scenarios (default)
npm start

# Filter by industry
node src/index.js --industry automotive
node src/index.js --industry maritime

# Filter by format
node src/index.js --format json
node src/index.js --format x12

# Combine filters
node src/index.js --industry aviation --format edifact

# Write ACK JSON files to ./acks/
node src/index.js --save-acks
```

## Output

```
  ✔ automotive      json
  ✔ automotive      xml
  ✔ automotive      x12
  ...

═══════════════════════════════════
  LEX END-TO-END INTEGRITY SIMULATION — RESULTS REPORT
═══════════════════════════════════

  SCENARIO RESULTS
  Industry         Format    Integrity   Size    Hash (first 16…)   Field Coverage   LEX Valid   Missing Fields
  ─────────────────────────────────────────────────────────────────────────────────
  automotive       json      ✔ PASS      8.4KB   a3f9c1d2e5b7f8a0…  ██████████ 100%  yes         none
  automotive       xml       ✔ PASS      4.2KB   c7d8e9f0a1b2c3d4…  ████████░░  80%  n/a (…)     leadType, assetClass
  ...

  SUMMARY
  Total scenarios   : 24
  Integrity PASS    : 24 / 24
  Integrity FAIL    : 0 / 24
  LEX schema valid  : 6 / 6
  Avg field coverage: ████████░░  82%
```

## Architecture

```
src/
├── index.js      Entry point — CLI args, orchestration, run loop
├── sender.js     Sender class — file loading, SHA-256, TransferEnvelope
├── receiver.js   Receiver class — hash verify, field extract, ACK builder
├── formats.js    Format-specific field extractors (JSON / XML / X12 / EDIFACT)
└── report.js     Console report renderer
```

## Extending the simulation

### Simulate data loss or corruption

Introduce channel mutations in `src/index.js` inside the `channel()` function:

```js
function channel(envelope) {
  // Simulate 10-byte truncation
  const corrupted = { ...envelope, rawContent: envelope.rawContent.slice(0, -10) };
  return receiver.receive(corrupted);
}
```

The receiver will detect the hash mismatch and emit `REJECTED` ACKs.

### Add more fields to verify

Edit the `ALL_FIELDS` array in `src/formats.js` and add extraction logic in each format handler.

### Persist ACKs

Run with `--save-acks` to write each ACK as a JSON file in `./acks/` for offline inspection or import into another system.
