# Design System — BareDo Frontend

Estilo: **Swiss Industrial Brutalist** + **Premium Utilitarian Minimalism**

---

## 1. Paleta de Colores

### Light Mode
| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#f7f7f7` | Fondo general (papel documentación) |
| `--surface` | `#ffffff` | Superficies, cards, modales |
| `--text` | `#111111` | Texto primario (tinta carbón) |
| `--text-muted` | `#4b5563` | Texto secundario, metadata |
| `--border` | `#d1d5db` | Bordes sutiles, divisores |
| `--border-strong` | `#111111` | Bordes énfasis |
| `--danger` | `#dc2626` | Errores, acciones destructivas |
| `--success` | `#15803d` | Éxito, estados positivos |
| `--focus-ring` | `#111111` | Outline de accesibilidad |

### Dark Mode (`prefers-color-scheme: dark`)
| Token | Valor |
|---|---|
| `--bg` | `#0c0c0e` |
| `--surface` | `#17171a` |
| `--text` | `#f4f4f5` |
| `--text-muted` | `#9ca3af` |
| `--border` | `#333338` |
| `--border-strong` | `#f4f4f5` |
| `--danger` | `#f87171` |
| `--success` | `#4ade80` |

### Reglas de Color
- **Sin gradientes** — solo sólidos planos
- **Sin glassmorphism** — solo bordes opacos
- **Sin colores primarios en fondos** — el acento es solo texto/borde
- El único color de acento funcional es `--danger` (rojo)

---

## 2. Tipografía

### Stack de Fuentes
| Rol | Familia | Pesos | Archivo |
|---|---|---|---|
| Display / Títulos | `"Satoshi"` | 700, 800, 900 | fontshare.com |
| UI / Body | `"Outfit"` | 300, 400, 500, 600, 700 | Google Fonts |
| Mono / Metadata | `"JetBrains Mono"` | 400, 700 | (sistema) |

### Jerarquía Tipográfica
| Elemento | Font | Peso | Tamaño | Tracking | Casing |
|---|---|---|---|---|---|
| `h1`–`h4` | Display | 800 | `clamp()` | `-0.03em` | Uppercase |
| `.site-title` | Display | 800 | `2.25rem` | `-0.04em` | — |
| `.task-title` | Display | 700 | `1.0625rem` | `-0.01em` | — |
| Body | UI | 400 | `1rem` | normal | — |
| Botones (acciones) | Mono | 700 | `0.75rem` | `0.06em` | Uppercase |
| Botones (general) | Mono | 700 | `0.875rem` | `0.05em` | Uppercase |
| Metadata/task-meta | Mono | 700 | `0.75rem` | `0.05em` | Uppercase |
| Status/auth-status | Mono | 400 | `0.8125rem` | `0.05em` | Uppercase |
| Errores | UI | 400 | `0.75rem` | normal | — |

### Reglas Tipográficas
- `letter-spacing` negativo en títulos (`-0.01em` a `-0.04em`)
- `letter-spacing` positivo en metadata/botones mono (`0.05em+`)
- `line-height: 1.6` para body, `1.1` para títulos grandes
- `text-transform: uppercase` en botones, tags, metadata, empty-state
- `font-variant-numeric: tabular-nums` en fechas y números
- `text-wrap: balance` en títulos, `text-wrap: pretty` en descripciones

---

## 3. Sombras y Profundidad

### Sombras de Bloque (Brutalist)
```css
--shadow-hard:      3px 3px 0px 0px var(--text);   /* Light: #111, Dark: #000 */
--shadow-hard-lg:   5px 5px 0px 0px var(--text);
--shadow-hard-hover: 1px 1px 0px 0px var(--text);
```

### Física de Resorte (Botones)
| Estado | Transform | Shadow |
|---|---|---|
| Default | `none` | `3px 3px 0px` (acciones: `2px 2px 0px`) |
| Hover | `translate(-1px, -1px)` | `5px 5px 0px` (acciones: `3px 3px 0px`) |
| Active | `translate(2px, 2px)` | `1px 1px 0px` |

