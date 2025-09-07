#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${PORT:-3000}"

echo "[dev] Starting services…"
trap 'echo "[dev] Shutting down…"; kill 0' EXIT

# Start Syntaris (backend)
(
  cd "$ROOT_DIR"
  PORT="$PORT" npm run dev -w services/syntaris-harmony
) &

# Start app-web (frontend)
(
  cd "$ROOT_DIR"
  VITE_SYNTARIS_DEV_TARGET="http://localhost:$PORT" npm run dev -w apps/app-web
) &

wait

