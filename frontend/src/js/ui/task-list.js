import { SafeRenderer, clearChildren } from "./dom-utils.js";
import { showToast } from "./toast.js";
import { showModal } from "./modal.js";

class CustomDropdown {
    constructor(element, onSelect) {
        this.element = element;
        this.trigger = element.querySelector('.dropdown-trigger');
        this.optionsContainer = element.querySelector('.dropdown-options');
        this.options = element.querySelectorAll('.dropdown-option');
        this.value = element.dataset.value || '';
        this.onSelect = onSelect;
        
        this.init();
    }
    
    init() {
        this.trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });
        
        this.options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                this.select(option);
            });
        });
        
        this.element.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
        
        document.addEventListener('click', () => {
            this.close();
        });
    }
    
    toggle() {
        const isExpanded = this.element.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        this.element.setAttribute('aria-expanded', 'true');
    }
    
    close() {
        this.element.setAttribute('aria-expanded', 'false');
    }
    
    select(option) {
        this.options.forEach(opt => {
            opt.classList.remove('selected');
            opt.setAttribute('aria-selected', 'false');
        });
        
        option.classList.add('selected');
        option.setAttribute('aria-selected', 'true');
        
        this.trigger.querySelector('.dropdown-value').textContent = option.textContent;
        
        this.value = option.dataset.value;
        this.element.dataset.value = this.value;
        
        this.close();
        
        if (this.onSelect) {
            this.onSelect(this.value);
        }
    }
    
    handleKeyboard(e) {
        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                this.toggle();
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (this.element.getAttribute('aria-expanded') === 'false') {
                    this.open();
                } else {
                    this.focusNextOption();
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.focusPrevOption();
                break;
            case 'Escape':
                this.close();
                this.trigger.focus();
                break;
        }
    }
    
    focusNextOption() {
        const options = Array.from(this.options);
        const currentIndex = options.findIndex(opt => opt === document.activeElement);
        const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        options[nextIndex].focus();
    }
    
    focusPrevOption() {
        const options = Array.from(this.options);
        const currentIndex = options.findIndex(opt => opt === document.activeElement);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        options[prevIndex].focus();
    }
}

export class TaskList {
    constructor(service, toastContainer, onEdit) {
        this.service = service;
        this.toastContainer = toastContainer;
        this.onEdit = onEdit;
        this.currentPage = 1;
        this.perPage = 5;
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
        
        this.customDropdown = new CustomDropdown(this.el.filterSelect, (value) => {
            this.setFilter("completed", value);
        });
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
        this.renderSkeletons();
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

    async loadRetry() {
        try {
            const data = await this.service.load({
                page: this.currentPage,
                per_page: this.perPage,
                ...this.filters,
            });
            if (!data) return;
            this.renderList(data.tasks);
            this.updatePagination(data.meta);
        } catch {
            // silently ignore - edit was already saved
        }
    }

    renderSkeletons() {
        clearChildren(this.el.list);
        this.el.emptyMsg.classList.add("hidden");
        this.el.emptyMsg.style.display = "none";
        for (let i = 0; i < 3; i++) {
            const li = SafeRenderer.createElement("li", { className: "task-skeleton" });
            li.appendChild(SafeRenderer.createElement("div", { className: "skeleton-line skeleton-title" }));
            li.appendChild(SafeRenderer.createElement("div", { className: "skeleton-line skeleton-desc" }));
            li.appendChild(SafeRenderer.createElement("div", { className: "skeleton-line skeleton-meta" }));
            this.el.list.appendChild(li);
        }
    }

    renderList(tasks) {
        clearChildren(this.el.list);
        if (tasks.length === 0) {
            this.el.emptyMsg.classList.remove("hidden");
            this.el.emptyMsg.style.display = "block";
            return;
        }
        this.el.emptyMsg.classList.add("hidden");
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
                textContent: `Due: ${task.due_date.substring(0, 10)}`,
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
            await this.service.patch(task.task_id, { completed: !task.completed });
            showToast(this.toastContainer, task.completed ? "Task marked as pending" : "Task marked as complete", "success");
            this.load();
        } catch (error) {
            showToast(this.toastContainer, "Failed to update task: " + error.message, "error");
        }
    }

    confirmDelete(task) {
        showModal({
            title: "Delete task",
            message: `Are you sure you want to delete "${task.title}"? This action cannot be undone.`,
            confirmText: "Delete",
            onConfirm: () => this.deleteTask(task.task_id),
        });
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