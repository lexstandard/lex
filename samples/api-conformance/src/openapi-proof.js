/**
 * OpenAPI Proof
 *
 * 1. Parses and fully dereferences the LEX OpenAPI 3.1 spec
 * 2. Asserts all required paths exist
 * 3. Asserts all required schemas are defined
 * 4. Prints path/operation inventory
 */

import SwaggerParser from '@apidevtools/swagger-parser';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dir     = path.dirname(fileURLToPath(import.meta.url));
const SPEC_PATH = path.resolve(__dir, '../../../api/lex-openapi.yaml');

// Required paths the spec MUST declare
const REQUIRED_PATHS = [
  '/messages',
  '/messages/{messageId}',
  '/messages/{messageId}/acknowledgment',
  '/messages/batch',
  '/leads',
  '/leads/{leadId}',
  '/leads/{leadId}/close',
  '/assets',
  '/subscriptions',
  '/conformance/validate',
];

// Required named schemas
const REQUIRED_SCHEMAS = [
  'AnyLexMessage',
  'LeadMessage',
  'AssetMessage',
  'AcknowledgmentMessage',
  'LeadClosureMessage',
  'MessageSubmitResponse',
  'ValidationFailureResponse',
];

console.log(`Spec file: ${SPEC_PATH}\n`);

// 1. Parse & dereference
const api = await SwaggerParser.validate(SPEC_PATH);
console.log(`✔  Spec parsed and valid: "${api.info.title}" v${api.info.version}`);
console.log(`   Servers: ${api.servers.map(s => s.url).join(', ')}`);

// 2. Required paths
console.log('\nChecking required paths...');
let missingPaths = 0;
for (const p of REQUIRED_PATHS) {
  if (api.paths?.[p]) {
    const methods = Object.keys(api.paths[p]).filter(k => k !== 'parameters').join(', ').toUpperCase();
    console.log(`  ✔  ${p}  [${methods}]`);
  } else {
    console.error(`  ✖  MISSING: ${p}`);
    missingPaths++;
  }
}

// 3. Required schemas
console.log('\nChecking required schemas...');
let missingSchemas = 0;
const schemas = api.components?.schemas ?? {};
for (const s of REQUIRED_SCHEMAS) {
  if (schemas[s]) {
    console.log(`  ✔  ${s}`);
  } else {
    console.error(`  ✖  MISSING schema: ${s}`);
    missingSchemas++;
  }
}

// 4. Summary
console.log('\nPath inventory:');
for (const [route, pathItem] of Object.entries(api.paths ?? {})) {
  const ops = Object.entries(pathItem)
    .filter(([k]) => ['get','post','put','patch','delete'].includes(k))
    .map(([method, op]) => `${method.toUpperCase()} (${op.operationId ?? '—'})`);
  console.log(`  ${route}: ${ops.join('  |  ')}`);
}

if (missingPaths > 0 || missingSchemas > 0) {
  throw new Error(`OpenAPI proof failed: ${missingPaths} missing paths, ${missingSchemas} missing schemas`);
}
console.log('\n✔  OpenAPI spec is complete and valid');
