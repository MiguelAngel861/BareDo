# Design System — BareDo Frontend

Estilo: **Swiss Industrial Brutalist** + **Premium Utilitarian Minimalism**

---

## Configuration

| Dial | Level | Description |
|------|-------|-------------|
| **Creativity** | `2` | Ultra-minimal, Swiss, silent, monochrome. Sin experimentos tipográficos. Cada elemento existe solo por función |
| **Density** | `5` | Balanced — task manager diario con suficiente espacio para respirar |
| **Variance** | `2` | Predictable, symmetric grids. Layouts repetibles y predecibles — no hay dos layouts distintos |
| **Motion Intent** | `5` | Subtle hover/entrance cues. CSS transitions, no spring physics. Funcional, no decorativo |

> **Swiss Brutalism = función > forma.** No hay decoración por decoración. Cada shadow, cada borde, cada color existe para comunicar estado o jerarquía. La densidad es balanced pero la varianza es mínima: el usuario debe poder predecir dónde está cada cosa.

---

## 1. Visual Theme & Atmosphere

Interfaz restraint, densa pero legible, como un manual técnico industrial. La atmósfera es clínica y funcional — como un taller de ingeniería donde cada herramienta tiene su lugar exacto. No hay-expression artística: la belleza viene de la precisión y consistencia. El usuario nunca debe preguntarse "¿qué hace esto?" — cada elemento comunica su propósito through borde, color o posición.

- **Sensación:** Manual técnico suizo, documentación industrial, informe de ingeniería
- **Impresión:** "Esto funciona y no va a romperse" — confiabilidad visual
- **Density (5):** Balance entre legibilidad y capacidad de información. No airy como galería, no dense como cockpit

---

## 2. Color Palette & Roles

### Light Mode

| Nombre Semántico | Token | Valor | Rol Funcional |
|---|---|---|---|
| **Paper White** | `--bg` | `#f7f7f7` | Fondo general — papel de documentación técnica, nunca azul-white clínico |
| **Clean Surface** | `--surface` | `#ffffff` | Superficies elevadas (cards, modales). Solo elevación por sombra |
| **Carbon Ink** | `--text` | `#111111` | Texto primario — depth de tinta carbón, nunca negro puro |
| **Steel Muted** | `--text-muted` | `#4b5563` | Texto secundario, metadata, descripciones |
| **Whisper Border** | `--border` | `#d1d5db` | Bordes sutiles, divisores — 1px structural lines |
| **Carbon Border** | `--border-strong` | `--text` | Bordes de énfasis — headers, secciones, acciones primarias |
| **Signal Red** | `--danger` | `#dc2626` | Errores, acciones destructivas — único accent funcional |
| **Status Green** | `--success` | `#15803d` | Éxito, estados positivos |
| **Focus Carbon** | `--focus-ring` | `--text` | Outline de accesibilidad — siempre visible |

### Dark Mode (`prefers-color-scheme: dark`)

| Nombre Semántico | Token | Valor |
|---|---|---|
| **Void Black** | `--bg` | `#0c0c0e` |
| **Dark Surface** | `--surface` | `#17171a` |
| **Light Ink** | `--text` | `#f4f4f5` |
| **Muted Steel** | `--text-muted` | `#9ca3af` |
| **Dark Border** | `--border` | `#333338` |
| **Light Border** | `--border-strong` | `--text` |
| **Signal Red Light** | `--danger` | `#f87171` |
| **Status Green Light** | `--success` | `#4ade80` |

### Reglas de Color (Explícitas)

- **Sin gradientes** — solo sólidos planos. El gradiente comunica "inautenticidad" en este sistema
- **Sin glassmorphism** — solo bordes opacos. Transparencia = ilegibilidad
- **Sin colores primarios en fondos** — el acento es solo texto/borde. Fondos de color distraen del contenido
- **Único accent funcional:** `--danger` (rojo). Verde es solo status, no accent
- **Nunca negro puro `#000000`** — usar `#111111` (carbon). Negro puro es visualmente agresivo
- **Dark mode sombras usan `#000000`** —唯一 excepción al no-usar-negro-puro
- **Un solo palette para toda la app** — no hay warm/cool gray fluctuation

