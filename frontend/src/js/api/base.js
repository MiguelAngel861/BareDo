export class BaseAPI {
    constructor(baseUrl = "http://localhost:5000/api/v1") {
        this.baseUrl = baseUrl;
    }

    getAuthHeaders() {
        const token = localStorage.getItem("access_token");
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        return headers;
    }

    async request(method, endpoint, data = null, auth = false) {
        const options = {
            method,
            headers: auth ? this.getAuthHeaders() : { "Content-Type": "application/json" },
        };
        if (data !== null) options.body = JSON.stringify(data);
        const response = await fetch(`${this.baseUrl}${endpoint}`, options);
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