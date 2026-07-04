# Plan de Implementacion — BareDo

**Fecha inicio:** 2026-07-04
**Arquitectura:** Option 2 — SPA embedded en Flask
**Objetivo:** Backend production-ready con frontend integrado

---

## Estado Actual del Codigo

### Bugs Activos Detectados

| Ubicacion | Bug | Severidad |
|---|---|---|
| `tasks_repository.py:89` | `task_status in (True, False)` — variable no definida (NameError) | CRIT |
| `tasks.py:51` | `TaskResponse` usado pero no importado | CRIT |
| `tasks.py:53` | `TaskResponse.model_validate(validated_data)` — `validated_data` ya es TaskResponse | HIGH |
| `tasks.py:70` | POST sin catch de `ValidationError` — falla en 500 | CRIT |
| `tasks.py:83` | PUT sin catch de `ValidationError` — falla en 500 | CRIT |
| `tasks.py:94` | PATCH sin catch de `ValidationError` — falla en 500 | CRIT |
| `run.py:6` | `debug=True` hardcoded | MED |
| `__init__.py:20` | `Base.metadata.create_all()` en startup | MED |

### Lo Que Ya Funciona

- Repository: conteo antes de paginacion (CRIT-001)
- Service: total_pages con per_page correcto (CRIT-002)
- GET /tasks: status 200 (HIGH-008)
- PATCH: exclude_unset=True (CRIT-003)
- Query params: validacion de page/per_page (MED-012)
- Error handlers globales: PydanticValidationError + DataValidationError

---

## Sesion 1 — Corregir Bugs Criticos del Backend

**Objetivo:** Dejar la API sin errores de runtime que generen 500.
**Duracion estimada:** 3-4 horas.
**Archivos afectados:** 4

### Cambios

1. **Fix `tasks_repository.py:89`** — filtro completed
   - Cambiar `if task_status in (True, False):` por `if (task_status := filters.get("completed")) is not None:`
2. **Fix `tasks.py:51,53`** — import y uso de TaskResponse
   - Agregar `TaskResponse` al import
   - Corregir `validated_data = TaskResponse(...)` y `return validated_data.model_dump(), 200`
3. **Fix `tasks.py` POST** — catch ValidationError
   - Envolver `TaskCreate(**payload)` en try/except
4. **Fix `tasks.py` PUT** — catch ValidationError
   - Envolver `TaskUpdate(**payload)` en try/except
5. **Fix `tasks.py` PATCH** — catch ValidationError
   - Envolver `TaskPatch(**payload)` en try/except
6. **Fix `run.py`** — debug desde env
   - Leer `os.environ.get("DEBUG", "false").lower() == "true"`

### Checklist Sesion 1

- [ ] `task_status` defined before use in `_apply_data_filters`
- [ ] `TaskResponse` imported in `tasks.py`
- [ ] GET /tasks returns valid JSON without NameError
- [ ] POST /tasks with invalid body returns 400 (not 500)
- [ ] PUT /tasks with invalid body returns 400 (not 500)
- [ ] PATCH /tasks with invalid body returns 400 (not 500)
- [ ] `run.py` reads DEBUG from environment variable
- [ ] `GET /api/v1/tasks` returns 200 with correct pagination envelope
- [ ] `POST /api/v1/tasks` with valid body returns 201
- [ ] `POST /api/v1/tasks` with empty body returns 400
- [ ] App starts without errors: `python run.py`

---

## Sesion 2 — Configuracion por Entorno y Limpieza

**Objetivo:** Separar configuracion de dev/prod. Preparar base para tests y Alembic.
**Duracion estimada:** 3-4 horas.
**Archivos afectados:** 3-4

### Cambios

1. **Config por entorno** — crear `backend/config.py`
   - Clase `Config` base con defaults
   - Clase `DevelopmentConfig(DEBUG=True)`
   - Clase `ProductionConfig(DEBUG=False)`
   - Flask app lee config desde env var `FLASK_ENV`
