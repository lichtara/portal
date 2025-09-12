#!/usr/bin/env bash
set -euo pipefail

if ! command -v gh >/dev/null 2>&1; then
  echo "gh (GitHub CLI) não encontrado. Instale em https://cli.github.com/" >&2
  exit 1
fi

REGION=${1:-sa-east1}
SERVICE=${2:-lumora}

echo "Disparando workflow de release para Cloud Run: serviço=$SERVICE região=$REGION"
gh workflow run lumora-release.yml -f region="$REGION" -f service_name="$SERVICE"
echo "Workflow acionado. Acompanhe em: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/actions"

