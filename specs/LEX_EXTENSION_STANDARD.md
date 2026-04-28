<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright (c) 2026 LEX Lead Exchange Standard Contributors -->
<!-- Canonical specification: https://lexstandard.org -->

# LEX Extension Standard

**Status:** Draft v1.0  
**Created:** March 28, 2026  
**Applies To:** All LEX message types  
**Related Specs:** LEX_SPECIFICATION.md, LEX_FIELD_DICTIONARY.md, LEX_CONFORMANCE.md

---

## 1. Purpose

LEX defines a minimal, interoperable core for lead exchange across industries. Inevitably, organizations need to attach data that is proprietary, industry-specific, or not yet standardized. This spec defines the canonical mechanism for doing so without polluting the core, without requiring central approval, and without creating a gatekeeping layer.

The `extensions[]` array replaces the legacy `metadata.customFields` (flat string key-value) with a typed, namespaced, versioned, self-describing envelope. Any valid JSON value — objects, arrays, numbers, booleans — can travel in an extension. Nothing is lost at system boundaries.

---

## 2. Anti-Capture Governance

> **This section is normative.** Any implementation of the extension mechanism that violates these principles is non-conformant.

**NS-RULE-1 — Self-Asserted Namespaces.** Namespace ownership is claimed by the organization producing the extension. No approval from the LEX working group, the extension registry maintainer, or any other body is required to use a namespace. The registry is advisory only.

**NS-RULE-2 — No Approval Gate.** An extension whose namespace does not appear in `LEX_EXTENSION_REGISTRY.json` is fully valid. The registry is a discoverability tool, not a required approval gate. A validator MUST NOT reject or warn on an unregistered namespace.

**NS-RULE-3 — Protected Prefix.** The `lex.core.*` namespace prefix is reserved for extensions to the LEX standard itself. No other organization may use this prefix. Validators MUST issue an error if a non-LEX organization uses `lex.core.*` as a namespace.

**NS-RULE-4 — Passthrough Obligation.** Any LEX-conformant system that receives a message containing one or more extension entries it does not recognize MUST forward those entries to the next system in the routing chain intact and unmodified. A system that drops, silently discards, truncates, or rewrites an extension entry it does not understand is non-conformant at L2. This is the single most important rule in this spec.

**NS-RULE-5 — Non-Failure on Unknown Extension.** A conformant system MUST NOT fail, reject, or produce an error purely because a message contains an extension namespace it does not support. An extension a system cannot process is ignored; it does not invalidate the message.

**NS-RULE-6 — No Runtime Registry Call Required.** Validating or processing a LEX message MUST NOT require a network call to an extension registry server. Schemas referenced via `schemaUri` are optional to resolve. If a system cannot reach a `schemaUri`, behavior is undefined for that extension's contents — the extension itself is still valid.

---

## 3. The `extensions[]` Block

### 3.1 Schema

Each entry in `extensions[]` has the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `namespace` | string | Yes | Dot-separated namespace identifier. Format: `{org}.{division}.{purpose}`. See §4. |
| `version` | string | Yes | Semantic version of the extension schema (`MAJOR.MINOR.PATCH`). |
| `producer` | string | Yes | LEX organization ID of the system that produced this extension entry. |
| `producedAt` | string (ISO 8601) | Yes | Timestamp when this entry was produced. |
| `schemaUri` | string (URI) | No | Optional URI of the JSON Schema for the `data` object. Advisory: schema validation against this URI is optional. |
| `data` | any valid JSON | Yes | The payload of the extension. May be an object, array, number, string, or boolean. No type restriction. |

### 3.2 Placement

`extensions[]` MUST appear at the top-level `lex` envelope, alongside `header` and `payload`:

```json
{
  "lex": {
    "header": { ... },
    "payload": { ... },
    "extensions": [
      {
        "namespace": "toyota.na.captive",
        "version": "1.2.0",
        "producer": "ORG-TOYOTA-MFGR-NA-001",
        "producedAt": "2026-03-28T10:00:00Z",
        "schemaUri": "https://registry.lexstandard.org/ext/toyota.na.captive/1.2.0/schema.json",
        "data": {
          "programCode": "SPRING-2026-APR-SPECIAL",
          "programType": "APR_SUBVENTION",
          "aprRate": 1.9,
          "termMonths": 60,
          "eligibleRegions": ["CA", "WA", "OR"],
          "expiresAt": "2026-04-30"
        }
      }
    ]
  }
}
```

`extensions[]` is **optional** and **order-preserving**. An empty array and the field's absence are equivalent. Multiple extensions from different namespaces MAY coexist in the same array.

