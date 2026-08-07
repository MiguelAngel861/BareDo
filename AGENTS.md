# AGENTS.md

Guía operativa del repo: planes de refactor (`docs/plans`) y sesiones de grilling. Lee antes de tocar código.

---

## 1. El repo en 10 segundos

Monorepo. `backend/` = API Flask pura. `frontend/` = SPA (no tocar). `docs/` = planes de refactor + templates. Regla central: **los cambios de arquitectura se planifican antes de implementarse** (plan JSON + grilling).

---

## 2. Sistema de planes

### 2.1 Layout

```
docs/
├── plans/                         # Un plan por archivo
│   └── backend-refactor-001.json
└── templates/                     # Reusable por todo plan
    ├── refactor-plan.schema.json  # Schema obligatorio
    ├── refactor-plan.template.json
    └── refactor-plan.example.json
```

### 2.2 Reglas

1. Un plan = un JSON en `docs/plans/`, nombrado `{dominio}-refactor-{NNN}.json`.
2. **Un plan que no cumple el schema no existe.** Validar SIEMPRE (sección 3).
3. Durante el grilling el plan se edita **solo** al cerrar decisiones. Los cambios van a `plan.historial` (append-only, fecha + versión).
4. `plan.estado` ∈ `draft | aprobado | en_progreso | completado | cancelado | pausado`. Se actualiza según avancen las fases.
5. Decisiones con prefijo de categoría: `G`=arquitectura/grilling, `D`=duplicación/cleanup, `T`=tests, `M`=migraciones/config, `P`=deploy, `B`=bug/sospechoso. Las tareas referencian decisiones en `decisiones_ref`. **No romper referencias.**
6. Fases secuenciales (`F0`…`Fn`), con `branches_prefix`, tareas, gate bloqueante y `depende_de`.
7. `$schema` apunta a `../templates/refactor-plan.schema.json`. Cambiar la ruta = actualizar todos los planes.

### 2.3 Secciones del schema

| Sección | Para qué |
|---|---|
| `plan` | Metadatos: id, versión, estado, autor, fechas, prefijo de ramas |
| `alcance` | Objetivo, contexto, `in_scope`/`out_of_scope` (evita scope creep) |
| `decisiones` | Cada decisión con opciones, justificación, impacto, archivos |
| `estructura` | Árbol ASCII, contrato de dependencias, archivos nuevos/modif/eliminados |
| `fases` | Roadmap ejecutable con gates bloqueantes |
| `tests` | Stack, layout, fixtures, config pytest/ruff, gate de cobertura |
| `riesgos` | Probabilidad/impacto + mitigación |
| `metricas_exito` | Condiciones verificables del cumplimiento |
| `historial` | Log append-only |

---

## 3. Validación (OBLIGATORIA antes de aprobar un plan)

`jsonschema` está como dev dep del backend. Correr:

```bash
cd backend
uv run python - <<'EOF'
from pathlib import Path
import json
from jsonschema import validate, Draft202012Validator

root = Path("..")
schema = json.loads((root / "docs/templates/refactor-plan.schema.json").read_text())
Draft202012Validator.check_schema(schema)
print("schema: valido")

for f in sorted((root / "docs/plans").glob("*.json")):
    doc = json.loads(f.read_text())
    try:
        validate(instance=doc, schema=schema)
        print(f"OK   {f.relative_to(root)}")
    except Exception as e:
        print(f"FAIL {f.relative_to(root)}: {e}")
EOF
```

Reglas:
- Salida debe ser `schema: valido` + `OK` en todo. Cualquier `FAIL` bloquea avanzar.
- Validar también los templates si se modificaron.
- Los placeholders del template deben cumplir los `pattern`/`format` del schema (nada de cadenas vacías).
- Dep nueva de validación: `uv add --dev <paquete>` en `backend/`.

---

## 4. Sesiones de grilling

GRILLING = interrogatorio para construir/afinar un plan.

### 4.1 Cuándo
- El usuario pide planear un refactor/reestructuración.
- Un plan de `docs/plans/` tiene fases sin decisiones.
- El usuario pide "grilling", "interrogatorio" o "sharpening".

