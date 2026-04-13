#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AI_DIR="$ROOT_DIR/ai-service"
FE_DIR="$ROOT_DIR/frontend"

if [[ ! -d "$AI_DIR/.venv" ]]; then
  echo "[dev] Creating ai-service virtualenv"
  python3 -m venv "$AI_DIR/.venv"
fi

echo "[dev] Starting FastAPI on :8000"
(
  cd "$AI_DIR"
  source .venv/bin/activate
  pip install -q -r requirements.txt
  uvicorn service:app --host 0.0.0.0 --port 8000 --reload
) &
AI_PID=$!

echo "[dev] Starting Next.js on :3000"
(
  cd "$FE_DIR"
  bun install >/dev/null
  bun dev
) &
FE_PID=$!

cleanup() {
  echo "\n[dev] Stopping services..."
  kill "$AI_PID" "$FE_PID" 2>/dev/null || true
}

trap cleanup EXIT INT TERM
wait "$AI_PID" "$FE_PID"
