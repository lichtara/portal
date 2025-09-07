#!/usr/bin/env bash
set -euo pipefail

# 1) Node 20 via NVM
bash assets/setup-nvm-node.sh

# 2) Instalar dependências
bash assets/install-deps.sh

# 3) Subir serviços
bash assets/start-services.sh

# 4) Smoke
sleep 3
( curl -sf http://127.0.0.1:3000/health || curl -sf http://127.0.0.1:3000/healthz ) && echo "[OK] service health"
curl -sf http://127.0.0.1:5173/api/syntaris/healthz && echo "[OK] vite proxy"