### Reglas de Sombra
- **Sin `box-shadow` difuso** — solo bloques de 0px blur
- Las sombras siempre usan `var(--text)` o `var(--danger)`
- En dark mode, sombras usan `#000000`
- `box-shadow: none` solo en botones disabled y btn-close

---

## 4. Bordes

### Anchos de Borde
| Elemento | Ancho | Estilo |
|---|---|---|
| Headers, secciones | `2px solid` | `var(--text)` |
| Cards, modales, auth | `1px solid` | `var(--text)` |
| Inputs, selects, dropdowns | `2px solid` | `var(--border)` → hover/focus: `var(--text)` |
| Divisores internos | `2px solid` | `var(--border)` |
| Empty state | `2px dashed` | `var(--border)` |
| Errores globales | `2px solid` | `var(--danger)` |
| Task actions buttons | `1px solid` | `var(--text)` / `var(--danger)` |

### Reglas
- **`border-radius: 0`** en TODO — esquinas cuadradas absolutas
- Separadores: `border-bottom: 2px solid var(--border)`
- Hover en inputs: `border-color: var(--text)`
- Focus en inputs: `border-color: var(--text)` + `outline: 2px solid var(--focus-ring)` + `outline-offset: 1px`

---

## 5. Layout y Espaciado

### Estructura
- **Mobile-first**: `max-width: 100%` → `56rem` en desktop (`min-width: 60rem`)
- **Contenido centrado**: `margin: 0 auto`
- **Padding generoso**: `1.5rem–2.5rem` en desktop
- **Gap consistente**: `0.5rem–1.5rem` entre elementos

### Breakpoints
| Breakpoint | Uso |
|---|---|
| `40rem` (640px) | Desktop task layout (row), filter widths |
| `60rem` (960px) | Contenedor principal centrado |

### Patrones de Layout
| Patrón | Uso |
|---|---|
| `flex` + `gap` | Headers, formularios, acciones, filters |
| `flex-direction: column` | Task items (mobile), sections, form groups |
| `flex-direction: row` | Task items (desktop ≥40rem), header |
| `flex-wrap: wrap` | Filtros, task-meta |

---

## 6. Componentes

### Botones (base)
- Font: Mono, uppercase, `0.875rem`, `letter-spacing: 0.05em`
- Padding: `8px 16px`
- Border: `1px solid var(--text)`
- Shadow: `var(--shadow-hard)` (3px 3px 0px)
- Física: translate + shadow en hover/active

### Botones de Acción (task-actions)
- Font: Mono, uppercase, `0.75rem`, `letter-spacing: 0.06em`
- Padding: `5px 12px`
- Border: `1px solid var(--text)`
- Shadow: `2px 2px 0px 0px var(--text)`
- Variantes: `.secondary` (border-strong), `.danger` (danger)

### Botón Crear (btn-create-task)
- Font: Mono, uppercase, `0.8125rem`, `letter-spacing: 0.06em`
- Background: `var(--text)` invertido
- Padding: `8px 18px`, `min-height: 38px`

### Botón Submit (form)
- Background: `var(--text)` invertido
- Padding: `10px 18px`, `min-height: 42px`
- Shadow: `var(--shadow-hard-lg)` (5px 5px 0px)
- Hover shadow: `6px 6px 0px 0px var(--text)`

### Inputs / Forms
- Font: inherit (UI)
- Border: `2px solid var(--border)`
- Border-radius: `0`
- Hover: `border-color: var(--text)`
- Focus: `border-color: var(--text)` + `outline: 2px solid var(--focus-ring)` + `outline-offset: 1px`
- Padding: `8px 12px`

### Dropdown Custom
- Trigger: flex, `2px solid var(--border)`, `6px 10px`
- Options: absolute, `2px solid var(--border)`, `border-top: none`
- Option padding: `6px 10px`
- Selected: `background: var(--text)`, `color: var(--bg)`

