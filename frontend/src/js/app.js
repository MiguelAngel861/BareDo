import { TaskAPI } from "./api/tasks.js";
import { AuthSession } from "./services/auth-session.js";
import { TaskService } from "./services/task-service.js";
import { TaskForm } from "./ui/task-form.js";
import { TaskList } from "./ui/task-list.js";
import { showToast, flushPendingToasts } from "./ui/toast.js";

const LAST_ERROR_KEY = "last_auth_error";

let refreshPromise = null;

function goToLogin(reason = "") {
    if (reason) sessionStorage.setItem(LAST_ERROR_KEY, reason);
    AuthSession.clear();
    window.location.href = "pages/login.html";
}

async function handleUnauthorized() {
    if (!refreshPromise) {
        refreshPromise = (async () => {
            try {
                const refreshed = await AuthSession.refresh();
                if (!refreshed) {
                    goToLogin("refresh-failed");
                    return false;
                }
                return true;
            } catch {
                goToLogin("refresh-error");
                return false;
            } finally {
                refreshPromise = null;
            }
        })();
    }
    return refreshPromise;
}

function init() {
    const toastContainer = document.getElementById("toast-container");
    if (!AuthSession.hasToken()) {
        goToLogin();
        return;
    }

    const lastError = sessionStorage.getItem(LAST_ERROR_KEY);
    if (lastError) {
        sessionStorage.removeItem(LAST_ERROR_KEY);
        showToast(toastContainer, `Sesión expirada (${lastError}): vuelve a iniciar sesión`, "error");
    }
    flushPendingToasts(toastContainer);

    const service = new TaskService(new TaskAPI({ onUnauthorized: handleUnauthorized }));

    const form = new TaskForm(service, toastContainer, () => list.load());
    const list = new TaskList(service, toastContainer, (task) => form.startEdit(task));

    const openCreateBtn = document.getElementById("open-create-task-btn");
    if (openCreateBtn) {
        openCreateBtn.addEventListener("click", () => form.open(false));
    }

    const status = document.getElementById("auth-status");
    status.textContent = "Authenticated";
    status.style.color = "var(--success)";
    const logoutBtn = document.getElementById("logout-btn");
    logoutBtn.classList.remove("hidden");
    logoutBtn.style.display = "inline-block";
    logoutBtn.addEventListener("click", () => goToLogin());

    list.load();
}

document.addEventListener("DOMContentLoaded", init);