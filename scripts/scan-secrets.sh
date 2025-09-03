#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BIN_DIR="$ROOT_DIR/.bin"

if ! command -v gitleaks >/dev/null 2>&1; then
  echo "Installing gitleaks locally..." >&2
  mkdir -p "$BIN_DIR"
  curl -sSfL https://raw.githubusercontent.com/gitleaks/gitleaks/master/install.sh | bash -s -- -b "$BIN_DIR"
  export PATH="$BIN_DIR:$PATH"
fi

echo "Running gitleaks with .gitleaks.toml..."
gitleaks detect --redact --source "$ROOT_DIR" --config "$ROOT_DIR/.gitleaks.toml"

