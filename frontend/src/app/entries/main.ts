import { authApi } from '@/features/auth/index.ts';
import { TaskForm, TaskList } from '@/features/tasks/index.ts';
import { clear, hasToken } from '@/shared/auth-session.ts';
import { flushPendingToasts, initServerWarmup, showToast } from '@/shared/ui/index.ts';

initServerWarmup();

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
    showToast(toastContainer, `Session expired (${lastError}): please log in again`, 'error');
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
    authApi
      .me()
      .then((user) => {
        if (status && user?.username) {
          status.textContent = `USER: ${user.username.toUpperCase()}`;
        }
      })
      .catch((err) => {
        console.warn('[auth] Failed to fetch user profile:', err);
      });
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.classList.remove('hidden');
    logoutBtn.style.display = 'inline-block';
    logoutBtn.addEventListener('click', () => goToLogin());
  }

  list.load();

  window.addEventListener('server-ready', () => {
    list.loadRetry();
  });
}

function goToLogin(reason = ''): void {
  if (reason) {
    sessionStorage.setItem('last_auth_error', reason);
  }
  clear();
  window.location.href = '/pages/login.html';
}

document.addEventListener('DOMContentLoaded', init);
