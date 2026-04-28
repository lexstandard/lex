<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright (c) 2026 LEX Lead Exchange Standard Contributors -->
<!-- Canonical specification: https://lexstandard.org -->

# LEX - Lead Intelligence Block

**Version:** 1.1.0  
**Updated:** 2026-04-12  
**Related Specs:** LEX_SPECIFICATION.md, LEX_DATA_GOVERNANCE.md, LEX_AI_INSIGHTS.md

## Overview

Modern CRM and DMS platforms augment raw lead data with ML-generated signals that improve lead response prioritization, routing, and conversion rate. The `leadIntelligence` block is an **optional, system-generated** extension — it is produced by platforms, DMS providers, or OEM analytics engines and travels alongside the lead payload.

**Key principle:** `leadIntelligence` is advisory, not prescriptive. It provides probabilistic signals from predictive ML models. Business decisions (routing, priority escalation, follow-up urgency) remain at the operator level.

**Separation of concerns:** `leadIntelligence` covers **predictive ML scoring** only. Generative AI summaries, NLP sentiment, and LLM-produced next-best-actions are carried in the separate `aiInsights` block (see `LEX_AI_INSIGHTS.md`). The two blocks may coexist on the same lead.

**Cross-industry applicability:** All fields in this block are industry-agnostic. Industry-specific AI signals (e.g., fleet fit score for aviation, job-site fit for heavy equipment) belong in the respective `lex.core.*` extension namespace.

---

## 1. Lead Intelligence Block — Full Example

```json
"leadIntelligence": {
  "intentScore": 0.87,
  "buyingWindowDays": 21,
  "confidenceLevel": "HIGH",
  "churnRisk": "LOW",
  "leadQualityTier": "PLATINUM",
  "scoreGrade": "A",
  "scoreTrend": "IMPROVING",
  "scoringReasons": [
    { "factor": "RETURN_VISIT", "direction": "POSITIVE", "weight": 0.28, "description": "Customer revisited the product page 3 times in 48h" },
    { "factor": "PAYMENT_CALCULATOR_USED", "direction": "POSITIVE", "weight": 0.21, "description": "Financing intent signal detected" },
    { "factor": "LOW_SESSION_DEPTH", "direction": "NEGATIVE", "weight": 0.08, "description": "Session depth below median for tier" }
  ],
  "behavioralSignals": [
    "VDP_VIEW_3X",
    "PAYMENT_CALCULATOR_USED",
    "TRADE_IN_VALUATION_REQUESTED",
    "INVENTORY_FILTER_APPLIED",
    "SAVED_TO_FAVORITES"
  ],
  "predictedProducts": [
    { "productType": "VEHICLE_NEW", "manufacturer": "Toyota", "model": "RAV4 Hybrid", "trim": "XSE", "confidenceScore": 0.76 },
    { "productType": "VEHICLE_NEW", "manufacturer": "Toyota", "model": "Venza", "trim": "XLE", "confidenceScore": 0.41 }
  ],
  "priceRangeFit": "EXACT",
  "financingLikelihood": 0.64,
  "tradeInLikelihood": 0.42,
  "evInterestScore": 0.31,
  "channelAffinity": [
    { "channel": "SMS", "affinityScore": 0.81 },
    { "channel": "EMAIL", "affinityScore": 0.65 },
    { "channel": "PHONE", "affinityScore": 0.32 }
  ],
  "recommendedResponseSla": "PT2H",
  "optimalContactTimes": [
    { "dayOfWeek": "SATURDAY", "hourUtc": 17, "preferredChannel": "SMS" },
    { "dayOfWeek": "SUNDAY", "hourUtc": 16, "preferredChannel": "EMAIL" }
  ],
  "enrichmentSources": [
    { "type": "FIRST_PARTY_BEHAVIORAL", "provider": "OEM_WEB_ANALYTICS", "refreshedAt": "2026-04-12T08:00:00Z", "signalCount": 14 },
    { "type": "THIRD_PARTY_INTENT", "provider": "BOMBORA", "refreshedAt": "2026-04-11T00:00:00Z", "signalCount": 3 }
  ],
  "modelMetadata": {
    "source": "PLATFORM_ML_ENGINE",
    "modelId": "INTENT_SCORE_V3.1",
    "modelVersion": "3.1.4",
    "scoredAt": "2026-04-12T09:01:00Z",
    "dataFreshnessDays": 0,
    "trainingDataCutoff": "2026-03-01"
  }
}
```