### 3.3 Multiple Extensions in One Message

A single message may carry extensions from multiple organizations. Receiver systems process the extensions they understand and pass the rest forward:

```json
"extensions": [
  {
    "namespace": "toyota.na.captive",
    "version": "1.2.0",
    "producer": "ORG-TOYOTA-MFGR-NA-001",
    "producedAt": "2026-03-28T10:00:00Z",
    "data": {
      "programCode": "SPRING-2026-APR-SPECIAL",
      "aprRate": 1.9,
      "termMonths": 60
    }
  },
  {
    "namespace": "cdk.global.dms.workflow",
    "version": "2.0.0",
    "producer": "DMS-CDK-DEALER-CHICAGO-001",
    "producedAt": "2026-03-28T10:01:00Z",
    "data": {
      "workflowId": "MOTO-SALES-WORKFLOW-V3",
      "assignedQueue": "HIGH_INTENT",
      "followUpSlaHours": 2,
      "salesRepId": "SR-456"
    }
  },
  {
    "namespace": "dealer.abc.crm",
    "version": "1.0.0",
    "producer": "DEALER-ABC-MAIN-001",
    "producedAt": "2026-03-28T10:02:00Z",
    "data": {
      "crmLeadScore": 87,
      "assignedSalesPersonId": "SP-789",
      "previousPurchaseCount": 2,
      "vipCustomer": true
    }
  }
]
```

---

## 4. Namespace Convention

### 4.1 Format

```
{org-prefix}.{division}.{purpose}
```

All segments are lowercase, ASCII alphanumeric, with hyphens allowed within segments. Dot (`.`) is the segment separator.

**Examples:**
```
toyota.na.captive               Toyota North America captive finance programs
ford.credit.incentives          Ford Credit incentive programs
cdk.global.dms.workflow         CDK Global DMS workflow metadata
dealer.abc123.crm               Dealer "ABC123"'s CRM-specific annotations
autotrader.platform.ml          AutoTrader platform ML signals
lex.core.ev                     LEX standard EV extensions (protected prefix)
lex.core.deduplication          LEX standard deduplication extensions (protected)
aviation.airbus.mro             Airbus MRO contract data
realestate.mlsgroup.listing     MLS group listing metadata
```

### 4.2 Rules

1. `lex.core.*` is **reserved**. Only the LEX working group may publish extensions under this prefix. A validator MUST issue ERROR if any organization other than the LEX working group uses `lex.core.*`.
2. All other prefixes are **first-come, first-claimed** by convention. Disputes between organizations over the same prefix are legal matters between those organizations; LEX does not arbitrate.
3. The first segment SHOULD correspond to the producing organization's registered domain name, LEX org prefix, or a universally recognized abbreviation. This is convention, not a hard validation rule.
4. `version` MUST be a valid semantic version (`MAJOR.MINOR.PATCH`). Pre-release suffixes are allowed (e.g., `1.0.0-beta`).
5. `producer` MUST be a valid LEX organization ID (format: per `LEX_ORGANIZATION_REGISTRY.json` conventions). This is auditable but is not validated against the registry at runtime (P6).

### 4.3 Versioning Within a Namespace

Extension schemas evolve under semantic versioning rules:
- **Patch** (`1.0.0` → `1.0.1`): Bug fix to schema documentation. No structural change. Backward compatible.
- **Minor** (`1.0.0` → `1.1.0`): New optional fields added. Existing receivers can still process without change. Backward compatible.
- **Major** (`1.0.0` → `2.0.0`): Breaking structural change. Receivers MUST check `version` before processing. Both versions may coexist in a transition period.

A system that understands `toyota.na.captive@1.x` but receives `@2.0.0` SHOULD apply Passthrough Obligation and not attempt to process it as a 1.x extension.

---

## 5. Migration from `metadata.customFields`

`metadata.customFields` (flat string key-value map, max 50 entries) remains valid for backward compatibility but is **deprecated** as of LEX 1.1.

Migration path:

| Legacy `metadata.customFields` | Equivalent `extensions[]` entry |
|---|---|
| `{ "programCode": "SPRING-APR" }` | `data: { "programCode": "SPRING-APR" }` — typed as string |
| `{ "aprRate": "1.9" }` | `data: { "aprRate": 1.9 }` — now a proper number, not a string |
| `{ "eligible_states": "CA,WA,OR" }` | `data: { "eligibleRegions": ["CA", "WA", "OR"] }` — now a typed array |

The critical difference: `data` in `extensions[]` is typed JSON. The legacy mechanism forces all values to strings, destroying type information at every system boundary.

