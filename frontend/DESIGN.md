# Sistema de Diseño: Brutalismo Industrial Suizo (BareDo)

Guía oficial de diseño y estándares visuales para el frontend de BareDo. Todos los agentes y desarrolladores que agreguen componentes, páginas o modifiquen estilos en el frontend deben seguir estrictamente estas especificaciones.

---

## 1. Filosofía y Principios Fundamentales

El diseño de BareDo fusiona la **precisión tipográfica y reticular del Estilo Tipográfico Internacional (Escuela Suiza)** con el **Brutalismo Industrial Digital**. 

* **Funcionalismo Radical**: Cada píxel cumple un propósito. Se eliminan ornamentos innecesarios (degradados llamativos, sombras difusas, bordes curvos genéricos).
* **Ausencia Total de Redondez (`border-radius: 0`)**: Todo elemento de la interfaz —botones, modales, inputs, tarjetas, toasts, badges— posee esquinas ortogonales a 90 grados.
* **Física Mecánica y Táctil**: Las interacciones imitan interruptores y componentes mecánicos analógicos mediante desplazamientos de traslación (`translate`) y sombras duras de bloque (*hard shadows*).
* **Jerarquía Tipográfica Extrema**: Fuerte contraste entre tipografías display de alto impacto (pesos 800/900 con tracking negativo) y tipografías monoespaciadas técnicas para metadatos y controles.
* **Textura de Material Analógico**: Fondo enriquecido con un micro-ruido de grano procedural que elimina la esterilidad digital.

---

## 2. Tokens de Diseño (CSS Custom Properties)

Definidos en `src/css/base.css`. Los componentes deben consumir exclusivamente estos tokens:

### 2.1. Paleta de Color

| Token | Light Mode | Dark Mode (`prefers-color-scheme: dark`) | Uso |
| :--- | :--- | :--- | :--- |
| `--bg` | `#f7f7f7` | `#0c0c0e` | Fondo principal de la aplicación |
| `--surface` | `#ffffff` | `#17171a` | Superficie de tarjetas, modales e inputs |
| `--text` | `#111111` | `#f4f4f5` | Texto principal y bordes fuertes |
| `--text-muted` | `#4b5563` | `#9ca3af` | Subtítulos, descripciones secundarias, placeholders |
| `--border` | `#d1d5db` | `#333338` | Divisores sutiles, bordes secundarios |
| `--border-strong`| `#111111` | `#f4f4f5` | Bordes primarios de interacción |
| `--danger` | `#dc2626` | `#f87171` | Acciones destructivas y errores |
| `--success` | `#15803d` | `#4ade80` | Confirmaciones y estados exitosos |
| `--focus-ring` | `#111111` | `#f4f4f5` | Anillo de accesibilidad para foco de teclado |

### 2.2. Sombras Brutalistas (Hard Offset Shadows)

**Prohibido el uso de `blur` en sombras.** Solo se permiten sombras sólidas de desplazamiento:

```css
--shadow-hard: 3px 3px 0px 0px var(--text);        /* Tarjetas, botones default */
--shadow-hard-lg: 5px 5px 0px 0px var(--text);     /* Modales, botones primarios */
--shadow-hard-hover: 1px 1px 0px 0px var(--text);  /* Estado presionado / active */
```

*(En modo oscuro, las sombras usan `#000000` para contraste de profundidad).*

### 2.3. Tipografías

```css
--font-display: "Satoshi", "Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-ui: "Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
```

* **Display (`--font-display`)**: Para `h1`, `h2`, `h3` y el título de la marca. Peso `800` o `900`, `letter-spacing: -0.02em` a `-0.04em`.
* **UI / Cuerpo (`--font-ui`)**: Para lectura general, formularios, etiquetas y contenido.
* **Mono (`--font-mono`)**: Para badges, estados (`PENDING`, `COMPLETED`), fechas, contadores, paginación y botones de comando (`+ CREATE TASK`, `EDIT`, `DELETE`).

---

## 3. Especificación de Componentes

### 3.1. Botones y Física de Interacción

Los botones emulan placas metálicas o interruptores con resorte mecánico:

