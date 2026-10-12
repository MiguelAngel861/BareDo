import { Button, ConfirmModal } from '@/shared/ui/index.ts';
import { authSignal, logout } from '@/slices/auth/index.ts';
import { fetchPriorities } from '@/slices/priorities/index.ts';
import { fetchTags } from '@/slices/tags/index.ts';
import {
  TaskDetailModal,
  TaskFiltersBar,
  TaskList,
  TaskPagination,
  TaskPopoutModal,
  cancelDeleteTask,
  deletingTaskSignal,
  executeDeleteTask,
  loadTasks,
  openCreateModal,
  paginationSignal,
} from '@/slices/tasks/index.ts';
import { useEffect } from 'preact/hooks';

export function HomePage() {
  const user = authSignal.value.user;
  const totalItems = paginationSignal.value.total_items;
  const deletingTask = deletingTaskSignal.value;

  useEffect(() => {
    loadTasks();
    fetchPriorities();
    fetchTags();

    const handleServerReady = () => {
      loadTasks();
    };
    window.addEventListener('server-ready', handleServerReady, { once: true });
    return () => window.removeEventListener('server-ready', handleServerReady);
  }, []);

  return (
    <>
      <a href="#main" class="skip-link">
        Skip to content
      </a>

      <header class="site-header">
        <div class="header-inner">
          <h1 class="site-title">BareDo</h1>
          <div id="auth-section" class="auth-minimal">
            <span id="auth-status" aria-live="polite" style={{ color: 'var(--success)' }}>
              {user?.username ? user.username : 'Authenticated'}
            </span>
            <Button
              id="logout-btn"
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => logout()}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main id="main">
        <section id="task-list-section" class="section section--list">
          <header class="section-header section-header--minimal">
            <div class="section-header-left">
              <h2>Tasks</h2>
              <span id="task-count" class="task-count" aria-live="polite">
                {totalItems} {totalItems === 1 ? 'task' : 'tasks'}
              </span>
            </div>
            <Button
              type="button"
              id="open-create-task-btn"
              variant="primary"
              size="md"
              onClick={() => openCreateModal()}
            >
              + CREATE TASK
            </Button>
          </header>

          <TaskFiltersBar />
          <TaskList />
          <TaskPagination />
        </section>
      </main>

      <TaskPopoutModal />
      <TaskDetailModal />

      <ConfirmModal
        isOpen={Boolean(deletingTask)}
        title="Delete Task"
        message={`Are you sure you want to delete "${deletingTask?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={executeDeleteTask}
        onCancel={cancelDeleteTask}
      />
    </>
  );
}
