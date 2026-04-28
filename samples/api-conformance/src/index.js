/**
 * LEX API Conformance — Runner
 *
 * Executes all three proof scripts in sequence and prints a summary.
 * Individual proofs can be run independently:
 *
 *   npm run test:openapi   — parse + validate the OpenAPI spec
 *   npm run test:asyncapi  — parse + validate the AsyncAPI spec
 *   npm run test:sandbox   — submit real messages to the LEX sandbox REST API
 */

import { execSync } from 'node:child_process';

const proofs = [
  { name: 'OpenAPI Spec Validation',  script: 'src/openapi-proof.js'  },
  { name: 'AsyncAPI Spec Validation', script: 'src/asyncapi-proof.js' },
  { name: 'Sandbox REST Submission',  script: 'src/sandbox-proof.js'  },
];

let passed = 0;
let failed = 0;

for (const { name, script } of proofs) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`▶  ${name}`);
  console.log('─'.repeat(60));
  try {
    execSync(`node ${script}`, { stdio: 'inherit' });
    console.log(`✔  PASSED: ${name}`);
    passed++;
  } catch {
    console.error(`✖  FAILED: ${name}`);
    failed++;
  }
}

console.log(`\n${'═'.repeat(60)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('═'.repeat(60));
if (failed > 0) process.exit(1);