---

## 3. Typography Rules

### Font Stack

| Rol | Familia | Pesos | Por Qué |
|---|---|---|---|
| **Display / Títulos** | `"Satoshi"` | 700, 800, 900 | Geometric sans con personalidad industrial. No genérica como Inter |
| **UI / Body** | `"Outfit"` | 300, 400, 500, 600, 700 | Clean, moderna, excelente legibilidad a 1rem |
| **Mono / Metadata** | `"JetBrains Mono"` | 400, 700 | Monospace para datos, timestamps, acciones. Comunica "esto es información técnica" |

### Typographic Hierarchy

| Elemento | Font | Peso | Tamaño | Tracking | Casing | Por Qué |
|---|---|---|---|---|---|---|
| `h1`–`h4` | Display | 800 | `clamp()` | `-0.03em` | Uppercase | Headings comprimidos comunican autoridad industrial |
| `.site-title` | Display | 800 | `2.25rem` | `-0.04em` | — | Identidad de marca, no decorative |
| `.task-title` | Display | 700 | `1.0625rem` | `-0.01em` | — | Título de tarea — weight crea jerarquía sin size |
| Body | UI | 400 | `1rem` | normal | — | Legibilidad neutral |
| Botones (acciones) | Mono | 700 | `0.75rem` | `0.06em` | Uppercase | Mono + uppercase = "esto es una acción técnica" |
| Botones (general) | Mono | 700 | `0.875rem` | `0.05em` | Uppercase | Consistencia con acciones |
| Metadata/task-meta | Mono | 700 | `0.75rem` | `0.05em` | Uppercase | Datos técnicos — fechas, estados, IDs |
| Status/auth-status | Mono | 400 | `0.8125rem` | `0.05em` | Uppercase | Estado del sistema |
| Errores | UI | 400 | `0.75rem` | normal | — | Errores van en UI normal, no mono |

### Typographic Rules (Explícitas)

- **`letter-spacing` negativo en títulos** (`-0.01em` a `-0.04em`) — comprime para communicar solidez
- **`letter-spacing` positivo en metadata/botones mono** (`0.05em+`) — espaciado para legibilidad en uppercase
- **`line-height: 1.6` para body** — relaxed leading, no apretado
- **`line-height: 1.1` para títulos grandes** — comprimido para impact
- **`text-transform: uppercase` en botones, tags, metadata, empty-state** — communique "esto es functional, no decorative"
- **`font-variant-numeric: tabular-nums` en fechas y números** — alineación vertical en listas/tablas
- **`text-wrap: balance` en títulos** — distribuye el texto evenly
- **`text-wrap: pretty` en descripciones** — evita words solas en última línea

### Banned Fonts

- **`Inter`** — banned everywhere. Too generic, too "SaaS default"
- **`Roboto`, `Open Sans`** — banned. Generic system fonts
- **Serif fonts** — banned en dashboards/software UI. Si se necesita serif para editorial, usar solo `Fraunces`, `Instrument Serif`
- **`rounded-full`** — banned en cards o botones principales

---

## 4. Sombras y Profundidad

### Sombras de Bloque (Brutalist)

```css
--shadow-hard:      3px 3px 0px 0px var(--text);   /* Light: #111, Dark: #000 */
--shadow-hard-lg:   5px 5px 0px 0px var(--text);
--shadow-hard-hover: 1px 1px 0px 0px var(--text);
```

### Física de Resorte (Botones)

| Estado | Transform | Shadow | Comunicado |
|---|---|---|---|
| Default | `none` | `3px 3px 0px` (acciones: `2px 2px 0px`) | Estado neutral — listo para acción |
| Hover | `translate(-1px, -1px)` | `5px 5px 0px` (acciones: `3px 3px 0px`) | Preparándose para ser press |
| Active | `translate(2px, 2px)` | `1px 1px 0px` | Siendo press — feedback táctil |

### Shadow Rules (Explícitas)

