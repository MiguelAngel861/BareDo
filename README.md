# BareDo

A fast, keyboard-driven productivity client. Manage your tasks without touching the mouse — navigate with Vim-style keys, open the Command Palette with `Ctrl+K`, and mark items complete with instant feedback. The interface updates at 0ms using reactive signals, so there is no waiting on the server for simple actions.

Demo in production: [https://baredo.onrender.com](https://baredo.onrender.com)

## Screenshots

Aún no hay capturas. Para agregarlas:

1. Guarda tus imágenes en la carpeta `screenshots/` en la raíz del repo.
2. Reemplaza `nombre-del-archivo.png` por el nombre real de cada imagen.
3. Quita los marcadores `<!--` y `-->` de los bloques que quieras mostrar.

<!--
![Tablero principal de tareas](screenshots/dashboard.png)
*Vista principal del tablero. Navegación con J/K, marca con X o Space, crea con C.*

![Command Palette abierta](screenshots/command-palette.png)
*La paleta de comandos se abre con Ctrl+K y permite buscar tareas y acciones.*

![Modal de detalle de tarea](screenshots/task-detail.png)
*Al pulsar Enter se abre el detalle de la tarea en un modal pop-out.*
-->

## What it does

BareDo is a task manager built around the keyboard. You can move through your list with `J` and `K`, create tasks with `C`, edit with `E`, delete with `D`, and search everything with `Ctrl+K`. There are no loading spinners or artificial delays — when you check off a task, it disappears immediately. If something goes wrong on the server, the app rolls back the change and shows you a toast message.

It works for anyone who wants to get things done quickly, not just developers.

## Main features

- **Keyboard navigation (Vim-style)** — `J`/`K` to move between tasks, `X` or Space to mark/unmark, `Enter` to open details, `E` to edit, `D` to delete, `C` to create, `?` for the shortcut guide.
- **Command Palette** — `Ctrl+K` / `Cmd+K` opens a fuzzy-searchable palette with system actions, filters by priority and tags, and direct jumps to tasks by title.
- **Optimistic UI with automatic rollback** — Changes appear instantly in the interface. On network or database failure, the change rolls back and an error toast is shown.

## Tech stack

- **Backend:** Python, Flask, SQLAlchemy, Pydantic, JWT, SQLite / PostgreSQL.
- **Frontend:** Preact, Vite, TypeScript, Ky (HTTP client), Zod (schema validation).
- **Testing & Linters:** Pytest + Cov (Backend), Vitest + Testing Library (Frontend), Ruff (Python), Biome (TypeScript/CSS).
- **Package managers:** [uv](https://docs.astral.sh/uv/) (Python), [pnpm](https://pnpm.io/) (Node).

## Getting started

```bash
git clone https://github.com/MiguelAngel861/BareDo.git
cd BareDo
```

**Backend**

```bash
cd backend
uv sync
cp .env.example .env   # edit values if needed
uv run python wsgi.py   # runs at http://localhost:5000
```

**Frontend**

```bash
cd frontend
pnpm install
cp .env.example .env   # optional: VITE_API_BASE_URL=/api/v1
pnpm dev               # runs at http://localhost:3000
```

The frontend proxies `/api` to the backend in development.

### Docker Compose

```bash
docker compose up --build
```

This starts `db` (Postgres 16 at `localhost:5432`) and `api` (`http://localhost:5000`, hot-reload). Backend migrations run on startup. The frontend still runs separately with `pnpm dev`.

In production, the frontend is a static site served on a CDN, talking directly to the backend. In development, Vite's proxy handles the API calls.

## API

Base URL: `http://localhost:5000/api/v1` locally, `https://baredo-api.onrender.com/api/v1` in production.

**Authentication**

```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"miguel","password":"Password123"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"miguel","password":"Password123"}'
```

**Tasks** (include `Authorization: Bearer <access_token>`)

```bash
curl "http://localhost:5000/api/v1/tasks?page=1&per_page=5" \
  -H "Authorization: Bearer <access_token>"
```

Available endpoints: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me`, `GET/POST /tasks`, `GET/PUT/PATCH/DELETE /tasks/<id>`, `GET /health`.

## Testing

```bash
# Backend (101 tests, coverage ≥ 80%)
cd backend && uv run pytest

# Frontend (69 tests with Vitest + Testing Library)
cd frontend && pnpm test:run
```

## Useful commands

| Command | What it does |
|---|---|
| `uv run python wsgi.py` | Start the local backend |
| `uv run pytest` | Run backend tests |
| `uv run ruff check && uv run ruff format` | Lint and format the backend |
| `pnpm dev` | Start the frontend with hot-reload (port 3000) |
| `pnpm build` | Build the frontend for production |
| `pnpm lint` | Run Biome lint on the frontend |

## Environment variables

**Backend**

| Variable | Default | Description |
|---|---|---|
| `FLASK_ENV` | `development` | Flask environment |
| `DEBUG` | `false` | Debug mode |
| `SECRET_KEY` | dev | Flask session key |
| `DATABASE_URL` | `sqlite:///backend/instance/db.sqlite` | Database connection (`postgres://` and `postgresql://` are normalized to `postgresql+psycopg://`) |
| `JWT_SECRET_KEY` | dev | JWT signing key |
| `CORS_ORIGINS` | localhost dev | Allowed CORS origins (comma-separated, optional when using a reverse proxy) |

**Frontend**

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `/api/v1` | API base URL (relative in development, absolute in production) |

## License

[MIT](LICENSE)