/**
 * LEX Sample — Node.js / Express
 *
 * Demonstrates multi-industry lead exchange using the LEX JavaScript library.
 * Each industry loads its canonical e2e scenario example, builds a LEAD message
 * via the fluent DSL, validates it, then submits it to the LEX sandbox API.
 *
 * Routes:
 *   GET  /industries            — list supported industries
 *   GET  /examples/:industry    — raw e2e scenario JSON for an industry
 *   POST /leads/:industry       — build + validate + submit a lead for an industry
 *   POST /validate              — validate any raw LEX message body
 */

import express from 'express';
import { readFile } from 'node:fs/promises';
import { LexClient }   from '@lexstandard/lex';
import { lex, AssetClass, LeadStatus } from '@lexstandard/lex/builder';

const app  = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());

// ── LEX client pointing at sandbox ────────────────────────────────────────
const client = new LexClient({
  senderId:   process.env.LEX_SENDER_ID   ?? 'SAMPLE-NODE-001',
  receiverId: process.env.LEX_RECEIVER_ID ?? 'LEX-PLATFORM',
  apiBase:    process.env.LEX_API_BASE    ?? 'https://sandbox.lexstandard.org/v1',
  apiKey:     process.env.LEX_API_KEY     ?? '',   // set via env in production
});

// ── Industry registry ─────────────────────────────────────────────────────
const INDUSTRIES = {
  automotive:      { assetClass: AssetClass.VEHICLE,         scenarioFile: 'automotive/json/automotive_e2e_scenario.json' },
  aviation:        { assetClass: AssetClass.AVIATION,        scenarioFile: 'aviation/json/aviation_e2e_scenario.json' },
  maritime:        { assetClass: AssetClass.MARITIME,        scenarioFile: 'maritime/json/maritime_e2e_scenario.json' },
  'heavy-equipment': { assetClass: AssetClass.HEAVY_EQUIPMENT, scenarioFile: 'heavy-equipment/json/heavy_equipment_e2e_scenario.json' },
  'real-estate':   { assetClass: AssetClass.GENERAL_GOODS,   scenarioFile: 'real-estate/json/real_estate_e2e_scenario.json' },
  technology:      { assetClass: AssetClass.TECHNOLOGY,      scenarioFile: 'technology/json/technology_e2e_scenario.json' },
};

const EXAMPLES_BASE = new URL('../../../../examples/', import.meta.url);

async function loadScenario(industry) {
  const { scenarioFile } = INDUSTRIES[industry];
  const raw = await readFile(new URL(scenarioFile, EXAMPLES_BASE), 'utf8');
  return JSON.parse(raw.charCodeAt(0) === 0xFEFF ? raw.slice(1) : raw);
}

// ── Route: list industries ────────────────────────────────────────────────
app.get('/industries', (_req, res) => {
  res.json({ industries: Object.keys(INDUSTRIES) });
});

// ── Route: raw example scenario ───────────────────────────────────────────
app.get('/examples/:industry', async (req, res) => {
  const { industry } = req.params;
  if (!INDUSTRIES[industry]) {
    return res.status(404).json({ error: `Unknown industry: ${industry}` });
  }
  try {
    const scenario = await loadScenario(industry);
    res.json(scenario);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Route: submit lead for industry ──────────────────────────────────────
app.post('/leads/:industry', async (req, res) => {
  const { industry } = req.params;
  const meta = INDUSTRIES[industry];
  if (!meta) {
    return res.status(404).json({ error: `Unknown industry: ${industry}` });
  }

  try {
    // Load first LEAD message from the scenario as the source of truth
    const scenario  = await loadScenario(industry);
    const firstLead = scenario.messages.find(m => m.lex?.payload?.lead);
    if (!firstLead) throw new Error('No LEAD message found in scenario');

    const sourceLead = firstLead.lex.payload.lead;
    const sourceCustomer = sourceLead.customer ?? {};

    // Build via DSL — merges scenario values with any body overrides
    const override = req.body ?? {};
    const message = lex.lead()
      .sender(client.senderId)
      .receiver(client.receiverId)
      .leadStatus(LeadStatus.EXPRESSED_INTEREST)
      .customer({
        firstName:    override.firstName    ?? sourceCustomer.firstName    ?? sourceCustomer.contacts?.[0]?.name?.split(' ')[0],
        lastName:     override.lastName     ?? sourceCustomer.lastName     ?? sourceCustomer.contacts?.[0]?.name?.split(' ')[1],
        emailAddress: override.email        ?? sourceCustomer.email        ?? sourceCustomer.contacts?.[0]?.email,
        phone:        override.phone        ?? sourceCustomer.phone,
      })
      .desiredAsset({
        assetClass:  meta.assetClass,
        productType: sourceLead.desiredProduct?.productType ?? sourceLead.desiredAsset?.productType ?? 'VEHICLE',
        year:        sourceLead.desiredProduct?.year        ?? sourceLead.desiredAsset?.year,
        make:        sourceLead.desiredProduct?.make        ?? sourceLead.desiredAsset?.make,
        model:       sourceLead.desiredProduct?.model       ?? sourceLead.desiredAsset?.model,
      })
      .build();

    // Validate locally first
    const validation = client.validate(message);
    if (!validation.valid) {
      return res.status(422).json({
        stage:  'validation',
        valid:  false,
        errors: validation.errors,
      });
    }

    // Submit to LEX API
    const response = await client.submit(message);

    res.json({
      industry,
      scenario:    scenario._metadata?.title,
      messageId:   message.lex.header.messageId,
      valid:       true,
      apiResponse: response,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Route: validate arbitrary message ────────────────────────────────────
app.post('/validate', (req, res) => {
  const result = client.validate(req.body);
  res.status(result.valid ? 200 : 422).json(result);
});

// ── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`LEX Node.js sample listening on http://localhost:${PORT}`);
  console.log('Industries:', Object.keys(INDUSTRIES).join(', '));
});
