import { AuthFormHandler } from "../ui/auth-form.js";

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
        const usernameValid = this.validateField("username", [
            { required: true, message: "Username is required" },
        ]);

        const passwordValid = this.validateField("password", [
            { required: true, message: "Password is required" },
        ]);

        if (!usernameValid || !passwordValid) return;

        this.execute(this.getFieldValue("username"), this.getFieldValue("password"));
    }
}

new LoginPage();