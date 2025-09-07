#!/usr/bin/env bash
set -euo pipefail

# Mata processos antigos nas portas usuais
pkill -f "node.*3000" 2>/dev/null || true
pkill -f "vite.*5173" 2>/dev/null || true

# Sobe serviço
( npm run dev -w services/syntaris-harmony >/tmp/svc.log 2>&1 & )

# Sobe app
( npm run dev -w apps/app-web >/tmp/app.log 2>&1 & )

echo "[*] Logs:"
echo "  Serviço: tail -f /tmp/svc.log"
echo "  App    : tail -f /tmp/app.log"

