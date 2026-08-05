import { TaskAPI } from "./api/tasks.js";
import { AuthSession } from "./services/auth-session.js";
import { TaskService } from "./services/task-service.js";
import { TaskForm } from "./ui/task-form.js";
import { TaskList } from "./ui/task-list.js";

function goToLogin() {
    AuthSession.clear();
    window.location.href = "pages/login.html";
}

function init() {
    if (!AuthSession.hasToken()) {
        window.location.href = "pages/login.html";
        return;
    }

    const toastContainer = document.getElementById("toast-container");
    const service = new TaskService(new TaskAPI(), goToLogin);

    const form = new TaskForm(service, toastContainer, () => list.load());
    const list = new TaskList(service, toastContainer, (task) => form.startEdit(task));

    const status = document.getElementById("auth-status");
    status.textContent = "Authenticated";
    status.style.color = "#27ae60";
    const logoutBtn = document.getElementById("logout-btn");
    logoutBtn.style.display = "inline-block";
    logoutBtn.addEventListener("click", () => goToLogin());

    list.load();
}

document.addEventListener("DOMContentLoaded", init);