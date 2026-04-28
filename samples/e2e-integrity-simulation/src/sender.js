/**
 * sender.js — Simulated LEX message sender.
 *
 * Responsibilities:
 *  1. Resolve example file paths for each industry × format combination.
 *  2. Read the raw file content (as UTF-8).
 *  3. Compute a SHA-256 integrity hash over the raw bytes.
 *  4. Wrap everything in a `TransferEnvelope` and deliver it to the channel.
 *
 * The hash is computed BEFORE any transformation so the receiver can verify
 * the exact bytes that left the sender — detecting any truncation, encoding
 * corruption, or serialisation mismatch.
 */

import { readFile } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';

// ── Path resolution ───────────────────────────────────────────────────────────

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const EXAMPLES_ROOT = resolve(__dirname, '../../../examples');

/**
 * Industry → format → relative file path within EXAMPLES_ROOT.
 *
 * Naming convention observed across all industry folders:
 *   json    : <slug>_e2e_scenario.json
 *   xml     : <slug>_lead_primary.xml
 *   x12     : <slug>_lead_x12.txt
 *   edifact : <slug>_lead_edifact.txt
 */
const INDUSTRY_FILES = {
  automotive: {
    json:    'automotive/json/automotive_e2e_scenario.json',
    xml:     'automotive/xml/automotive_lead_primary.xml',
    x12:     'automotive/x12/automotive_lead_x12.txt',
    edifact: 'automotive/edifact/automotive_lead_edifact.txt',
  },
  aviation: {
    json:    'aviation/json/aviation_e2e_scenario.json',
    xml:     'aviation/xml/aviation_lead_primary.xml',
    x12:     'aviation/x12/aviation_lead_x12.txt',
    edifact: 'aviation/edifact/aviation_lead_edifact.txt',
  },
  maritime: {
    json:    'maritime/json/maritime_e2e_scenario.json',
    xml:     'maritime/xml/maritime_lead_primary.xml',
    x12:     'maritime/x12/maritime_lead_x12.txt',
    edifact: 'maritime/edifact/maritime_lead_edifact.txt',
  },
  'heavy-equipment': {
    json:    'heavy-equipment/json/heavy_equipment_e2e_scenario.json',
    xml:     'heavy-equipment/xml/heavy_equipment_lead_primary.xml',
    x12:     'heavy-equipment/x12/heavy_equipment_lead_x12.txt',
    edifact: 'heavy-equipment/edifact/heavy_equipment_lead_edifact.txt',
  },
  'real-estate': {
    json:    'real-estate/json/real_estate_e2e_scenario.json',
    xml:     'real-estate/xml/real_estate_lead_primary.xml',
    x12:     'real-estate/x12/real_estate_lead_x12.txt',
    edifact: 'real-estate/edifact/real_estate_lead_edifact.txt',
  },
  technology: {
    json:    'technology/json/technology_e2e_scenario.json',
    xml:     'technology/xml/technology_lead_primary.xml',
    x12:     'technology/x12/technology_lead_x12.txt',
    edifact: 'technology/edifact/technology_lead_edifact.txt',
  },
};

export const INDUSTRIES = Object.keys(INDUSTRY_FILES);
export const FORMATS    = ['json', 'xml', 'x12', 'edifact'];

// ── Transfer envelope ─────────────────────────────────────────────────────────

/**
 * @typedef {Object} TransferEnvelope
 * @property {string} envelopeId      — unique UUID for this transmission
 * @property {string} industry        — e.g. 'automotive'
 * @property {string} format          — 'json' | 'xml' | 'x12' | 'edifact'
 * @property {string} filePath        — absolute path of the source example file
 * @property {string} rawContent      — raw UTF-8 file content (no mutation)
 * @property {number} sizeBytes       — byte length of rawContent
 * @property {string} sha256          — SHA-256 hex digest of rawContent
 * @property {string} sentAt          — ISO-8601 timestamp
 * @property {string} senderId        — identifies the simulated sender
 */

// ── Sender class ──────────────────────────────────────────────────────────────

export class Sender {
  /**
   * @param {string} [senderId]
   */
  constructor(senderId = 'SIM-SENDER-001') {
    this.senderId = senderId;
  }

  /**
   * Compute SHA-256 hex digest of a UTF-8 string.
   * @param {string} content
   * @returns {string}
   */
  computeHash(content) {
    return createHash('sha256').update(content, 'utf8').digest('hex');
  }

  /**
   * Load one example file, compute its hash, and return a TransferEnvelope.
   * @param {string} industry
   * @param {string} format
   * @returns {Promise<TransferEnvelope>}
   */
  async buildEnvelope(industry, format) {
    const rel      = INDUSTRY_FILES[industry]?.[format];
    if (!rel) throw new Error(`No file mapping for industry="${industry}" format="${format}"`);

    const filePath = join(EXAMPLES_ROOT, rel);
    const raw      = await readFile(filePath, 'utf8');

    // Strip UTF-8 BOM if present before hashing (normalise to consistent bytes)
    const normalised = raw.charCodeAt(0) === 0xFEFF ? raw.slice(1) : raw;

    return {
      envelopeId:  randomUUID(),
      industry,
      format,
      filePath,
      rawContent:  normalised,
      sizeBytes:   Buffer.byteLength(normalised, 'utf8'),
      sha256:      this.computeHash(normalised),
      sentAt:      new Date().toISOString(),
      senderId:    this.senderId,
    };
  }

  /**
   * Build and deliver a single envelope to the provided channel function.
   * @param {(env: TransferEnvelope) => Promise<*>} channel
   * @param {string} industry
   * @param {string} format
   * @returns {Promise<{ envelope: TransferEnvelope, ack: * }>}
   */
  async send(channel, industry, format) {
    const envelope = await this.buildEnvelope(industry, format);
    const ack      = await channel(envelope);
    return { envelope, ack };
  }
}
