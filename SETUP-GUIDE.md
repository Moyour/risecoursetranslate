# Rise Course Translate — Setup Guide

Summary of the risecoursetranslate project and how to use it in Articulate Rise xAPI exports.

---

## What this does

- Adds a language dropdown to Rise courses
- Translates course text via Google Translate (free, no API key)
- Keeps glossary terms **untranslated** in every language (brand names, acronyms, etc.)

**GitHub repo:** https://github.com/Moyour/risecoursetranslate

---

## Current version

**v1.8.7** — commit `a71905e`

```html
<script src="https://cdn.jsdelivr.net/gh/Moyour/risecoursetranslate@a71905e/risecoursetranslate.js" defer></script>
```

Update `@a71905e` when a newer version is pushed.

---

## For non-technical team members

**They only edit Excel.** Nothing else.

### Updating the glossary (2 steps)

1. **Edit** `Translation Glossary.xlsx` in Excel → **Save**
2. **Double-click** `Update Glossary.command` (in the risecoursetranslate folder)

That’s it. It creates **`Translation Glossary.js`** automatically.

### One-time setup (optional — for auto-copy to course)

1. Copy `glossary-course-folder.example.txt` → rename to `glossary-course-folder.txt`
2. Paste the full path to your `scormcontent` folder, e.g.  
   `/Users/you/Desktop/MyCourse/scormcontent`
3. After that, double-clicking **Update Glossary** also copies the file into the course folder

### Who does what

| Person | Task |
|--------|------|
| **Team** | Edit Excel only |
| **Anyone** | Double-click **Update Glossary** after Excel is saved |
| **Publisher** | Re-zip and upload course to LMS (when ready) |

No terminal. No CSV export. No editing `.js` files by hand.

---

## Quick setup (xAPI)

### Step 1 — One line in `index.html`

Paste inside `<head>` or top of `<body>` in **`scormcontent/index.html`**:

```html
<script src="https://cdn.jsdelivr.net/gh/Moyour/risecoursetranslate@a71905e/risecoursetranslate.js" defer></script>
```

### Step 2 — One file in the course folder

Copy **`Translation Glossary.js`** into **`scormcontent/`** (same folder as `index.html`).

### Folder layout

```
xapi-package/
├── scormdriver/          ← do not edit
└── scormcontent/         ← your course
    ├── index.html        ← add script line here
    └── Translation Glossary.js
```

### Step 3 — Re-zip and upload to LMS

Each time you re-export from Rise, re-add the script line and glossary file.

---

## Your glossary (Excel)

- **Source file:** `Translation Glossary.xlsx`
- **Columns:** Source content | Target content | Notes
- **Purpose:** Every term listed stays in English (or original) regardless of language selected
- **Not** a translation dictionary — it is a “do not translate” list

### When you update the Excel sheet

1. Edit `Translation Glossary.xlsx`
2. Save / export as CSV (optional)
3. Rebuild the `.js` file:

```bash
node scripts/build-glossary-js.mjs "Translation Glossary.csv"
```

4. Copy the new **`Translation Glossary.js`** into `scormcontent/`
5. Re-zip and upload

---

## Why `.js` and not `.csv` in xAPI?

| File | xAPI / SCORM |
|------|----------------|
| `Translation Glossary.csv` | Usually **fails** (LMS blocks fetch) |
| `Translation Glossary.js` | **Works** — script auto-loads it |

The translator tries CSV first, then automatically falls back to `.js`. You will often see `Glossary fetch failed` in the console for CSV — that is expected. Look for:

```
[risecoursetranslate] Glossary loaded: 49 protected term(s) from ...Translation Glossary.js
```

---

## Privacy

| Item | Public? |
|------|---------|
| `risecoursetranslate.js` (CDN) | Yes — on GitHub |
| `Translation Glossary.js` | **No** — stays in your course upload only |
| Glossary terms | **Never** commit to the public GitHub repo |

---

## How to verify it works

Open course → **F12** → **Console**:

| Check | Expected |
|-------|----------|
| `window.__riseTranslateVersion` | `"1.8.7"` |
| `window.__riseGlossaryCount` | `49` (or your term count) |
| Console message | `Glossary loaded: X protected term(s)` |

Pick French/Spanish — terms like **ODF**, **TM Forum**, **Digital Twin** should stay unchanged.

---

## Version history (this project)

| Version | What changed |
|---------|----------------|
| v1.6.x | Dropdown, placement on Rise cover vs floating widget |
| v1.8.0 | Glossary CSV support |
| v1.8.2 | Excel “Source content / Target content” format |
| v1.8.3 | Block-level translation + segment glossary (Rise-safe) |
| v1.8.4 | Inline embed + multi-path fetch |
| v1.8.5 | Default filename `Translation Glossary` |
| v1.8.6 | Auto-load `Translation Glossary.csv` |
| v1.8.7 | Auto-fallback to `Translation Glossary.js` when CSV fetch fails (xAPI fix) |

---

## Optional build scripts (on your Mac)

| Script | Purpose |
|--------|---------|
| `scripts/build-glossary-js.mjs` | Excel/CSV → `Translation Glossary.js` |
| `scripts/build-combined-embed.mjs` | Single paste block (glossary embedded in HTML — private) |
| `scripts/verify-glossary.mjs` | Test that a CSV parses correctly |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Glossary fetch failed | Normal for CSV in xAPI — add `Translation Glossary.js` |
| Glossary count = 0 | File missing or wrong folder — must be in `scormcontent/` |
| Terms still translate | Update CDN commit; confirm glossary loaded in console |
| Dropdown issues | Check `window.__riseTranslateVersion` matches latest |
| Re-publish from Rise | Re-add script line + glossary file every time |

---

## Files in this repo

| File | Purpose |
|------|---------|
| `risecoursetranslate.js` | Main translator (CDN) |
| `glossary.example.csv` | Example format (fake terms) |
| `glossary.example.js` | Example for local `test.html` |
| `test.html` | Local mock Rise page for testing |
| `SETUP-GUIDE.md` | This file |

---

## Local test

Open `test.html` in a browser (with a local server if needed for glossary load).

---

*Last updated: June 2025 — chat summary for Moyour / ODF Awareness course.*
