# Resumen General

El proyecto tiene una base arquitectónica útil para un portfolio, pero hoy no es seguro ni confiable para presentarlo como backend profesional. La auditoría previa dejó expuestos fallos objetivos de paginación, manejo de excepciones, validación de entradas, seguridad en frontend, control de acceso, persistencia y testing.

Los riesgos principales son concretos: la lista de tareas devuelve metadatos incorrectos, un PATCH puede sobrescribir datos con nulos, algunos payloads inválidos terminan en 500, la vista HTML tiene una superficie de XSS, no existe autenticación ni ownership y no hay suite de pruebas visible. Además, el esquema se crea al arrancar la app, lo que bloquea una evolución controlada de la base de datos.

El nivel actual del código se puede describir como una base de junior con intención arquitectónica correcta, pero con bloqueos funcionales y de seguridad que impiden tratarlo como portfolio sólido. El objetivo de esta remediación es llevarlo a un estándar de entrevista backend creíble: errores bien traducidos, API estable, persistencia controlada, seguridad mínima razonable, y una base de tests que proteja los cambios.

# Cobertura de Hallazgos

| Hallazgo | Acción correctiva principal | Fase | PR sugerido |
|---|---|---|---|
| CRIT-001 | Contar filas antes de paginar | Fase 1 | PR-001 |
| CRIT-002 | Calcular total_pages con per_page | Fase 1 | PR-001 |
| HIGH-007 | Devolver lista vacía con contrato estable | Fase 1 | PR-001 |
| HIGH-008 | Corregir status 200 y metadatos reales | Fase 1 | PR-001 |
| MED-011 | Preservar completed=false en filtros | Fase 1 | PR-001 |
| MED-012 | Validar page y per_page con límites | Fase 1 | PR-001 |
| CRIT-003 | PATCH con exclude_unset | Fase 2 | PR-002 |
| CRIT-004 | Capturar ValidationError y DataValidationError correctamente | Fase 2 | PR-002 |
| CRIT-005 | Corregir la misma captura en PATCH | Fase 2 | PR-002 |
| HIGH-006 | Manejar validación del body en POST | Fase 2 | PR-002 |
| HIGH-009 | Eliminar innerHTML y usar textContent | Fase 3 | PR-003 |
| MED-014 | Mover debug a configuración por entorno | Fase 3 | PR-003 |
| HIGH-010 | Introducir autenticación y ownership | Fase 3 | PR-004 |
| MED-013 | Introducir migraciones con Alembic | Fase 4 | PR-005 |
| MED-015 | Añadir base de pruebas con pytest | Fase 4 | PR-006 |

# Roadmap de Remediación

## Fase 1 — Hacer confiable la lectura de datos

**Objetivo:** corregir la ruta de listado y su metadata para que la API devuelva información real, estable y predecible.

**Duración estimada:** 1 a 2 días.

**Riesgos mitigados:** paginación incorrecta, filtros que fallan para `completed=false`, respuestas vacías que rompen el endpoint y abuso por parámetros de consulta sin límite.

### PR-001

**Título:** `fix(tasks): make list endpoint return a stable pagination envelope`

**Archivos afectados:**

