export class FormHandler {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.isSubmitting = false;
        this.fields = {};
    }

    registerField(name, inputId, errorId) {
        this.fields[name] = {
            input: document.getElementById(inputId),
            error: document.getElementById(errorId),
        };
    }

    registerGlobalError(errorId) {
        this.globalError = document.getElementById(errorId);
    }

    registerSubmitButton(buttonId) {
        this.submitBtn = document.getElementById(buttonId);
    }

    getFieldValue(name) {
        return this.fields[name]?.input?.value?.trim() ?? "";
    }

    validateField(name, rules) {
        const { input, error } = this.fields[name];
        const value = input.value;

        for (const rule of rules) {
            if (rule.required && !value) {
                this.showFieldError(input, error, rule.message);
                return false;
            }
            if (rule.min && value.length < rule.min) {
                this.showFieldError(input, error, rule.message);
                return false;
            }
            if (rule.max && value.length > rule.max) {
                this.showFieldError(input, error, rule.message);
                return false;
            }
            if (rule.match && value !== rule.match) {
                this.showFieldError(input, error, rule.message);
                return false;
            }
            if (rule.custom && !rule.custom(value)) {
                this.showFieldError(input, error, rule.message);
                return false;
            }
        }

        this.clearFieldError(name);
        return true;
    }

    showFieldError(input, error, message) {
        input.style.borderColor = "var(--danger)";
        error.textContent = message;
        error.classList.add("visible");
    }

    clearFieldError(name) {
        const { input, error } = this.fields[name];
        input.style.borderColor = "";
        error.classList.remove("visible");
    }

    clearAllErrors() {
        for (const name of Object.keys(this.fields)) {
            this.clearFieldError(name);
        }
        if (this.globalError) {
            this.globalError.classList.remove("visible");
            this.globalError.textContent = "";
        }
    }

    showGlobalError(message) {
        if (this.globalError) {
            this.globalError.textContent = message;
            this.globalError.classList.add("visible");
        }
    }

    setSubmitting(submitting, text = "") {
        this.isSubmitting = submitting;
        this.submitBtn.disabled = submitting;
        if (text) this.submitBtn.textContent = text;
    }

    async handleSubmit(callback) {
        this.form.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (this.isSubmitting) return;
            await callback();
        });
    }
}