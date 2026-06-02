# Tabla Resumen

| ID | Severidad | Tipo | Archivo | Clase | Función/Método | Línea |
|---|---|---|---|---|---|---|
| CRIT-001 | Crítico | Error | [backend/app/repositories/tasks_repository.py](backend/app/repositories/tasks_repository.py#L25) | `TasksRepository` | `get_all` | 25 |
| CRIT-002 | Crítico | Error | [backend/app/api/v1/services/tasks_service.py](backend/app/api/v1/services/tasks_service.py#L22) | `TasksService` | `get_all_tasks` | 22 |
| CRIT-003 | Crítico | Error | [backend/app/api/v1/routes/tasks.py](backend/app/api/v1/routes/tasks.py#L87) | `tasks_bp` | `patch_task` | 87-88 |
| CRIT-004 | Crítico | Error | [backend/app/api/v1/routes/tasks.py](backend/app/api/v1/routes/tasks.py#L76) | `tasks_bp` | `update_task` | 76 |
| CRIT-005 | Crítico | Error | [backend/app/api/v1/routes/tasks.py](backend/app/api/v1/routes/tasks.py#L92) | `tasks_bp` | `patch_task` | 92 |
| HIGH-006 | Alto | Error | [backend/app/api/v1/routes/tasks.py](backend/app/api/v1/routes/tasks.py#L59) | `tasks_bp` | `add_task` | 59 |
| HIGH-007 | Alto | Error | [backend/app/api/v1/routes/tasks.py](backend/app/api/v1/routes/tasks.py#L31) | `tasks_bp` | `get_tasks` | 31 |
| HIGH-008 | Alto | Error | [backend/app/api/v1/routes/tasks.py](backend/app/api/v1/routes/tasks.py#L34) | `tasks_bp` | `get_tasks` | 34-43 |
| HIGH-009 | Alto | Riesgo técnico | [backend/app/views/static/script.js](backend/app/views/static/script.js#L47) | N/A | `loadTasks` | 47-54 |
| HIGH-010 | Alto | Problema de arquitectura | [backend/app/api/v1/routes/tasks.py](backend/app/api/v1/routes/tasks.py) | N/A | Todas las rutas CRUD | Línea no determinada |
| MED-011 | Medio | Error | [backend/app/repositories/tasks_repository.py](backend/app/repositories/tasks_repository.py#L92) | `TasksRepository` | `_apply_data_filters` | 92-93 |
| MED-012 | Medio | Riesgo técnico | [backend/app/api/v1/routes/tasks.py](backend/app/api/v1/routes/tasks.py#L22) | `tasks_bp` | `get_tasks` | 22-23 |
| MED-013 | Medio | Problema de arquitectura | [backend/app/__init__.py](backend/app/__init__.py#L19) | `create_app` | `create_app` | 19-20 |
| MED-014 | Medio | Riesgo técnico | [backend/run.py](backend/run.py#L5) | N/A | N/A | 5 |
| MED-015 | Medio | Deuda técnica | [ROADMAP.md](ROADMAP.md#L50) | N/A | N/A | 50 |

# Hallazgos

## CRIT-001
**Severidad:** Crítico

**Tipo:** Error

**Ubicación exacta:**

- Archivo: [backend/app/repositories/tasks_repository.py](backend/app/repositories/tasks_repository.py#L25)
- Línea: 25
- Clase: `TasksRepository`
- Método/Función: `get_all`

**Fragmento afectado:**

```python
items_stmt = select(func.count()).select_from(data_stmt.subquery())
items_result: int | None = db.session.execute(items_stmt).scalar()
```

**Descripción del problema:**
El conteo total se ejecuta sobre la consulta ya paginada. Eso hace que `total` represente la página actual y no el conjunto completo de registros filtrados.

**Por qué es un problema:**

- La paginación queda matemáticamente incorrecta.
- El cliente no puede conocer el tamaño real de la colección.
- La UI puede ocultar páginas que sí existen o mostrar páginas fantasmas.

**Cómo corregirlo:**
Calcular el conteo sobre la consulta filtrada antes de aplicar `LIMIT/OFFSET`.

**Ejemplo recomendado:**

```python
base_stmt = self._apply_sort(self._apply_data_filters(select(Tasks), filters), sort)
count_stmt = select(func.count()).select_from(base_stmt.subquery())
items_result = db.session.execute(count_stmt).scalar_one()
```

---

## CRIT-002
**Severidad:** Crítico

**Tipo:** Error

**Ubicación exacta:**

- Archivo: [backend/app/api/v1/services/tasks_service.py](backend/app/api/v1/services/tasks_service.py#L22)
- Línea: 22
- Clase: `TasksService`
- Método/Función: `get_all_tasks`

**Fragmento afectado:**

```python
total_pages = (total_tasks + per_page - 1) // total_tasks if per_page else 1
```

**Descripción del problema:**
La fórmula usa `total_tasks` como divisor. El divisor correcto es `per_page`. Con la expresión actual, la paginación reportada no coincide con el comportamiento real.

**Por qué es un problema:**

- `total_pages` será incorrecto en la mayoría de escenarios.
- El cliente recibirá una metadata engañosa.
- La navegación por páginas pierde consistencia y previsibilidad.

**Cómo corregirlo:**
Usar el tamaño de página como divisor y, si hace falta, `math.ceil` para simplificar la lógica.

**Ejemplo recomendado:**

```python
from math import ceil

total_pages = ceil(total_tasks / per_page) if per_page else 0
```

---

## CRIT-003
**Severidad:** Crítico

**Tipo:** Error

**Ubicación exacta:**

- Archivo: [backend/app/api/v1/routes/tasks.py](backend/app/api/v1/routes/tasks.py#L87)
- Línea: 87-88
- Clase: `tasks_bp`
- Método/Función: `patch_task`

**Fragmento afectado:**

```python
task_data = TaskPatch(**request.get_json())
patched_task = service.update_task(task_id, task_data.model_dump())
```

**Descripción del problema:**
`TaskPatch` define campos opcionales, pero `model_dump()` serializa también las claves no enviadas con valor `None`. Al pasar ese diccionario al servicio, un PATCH parcial termina sobrescribiendo columnas existentes con `NULL` o generando errores de integridad.

**Por qué es un problema:**

- Un PATCH deja de ser parcial y se convierte en una actualización destructiva.
- Puede romper restricciones `NOT NULL`.
- Puede borrar datos válidos aunque el cliente solo quiera cambiar un campo.

**Cómo corregirlo:**
Usar `exclude_unset=True` para enviar solo lo que el cliente realmente modificó.

**Ejemplo recomendado:**

```python
patched_task = service.update_task(
    task_id,
    task_data.model_dump(exclude_unset=True),
)
```

---

## CRIT-004
**Severidad:** Crítico

**Tipo:** Error

**Ubicación exacta:**

- Archivo: [backend/app/api/v1/routes/tasks.py](backend/app/api/v1/routes/tasks.py#L76)
- Línea: 76
- Clase: `tasks_bp`
- Método/Función: `update_task`

**Fragmento afectado:**

```python
except ValidationError or DataValidationError:
    abort(400)
```

**Descripción del problema:**
La expresión no captura dos excepciones. Python evalúa `ValidationError or DataValidationError` antes de entrar al `except`, así que solo se captura `ValidationError` y `DataValidationError` queda fuera.

**Por qué es un problema:**

- Errores de negocio o de persistencia terminan como `500`.
- El API mezcla fallos de cliente con fallos internos.
- El handler transmite una falsa sensación de cobertura.

**Cómo corregirlo:**
Usar una tupla de excepciones o mover la traducción a handlers globales.

**Ejemplo recomendado:**

```python
except (ValidationError, DataValidationError):
    abort(400)
```

---

## CRIT-005
**Severidad:** Crítico

**Tipo:** Error

**Ubicación exacta:**

- Archivo: [backend/app/api/v1/routes/tasks.py](backend/app/api/v1/routes/tasks.py#L92)
- Línea: 92
- Clase: `tasks_bp`
- Método/Función: `patch_task`

**Fragmento afectado:**

```python
except ValidationError or DataValidationError:
    abort(400)
```

**Descripción del problema:**
El mismo error de captura existe en `PATCH`. La ruta aparenta proteger `DataValidationError`, pero en realidad no lo hace.

**Por qué es un problema:**

- El comportamiento de `PUT` y `PATCH` queda inconsistente.
- Un mismo tipo de fallo puede ser `400` en unas rutas y `500` en otras.
- La depuración se vuelve más difícil porque el error se clasifica mal.

**Cómo corregirlo:**
Corregir la sintaxis y evaluar una estrategia global de manejo de errores.

**Ejemplo recomendado:**

```python
except (ValidationError, DataValidationError):
    abort(400)
```

---

## HIGH-006
**Severidad:** Alto

**Tipo:** Error

**Ubicación exacta:**

- Archivo: [backend/app/api/v1/routes/tasks.py](backend/app/api/v1/routes/tasks.py#L59)
- Línea: 59
- Clase: `tasks_bp`
- Método/Función: `add_task`

**Fragmento afectado:**

```python
task_data = TaskCreate(**request.get_json())
```

**Descripción del problema:**
La creación no captura `ValidationError` de Pydantic. Un payload inválido, vacío o mal tipado puede terminar en `500` en lugar de una respuesta de cliente correcta.

**Por qué es un problema:**

- Un error de entrada se convierte en error interno.
- El cliente no recibe una señal útil para corregir el request.
- La API deja de ser confiable ante inputs inesperados.

**Cómo corregirlo:**
Validar el payload dentro de un bloque controlado o delegar la traducción a un handler global.

**Ejemplo recomendado:**

```python
try:
    payload = request.get_json() or {}
    task_data = TaskCreate(**payload)
except ValidationError as exc:
    abort(400, description=str(exc))
```

---

## HIGH-007
**Severidad:** Alto

**Tipo:** Error

**Ubicación exacta:**

- Archivo: [backend/app/api/v1/routes/tasks.py](backend/app/api/v1/routes/tasks.py#L31)
- Línea: 31
- Clase: `tasks_bp`
- Método/Función: `get_tasks`

**Fragmento afectado:**

```python
stmt = service.get_all_tasks(page, per_page, filters, sort)["tasks"]
```

**Descripción del problema:**
Cuando no hay tareas, el servicio devuelve `{}`. El acceso directo a `"tasks"` dispara `KeyError`, así que una colección vacía o una página fuera de rango rompe el endpoint.

**Por qué es un problema:**

- Una lista vacía es un caso normal, no una condición de error.
- La paginación debe soportar páginas sin elementos.
- El endpoint deja de ser robusto en un escenario común.

**Cómo corregirlo:**
El servicio debe devolver siempre la misma estructura, aunque `tasks` sea una lista vacía.

**Ejemplo recomendado:**

```python
payload = service.get_all_tasks(page, per_page, filters, sort)
return TaskResponse.model_validate(payload).model_dump(), 200
```

---

## HIGH-008
**Severidad:** Alto

**Tipo:** Error

**Ubicación exacta:**

- Archivo: [backend/app/api/v1/routes/tasks.py](backend/app/api/v1/routes/tasks.py#L34)
- Línea: 34-43
- Clase: `tasks_bp`
- Método/Función: `get_tasks`

**Fragmento afectado:**

```python
meta = PaginationResponse(
    total=len(validated_tasks),
    page=page,
    per_page=per_page,
    total_pages=(len(validated_tasks) + per_page - 1) // per_page
    )

return TaskResponse.model_validate(validated_data).model_dump(), 201
```

**Descripción del problema:**
La ruta reconstruye la metadata con el tamaño de la página actual y devuelve `201 Created` en un `GET`. La respuesta no refleja el total real y el código HTTP es incorrecto.

**Por qué es un problema:**

- `total` y `total_pages` dejan de servir para paginación real.
- El cliente recibe una respuesta semánticamente incorrecta.
- `201` en una lectura rompe la convención REST y puede confundir consumidores externos.

**Cómo corregirlo:**
Devolver la metadata que sale del servicio y responder `200 OK`.

**Ejemplo recomendado:**

```python
payload = service.get_all_tasks(page, per_page, filters, sort)
return TaskResponse.model_validate(payload).model_dump(), 200
```

---

## HIGH-009
**Severidad:** Alto

**Tipo:** Riesgo técnico

**Ubicación exacta:**

- Archivo: [backend/app/views/static/script.js](backend/app/views/static/script.js#L47)
- Línea: 47-54
- Clase: N/A
- Método/Función: `loadTasks`

**Fragmento afectado:**

```javascript
li.innerHTML = `
    <span>
        ${t.title} - ${t.description || ''}
        ${t.due_date ? `- Due: ${new Date(t.due_date).toLocaleString()}` : ''}
        ${t.priority ? `- Priority: ${t.priority}` : ''}
        (Completed: ${t.completed ? 'Yes' : 'No'})
    </span>
`;
```

**Descripción del problema:**
Se insertan valores provenientes de la API directamente en `innerHTML`. Si algún campo contiene HTML o JavaScript malicioso, el navegador lo interpretará como markup ejecutable.

**Por qué es un problema:**

- Hay una superficie real de XSS persistente.
- Un dato malicioso en la base puede afectar a cualquier usuario que abra la vista.
- El frontend no distingue entre texto confiable y contenido no confiable.

**Cómo corregirlo:**
Construir nodos DOM y usar `textContent` para contenido no confiable.

**Ejemplo recomendado:**

```javascript
const span = document.createElement('span');
span.textContent = `${t.title} - ${t.description || ''}`;
li.appendChild(span);
```

---

## HIGH-010
**Severidad:** Alto

**Tipo:** Problema de arquitectura

**Ubicación exacta:**

- Archivo: [backend/app/api/v1/routes/tasks.py](backend/app/api/v1/routes/tasks.py)
- Línea: Línea no determinada
- Clase: N/A
- Método/Función: Todas las rutas CRUD

**Fragmento afectado:**

```python
@tasks_bp.get("/tasks")
def get_tasks():
    ...

@tasks_bp.post("/tasks")
def add_task():
    ...

@tasks_bp.put("/tasks/<int:task_id>")
def update_task(task_id: int) -> dict:
    ...

@tasks_bp.patch("/tasks/<int:task_id>")
def patch_task(task_id: int):
    ...

@tasks_bp.delete("/tasks/<int:task_id>")
def delete_task(task_id: int):
    ...
```

**Descripción del problema:**
No existe ninguna capa de autenticación o autorización visible en el proyecto. Las rutas CRUD son públicas y no hay un concepto de usuario, ownership ni permisos.

**Por qué es un problema:**

- Cualquier cliente puede listar, crear, editar y borrar datos globales.
- No hay aislamiento entre usuarios.
- Para un entorno profesional o multitenant, esto es un bloqueo funcional y de seguridad.

**Cómo corregirlo:**
Introducir autenticación, agregar `user_id` al modelo de tareas, filtrar todas las consultas por propietario y validar permisos en la capa de servicio o mediante guards.

**Ejemplo recomendado:**

```python
current_user = get_current_user()
task = tasks_repository.get_by_id_for_user(task_id, current_user.id)
```

---

## MED-011
**Severidad:** Medio

**Tipo:** Error

**Ubicación exacta:**

- Archivo: [backend/app/repositories/tasks_repository.py](backend/app/repositories/tasks_repository.py#L92)
- Línea: 92-93
- Clase: `TasksRepository`
- Método/Función: `_apply_data_filters`

**Fragmento afectado:**

```python
if task_status := filters.get("completed"):
    stmt = stmt.where(Tasks.completed == task_status)
```

**Descripción del problema:**
`completed=false` termina convertido en `False` por el parser de query params y luego esta condición lo descarta por truthy/falsy. El filtro para tareas no completadas nunca se aplica.

**Por qué es un problema:**

- La API devuelve resultados incorrectos sin avisar.
- Un filtro semánticamente importante queda roto.
- El comportamiento es especialmente engañoso porque `completed=true` sí funciona.

**Cómo corregirlo:**
Comparar explícitamente con `is not None` y validar el booleano en la capa de entrada.

**Ejemplo recomendado:**

```python
task_status = filters.get("completed")
if task_status is not None:
    stmt = stmt.where(Tasks.completed == task_status)
```

---

## MED-012
**Severidad:** Medio

**Tipo:** Riesgo técnico

**Ubicación exacta:**

- Archivo: [backend/app/api/v1/routes/tasks.py](backend/app/api/v1/routes/tasks.py#L22)
- Línea: 22-23
- Clase: `tasks_bp`
- Método/Función: `get_tasks`

**Fragmento afectado:**

```python
page = request.args.get("page", default=1, type=int)
per_page = request.args.get("per_page", default=100, type=int)
```

**Descripción del problema:**
No hay validación de límites ni de rangos para `page` y `per_page`. El endpoint acepta valores arbitrariamente grandes, negativos o inconsistentes.

**Por qué es un problema:**

- Un cliente puede forzar consultas costosas con `per_page` muy alto.
- `page` o `per_page` inválidos pueden producir offsets erróneos.
- En una API expuesta, esto es un vector simple de abuso y degradación de rendimiento.

**Cómo corregirlo:**
Validar los parámetros con límites explícitos, idealmente en un schema de request o en una función de parsing centralizada.

**Ejemplo recomendado:**

```python
if page < 1 or per_page < 1 or per_page > 100:
    abort(400, description="Invalid pagination parameters")
```

---

## MED-013
**Severidad:** Medio

**Tipo:** Problema de arquitectura

**Ubicación exacta:**

- Archivo: [backend/app/__init__.py](backend/app/__init__.py#L19)
- Línea: 19-20
- Clase: `create_app`
- Método/Función: `create_app`

**Fragmento afectado:**

```python
with app.app_context():
    Base.metadata.create_all(db.engine)
```

**Descripción del problema:**
La app crea el esquema en tiempo de arranque. Eso evita migraciones reales, oculta cambios de esquema y no escala bien cuando la base ya existe o cuando hay varias versiones de la aplicación conviviendo.

**Por qué es un problema:**

- No hay versionado de esquema.
- No hay trazabilidad de cambios en la base.
- Un despliegue con datos reales puede terminar en comportamientos inconsistentes.

**Cómo corregirlo:**
Sustituir `create_all` por migraciones gestionadas con Alembic y mover la inicialización del esquema a un flujo explícito de deploy.

**Ejemplo recomendado:**

```python
# create_all fuera del arranque de la app
# usar alembic upgrade head durante el deploy
```

---

## MED-014
**Severidad:** Medio

**Tipo:** Riesgo técnico

**Ubicación exacta:**

- Archivo: [backend/run.py](backend/run.py#L5)
- Línea: 5
- Clase: N/A
- Método/Función: N/A

**Fragmento afectado:**

```python
if __name__ == "__main__":
    app.run(debug=True)
```

**Descripción del problema:**
`debug=True` deja el servidor en modo desarrollo. Si este entrypoint se usa fuera de local, expone trazas, consola interactiva y una superficie de riesgo innecesaria.

**Por qué es un problema:**

- Es una mala práctica de seguridad para cualquier entorno que no sea desarrollo local.
- Puede exponer detalles internos de la aplicación.
- Suele terminar en errores de despliegue si alguien reutiliza `run.py` de forma ingenua.

**Cómo corregirlo:**
Leer la configuración desde variables de entorno y dejar el modo debug desactivado por defecto.

**Ejemplo recomendado:**

```python
import os

app.run(debug=os.getenv("FLASK_DEBUG") == "1")
```

---

## MED-015
**Severidad:** Medio

**Tipo:** Deuda técnica

**Ubicación exacta:**

- Archivo: [ROADMAP.md](ROADMAP.md#L50)
- Línea: 50
- Clase: N/A
- Método/Función: N/A

**Fragmento afectado:**

```markdown
- [ ] `pytest` + configuración de app de test
```

**Descripción del problema:**
El roadmap deja explícitamente pendiente la suite de pruebas y, además, no hay carpeta de tests visible en el repositorio inspeccionado. Eso significa que el proyecto se está manteniendo sin red de seguridad.

**Por qué es un problema:**

- Cada cambio puede romper la API sin detección automática.
- No hay base objetiva para refactorizar con confianza.
- En una entrevista o portfolio profesional, la ausencia de tests baja de forma clara la credibilidad técnica.

**Cómo corregirlo:**
Agregar tests de servicio, repositorio y endpoints, con fixtures de app y base de datos aislada.

**Ejemplo recomendado:**

```python
def test_get_tasks_returns_200(client):
    response = client.get("/api/v1/tasks")
    assert response.status_code == 200
```

---

# Aspectos Bien Implementados

- La separación entre rutas, servicios, repositorios, modelos y schemas es correcta como base arquitectónica.
- El uso de `Blueprint`s y una versión explícita de API (`/api/v1`) está bien encaminado.
- La capa de errores devuelve un payload normalizado y reutilizable con `api_error`.
- Las operaciones de escritura en el servicio hacen `rollback()` ante fallos de base de datos, lo cual evita estados parcialmente confirmados.
- El uso de Pydantic para request/response models es una buena decisión para tipado y validación.
- La división entre plantillas, estáticos y backend evita mezclar responsabilidades de presentación con persistencia.

# Resumen Ejecutivo

- Hallazgos críticos: 5.
- Hallazgos altos: 5.
- Hallazgos medios: 5.
- Hallazgos bajos: 0.

Principales riesgos del proyecto:

- La paginación no reporta datos reales y el endpoint de listado puede romperse con casos normales como una lista vacía.
- El `PATCH` puede corromper registros y los errores de validación no se traducen de forma consistente.
- Hay una vulnerabilidad XSS en el frontend estático.
- No existe autenticación ni autorización, así que no hay aislamiento entre usuarios.
- No hay tests y el esquema de base de datos se crea en arranque en lugar de gestionarse con migraciones.

Principales áreas débiles:

- Manejo de excepciones.
- Paginación y contratos REST.
- Seguridad de frontend y aislamiento de datos.
- Testing y ciclo de vida de la base de datos.

Principales fortalezas:

- Estructura en capas razonable.
- Pydantic y SQLAlchemy están presentes y separados por responsabilidad.
- Hay una intención clara de normalizar errores y respuestas.

# Evaluación General

| Área | Nota | Justificación breve |
|---|---:|---|
| Arquitectura | 4/10 | La separación por capas existe, pero faltan auth, migraciones y el flujo de errores no está bien cerrado. |
| Flask | 4/10 | Hay Blueprints y factory, pero el manejo HTTP tiene errores de status, contratos rotos y validación débil. |
| SQLAlchemy | 3/10 | Hay repo/service layer y rollback, pero el conteo, la paginación y la gestión de esquema están mal resueltos. |
| Pydantic | 4/10 | Los schemas están bien introducidos, pero `PATCH` y el manejo de validación en `POST` están mal integrados. |
| Manejo de excepciones | 2/10 | Hay varios fallos objetivos de captura y traducción de errores; la estrategia actual no es robusta. |
| Seguridad | 2/10 | XSS, ausencia de auth, debug activo y entradas sin límites hacen que el proyecto no sea apto para producción. |
| Testing | 1/10 | No hay suite visible y el roadmap confirma que sigue pendiente. |
| Calidad de código | 4/10 | La base es legible, pero hay duplicación, contratos inconsistentes y errores semánticos importantes. |
| Mantenibilidad | 3/10 | Sin tests ni migraciones, con errores de validación dispersos, el coste de cambio es alto. |
| Escalabilidad | 3/10 | SQLite, `create_all` y ausencia de auth/ownership limitan mucho la evolución. |
| Preparación para entrevistas técnicas | 4/10 | La estructura demuestra intención técnica, pero los fallos funcionales y la falta de tests reducen bastante la credibilidad del portfolio. |

# Plan de Corrección Prioritario

## Prioridad 1
Problemas que deben corregirse inmediatamente.

- Corregir el conteo total de paginación en el repositorio y el cálculo de `total_pages` en el servicio. Sin esto, la API de listado no es confiable.
- Reparar el `PATCH` para que solo actualice campos enviados explícitamente y no sobrescriba valores con `NULL`.
- Corregir la captura de excepciones en `PUT` y `PATCH`, porque `DataValidationError` hoy no se traduce correctamente a 400.
- Añadir manejo de validación en `POST`, porque un body inválido hoy puede acabar en 500.
- Eliminar el uso inseguro de `innerHTML`, porque hay un riesgo real de XSS persistente.
- Introducir autenticación y autorización con ownership por usuario antes de considerar el proyecto apto para portfolio serio o producción.

## Prioridad 2
Problemas importantes pero no críticos.

- Hacer que `GET /tasks` devuelva siempre un payload consistente y use `200 OK`.
- Validar correctamente `completed=false` y no depender de checks de truthiness para filtros booleanos.
- Limitar `page` y `per_page` con rangos explícitos para evitar consultas abusivas.
- Sustituir `create_all` por migraciones gestionadas con Alembic.
- Desactivar `debug=True` por defecto en el entrypoint.

## Prioridad 3
Mejoras de calidad y refactorización.

- Añadir una suite mínima de tests con `pytest`.
- Centralizar aún más la traducción de errores en handlers globales para reducir lógica repetida en rutas.
- Endurecer los schemas Pydantic con restricciones y comportamiento explícito para entradas desconocidas.
- Revisar la documentación para que no prometa capacidades que el código todavía no entrega.