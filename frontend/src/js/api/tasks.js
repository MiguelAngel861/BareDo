import { BaseAPI } from "./base.js";

export class TaskAPI extends BaseAPI {
    constructor(options = null) {
        super(undefined, options);
    }

    getTasks(params = {}) {
        const q = new URLSearchParams();
        for (const [k, v] of Object.entries(params)) {
            if (v !== undefined && v !== "") q.append(k, v);
        }
        const qs = q.toString();
        return this.request("GET", `/tasks${qs ? `?${qs}` : ""}`, null, true);
    }

    createTask(data) { return this.request("POST", "/tasks", data, true); }
    getTask(id) { return this.request("GET", `/tasks/${id}`, null, true); }
    updateTask(id, data) { return this.request("PUT", `/tasks/${id}`, data, true); }
    patchTask(id, data) { return this.request("PATCH", `/tasks/${id}`, data, true); }
    deleteTask(id) { return this.request("DELETE", `/tasks/${id}`, null, true); }
}