#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT_DIR/apps/app-web/content/core"
mkdir -p "$DEST"

echo "Syncing portal docs into app content..."
# Mandalas principais (nível raiz)
rsync -a --include 'mandala-*.md' --exclude '*' "$ROOT_DIR/docs/" "$DEST/" || true

# Manual dos Agents (estrutura completa)
mkdir -p "$DEST/agents"
rsync -a "$ROOT_DIR/docs/agents/" "$DEST/agents/" || true

echo "Done. Files in $DEST (tree):"
find "$DEST" -maxdepth 3 -type f | sed -n '1,200p'
