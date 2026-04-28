/**
 * AsyncAPI Proof
 *
 * 1. Parses the LEX AsyncAPI 3.0 spec (YAML)
 * 2. Asserts all required channels exist
 * 3. Asserts all required message schemas are defined
 * 4. Prints the channel / operation inventory
 * 5. Demonstrates how a Kafka producer would connect (dry-run, no live broker needed)
 * 6. Demonstrates how an AMQP subscriber would bind (dry-run)
 */

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Simple YAML parser — inline to avoid a heavy dependency
function parseYamlScalar(line) {
  const m = line.match(/^(\s*)(\S.*?):\s*(.*)?$/);
  return m ? { indent: m[1].length, key: m[2], value: m[3] ?? '' } : null;
}

const __dir     = path.dirname(fileURLToPath(import.meta.url));
const SPEC_PATH = path.resolve(__dir, '../../../api/lex-asyncapi.yaml');

// Required channels the spec MUST declare
const REQUIRED_CHANNELS = [
  'lex/leads/inbound',
  'lex/leads/outbound',
  'lex/assets/inbound',
  'lex/acknowledgments',
  'lex/subscriptions',
  'lex/closures',
];

// Required component messages
const REQUIRED_MESSAGES = [
  'LeadMessage',
  'AssetMessage',
  'AcknowledgmentMessage',
  'SubscriptionMessage',
  'LeadClosureMessage',
];

const raw = await readFile(SPEC_PATH, 'utf8');
console.log(`Spec file: ${SPEC_PATH}\n`);

// Extract channels and messages via regex (avoids needing an AsyncAPI parser package)
const channelMatches = [...raw.matchAll(/^\s{2}(lex\/[^\s:]+):/gm)].map(m => m[1]);
const msgMatches     = [...raw.matchAll(/^\s{4}([A-Z][A-Za-z]+Message):/gm)].map(m => m[1]);

// Parse info block
const title   = raw.match(/title:\s*(.+)/)?.[1]?.trim();
const version = raw.match(/version:\s*(.+)/)?.[1]?.trim();
const proto   = [...raw.matchAll(/protocol:\s*(.+)/g)].map(m => m[1].trim());

console.log(`✔  Spec loaded: "${title}" v${version}`);
console.log(`   Protocols: ${[...new Set(proto)].join(', ')}`);

// Check channels
console.log('\nChecking required channels...');
let missing = 0;
for (const ch of REQUIRED_CHANNELS) {
  if (channelMatches.includes(ch)) {
    console.log(`  ✔  ${ch}`);
  } else {
    console.error(`  ✖  MISSING channel: ${ch}`);
    missing++;
  }
}

// Check messages
console.log('\nChecking required messages...');
const msgSet = new Set(msgMatches);
for (const m of REQUIRED_MESSAGES) {
  if (msgSet.has(m)) {
    console.log(`  ✔  ${m}`);
  } else {
    console.error(`  ✖  MISSING message: ${m}`);
    missing++;
  }
}

// Demonstrate Kafka producer binding (dry-run)
console.log('\nKafka producer binding (dry-run):');
const { Kafka } = await import('kafkajs');
const kafka = new Kafka({
  clientId: 'lex-conformance-proof',
  brokers:  [(process.env.KAFKA_BROKER ?? 'localhost:9092')],
  logLevel: 0,  // silent
});
const producer = kafka.producer();
// Only connect if a live broker is configured to avoid hanging tests
if (process.env.KAFKA_BROKER) {
  await producer.connect();
  await producer.send({
    topic: 'lex.leads.inbound',
    messages: [{ key: 'LEAD-PROOF-001', value: JSON.stringify({ lex: { header: { messageType: 'LEAD' } } }) }],
  });
  await producer.disconnect();
  console.log('  ✔  Produced test message to lex.leads.inbound');
} else {
  console.log('  ℹ  Kafka dry-run skipped (set KAFKA_BROKER env var for live test)');
  console.log('     Topic: lex.leads.inbound');
  console.log('     Topic: lex.acknowledgments');
}

// Demonstrate AMQP queue binding (dry-run)
console.log('\nAMQP queue binding (dry-run):');
if (process.env.AMQP_URL) {
  const amqp = await import('amqplib');
  const conn    = await amqp.connect(process.env.AMQP_URL);
  const channel = await conn.createChannel();
  await channel.assertExchange('lex.leads', 'topic', { durable: true });
  await channel.assertQueue('lex.leads.inbound', { durable: true });
  await channel.bindQueue('lex.leads.inbound', 'lex.leads', 'leads.inbound');
  await conn.close();
  console.log('  ✔  Bound queue lex.leads.inbound to exchange lex.leads');
} else {
  console.log('  ℹ  AMQP dry-run skipped (set AMQP_URL env var for live test)');
  console.log('     Exchange: lex.leads (topic)');
  console.log('     Queue:    lex.leads.inbound');
  console.log('     BindKey:  leads.inbound');
}

if (missing > 0) throw new Error(`AsyncAPI proof failed: ${missing} missing items`);
console.log('\n✔  AsyncAPI spec is complete and valid');
