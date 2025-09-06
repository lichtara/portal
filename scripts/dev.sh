#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "[dev] Ensuring dependencies are installed..."
if [ ! -d "$ROOT_DIR/node_modules" ]; then
  (cd "$ROOT_DIR" && npm ci)
fi
if [ ! -d "$ROOT_DIR/apps/app-web/node_modules" ]; then
  (cd "$ROOT_DIR" && npm ci -w apps/app-web)
fi
if [ ! -d "$ROOT_DIR/services/syntaris-harmony/node_modules" ]; then
  (cd "$ROOT_DIR" && npm ci -w services/syntaris-harmony)
fi

echo "[dev] Starting services..."
pids=()

(
  cd "$ROOT_DIR/services/syntaris-harmony"
  PORT="${PORT:-3000}" npm run dev
) &
pids+=("$!")

(
  cd "$ROOT_DIR/apps/app-web"
  VITE_SYNTARIS_DEV_TARGET="${VITE_SYNTARIS_DEV_TARGET:-http://localhost:3000}" npm run dev
) &
pids+=("$!")

cleanup() {
  echo "[dev] Shutting down..."
  kill "${pids[@]}" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

set +e
wait -n "${pids[@]}"
code=$?
echo "[dev] One process exited (code=$code). Stopping others..."
cleanup
exit "$code"

