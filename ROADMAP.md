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

### Fase 3 — Testing ✅

- [x] `pytest` + configuración de app de test
- [x] Tests de integración para endpoints:
	- [x] crear/listar/editar/eliminar
	- [x] casos negativos: `404`, payload inválido, etc.
- [x] Coverage como métrica orientativa (`>= 80%`).
- [x] Tests stratificados: smoke/api + repositories + services (49 tests, 87%)

### Fase 4 — Auth y multiusuario ✅

- [x] JWT (access token en `POST /auth/login` y `/auth/register`).
- [x] Endpoints:
	- [x] `POST /auth/register`
	- [x] `POST /auth/login`
	- [x] `POST /auth/refresh` (con rotación; frontend lo usa ante 401)
	- [x] `GET /auth/me`
- [x] Ownership: cada tarea pertenece a un usuario (`user_id`) y no se ven tareas ajenas.

### Fase 5 — Frontend ✅

- [x] Restructurar `frontend/src/` por capas: `api/`, `services/`, `ui/`, `pages/`.
- [x] Migrar a ES modules (`<script type="module">`).
- [x] Flujo auth en páginas separadas (`pages/login.html`, `pages/register.html`); eliminar modal inline.
- [x] Dividir `TaskManager` (313 líneas) en `TaskService` + `TaskForm` + `TaskList`.
- [x] Flask sirve estáticos desde `frontend/src/` (mismo origen).
- [x] DRY refactoring:
	- [x] `sw-register.js`: registro del service worker consolidado (antes 3x inline)
	- [x] `validations.js`: reglas compartidas para login/register
	- [x] `TaskForm` extiende `FormHandler` (eliminó reimplementación de 6+ patrones)
	- [x] `toast.js`: `scheduleDismiss()` extraído (animación duplicada)
	- [x] `ACCESS_KEY` centralizado en `base.js`
	- [x] 401 handling consolidado en `BaseAPI` (eliminado de `TaskService`)

### Fase 6 — Documentación de API y DX

- [ ] OpenAPI/Swagger (por ejemplo con Flask-Smorest).
- [x] Logs y trazabilidad:
	- [x] logging estructurado (JSON, por request)
	- [ ] `request_id` en logs/respuestas (opcional)

### Fase 6.5 — Refactor arquitectónico backend ✅

- [x] Smoke tests para endpoints críticos (F0)
- [x] Estructura de carpetas: `app/core/`, `app/repositories/`, `app/api/v1/presenters/` (F1)
- [x] Factory decomposition: `create_app()` limpio (F2)
- [x] Helpers/utils: `sorting.py` con `parse_sort()` (F3)
- [x] `transactional()` contextmanager para commit/rollback (F4)
- [x] `BaseRepository[T]` genérico con CRUD + sort (F4)
- [x] Services retornan ORM, no dict; eliminación de `to_dict()` (F5)
- [x] Presenters: `auth_presenter.py`, `tasks_presenter.py` (F5)
- [x] Rutas delegan serialización a presenters (F5)
- [x] `--cov-fail-under=80` activo en pytest (F5)
- [x] Migraciones Alembic movidas a `backend/migrations/` (F6)
- [x] `python-dotenv` + `load_dotenv()` (F6)
- [x] `RATELIMIT_STORAGE_URI`, `MAX_CONTENT_LENGTH` via env (F6)

### Fase 7 — Deploy y CI/CD ✅

- [x] Docker:
	- [x] `Dockerfile` (backend + frontend nginx)
	- [x] `docker-compose.yml` (app + Postgres para dev local)
	- [x] `docker-entrypoint.sh` (genera `env.js` y config de nginx en runtime)
- [x] Servidor WSGI (gunicorn) y config por entorno (`config.py`).
- [x] GitHub Actions:
	- [x] lint (`ruff check` + `ruff format --check`) en cada PR/push
	- [x] tests (`pytest` con coverage ≥80%)
- [x] Deploy público en Render:
	- [x] `baredo-api` (backend Flask + Gunicorn)
	- [x] `baredo` (frontend nginx + docker-entrypoint)
	- [x] CORS_ORIGINS configurado
	- [x] URL en README