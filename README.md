# BareDo

API REST backend para gestión de tareas con arquitectura escalable y diseño profesional, desarrollada en Python con Flask.

## Descripción general

BareDo es una API backend minimalista que implementa un modelo de dominio simple pero completo para la gestión de tareas. El proyecto demuestra prácticas sólidas de desarrollo backend: separación clara de capas arquitectónicas, validación de datos con esquemas tipados, manejo centralizado de errores, y respuestas consistentes.

Aunque funcional y completo en su presente, está diseñado pensando en extensibilidad hacia autenticación multiusuario, pruebas automáticas y despliegue productivo.

## Problema que resuelve

Proporciona un backend fiable para aplicaciones que requieren persistencia de tareas o notas con validación de datos y acceso estructurado mediante REST. Elimina complejidad innecesaria sin sacrificar calidad arquitectónica o profesionalismo.

## Características principales

- **API REST versionada:** Endpoints bajo `/api/v1/` para facilitar evolución compatible.
- **CRUD completo:** Crear, leer, actualizar parcialmente, actualizar totalmente y eliminar tareas.
- **Paginación y filtrado:** Búsqueda por título, descripción y estado de completación con soporte para página y cantidad de registros por página.
- **Ordenación flexible:** Parámetro `sort` que permite ordenar por múltiples campos en orden ascendente o descendente.
- **Validación robusta:** Esquemas Pydantic que validan tipos, rangos y longitudes. Errores descriptivos con detalles específicos.
- **Respuestas normalizadas:** Toda respuesta sigue estructura JSON consistente con metadatos y códigos de error tipificados.
- **Modelo de datos rico:** Tareas con prioridad (niveles 1-3), fecha vencimiento, marca de completación, auditoría temporal (`created_at`, `updated_at`).
- **Manejo de errores centralizado:** Excepciones mapeadas a códigos HTTP y respuestas estructuradas.

## Arquitectura y stack tecnológico

### Decisiones arquitectónicas

- **Separación de capas:** El código organiza responsabilidades en capas diferenciadas:
  - **Rutas (routes):** Capa HTTP, recibe y serializa respuestas.
  - **Servicios (services):** Lógica de negocio, orquestación de operaciones.
  - **Repositorios (repositories):** Acceso a datos, queries SQL abstraídas.
  - **Modelos (models):** Definición de entidades y esquema ORM.
  - **Esquemas (schemas):** Validación Pydantic para entrada/salida.

- **Validación en dos niveles:** Pydantic valida payload JSON en rutas; la capa de servicios verifica reglas de negocio.

- **Manejo de errores:** Excepciones personalizadas (`NotFoundError`, `DataValidationError`) propagadas hacia handlers HTTP centralizados.

### Stack tecnológico

| Componente | Elección | Razón |
|---|---|---|
| **Lenguaje** | Python 3.13+ | Tipado gradual, legibilidad, madurez. |
| **Framework web** | Flask | Minimalista, control explícito, estándar de la industria. |
| **ORM** | SQLAlchemy con `flask-sqlalchemy-lite` | Abstracción de BD, portabilidad, queries seguras. |
| **Base de datos** | SQLite (dev/test) | Desarrollo sin dependencias externas; sin configuración. |
| **Validación** | Pydantic v2 | Type hints nativos, esquemas reutilizables, mensajes claros. |
| **Servidor WSGI** | Gunicorn | Compatible con producción, concurrencia, logs. |
| **Gestor de dependencias** | uv | Instalación rápida, reproducibilidad, bloqueo de versiones. |

### Estructura del proyecto

```
backend/
├── app/
│   ├── __init__.py                  # Inicialización y configuración de Flask
│   ├── extensions.py                # Extensiones (Base de SQLAlchemy)
│   ├── api/
│   │   └── v1/
│   │       ├── routes/
│   │       │   ├── main.py          # Rutas raíz y health check
│   │       │   └── tasks.py         # Endpoints de tareas
│   │       ├── schemas/
│   │       │   └── tasks_schemas.py # Esquemas Pydantic para validación
│   │       └── services/
│   │           └── tasks_service.py # Lógica de negocio
│   ├── errors/
│   │   ├── exceptions.py            # Excepciones personalizadas
│   │   ├── handlers.py              # Manejo centralizado de errores
│   │   └── schemas.py               # Estructura de respuestas de error
│   ├── models/
│   │   └── tasks.py                 # Modelo ORM de tareas
│   ├── repositories/
│   │   └── tasks_repository.py      # Acceso a datos
│   └── views/
│       ├── static/                  # Activos estáticos (CSS, JS)
│       └── templates/               # Plantillas HTML
├── pyproject.toml                   # Metadatos y dependencias (uv)
└── run.py                           # Punto de entrada de la aplicación
```

