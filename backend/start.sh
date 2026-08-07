#!/bin/sh
set -e

flask --app wsgi:app db upgrade head

exec gunicorn wsgi:app --bind 0.0.0.0:${PORT:-8000} --workers 2
