import { prioritiesApi } from '@/features/priorities/index.ts';
import { isApiError } from '@/shared/api/errors.ts';
import { CustomDropdown, FormHandler, showToast } from '@/shared/ui/index.ts';
import { trapFocus } from '@/shared/utils/dom-utils.ts';
import { tasksApi } from '../api.ts';
import type { Task, TaskCreate, TaskUpdate } from '../types.ts';

interface TaskFormElements {
  overlay: HTMLElement | null;
  modalTitle: HTMLElement | null;
  closeBtn: HTMLButtonElement | null;
  cancelBtn: HTMLButtonElement | null;
  completedInput: HTMLInputElement | null;
  idInput: HTMLInputElement | null;
  prioritySelect: HTMLElement | null;
  priorityHelper: HTMLElement | null;
}

export class TaskForm extends FormHandler {
  private readonly service = tasksApi;
  private readonly toastContainer: HTMLElement;
  private readonly onSaved: () => void;
  private editingTaskId: string | null = null;
  private editingTask: Task | null = null;
  private lastFocusedElement: HTMLElement | null = null;
  private readonly elements: TaskFormElements;
  private readonly onKeyDown: (e: KeyboardEvent) => void;
  private removeFocusTrap: (() => void) | null = null;
  private priorityDropdown: CustomDropdown | null = null;
  private priorityDescriptions = new Map<number, string>();

  constructor(toastContainer: HTMLElement, onSaved: () => void) {
    super('task-form');
    this.toastContainer = toastContainer;
    this.onSaved = onSaved;

    this.registerField('title', 'title', 'title-error');
    this.registerField('description', 'description', 'description-error');
    this.registerField('due_date', 'due_date', 'due_date-error');
    this.registerGlobalError('form-error');
    this.registerSubmitButton('submit-btn');

    this.elements = {
      overlay: document.getElementById('task-popout-overlay'),
      modalTitle: document.getElementById('form-modal-title'),
      closeBtn: document.getElementById('close-popout-btn') as HTMLButtonElement | null,
      cancelBtn: document.getElementById('cancel-edit-btn') as HTMLButtonElement | null,
      completedInput: document.getElementById('completed') as HTMLInputElement | null,
      idInput: document.getElementById('task-id') as HTMLInputElement | null,
      prioritySelect: document.getElementById('priority-select'),
      priorityHelper: document.getElementById('priority-helper'),
    };

    this.handleSubmit(() => this.onSubmit());
    this.elements.cancelBtn?.addEventListener('click', () => this.close());
    this.elements.closeBtn?.addEventListener('click', () => this.close());

    if (this.elements.overlay) {
      this.elements.overlay.addEventListener('click', (e) => {
        if (e.target === this.elements.overlay) {
          this.close();
        }
      });
    }

    if (this.elements.prioritySelect) {
      this.priorityDropdown = new CustomDropdown(this.elements.prioritySelect, (value) => {
        this.updatePriorityHelper(value);
      });
    }

    this.loadPriorities();

    this.onKeyDown = (e) => {
      if (
        e.key === 'Escape' &&
        this.elements.overlay &&
        !this.elements.overlay.classList.contains('hidden')
      ) {
        e.preventDefault();
        this.close();
      }
    };
  }

  private async loadPriorities(): Promise<void> {
    this.priorityDescriptions = await prioritiesApi.getDescriptions();
    this.updatePriorityHelper(String(this.getPriorityValue()));
  }

  private updatePriorityHelper(value: string): void {
    const helper = this.elements.priorityHelper;
    if (!helper) {
      return;
    }
    const desc = this.priorityDescriptions.get(Number(value));
    helper.textContent = desc || '';
  }

  private getPriorityValue(): number {
    return Number(
      this.priorityDropdown?.getValue() || this.elements.prioritySelect?.dataset.value || '3'
    );
  }

  private setPriorityValue(value: number): void {
    this.priorityDropdown?.setValue(String(value));
    this.updatePriorityHelper(String(value));
  }

  open(isEdit = false): void {
    this.lastFocusedElement = document.activeElement as HTMLElement;
    if (!isEdit) {
      this.resetForm();
      if (this.elements.modalTitle) {
        this.elements.modalTitle.textContent = 'Create Task';
      }
      if (this.submitBtn) {
        this.submitBtn.textContent = 'Create Task';
      }
    }
    if (this.elements.overlay) {
      this.elements.overlay.classList.remove('hidden');
      document.addEventListener('keydown', this.onKeyDown);
      this.removeFocusTrap = trapFocus(this.elements.overlay);
      setTimeout(() => {
        if (this.fields.title?.input) {
          this.fields.title.input.focus();
        }
      }, 50);
    }
  }