---

## 2. Field Reference

### 2.1 Intent & Confidence

| Field | Type | Range | Description |
|---|---|---|---|
| `intentScore` | Decimal | 0.0–1.0 | Purchase intent probability. 1.0 = near-certain buyer |
| `buyingWindowDays` | Integer | 1–365 | Predicted days until purchase decision |
| `confidenceLevel` | Enum | — | `LOW`, `MEDIUM`, `HIGH`, `VERY_HIGH` — overall model confidence in scored signals. Required whenever `intentScore` is present |
| `churnRisk` | Enum | — | `LOW`, `MEDIUM`, `HIGH` — probability of lead going cold without engagement |

### 2.2 Quality Classification

| Field | Type | Description |
|---|---|---|
| `leadQualityTier` | Enum | `PLATINUM`, `GOLD`, `SILVER`, `BRONZE`, `COLD` — tier derived from `intentScore` range (see §2.2.1) |
| `scoreGrade` | Enum | `A`, `B`, `C`, `D` — letter-grade bucketing for non-technical operators. A = highest likelihood, D = least likely |
| `scoreTrend` | Enum | `IMPROVING`, `DECLINING`, `STEADY`, `INSUFFICIENT_DATA` — direction compared to prior score. Enables sellers to identify momentum |

#### 2.2.1 Quality Tier Ranges

| Tier | Intent Score Range | Grade | Description |
|---|---|---|---|
| `PLATINUM` | 0.85–1.00 | A | Highly motivated, near-term buyer |
| `GOLD` | 0.65–0.84 | A/B | Strong intent, short-term funnel |
| `SILVER` | 0.40–0.64 | B/C | Moderate intent, mid-funnel |
| `BRONZE` | 0.20–0.39 | C | Early research phase |
| `COLD` | 0.00–0.19 | D | Low engagement, long-horizon or casual browsing |

### 2.3 Scoring Reasons

`scoringReasons[]` provides the top positive and negative factors driving the score — enabling sellers to understand why a lead scored high or low and take targeted action.

| Field | Type | Description |
|---|---|---|
| `factor` | String | Machine-readable factor identifier (e.g., `RETURN_VISIT`, `CREDIT_PRE_CHECK`) |
| `direction` | Enum | `POSITIVE` (improved score) or `NEGATIVE` (reduced score) |
| `weight` | Decimal (0–1) | Relative contribution of this factor to the overall score |
| `description` | String | Human-readable explanation for display in CRM/DMS widgets |

Platform implementers SHOULD include the top 3–5 reasons sorted by `weight` descending.

### 2.4 Behavioral Signals

Standardized signal codes representing observed customer actions:

