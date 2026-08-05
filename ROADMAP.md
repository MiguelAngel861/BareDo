## Plan de mejoras (Roadmap para portfolio)

La idea es iterar por fases. Cada fase deja el proyecto en un estado “presentable” y demostrable.

### Fase 0 — Base sólida ✅

- [x] Completar README con:
	- [x] Instalación y ejecución
	- [x] Ejemplos `curl`
	- [x] Descripción de decisiones técnicas (stack y estructura)
- [x] Normalizar respuestas y errores (JSON consistente):
	- [x] `{"error": {"code": "...", "message": "...", "details": ...}}`
	- [x] Usar `404` para no encontrado, `400` para payload inválido.
- [x] Revisar códigos HTTP:
	- [x] `POST` devuelve `201`
	- [x] `DELETE` idealmente `204 No Content`
- [x] Estándares de estilo:
	- [x] lint (`ruff`)
	- [x] format

### Fase 1 — API REST “de verdad” ✅

- [x] Versionado: `GET /api/v1/tasks`.
- [x] Mejorar diseño de endpoints:
	- [x] `GET /tasks/<id>` (detalle)
	- [x] `PATCH /tasks/<id>` (updates parciales)
- [x] Paginación y filtros en `GET /tasks`:
	- [x] `?page=1&per_page=20`
	- [x] `?completed=true`
	- [x] `?title=...` (búsqueda parcial por título)
- [x] Ordenación: `?sort=-created_at,title`
- [x] Validación con `pydantic`:
	- [x] esquemas de request/response
	- [x] respuestas de error detalladas cuando falle validación

### Fase 2 — Persistencia pro ✅

- [x] Migraciones (Alembic):
	- [x] crear/actualizar tablas sin borrar la DB (`flask-alembic`, migración inicial)
- [x] Campos típicos de producción:
	- [x] `updated_at`
	- [x] `due_date`
	- [x] `priority`
- [x] Índices donde tenga sentido (`completed`, `created_at`).

### Fase 3 — Testing

> Suite `pytest` implementada y ejecutada, luego **removida por decisión** (2026-08).
> Re-implementar si el proyecto vuelve a necesitar red de seguridad automática.

- [ ] `pytest` + configuración de app de test
- [ ] Tests de integración para endpoints:
	- [ ] crear/listar/editar/eliminar
	- [ ] casos negativos: `404`, payload inválido, etc.
- [ ] Coverage como métrica orientativa (`>= 80%`).

### Fase 4 — Auth y multiusuario ✅

- [x] JWT (access token en `POST /auth/login` y `/auth/register`).
- [x] Endpoints:
	- [x] `POST /auth/register`
	- [x] `POST /auth/login`
	- [x] `POST /auth/refresh` (con rotación; frontend lo usa ante 401)
	- [x] `GET /auth/me`
- [x] Ownership: cada tarea pertenece a un usuario (`user_id`) y no se ven tareas ajenas.

### Fase 5 — Frontend (nueva)

- [x] Restructurar `frontend/src/` por capas: `api/`, `services/`, `ui/`, `pages/`.
- [x] Migrar a ES modules (`<script type="module">`).
- [x] Flujo auth en páginas separadas (`pages/login.html`, `pages/register.html`); eliminar modal inline.
- [x] Dividir `TaskManager` (313 líneas) en `TaskService` + `TaskForm` + `TaskList`.
- [x] Flask sirve estáticos desde `frontend/src/` (mismo origen).

### Fase 6 — Documentación de API y DX

- [ ] OpenAPI/Swagger (por ejemplo con Flask-Smorest).
- [x] Logs y trazabilidad:
	- [x] logging estructurado (JSON, por request)
	- [ ] `request_id` en logs/respuestas (opcional)

### Fase 7 — Deploy y CI/CD

- [ ] Docker:
	- [ ] `Dockerfile`
	- [ ] `docker-compose.yml` (app + Postgres)
- [x] Servidor WSGI (gunicorn) y config por entorno (`config.py`).
- [ ] GitHub Actions:
	- [ ] lint + build en cada PR/push
	- [ ] tests (si se re-implementa Fase 3)
- [x] Deploy público (Render/Fly.io/Railway) + URL en README.