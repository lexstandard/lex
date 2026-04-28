/**
 * receiver.js — Simulated LEX message receiver.
 *
 * Responsibilities:
 *  1. Accept a TransferEnvelope from the sender channel.
 *  2. Re-compute the SHA-256 hash of the received raw content.
 *  3. Compare it against the hash supplied by the sender → integrity verdict.
 *  4. Extract structured fields (format-aware) to verify field coverage.
 *  5. For JSON envelopes: validate the LEX message structure via the library.
 *  6. Build and return a proper LEX ACKNOWLEDGMENT message.
 *
 * The receiver never mutates rawContent — the hash comparison is always
 * performed on the exact bytes that arrived, not on any parsed representation.
 */

import { createHash, randomUUID } from 'node:crypto';
import { extractFields }          from './formats.js';

// ── ACK status constants ──────────────────────────────────────────────────────

export const AckStatus = Object.freeze({
  VALIDATED: 'VALIDATED',
  REJECTED:  'REJECTED',
});

// ── Result structure ──────────────────────────────────────────────────────────

/**
 * @typedef {Object} ReceiveResult
 * @property {string}          envelopeId
 * @property {string}          industry
 * @property {string}          format
 * @property {boolean}         integrityPass      — sender hash === receiver hash
 * @property {string}          expectedHash
 * @property {string}          computedHash
 * @property {number}          sizeBytes
 * @property {ExtractedFields} fields
 * @property {boolean}         lexValid           — only true for JSON + valid LEX structure
 * @property {string[]}        lexErrors          — validator errors (JSON only)
 * @property {Object}          ack                — full LEX ACKNOWLEDGMENT message
 */

// ── Receiver class ────────────────────────────────────────────────────────────

export class Receiver {
  /**
   * @param {string} [receiverId]
   * @param {import('@lexstandard/lex').LexClient} [lexClient]  optional library client for JSON validation
   */
  constructor(receiverId = 'SIM-RECEIVER-001', lexClient = null) {
    this.receiverId = receiverId;
    this.lexClient  = lexClient;
  }

  /**
   * Compute SHA-256 hex digest of a UTF-8 string.
   * @param {string} content
   * @returns {string}
   */
  _hash(content) {
    return createHash('sha256').update(content, 'utf8').digest('hex');
  }

  /**
   * Attempt to validate a JSON LEX message via the library client (if available).
   * Returns { valid, errors }.
   * @param {string} raw
   * @returns {{ valid: boolean, errors: string[] }}
   */
  _validateLex(raw) {
    if (!this.lexClient) return { valid: false, errors: ['No LexClient provided; skipping library validation'] };
    try {
      const msg    = JSON.parse(raw.charCodeAt(0) === 0xFEFF ? raw.slice(1) : raw);
      // e2e scenario files wrap messages in { messages: [{ lex:{...} }] }
      // validate() expects the outer { lex: { header, payload } } wrapper
      let target = msg;
      if (Array.isArray(msg.messages)) {
        const first = msg.messages.find(m => m.lex?.payload?.lead);
        // keep the outer { lex: ... } shape that validate() requires
        target = first ?? null;
      }
      if (!target) return { valid: false, errors: ['Could not locate lex message in payload'] };
      const result = this.lexClient.validate(target);
      return {
        valid:  result.valid  ?? false,
        errors: (result.errors ?? []).map(e => typeof e === 'string' ? e : `[${e.level ?? 'ERROR'}] ${e.field}: ${e.message}`),
        // Separate temporal-only failures (expected for static example files) from structural ones
        onlyTemporalErrors: (result.errors ?? []).every(e =>
          typeof e === 'object' && e.field && String(e.field).toLowerCase().includes('timestamp')
        ) && (result.errors ?? []).length > 0,
      };
    } catch (err) {
      return { valid: false, errors: [`Parse error: ${err.message}`] };
    }
  }

  /**
   * Build a standard LEX ACKNOWLEDGMENT message.
   * @param {import('./sender.js').TransferEnvelope} envelope
   * @param {boolean} integrityPass
   * @param {ExtractedFields} fields
   * @param {boolean} lexValid
   * @param {string[]} lexErrors
   * @returns {Object}  full { lex: { header, payload } } message
   */
  _buildAck(envelope, integrityPass, fields, lexValid, lexErrors) {
    const ackId    = `ACK-${randomUUID()}`;
    const corrId   = fields.messageId ?? envelope.envelopeId;
    const status   = integrityPass ? AckStatus.VALIDATED : AckStatus.REJECTED;

    let statusReason;
    if (!integrityPass) {
      statusReason = 'SHA-256 integrity check FAILED — data loss or corruption detected';
    } else if (envelope.format === 'json' && !lexValid) {
      statusReason = `SHA-256 integrity verified; LEX schema validation FAILED: ${lexErrors.slice(0, 2).map(e => (typeof e === 'string' ? e : e.message ?? JSON.stringify(e))).join('; ')}`;
    } else {
      statusReason = 'SHA-256 integrity verified; message accepted';
    }

    return {
      lex: {
        header: {
          messageId:        ackId,
          messageType:      'ACKNOWLEDGMENT',
          version:          '1.0',
          timestamp:        new Date().toISOString(),
          senderId:         this.receiverId,
          receiverId:       envelope.senderId,
          encryptionMethod: 'TLS1.3',
        },
        payload: {
          acknowledgment: {
            acknowledgmentId:    ackId,
            correlationId:       corrId,
            originalMessageId:   corrId,
            originalMessageType: 'LEAD',
            status,
            statusReason,
            timestamp:           new Date().toISOString(),
            // Non-standard extension fields for simulation diagnostics
            _simulation: {
              industry:          envelope.industry,
              format:            envelope.format,
              integrityCheck: {
                algorithm:     'SHA-256',
                expectedHash:  envelope.sha256,
                computedHash:  this._hash(envelope.rawContent),
                match:         integrityPass,
              },
              fieldCoverage: {
                captured:      fields.fieldsCaptured,
                total:         fields.totalFields,
                missingFields: fields.missingFields,
              },
              sizeBytes:         envelope.sizeBytes,
              lexValidation: envelope.format === 'json'
                ? { valid: lexValid, errors: lexErrors }
                : { valid: null, reason: 'Library validation only available for JSON format' },
            },
          },
        },
      },
    };
  }

  /**
   * Receive a TransferEnvelope, verify integrity, extract fields, validate (JSON only),
   * and return a full ReceiveResult including the LEX ACK.
   *
   * @param {import('./sender.js').TransferEnvelope} envelope
   * @returns {ReceiveResult}
   */
  receive(envelope) {
    const computedHash   = this._hash(envelope.rawContent);
    const integrityPass  = computedHash === envelope.sha256;

    const fields = extractFields(envelope.format, envelope.rawContent);

    let lexValid  = false;
    let lexErrors = [];
    let lexOnlyTemporalErrors = false;
    if (envelope.format === 'json') {
      const result = this._validateLex(envelope.rawContent);
      lexValid             = result.valid;
      lexErrors            = result.errors;
      lexOnlyTemporalErrors = result.onlyTemporalErrors ?? false;
    }

    const ack = this._buildAck(envelope, integrityPass, fields, lexValid, lexErrors);

    return {
      envelopeId:    envelope.envelopeId,
      industry:      envelope.industry,
      format:        envelope.format,
      integrityPass,
      expectedHash:  envelope.sha256,
      computedHash,
      sizeBytes:     envelope.sizeBytes,
      fields,
      lexValid,
      lexErrors,
      lexOnlyTemporalErrors,
      ack,
    };
  }
}
