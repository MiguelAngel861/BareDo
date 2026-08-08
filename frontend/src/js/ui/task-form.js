import { FormHandler } from "./form-handler.js";
import { showToast } from "./toast.js";

export class TaskForm extends FormHandler {
    constructor(service, toastContainer, onSaved) {
        super("task-form");
        this.service = service;
        this.toastContainer = toastContainer;
        this.onSaved = onSaved;
        this.editingTaskId = null;

        this.registerField("title", "title", "title-error");
        this.registerField("description", "description", "description-error");
        this.registerField("due_date", "due_date", "due_date-error");
        this.registerGlobalError("form-error");
        this.registerSubmitButton("submit-btn");

        this.cancelBtn = document.getElementById("cancel-edit-btn");
        this.completedInput = document.getElementById("completed");
        this.idInput = document.getElementById("task-id");

        this.handleSubmit(() => this._onSubmit());
        this.cancelBtn.addEventListener("click", () => this.resetForm());
    }

    validate() {
        this.clearAllErrors();

        const title = this.getFieldValue("title");
        if (!title) {
            this.showFieldError(this.fields.title.input, this.fields.title.error, "Title is required");
            return false;
        }
        if (title.length > 40) {
            this.showFieldError(this.fields.title.input, this.fields.title.error, "Title must be 40 characters or less");
            return false;
        }

        const desc = this.getFieldValue("description");
        if (desc.length > 200) {
            this.showFieldError(this.fields.description.input, this.fields.description.error, "Description must be 200 characters or less");
            return false;
        }

        const due = this.fields.due_date.input.value;
        if (due) {
            const d = new Date(due);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (d < today) {
                this.showFieldError(this.fields.due_date.input, this.fields.due_date.error, "Due date cannot be in the past");
                return false;
            }
        }
        return true;
    }

    getFormData() {
        return {
            title: this.getFieldValue("title"),
            description: this.getFieldValue("description") || null,
            due_date: this.fields.due_date.input.value || null,
            completed: this.completedInput.checked,
        };
    }

    getUpdateData() {
        const data = {
            title: this.getFieldValue("title"),
            completed: this.completedInput.checked,
        };
        const description = this.getFieldValue("description");
        if (description) data.description = description;
        const dueDate = this.fields.due_date.input.value;
        if (dueDate) data.due_date = dueDate;
        return data;
    }

    async _onSubmit() {
        if (!this.validate()) return;

        const isEdit = !!this.editingTaskId;
        this.setSubmitting(true, isEdit ? "Updating..." : "Creating...");

        try {
            const data = isEdit ? this.getUpdateData() : this.getFormData();
            if (isEdit) {
                await this.service.patch(this.editingTaskId, data);
                showToast(this.toastContainer, "Task updated successfully", "success");
            } else {
                await this.service.create(data);
                showToast(this.toastContainer, "Task created successfully", "success");
            }
            this.resetForm();
            this.onSaved();
        } catch (error) {
            if (error.status === 400 && error.data?.errors) {
                this._showValidationErrors(error.data.errors);
            } else {
                this.showGlobalError(error.message || "An error occurred");
            }
        } finally {
            this.setSubmitting(false, isEdit ? "Update Task" : "Create Task");
        }
    }

    _showValidationErrors(errors) {
        for (const [field, msgs] of Object.entries(errors)) {
            const input = this.form.querySelector(`[name="${field}"]`);
            const errorEl = document.getElementById(`${field}-error`);
            if (input && errorEl) {
                this.showFieldError(input, errorEl, Array.isArray(msgs) ? msgs[0] : msgs);
            }
        }
        this.showGlobalError("Please fix the errors above");
    }

    startEdit(task) {
        this.editingTaskId = task.task_id;
        this.idInput.value = task.task_id;
        this.fields.title.input.value = task.title;
        this.fields.description.input.value = task.description || "";
        this.fields.due_date.input.value = task.due_date || "";
        this.completedInput.checked = task.completed;
        this.submitBtn.textContent = "Update Task";
        this.cancelBtn.style.display = "inline-block";
        this.fields.title.input.focus();
    }

    resetForm() {
        this.editingTaskId = null;
        this.idInput.value = "";
        this.form.reset();
        this.clearAllErrors();
        this.submitBtn.textContent = "Create Task";
        this.cancelBtn.style.display = "none";
    }
}