- **Sin `box-shadow` difuso** — solo bloques de 0px blur. Difuso = visualmente inestable
- **Las sombras siempre usan `var(--text)` o `var(--danger)`** — consistencia de color
- **En dark mode, sombras usan `#000000唯一 excepción** al no-usar-negro-puro
- **`box-shadow: none` solo en botones disabled y btn-close** — disabled no tiene presencia visual

---

## 5. Bordes

### Anchos de Borde

| Elemento | Ancho | Estilo | Por Qué |
|---|---|---|---|
| Headers, secciones | `2px solid` | `var(--text)` | Separación fuerte — kommunicates jerarquía |
| Cards, modales, auth | `1px solid` | `var(--text)` | Estructura visual sin ser aggressivo |
| Inputs, selects, dropdowns | `2px solid` | `var(--border)` → hover/focus: `var(--text)` | Interacción clara — borde cambia estado |
| Divisores internos | `2px solid` | `var(--border)` | Separación de contenido |
| Empty state | `2px dashed` | `var(--border)` | Comunica "vacío" — dashed = no content |
| Errores globales | `2px solid` | `var(--danger)` | Error = rojo, siempre visible |
| Task actions buttons | `1px solid` | `var(--text)` / `var(--danger)` | Acciones de tarea |

### Border Rules

- **`border-radius: 0` en TODO** — esquinas cuadradas absolutas. Round corners = softness, no brutalist
- **Separadores:** `border-bottom: 2px solid var(--border)`
- **Hover en inputs:** `border-color: var(--text)` — communique "estoy interactuable"
- **Focus en inputs:** `border-color: var(--text)` + `outline: 2px solid var(--focus-ring)` + `outline-offset: 1px` — accesibilidad siempre visible

---

## 6. Layout y Espaciado

### Estructura

- **Mobile-first:** `max-width: 100%` → `56rem` en desktop (`min-width: 60rem`)
- **Contenido centrado:** `margin: 0 auto`
- **Padding generoso:** `1.5rem–2.5rem` en desktop
- **Gap consistente:** `0.5rem–1.5rem` entre elementos

### Breakpoints

| Breakpoint | Uso | Device |
|---|---|---|
| `25rem` (400px) | Mobile task layout | S21 Ultra (412px) |
| `40rem` (640px) | Desktop task layout (row), filter widths | Small laptop |
| `60rem` | Contenedor principal centrado | Laptop/ desktop |

### Patrones de Layout

| Patrón | Uso | Por Qué |
|---|---|---|
| `flex` + `gap` | Headers, formularios, acciones, filters | Simple, predictable |
| `flex-direction: column` | Task items (mobile), sections, form groups | Vertical stacking en mobile |
| `flex-direction: row` | Task items (desktop ≥40rem), header | Horizontal en desktop |
| `flex-wrap: wrap` | Filtros, task-meta | Wrap when no space |

---

## 7. Componentes

### Botones (base)

- **Font:** Mono, uppercase, `0.875rem`, `letter-spacing: 0.05em`
- **Padding:** `8px 16px`
- **Border:** `1px solid var(--text)`
- **Shadow:** `var(--shadow-hard)` (3px 3px 0px)
- **Física:** translate + shadow en hover/active
- **Hover:** `translate(-1px, -1px)` + `5px 5px 0px` shadow
- **Active:** `translate(2px, 2px)` + `1px 1px 0px` shadow
- **Disabled:** `opacity: 0.5`, `cursor: not-allowed`, `box-shadow: none`

### Botones de Acción (task-actions)

- **Font:** Mono, uppercase, `0.75rem`, `letter-spacing: 0.06em`
- **Padding:** `5px 12px`
- **Border:** `1px solid var(--text)`
- **Shadow:** `2px 2px 0px 0px var(--text)`
- **Variantes:**
  - `.secondary` — `border-color: var(--border-strong)`
  - `.danger` — `border-color: var(--danger)`, `color: var(--danger)`

### Botón Crear (btn-create-task)

- **Font:** Mono, uppercase, `0.8125rem`, `letter-spacing: 0.06em`
- **Background:** `var(--text)` invertido (text becomes bg color)
- **Padding:** `8px 18px`, `min-height: 38px`
- **Hover:** invertido + shadow increase

### Botón Submit (form)

- **Background:** `var(--text)` invertido
- **Padding:** `10px 18px`, `min-height: 42px`
- **Shadow:** `var(--shadow-hard-lg)` (5px 5px 0px)
- **Hover shadow:** `6px 6px 0px 0px var(--text)`

### Inputs / Forms

- **Font:** inherit (UI)
- **Border:** `2px solid var(--border)`
- **Border-radius:** `0`
- **Hover:** `border-color: var(--text)` — communique "interactuable"
- **Focus:** `border-color: var(--text)` + `outline: 2px solid var(--focus-ring)` + `outline-offset: 1px`
- **Padding:** `8px 12px`
- **Error state:** `border-color: var(--danger)` + error text below en UI font

### Dropdown Custom

- **Trigger:** flex, `2px solid var(--border)`, `6px 10px`
- **Options:** absolute, `2px solid var(--border)`, `border-top: none`
- **Option padding:** `6px 10px`
- **Selected:** `background: var(--text)`, `color: var(--bg)` — invertido
- **Hover:** `background: var(--border)` — subtle highlight

### Modales

- **Overlay:** `rgba(0,0,0,0.65)` + `backdrop-filter: blur(3px)` —唯一 permitido backdrop-filter
- **Container:** `border: 1px solid var(--text)` + `shadow-hard-lg`
- **Header:** flex con `border-bottom: 2px solid var(--border)`
- **Animación:** `scale(0.96) → 1` + `translateY(8px → 0)`
- **Padding:** `2rem`
- **Close button:** `box-shadow: none` — no visual weight

### Toasts

- **Posición:** `fixed top: 20px right: 20px`
- **Border:** `1px solid var(--border)`
- **Shadow:** `shadow-hard`
- **Variantes:**
  - `.success` — verde (`--success`)
  - `.error` — rojo (`--danger`)
  - `.info` — muted (`--text-muted`)
- **Animación:** `slideIn` desde derecha

### Skeletons

- **Bloques de** `var(--border)` con opacidad variable
- **Animación:** pulse `0.4 → 0.9` opacidad
- **Tamaños:**
  - `.skeleton-title` — `45%` width
  - `.skeleton-desc` — `75%` width
  - `.skeleton-meta` — `25%` width

### Empty State

- **Border:** `2px dashed var(--border)` — dashed comunica "vacío"
- **Background:** `var(--bg)`
- **Tag:** Mono, uppercase, `0.6875rem`, bg `var(--text)` — invertido
- **Title:** Display, `1.5rem`, weight 900
- **Description:** `0.875rem`, `var(--text-muted)`, `max-width: 40ch`

### Checkbox Custom

- **Hidden input + custom box** (`18px`)
- **Border:** `1px solid var(--text)`
- **Checked:** `background: var(--bg)`, inner square `10px`
- **Hover:** `border-color: var(--text)` — subtle feedback

---

## 8. Textura y Efectos

### Ruido Analógico (SVG)

```css
body::before {
  opacity: 0.035; /* 0.045 en dark mode */
  background-image: url("data:image/svg+xml,...fractalNoise...");
  pointer-events: none;
  z-index: 9999;
}
```

### Texture Rules

- **Solo ruido SVG sutil en body** — communique "esto no es digital puro, tiene textura"
- **`prefers-reduced-motion: reduce`** → desactivar textura (`display: none`)
- **Solo en body pseudo-element** — nunca en otros elementos

---

## 9. Accesibilidad

- **Skip link:** `position: absolute top: -100%` → `top: 0` en focus
- **Focus visible:** `outline: 2px solid var(--focus-ring)` + `outline-offset: 1px` (inputs) / `2px` (botones)
- **Reduced motion:** desactivar animaciones (`animation: none`)
- **aria-live:** en contadores de tareas y estado de auth
- **aria-expanded:** en dropdowns custom
- **aria-modal:** en modales
- **user-select: none:** en labels de checkbox
- **Touch targets:** mínimo `44px` en mobile — nunca menor

---

## 10. Animaciones

| Elemento | Animación | Timing | Por Qué |
|---|---|---|---|
| Toast | `slideIn` (translateX 100% → 0) | `0.3s cubic-bezier(0.16, 1, 0.3, 1)` | Entra desde fuera — no interrumpe |
| Modal | `fadeIn` (opacity 0 → 1) | `0.15s ease` | Rápido — no bloquea al usuario |
| Pop-out | `popIn` (scale 0.96 → 1 + translateY 8px → 0) | `0.2s cubic-bezier(0.16, 1, 0.3, 1)` | Aparece con peso |
| Skeleton | `pulseSkeleton` (opacity 0.4 → 0.9) | `1.5s ease-in-out infinite` | Indica carga activa |
| Button hover | transform + shadow | `0.2s cubic-bezier(0.16, 1, 0.3, 1)` | Feedback táctil |
| Dropdown icon | rotate 180deg | `0.2s ease` | Indica estado abierto/cerrado |

### Animation Rules (Explícitas)

- **Solo `transform` y `opacity`** — nunca `width`, `height`, `top`. Estos causan layout thrashing
- **Cubic-bezier:** `(0.16, 1, 0.3, 1)` para easing suave — no linear, no ease-in-out
- **Respetar `prefers-reduced-motion`** → `animation: none`
- **Sin scroll-driven animations** — no performant, no predictable
- **No perpetual micro-interactions** — este sistema es restrained, no theatrical

---

## 11. Scrollbar

- **Width:** `6px`
- **Track:** `var(--bg)`
- **Thumb:** `var(--border)` → hover: `var(--text-muted)`

---

## 12. Prohibiciones (NO Hacer) — Explícitas

### Visual

- ❌ `border-radius` en ningún elemento — round corners = softness, no brutalist
- ❌ `box-shadow` con blur (> 0px) — difuso = inestable
- ❌ Gradientes en fondos o botones — gradientes = inautenticidad
- ❌ Glassmorphism / backdrop-filter en elementos (excepto modales) — transparencia = ilegibilidad
- ❌ Colores primarios (azul, verde) en fondos de sección — fondos de color distraen
- ❌ Emojis en UI — nunca, en ningún contexto
- ❌ Sombras difusas (`shadow-md`, `shadow-lg` de Tailwind) — no brutalist
- ❌ `rounded-full` en cards o botones principales — banned
- ❌ Texto negro puro `#000000` — usar `#111111`
- ❌ `z-index` spam — usar solo para Navbar, Modal, Overlay layer contexts
- ❌ `h-screen` — siempre `min-h-[100dvh]` (iOS Safari jump)

### Tipografía

- ❌ `Inter` — banned everywhere en premium
- ❌ Serif fonts (`Times New Roman`, `Georgia`, `Garamond`, `Palatino`) — banned en dashboards
- ❌ `letter-spacing` positivo en títulos — titles usan negativo
- ❌ `text-transform: lowercase` en metadata — metadata es uppercase

### Comportamiento

- ❌ Animaciones que animan `width`, `height`, `top`, `left` — layout thrashing
- ❌ Linear easing — no premium feel
- ❌ Scroll-driven animations — no performant
- ❌ Circular loading spinners — skeletal shimmer only
- ❌ Elementos que se superponen — clean spatial separation always
- ❌ "Scroll to explore", "Swipe down", scroll arrows, bouncing chevrons — filler UI banned
- ❌ Nombres genéricos ("John Doe", "Acme", "Nexus") — organic data only
- ❌ Fake round numbers (`99.99%`, `50%`) — usar `47.2%`, `+1 (312) 847-1928`
- ❌ AI copywriting clichés ("Elevate", "Seamless", "Unleash", "Next-Gen") — banned
- ❌ Broken Unsplash links — usar `picsum.photos` o SVG avatars
- ❌ `shadcn/ui` defaults — customize radii, colors, shadows a este sistema
