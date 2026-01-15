# BareDo

Gestor de tareas **RESTful** construido con **Python + Flask**. Este repositorio está pensado como proyecto de portfolio: prioriza buenas prácticas, calidad de API, testing y despliegue.

## Estado actual (MVP)

- CRUD básico de tareas.
- Endpoints:
	- `GET /tasks`
	- `POST /tasks`
	- `PUT /tasks/<id>`
	- `DELETE /tasks/<id>`

## Stack

- Flask
- `flask-sqlalchemy-lite` (SQLAlchemy)
- `flask-pydantic` (validación)

## Plan de mejoras (Roadmap para portfolio)

La idea es iterar por fases. Cada fase deja el proyecto en un estado “presentable” y demostrable.

### Fase 0 — Base sólida (1–2 días)

- [ ] Completar este README con:
	- [ ] Instalación y ejecución
	- [ ] Ejemplos `curl`
	- [ ] Descripción de decisiones técnicas
- [ ] Normalizar respuestas y errores (JSON consistente):
	- [ ] `{"error": {"code": "...", "message": "...", "details": ...}}`
	- [ ] Usar `404` para no encontrado, `400/422` para payload inválido.
- [ ] Revisar códigos HTTP:
	- [ ] `POST` devuelve `201`
	- [ ] `DELETE` idealmente `204 No Content`
- [ ] Estándares de estilo:
	- [ ] `ruff` (lint)
	- [ ] `black` (format)

### Fase 1 — API REST “de verdad” (2–4 días)

- [ ] Versionado: `GET /api/v1/tasks` (mantener compatibilidad con `/tasks` si quieres).
- [ ] Mejorar diseño de endpoints:
	- [ ] `GET /tasks/<id>` (detalle)
	- [ ] `PATCH /tasks/<id>` (updates parciales)
- [ ] Paginación y filtros en `GET /tasks`:
	- [ ] `?page=1&page_size=20`
	- [ ] `?realizada=true`
	- [ ] `?search=...` (por título/descripcion)
- [ ] Ordenación: `?sort=-fecha_creacion,titulo`
- [ ] Validación con `flask-pydantic`:
	- [ ] esquemas de request/response
	- [ ] respuestas de error detalladas cuando falle validación

### Fase 2 — Persistencia pro (2–3 días)

- [ ] Migraciones (Alembic):
	- [ ] crear/actualizar tablas sin borrar la DB
- [ ] Campos típicos de producción:
	- [ ] `updated_at`
	- [ ] `due_date` (opcional)
	- [ ] `priority` (enum simple: low/medium/high)
- [ ] Índices donde tenga sentido (`realizada`, `fecha_creacion`, etc.).

### Fase 3 — Testing (3–5 días)

Esto suele ser lo que más “eleva” un proyecto junior.

- [ ] `pytest` + configuración de app de test
- [ ] Tests de integración para endpoints:
	- [ ] crear/listar/editar/eliminar
	- [ ] casos negativos: `404`, payload inválido, etc.
- [ ] Coverage como métrica orientativa (por ejemplo, `>= 80%`).

### Fase 4 — Auth y multiusuario (3–6 días)

Si quieres subir el nivel, añade autenticación.

- [ ] JWT (access/refresh) o sesión
- [ ] Endpoints:
	- [ ] `POST /auth/register`
	- [ ] `POST /auth/login`
	- [ ] `POST /auth/refresh`
- [ ] Ownership: cada tarea pertenece a un usuario (`user_id`) y no se ven tareas ajenas.

### Fase 5 — Documentación de API y DX (2–4 días)

- [ ] OpenAPI/Swagger (por ejemplo con Flask-Smorest) o documentación Markdown completa.
- [ ] Colección de Postman/Insomnia.
- [ ] Logs y trazabilidad:
	- [ ] logging consistente
	- [ ] `request_id` en logs/respuestas (opcional)

### Fase 6 — Deploy y CI/CD (2–4 días)

- [ ] Docker:
	- [ ] `Dockerfile`
	- [ ] `docker-compose.yml` (app + Postgres)
- [ ] Servidor WSGI (gunicorn) y config por entorno.
- [ ] GitHub Actions:
	- [ ] lint + tests en cada PR/push
- [ ] Deploy público (Render/Fly.io/Railway) + URL en este README.

## Instalación (local)

> Nota: revisa la versión requerida de Python en `pyproject.toml`.

1) Crear entorno virtual

```bash
python -m venv .venv
source .venv/bin/activate
```

2) Instalar dependencias

```bash
pip install -e .
```

3) Ejecutar

```bash
python run.py
```

## Ejemplos (cURL)

Crear tarea:

```bash
curl -X POST http://localhost:5000/tasks \
	-H 'Content-Type: application/json' \
	-d '{"titulo": "Aprender Flask", "descripcion": "Hacer un CRUD REST"}'
```

Listar tareas:

```bash
curl http://localhost:5000/tasks
```

Marcar como realizada (actual):

```bash
curl -X PUT http://localhost:5000/tasks/1 \
	-H 'Content-Type: application/json' \
	-d '{"realizada": true}'
```

## Próximos pasos sugeridos (rápidos)

Si quieres el mayor impacto en menos tiempo:

1) Añadir tests con `pytest`.
2) Documentar API (OpenAPI o al menos ejemplos claros).
3) Docker + deploy público.
