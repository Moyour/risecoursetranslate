#!/usr/bin/env node
/**
 * Verifies glossary CSV parsing against risecoursetranslate.js logic.
 * Run: node scripts/verify-glossary.mjs [path/to/glossary.csv]
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function trimTerm(t) {
  return String(t).replace(/\u00a0/g, ' ').trim();
}

function parseCSVLine(line) {
  const parts = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
      continue;
    }
    if (c === ',' && !inQuotes) {
      parts.push(cur.trim());
      cur = '';
      continue;
    }
    cur += c;
  }
  parts.push(cur.trim());
  return parts;
}

function isSourceTargetHeader(cols) {
  return cols[0] && /^source\s*content$/i.test(trimTerm(cols[0]));
}

function isGlossaryType(value) {
  const type = trimTerm(value).toLowerCase();
  return ['keep', 'skip', 'donttranslate', "don't translate", 'override', 'fix'].includes(type);
}

function isGlossaryHeader(cols, line) {
  if (/^term\s*,/i.test(line)) return true;
  if (isSourceTargetHeader(cols)) return true;
  if (cols.length === 1 && /^(term|word|words|glossary|terms?)$/i.test(trimTerm(cols[0]))) return true;
  return false;
}

function parseGlossaryCSV(text) {
  const g = { keep: [], overrides: {} };
  let lines = text.split(/\r?\n/).filter((l) => l.trim());
  let start = 0;
  let sourceTargetFormat = false;

  if (lines.length) {
    const cols = parseCSVLine(lines[0]);
    if (isGlossaryHeader(cols, lines[0])) {
      sourceTargetFormat = isSourceTargetHeader(cols);
      start = 1;
    }
  }

  const addKeep = (term) => {
    term = trimTerm(term);
    if (!term || g.keep.includes(term)) return;
    g.keep.push(term);
  };

  for (let i = start; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    const term = cols[0];
    if (!term) continue;
    if (sourceTargetFormat) {
      addKeep(term);
      if (cols[1]) addKeep(cols[1]);
      continue;
    }
    if (cols.length === 1 || !cols[1] || !trimTerm(cols[1])) {
      addKeep(term);
      continue;
    }
    if (!isGlossaryType(cols[1])) {
      addKeep(term);
      addKeep(cols[1]);
      continue;
    }
    const type = trimTerm(cols[1]).toLowerCase();
    if (type === 'keep' || type === 'skip' || type === 'donttranslate' || type === "don't translate") {
      addKeep(term);
    }
  }

  g.keep = g.keep.map(trimTerm).filter(Boolean);
  g.keep = g.keep.filter((t, i) => g.keep.indexOf(t) === i);
  return g;
}

const csvPath = process.argv[2] || join(root, 'glossary.example.csv');
const text = readFileSync(csvPath, 'utf8');
const result = parseGlossaryCSV(text);

if (result.keep.length === 0) {
  console.error('FAIL: no protected terms parsed from', csvPath);
  process.exit(1);
}

if (result.keep.includes('Source content')) {
  console.error('FAIL: header row was parsed as a term');
  process.exit(1);
}

console.log('OK:', result.keep.length, 'protected term(s) from', csvPath);
console.log(result.keep.slice(0, 5).join(' | '), result.keep.length > 5 ? '...' : '');
