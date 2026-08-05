const TOKEN_KEY = "access_token";

export const AuthSession = {
    hasToken() {
        return !!localStorage.getItem(TOKEN_KEY);
    },
    getToken() {
        return localStorage.getItem(TOKEN_KEY);
    },
    setToken(token) {
        localStorage.setItem(TOKEN_KEY, token);
    },
    clear() {
        localStorage.removeItem(TOKEN_KEY);
    },
};