#!/usr/bin/env node
/**
 * Build a .js glossary loader from CSV (for Rise/SCORM where .csv fetch is blocked).
 * Usage: node scripts/build-glossary-js.mjs "Translation Glossary.csv"
 * Output: same folder, same name with .js extension (e.g. Translation Glossary.js)
 */
import { readFileSync, writeFileSync } from 'fs';
import { basename, dirname, join } from 'path';

const csvPath = process.argv[2];
if (!csvPath) {
  console.error('Usage: node scripts/build-glossary-js.mjs <Translation Glossary.csv> [output.js]');
  process.exit(1);
}

const base = basename(csvPath).replace(/\.(csv|xlsx)$/i, '');
const outPath = process.argv[3] || join(dirname(csvPath), base + '.js');
const csv = readFileSync(csvPath, 'utf8');
const js = '/* Rise course glossary — load before risecoursetranslate.js */\n'
  + 'window.__riseGlossaryCsv = ' + JSON.stringify(csv) + ';\n';

writeFileSync(outPath, js, 'utf8');
console.log('Wrote', outPath, '(' + csv.split(/\r?\n/).filter(Boolean).length, 'lines)');
