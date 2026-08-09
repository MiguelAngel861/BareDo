// Adaptador para usar el nuevo cliente API sin reescribir la UI
// Sustituye: base.js + tasks.js + auth.js + task-service.js

import { api } from './client.js';

const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

function goToLogin(reason = '') {
  if (reason) sessionStorage.setItem('last_auth_error', reason);
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  window.location.href = 'pages/login.html';
}

// Clases compatibles con la UI existente
export class TaskAPI {
  async getTasks(params = {}) {
    return api.tasks.list(params);
  }

  getTask(id) {
    return api.tasks.get(id);
  }

  createTask(data) {
    return api.tasks.create(data);
  }

  updateTask(id, data) {
    return api.tasks.update(id, data);
  }

  patchTask(id, data) {
    return api.tasks.patch(id, data);
  }

  deleteTask(id) {
    return api.tasks.delete(id);
  }
}

export class AuthSession {
  static hasToken() {
    return !!localStorage.getItem('access_token');
  }

  static clear() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  static async refresh() {
    try {
      await api.auth.refresh();
      return true;
    } catch {
      return false;
    }
  }
}

export class TaskService {
  constructor(api = new TaskAPI()) {
    this.api = api;
  }

  load(filters = {}) {
    return this.api.getTasks(filters);
  }

  create(data) {
    return this.api.createTask(data);
  }

  update(id, data) {
    return this.api.updateTask(id, data);
  }

  patch(id, data) {
    return this.api.patchTask(id, data);
  }

  delete(id) {
    return this.api.deleteTask(id);
  }
}

export { api, goToLogin };