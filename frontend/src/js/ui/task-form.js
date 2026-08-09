import { FormHandler } from "./form-handler.js";
import { showToast } from "./toast.js";

export class TaskForm extends FormHandler {
    constructor(service, toastContainer, onSaved) {
        super("task-form");
        this.service = service;
        this.toastContainer = toastContainer;
        this.onSaved = onSaved;
        this.editingTaskId = null;
        this.lastFocusedElement = null;

        this.registerField("title", "title", "title-error");
        this.registerField("description", "description", "description-error");
        this.registerField("due_date", "due_date", "due_date-error");
        this.registerGlobalError("form-error");
        this.registerSubmitButton("submit-btn");

        this.overlay = document.getElementById("task-popout-overlay");
        this.modalTitle = document.getElementById("form-modal-title");
        this.closeBtn = document.getElementById("close-popout-btn");
        this.cancelBtn = document.getElementById("cancel-edit-btn");
        this.completedInput = document.getElementById("completed");
        this.idInput = document.getElementById("task-id");

        this.handleSubmit(() => this._onSubmit());
        this.cancelBtn.addEventListener("click", () => this.close());
        if (this.closeBtn) {
            this.closeBtn.addEventListener("click", () => this.close());
        }

        if (this.overlay) {
            this.overlay.addEventListener("click", (e) => {
                if (e.target === this.overlay) this.close();
            });
        }

        this._onKeyDown = (e) => {
            if (e.key === "Escape" && this.overlay && !this.overlay.classList.contains("hidden")) {
                e.preventDefault();
                this.close();
            }
        };
        this._focusTrapHandler = null;
    }

    open(isEdit = false) {
        this.lastFocusedElement = document.activeElement;
        if (!isEdit) {
            this.resetForm();
            if (this.modalTitle) this.modalTitle.textContent = "Create Task";
            this.submitBtn.textContent = "Create Task";
        }
        if (this.overlay) {
            this.overlay.classList.remove("hidden");
            document.addEventListener("keydown", this._onKeyDown);
            this._setupFocusTrap();
            setTimeout(() => {
                if (this.fields.title && this.fields.title.input) {
                    this.fields.title.input.focus();
                }
            }, 50);
        }
    }

    close() {
        if (this.overlay) {
            this.overlay.classList.add("hidden");
            document.removeEventListener("keydown", this._onKeyDown);
            if (this._focusTrapHandler) {
                this.overlay.removeEventListener("keydown", this._focusTrapHandler);
                this._focusTrapHandler = null;
            }
        }
        this.resetForm();
        if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === "function") {
            this.lastFocusedElement.focus();
        }
    }

    _setupFocusTrap() {
        if (this._focusTrapHandler) {
            this.overlay.removeEventListener("keydown", this._focusTrapHandler);
        }
        const focusable = this.overlay.querySelectorAll('button:not([disabled]), [href], input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        this._focusTrapHandler = (e) => {
            if (e.key !== "Tab") return;
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };
        this.overlay.addEventListener("keydown", this._focusTrapHandler);
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
            this.close();
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
        this.open(true);
        this.editingTaskId = task.task_id;
        this.idInput.value = task.task_id;
        this.fields.title.input.value = task.title;
        this.fields.description.input.value = task.description || "";
        this.fields.due_date.input.value = task.due_date ? task.due_date.substring(0, 10) : "";
        this.completedInput.checked = task.completed;
        if (this.modalTitle) this.modalTitle.textContent = "Edit Task";
        this.submitBtn.textContent = "Update Task";
        setTimeout(() => this.fields.title.input.focus(), 50);
    }

    resetForm() {
        this.editingTaskId = null;
        this.idInput.value = "";
        this.form.reset();
        this.clearAllErrors();
        this.submitBtn.textContent = "Create Task";
    }
}