```css
/* Botón Estándar */
button {
    font-family: var(--font-ui);
    font-weight: 600;
    padding: 8px 16px;
    border: 1px solid var(--text);
    border-radius: 0;
    background-color: var(--surface);
    color: var(--text);
    box-shadow: var(--shadow-hard);
    cursor: pointer;
    transition: background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
                color 0.2s cubic-bezier(0.16, 1, 0.3, 1),
                box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Hover: El botón 'se levanta' hacia el usuario */
button:hover:not(:disabled) {
    background-color: var(--text);
    color: var(--bg);
    transform: translate(-1px, -1px);
    box-shadow: var(--shadow-hard-lg);
}

/* Active / Click: El botón 'se hunde' al ser presionado */
button:active:not(:disabled) {
    transform: translate(2px, 2px);
    box-shadow: var(--shadow-hard-hover);
}
```

#### Variantes de Botones:
* **Primario de Acción / CTA (`.btn-create-task`, `#submit-btn`)**: Tipografía monoespaciada en mayúsculas (`--font-mono`, `700`), fondo `var(--text)`, texto `var(--bg)`.
* **Secundario (`button.secondary`)**: Fondo transparente, borde `var(--border-strong)`.
* **Peligro (`button.danger`)**: Borde y sombra en `var(--danger)`. Hover invierte a fondo `var(--danger)` y texto blanco.
* **Acciones en Listas (`.task-actions button`)**: Tamaño compacto (`padding: 5px 12px`, `font-size: 0.75rem`, `font-family: var(--font-mono)`).

### 3.2. Contenedores y Secciones

* **Bordes**: `1px solid var(--text)`.
* **Radio**: `border-radius: 0`.
* **Sombra**: `box-shadow: var(--shadow-hard)`.
* **Fondo**: `background: var(--surface)`.

### 3.3. Formularios e Inputs

* **Campos (`input`, `textarea`, `select`)**: Fondo `var(--surface)`, borde `1px solid var(--border)`, `border-radius: 0`.
* **Foco (`:focus-visible`)**:
  ```css
  border-color: var(--text);
  outline: 2px solid var(--focus-ring);
  outline-offset: 1px;
  ```
* **Etiquetas de Error**: Letra pequeña (`0.75rem`), color `var(--danger)`, espaciado superior sutil.

### 3.4. Modales y Pop-outs (`.popout-overlay`)

* **Backdrop**: `background: rgba(0, 0, 0, 0.65)` con `backdrop-filter: blur(3px)`.
* **Caja Contenedora**: `max-width: 520px`, borde sólido, sombra grande `var(--shadow-hard-lg)`.
* **Animación**: Entrada elástica `popIn` con `cubic-bezier(0.16, 1, 0.3, 1)`.

### 3.5. Estados Vacíos (Empty States)

Diseñados como etiquetas o manifiestos técnicos:
* Badge de estado superior en mono invertido (`STATUS: 0 TASKS`).
* Título contundente en mayúsculas (`NO TASKS FOUND`).
* Borde discontinuo `2px dashed var(--border)`.

### 3.6. Accesibilidad y Rendimiento

* **Skip Link**: `<a href="#main" class="skip-link">Skip to content</a>`. Oculto fuera de pantalla con `position: absolute; top: -100%`, visible al recibir foco (`:focus { top: 0; }`).
* **Focus Visible**: Todo elemento interactivo debe tener contorno de enfoque claro (`outline-offset: 2px`).
* **Motion Reduction**: Bajo `@media (prefers-reduced-motion: reduce)`, desactivar animaciones `slideIn`, `popIn`, grano procedural y pulsos de skeletons.

---

## 4. Reglas Estrictas para Agentes (Do's & Don'ts)

### ⛔ PROHIBIDO (Don'ts)
1. **NO usar `border-radius`** mayor a 0 (nada de `rounded-md`, `rounded-full`, etc.).
2. **NO usar gradientes decorativos** (`linear-gradient(...)`) en botones o fondos.
3. **NO usar sombras suaves / difusas** (`box-shadow: 0 4px 6px rgba(0,0,0,0.1)`).
4. **NO usar colores pastel suaves o arbitrarios** no contemplados en los tokens.
5. **NO romper el Service Worker**: Al modificar estilos en `src/css/`, siempre se debe incrementar la versión de caché (`CACHE_NAME`) en `src/sw.js` para evitar discrepancias de caché en producción.

###  OBLIGATORIO (Do's)
1. **Usar siempre variables CSS de `base.css`** para colores, fuentes y sombras.
2. **Aplicar la física de traslación** (`translate(-1px, -1px)` en hover y `translate(2px, 2px)` en active) a nuevos botones.
3. **Mantener tipografía `--font-mono` en mayúsculas** para metadatos, contadores y badges.
4. **Respetar el modo oscuro** utilizando únicamente los tokens semánticos definidos.
