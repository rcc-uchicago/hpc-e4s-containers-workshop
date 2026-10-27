#!/bin/bash
# render.sh - build the deck, then render it to PDF and slide images for review.
#
#   cd slides
#   npm install                               # once: pptxgenjs, react-icons, sharp
#   apptainer build --fakeroot lo.sif lo.def  # once, optional: LibreOffice for the PDF
#   ./render.sh
#
# Optional environment:
#   LO_SIF=path/to/lo.sif       LibreOffice image (default: ./lo.sif)
#   PPTX_VALIDATE=validate.py   an OOXML validator to run on the result
#   PYTHON=python3              interpreter for PPTX_VALIDATE
#   DPI=60                      resolution of render/slide-*.jpg

set -euo pipefail
cd "$(dirname "$0")"
DECK=E4S_Workshop_RCC_2026-10-27

node build_deck.js
if [ -n "${PPTX_VALIDATE:-}" ]; then
    "${PYTHON:-python3}" "$PPTX_VALIDATE" "$DECK.pptx"
fi

LO_SIF=${LO_SIF:-lo.sif}
if [ ! -f "$LO_SIF" ]; then
    echo "No $LO_SIF; skipping the PDF (build it with: apptainer build --fakeroot lo.sif lo.def)"
    exit 0
fi
type module >/dev/null 2>&1 && module load apptainer/1.4.1 >/dev/null 2>&1 || true
rm -rf render && mkdir -p render
apptainer exec "$LO_SIF" soffice --headless --convert-to pdf --outdir render "$DECK.pptx" >/dev/null 2>&1
apptainer exec "$LO_SIF" pdftoppm -jpeg -r "${DPI:-60}" "render/$DECK.pdf" render/slide
cp "render/$DECK.pdf" "$DECK.pdf"
echo "Wrote $DECK.pptx, $DECK.pdf and render/slide-*.jpg"
