#!/bin/sh
set -e

export API_BASE_URL="${API_BASE_URL:-http://localhost:5000/api/v1}"

envsubst '${API_BASE_URL}' < /etc/nginx/env.js.template > /usr/share/nginx/html/env.js

exec "$@"
