#!/bin/sh
set -e

export PORT="${PORT:-80}"
export API_BASE_URL="${API_BASE_URL:-http://localhost:5000/api/v1}"

envsubst '${API_BASE_URL}' < /etc/nginx/env.js.template > /usr/share/nginx/html/env.js
envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf

exec "$@"
