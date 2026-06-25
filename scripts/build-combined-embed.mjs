#!/usr/bin/env node
/**
 * One copy-paste block: embedded private glossary + CDN translator.
 * Usage: node scripts/build-combined-embed.mjs "Translation Glossary.csv" [output.html]
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { execSync } from 'child_process';

const csvPath = process.argv[2];
const outPath = process.argv[3] || join(dirname(csvPath), 'rise-translate-embed.html');
const CDN_COMMIT = process.env.RISE_TRANSLATE_COMMIT || (() => {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'f319cf6';
  }
})();

if (!csvPath) {
  console.error('Usage: node scripts/build-combined-embed.mjs <Translation Glossary.csv> [rise-translate-embed.html]');
  process.exit(1);
}

const csv = readFileSync(csvPath, 'utf8');
const cdn = `https://cdn.jsdelivr.net/gh/Moyour/risecoursetranslate@${CDN_COMMIT}/risecoursetranslate.js`;
const block = `<script>
window.__riseGlossaryCsv=${JSON.stringify(csv)};
(function(d){var s=d.createElement("script");s.src="${cdn}";s.defer=true;d.head.appendChild(s);})(document);
</script>
`;

writeFileSync(outPath, block, 'utf8');
console.log('Wrote', outPath);
console.log('Paste the entire <script>...</script> block into index.html (private — do not commit to GitHub).');
