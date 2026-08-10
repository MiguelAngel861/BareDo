import { TaskForm } from '@/features/tasks/ui/task-form.ts';
import { TaskList } from '@/features/tasks/ui/task-list.ts';
import { clear, hasToken } from '@/shared/auth-session.ts';
import { flushPendingToasts, showToast } from '@/shared/ui/Toast/index.ts';

const LAST_ERROR_KEY = 'last_auth_error';

function init(): void {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    return;
  }

  if (!hasToken()) {
    goToLogin();
    return;
  }

  const lastError = sessionStorage.getItem(LAST_ERROR_KEY);
  if (lastError) {
    sessionStorage.removeItem(LAST_ERROR_KEY);
    showToast(toastContainer, `Sesión expirada (${lastError}): vuelve a iniciar sesión`, 'error');
  }
  flushPendingToasts(toastContainer);

  const form = new TaskForm(toastContainer, () => list.loadRetry());
  const list = new TaskList(toastContainer, (task) => form.startEdit(task));

  const openCreateBtn = document.getElementById('open-create-task-btn');
  if (openCreateBtn) {
    openCreateBtn.addEventListener('click', () => form.open(false));
  }

  const status = document.getElementById('auth-status');
  if (status) {
    status.textContent = 'Authenticated';
    status.style.color = 'var(--success)';
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.classList.remove('hidden');
    logoutBtn.style.display = 'inline-block';
    logoutBtn.addEventListener('click', () => goToLogin());
  }

  list.load();
}

function goToLogin(reason = ''): void {
  if (reason) {
    sessionStorage.setItem('last_auth_error', reason);
  }
  clear();
  window.location.href = '/pages/login.html';
}

document.addEventListener('DOMContentLoaded', init);
