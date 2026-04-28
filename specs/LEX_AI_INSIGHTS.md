<!-- SPDX-License-Identifier: Apache-2.0 -->
<!-- Copyright (c) 2026 LEX Lead Exchange Standard Contributors -->
<!-- Canonical specification: https://lexstandard.org -->

# LEX - AI Insights Block

**Version:** 1.0.0  
**Created:** 2026-04-12  
**Related Specs:** LEX_SPECIFICATION.md, LEX_LEAD_INTELLIGENCE.md, LEX_DATA_GOVERNANCE.md

## Overview

The `aiInsights` block carries **Generative AI and NLP-produced artefacts** attached to a lead. This is distinct from the `leadIntelligence` block, which carries deterministic ML scores.

| Block | Produced By | Nature |
|---|---|---|
| `leadIntelligence` | Predictive ML models | Numeric scores, probability estimates, behavioral signals |
| `aiInsights` | LLMs, GenAI engines, NLP pipelines | Text summaries, sentiment, intent classification, recommended actions |

**Key principle:** `aiInsights` output is advisory and MUST be treated as a supplement to, not a replacement for, human judgment. It is not used for autonomous customer-facing decisions unless explicitly enabled and disclosed under `dataGovernance.aiGovernance`.

---

## 1. Full Example

```json
"aiInsights": {
  "conversationInsights": {
    "summary": "Customer expressed strong interest in a hybrid SUV for a growing family. Price sensitivity noted — mentioned current vehicle cost concerns. Asked specifically about AWD availability for winter driving.",
    "sentiment": "POSITIVE",
    "sentimentScore": 0.78,
    "detectedLanguage": "en",
    "intentClassifications": [
      { "intent": "PURCHASE_INTENT", "confidence": 0.89 },
      { "intent": "FINANCING_INQUIRY", "confidence": 0.61 },
      { "intent": "TRADE_IN_INTEREST", "confidence": 0.44 }
    ],
    "keyTopics": ["AWD", "hybrid", "family_vehicle", "winter_driving", "financing"],
    "objections": ["price_concern", "monthly_payment_uncertainty"],
    "openQuestions": ["AWD availability on XSE trim?", "Current promotional APR rates?"],
    "analyzedAt": "2026-04-12T09:15:00Z",
    "sourceTranscriptId": "CHAT-20260412-00987"
  },
  "nextBestActions": [
    {
      "actionCode": "SEND_AWD_COMPARISON",
      "description": "Send AWD trim comparison sheet for RAV4 and CX-50",
      "urgency": "WITHIN_2H",
      "channel": "EMAIL",
      "confidence": 0.84,
      "rationale": "Customer explicitly asked about AWD; proactive info increases conversion by 23% in similar profiles"
    },
    {
      "actionCode": "OFFER_FINANCING_PRE_CHECK",
      "description": "Invite customer to soft credit pre-qualification",
      "urgency": "WITHIN_24H",
      "channel": "SMS",
      "confidence": 0.71,
      "rationale": "Financing objection detected; early pre-qual reduces friction at deal close"
    }
  ],
  "competitorMentions": [
    { "competitor": "Honda CR-V", "context": "Customer mentioned comparing to CR-V Hybrid", "sentiment": "NEUTRAL" },
    { "competitor": "Mazda CX-50", "context": "Mentioned AWD performance", "sentiment": "POSITIVE" }
  ],
  "generatedBy": {
    "engine": "GPT-4O",
    "provider": "OPENAI",
    "orchestrator": "DMS_AI_LAYER",
    "modelVersion": "2024-11",
    "generatedAt": "2026-04-12T09:15:44Z",
    "promptVersion": "CONV_INSIGHTS_V2.1"
  }
}
```

---

## 2. Field Reference

### 2.1 Conversation Insights (`conversationInsights`)

Produced from conversation transcripts (chat, call transcription, email threads).