## Modelo de datos

### Entidad: Task (Tarea)

| Campo | Tipo | Obligatorio | Restricciones | Descripción |
|---|---|---|---|---|
| `task_id` | Integer | Sí | Primary Key, Auto-increment | Identificador único |
| `title` | String(40) | Sí | Longitud 5-40 caracteres | Título de la tarea |
| `description` | String(500) | No | Longitud 0-500 caracteres | Descripción detallada |
| `priority` | Integer | Sí | Rango 1-3, default 1 | Nivel: 1 (baja), 2 (media), 3 (alta) |
| `due_date` | DateTime | Sí | default = hoy | Fecha de vencimiento |
| `completed` | Boolean | Sí | default = false | Estado de completación |
| `created_at` | DateTime | Sí | default = ahora, readonly | Timestamp de creación |
| `updated_at` | DateTime | Sí | default = ahora, auto-actualizado | Timestamp de última actualización |

**Índices:** Presentes en `completed` y `created_at` para optimizar filtrado y ordenación.

## Especificación de endpoints

### Listar tareas

```http
GET /api/v1/tasks
```

**Parámetros de query:**

| Parámetro | Tipo | Default | Descripción |
|---|---|---|---|
| `page` | Integer | 1 | Número de página (base 1) |
| `per_page` | Integer | 100 | Tareas por página (máx 100) |
| `title` | String | - | Filtro por titulo (búsqueda parcial) |
| `description` | String | - | Filtro por descripción (búsqueda parcial) |
| `completed` | Boolean | - | Filtro por estado ("true" o "false") |
| `sort` | String | - | Ordenación: `campo,-campo` (ej: `-created_at,title`) |

**Respuesta 200:**

```json
{
  "tasks": [
    {
      "task_id": 1,
      "title": "Revisar documentación",
      "description": "Leer guía de API",
      "priority": 2,
      "due_date": "2026-06-05T00:00:00",
      "completed": false,
      "created_at": "2026-06-02T10:30:00",
      "updated_at": "2026-06-02T10:30:00"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "per_page": 100,
    "total_pages": 1
  }
}
```

### Obtener tarea por ID

```http
GET /api/v1/tasks/{id}
```

**Respuesta 200:**

```json
{
  "task_id": 1,
  "title": "Revisar documentación",
  "description": "Leer guía de API",
  "priority": 2,
  "due_date": "2026-06-05T00:00:00",
  "completed": false,
  "created_at": "2026-06-02T10:30:00",
  "updated_at": "2026-06-02T10:30:00"
}
```

**Respuesta 404:**

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource Not Found",
    "status": 404,
    "details": null
  }
}
```

### Crear tarea

```http
POST /api/v1/tasks
Content-Type: application/json
```

**Body (requerido):**

```json
{
  "title": "Configurar CI/CD",
  "description": "Implementar GitHub Actions para tests",
  "priority": 3,
  "completed": false,
  "due_date": "2026-06-10T00:00:00"
}
```

- `title`: Requerido, 5-40 caracteres.
- `description`: Opcional, 0-500 caracteres, default "".
- `priority`: Opcional, 1-3, default 1.
- `completed`: Opcional, default false.
- `due_date`: Opcional, default = fecha de hoy.

**Respuesta 201:**

```json
{
  "task_id": 2,
  "title": "Configurar CI/CD",
  "description": "Implementar GitHub Actions para tests",
  "priority": 3,
  "due_date": "2026-06-10T00:00:00",
  "completed": false,
  "created_at": "2026-06-02T11:00:00",
  "updated_at": "2026-06-02T11:00:00"
}
```

**Respuesta 400 (validación fallida):**

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Bad Request",
    "status": 400,
    "details": "[{...validation errors...}]"
  }
}
```

### Actualizar tarea (PUT)

```http
PUT /api/v1/tasks/{id}
Content-Type: application/json
```

**Body (todos los campos son requeridos):**

```json
{
  "title": "Configurar CI/CD actualizado",
  "description": "Implementar GitHub Actions para tests y linting",
  "priority": 2,
  "completed": true,
  "due_date": "2026-06-12T00:00:00"
}
```

