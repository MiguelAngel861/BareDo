import { AuthFormHandler } from "../ui/auth-form.js";
import { USERNAME_RULES, PASSWORD_RULES } from "../utils/validations.js";

class LoginPage extends AuthFormHandler {
    constructor() {
        super("login-form", "login");

        this.registerField("username", "username", "username-error");
        this.registerField("password", "password", "password-error");
        this.registerGlobalError("global-error");
        this.registerSubmitButton("submit-btn");

        this.handleSubmit(() => this.validateAndSubmit());
    }

    validateAndSubmit() {
        const usernameValid = this.validateField("username", USERNAME_RULES);
        const passwordValid = this.validateField("password", PASSWORD_RULES);

        if (!usernameValid || !passwordValid) return;

        this.execute(this.getFieldValue("username"), this.getFieldValue("password"));
    }
}

new LoginPage();