2. **Remover `create_all` de startup** — `__init__.py`
   - Comentar o eliminar `Base.metadata.create_all(db.engine)`
   - Documentar que esquema se crea via Alembic (Sesion 9)
3. **Variable de entorno** — crear `backend/.env.example`
   - `FLASK_ENV=development`
   - `DEBUG=true`
   - `DATABASE_URL=sqlite:///db.sqlite`

### Checklist Sesion 2

- [ ] `config.py` created with Dev/Prod configs
- [ ] `create_app()` reads config from `FLASK_ENV`
- [ ] `create_all` removed from app startup
- [ ] `.env.example` created with documented vars
- [ ] App still starts and responds to requests
- [ ] `DEBUG=false` disables debugger in production
- [ ] `FLASK_ENV=production` applies prod config

---

## Sesion 3 — Frontend: Estructura Basica

**Objetivo:** Crear directorio `frontend/` y archivos base del SPA.
**Duracion estimada:** 4-5 horas.
**Archivos afectados:** 5-7 nuevos

### Cambios

1. **Crear estructura**
   ```
   backend/frontend/
   public/
   index.html
   style.css
   script.js
   ```
2. **`index.html`** — estructura semantica base
   - Header con titulo
   - Seccion de auth (placeholder)
   - Formulario de creacion de tarea
   - Lista de tareas (contenedor vacio)
3. **`style.css`** — estilos minimos
4. **`script.js`** — esqueleto con DOM seguro
   - Clase `SafeRenderer` con `textContent` (no innerHTML)
   - Clase `TaskAPI` con endpoints basicos
   - Inicializacion en `DOMContentLoaded`
5. **Actualizar `__init__.py`**
   - Cambiar `static_folder` a `frontend/public`
   - Cambiar `template_folder` a `frontend/public`
6. **Actualizar `main.py`**
   - Servir `index.html` para `/`

### Checklist Sesion 3

- [ ] `backend/frontend/public/` directory exists
- [ ] `index.html` renders in browser at `http://localhost:5001/`
- [ ] `style.css` loads without 404
- [ ] `script.js` loads without errors in console
- [ ] No `innerHTML` used anywhere in `script.js`
- [ ] Flask serves `index.html` via main blueprint
- [ ] Static files accessible at `/static/<filename>`

---

## Sesion 4 — Frontend: CRUD Completo

**Objetivo:** Frontend funcional con todas las operaciones CRUD.
**Duracion estimada:** 5-6 horas.
**Archivos afectados:** 2-3

### Cambios

1. **`script.js`** — completar operaciones
   - `loadTasks()` — GET con paginacion y filtros
   - `createTask()` — POST con validacion
   - `updateTask()` — PUT
   - `patchTask()` — PATCH parcial
   - `deleteTask()` — DELETE con confirmacion
2. **Manejo de errores en UI**
   - Mostrar errores de validacion del backend
   - Toast/notification para exito/error
3. **Paginacion en UI**
   - Botones anterior/siguiente
   - Indicador de pagina actual
4. **Filtros**
   - Input de busqueda por titulo
   - Filtro de completadas

### Checklist Sesion 4

- [ ] GET /tasks loads task list on page load
- [ ] POST creates new task and updates list
- [ ] PUT updates existing task
- [ ] PATCH updates single field without overwriting others
- [ ] DELETE removes task with confirmation
- [ ] Pagination buttons work (next/prev)
- [ ] `completed=true/false` filter works
- [ ] Title search filter works
- [ ] Invalid form shows error message in UI
- [ ] Empty task list shows friendly message
- [ ] No XSS possible via task title/description

---

## Sesion 5 — Frontend: Seguridad y Validacion

**Objetivo:** Cerrar superficie de ataque en frontend.
**Duracion estimada:** 3-4 horas.
**Archivos afectados:** 1-2

### Cambios

1. **Sanitizacion de entradas**
   - Funcion `escapeHtml()` para todo texto visible
   - Validacion client-side antes de enviar
2. **Headers de seguridad**
   - Content-Security-Policy basico
   - X-Content-Type-Options: nosniff
