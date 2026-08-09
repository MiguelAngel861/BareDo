import { TaskAPI, AuthSession, TaskService } from "./api/index.ts";
import { TaskForm } from "./ui/task-form.js";
import { TaskList } from "./ui/task-list.js";
import { showToast, flushPendingToasts } from "./ui/toast.js";

const LAST_ERROR_KEY = "last_auth_error";

function goToLogin(reason = "") {
  if (reason) sessionStorage.setItem(LAST_ERROR_KEY, reason);
  AuthSession.clear();
  window.location.href = "pages/login.html";
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

  const api = new TaskAPI();
  const service = new TaskService(api);

  const form = new TaskForm(service, toastContainer, () => list.loadRetry());
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