  close(): void {
    if (this.elements.overlay) {
      this.elements.overlay.classList.add('hidden');
      document.removeEventListener('keydown', this.onKeyDown);
      this.removeFocusTrap?.();
      this.removeFocusTrap = null;
    }
    this.resetForm();
    if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === 'function') {
      this.lastFocusedElement.focus();
    }
  }

  validate(): boolean {
    this.clearAllErrors();

    const title = this.getFieldValue('title');
    if (!title) {
      this.showFieldError(
        this.fields.title?.input ?? null,
        this.fields.title?.error ?? null,
        'Title is required'
      );
      return false;
    }
    if (title.length > 40) {
      this.showFieldError(
        this.fields.title?.input ?? null,
        this.fields.title?.error ?? null,
        'Title must be 40 characters or less'
      );
      return false;
    }

    const desc = this.getFieldValue('description');
    if (desc.length > 200) {
      this.showFieldError(
        this.fields.description?.input ?? null,
        this.fields.description?.error ?? null,
        'Description must be 200 characters or less'
      );
      return false;
    }

    const due = this.fields.due_date?.input?.value;
    if (due) {
      const d = new Date(due);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (d < today) {
        this.showFieldError(
          this.fields.due_date?.input ?? null,
          this.fields.due_date?.error ?? null,
          'Due date cannot be in the past'
        );
        return false;
      }
    }
    return true;
  }

  private getFormData(): TaskCreate {
    return {
      title: this.getFieldValue('title'),
      description: this.getFieldValue('description') || null,
      priority_id: this.getPriorityValue(),
      due_date: this.fields.due_date?.input?.value || null,
      completed: this.elements.completedInput?.checked ?? false,
    };
  }

  private getUpdateData(): TaskUpdate {
    const dueDateValue = this.fields.due_date?.input?.value;
    return {
      title: this.getFieldValue('title'),
      description: this.getFieldValue('description') || '',
      priority_id: this.getPriorityValue(),
      due_date: dueDateValue ?? this.editingTask?.due_date ?? null,
      completed: this.elements.completedInput?.checked ?? false,
    };
  }

  private async onSubmit(): Promise<void> {
    if (!this.validate()) {
      return;
    }

    const isEdit = !!this.editingTaskId;
    this.setSubmitting(true, isEdit ? 'Updating...' : 'Creating...');

    try {
      if (isEdit && this.editingTaskId) {
        await this.service.update(this.editingTaskId, this.getUpdateData());
        showToast(this.toastContainer, 'Task updated successfully', 'success');
      } else {
        await this.service.create(this.getFormData());
        showToast(this.toastContainer, 'Task created successfully', 'success');
      }
      this.close();
      this.onSaved();
    } catch (error) {
      if (isApiError(error)) {
        this.showGlobalError(error.message);
      } else {
        const apiError = error as {
          status?: number;
          data?: { errors?: Record<string, string[]> };
          message?: string;
        };
        if (apiError.status === 400 && apiError.data?.errors) {
          this.showValidationErrors(apiError.data.errors);
        } else {
          this.showGlobalError(apiError.message || 'An error occurred');
        }
      }
    } finally {
      this.setSubmitting(false, isEdit ? 'Update Task' : 'Create Task');
    }
  }

  private showValidationErrors(errors: Record<string, string[]>): void {
    for (const [field, msgs] of Object.entries(errors)) {
      const input = this.form.querySelector(`[name="${field}"]`);
      const errorEl = document.getElementById(`${field}-error`);
      if (input && errorEl) {
        this.showFieldError(
          input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
          errorEl,
          msgs[0] ?? 'Invalid value'
        );
      }
    }
    this.showGlobalError('Please fix the errors above');
  }

  startEdit(task: Task): void {
    this.open(true);
    this.editingTaskId = task.task_id;
    this.editingTask = task;
    if (this.elements.idInput) {
      this.elements.idInput.value = task.task_id;
    }
    if (this.fields.title?.input) {
      this.fields.title.input.value = task.title;
    }
    if (this.fields.description?.input) {
      this.fields.description.input.value = task.description || '';
    }
    if (this.fields.due_date?.input) {
      this.fields.due_date.input.value = task.due_date ? task.due_date.substring(0, 10) : '';
    }
    this.setPriorityValue(task.priority_id);
    if (this.elements.completedInput) {
      this.elements.completedInput.checked = task.completed;
    }
    if (this.elements.modalTitle) {
      this.elements.modalTitle.textContent = 'Edit Task';
    }
    if (this.submitBtn) {
      this.submitBtn.textContent = 'Update Task';
    }
    setTimeout(() => this.fields.title?.input?.focus(), 50);
  }

  resetForm(): void {
    this.editingTaskId = null;
    this.editingTask = null;
    if (this.elements.idInput) {
      this.elements.idInput.value = '';
    }
    this.form.reset();
    this.setPriorityValue(3);
    this.clearAllErrors();
    if (this.submitBtn) {
      this.submitBtn.textContent = 'Create Task';
    }
  }
}
