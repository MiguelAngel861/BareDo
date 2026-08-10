import type { ValidationRule } from '../../utils/validations.ts';

export interface FieldConfig {
  input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
  error: HTMLElement | null;
}

interface FieldsRecord {
  [key: string]: FieldConfig;
}

export class FormHandler {
  protected form: HTMLFormElement;
  protected isSubmitting = false;
  protected fields: FieldsRecord = {};
  protected globalError: HTMLElement | null = null;
  protected submitBtn: HTMLButtonElement | null = null;

  constructor(formId: string) {
    this.form = document.getElementById(formId) as HTMLFormElement;
  }

  registerField(name: string, inputId: string, errorId: string): void {
    this.fields[name] = {
      input: document.getElementById(inputId) as
        | HTMLInputElement
        | HTMLTextAreaElement
        | HTMLSelectElement
        | null,
      error: document.getElementById(errorId),
    };
  }

  registerGlobalError(errorId: string): void {
    this.globalError = document.getElementById(errorId);
  }

  registerSubmitButton(buttonId: string): void {
    this.submitBtn = document.getElementById(buttonId) as HTMLButtonElement | null;
  }

  getFieldValue(name: string): string {
    return this.fields[name]?.input?.value?.trim() ?? '';
  }

  validateField(name: string, rules: ValidationRule[]): boolean {
    const field = this.fields[name];
    if (!field?.input) {
      return false;
    }
    const value = field.input.value;

    for (const rule of rules) {
      if (rule.required && !value) {
        this.showFieldError(field.input, field.error, rule.message);
        return false;
      }
      if (rule.min && value.length < rule.min) {
        this.showFieldError(field.input, field.error, rule.message);
        return false;
      }
      if (rule.max && value.length > rule.max) {
        this.showFieldError(field.input, field.error, rule.message);
        return false;
      }
      if (rule.match && value !== rule.match) {
        this.showFieldError(field.input, field.error, rule.message);
        return false;
      }
      if (rule.custom && !rule.custom(value)) {
        this.showFieldError(field.input, field.error, rule.message);
        return false;
      }
    }

    this.clearFieldError(name);
    return true;
  }

  protected showFieldError(
    input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null,
    error: HTMLElement | null,
    message: string
  ): void {
    if (input) {
      input.style.borderColor = 'var(--danger)';
    }
    if (error) {
      error.textContent = message;
      error.classList.add('visible');
    }
  }

  protected clearFieldError(name: string): void {
    const field = this.fields[name];
    if (field?.input) {
      field.input.style.borderColor = '';
    }
    if (field?.error) {
      field.error.classList.remove('visible');
    }
  }

  clearAllErrors(): void {
    for (const name of Object.keys(this.fields)) {
      this.clearFieldError(name);
    }
    if (this.globalError) {
      this.globalError.classList.remove('visible');
      this.globalError.textContent = '';
    }
  }

  showGlobalError(message: string): void {
    if (this.globalError) {
      this.globalError.textContent = message;
      this.globalError.classList.add('visible');
    }
  }

  setSubmitting(submitting: boolean, text = ''): void {
    this.isSubmitting = submitting;
    if (this.submitBtn) {
      this.submitBtn.disabled = submitting;
      if (text) {
        this.submitBtn.textContent = text;
      }
    }
  }

  handleSubmit(callback: () => Promise<void>): void {
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (this.isSubmitting) {
        return;
      }
      await callback();
    });
  }

  validateOnBlur(name: string, rules: ValidationRule[]): void {
    const field = this.fields[name];
    if (!field?.input) {
      return;
    }
    field.input.addEventListener('blur', () => {
      if (field.input?.value) {
        this.validateField(name, rules);
      }
    });
  }
}
