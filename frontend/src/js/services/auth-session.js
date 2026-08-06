import { AuthAPI } from "../api/auth.js";

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

const authApi = new AuthAPI();

export const AuthSession = {
    hasToken() {
        return !!localStorage.getItem(ACCESS_KEY);
    },
    getToken() {
        return localStorage.getItem(ACCESS_KEY);
    },
    getRefreshToken() {
        return localStorage.getItem(REFRESH_KEY);
    },
    setTokens(tokens) {
        if (tokens?.access_token) localStorage.setItem(ACCESS_KEY, tokens.access_token);
        if (tokens?.refresh_token) localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
    },
    clear() {
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
    },
    async refresh() {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) return false;
        try {
            const response = await authApi.refresh(refreshToken);
            this.setTokens(response);
            return true;
        } catch {
            return false;
        }
    },
};