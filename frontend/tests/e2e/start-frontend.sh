#!/bin/bash
# Kill stale vite on port 5173, wait for port to be free, start fresh
set -euo pipefail

pkill -9 -f '[v]ite.*5173' 2>/dev/null || true
for i in $(seq 1 40); do
  grep -q ':1435 00000000:0000 0A' /proc/net/tcp 2>/dev/null || break
  sleep 0.25
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
cd "${FRONTEND_DIR}"
exec npx vite dev --port 5173 --strictPort --host 127.0.0.1
