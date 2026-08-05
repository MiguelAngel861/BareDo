export class BaseAPI {
    constructor(baseUrl = "http://localhost:5000/api/v1", { onUnauthorized = null } = {}) {
        this.baseUrl = baseUrl;
        this.onUnauthorized = onUnauthorized;
    }

    getAuthHeaders() {
        const token = localStorage.getItem("access_token");
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        return headers;
    }

    async request(method, endpoint, data = null, auth = false, token = null) {
        const options = {
            method,
            headers: token
                ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
                : auth ? this.getAuthHeaders() : { "Content-Type": "application/json" },
        };
        if (data !== null) options.body = JSON.stringify(data);

        let response = await fetch(`${this.baseUrl}${endpoint}`, options);

        if (auth && response.status === 401 && this.onUnauthorized) {
            const refreshed = await this.onUnauthorized();
            if (refreshed) {
                options.headers = this.getAuthHeaders();
                response = await fetch(`${this.baseUrl}${endpoint}`, options);
            }
        }

        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
            const error = new Error(body.message || `HTTP ${response.status}`);
            error.status = response.status;
            error.data = body;
            throw error;
        }
        return body;
    }
}