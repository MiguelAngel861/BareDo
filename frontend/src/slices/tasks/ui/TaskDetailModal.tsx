import { Button, PopoutModal } from '@/shared/ui/index.ts';
import { getPriorityDescription, getPriorityLabel } from '@/slices/priorities/index.ts';
import {
  closeViewModal,
  openEditModal,
  requestDeleteTask,
  toggleTaskComplete,
  viewingTaskSignal,
} from '../tasks.state.ts';
import { SubtaskList } from './SubtaskList.tsx';

function formatDate(dateStr?: string | null): string {
  if (!dateStr) {
    return '';
  }
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) {
      return dateStr.substring(0, 10);
    }
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr.substring(0, 10);
  }
}

function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) {
    return '—';
  }
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) {
      return dateStr;
    }
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function TaskDetailModal() {
  const task = viewingTaskSignal.value;

  if (!task) {
    return null;
  }

  const priorityLabel = getPriorityLabel(task.priority_id);
  const priorityDesc = getPriorityDescription(task.priority_id);

  const handleEdit = () => {
    openEditModal(task);
  };

  const handleDelete = () => {
    closeViewModal();
    requestDeleteTask(task);
  };

  const handleToggle = () => {
    toggleTaskComplete(task);
  };

  return (
    <PopoutModal isOpen={Boolean(task)} onClose={closeViewModal} title="Task Preview">
      <div class="task-detail-container">
        <header class="task-detail-header">
          <div class="task-detail-badge-group">
            <span class={`task-detail-status ${task.completed ? 'is-completed' : 'is-pending'}`}>
              {task.completed ? '● COMPLETED' : '○ PENDING'}
            </span>

            <span
              class={`task-priority task-priority-${task.priority_id}`}
              title={priorityDesc || undefined}
            >
              {priorityLabel}
            </span>

            {task.due_date && <span class="task-detail-due">DUE: {formatDate(task.due_date)}</span>}
          </div>

          <h3 class={`task-detail-title ${task.completed ? 'completed' : ''}`.trim()}>
            {task.title}
          </h3>

          {priorityDesc && (
            <p class="task-detail-priority-desc">
              <strong>Priority Guide:</strong> {priorityDesc}
            </p>
          )}
        </header>

        <div class="task-detail-section">
          <h4 class="task-detail-section-title">Description</h4>
          {task.description ? (
            <div class="task-detail-description">{task.description}</div>
          ) : (
            <p class="task-detail-empty-text">No description provided for this task.</p>
          )}
        </div>

        {task.tags && task.tags.length > 0 && (
          <div class="task-detail-section task-detail-section--tags">
            <h4 class="task-detail-section-title">Tags</h4>
            <div class="task-tags">
              {task.tags.map((tag) => (
                <span key={tag.tag_id} class="task-tag-badge">
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div class="task-detail-section task-detail-section--subtasks">
          <SubtaskList taskId={task.task_id} subtasks={task.subtasks || []} />
        </div>

        <footer class="task-detail-meta-grid">
          <div class="task-detail-meta-item">
            <span class="meta-label">Task ID</span>
            <span class="meta-value">#{task.task_id}</span>
          </div>
          <div class="task-detail-meta-item">
            <span class="meta-label">Created</span>
            <span class="meta-value">{formatDateTime(task.created_at)}</span>
          </div>
          <div class="task-detail-meta-item">
            <span class="meta-label">Updated</span>
            <span class="meta-value">{formatDateTime(task.updated_at)}</span>
          </div>
        </footer>

        <div class="task-detail-actions">
          <Button type="button" variant="secondary" size="md" onClick={handleEdit}>
            Edit Task
          </Button>

          <Button type="button" variant="primary" size="md" onClick={handleToggle}>
            {task.completed ? 'Mark Pending' : 'Mark Completed'}
          </Button>

          <Button type="button" variant="danger" size="md" onClick={handleDelete}>
            Delete Task
          </Button>
        </div>
      </div>
    </PopoutModal>
  );
}
