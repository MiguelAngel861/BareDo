import { AuthFormHandler } from "../ui/auth-form.js";

class RegisterPage extends AuthFormHandler {
    constructor() {
        super("register-form", "register");

        this.registerField("username", "username", "username-error");
        this.registerField("password", "password", "password-error");
        this.registerField("confirmPassword", "confirm-password", "confirm-password-error");
        this.registerGlobalError("global-error");
        this.registerSubmitButton("submit-btn");

        this.handleSubmit(() => this.validateAndSubmit());
    }

    validateAndSubmit() {
        const usernameValid = this.validateField("username", [
            { required: true, message: "Username is required" },
            { min: 3, message: "Username must be at least 3 characters" },
            { max: 50, message: "Username must be 50 characters or less" },
        ]);

        const passwordValid = this.validateField("password", [
            { required: true, message: "Password is required" },
            { min: 8, message: "Password must be at least 8 characters" },
            { max: 128, message: "Password must be 128 characters or less" },
        ]);

        const confirmValid = this.validateField("confirmPassword", [
            { required: true, message: "Please confirm your password" },
            { match: this.getFieldValue("password"), message: "Passwords do not match" },
        ]);

        if (!usernameValid || !passwordValid || !confirmValid) return;

        this.execute(this.getFieldValue("username"), this.getFieldValue("password"));
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new RegisterPage();
});