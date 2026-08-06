# BareDo

API REST + frontend para gestión de tareas. Backend en Python/Flask, frontend en HTML/CSS/JS vanilla servido por el propio backend.

## Stack

- **Backend:** Python 3.13+, Flask, SQLAlchemy, Pydantic, JWT, SQLite
- **Frontend:** HTML + CSS + JS (ES modules), sin build step
- **Gestor de dependencias:** [uv](https://docs.astral.sh/uv/)

## Instalación

```bash
git clone https://github.com/MiguelAngel861/BareDo.git
cd BareDo/backend
uv sync
cp .env.example .env   # editar valores si hace falta
```

## Uso

```bash
uv run python run.py
```

Abre `http://localhost:5000/` — redirige a login si no estás autenticado.

## API

Base URL: `http://localhost:5000/api/v1`

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
curl http://localhost:5000/api/v1/tasks \
  -H "Authorization: Bearer <access_token>"
```

## Comandos útiles

| Comando | Descripción |
|---|---|
| `uv run python run.py` | Levantar servidor local |
| `uv run ruff check` | Lint del código Python |

## Variables de entorno

| Variable | Default | Descripción |
|---|---|---|
| `FLASK_ENV` | `development` | Entorno de Flask |
| `DEBUG` | `false` | Modo debug |
| `DATABASE_URL` | `sqlite:///backend/instance/db.sqlite` | Conexión a BD |
| `JWT_SECRET_KEY` | dev | Clave para firmar tokens |