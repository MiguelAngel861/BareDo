# BareDo

BareDo is a task manager built around the keyboard. Move through your list with `J` and `K`, create tasks with `C`, edit with `E`, delete with `D`, and search everything with `Ctrl+K`. Checking off a task removes it right away, before the server confirms. If the request fails, the app undoes the change on its own and shows a small alert.

Demo in production: [https://baredo.onrender.com](https://baredo.onrender.com)

## Screenshots

| **Task Detail** | **Command Palette** |
| --------------- | ------------------- |
| ![](screenshots/task-detail.png) | ![](screenshots/command-palette.png) |

| **Dashboard** |
| --------------- |
| ![](screenshots/dashboard.png) |

## Main features

- **Keyboard navigation**: `X` or Space to mark or unmark, `Enter` to open details, `?` for the shortcut guide.
- **Command Palette**: `Ctrl+K` (or `Cmd+K`) opens a search bar to find tasks, filter by priority or tags, or jump to a task by typing its title.
- **Instant updates**: the list updates before the server answers, and rolls back on failure.
- **Saved session**: if your connection drops, the app picks back up where you left off.

## Tech stack

- **Backend:** Python, Flask, SQLAlchemy, Pydantic, JWT, SQLite (development) / PostgreSQL (production).
- **Frontend:** Preact, Vite, TypeScript, Ky (HTTP client), Zod (schema validation).
- **Testing & Linters:** Pytest + Cov (Backend), Vitest + Testing Library (Frontend), Ruff (Python), Biome (TypeScript/CSS).
- **Package managers:** [uv](https://docs.astral.sh/uv/) (Python), [pnpm](https://pnpm.io/) (Node).

## Architecture

**Backend** (Flask, layered):
```
backend/app/
├── api/v1/        # HTTP routes (tasks, auth, tags, subtasks, priorities, health) and Pydantic schemas
├── services/      # Business logic; orchestrates repositories
├── repositories/  # Data access with SQLAlchemy (one base + one per domain)
├── models/        # Database models (users, tasks, subtasks, tags, priorities)
├── core/          # App factory, config, extensions, logging, CORS, pagination
├── errors/        # Centralized error handling (handlers, schemas, exceptions)
├── seeds/         # Initial data (priorities)
└── utils/         # Shared helpers (sorting)
```

**Frontend** (Preact, organized by slices):
```
frontend/src/
├── pages/        # Views: Landing, Home, Login, Register, 404
├── slices/       # One slice per domain: state (signals), api (ky), schemas (zod), types, and UI
└── shared/ui/    # Reusable components (Button, Modal, Dropdown, EmptyState)
```

## Prerequisites

| Tool | Version | Why |
|---|---|---|
| Python | 3.13+ | Backend requirement (`requires-python` in `backend/pyproject.toml`) |
| [uv](https://docs.astral.sh/uv/) | latest | Python dependencies and scripts |
| Node | 20 LTS or 22 | Frontend (Vite 6) |
| [pnpm](https://pnpm.io/) | 12.18.0 | Frontend package manager (pinned in `frontend/package.json`) |
| Docker | recent | Optional, for the Compose setup |

## Getting started

Get the code first:

```bash
git clone https://github.com/MiguelAngel861/BareDo.git
cd BareDo
```

BareDo has two parts that run at the same time: a **backend** (Python) and a **frontend** (the app in your browser). You'll need two terminal windows, one for each.

### 1. Backend

This server stores your tasks and handles logins. Install dependencies, copy the example env file, and start it:

```bash
cd backend
uv sync
cp .env.example .env   # edit values if needed
uv run python wsgi.py   # runs at http://localhost:5000
```

Keep this terminal open.

### 2. Frontend

This is what you interact with in the browser. Open a second terminal:

```bash
cd frontend
pnpm install
pnpm dev               # runs at http://localhost:3000
```

While developing, the frontend sends API calls to the backend through Vite's proxy, so you don't need to type the full backend address.

### Docker Compose

```bash
docker compose up --build
```

This starts everything at once: a Postgres database, the backend API, and the frontend. The backend runs its migrations automatically when it starts, so your schema is ready out of the box.

Here's what each service does:

- **db**: Postgres 16 database, available at `localhost:5432`.
- **api**: The Flask backend, available at `http://localhost:5000`.
- **frontend**: The Vite dev server, available at `http://localhost:3000`. It proxies API calls to the backend.

Stop everything with `docker compose down`.

## API

Base URL: `http://localhost:5000/api/v1` locally, `https://baredo-api.onrender.com/api/v1` in production.

The API documents itself. It is built on `flask-openapi4`: every route declares its input and output as Pydantic schemas, and those declarations generate an OpenAPI 3.1 spec. That means you can try the whole API from the browser without writing curl: open the Swagger UI at `http://localhost:5000/openapi/swagger`, or read the raw spec at `http://localhost:5000/openapi/openapi.json`. Everything except register, login, and health requires an `Authorization: Bearer <access_token>` header.

**Authentication**

Register and login return a token pair (access + refresh) and the user profile; login is rate-limited to 5 attempts per minute. `POST /auth/refresh` renews the pair with the refresh token, and `GET /auth/me` returns the profile of whoever owns the token.

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

**Tasks**

Lists your tasks with pagination and filters; `POST /tasks` creates one and `PUT`/`PATCH /tasks/<id>` update it fully or partially. Deleting is soft: `DELETE /tasks/<id>` moves the task to a trash, which you can list (`GET /tasks/trash`), empty (`DELETE /tasks/trash`), or undo (`POST /tasks/<id>/restore`). Only `DELETE /tasks/<id>/permanent` erases a task for good.

```bash
curl "http://localhost:5000/api/v1/tasks?page=1&per_page=5" \
  -H "Authorization: Bearer <access_token>"
```

Every task can also carry subtasks and tags, and belongs to a priority. Those domains live in their own route files and are covered in full detail by the Swagger docs: `/subtasks`, `/tags`, and `/priorities`.

## Testing

```bash
# Backend: pytest with coverage
cd backend && uv run pytest

# Frontend: Vitest + Testing Library
cd frontend && pnpm test:run
```

## Useful commands

| Command | What it does |
|---|---|
| `docker compose up --build` | Start database, backend, and frontend together |
| `docker compose down` | Stop and remove all services |
| `uv run python wsgi.py` | Start the local backend |
| `uv run pytest` | Run backend tests |
| `uv run ruff check && uv run ruff format` | Lint and format the backend |
| `pnpm dev` | Start the frontend with hot-reload |
| `pnpm build` | Build the frontend for production |
| `pnpm lint` | Run Biome lint on the frontend |

## Environment variables

**Backend**

| Variable | Description |
|---|---|
| `FLASK_ENV` | Flask environment (development or production) |
| `SECRET_KEY` | Key for signing Flask session cookies |
| `DATABASE_URL` | Database connection string |
| `JWT_SECRET_KEY` | Key for signing login tokens |
| `CORS_ORIGINS` | Allowed origins for cross-requests, comma-separated |

**Frontend**

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Address of the backend API |

## License

[MIT](LICENSE)
