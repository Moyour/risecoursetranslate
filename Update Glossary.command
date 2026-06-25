#!/bin/bash
cd "$(dirname "$0")"
echo ""
echo "  Updating glossary from Translation Glossary.xlsx..."
echo ""
python3 scripts/xlsx-to-glossary-js.py "$@"
STATUS=$?
echo ""
if [ $STATUS -eq 0 ]; then
  osascript -e 'display notification "Translation Glossary.js is ready." with title "Glossary updated"' 2>/dev/null || true
  echo "  You can close this window."
else
  echo "  Something went wrong. Is Translation Glossary.xlsx in Downloads?"
  echo ""
fi
read -n 1 -s -r -p "Press any key to close..."
