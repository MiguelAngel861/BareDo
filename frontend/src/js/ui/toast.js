import { SafeRenderer } from "./dom-utils.js";

export function showToast(container, message, type = "info") {
    const toast = SafeRenderer.createElement("div", {
        className: `toast ${type}`,
        textContent: message,
    });
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(100%)";
        toast.style.transition = "opacity 0.3s, transform 0.3s";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}