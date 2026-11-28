#!/bin/sh
# Inicia backend y frontend para tests e2e (CI y local).
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Backend en puerto 5000
cd "$ROOT_DIR/backend"
DATABASE_URL= \
  FLASK_ENV=development \
  SECRET_KEY=dev-secret-key-change-me \
  JWT_SECRET_KEY=dev-jwt-secret-key-change-me \
  CORS_ORIGINS=http://localhost:3000 \
  RATELIMIT_STORAGE_URI=memory:// \
  uv run python wsgi.py &
BACKEND_PID=$!

# Frontend en puerto 3000
cd "$ROOT_DIR/frontend"
pnpm dev &
FRONTEND_PID=$!

# Esperar a que ambos terminen (uno fallando detiene al otro)
wait -n
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
