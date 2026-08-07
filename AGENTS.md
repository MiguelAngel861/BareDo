# AGENTS.md

Guía operativa del repo. **Para el sistema de planes (reglas, grilling, validación, flujo): lee `docs/PLANNING.md` antes de tocar código de planes.**

---

## 1. El repo en 10 segundos

Monorepo. `backend/` = API Flask pura en capas (`app/{api,services,repositories,...}`), `frontend/` = SPA (no tocar), `docs/` = planes + manual. Regla central: **los cambios planificables se planifican antes de implementarse** (plan JSON + grilling).

Contexto extra: `README.md` (descripción) y `ROADMAP.md` (hitos/releases). Punto de entrada del backend: `backend/wsgi.py` → `create_app()`.

Mapa del sistema de planes:

```
docs/
├── PLANNING.md                   # Manual completo (reglas, grilling, flujo, validacion)
├── plans/                        # Un plan por archivo: {dominio}-{NNN}-{slug}.json
├── templates/                    # plan.schema.json + plan.template.json + plan.example.json
└── tools/
    └── plan_validate.py          # Validador: schema, forma, id==filename, refs
```

---

## 2. Sistema de planes (acceso rápido)

Todo lo operativo está en `docs/PLANNING.md`: reglas, validación, grilling, flujo y ramas. Este apartado solo resume lo mínimo para arrancar.

- **Planificable** = cambio con fases, trade-offs o arquitectura + un plan JSON nuevo en `docs/plans/`. No planificable = trivial o reversible (ver PLANNING 4.1).
- **Un plan que no cumple el schema no existe.** Validar con plan_validate.py antes de aprobar o materializar.
- Reglas de ramas: una rama efímera por fase; solo viven `dev` y `main` (PLANNING 5.1).

---

## 3. Comandos workflow

- **Deps**: `uv` (todo en `backend/pyproject.toml` + `backend/uv.lock`). Agregar con `uv add`; nunca a mano sin regenerar lock.
- **Test selección**: `cd backend && uv run pytest`.
- **Lint/format**: `cd backend && uv run ruff check && uv run ruff format`.
- **Validación de planes**: `cd backend && uv run python ../docs/tools/plan_validate.py`.
- **Arrancar app (dev)**: `cd backend && uv run python wsgi.py`.

---

## 4. Convenciones y límites

- **Idioma**: español. JSONs pueden ir sin acentos.
- **Frontend**: intocable desde tareas de backend.
- **No comentar código salvo que se pida.**
- **Commits**: mensaje en español, corto, imperativo. Nunca commitear sin pedido explícito del usuario.
- **Docs no-code**: `AGENTS.md` y `docs/PLANNING.md` NO se editan sin pedido explícito.
- **Verificar antes de asumir**: si un paso requiere un dato no confirmado (config, migraciones, deps), verificar en el código antes de ejecutar.