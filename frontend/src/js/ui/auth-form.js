import { FormHandler } from "./form-handler.js";
import { AuthAPI } from "../api/auth.js";
import { AuthSession } from "../services/auth-session.js";

export class AuthFormHandler extends FormHandler {
    constructor(formId, apiMethod, successUrl = "../index.html") {
        super(formId);
        this.api = new AuthAPI();
        this.apiMethod = apiMethod;
        this.successUrl = successUrl;
    }

    async execute(username, password) {
        this.setSubmitting(true, this.apiMethod === "login" ? "Logging in..." : "Registering...");

        try {
            const response = await this.api[this.apiMethod](username, password);
            AuthSession.setTokens(response);
            window.location.href = this.successUrl;
        } catch (error) {
            const message = error.data?.error?.message || error.message || `${this.apiMethod} failed`;
            this.showGlobalError(message);
        } finally {
            this.setSubmitting(false, this.apiMethod === "login" ? "Login" : "Register");
        }
    }
}