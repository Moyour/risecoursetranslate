#!/usr/bin/env node
/**
 * Build glossary.js from a CSV file (for Rise/SCORM where .csv fetch is blocked).
 * Usage: node scripts/build-glossary-js.mjs path/to/glossary.csv [output.js]
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const csvPath = process.argv[2];
const outPath = process.argv[3] || join(dirname(csvPath), 'glossary.js');

if (!csvPath) {
  console.error('Usage: node scripts/build-glossary-js.mjs <glossary.csv> [glossary.js]');
  process.exit(1);
}

const csv = readFileSync(csvPath, 'utf8');
const js = '/* Rise course glossary — load before risecoursetranslate.js */\n'
  + 'window.__riseGlossaryCsv = ' + JSON.stringify(csv) + ';\n';

writeFileSync(outPath, js, 'utf8');
console.log('Wrote', outPath, '(' + csv.split(/\r?\n/).filter(Boolean).length, 'lines)');