| Field | Type | Description |
|---|---|---|
| `summary` | String | LLM-generated narrative summary of the customer interaction |
| `sentiment` | Enum | `POSITIVE`, `NEUTRAL`, `NEGATIVE`, `MIXED` |
| `sentimentScore` | Decimal (0–1) | Confidence-weighted sentiment (0 = negative, 1 = positive) |
| `detectedLanguage` | BCP-47 | Detected language of the source conversation, e.g. `en`, `fr-CA` |
| `intentClassifications[]` | Array | Detected intents with confidence scores |
| `intentClassifications[].intent` | String | `PURCHASE_INTENT`, `FINANCING_INQUIRY`, `TRADE_IN_INTEREST`, `TEST_DRIVE_REQUEST`, `SERVICE_INQUIRY`, `COMPLAINT`, `RESEARCH_ONLY` |
| `intentClassifications[].confidence` | Decimal (0–1) | Model confidence in this intent |
| `keyTopics[]` | Array[String] | Key product, feature, or concern tags extracted from the conversation |
| `objections[]` | Array[String] | Identified purchase objection codes, e.g. `price_concern`, `delivery_time` |
| `openQuestions[]` | Array[String] | Customer questions that remain unanswered — enables seller prep |
| `analyzedAt` | ISO 8601 | Timestamp of AI analysis |
| `sourceTranscriptId` | String | Identifier of the source conversation transcript |

### 2.2 Next Best Actions (`nextBestActions[]`)

AI-recommended seller follow-up actions in priority order (index 0 = highest priority).

| Field | Type | Description |
|---|---|---|
| `actionCode` | String | Machine-readable action code |
| `description` | String | Human-readable description for display in CRM |
| `urgency` | Enum | `IMMEDIATE`, `WITHIN_2H`, `WITHIN_24H`, `THIS_WEEK`, `LOW_PRIORITY` |
| `channel` | Enum | `EMAIL`, `PHONE`, `SMS`, `IN_PERSON`, `CHAT`, `VIDEO_CALL` |
| `confidence` | Decimal (0–1) | Model confidence that this action will improve conversion |
| `rationale` | String | Explanation of why this action was recommended |

### 2.3 Competitor Mentions (`competitorMentions[]`)

Competitor references detected in the conversation.

| Field | Type | Description |
|---|---|---|
| `competitor` | String | Competitor product or brand name as detected |
| `context` | String | Excerpt or paraphrase of how the competitor was mentioned |
| `sentiment` | Enum | `POSITIVE`, `NEUTRAL`, `NEGATIVE` — customer's apparent sentiment toward the competitor |

### 2.4 Generation Metadata (`generatedBy`)

| Field | Type | Description |
|---|---|---|
| `engine` | String | AI model identifier, e.g. `GPT-4O`, `CLAUDE-3-OPUS`, `LLAMA-3-70B` |
| `provider` | Enum | `OPENAI`, `ANTHROPIC`, `GOOGLE`, `META`, `MICROSOFT`, `DMS_PROPRIETARY`, `OEM_INTERNAL`, `OTHER` |
| `orchestrator` | String | System that orchestrated the GenAI call (DMS, CRM platform, OEM layer) |
| `modelVersion` | String | Model version or deployment tag |
| `generatedAt` | ISO 8601 | When content was generated |
| `promptVersion` | String | Version of the prompt template used — enables auditing and A/B testing |

---

## 3. Validation Rules

| Rule ID | Condition | Level |
|---|---|---|
| AI-001 | `conversationInsights.sentimentScore` out of 0.0–1.0 | ERROR |
| AI-002 | Any `intentClassifications[].confidence` out of 0.0–1.0 | ERROR |
| AI-003 | Any `nextBestActions[].confidence` out of 0.0–1.0 | ERROR |
| AI-004 | `generatedBy.generatedAt` is in the future | ERROR |
| AI-005 | `aiInsights` present but `generatedBy` absent | ERROR |
| AI-006 | `summary` present but `analyzedAt` absent | WARNING |
| AI-007 | `nextBestActions` has more than 5 items | WARNING (reduce to top 5) |
| AI-008 | `competitorMentions[].competitor` is empty string | ERROR |

---

## 4. Usage Notes

- **Immutability in transit**: Downstream systems MUST NOT modify `aiInsights` fields. If re-analysis is performed, a new timestamped object MUST replace the prior one in full.
- **Consent requirement**: Population of `conversationInsights.summary` from a customer transcript REQUIRES consent flags to be set. See `dataGovernance.analyticsAllowed = true` and `aiGovernance.humanReviewRequired`.
- **No PII in summary**: LLM-produced summaries MUST NOT contain full PII (full name, email, phone number, SSN, etc.). Implementers MUST apply PII redaction before populating `summary`.
- **Prompt versioning**: The `generatedBy.promptVersion` field enables rollback tracing when AI output quality degrades between prompt template versions.
- **nextBestActions ordering**: MUST be sorted by `confidence` descending. Only include actions with `confidence >= 0.5`.