**Respuesta 200:**

```json
{
  "task_id": 2,
  "title": "Configurar CI/CD actualizado",
  "description": "Implementar GitHub Actions para tests y linting",
  "priority": 2,
  "due_date": "2026-06-12T00:00:00",
  "completed": true,
  "created_at": "2026-06-02T11:00:00",
  "updated_at": "2026-06-02T11:15:00"
}
```

### Actualizar tarea (PATCH)

```http
PATCH /api/v1/tasks/{id}
Content-Type: application/json
```

**Body (campos opcionales, solo se actualizan los presentes):**

```json
{
  "completed": true
}
```

Campos soportados: `title`, `description`, `priority`, `completed`, `due_date`.

**Respuesta 200:**

```json
{
  "task_id": 2,
  "title": "Configurar CI/CD",
  "description": "Implementar GitHub Actions para tests",
  "priority": 3,
  "due_date": "2026-06-10T00:00:00",
  "completed": true,
  "created_at": "2026-06-02T11:00:00",
  "updated_at": "2026-06-02T11:20:00"
}
```

### Eliminar tarea

```http
DELETE /api/v1/tasks/{id}
```

**Respuesta 204 No Content**

(Cuerpo vacío, solo header HTTP 204)

## Ejemplos de uso

### Instalación y configuración

**Prerrequisitos:**

- Python 3.13 o superior
- [uv](https://docs.astral.sh/uv/) para gestión de dependencias

**Clonar y preparar:**

```bash
git clone https://github.com/MiguelAngel861/BareDo.git
cd BareDo/backend
uv sync
```

### Ejecución local

**Modo desarrollo:**

```bash
uv run python run.py
```

La aplicación estará disponible en `http://127.0.0.1:5000`.

**Modo producción (simulado localmente):**

```bash
uv run gunicorn -w 4 -b 0.0.0.0:8000 app:create_app()
```

### Variables de entorno

Actualmente, la aplicación no requiere variables de entorno. Las configuraciones por defecto son:

- `FLASK_ENV`: Auto detectado (development en modo `run.py`, production en gunicorn).
- `DATABASE_URL`: Por defecto usa SQLite local (`instance/app.db`).

Para extensiones futuras (ejemplo: autenticación), se pueden configurar variables como:

```bash
export SECRET_KEY="tu-clave-secreta-aqui"
export DATABASE_URL="postgresql://user:password@localhost/bare-do"
```

### Ejemplos de peticiones (curl)

**Listar todas las tareas:**

```bash
curl -X GET http://127.0.0.1:5000/api/v1/tasks
```

**Listar tareas completadas, página 1, 10 por página:**

```bash
curl -X GET "http://127.0.0.1:5000/api/v1/tasks?completed=true&page=1&per_page=10"
```

**Listar tareas ordenadas por fecha de creación descendente:**

```bash
curl -X GET "http://127.0.0.1:5000/api/v1/tasks?sort=-created_at"
```

**Obtener tarea específica:**

```bash
curl -X GET http://127.0.0.1:5000/api/v1/tasks/1
```

**Crear tarea:**

```bash
curl -X POST http://127.0.0.1:5000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Aprender Flask",
    "description": "Revisar Blueprints y validación de datos",
    "priority": 2,
    "completed": false,
    "due_date": "2026-06-05T00:00:00"
  }'
```

**Actualizar parcialmente una tarea (marcar completada):**

```bash
curl -X PATCH http://127.0.0.1:5000/api/v1/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

**Reemplazar una tarea completa:**

```bash
curl -X PUT http://127.0.0.1:5000/api/v1/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Aprender Flask avanzado",
    "description": "Blueprints, extensiones, testing",
    "priority": 3,
    "completed": false,
    "due_date": "2026-06-07T00:00:00"
  }'
