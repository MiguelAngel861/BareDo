import { showToast } from "./toast.js";

export class TaskForm {
    constructor(service, toastContainer, onSaved) {
        this.service = service;
        this.toastContainer = toastContainer;
        this.onSaved = onSaved;
        this.editingTaskId = null;
        this.isSubmitting = false;

        this.el = {
            form: document.getElementById("task-form"),
            idInput: document.getElementById("task-id"),
            titleInput: document.getElementById("title"),
            descInput: document.getElementById("description"),
            dueDateInput: document.getElementById("due_date"),
            completedInput: document.getElementById("completed"),
            submitBtn: document.getElementById("submit-btn"),
            cancelBtn: document.getElementById("cancel-edit-btn"),
            formError: document.getElementById("form-error"),
            titleError: document.getElementById("title-error"),
            descError: document.getElementById("description-error"),
            dueDateError: document.getElementById("due_date-error"),
        };

        this.el.form.addEventListener("submit", (e) => this.handleSubmit(e));
        this.el.cancelBtn.addEventListener("click", () => this.resetForm());
    }

    validate() {
        let valid = true;
        this.clearErrors();

        const title = this.el.titleInput.value.trim();
        if (!title) {
            this.showFieldError(this.el.titleInput, this.el.titleError, "Title is required");
            valid = false;
        } else if (title.length > 40) {
            this.showFieldError(this.el.titleInput, this.el.titleError, "Title must be 40 characters or less");
            valid = false;
        }

        const desc = this.el.descInput.value.trim();
        if (desc.length > 200) {
            this.showFieldError(this.el.descInput, this.el.descError, "Description must be 200 characters or less");
            valid = false;
        }

        const due = this.el.dueDateInput.value;
        if (due) {
            const d = new Date(due);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (d < today) {
                this.showFieldError(this.el.dueDateInput, this.el.dueDateError, "Due date cannot be in the past");
                valid = false;
            }
        }
        return valid;
    }

    showFieldError(input, errorEl, msg) {
        input.style.borderColor = "var(--danger)";
        errorEl.textContent = msg;
        errorEl.classList.add("visible");
    }

    clearErrors() {
        for (const [input, errorEl] of [
            [this.el.titleInput, this.el.titleError],
            [this.el.descInput, this.el.descError],
            [this.el.dueDateInput, this.el.dueDateError],
        ]) {
            input.style.borderColor = "";
            errorEl.classList.remove("visible");
        }
        this.el.formError.classList.remove("visible");
        this.el.formError.textContent = "";
    }

    getFormData() {
        return {
            title: this.el.titleInput.value.trim(),
            description: this.el.descInput.value.trim() || null,
            due_date: this.el.dueDateInput.value || null,
            completed: this.el.completedInput.checked,
        };
    }

    async handleSubmit(e) {
        e.preventDefault();
        if (this.isSubmitting || !this.validate()) return;

        this.isSubmitting = true;
        this.el.submitBtn.disabled = true;
        this.el.submitBtn.textContent = this.editingTaskId ? "Updating..." : "Creating...";

        try {
            const data = this.getFormData();
            if (this.editingTaskId) {
                await this.service.update(this.editingTaskId, data);
                showToast(this.toastContainer, "Task updated successfully", "success");
            } else {
                await this.service.create(data);
                showToast(this.toastContainer, "Task created successfully", "success");
            }
            this.resetForm();
            this.onSaved();
        } catch (error) {
            if (error.status === 400 && error.data?.errors) {
                this.showValidationErrors(error.data.errors);
            } else {
                this.el.formError.textContent = error.message || "An error occurred";
                this.el.formError.classList.add("visible");
            }
        } finally {
            this.isSubmitting = false;
            this.el.submitBtn.disabled = false;
            this.el.submitBtn.textContent = this.editingTaskId ? "Update Task" : "Create Task";
        }
    }

    showValidationErrors(errors) {
        for (const [field, msgs] of Object.entries(errors)) {
            const input = this.el.form.querySelector(`[name="${field}"]`);
            const errorEl = document.getElementById(`${field}-error`);
            if (input && errorEl) {
                this.showFieldError(input, errorEl, Array.isArray(msgs) ? msgs[0] : msgs);
            }
        }
        if (!this.el.formError.classList.contains("visible")) {
            this.el.formError.textContent = "Please fix the errors above";
            this.el.formError.classList.add("visible");
        }
    }

    startEdit(task) {
        this.editingTaskId = task.task_id;
        this.el.idInput.value = task.task_id;
        this.el.titleInput.value = task.title;
        this.el.descInput.value = task.description || "";
        this.el.dueDateInput.value = task.due_date || "";
        this.el.completedInput.checked = task.completed;
        this.el.submitBtn.textContent = "Update Task";
        this.el.cancelBtn.style.display = "inline-block";
        this.el.titleInput.focus();
    }

    resetForm() {
        this.editingTaskId = null;
        this.el.idInput.value = "";
        this.el.form.reset();
        this.clearErrors();
        this.el.submitBtn.textContent = "Create Task";
        this.el.cancelBtn.style.display = "none";
    }
}