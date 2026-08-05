import { BaseAPI } from "./base.js";

export class AuthAPI extends BaseAPI {
    register(username, password) {
        return this.request("POST", "/auth/register", { username, password });
    }

    login(username, password) {
        return this.request("POST", "/auth/login", { username, password });
    }

    refresh(refreshToken) {
        return this.request("POST", "/auth/refresh", null, false, refreshToken);
    }
}