3. **Rate limiting basico**
   - Deshabilitar boton submit mientras request activo
   - Debounce en busqueda

### Checklist Sesion 5

- [ ] `<script>` en titulo de tarea se muestra como texto literal
- [ ] `<img onerror=alert(1)>` se muestra como texto literal
- [ ] Client-side validation rejects empty title
- [ ] Client-side validation rejects title > 40 chars
- [ ] Submit button disabled during request
- [ ] No duplicate submissions on double-click
- [ ] CSP header present in responses
- [ ] X-Content-Type-Options header present

---

## Sesion 6 — Autenticacion y Ownership

**Objetivo:** Introducir usuario actual y filtrar tareas por propietario.
**Duracion estimada:** 6-8 horas.
**Archivos afectados:** 6-8 (nuevos y modificados)

### Cambios

1. **Modelo de usuario** — `backend/app/models/users.py`
   - `user_id`, `username`, `password_hash`, `created_at`
2. **Schema de auth** — `backend/app/api/v1/schemas/auth_schemas.py`
   - `UserCreate`, `UserLogin`, `UserResponse`
3. **Servicio de auth** — `backend/app/api/v1/services/auth_service.py`
   - `register()`, `login()`, `get_current_user()`
4. **Rutas de auth** — `backend/app/api/v1/routes/auth.py`
   - `POST /api/v1/auth/register`
   - `POST /api/v1/auth/login`
   - `GET /api/v1/auth/me`
5. **Agregar `user_id` a Tasks** — `models/tasks.py`
   - Columna `user_id: Mapped[int]` con FK a users
6. **Filtrar por ownership**
   - Repository: agregar filtro `user_id` en `get_all`, `get_by_id`, `update`, `delete`
   - Service: recibir `user_id` y pasarlo al repository
   - Routes: extraer usuario del token/session
7. **Frontend: auth UI**
   - Login/Register forms
   - Guardar token en localStorage
   - Enviar token en headers

### Checklist Sesion 6

- [ ] `users` table created via migration
- [ ] `tasks` table has `user_id` column
- [ ] POST /api/v1/auth/register creates user
- [ ] POST /api/v1/auth/login returns token
- [ ] GET /api/v1/auth/me returns current user
- [ ] Unauthenticated GET /tasks returns 401
- [ ] User A cannot see User B tasks
- [ ] User A cannot update User B tasks
- [ ] User A cannot delete User B tasks
- [ ] Frontend login/register forms work
- [ ] Token stored in localStorage after login
- [ ] API requests include auth header
- [ ] Logout clears token and redirects to login

---

## Sesion 7 — Pydantic: Schemas Completos

**Objetivo:** Modelar query params con Pydantic. Completar validacion de entrada.
**Duracion estimada:** 3-4 horas.
**Archivos afectados:** 2-3

### Cambios

1. **TaskListQuery schema** — `tasks_schemas.py`
   ```python
   class TaskListQuery(BaseModel):
       page: int = Field(default=1, ge=1)
       per_page: int = Field(default=100, ge=1, le=100)
       completed: bool | None = None
       title: str | None = None
       description: str | None = None
       sort: str | None = None
   ```
2. **Actualizar routes** — usar TaskListQuery en GET /tasks
   - Reemplazar `request.args.get()` manual por `TaskListQuery(**request.args)`
   - Eliminar validacion manual duplicada
3. **Config extra="forbid"** en schemas de entrada
   - `TaskCreate`: `model_config = ConfigDict(extra="forbid")`
   - `TaskUpdate`: `model_config = ConfigDict(extra="forbid")`
   - `TaskPatch`: `model_config = ConfigDict(extra="forbid")`

### Checklist Sesion 7

- [ ] `TaskListQuery` schema created with field constraints
- [ ] GET /tasks uses `TaskListQuery` for validation
- [ ] `per_page=0` returns 400
- [ ] `per_page=101` returns 400
- [ ] `page=-1` returns 400
- [ ] Unknown query params rejected with `extra="forbid"`
- [ ] `TaskCreate` rejects unknown fields
- [ ] `TaskUpdate` rejects unknown fields
- [ ] `TaskPatch` rejects unknown fields
- [ ] All existing endpoints still functional

