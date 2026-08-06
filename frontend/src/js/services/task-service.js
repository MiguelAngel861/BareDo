import { TaskAPI } from "../api/tasks.js";

export class TaskService {
    constructor(api, onUnauthorized) {
        this.api = api;
        this.onUnauthorized = onUnauthorized;
    }

    async load(filters) {
        try {
            return await this.api.getTasks(filters);
        } catch (error) {
            if (error.status === 401) {
                this.onUnauthorized();
                return null;
            }
            throw error;
        }
    }

    create(data) { return this.api.createTask(data); }
    update(id, data) { return this.api.updateTask(id, data); }
    patch(id, data) { return this.api.patchTask(id, data); }
    delete(id) { return this.api.deleteTask(id); }
}