| Code | Description |
|---|---|
| `VDP_VIEW_1X` through `VDP_VIEW_5X_PLUS` | Product Detail Page viewed 1–5+ times |
| `PAYMENT_CALCULATOR_USED` | Customer used payment/financing calculator |
| `TRADE_IN_VALUATION_REQUESTED` | Customer submitted trade-in estimate request |
| `INVENTORY_FILTER_APPLIED` | Customer filtered inventory (trim, color, features) |
| `SAVED_TO_FAVORITES` | Product saved/wishlisted |
| `COMPARE_PRODUCTS` | Used product comparison tool |
| `BOOKING_INITIATED` | Started but did not complete reservation flow |
| `CREDIT_PRE_CHECK` | Initiated soft credit inquiry |
| `DEALER_MAP_VIEWED` | Viewed dealer/seller location or hours |
| `CALL_TO_ACTION_CLICKED` | Clicked "Get Quote", "Check Availability", etc. |
| `BROCHURE_DOWNLOADED` | Downloaded product PDF or spec sheet |
| `LIVE_CHAT_ENGAGED` | Engaged with dealer/OEM chat widget |
| `SESSION_DEPTH_HIGH` | 10+ pages visited in session |
| `RETURN_VISIT` | Second or subsequent visit to same product page |
| `VIDEO_VIEWED` | Product video or walkthrough viewed |
| `FINANCING_PAGE_VISITED` | Visited financing or credit application page |
| `APPOINTMENT_REQUESTED` | Booked or requested a test drive / site visit / demo |
| `SPEC_SHEET_DOWNLOADED` | Downloaded technical specification document |

### 2.5 Product Prediction

`predictedProducts[]` is an array (ranked by `confidenceScore` descending) of products the ML model predicts the customer is most likely to purchase.

| Field | Type | Description |
|---|---|---|
| `productType` | String | LEX product type string (must match `ProductSeedData.hx` registry) |
| `manufacturer` | String | Predicted manufacturer/brand |
| `model` | String | Predicted model name |
| `trim` | String | Predicted trim/variant |
| `confidenceScore` | Decimal (0–1) | Model confidence in this prediction |

### 2.6 Fit Scores

| Field | Type | Description |
|---|---|---|
| `priceRangeFit` | Enum | `BELOW_RANGE`, `LOWER_RANGE`, `EXACT`, `UPPER_RANGE`, `ABOVE_RANGE` — how well the listed product price fits customer budget signals |
| `financingLikelihood` | Decimal (0–1) | Probability customer will require financing |
| `tradeInLikelihood` | Decimal (0–1) | Probability customer has a trade-in or part-exchange asset |
| `evInterestScore` | Decimal (0–1) | EV/clean-energy interest signal strength (0 = no interest, 1 = strong EV preference) |

### 2.7 Channel Affinity

`channelAffinity[]` ranks contact channels by predicted response rate. Enables automated routing systems to choose the optimal first-touch channel.

| Field | Type | Description |
|---|---|---|
| `channel` | Enum | `EMAIL`, `PHONE`, `SMS`, `IN_PERSON`, `CHAT`, `VIDEO_CALL` |
| `affinityScore` | Decimal (0–1) | Predicted response probability for this channel (1.0 = highest) |

### 2.8 Response SLA

| Field | Type | Description |
|---|---|---|
| `recommendedResponseSla` | ISO 8601 Duration | Suggested response time. `PT2H` = 2 hours, `PT30M` = 30 minutes |
| `optimalContactTimes[].dayOfWeek` | Enum | `MONDAY`–`SUNDAY` |
| `optimalContactTimes[].hourUtc` | Integer (0–23) | Hour in UTC when contact is most likely to succeed |
| `optimalContactTimes[].preferredChannel` | Enum | Best channel for this time slot |

### 2.9 Enrichment Sources

`enrichmentSources[]` provides provenance — which data sources and providers contributed signals to the scoring model.

| Field | Type | Description |
|---|---|---|
| `type` | Enum | `FIRST_PARTY_BEHAVIORAL`, `THIRD_PARTY_INTENT`, `CRM_HISTORICAL`, `SOCIAL_SIGNAL`, `FIRMOGRAPHIC`, `TELEMATICS` |
| `provider` | String | Provider name or system identifier |
| `refreshedAt` | ISO 8601 | When these signals were last updated |
| `signalCount` | Integer | Number of signals consumed from this source |

### 2.10 Model Metadata

