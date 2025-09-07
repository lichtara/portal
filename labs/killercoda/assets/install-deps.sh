#!/usr/bin/env bash
set -euo pipefail

# Instalação na raiz (respeitando workspaces)
if [ -f package-lock.json ]; then
  npm ci
fi

# Garantir deps nos pacotes (caso lock por workspace seja separado)
[ -f services/syntaris-harmony/package.json ] && npm ci -w services/syntaris-harmony || true
[ -f apps/app-web/package.json ] && npm ci -w apps/app-web || true

