#!/usr/bin/env python3
"""Read Translation Glossary.xlsx and write Translation Glossary.js"""
import json
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path


def read_xlsx_rows(path):
    with zipfile.ZipFile(path) as z:
        ss = []
        root = ET.fromstring(z.read('xl/sharedStrings.xml'))
        ns = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
        for si in root.findall('m:si', ns):
            t = si.find('m:t', ns)
            if t is not None and t.text:
                ss.append(t.text)
            else:
                ss.append(''.join((r.find('m:t', ns).text or '') for r in si.findall('m:r', ns)))
        sheet = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
        rows = []
        for row in sheet.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheetData/{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row'):
            cells = []
            for c in row.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                v = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                if v is None:
                    cells.append('')
                elif c.get('t') == 's':
                    cells.append(ss[int(v.text)])
                else:
                    cells.append(v.text or '')
            rows.append(cells)
    return rows


def rows_to_csv(rows):
    import io
    import csv
    buf = io.StringIO()
    writer = csv.writer(buf, lineterminator='\n')
    for row in rows:
        writer.writerow([(c or '').replace('\u00a0', ' ').strip() if isinstance(c, str) else c for c in row])
    return buf.getvalue()


def main():
    repo = Path(__file__).resolve().parents[1]
    config = repo / 'glossary-course-folder.txt'
    downloads = Path.home() / 'Downloads'

    xlsx = None
    if len(sys.argv) > 1:
        xlsx = Path(sys.argv[1]).expanduser()
    else:
        for folder in [downloads, repo]:
            candidate = folder / 'Translation Glossary.xlsx'
            if candidate.exists():
                xlsx = candidate
                break

    if not xlsx or not xlsx.exists():
        print('ERROR: Put Translation Glossary.xlsx in Downloads, or drag it onto Update Glossary.')
        return 1

    rows = read_xlsx_rows(xlsx)
    csv_text = rows_to_csv(rows)
    js_name = 'Translation Glossary.js'
    js_body = '/* Auto-built from ' + xlsx.name + ' — do not edit by hand */\n'
    js_body += 'window.__riseGlossaryCsv = ' + json.dumps(csv_text) + ';\n'

    out_js = xlsx.parent / js_name
    out_js.write_text(js_body, encoding='utf-8')
    print('Created:', out_js)

    if config.exists():
        course_dir = Path(config.read_text(encoding='utf-8').strip()).expanduser()
        if course_dir.is_dir():
            dest = course_dir / js_name
            dest.write_text(js_body, encoding='utf-8')
            print('Copied to course folder:', dest)
        else:
            print('Note: glossary-course-folder.txt path not found:', course_dir)

    print('Done. Terms ready for the course.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
