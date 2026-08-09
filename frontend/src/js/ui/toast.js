import { SafeRenderer } from "./dom-utils.js";

const STORAGE_KEY = "pending_toasts";
const MAX_AGE_MS = 60_000;
let flushing = false;

function savePending(message, type) {
    if (flushing) return;
    const list = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
    list.push({ message, type, ts: Date.now() });
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function scheduleDismiss(toast, delay) {
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(100%)";
        toast.style.transition = "opacity 0.3s, transform 0.3s";
        setTimeout(() => toast.remove(), 300);
    }, delay);
}

export function showToast(container, message, type = "info") {
    const toast = SafeRenderer.createElement("div", {
        className: `toast ${type}`,
        textContent: message,
    });
    container.appendChild(toast);
    if (type === "error" || type === "success") {
        savePending(message, type);
    }
    scheduleDismiss(toast, type === "error" ? 5000 : 3000);
}

export function flushPendingToasts(container) {
    flushing = true;
    const now = Date.now();
    const list = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "[]");
    sessionStorage.removeItem(STORAGE_KEY);
    for (const { message, type, ts } of list) {
        if (now - ts < MAX_AGE_MS) {
            showToast(container, message, type);
        }
    }
    flushing = false;
}
