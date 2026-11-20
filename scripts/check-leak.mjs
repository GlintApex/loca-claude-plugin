#!/usr/bin/env node
// Scans every tracked file for terms that must never appear in this public repository.
// The term list is NOT stored here (publishing it would defeat the purpose): it comes from the
// LEAK_DENYLIST environment variable (one term per line, case-insensitive substring match),
// provided to CI as a repository secret.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const terms = (process.env.LEAK_DENYLIST ?? '')
  .split(/\r?\n/)
  .map((t) => t.trim().toLowerCase())
  .filter(Boolean);
if (terms.length === 0) {
  console.log('check-leak: LEAK_DENYLIST not set, skipping (expected on fork pull requests)');
  process.exit(0);
}
const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n').filter(Boolean);
let hits = 0;
for (const f of files) {
  const text = `${f}\n${readFileSync(f, 'latin1')}`.toLowerCase();
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    for (const t of terms) {
      if (line.includes(t)) {
        hits++;
        console.error(`${f}:${i} contains a denied term (#${terms.indexOf(t) + 1})`);
      }
    }
  });
}
if (hits) {
  console.error(`check-leak: ${hits} hit(s)`);
  process.exit(1);
}
console.log(`check-leak: OK (${files.length} files, ${terms.length} terms)`);