**Deprecation policy:** `metadata.customFields` will be removed in LEX 2.0. New implementations MUST NOT use `customFields` for typed data. The field will continue to be valid in LEX 1.x for systems that have not migrated.

---

## 6. `schemaUri` Resolution

`schemaUri` is optional. When provided, it SHOULD point to a publicly resolvable JSON Schema document that describes the `data` object's structure.

**URI scheme options:**
- `https://` — publicly hosted schema (preferred)
- `lex://registry/extensions/{namespace}/{version}` — shorthand that resolves to the LEX extension registry's GitHub-hosted schema for that namespace/version
- `urn:` — private or vendor-internal schema identifier (opaque to third parties)

**Receiver behavior:**
- Receivers MAY resolve `schemaUri` to validate `data` contents.
- Receivers MUST NOT reject a message because `schemaUri` is absent.
- Receivers MUST NOT reject a message because `schemaUri` is unreachable.
- If `schemaUri` resolves and `data` fails that schema, it is a WARNING (not an ERROR) unless the receiver has a bilateral agreement with the producer that schema validation is required.

---

## 7. Validation Rules

The following rules apply to the `extensions[]` block:

| Rule ID | Severity | Condition | Message |
|---------|----------|-----------|---------|
| EXT-001 | ERROR | `namespace` uses `lex.core.*` prefix and `producer` is not a LEX working group org | "Reserved namespace `lex.core.*` used by non-LEX organization" |
| EXT-002 | ERROR | `namespace` missing or empty | "Extension `namespace` is required" |
| EXT-003 | ERROR | `version` missing or not valid semver | "Extension `version` must be valid semver (MAJOR.MINOR.PATCH)" |
| EXT-004 | ERROR | `producer` missing or empty | "Extension `producer` is required" |
| EXT-005 | ERROR | `producedAt` missing or not valid ISO 8601 | "Extension `producedAt` must be a valid ISO 8601 timestamp" |
| EXT-006 | ERROR | `data` field is absent | "Extension `data` is required (may be any valid JSON value)" |
| EXT-007 | WARNING | `namespace` not found in `LEX_EXTENSION_REGISTRY.json` | "Extension namespace not in community registry (advisory only — message is valid)" |
| EXT-008 | WARNING | `version` major is greater than the latest registered major for this namespace | "Extension version appears to be ahead of registered version (advisory)" |
| EXT-009 | INFO | `schemaUri` absent | "No schemaUri provided — data contents cannot be third-party validated" |

---

## 8. Cross-Industry Applicability

The extension mechanism is intentionally industry-agnostic. The same `extensions[]` structure works for every LEX industry vertical:

| Industry | Example Namespace | Example Data |
|----------|------------------|-------------|
| Automotive | `toyota.na.captive` | APR subvention programs, dealer incentives |
| Aviation | `airbus.mro.contracts` | MRO maintenance contract terms, AOG lead times |
| Real Estate | `mlsgroup.listing.co-op` | Co-op commission split, buyer agent fee structures |
| Maritime | `maerskline.charter.terms` | Time charter rates, port fee schedules |
| Heavy Equipment | `caterpillar.dealer.financing` | Equipment financing programs, fleet discount tiers |
| Technology | `salesforce.crm.scoring` | Lead scoring models, opportunity stages |

In each case: the core LEX LEAD message is identical. Industry-specific data rides in `extensions[]` with no core changes required. The core simplicity budget (P5) is preserved.

---

## 9. Extension Registry Governance

`LEX_EXTENSION_REGISTRY.json` is a community-maintained public document. Governance rules:

1. **Any organization may submit a PR** to register their namespace. The PR requires: namespace string, organization name, contact email or GitHub handle, optional schema URL.
2. **The floor for rejection** is only: namespace collision with `lex.core.*` reserved entries, or demonstrably malicious content (e.g., a namespace impersonating another organization's registered namespace). There is no editorial veto on content.
3. **The registry is NOT a gate.** An unregistered namespace is fully valid. Registration provides discoverability only.
4. **No fees.** No dues. No approval process beyond the PR review described above.
5. **The registry itself is published under CC0** (public domain). No one can restrict its use.

---

## 10. Related Specifications

- `LEX_FIELD_DICTIONARY.md` — `extensions[]` field definitions
- `LEX_CONFORMANCE.md` — L2 conformance requires Passthrough Obligation implementation
- `LEX_VALIDATION_RULES.md` — EXT-001 through EXT-009 rules
- `registry/LEX_EXTENSION_REGISTRY.json` — community namespace registry
