#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT_DIR/apps/app-web/content/core"
mkdir -p "$DEST"

echo "Syncing portal docs (mandala-*.md) into app content..."
rsync -a --include 'mandala-*.md' --exclude '*' "$ROOT_DIR/docs/" "$DEST/" || true
echo "Done. Files in $DEST:"
ls -1 "$DEST" | sed -n '1,200p'