```

**Eliminar una tarea:**

```bash
curl -X DELETE http://127.0.0.1:5000/api/v1/tasks/1
```

## Estrategia de persistencia de datos

### Almacenamiento

- **Base de datos:** SQLite por defecto, sin configuración requerida.
- **Ubicación:** `backend/instance/app.db` (ignorada en control de versiones).
- **Migración futura:** El ORM SQLAlchemy permite portabilidad a PostgreSQL, MySQL u otros sin cambios en lógica.

### Modelo relacional

Una única tabla `tasks` con campos tipados en la BD y validados por Pydantic antes de persistencia.

- Campos de auditoría (`created_at`, `updated_at`) registran automáticamente cambios.
- Índices en columnas frecuentemente filtradas (`completed`, `created_at`) mejoran rendimiento.

### Integridad de datos

- Restricciones de base de datos (NOT NULL, DEFAULT, CHECK ranges).
- Validación Pydantic previa a inserción/actualización.
- Excepciones para casos inconsistentes (tarea no existe, datos inválidos).

## Validaciones y manejo de errores

### Estrategia de validación

1. **Entrada:** Pydantic valida JSON contra esquemas tipados.
2. **Negocio:** Servicios verifica reglas (existencia de recurso, rangos válidos).
3. **Persistencia:** BD impone restricciones finales.

### Esquemas de validación

| Esquema | Uso | Campos obligatorios |
|---|---|---|
| `TaskCreate` | POST | title, due_date (con defaults) |
| `TaskUpdate` | PUT | title, description, priority, completed, due_date |
| `TaskPatch` | PATCH | Ninguno (todos opcionales) |
| `TaskBody` | Respuestas | Todos (completo) |
| `TaskResponse` | GET lista | tasks, meta (paginación) |

### Códigos de error

| Código HTTP | Código de error | Situación |
|---|---|---|
| 400 | `BAD_REQUEST` | JSON inválido, tipos incorrectos, valores fuera de rango |
| 404 | `NOT_FOUND` | Tarea no existe |
| 500 | `INTERNAL_ERROR` | Error inesperado en servidor |

**Estructura de respuesta de error:**

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Descripción legible del problema",
    "status": 400,
    "details": "Información adicional (ej: validación específica)"
  }
}
```

## Pruebas

Actualmente, el proyecto no incluye suite de pruebas automáticas. Está planeado para Fase 3 del roadmap:

- Pruebas unitarias con `pytest` para servicios y repositorios.
- Pruebas de integración para endpoints REST.
- Cobertura orientativa >= 80%.

Se pueden ejecutar pruebas manuales siguiendo los ejemplos curl de esta documentación.

## Roadmap y estado del desarrollo

### Completado (Fases 0-1)

- Respuestas normalizadas y manejo de errores centralizado.
- API REST versionada con endpoints CRUD.
- Paginación, filtrado y ordenación.
- Validación robusta con Pydantic.
- Campos de auditoría (`created_at`, `updated_at`).
- Prioridades y fechas de vencimiento.
- Códigos HTTP conformes (201 para creación, 204 para eliminación).

### En desarrollo / Planificado

- **Migraciones (Alembic):** Facilitar cambios de esquema sin borrar datos (Fase 2).
- **Pruebas automáticas:** Suite completa con pytest y cobertura (Fase 3).
- **Autenticación y multiusuario:** JWT, registro, login; tareas pertenecen a usuarios (Fase 4).
- **Documentación OpenAPI:** Swagger/Redoc integrado (Fase 5).
- **Docker y CI/CD:** Dockerfile, docker-compose, GitHub Actions (Fase 6).

## Posibles mejoras

### Corto plazo

- Agregar pruebas unitarias e integración.
- Implementar autenticación JWT.
- Documentación Swagger/OpenAPI.

### Mediano plazo

- Soporte para etiquetas o categorías en tareas.
- Subtareas o dependencias.
- Notificaciones de vencimiento.
- Búsqueda full-text en descripción.

### Largo plazo

- Arquitectura multiusuario con espacios de trabajo compartidos.
- Sincronización en tiempo real (WebSockets).
- Cliente web progresivo (PWA).
- Aplicación móvil (React Native o Flutter).

## Aprendizajes técnicos

Este proyecto demuestra y consolida conocimientos en:

- **Arquitectura:** Separación clara de responsabilidades en capas (routes, services, repositories).
- **ORM moderno:** SQLAlchemy con type hints, queries seguras ante inyección SQL.
- **Validación:** Pydantic para tipado, serialización y documentación automática de esquemas.
- **API REST:** Principios REST, códigos HTTP semánticos, respuestas consistentes.
- **Gestión de errores:** Excepciones personalizadas, handlers centralizados, respuestas estructuradas.
- **Versionado de API:** Compatibilidad backward mediante versionado en rutas (`/api/v1/`).
- **Python moderno:** Type hints, f-strings, características de Python 3.13.

## Licencia

[MIT](https://mit-license.org/)
