import { readFileSync } from 'fs';

const results = JSON.parse(readFileSync('test-results/results.json', 'utf-8'));

const areas = {};

function collectSpecs(suite, filePath) {
  if (suite.specs?.length) {
    const name = (filePath ?? suite.file ?? '')
      .replace(/^tests\//, '')
      .replace(/\.(spec|test)\.ts$/, '');
    if (!areas[name]) areas[name] = { tests: 0, passed: 0 };
    for (const spec of suite.specs) {
      areas[name].tests++;
      const status = spec.tests?.[0]?.results?.[0]?.status;
      if (status === 'passed') areas[name].passed++;
    }
  }
  for (const child of suite.suites ?? []) {
    collectSpecs(child, filePath ?? suite.file);
  }
}

for (const suite of results.suites ?? []) {
  collectSpecs(suite, suite.file);
}

const rows = Object.entries(areas);
const totalTests = rows.reduce((s, [, v]) => s + v.tests, 0);
const totalPassed = rows.reduce((s, [, v]) => s + v.passed, 0);

const col = (s, n) => s.padEnd(n);
const W = [32, 7, 9, 9];

console.log('\n## Test summary — VTRNA Frontend\n');
console.log(`| ${col('Area', W[0])} | ${col('Tests', W[1])} | ${col('Passed', W[2])} | ${col('Failed', W[3])} |`);
console.log(`|${'-'.repeat(W[0] + 2)}|${'-'.repeat(W[1] + 2)}|${'-'.repeat(W[2] + 2)}|${'-'.repeat(W[3] + 2)}|`);

for (const [name, { tests, passed }] of rows) {
  const failed = tests - passed;
  console.log(`| ${col(name, W[0])} | ${col(String(tests), W[1])} | ${col(String(passed), W[2])} | ${col(String(failed), W[3])} |`);
}

console.log(`| ${col('**Total**', W[0])} | ${col(String(totalTests), W[1])} | ${col(String(totalPassed), W[2])} | ${col(String(totalTests - totalPassed), W[3])} |`);
console.log(`\nVer reporte completo: npx playwright show-report`);
