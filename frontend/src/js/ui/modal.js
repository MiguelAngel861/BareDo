import { SafeRenderer } from "./dom-utils.js";

let activeModal = null;

function trapFocus(modal) {
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    modal.addEventListener("keydown", (e) => {
        if (e.key !== "Tab") return;
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    });
}

export function showModal({ title, message, confirmText = "Delete", onConfirm }) {
    if (activeModal) activeModal.remove();

    const overlay = SafeRenderer.createElement("div", { className: "modal-overlay" });
    const dialog = SafeRenderer.createElement("div", { className: "modal" });

    dialog.appendChild(SafeRenderer.createElement("h3", { textContent: title }));
    dialog.appendChild(SafeRenderer.createElement("p", { textContent: message }));

    const actions = SafeRenderer.createElement("div", { className: "modal-actions" });

    const cancelBtn = SafeRenderer.createElement("button", {
        type: "button",
        className: "secondary",
        textContent: "Cancel",
    });

    const confirmBtn = SafeRenderer.createElement("button", {
        type: "button",
        className: "danger",
        textContent: confirmText,
    });

    cancelBtn.addEventListener("click", () => overlay.remove());
    confirmBtn.addEventListener("click", () => {
        overlay.remove();
        onConfirm();
    });

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) overlay.remove();
    });

    overlay.addEventListener("keydown", (e) => {
        if (e.key === "Escape") overlay.remove();
    });

    actions.appendChild(cancelBtn);
    actions.appendChild(confirmBtn);
    dialog.appendChild(actions);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    activeModal = overlay;
    trapFocus(overlay);
    confirmBtn.focus();
}
