export const SafeRenderer = {
  createElement(
    tag: string,
    attributes: Record<string, unknown> = {},
    children: (string | Node)[] = []
  ): HTMLElement {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attributes)) {
      if (key === 'textContent') {
        el.textContent = String(value);
      } else if (key === 'className') {
        el.className = String(value);
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(el.style, value);
      } else {
        el.setAttribute(key, String(value));
      }
    }
    for (const child of children) {
      el.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    }
    return el;
  },
};

export function clearChildren(el: HTMLElement): void {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

export function trapFocus(container: HTMLElement): () => void {
  const focusableSelector =
    'button:not([disabled]), [href], input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') {
      return;
    }
    const focusable = container.querySelectorAll(focusableSelector);
    if (!focusable.length) {
      return;
    }
    const first = focusable[0] as HTMLElement;
    const last = focusable[focusable.length - 1] as HTMLElement;

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  container.addEventListener('keydown', onKeyDown);
  return () => container.removeEventListener('keydown', onKeyDown);
}
