#!/bin/bash
# Start Cloud SQL proxy + Next.js dev server for SmartCommission local development.
# Run from the repo root (not apps/web): the proxy is started here, then dev starts in apps/web.
# Prerequisites: cloud-sql-proxy installed, gcloud auth application-default login
# apps/web/.env.local must have: DATABASE_URL=postgresql://...@127.0.0.1:5433/smartcommission
set -euo pipefail
CONN="prakash-shared:australia-southeast1:shared-db-sydney"
PORT=5433
echo "[dev] Starting Cloud SQL proxy on port $PORT..."
cloud-sql-proxy --port "$PORT" "$CONN" &
PROXY_PID=$!
trap 'kill "$PROXY_PID" 2>/dev/null; wait "$PROXY_PID" 2>/dev/null; echo "[dev] Proxy stopped."' EXIT INT TERM
sleep 2
echo "[dev] Starting Next.js dev server..."
npm run dev