- [backend/app/repositories/tasks_repository.py](backend/app/repositories/tasks_repository.py#L10)
- [backend/app/api/v1/services/tasks_service.py](backend/app/api/v1/services/tasks_service.py#L13)
- [backend/app/api/v1/routes/tasks.py](backend/app/api/v1/routes/tasks.py#L19)

**Hallazgos que resuelve:**

- CRIT-001
- CRIT-002
- HIGH-007
- HIGH-008
- MED-011
- MED-012

**Descripción:**
La lista de tareas debe calcular el total real antes de aplicar `LIMIT/OFFSET`, devolver siempre el mismo contrato, representar correctamente páginas vacías y respetar filtros booleanos. El endpoint debe responder `200 OK`, no `201`, y debe validar `page` y `per_page` con límites explícitos.

**Commit 1**

**Mensaje:**

```text
fix(repository): count filtered rows before pagination
```

**Cambios:**

- Calcular el `count` sobre la consulta filtrada, no sobre la consulta ya paginada.
- Reorganizar `get_all` para separar consulta base, conteo y página.
- Eliminar la dependencia del conteo derivado de `data_stmt`.

**Commit 2**

**Mensaje:**

```text
fix(service): compute pagination metadata from total rows
```

**Cambios:**

- Corregir la fórmula de `total_pages` usando `per_page`.
- Asegurar que el servicio devuelva un envelope estable incluso cuando no haya tareas.
- Preparar el payload para que la ruta no tenga que reconstruir metadatos.

**Commit 3**

**Mensaje:**

```text
fix(api): validate list query parameters and return 200
```

**Cambios:**

- Corregir el uso de `completed=false` en el filtro.
- Validar `page` y `per_page` con límites razonables.
- Hacer que `GET /tasks` responda `200 OK` y use el payload producido por el servicio.

---

## Fase 2 — Corregir validación y semántica de escritura

**Objetivo:** hacer que `POST`, `PUT` y `PATCH` traduzcan errores de forma consistente y que `PATCH` no destruya datos no enviados.

**Duración estimada:** 1 a 2 días.

**Riesgos mitigados:** 500 en payloads inválidos, sobrescritura accidental de campos con `None`, captura incorrecta de excepciones y comportamiento inconsistente entre rutas.

### PR-002

**Título:** `fix(tasks): make POST PUT PATCH validation deterministic`

**Archivos afectados:**

- [backend/app/api/v1/routes/tasks.py](backend/app/api/v1/routes/tasks.py#L19)
- [backend/app/api/v1/services/tasks_service.py](backend/app/api/v1/services/tasks_service.py#L43)
- [backend/app/errors/handlers.py](backend/app/errors/handlers.py#L7)
- [backend/app/errors/exceptions.py](backend/app/errors/exceptions.py#L1)

**Hallazgos que resuelve:**

- CRIT-003
- CRIT-004
- CRIT-005
- HIGH-006

**Descripción:**
La capa HTTP debe validar el cuerpo con seguridad, la capa de servicio debe seguir siendo responsable de reglas de negocio y persistencia, y la capa de errores debe traducir de forma estable las excepciones esperadas. `PATCH` debe enviar solo campos modificados y `POST` no debe explotar si el body viene vacío o mal formado.

**Commit 1**

**Mensaje:**

```text
fix(api): guard request JSON and validate input bodies
```

**Cambios:**

- Proteger `request.get_json()` con fallback seguro.
- Capturar `ValidationError` en el borde HTTP o llevarlo a un handler global.
- Asegurar que `POST` responda `400` ante cuerpos inválidos.

**Commit 2**

**Mensaje:**

```text
refactor(api): preserve PATCH semantics with exclude_unset
```

**Cambios:**

- Cambiar `TaskPatch.model_dump()` por `TaskPatch.model_dump(exclude_unset=True)`.
- Evitar sobrescritura de columnas con `None` cuando el cliente no envió esos campos.
- Mantener `PUT` como actualización completa y `PATCH` como parcial.

**Commit 3**

**Mensaje:**

```text
refactor(errors): map domain errors centrally in Flask handlers
```

**Cambios:**

- Corregir la captura de `ValidationError` y `DataValidationError` con tupla de excepciones o handlers globales.
- Mantener los errores de negocio como errores de dominio, no como fallos internos.
- Homogeneizar el formato de respuesta de error.

---

## Fase 3 — Reducir superficie de ataque y endurecer runtime

**Objetivo:** eliminar la vía de XSS del frontend y sacar la configuración de debug del flujo normal de ejecución.

**Duración estimada:** 1 a 2 días.

**Riesgos mitigados:** ejecución de JavaScript inyectado, exposición de trazas de debug y comportamiento inseguro en entornos no locales.

### PR-003

**Título:** `security(web): render tasks safely and move debug to env`

**Archivos afectados:**

- [backend/app/views/static/script.js](backend/app/views/static/script.js#L40)
- [backend/run.py](backend/run.py#L1)

**Hallazgos que resuelve:**

- HIGH-009
- MED-014

**Descripción:**
La vista debe dejar de interpolar contenido no confiable con `innerHTML` y construir nodos DOM con `textContent`. El entrypoint debe dejar de depender de `debug=True` y pasar a una variable de entorno controlada.

**Commit 1**

**Mensaje:**

```text
fix(frontend): render task list without innerHTML
```

**Cambios:**

- Reemplazar interpolación HTML por creación de nodos DOM.
- Escapar o representar como texto `title`, `description` y cualquier otro campo visible.
- Mantener el mismo comportamiento visual sin aceptar markup inyectado.

**Commit 2**

**Mensaje:**

```text
chore(runtime): read Flask debug flag from environment
```

**Cambios:**

- Mover `debug=True` a una bandera de entorno.
- Dejar `debug` apagado por defecto.
- Preparar `run.py` para diferenciar desarrollo local y despliegue.

### PR-004

**Título:** `feat(auth): protect task CRUD with ownership`

**Archivos afectados:**

- [backend/app/api/v1/routes/tasks.py](backend/app/api/v1/routes/tasks.py)
- [backend/app/api/v1/services/tasks_service.py](backend/app/api/v1/services/tasks_service.py)
- [backend/app/models/tasks.py](backend/app/models/tasks.py)
- Nuevos archivos de autenticación y contexto de usuario

**Hallazgos que resuelve:**

- HIGH-010

**Descripción:**
Las tareas no pueden seguir siendo globales si el objetivo es un backend presentable en entrevista. Hay que introducir un usuario actual, asociar cada tarea a un propietario y filtrar todo acceso por ownership. Esto no es un ajuste de detalle: es un cambio estructural que cierra un riesgo funcional y de seguridad.

**Commit 1**

**Mensaje:**

```text
feat(auth): add current user context and task ownership
```

**Cambios:**

- Introducir un modelo o contrato de usuario.
- Agregar `user_id` a tareas.
- Preparar dependencias para obtener el usuario actual en la capa HTTP.

**Commit 2**

**Mensaje:**

```text
feat(auth): restrict task queries to the task owner
```

**Cambios:**

- Filtrar `get_by_id`, `update`, `delete` y listados por propietario.
- Bloquear acceso a recursos ajenos con `403` o `404` según la política elegida.
- Ajustar servicios y repositorios para aceptar contexto de usuario.

**Commit 3**

**Mensaje:**

```text
test(auth): cover unauthorized access and ownership rules
```

**Cambios:**

- Agregar pruebas de acceso a recursos ajenos.
- Cubrir el caso de creación, lectura, edición y borrado por propietario.
- Validar que no se filtre información entre usuarios.

---

## Fase 4 — Formalizar persistencia y proteger la regresión

**Objetivo:** dejar de crear el esquema al arrancar, introducir migraciones reales y fijar una base mínima de pruebas.

**Duración estimada:** 2 a 5 días.

**Riesgos mitigados:** cambios de esquema inseguros, despliegues frágiles, regresiones sin detección y pérdida de control sobre el lifecycle de la base de datos.

### PR-005

**Título:** `chore(db): introduce Alembic migrations and stop auto-creating tables`

**Archivos afectados:**

- [backend/app/__init__.py](backend/app/__init__.py#L19)
- [backend/app/models/tasks.py](backend/app/models/tasks.py#L9)
- Nuevos archivos de Alembic

**Hallazgos que resuelve:**

- MED-013

**Descripción:**
La inicialización automática del esquema debe salir del arranque normal de la app. En su lugar, hay que versionar migraciones y ejecutar los cambios de forma controlada en deploy o durante tareas explícitas de administración.

**Commit 1**

**Mensaje:**

```text
chore(db): scaffold Alembic and initial migration
```

**Cambios:**

- Crear la estructura de migraciones.
- Capturar el estado inicial del esquema.
- Documentar cómo aplicar y revertir migraciones.

**Commit 2**

**Mensaje:**

```text
refactor(app): remove create_all from app startup
```

**Cambios:**

- Eliminar `Base.metadata.create_all(db.engine)` del arranque.
- Mantener la app lista para migraciones previas al boot.
- Evitar que el entorno de ejecución modifique el esquema por accidente.

### PR-006

**Título:** `test(api): add baseline pytest coverage for tasks flow`

**Archivos afectados:**

- Nuevos tests de ruta, servicio y repositorio
- Fixtures de Flask y base de datos de prueba

**Hallazgos que resuelve:**

- MED-015

**Descripción:**
El proyecto necesita una red de seguridad mínima. Hay que cubrir el flujo feliz y los casos negativos básicos: paginación, payload inválido, recurso inexistente, filtro booleano, creación, edición, borrado y contrato de respuesta.

**Commit 1**

**Mensaje:**

```text
test(config): add Flask and database test fixtures
```

**Cambios:**

- Preparar app de testing.
- Crear fixture de cliente Flask.
- Aislar la base de datos para cada test o módulo.

**Commit 2**

**Mensaje:**

```text
test(tasks): cover list create update patch delete and negatives
```

**Cambios:**

- Probar `GET /tasks`, `POST`, `PUT`, `PATCH` y `DELETE`.
- Cubrir `404`, `400`, lista vacía y filtrado de `completed=false`.
- Validar el envelope de paginación y el código HTTP correcto.

# Guía de Implementación por Hallazgo

## Hallazgo CRIT-001

**Ubicación:** [backend/app/repositories/tasks_repository.py](backend/app/repositories/tasks_repository.py#L25)

**Archivo:** `backend/app/repositories/tasks_repository.py`

**Clase:** `TasksRepository`

**Método:** `get_all`

**Problema original:** el conteo total se hace sobre la consulta ya paginada.

**Objetivo de la corrección:** devolver el número real de filas filtradas, independientemente de la página solicitada.

**Pasos concretos:**

1. Abrir `get_all`.
2. Separar la consulta base filtrada de la consulta paginada.
3. Calcular el `count` sobre la consulta filtrada, antes de `limit` y `offset`.
4. Mantener la consulta de datos para la página actual.
5. Devolver datos y metadatos coherentes.
6. Añadir prueba de conteo con varias páginas.

**Código que debería modificarse:**

```python
items_stmt = select(func.count()).select_from(data_stmt.subquery())
```

Debe pasar a contar sobre la consulta base filtrada.

**Conceptos que debo estudiar:**

- SQLAlchemy Core y `select`.
- Conteo real versus conteo de página.
- `limit`, `offset` y subqueries.

**Cómo validar la corrección:**

- Ejecutar una lista con más elementos que `per_page`.
- Verificar que `total` refleja el total real.
- Confirmar que `total_pages` coincide con el número esperado.

---

## Hallazgo CRIT-002

**Ubicación:** [backend/app/api/v1/services/tasks_service.py](backend/app/api/v1/services/tasks_service.py#L22)

**Archivo:** `backend/app/api/v1/services/tasks_service.py`

**Clase:** `TasksService`

**Método:** `get_all_tasks`

**Problema original:** `total_pages` divide por `total_tasks` en vez de por `per_page`.

**Objetivo de la corrección:** calcular una paginación real y estable.

**Pasos concretos:**

1. Abrir el cálculo de `total_pages`.
2. Sustituir el divisor incorrecto.
3. Decidir si la colección vacía devuelve `0` o `1` páginas y documentarlo.
4. Devolver un envelope consistente.
5. Agregar una prueba con colecciones pequeñas y grandes.

**Código que debería modificarse:**

```python
total_pages = (total_tasks + per_page - 1) // total_tasks if per_page else 1
```

Debe usar `per_page` como divisor.

**Conceptos que debo estudiar:**

- Paginación por páginas en APIs REST.
- Cálculo entero de `ceil`.
- Contratos de respuesta estables.

**Cómo validar la corrección:**

- Crear 11 registros con `per_page=10`.
- Confirmar `total_pages=2`.
- Confirmar que la última página devuelve los registros restantes.

---

## Hallazgo CRIT-003

**Ubicación:** [backend/app/api/v1/routes/tasks.py](backend/app/api/v1/routes/tasks.py#L87-L88)

**Archivo:** `backend/app/api/v1/routes/tasks.py`

**Clase:** `tasks_bp`

**Método:** `patch_task`

**Problema original:** `PATCH` serializa también los campos no enviados y puede sobrescribir datos con `None`.

**Objetivo de la corrección:** preservar la semántica parcial de PATCH.

**Pasos concretos:**

1. Abrir `patch_task`.
2. Cambiar `model_dump()` por `model_dump(exclude_unset=True)`.
3. Verificar que un campo omitido no llega al servicio.
4. Mantener `PUT` para actualizaciones completas.
5. Añadir una prueba que parchea un solo campo.

**Código que debería modificarse:**

```python
patched_task = service.update_task(task_id, task_data.model_dump())
```

Debe cambiar a `exclude_unset=True`.

**Conceptos que debo estudiar:**

- Diferencia entre PUT y PATCH.
- `model_dump(exclude_unset=True)` en Pydantic v2.
- Semántica de actualización parcial.

**Cómo validar la corrección:**

- Enviar un PATCH con un solo campo.
- Confirmar que los demás campos permanecen intactos.
- Confirmar que no se escriben nulos inesperados.

---

## Hallazgo CRIT-004

**Ubicación:** [backend/app/api/v1/routes/tasks.py](backend/app/api/v1/routes/tasks.py#L76)

**Archivo:** `backend/app/api/v1/routes/tasks.py`

**Clase:** `tasks_bp`

**Método:** `update_task`

**Problema original:** la captura `except ValidationError or DataValidationError` no hace lo que aparenta.

**Objetivo de la corrección:** traducir correctamente los errores de validación a una respuesta HTTP adecuada.

**Pasos concretos:**

1. Corregir la sintaxis del `except`.
2. Decidir si la ruta captura excepciones o si el handler global las traduce.
3. Mantener la diferencia entre error de validación y error de infraestructura.
4. Registrar el error antes de responder si es necesario.
5. Añadir prueba para validación fallida.

**Código que debería modificarse:**

```python
except ValidationError or DataValidationError:
    abort(400)
```

Debe convertirse en una tupla de excepciones o eliminarse a favor de handlers globales.

**Conceptos que debo estudiar:**

- `except (A, B)` en Python.
- Flask error handlers.
- Diferencia entre error de cliente y error interno.

**Cómo validar la corrección:**

- Mandar un body inválido.
- Confirmar que responde `400`.
- Confirmar que no se convierte en `500`.

---

## Hallazgo CRIT-005

**Ubicación:** [backend/app/api/v1/routes/tasks.py](backend/app/api/v1/routes/tasks.py#L92)

**Archivo:** `backend/app/api/v1/routes/tasks.py`

**Clase:** `tasks_bp`

**Método:** `patch_task`

**Problema original:** la misma captura incorrecta existe en PATCH.

**Objetivo de la corrección:** que PUT y PATCH compartan una política de errores consistente.

**Pasos concretos:**

1. Corregir la captura como en `update_task`.
2. Revisar si ambas rutas deben delegar a un helper común.
3. Evitar duplicar lógica de validación entre PUT y PATCH.
4. Registrar y traducir el error en un solo sitio.
5. Cubrir el caso con pruebas parametrizadas.

**Código que debería modificarse:**

```python
except ValidationError or DataValidationError:
    abort(400)
```

Debe usar captura correcta o un handler centralizado.

**Conceptos que debo estudiar:**

- Diseño de handlers globales.
- DRY en rutas HTTP.
- Captura de excepciones por dominio.

**Cómo validar la corrección:**

- Enviar un PATCH inválido.
- Confirmar `400`.
- Confirmar que el mensaje de error es coherente con PUT.

---

## Hallazgo HIGH-006

**Ubicación:** [backend/app/api/v1/routes/tasks.py](backend/app/api/v1/routes/tasks.py#L59)

**Archivo:** `backend/app/api/v1/routes/tasks.py`

**Clase:** `tasks_bp`

**Método:** `add_task`

**Problema original:** la creación no maneja de forma segura los payloads inválidos.

**Objetivo de la corrección:** convertir errores de validación de Pydantic en respuestas de cliente, no en fallos internos.

**Pasos concretos:**

1. Proteger `request.get_json()` contra `None`.
2. Validar con Pydantic en el borde HTTP.
3. Capturar `ValidationError` o dejarlo a un handler global.
4. No pasar cuerpos vacíos al servicio.
5. Añadir prueba de body inválido.

**Código que debería modificarse:**

```python
task_data = TaskCreate(**request.get_json())
```

Debe aceptar un fallback seguro y una traducción controlada del error.

**Conceptos que debo estudiar:**

- Validación de request body.
- `ValidationError` en Pydantic.
- `abort` versus excepciones de dominio.

**Cómo validar la corrección:**

- Enviar body vacío.
- Enviar tipos incorrectos.
- Confirmar `400` con detalles útiles.

---

## Hallazgo HIGH-007

**Ubicación:** [backend/app/api/v1/routes/tasks.py](backend/app/api/v1/routes/tasks.py#L31)

**Archivo:** `backend/app/api/v1/routes/tasks.py`

**Clase:** `tasks_bp`

**Método:** `get_tasks`

**Problema original:** el endpoint asume que siempre existe la clave `tasks` y rompe cuando el servicio devuelve un diccionario vacío.

**Objetivo de la corrección:** que una colección vacía sea un caso válido, no una excepción.

**Pasos concretos:**

1. Hacer que el servicio devuelva un envelope consistente.
2. Eliminar el acceso directo a `"tasks"` sobre un diccionario potencialmente vacío.
3. Devolver la respuesta aunque la lista esté vacía.
4. Mantener el contrato del endpoint estable.
5. Agregar prueba de lista vacía.

**Código que debería modificarse:**

```python
stmt = service.get_all_tasks(page, per_page, filters, sort)["tasks"]
```

Debe operar sobre un payload que siempre contenga `tasks` y `meta`.

**Conceptos que debo estudiar:**

- Contratos de respuestas vacías.
- Colecciones versus errores.
- Diseño de envelopes JSON.

**Cómo validar la corrección:**

- Borrar todos los registros y llamar al endpoint.
- Confirmar que responde con `200` y `tasks: []`.

---

## Hallazgo HIGH-008

**Ubicación:** [backend/app/api/v1/routes/tasks.py](backend/app/api/v1/routes/tasks.py#L34-L43)

**Archivo:** `backend/app/api/v1/routes/tasks.py`

**Clase:** `tasks_bp`

**Método:** `get_tasks`

**Problema original:** la ruta recalcula metadatos con el tamaño de la página actual y responde `201` en una lectura.

**Objetivo de la corrección:** devolver metadatos reales y un código HTTP correcto.

**Pasos concretos:**

1. Usar la metadata producida por el servicio.
2. Eliminar la reconstrucción manual con `len(validated_tasks)`.
3. Cambiar el status a `200`.
4. Confirmar que la estructura JSON no cambia entre páginas con y sin datos.
5. Agregar prueba del código HTTP.

**Código que debería modificarse:**

```python
return TaskResponse.model_validate(validated_data).model_dump(), 201
```

Debe ser una respuesta de lectura con `200` y metadata real.

**Conceptos que debo estudiar:**

- HTTP status codes.
- Paginación REST.
- Respuestas de lista versus creación.

**Cómo validar la corrección:**

- Llamar al endpoint y revisar `status_code`.
- Confirmar que `total` no depende de la página actual.

---

## Hallazgo HIGH-009

**Ubicación:** [backend/app/views/static/script.js](backend/app/views/static/script.js#L47-L54)

**Archivo:** `backend/app/views/static/script.js`

**Clase:** N/A

**Método:** `loadTasks`

**Problema original:** se inyecta contenido no confiable con `innerHTML`.

**Objetivo de la corrección:** evitar XSS persistente en la UI.

**Pasos concretos:**

1. Reemplazar el bloque que arma HTML interpolado.
2. Crear nodos DOM con `document.createElement`.
3. Escribir texto con `textContent`.
4. Mantener la misma apariencia visual.
5. Probar con títulos y descripciones que contengan caracteres especiales.

**Código que debería modificarse:**

```javascript
li.innerHTML = `
    <span>
        ${t.title} - ${t.description || ''}
    </span>
`;
```

Debe pasar a manipulación DOM segura.

**Conceptos que debo estudiar:**

- XSS persistente.
- `textContent` versus `innerHTML`.
- DOM seguro.

**Cómo validar la corrección:**

- Crear una tarea con texto que parezca HTML.
- Verificar que se muestra como texto literal.
- Confirmar que no se ejecuta JavaScript.

---

## Hallazgo HIGH-010

**Ubicación:** [backend/app/api/v1/routes/tasks.py](backend/app/api/v1/routes/tasks.py)

**Archivo:** `backend/app/api/v1/routes/tasks.py`

**Clase:** N/A

**Método:** Todas las rutas CRUD

**Problema original:** no hay autenticación ni autorización visible y las tareas son globales.

**Objetivo de la corrección:** introducir ownership por usuario y proteger CRUD.

**Pasos concretos:**

1. Definir un modelo o contrato de usuario.
2. Añadir `user_id` a la entidad de tareas.
3. Extraer el usuario actual en la capa HTTP.
4. Filtrar lecturas, actualizaciones y borrados por propietario.
5. Añadir pruebas de acceso no autorizado.

**Código que debería modificarse:**

```python
@tasks_bp.get("/tasks")
def get_tasks():
    ...
```

Todas las rutas CRUD deben tomar contexto de usuario y validar ownership.

**Conceptos que debo estudiar:**

- Autenticación versus autorización.
- Ownership de recursos.
- `403` versus `404` para recursos ajenos.

**Cómo validar la corrección:**

- Crear dos usuarios de prueba.
- Confirmar que cada uno solo ve y modifica sus tareas.
- Confirmar que no se filtra información cruzada.

---

## Hallazgo MED-011

**Ubicación:** [backend/app/repositories/tasks_repository.py](backend/app/repositories/tasks_repository.py#L92-L93)

**Archivo:** `backend/app/repositories/tasks_repository.py`

**Clase:** `TasksRepository`

**Método:** `_apply_data_filters`

**Problema original:** `completed=false` se descarta por truthiness.

**Objetivo de la corrección:** que el filtro booleano funcione para ambos valores.

**Pasos concretos:**

1. Cambiar la condición del filtro.
2. Comprobar `is not None` en lugar de truthiness.
3. Confirmar que `false` y `true` filtran correctamente.
4. Agregar prueba para ambos valores.

**Código que debería modificarse:**

```python
if task_status := filters.get("completed"):
    stmt = stmt.where(Tasks.completed == task_status)
```

Debe preservar `False` como valor válido.

**Conceptos que debo estudiar:**

- Truthiness en Python.
- Filtros booleanos.
- Diferencia entre `None` y `False`.

**Cómo validar la corrección:**

- Crear tareas completadas y no completadas.
- Filtrar por `completed=false`.
- Confirmar que solo salen las tareas pendientes.

---

## Hallazgo MED-012

**Ubicación:** [backend/app/api/v1/routes/tasks.py](backend/app/api/v1/routes/tasks.py#L22-L23)

**Archivo:** `backend/app/api/v1/routes/tasks.py`

**Clase:** `tasks_bp`

**Método:** `get_tasks`

**Problema original:** `page` y `per_page` no tienen límites explícitos.

**Objetivo de la corrección:** impedir consultas abusivas y parámetros inválidos.

**Pasos concretos:**

1. Definir límites máximos razonables.
2. Validar que `page >= 1`.
3. Validar que `per_page` esté dentro de un rango seguro.
4. Responder `400` ante valores fuera de rango.
5. Cubrir los límites con tests.

**Código que debería modificarse:**

```python
page = request.args.get("page", default=1, type=int)
per_page = request.args.get("per_page", default=100, type=int)
```

Debe pasar por una validación explícita.

**Conceptos que debo estudiar:**

- Validación de query params.
- Denegación de abuso por tamaño de página.
- Contratos de paginación.

**Cómo validar la corrección:**

- Probar `per_page=0`, `per_page=-1` y `per_page=100000`.
- Confirmar que la API responde `400`.

---

## Hallazgo MED-013

**Ubicación:** [backend/app/__init__.py](backend/app/__init__.py#L19-L20)

**Archivo:** `backend/app/__init__.py`

**Clase:** `create_app`

**Método:** `create_app`

**Problema original:** el esquema se crea al arrancar la app.

**Objetivo de la corrección:** formalizar el ciclo de vida del esquema con migraciones.

**Pasos concretos:**

1. Instalar o configurar Alembic.
2. Crear la migración inicial.
3. Eliminar `create_all` del arranque.
4. Documentar el comando de upgrade.
5. Verificar que la app sigue arrancando con la base ya migrada.

**Código que debería modificarse:**

```python
with app.app_context():
    Base.metadata.create_all(db.engine)
```

Debe salir del boot path normal.

**Conceptos que debo estudiar:**

- Migraciones de base de datos.
- Alembic.
- Deploy seguro con cambios de esquema.

**Cómo validar la corrección:**

- Borrar la base local y recrearla con migraciones.
- Confirmar que no se usa `create_all` en runtime.

---

## Hallazgo MED-014

**Ubicación:** [backend/run.py](backend/run.py#L5)

**Archivo:** `backend/run.py`

**Clase:** N/A

**Método:** N/A

**Problema original:** `debug=True` está hardcodeado.

**Objetivo de la corrección:** separar configuración de desarrollo y despliegue.

**Pasos concretos:**

1. Leer el flag de una variable de entorno.
2. Dejar debug apagado por defecto.
3. No usar `run.py` como entrypoint de producción.
4. Documentar cómo arrancar en local.
5. Verificar que la app sigue funcionando sin debug.

**Código que debería modificarse:**

```python
app.run(debug=True)
```

Debe depender de configuración externa.

**Conceptos que debo estudiar:**

- Configuración por entorno.
- Diferencias entre desarrollo y producción.
- Riesgos del debugger interactivo.

**Cómo validar la corrección:**

- Arrancar la app con y sin la variable de entorno.
- Confirmar que debug solo aparece en desarrollo.

---

## Hallazgo MED-015

**Ubicación:** [ROADMAP.md](ROADMAP.md#L50)

**Archivo:** `ROADMAP.md`

**Clase:** N/A

**Método:** N/A

**Problema original:** no hay suite visible de tests y el roadmap lo deja pendiente.

**Objetivo de la corrección:** construir una red mínima de seguridad para refactors y despliegues.

**Pasos concretos:**

1. Crear un directorio `tests`.
2. Definir fixtures de app y base de datos.
3. Agregar pruebas de rutas, servicio y repositorio.
4. Cubrir casos negativos y de borde.
5. Ejecutar la suite en local antes de cada PR.

**Código que debería modificarse:**

```markdown
- [ ] `pytest` + configuración de app de test
```

Debe pasar a una implementación real con tests ejecutables.

**Conceptos que debo estudiar:**

- pytest.
- Flask test client.
- Fixtures y aislamiento de datos.

**Cómo validar la corrección:**

- Ejecutar `pytest`.
- Confirmar que los casos felices y negativos pasan.
- Confirmar que los errores críticos detectados en la auditoría quedan cubiertos.

# Sección Especial: Manejo de Excepciones

Esta es la zona más importante del plan. El objetivo no es solo corregir `except` mal escritos; es adoptar una estrategia profesional de errores en Flask.

## Qué estás haciendo mal hoy

En las rutas de actualización y parcheo estás usando `except ValidationError or DataValidationError`, que no captura ambas excepciones. En `POST` ni siquiera capturas la validación de Pydantic. Además, el servicio convierte errores de SQLAlchemy en excepciones de dominio, pero la capa HTTP no siempre los traduce correctamente. El resultado es una mezcla peligrosa: algunos fallos de cliente terminan en 500, algunos fallos de negocio se convierten en abortos locales, y el contrato de error deja de ser consistente.

## Por qué suele pasar en perfiles junior

Suele venir de dos hábitos: intentar atrapar todo rápido para que la app “no explote”, y mezclar la lógica del transporte HTTP con la lógica de dominio. También es común usar `abort` como mecanismo universal porque parece simple, aunque en realidad empuja demasiado conocimiento HTTP hacia la capa de rutas. El síntoma típico es pensar que `except A or B` significa capturar ambas cosas; en Python no funciona así.

## Qué haría un desarrollador senior

Separaría responsabilidades de esta forma:

- La ruta valida la entrada y llama al servicio.
- El servicio traduce errores de infraestructura a errores de dominio cuando corresponde.
- Los handlers globales convierten errores de dominio y validación en respuestas HTTP.
- Los errores inesperados se registran una sola vez y no se silencian.

## Cómo reescribir el código usando tu proyecto

Tu caso actual en `backend/app/api/v1/routes/tasks.py` puede quedar así, a nivel conceptual:

```python
@tasks_bp.put("/tasks/<int:task_id>")
def update_task(task_id: int):
    payload = request.get_json() or {}
    task_data = TaskUpdate.model_validate(payload)
    updated_task = service.update_task(task_id, task_data.model_dump())
    return TaskBody.model_validate(updated_task).model_dump(), 200
```

Y en `backend/app/errors/handlers.py` deberías tener handlers que traduzcan errores esperados:

```python
@app.errorhandler(ValidationError)
def handle_validation_error(error):
    return api_error(code="BAD_REQUEST", message="Invalid payload", status=400, details=str(error))

@app.errorhandler(DataValidationError)
def handle_domain_validation_error(error):
    return api_error(code="BAD_REQUEST", message=str(error), status=400, details=None)
```

## Patrón recomendado

- Validar en el borde HTTP.
- Convertir a excepciones de dominio solo cuando haga falta.
- Centralizar el mapeo de excepciones a HTTP.
- Loguear una sola vez cuando el error sea inesperado.
- Mantener las rutas delgadas.

## Patrón a evitar

- `except Exception` como solución universal.
- `except ValidationError or DataValidationError`.
- `abort` disperso en muchas rutas sin consistencia.
- Convertir cualquier error en `400` aunque sea un fallo interno.
- Ocultar errores de SQLAlchemy sin contexto.

## Aplicación a tus hallazgos

- CRIT-004 y CRIT-005 se corrigen con captura correcta o handlers globales.
- HIGH-006 se corrige con validación segura del body y manejo explícito de `ValidationError`.
- HIGH-007 deja de ser un problema cuando el servicio nunca devuelve un diccionario vacío inesperado y la ruta no usa `KeyError` como flujo normal.

# Sección Especial: Uso de Pydantic

Pydantic está bien introducido en el proyecto, pero hoy se usa de manera incompleta. Hay que convertirlo en la capa de validación y serialización que realmente necesitas.

## Qué está mal ahora

En `TaskPatch` estás serializando campos no enviados con `None` si usas `model_dump()` sin parámetros. En `POST` y `PUT` estás confiando en instanciación directa desde `request.get_json()` sin una estrategia uniforme de manejo de errores. Además, la validación de query params no está modelada con Pydantic, así que `page`, `per_page`, `completed` y `sort` quedan repartidos entre la ruta y el repositorio.

## Qué responsabilidad debería tener Pydantic

Pydantic debe:

- Validar tipos, longitudes y rangos.
- Normalizar y parsear datos del request.
- Definir DTOs de entrada y salida.
- Separar claramente request models de response models.
- Darte serialización segura con `model_dump()` y `exclude_unset` cuando aplique.

## Qué responsabilidad NO debería tener

Pydantic no debería:

- Hablar con la base de datos.
- Hacer commits o rollbacks.
- Decidir códigos HTTP.
- Construir envelopes de error de Flask.
- Contener reglas de ownership o persistencia.

## Qué validaciones sobran y cuáles faltan

Sobran o conviene revisar:

- Validar varias veces el mismo dato en ruta, servicio y repositorio.
- Reconstruir objetos Pydantic después de haberlos construido ya una vez.

Faltan:

- Un schema para query params de listado.
- Límite máximo para `per_page`.
- Validación explícita para booleanos y strings de búsqueda.
- Política clara de campos obligatorios en `PUT` versus opcionales en `PATCH`.

## Cómo rediseñar los schemas usando tu proyecto

Tu diseño actual puede evolucionar así:

```python
class TaskBase(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title: str = Field(min_length=5, max_length=40)
    description: str = Field(default="", max_length=500)
    priority: int = Field(default=1, ge=1, le=3)


class TaskCreate(TaskBase):
    completed: bool = Field(default=False)
    due_date: datetime


class TaskUpdate(TaskBase):
    completed: bool
    due_date: datetime


class TaskPatch(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title: str | None = None
    description: str | None = None
    completed: bool | None = None
    priority: int | None = None
    due_date: datetime | None = None


class TaskListQuery(BaseModel):
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=100, ge=1, le=100)
    completed: bool | None = None
    title: str | None = None
    description: str | None = None
    sort: str | None = None
```

## Cómo separar DTOs de modelos ORM

La entidad ORM debe quedarse en `backend/app/models/tasks.py`. Los DTOs de entrada y salida deben vivir en `backend/app/api/v1/schemas/tasks_schemas.py`, o mejor aún, separados por intención si el proyecto crece: request DTOs, response DTOs y query DTOs.

En tu caso, la separación práctica sería:

- `TaskCreate`, `TaskUpdate`, `TaskPatch`: entrada.
- `TaskBody`: salida de un recurso.
- `TaskResponse`: envelope de colección.
- `TaskListQuery`: parámetros de consulta.

Eso evita que el modelo ORM se convierta en contrato HTTP y evita que el contrato HTTP se mezcle con reglas de persistencia.

## Aplicación a tus hallazgos

- CRIT-003 se corrige con `model_dump(exclude_unset=True)`.
- HIGH-006 se corrige validando el body con Pydantic en el borde HTTP.
- HIGH-007 y HIGH-008 mejoran si la respuesta de la lista usa un DTO de colección consistente.
- MED-012 mejora si `page`, `per_page`, `completed` y `sort` se modelan como un DTO de query.

# Dependencias entre Tareas

| Tarea | Depende de | Para evitar realizar cambios en orden incorrecto |
|---|---|---|
| Corregir conteo real de filas | Ninguna | No puedes calcular una metadata confiable si el conteo ya nace mal |
| Corregir total_pages y envelope de lista | Corregir conteo real de filas | El cálculo de páginas depende del total correcto |
| Validar page, per_page y completed=false | Corregir envelope de lista | Evitas validar parámetros sobre una base que ya no es estable |
| Corregir PATCH con exclude_unset | Ninguna | La semántica parcial puede arreglarse sin tocar auth o migraciones |
| Centralizar el manejo de excepciones | Corregir PATCH y la validación de POST | Si cambias primero el contrato de entrada, la traducción de errores queda clara |
| Validar POST de forma segura | Centralizar el manejo de excepciones | Evitas duplicar lógica de error en cada ruta |
| Eliminar innerHTML | Ninguna | La corrección de XSS no depende de backend |
| Mover debug a entorno | Ninguna | La configuración de runtime puede corregirse en paralelo |
| Introducir auth y ownership | Estabilizar rutas y errores | Es más fácil asegurar acceso si el contrato HTTP ya es coherente |
| Introducir Alembic | Estabilizar modelos y contrato de escritura | Evitas migrar un esquema mientras cambian simultáneamente los endpoints |
| Añadir pytest | Completar fases 1 a 4 | Las pruebas deben cubrir el comportamiento ya estabilizado |

# Plan de Aprendizaje Técnico

1. **Manejo de excepciones en Flask**
   - **Prioridad:** Alta.
   - **Motivo:** la remediación de `POST`, `PUT`, `PATCH` y los handlers globales depende directamente de esto.
   - **Relación con errores detectados:** CRIT-004, CRIT-005, HIGH-006.

2. **Pydantic v2 y serialización selectiva**
   - **Prioridad:** Alta.
   - **Motivo:** `PATCH` y la validación de entrada se arreglan con `model_validate` y `model_dump(exclude_unset=True)`.
   - **Relación con errores detectados:** CRIT-003, HIGH-006.

3. **SQLAlchemy Session Lifecycle**
   - **Prioridad:** Alta.
   - **Motivo:** necesitas entender transacciones, rollback y conteos correctos antes de introducir más cambios.
   - **Relación con errores detectados:** CRIT-001, CRIT-002, MED-013.

4. **Paginación y diseño de consultas**
   - **Prioridad:** Alta.
   - **Motivo:** el contrato del endpoint de listado es uno de los fallos más visibles.
   - **Relación con errores detectados:** CRIT-001, CRIT-002, HIGH-007, HIGH-008, MED-011, MED-012.

5. **HTTP semantics y diseño REST**
   - **Prioridad:** Alta.
   - **Motivo:** el status `201` en `GET` y la estructura inconsistente de la lista indican contrato HTTP mal aplicado.
   - **Relación con errores detectados:** HIGH-007, HIGH-008.

6. **Seguridad web básica y XSS**
   - **Prioridad:** Alta.
   - **Motivo:** el frontend actual tiene una superficie de inyección clara.
   - **Relación con errores detectados:** HIGH-009.

7. **Autorización y ownership de recursos**
   - **Prioridad:** Alta.
   - **Motivo:** sin esto no existe multiusuario real ni aislamiento de datos.
   - **Relación con errores detectados:** HIGH-010.

8. **pytest y testing de APIs Flask**
   - **Prioridad:** Alta.
   - **Motivo:** sin tests no puedes estabilizar ni demostrar las correcciones.
   - **Relación con errores detectados:** MED-015 y prácticamente todos los demás.

9. **Migraciones con Alembic**
   - **Prioridad:** Media-Alta.
   - **Motivo:** para dejar de depender de `create_all` y tener un lifecycle de base de datos profesional.
   - **Relación con errores detectados:** MED-013.

10. **Logging estructurado**
    - **Prioridad:** Media.
    - **Motivo:** después de estabilizar la app, necesitas trazabilidad para depurar y operar.
    - **Relación con errores detectados:** amplifica el valor de la corrección de errores y seguridad.

# Estado Esperado al Finalizar

Cuando completes todas las fases, el proyecto debería verse distinto en tres niveles.

Primero, a nivel funcional, desaparecerán los fallos de paginación, la corrupción accidental de `PATCH`, las respuestas 500 por validaciones previsibles, la inconsistencia de `GET /tasks`, la superficie de XSS y el acceso global sin control. La API quedará con contratos más claros y códigos HTTP coherentes.

Segundo, a nivel técnico, tendrás migraciones reales, una base de tests mínima, un manejo de excepciones centralizado, una separación más limpia entre validación, dominio y persistencia, y una estrategia de seguridad razonable para un backend de portfolio.

Tercero, a nivel de percepción profesional, el proyecto dejará de parecer un prototipo funcional y pasará a parecer una base que sí podría discutirse en una entrevista backend. La impresión esperada sería la de un desarrollador que entiende Flask, SQLAlchemy, Pydantic, errores HTTP, seguridad y calidad de entrega. El nivel que demostrará será el de un backend junior fuerte o un semi-senior inicial en fundamentos, dependiendo de la calidad final de los tests, la autenticación y el control de acceso.