### 4.2 Antes de preguntar
1. **Lee TODO el código afectado** (o el plan existente). Nada de preguntar sobre suposiciones.
2. Inventaría en silencio: estructura, duplicación, código muerto, bugs latentes, imports sin usar.
3. Caza patrones repetidos (try/except idénticos, respuestas construidas igual, helpers por ruta). Esos son los que se eliminan.
4. Propón el mapa de capas actual y contratos de dependencia **antes** de las preguntas.

### 4.3 Formato
- Rondas numeradas, agrupadas por tema (arquitectura, persistencia, tests, deploy).
- Una pregunta por turno, o bloque numerado con opción "no aplica>/indiferente".
- Cada pregunta trae: contexto con cita real (`ruta:línea`), opciones con trade-offs honestos, y `(Recomendado)` cuando exista una.
- No preguntes lo que ya se desprende de una decisión previa.

### 4.4 Registro
- Cerrar cada decisión en voz alta: *"Anotado G3: sesión explícita pasada al repo"*.
- Numerar por categoría (2.2 punto 5).
- Al final: consolidar tabla de decisiones + estructura + fases → plan JSON.

### 4.5 Cierre
1. Tabla de TODAS las decisiones.
2. Árbol de carpetas objetivo.
3. Mapeo archivo por archivo (nuevo/modificado/eliminado).
4. Fases con gates y dependencias.
5. **Pregunta de cierre obligatoria**: ¿apruebas el plan, lo matizas o lo persistes?
6. Si se aprueba → materializar JSON + validar (sección 3) + registrar en `historial`.

### 4.6 Antipatrones
- ❌ Preguntar lo que se responde leyendo código.
- ❌ Escribir el plan sin grilling (salvo pedido explícito).
- ❌ Editar el plan JSON con el grilling abierto.
- ❌ Dar por elegida la opción "(Recomendada)" sin confirmación del usuario.
- ❌ Dejar un plan sin validar.
- ❌ Meter decisiones no preguntadas (inventadas).

---

## 5. Flujo estándar

```
1. Pedido de planear/refactorear
2. Leer código + inventariar (4.2)
3. Grilling por rondas (4.3)
4. Cerrar decisiones (4.4)
5. Consolidar y pedir aprobación (4.5)
6. Materializar docs/plans/{dominio}-refactor-NNN.json
7. Validar con uv/jsonschema (sección 3)
8. Registrar en historial y setear estado
9. Implementar por fases con la política de ramas (5.1)
```

### 5.1 Política de ramas (regla explícita)

Una fase = una rama efímera. Al terminar la fase, la rama SE ELIMINA. Solo viven `dev` y `main`.

1. Rama por fase: `git checkout dev && git checkout -b {fases[n].rama}` (ej: `refactor/f4-persistence-layer`).
2. Todo el WIP de la fase va a esa rama. Prohibido commitear a `dev`/`main` durante la fase.
3. Gate cumplido → merge a `dev` (merge --no-ff).
4. Después del merge, la rama muere: `git branch -d` + `git push origin --delete`.
5. Si queda una rama de fase en remoto al avanzar, es un error, corregirlo antes de la próxima fase.
6. `main` solo recibe merges desde `dev` (release en hitos del ROADMAP). Nunca rama a rama.
7. El plan documenta `rama` por fase pero NO guarda estado git. Auditar con `git branch --merged` / `git status`.

Checklist al cerrar fase:

```bash
git checkout dev && git pull
git merge --no-ff <fase-rama>
git branch -d <fase-rama>
git push origin --delete <fase-rama>
git push origin dev
git branch --list   # solo dev y main
```

---

## 6. Convenciones

- **Deps**: `uv` (todo en `backend/pyproject.toml` + `backend/uv.lock`). Agregar con `uv add`; nunca a mano sin regenerar lock.
- **Lint/format**: `ruff` (`[tool.ruff]`). Antes de cerrar trabajo en `backend/`: `cd backend && uv run ruff check && uv run ruff format`.
- **Tests**: pytest (`[tool.pytest.ini_options]`). Correr: `cd backend && uv run pytest`.
- **Frontend**: intocable desde tareas de backend.
- **Idioma**: español. JSONs pueden ir sin acentos.
- **No comentar código salvo que se pida. No commitear sin pedido explícito.**