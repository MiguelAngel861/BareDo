# BareDo

BareDo es una app minimalista de gestión de tareas construida con **Flask**.

## Tech Stack

- **Backend:** Python 3.13, Flask
- **Base de datos:** SQLite + SQLAlchemy (flask-sqlalchemy-lite)
- **Validación:** Pydantic
- **Frontend:** HTML, CSS y JavaScript (Vanilla)
- **Servidor de producción:** Gunicorn
- **Gestión de entorno/dependencias:** uv

## Primeros pasos

### Prerrequisitos

- Python 3.13+
- [uv](https://docs.astral.sh/uv/)
- Git

### Instalación

```bash
git clone https://github.com/MiguelAngel861/BareDo.git
cd BareDo/backend
uv sync
```

### Ejecutar en desarrollo

```bash
uv run python run.py
```

La aplicación quedará disponible en `http://127.0.0.1:5000`.

## Uso

### Endpoints principales (API v1)

- `GET /api/v1/tasks`
- `GET /api/v1/tasks/<id>`
- `POST /api/v1/tasks`
- `PUT /api/v1/tasks/<id>`
- `PATCH /api/v1/tasks/<id>`
- `DELETE /api/v1/tasks/<id>`

### Ejemplos con curl

Crear tarea:

```bash
curl -X POST http://127.0.0.1:5000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Aprender Flask",
    "description": "Repasar Blueprints y validación",
    "priority": "medium",
    "completed": false
  }'
```

Listar tareas:

```bash
curl "http://127.0.0.1:5000/api/v1/tasks?page=1&per_page=10"
```

Actualizar parcialmente una tarea:

```bash
curl -X PATCH http://127.0.0.1:5000/api/v1/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

Eliminar una tarea:

```bash
curl -X DELETE http://127.0.0.1:5000/api/v1/tasks/1
```

## Licencia

[MIT](https://mit-license.org/)
