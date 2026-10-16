import { EmptyState } from '@/shared/ui/index.ts';
import { isLoadingTasksSignal, tasksSignal } from '../../tasks.state.ts';
import { TaskCard } from '../TaskCard/index.ts';
import './TaskList.css';

export function TaskList() {
  const tasks = tasksSignal.value;
  const isLoading = isLoadingTasksSignal.value;

  if (isLoading && tasks.length === 0) {
    return (
      <ul id="task-list" class="task-list">
        {[1, 2, 3].map((i) => (
          <li key={i} class="task-item skeleton-card">
            <div class="skeleton-line skeleton-title" />
            <div class="skeleton-line skeleton-desc" />
            <div class="skeleton-line skeleton-meta" />
          </li>
        ))}
      </ul>
    );
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        id="empty-message"
        tag="STATUS: 0 TASKS"
        title="NO TASKS FOUND"
        description='Create your first task using the "+ CREATE TASK" button above to initialize your workspace.'
      />
    );
  }

  return (
    <ul id="task-list" class="task-list">
      {tasks.map((task) => (
        <TaskCard key={task.task_id} task={task} />
      ))}
    </ul>
  );
}
