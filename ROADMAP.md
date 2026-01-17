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
- [x] Revisar códigos HTTP:
	- [x] `POST` devuelve `201`
	- [x] `DELETE` idealmente `204 No Content`
- [x] Estándares de estilo:
	- [x] lint
	- [x] format

### Fase 1 — API REST “de verdad” (2–4 días)

- [x] Versionado: `GET /api/v1/tasks` (mantener compatibilidad con `/tasks` si quieres).
- [x] Mejorar diseño de endpoints:
	- [x] `GET /tasks/<id>` (detalle)
	- [x] `PATCH /tasks/<id>` (updates parciales)
- [ ] Paginación y filtros en `GET /tasks`:
	- [ ] `?page=1&page_size=20`
	- [ ] `?realizada=true`
	- [ ] `?search=...` (por título/descripcion)
- [ ] Ordenación: `?sort=-fecha_creacion,titulo`
- [ ] Validación con `flask-pydantic`:
	- [x] esquemas de request/response
	- [ ] respuestas de error detalladas cuando falle validación

### Fase 2 — Persistencia pro (2–3 días)

- [ ] Migraciones (Alembic):
	- [ ] crear/actualizar tablas sin borrar la DB
- [x] Campos típicos de producción:
	- [x] `updated_at`
	- [x] `due_date` (opcional)
	- [x] `priority` (enum simple: low/medium/high)
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
- [x] Deploy público (Render/Fly.io/Railway) + URL en este README.