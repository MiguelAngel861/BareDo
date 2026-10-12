import { Button } from '@/shared/ui/index.ts';
import { getPriorityDescription, getPriorityLabel } from '@/slices/priorities/index.ts';
import {
  openEditModal,
  openViewModal,
  requestDeleteTask,
  toggleTaskComplete,
} from '../tasks.state.ts';
import type { Task } from '../tasks.types.ts';

export function TaskCard({ task }: { task: Task }) {
  const priorityLabel = getPriorityLabel(task.priority_id);
  const priorityDesc = getPriorityDescription(task.priority_id);

  return (
    <li class="task-item">
      <div
        class="task-content"
        role="button"
        tabIndex={0}
        aria-label={`View task details for ${task.title}`}
        onClick={() => openViewModal(task)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openViewModal(task);
          }
        }}
      >
        <div class={`task-title ${task.completed ? 'completed' : ''}`.trim()}>{task.title}</div>

        {task.description && <div class="task-description">{task.description}</div>}

        {task.tags && task.tags.length > 0 && (
          <div class="task-tags">
            {task.tags.map((tag) => (
              <span key={tag.tag_id} class="task-tag-badge">
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        <div class="task-meta">
          <span
            class={`task-priority task-priority-${task.priority_id}`}
            title={priorityDesc || undefined}
          >
            {priorityLabel}
          </span>

          {task.due_date && (
            <span class="task-due-date">Due: {task.due_date.substring(0, 10)}</span>
          )}

          <span>{task.completed ? 'Completed' : 'Pending'}</span>
        </div>
      </div>

      <div class="task-actions">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            openEditModal(task);
          }}
        >
          Edit
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            toggleTaskComplete(task);
          }}
        >
          {task.completed ? 'Mark Pending' : 'Mark Complete'}
        </Button>

        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            requestDeleteTask(task);
          }}
        >
          Delete
        </Button>
      </div>
    </li>
  );
}
