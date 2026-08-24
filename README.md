# BareDo

API REST + frontend para gestión de tareas. Backend en Python/Flask en capas (`app/{api,services,repositories,...}`), frontend en TypeScript vanilla con Vite, servido por nginx como reverse proxy.

**Demo:** https://baredo.onrender.com

## Stack

- **Backend:** Python 3.13+, Flask, SQLAlchemy 2, Pydantic, JWT (flask-jwt-extended), SQLite (dev) / Postgres (prod)
- **Frontend:** TypeScript (ES modules), Vite, ky (HTTP), Zod (validación de respuestas)
- **Estilo/lint:** ruff (backend), Biome (frontend)
- **Gestores:** [uv](https://docs.astral.sh/uv/) (Python), [pnpm](https://pnpm.io/) (Node)

## Arquitectura

```
Navegador ──► nginx ──┬── /api/* ──► Flask API (gunicorn)
                      └── /*          archivos estáticos (Vite build)
```

- El frontend habla siempre a `/api/v1` (mismo origen); nginx hace proxy al backend vía `BACKEND_URL`.
- CORS permanece en el backend como feature opcional (p. ej. desarrollo sin proxy).

## Instalación

```bash
git clone https://github.com/MiguelAngel861/BareDo.git
cd BareDo

# Backend
cd backend
uv sync
cp .env.example .env   # editar valores si hace falta

# Frontend
cd ../frontend
pnpm install
cp .env.example .env   # opcional: VITE_API_BASE_URL=/api/v1
```

## Uso (desarrollo)

Terminal 1 — backend en `http://localhost:5000`:

```bash
cd backend && uv run python wsgi.py
```

Terminal 2 — frontend con hot-reload en `http://localhost:3000` (proxía `/api` al backend):

```bash
cd frontend && pnpm dev
```

## Uso con Docker Compose (dev, Postgres incluido)

```bash
docker compose up --build
```

Levanta: `db` (Postgres 16 en `localhost:5433`), `api` (`http://localhost:5000`, hot-reload) y `web` (nginx + reverse proxy en `http://localhost:8080`, `BACKEND_URL=http://api:5000`). El backend corre las migraciones al arrancar.

## Despliegue (Render)

Blueprint via `render.yaml`: Web Service `baredo-api` (Flask + gunicorn, migraciones en start.sh), Web Service `baredo` (nginx sirviendo el build de Vite y proxyeando `/api` a `https://baredo-api.onrender.com`) y Postgres gestionado. Los secretos `SECRET_KEY` y `JWT_SECRET_KEY` se definen en el dashboard de Render.

## API

Base URL local: `http://localhost:5000/api/v1` · producción: `https://baredo-api.onrender.com/api/v1`

### 1. Registro de usuario

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"miguel","password":"Password123"}'
```

### 2. Login y obtener token

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"miguel","password":"Password123"}'
```

### 3. Listar tareas (con token)

```bash
curl "http://localhost:5000/api/v1/tasks?page=1&per_page=5" \
  -H "Authorization: Bearer <access_token>"
```

Endpoints disponibles: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me`, `GET/POST /tasks`, `GET/PUT/PATCH/DELETE /tasks/<id>`, `GET /health`.

## Testing

```bash
# Backend (59 tests, coverage ≥ 80%)
cd backend && uv run pytest

# Frontend
cd frontend && pnpm test:run
```

## Comandos útiles

| Comando | Descripción |
|---|---|
| `uv run python wsgi.py` | Levantar backend local |
| `uv run pytest` | Tests del backend |
| `uv run ruff check && uv run ruff format` | Lint + format backend |
| `pnpm dev` | Frontend con hot-reload (puerto 3000) |
| `pnpm build` | Build de producción del frontend |
| `pnpm lint` | Lint frontend (Biome) |

## Variables de entorno

### Backend

| Variable | Default | Descripción |
|---|---|---|
| `FLASK_ENV` | `development` | Entorno de Flask |
| `DEBUG` | `false` | Modo debug |
| `SECRET_KEY` | dev | Clave de sesión de Flask |
| `DATABASE_URL` | `sqlite:///backend/instance/db.sqlite` | Conexión a BD (`postgres://` y `postgresql://` se normalizan a `postgresql+psycopg://`) |
| `JWT_SECRET_KEY` | dev | Clave para firmar tokens JWT |
| `CORS_ORIGINS` | localhost dev | Orígenes CORS permitidos (csv, opcional si se usa reverse proxy) |

### Frontend

| Variable | Default | Descripción |
|---|---|---|
| `VITE_API_BASE_URL` | `/api/v1` | Base URL de la API (relativa = pasa por el proxy) |
| `BACKEND_URL` | — | Solo contenedor web: destino del reverse proxy de nginx (ej. `http://api:5000`) |
