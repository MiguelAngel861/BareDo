import { SafeRenderer, clearChildren } from "./dom-utils.js";
import { showToast } from "./toast.js";

export class TaskList {
    constructor(service, toastContainer, onEdit) {
        this.service = service;
        this.toastContainer = toastContainer;
        this.onEdit = onEdit;
        this.currentPage = 1;
        this.perPage = 10;
        this.filters = { completed: "", title: "" };
        this.debounceTimer = null;

        this.el = {
            list: document.getElementById("task-list"),
            emptyMsg: document.getElementById("empty-message"),
            prevBtn: document.getElementById("prev-page"),
            nextBtn: document.getElementById("next-page"),
            pageIndicator: document.getElementById("page-indicator"),
            searchInput: document.getElementById("search-title"),
            filterSelect: document.getElementById("filter-completed"),
        };

        this.el.prevBtn.addEventListener("click", () => this.changePage(this.currentPage - 1));
        this.el.nextBtn.addEventListener("click", () => this.changePage(this.currentPage + 1));
        this.el.searchInput.addEventListener("input", (e) => this.debounceSearch(e.target.value));
        this.el.filterSelect.addEventListener("change", (e) => this.setFilter("completed", e.target.value));
    }

    debounceSearch(value) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => this.setFilter("title", value), 300);
    }

    setFilter(key, value) {
        this.filters[key] = value;
        this.currentPage = 1;
        this.load();
    }

    async load() {
        try {
            const data = await this.service.load({
                page: this.currentPage,
                per_page: this.perPage,
                ...this.filters,
            });
            if (!data) return;
            this.renderList(data.tasks);
            this.updatePagination(data.meta);
        } catch (error) {
            showToast(this.toastContainer, "Failed to load tasks: " + error.message, "error");
        }
    }

    renderList(tasks) {
        clearChildren(this.el.list);
        if (tasks.length === 0) {
            this.el.emptyMsg.style.display = "block";
            return;
        }
        this.el.emptyMsg.style.display = "none";
        for (const task of tasks) {
            this.el.list.appendChild(this.buildTaskElement(task));
        }
    }

    buildTaskElement(task) {
        const li = SafeRenderer.createElement("li", { className: "task-item" });
        const content = SafeRenderer.createElement("div", { className: "task-content" });

        content.appendChild(SafeRenderer.createElement("div", {
            className: `task-title${task.completed ? " completed" : ""}`,
            textContent: task.title,
        }));

        if (task.description) {
            content.appendChild(SafeRenderer.createElement("div", {
                className: "task-description",
                textContent: task.description,
            }));
        }

        const meta = SafeRenderer.createElement("div", { className: "task-meta" });
        if (task.due_date) {
            meta.appendChild(SafeRenderer.createElement("span", {
                className: "task-due-date",
                textContent: `Due: ${task.due_date}`,
            }));
        }
        meta.appendChild(SafeRenderer.createElement("span", {
            textContent: task.completed ? "Completed" : "Pending",
        }));
        content.appendChild(meta);
        li.appendChild(content);

        const actions = SafeRenderer.createElement("div", { className: "task-actions" });

        const editBtn = SafeRenderer.createElement("button", {
            type: "button", className: "secondary", textContent: "Edit",
        });
        editBtn.addEventListener("click", () => this.onEdit(task));
        actions.appendChild(editBtn);

        const toggleBtn = SafeRenderer.createElement("button", {
            type: "button",
            textContent: task.completed ? "Mark Pending" : "Mark Complete",
        });
        toggleBtn.addEventListener("click", () => this.toggleComplete(task));
        actions.appendChild(toggleBtn);

        const deleteBtn = SafeRenderer.createElement("button", {
            type: "button", className: "danger", textContent: "Delete",
        });
        deleteBtn.addEventListener("click", () => this.confirmDelete(task));
        actions.appendChild(deleteBtn);

        li.appendChild(actions);
        return li;
    }

    updatePagination(meta) {
        this.currentPage = meta.page;
        this.el.pageIndicator.textContent = `Page ${meta.page} of ${meta.total_pages || 1}`;
        this.el.prevBtn.disabled = !meta.has_prev;
        this.el.nextBtn.disabled = !meta.has_next;
    }

    changePage(page) {
        if (page < 1) return;
        this.currentPage = page;
        this.load();
    }

    async toggleComplete(task) {
        try {
            await this.service.patch(task.id, { completed: !task.completed });
            showToast(this.toastContainer, task.completed ? "Task marked as pending" : "Task marked as complete", "success");
            this.load();
        } catch (error) {
            showToast(this.toastContainer, "Failed to update task: " + error.message, "error");
        }
    }

    confirmDelete(task) {
        if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
            this.deleteTask(task.id);
        }
    }

    async deleteTask(id) {
        try {
            await this.service.delete(id);
            showToast(this.toastContainer, "Task deleted successfully", "success");
            this.load();
        } catch (error) {
            showToast(this.toastContainer, "Failed to delete task: " + error.message, "error");
        }
    }
}