#!/usr/bin/env node
// Demo: validates a small fixed list, asserts expectations, prints results.
// No network, no file reads. Exit non-zero on any mismatch.
import { check } from '../src/iban.mjs';

const CASES = [
  ['DE89370400440532013000', true],
  ['GB29NWBK60161331926819', true],
  ['FR1420041010050500013M02606', true],
  ['de89 3704 0044 0532 0130 00', true],
  ['DE88370400440532013000', false],
  ['US0012345678901234567890', false],
];

let failed = 0;
for (const [input, expected] of CASES) {
  const r = check(input);
  const pass = r.ok === expected;
  if (!pass) failed++;
  console.log(`${pass ? 'PASS' : 'FAIL'} ${input} -> ${r.ok ? `ok (${r.country})` : r.code}`);
}

const assertFlag = process.argv.includes('--assert');
if (assertFlag && failed > 0) {
  console.error(`${failed} case(s) mismatched`);
  process.exit(1);
}
if (!assertFlag && failed > 0) process.exitCode = 1;
console.log(failed === 0 ? 'demo: all cases as expected' : `demo: ${failed} mismatch(es)`);