---

## Sesion 8 — Tests: Fixtures y Setup

**Objetivo:** Crear base de pytest con fixtures de app y database.
**Duracion estimada:** 3-4 horas.
**Archivos afectados:** 3-4 nuevos

### Cambios

1. **Instalar dependencias**
   - `uv add pytest pytest-cov flask-testing`
2. **`backend/tests/conftest.py`**
   - Fixture `app` con TestingConfig
   - Fixture `client` (Flask test client)
   - Fixture `db` con rollback entre tests
   - Fixture `auth_headers` con usuario de prueba
3. **`backend/tests/__init__.py`**
4. **`backend/pyproject.toml`** — agregar seccion pytest
   - `testpaths = ["tests"]`

### Checklist Sesion 8

- [ ] `pytest` installed and importable
- [ ] `backend/tests/` directory exists
- [ ] `conftest.py` creates test app with SQLite in-memory
- [ ] `client` fixture sends requests successfully
- [ ] Database is clean between tests (rollback)
- [ ] `pytest` runs without collection errors
- [ ] Test discovery finds test files

---

## Sesion 9 — Tests: Cobertura de Endpoints

**Objetivo:** Cubrir flujo feliz y negativos para todos los endpoints.
**Duracion estimada:** 5-6 horas.
**Archivos afectados:** 2-3 nuevos

### Cambios

1. **`tests/test_tasks_crud.py`**
   - test_list_tasks_empty
   - test_list_tasks_with_data
   - test_list_tasks_pagination
   - test_list_tasks_completed_filter
   - test_create_task_success
   - test_create_task_invalid_body
   - test_create_task_missing_title
   - test_get_task_by_id_success
   - test_get_task_by_id_not_found
   - test_update_task_success
   - test_update_task_invalid_body
   - test_patch_task_partial_update
   - test_patch_task_preserves_unset_fields
   - test_delete_task_success
   - test_delete_task_not_found
2. **`tests/test_tasks_errors.py`**
   - test_invalid_page_returns_400
   - test_invalid_per_page_returns_400
   - test_unauthenticated_access_returns_401
   - test_cross_user_access_returns_404

### Checklist Sesion 9

- [ ] `pytest` passes all tests
- [ ] CRUD happy path covered (create, read, update, delete)
- [ ] Pagination test with 11 items and per_page=10
- [ ] Empty list returns 200 with `tasks: []`
- [ ] Invalid body returns 400
- [ ] Not found returns 404
- [ ] PATCH preserves unset fields (no null overwrite)
- [ ] completed=false filter works in tests
- [ ] Authentication required for all endpoints
- [ ] Cross-user access blocked
- [ ] Coverage report shows >= 80% on routes

---

## Sesion 10 — Tests: Servicio y Repositorio

**Objetivo:** Cubrir capa de servicio y repositorio directamente.
**Duracion estimada:** 3-4 horas.
**Archivos afectados:** 2-3 nuevos

### Cambios

1. **`tests/test_tasks_service.py`**
   - test_get_all_tasks_returns_envelope
   - test_get_all_tasks_empty
   - test_add_new_task_success
   - test_add_new_task_integrity_error
   - test_update_task_not_found
   - test_delete_task_success
2. **`tests/test_tasks_repository.py`**
   - test_get_all_returns_correct_count
   - test_get_all_pagination
   - test_get_by_id_exists
   - test_get_by_id_not_exists
   - test_add_task_persists
   - test_update_task_persists
   - test_delete_task_removes
   - test_apply_data_filters_completed
   - test_apply_data_filters_title

### Checklist Sesion 10

- [ ] Service tests pass
- [ ] Repository tests pass
- [ ] Pagination returns correct total_count
- [ ] Service envelope has tasks + meta
- [ ] Repository filter by completed=False works
- [ ] Repository filter by title works (ilike)
- [ ] Repository sort by due_date works
- [ ] Repository sort by completed works
- [ ] All tests isolated (no side effects between tests)

