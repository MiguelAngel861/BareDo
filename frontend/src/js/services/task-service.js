export class TaskService {
    constructor(api) {
        this.api = api;
    }

    async load(filters) {
        return await this.api.getTasks(filters);
    }

    create(data) { return this.api.createTask(data); }
    update(id, data) { return this.api.updateTask(id, data); }
    delete(id) { return this.api.deleteTask(id); }
}
