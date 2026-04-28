/**
 * index.js — LEX End-to-End Integrity Simulation entry point.
 *
 * Orchestrates the full sender → channel → receiver pipeline for every
 * industry × format combination found in examples/, then renders a
 * consolidated report showing:
 *
 *   • SHA-256 integrity hash (sender vs receiver)
 *   • Field coverage per format (which fields each format preserves)
 *   • LEX schema validation (JSON messages only, via the library)
 *   • Generated ACK for each scenario
 *
 * Usage:
 *   node src/index.js
 *   node src/index.js --industry automotive
 *   node src/index.js --format json
 *   node src/index.js --industry aviation --format x12
 *   node src/index.js --save-acks            (writes ACKs to ./acks/ as JSON)
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { resolve }           from 'node:path';
import { fileURLToPath }     from 'node:url';

import { Sender, INDUSTRIES, FORMATS } from './sender.js';
import { Receiver }                    from './receiver.js';
import { renderReport }                from './report.js';

// Optional: load the LEX library client for JSON validation
// (gracefully degrade if the library isn't installed)
let LexClient;
try {
  ({ LexClient } = await import('@lexstandard/lex'));
} catch {
  // Library not available in this execution context — JSON validation will be skipped
}

// ── CLI argument parsing ──────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--industry' && argv[i + 1]) { args.industry  = argv[++i]; continue; }
    if (argv[i] === '--format'   && argv[i + 1]) { args.format    = argv[++i]; continue; }
    if (argv[i] === '--save-acks')                { args.saveAcks  = true;      continue; }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));

// ── Filter sets ───────────────────────────────────────────────────────────────

const industriesToRun = args.industry
  ? INDUSTRIES.filter(i => i === args.industry)
  : INDUSTRIES;

const formatsToRun = args.format
  ? FORMATS.filter(f => f === args.format)
  : FORMATS;

if (industriesToRun.length === 0) {
  console.error(`Unknown industry: ${args.industry}. Valid: ${INDUSTRIES.join(', ')}`);
  process.exit(1);
}
if (formatsToRun.length === 0) {
  console.error(`Unknown format: ${args.format}. Valid: ${FORMATS.join(', ')}`);
  process.exit(1);
}

// ── Build components ──────────────────────────────────────────────────────────

const sender = new Sender('SIM-SENDER-001');

const lexClient = LexClient
  ? new LexClient({
      senderId:   'SIM-SENDER-001',
      receiverId: 'SIM-RECEIVER-001',
      apiBase:    'https://sandbox.lexstandard.org/v1',
      apiKey:     '',
    })
  : null;

const receiver = new Receiver('SIM-RECEIVER-001', lexClient);

// ── Channel (in-process, sync) ────────────────────────────────────────────────

/**
 * Simulated transport channel.
 * In a real system this would be an HTTP POST / message queue push.
 * Here we deliver the envelope directly to the receiver — no serialisation
 * over the wire, so any integrity failure must come from within the library
 * (encoding bugs, truncation, etc.) rather than transport.
 *
 * To simulate a realistic lossy channel you can introduce mutations here:
 *   envelope.rawContent = envelope.rawContent.slice(0, -10);  // truncate
 *
 * @param {import('./sender.js').TransferEnvelope} envelope
 * @returns {import('./receiver.js').ReceiveResult}
 */
function channel(envelope) {
  return receiver.receive(envelope);
}

// ── Run simulation ────────────────────────────────────────────────────────────

console.log('\nLEX e2e integrity simulation starting…');
console.log(`  Industries : ${industriesToRun.join(', ')}`);
console.log(`  Formats    : ${formatsToRun.join(', ')}`);
console.log(`  Scenarios  : ${industriesToRun.length * formatsToRun.length}`);
if (!lexClient) console.log('  Note       : @lexstandard/lex not loaded — JSON library validation skipped');
console.log('');

const results = [];
const errors  = [];

for (const industry of industriesToRun) {
  for (const format of formatsToRun) {
    try {
      const { ack: _ack, envelope } = await sender.send(channel, industry, format);
      // `channel` already called receiver.receive() and returned the ReceiveResult as the "ack"
      // sender.send() returns { envelope, ack: ReceiveResult }
      const result = _ack;
      results.push(result);
      const status = result.integrityPass ? '✔' : '✘';
      process.stdout.write(`  ${status} ${industry.padEnd(16)} ${format}\n`);
    } catch (err) {
      errors.push({ industry, format, error: err.message });
      process.stdout.write(`  ! ${industry.padEnd(16)} ${format}  ERROR: ${err.message}\n`);
    }
  }
}

// ── Render report ─────────────────────────────────────────────────────────────

if (results.length > 0) {
  renderReport(results);
}

// ── Optional: save ACKs to disk ───────────────────────────────────────────────

if (args.saveAcks && results.length > 0) {
  const __dirname = fileURLToPath(new URL('.', import.meta.url));
  const acksDir   = resolve(__dirname, '../acks');
  await mkdir(acksDir, { recursive: true });

  for (const result of results) {
    const name = `ack_${result.industry}_${result.format}.json`;
    await writeFile(
      resolve(acksDir, name),
      JSON.stringify(result.ack, null, 2),
      'utf8',
    );
  }
  console.log(`  ACK files written to: ${acksDir}\n`);
}

// ── Report load errors ────────────────────────────────────────────────────────

if (errors.length > 0) {
  console.error(`\n  ${errors.length} scenario(s) could not be loaded:`);
  for (const e of errors) {
    console.error(`    [${e.industry}/${e.format}] ${e.error}`);
  }
  console.error('');
}

// Exit non-zero only when integrity failures are present
const hasIntegrityFailure = results.some(r => !r.integrityPass);
process.exit(hasIntegrityFailure ? 1 : 0);