---

## Sesion 11 — Alembic: Migraciones

**Objetivo:** Introducir control de esquema con Alembic.
**Duracion estimada:** 4-5 horas.
**Archivos afectados:** 5-6 nuevos

### Cambios

1. **Instalar Alembic**
   - `uv add alembic`
2. **Inicializar**
   - `cd backend && uv run alembic init alembic`
3. **Configurar `alembic.ini`**
   - `sqlalchemy.url = sqlite:///db.sqlite`
4. **Configurar `alembic/env.py`**
   - Importar `Base` desde `app.extensions`
   - Importar modelos
5. **Migracion inicial**
   - `uv run alembic revision --autogenerate -m "initial schema"`
   - Verificar que genera create de `tasks` y `users`
6. **Eliminar `create_all`** de `__init__.py` (si no se hizo en Sesion 2)
7. **Documentar comandos** en README

### Checklist Sesion 11

- [ ] `alembic` installed and initialized
- [ ] `alembic.ini` configured with database URL
- [ ] `alembic/env.py` imports models correctly
- [ ] Initial migration generated successfully
- [ ] Migration contains `tasks` table definition
- [ ] Migration contains `users` table definition
- [ ] `alembic upgrade head` creates schema
- [ ] `alembic downgrade -1` reverts one migration
- [ ] `create_all` removed from `__init__.py`
- [ ] App starts without auto-creating tables
- [ ] README documents migration commands

---

## Sesion 12 — Hardening y Deploy

**Objetivo:** Production-ready final. Logging, CORS, headers de seguridad.
**Duracion estimada:** 3-4 horas.
**Archivos afectados:** 3-4

### Cambios

1. **Logging estructurado**
   - Configurar Python logging con formato JSON
   - Log errores de base de datos
   - Log requests HTTP
2. **CORS** — si frontend sirve en mismo origin, configurar explicitamente
3. **Headers de seguridad** — via Flask
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `Strict-Transport-Security` (si HTTPS)
4. **Rate limiting basico** — `flask-limiter`
5. **Health check** — `GET /health`
6. **Final README** — documentar setup completo

### Checklist Sesion 12

- [ ] Logging output visible in console
- [ ] Errors logged with traceback
- [ ] CORS headers present (if applicable)
- [ ] Security headers present in responses
- [ ] `GET /health` returns 200
- [ ] Rate limiting blocks excessive requests
- [ ] README documents: setup, run, test, migrate
- [ ] `pytest` passes all tests
- [ ] `python run.py` starts cleanly
- [ ] Frontend loads at `http://localhost:5001/`
- [ ] Full CRUD works end-to-end via UI

---

## Dependencias entre Sesiones

```
Sesion 1 (bugs criticos)
  └─→ Sesion 2 (config)
       ├─→ Sesion 3 (frontend structure)
       │    └─→ Sesion 4 (frontend CRUD)
       │         └─→ Sesion 5 (frontend security)
       ├─→ Sesion 7 (pydantic schemas)
       ├─→ Sesion 8 (test fixtures)
       │    └─→ Sesion 9 (endpoint tests)
       │         └─→ Sesion 10 (service/repo tests)
       └─→ Sesion 6 (auth) — depende de Sesion 2

Sesion 11 (alembic) — despues de Sesion 6 (users table)
Sesion 12 (hardening) — ultima, despues de todo
```

## Resumen de Sprints

| Sprint | Sesiones | Duracion | Objetivo |
|---|---|---|---|
| Sprint 1 | 1-2 | 1 dia | Backend sin bugs, config por entorno |
| Sprint 2 | 3-5 | 1.5 dias | Frontend funcional y seguro |
| Sprint 3 | 6-7 | 1.5 dias | Auth + validacion completa |
| Sprint 4 | 8-10 | 1.5 dias | Suite de tests completa |
| Sprint 5 | 11-12 | 1 dia | Alembic + hardening final |

**Total estimado:** ~6.5 dias de trabajo
