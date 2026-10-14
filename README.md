# BareDo: High-Speed, Keyboard-Driven Productivity Client for Developers

[![Backend CI](https://img.shields.io/badge/backend-Flask%20%7C%20Pytest%20(101%20passed)-15803d?style=flat-square&logo=python)](https://github.com/MiguelAngel861/BareDo)
[![Frontend CI](https://img.shields.io/badge/frontend-Preact%20%7C%20Vitest%20(69%20passed)-15803d?style=flat-square&logo=typescript)](https://github.com/MiguelAngel861/BareDo)
[![Code Style](https://img.shields.io/badge/code%20style-Ruff%20%26%20Biome-black?style=flat-square)](https://github.com/MiguelAngel861/BareDo)
[![Architecture](https://img.shields.io/badge/architecture-Signals%20%2B%20Optimistic%20UI-blueviolet?style=flat-square)](https://github.com/MiguelAngel861/BareDo)

Cliente de productividad ultrarrápido diseñado específicamente para desarrolladores que buscan flujo continuo sin tocar el mouse. Construido con arquitectura reactiva en `@preact/signals`, **Optimistic UI a 0ms de latencia**, navegación completa estilo **Vim**, **Command Palette** global (`Ctrl+K`) y una API REST desacoplada en capas bajo Python y Flask.

**Demo en Producción:** [https://baredo.onrender.com](https://baredo.onrender.com)

---

## ⚡ Características Principales para Desarrolladores

**⌨️ Navegación 100% por Teclado (Vim-Style):**

| Tecla | Acción |
|---|---|
| `J` / `K` o `↓` / `↑` | Desplazamiento circular entre tareas con indicador visual de alto contraste |
| `X` o `Espacio` | Marcado/desmarcado con **Optimistic UI** inmediata |
| `Enter` | Apertura de vista detallada en modal pop-out |
| `E` | Edición rápida de la tarea enfocada |
| `D` | Eliminación instantánea con diálogo de confirmación |
| `C` | Creación rápida de nueva tarea |
| `?` | Guía interactiva de atajos de teclado (`ShortcutHelpModal`) |
- **🚀 Command Palette Global (`Ctrl + K` / `Cmd + K`):**
  - Paleta de comandos interactiva con búsqueda difusa (*fuzzy text filter*).
  - Acciones rápidas del sistema (crear tarea, resetear filtros, filtrar completadas/pendientes).
  - Filtros directos por prioridad y etiquetas (`#tags`).
  - Salto directo a tareas por título con selección por teclado.
- **⚡ Optimistic UI con Rollback Automático:**
  - Actualizaciones reactivas a **0ms** en el estado local de la interfaz.
  - Reversión transparente (*rollback*) y notificación de error contextual (*toast*) ante fallos de red o base de datos.
- **🛡️ Arquitectura y Resiliencia en Frío:**
  - Tolerancia a cold starts en hosting serverless/gratuito mediante overlay táctil de telemetría y sondeo proactivo (`ServerWarmupOverlay`).
  - Preservación de sesión en memoria y auto-recuperación transparente ante errores temporales de red.

---

## Stack Tecnológico

- **Backend:** Python 3.13+, Flask, SQLAlchemy 2, Pydantic, JWT (`flask-jwt-extended`), SQLite (dev) / PostgreSQL (prod).
- **Frontend:** Preact, `@preact/signals`, Vite, TypeScript estricto, Ky (cliente HTTP con reintentos), Zod (validación de esquemas en tiempo de ejecución).
- **Testing & Linters:** Pytest + Cov (Backend, 101 tests), Vitest + Testing Library (Frontend, 69 tests), Ruff (Python), Biome (TypeScript/CSS).
- **Gestores de Paquetes:** [uv](https://docs.astral.sh/uv/) (Python ultra-rápido), [pnpm](https://pnpm.io/) (Node.js optimizado).

---

## Arquitectura del Sistema

```
Navegador (Preact + Signals + Optimistic UI)
    ├── /api/v1/*  ──► Flask API en Capas (Gunicorn + SQLAlchemy) ──► PostgreSQL / SQLite
    └── /*          ──► Static Site (Vite Single Page Client en CDN)
```

- En desarrollo, el frontend usa el proxy de Vite para hablar a `/api/v1`.
- En producción (Render), el frontend es un Static Site y habla directamente al backend vía URL completa.

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

Levanta: `db` (Postgres 16 en `localhost:5433`) y `api` (`http://localhost:5000`, hot-reload). El backend corre las migraciones al arrancar. El frontend se ejecuta por separado con `pnpm dev`.

## Despliegue (Render)

Blueprint via `render.yaml`: Web Service `baredo-api` (Flask + gunicorn, migraciones en start.sh), Static Site `baredo` (build de Vite servido en CDN) y Postgres gestionado. Los secretos `SECRET_KEY` y `JWT_SECRET_KEY` se definen en el dashboard de Render.

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
# Backend (101 tests, coverage ≥ 80%)
cd backend && uv run pytest

# Frontend (69 tests con Vitest + Testing Library)
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
| `VITE_API_BASE_URL` | `/api/v1` | Base URL de la API (relativa en dev, absoluta en prod) |
