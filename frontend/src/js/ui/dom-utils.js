export const SafeRenderer = {
    createElement(tag, attributes = {}, children = []) {
        const el = document.createElement(tag);
        for (const [key, value] of Object.entries(attributes)) {
            if (key === "textContent") {
                el.textContent = value;
            } else if (key === "className") {
                el.className = value;
            } else if (key === "style") {
                Object.assign(el.style, value);
            } else {
                el.setAttribute(key, value);
            }
        }
        for (const child of children) {
            el.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
        }
        return el;
    },
};

export function clearChildren(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
}