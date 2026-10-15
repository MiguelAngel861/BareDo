import { useDocumentTitle } from '@/shared/hooks/index.ts';
import {
  Button,
  ConfirmModal,
  isCommandPaletteOpenSignal,
  openCommandPalette,
} from '@/shared/ui/index.ts';
import { authSignal, logout } from '@/slices/auth/index.ts';
import { fetchPriorities } from '@/slices/priorities/index.ts';
import {
  ManageTagsModal,
  fetchTags,
  isManageTagsModalOpenSignal,
  openManageTagsModal,
} from '@/slices/tags/index.ts';
import {
  ShortcutHelpModal,
  TaskDetailModal,
  TaskFiltersBar,
  TaskList,
  TaskPagination,
  TaskPopoutModal,
  TrashModal,
  cancelDeleteTask,
  closeShortcutHelpModal,
  deletingTaskSignal,
  executeDeleteTask,
  fetchTrashCount,
  isFormModalOpenSignal,
  isShortcutHelpModalOpenSignal,
  isTrashModalOpenSignal,
  loadTasks,
  openCreateModal,
  openEditModal,
  openShortcutHelpModal,
  openTrashModal,
  openViewModal,
  paginationSignal,
  requestDeleteTask,
  selectNextTask,
  selectPrevTask,
  selectedTaskIdSignal,
  tasksSignal,
  toggleTaskComplete,
  trashCountSignal,
  viewingTaskSignal,
} from '@/slices/tasks/index.ts';
import { useLocation } from 'preact-iso';
import { useEffect } from 'preact/hooks';
import './HomePage.css';

export function HomePage() {
  useDocumentTitle('Tasks — BareDo');
  const location = useLocation();
  const user = authSignal.value.user;
  const totalItems = paginationSignal.value.total_items;
  const deletingTask = deletingTaskSignal.value;
  const isShortcutModalOpen = isShortcutHelpModalOpenSignal.value;
  const trashCount = trashCountSignal.value;

  const handleLogout = () => {
    logout();
    location.route('/login');
  };

  useEffect(() => {
    loadTasks();
    fetchPriorities();
    fetchTags();
    fetchTrashCount();

    const handleServerReady = () => {
      loadTasks();
      fetchPriorities();
      fetchTags();
      fetchTrashCount();
    };
    window.addEventListener('server-ready', handleServerReady, { once: true });
    return () => window.removeEventListener('server-ready', handleServerReady);
  }, []);

  // Global Keyboard shortcuts listener (Vim-style J/K, X, Enter, E, D, C, ?)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Ignore if typing in text fields
      const target = e.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      const isEditable =
        target?.isContentEditable ||
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select';

      if (isEditable) {
        return;
      }

      // 2. Ignore single-key shortcuts if an overlay/modal is open
      const isAnyModalOpen =
        Boolean(deletingTaskSignal.value) ||
        Boolean(viewingTaskSignal.value) ||
        isFormModalOpenSignal.value ||
        isShortcutHelpModalOpenSignal.value ||
        isCommandPaletteOpenSignal.value ||
        isManageTagsModalOpenSignal.value ||
        isTrashModalOpenSignal.value;

      if (isAnyModalOpen) {
        return;
      }

      const activeTask = tasksSignal.value.find((t) => t.task_id === selectedTaskIdSignal.value);

      switch (e.key) {
        case 'j':
        case 'ArrowDown': {
          e.preventDefault();
          selectNextTask();
          break;
        }
        case 'k':
        case 'ArrowUp': {
          e.preventDefault();
          selectPrevTask();
          break;
        }
        case 'x':
        case ' ': {
          if (activeTask) {
            e.preventDefault();
            toggleTaskComplete(activeTask);
          }
          break;
        }
        case 'Enter': {
          if (activeTask) {
            e.preventDefault();
            openViewModal(activeTask);
          }
          break;
        }
        case 'e':
        case 'E': {
          if (activeTask) {
            e.preventDefault();
            openEditModal(activeTask);
          }
          break;
        }
        case 'd':
        case 'Delete': {
          if (activeTask) {
            e.preventDefault();
            requestDeleteTask(activeTask);
          }
          break;
        }
        case 'c':
        case 'C': {
          e.preventDefault();
          openCreateModal();
          break;
        }
        case '?': {
          e.preventDefault();
          openShortcutHelpModal();
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div class="home-layout">
      <a href="#main" class="skip-link">
        Skip to content
      </a>

      <header class="site-header">
        <div class="header-inner">
          <h1 class="site-title">BareDo</h1>

          <div class="header-actions">
            <Button
              type="button"
              id="open-command-palette-btn"
              variant="ghost"
              size="sm"
              title="Command Palette (Ctrl+K)"
              onClick={() => openCommandPalette()}
              className="header-cmd-btn"
            >
              <span class="cmd-text">COMMANDS</span>
              <kbd class="cmd-kbd">CTRL+K</kbd>
            </Button>
            <Button
              type="button"
              id="open-shortcuts-help-btn"
              variant="ghost"
              size="sm"
              title="Keyboard Shortcuts (?)"
              onClick={() => openShortcutHelpModal()}
              aria-label="Keyboard Shortcuts"
            >
              ?
            </Button>

            <div id="auth-section" class="auth-minimal">
              <span id="auth-status" aria-live="polite" style={{ color: 'var(--success)' }}>
                {user?.username ? user.username : 'Authenticated'}
              </span>
              <Button
                id="logout-btn"
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
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
            <div class="section-header-actions">
              <Button
                type="button"
                id="open-trash-btn"
                variant="ghost"
                size="md"
                onClick={() => openTrashModal()}
                title="View discarded tasks"
              >
                TRASH ({trashCount})
              </Button>
              <Button
                type="button"
                id="manage-tags-btn"
                variant="ghost"
                size="md"
                onClick={() => openManageTagsModal()}
              >
                MANAGE TAGS
              </Button>
              <Button
                type="button"
                id="open-create-task-btn"
                variant="primary"
                size="md"
                onClick={() => openCreateModal()}
              >
                + CREATE TASK
              </Button>
            </div>
          </header>

          <TaskFiltersBar />
          <TaskList />
          <TaskPagination />
        </section>
      </main>

      <TaskPopoutModal />
      <TaskDetailModal />
      <ManageTagsModal />
      <TrashModal />

      <ConfirmModal
        isOpen={Boolean(deletingTask)}
        title="Move to Trash"
        message={`Are you sure you want to move "${deletingTask?.title}" to trash? You can restore it later.`}
        confirmLabel="Move to Trash"
        cancelLabel="Cancel"
        onConfirm={executeDeleteTask}
        onCancel={cancelDeleteTask}
      />

      <ShortcutHelpModal isOpen={isShortcutModalOpen} onClose={closeShortcutHelpModal} />
    </div>
  );
}