| Field | Type | Description |
|---|---|---|
| `source` | Enum | `PLATFORM_ML_ENGINE`, `DMS_SCORING`, `OEM_CRM`, `THIRD_PARTY_ENRICHMENT`, `GENERATIVE_AI`, `ENSEMBLE_MODEL`, `FEDERATED_MODEL` |
| `modelId` | String | Machine-readable model identifier |
| `modelVersion` | String | Semver of scoring model |
| `scoredAt` | ISO 8601 datetime | When scores were calculated |
| `dataFreshnessDays` | Integer (≥0) | How many days old the underlying behavioral data is |
| `trainingDataCutoff` | ISO 8601 date | Date through which training data was included |

---

## 3. Validation Rules

| Rule ID | Condition | Level |
|---|---|---|
| LI-001 | `intentScore` out of 0.0–1.0 range | ERROR |
| LI-002 | `modelMetadata.scoredAt` is in the future | ERROR |
| LI-003 | `modelMetadata.dataFreshnessDays` < 0 | ERROR |
| LI-004 | `buyingWindowDays` ≤ 0 | ERROR |
| LI-005 | Any `predictedProducts[].confidenceScore` out of 0.0–1.0 | ERROR |
| LI-006 | Any `channelAffinity[].affinityScore` out of 0.0–1.0 | ERROR |
| LI-007 | Any `scoringReasons[].weight` out of 0.0–1.0 | ERROR |
| LI-008 | `scoringReasons[].direction` is not `POSITIVE` or `NEGATIVE` | ERROR |
| LI-009 | `confidenceLevel` absent when `intentScore` is present | WARNING |
| LI-010 | `dataFreshnessDays > 7` | WARNING (code: `INTELLIGENCE_SCORES_STALE`) |
| LI-011 | Behavioral signal code not in registered set | WARNING |
| LI-012 | `scoreTrend` present but `intentScore` absent | WARNING |
| LI-013 | `enrichmentSources[].signalCount` < 0 | ERROR |

---

## 4. Usage Examples

### 4.1 Routing by Intent Score and Churn Risk

```python
def route_lead(lead: dict) -> str:
    intel = lead.get("leadIntelligence", {})
    intent = intel.get("intentScore", 0.0)
    churn = intel.get("churnRisk", "MEDIUM")
    trend = intel.get("scoreTrend", "STEADY")

    if intent >= 0.85 and churn == "LOW":
        return "PRIORITY_QUEUE"    # PLATINUM — immediate response
    elif intent >= 0.65 or trend == "IMPROVING":
        return "STANDARD_QUEUE"   # GOLD — 2–4h response
    else:
        return "NURTURE_QUEUE"    # SILVER/BRONZE — email nurture
```

### 4.2 Choosing Contact Channel

```javascript
function getBestChannel(leadIntelligence) {
  const affinities = leadIntelligence.channelAffinity || [];
  return affinities.sort((a, b) => b.affinityScore - a.affinityScore)[0]?.channel ?? "EMAIL";
}
```

### 4.3 Displaying Score Reasons in CRM Widget

```javascript
function getTopReasons(leadIntelligence, maxCount = 5) {
  return (leadIntelligence.scoringReasons || [])
    .sort((a, b) => b.weight - a.weight)
    .slice(0, maxCount);
}
```

---

## 5. Notes for Platform Implementers

- `leadIntelligence` is **read-only** for downstream consumers (dealers, DMS). Only the originating scoring engine should populate it.
- If a downstream system updates the lead (e.g., DMS status change), it MUST NOT modify `leadIntelligence` unless it also updates `modelMetadata.scoredAt`.
- Platforms lacking ML scoring SHOULD omit the block entirely rather than sending placeholder zeros.
- `intentScore = 0.0` is a valid score (low intent confirmed by data) — not the same as missing data.
- `predictedProducts[]` MUST be sorted by `confidenceScore` descending. Consumers SHOULD use the first element as the primary prediction.
- `scoringReasons[]` SHOULD be limited to the top 5 factors. Including more degrades readability without adding actionability.
- For GenAI-produced summaries or NLP sentiment signals, use the `aiInsights` block — not `leadIntelligence`.
