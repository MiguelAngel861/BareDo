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