### Modales
- Overlay: `rgba(0,0,0,0.65)` + `backdrop-filter: blur(3px)`
- Container: `border: 1px solid var(--text)` + `shadow-hard-lg`
- Header: flex con `border-bottom: 2px solid var(--border)`
- Animación: `scale(0.96) → 1` + `translateY(8px → 0)`
- Padding: `2rem`

### Toasts
- Posición: `fixed top: 20px right: 20px`
- Border: `1px solid var(--border)`
- Shadow: `shadow-hard`
- Variantes: `.success` (verde), `.error` (rojo), `.info` (muted)
- Animación: `slideIn` desde derecha

### Skeletons
- Bloques de `var(--border)` con opacidad variable
- Animación: pulse `0.4 → 0.9` opacidad
- Tamaños: `.skeleton-title` (45%), `.skeleton-desc` (75%), `.skeleton-meta` (25%)

### Empty State
- Border: `2px dashed var(--border)`
- Background: `var(--bg)`
- Tag: Mono, uppercase, `0.6875rem`, bg `var(--text)`
- Title: Display, `1.5rem`, weight 900
- Description: `0.875rem`, `var(--text-muted)`, `max-width: 40ch`

### Checkbox Custom
- Hidden input + custom box (`18px`)
- Border: `1px solid var(--text)`
- Checked: `background: var(--bg)`, inner square `10px`

---

## 7. Textura y Efectos

### Ruido Analógico (SVG)
```css
body::before {
  opacity: 0.035; /* 0.045 en dark mode */
  background-image: url("data:image/svg+xml,...fractalNoise...");
  pointer-events: none;
  z-index: 9999;
}
```

### Reglas de Textura
- Solo ruido SVG sutil en body
- `prefers-reduced-motion: reduce` → desactivar textura (`display: none`)

---

## 8. Accesibilidad

- **Skip link**: `position: absolute top: -100%` → `top: 0` en focus
- **Focus visible**: `outline: 2px solid var(--focus-ring)` + `outline-offset: 1px` (inputs) / `2px` (botones)
- **Reduced motion**: desactivar animaciones (`animation: none`)
- **aria-live**: en contadores de tareas y estado de auth
- **aria-expanded**: en dropdowns custom
- **aria-modal**: en modales
- **user-select: none**: en labels de checkbox

---

## 9. Animaciones

| Elemento | Animación | Timing |
|---|---|---|
| Toast | `slideIn` (translateX 100% → 0) | `0.3s cubic-bezier(0.16, 1, 0.3, 1)` |
| Modal | `fadeIn` (opacity 0 → 1) | `0.15s ease` |
| Pop-out | `popIn` (scale 0.96 → 1 + translateY 8px → 0) | `0.2s cubic-bezier(0.16, 1, 0.3, 1)` |
| Skeleton | `pulseSkeleton` (opacity 0.4 → 0.9) | `1.5s ease-in-out infinite` |
| Button hover | transform + shadow | `0.2s cubic-bezier(0.16, 1, 0.3, 1)` |
| Dropdown icon | rotate 180deg | `0.2s ease` |

### Reglas de Animación
- Solo `transform` y `opacity` (nunca `width`, `height`, `top`)
- Cubic-bezier: `(0.16, 1, 0.3, 1)` para easing suave
- Respetar `prefers-reduced-motion` → `animation: none`
- Sin scroll-driven animations

---

## 10. Scrollbar

- Width: `6px`
- Track: `var(--bg)`
- Thumb: `var(--border)` → hover: `var(--text-muted)`

---

## 11. Prohibiciones (NO hacer)

- ❌ `border-radius` en ningún elemento
- ❌ `box-shadow` con blur (> 0px)
- ❌ Gradientes en fondos o botones
- ❌ Glassmorphism / backdrop-filter en elementos (excepto modales)
- ❌ Colores primarios (azul, verde) en fondos de sección
- ❌ Emojis en UI
- ❌ Fuentes Inter, Roboto, Open Sans
- ❌ Sombras difusas (`shadow-md`, `shadow-lg` de Tailwind)
- ❌ `rounded-full` en cards o botones principales
- ❌ Texto negro puro `#000000` — usar `#111111`
