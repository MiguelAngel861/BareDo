#!/bin/sh
set -e

python -m flask --app wsgi:app db upgrade head

exec gunicorn wsgi:app --bind 0.0.0.0:${PORT:-5000} --workers 1
