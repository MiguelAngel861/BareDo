import { isLoadingTasksSignal, tasksSignal } from '../tasks.state.ts';
import { TaskCard } from './TaskCard.tsx';

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
      <div id="empty-message" class="empty-state">
        <span class="empty-state-tag">STATUS: 0 TASKS</span>
        <h3 class="empty-state-title">NO TASKS FOUND</h3>
        <p class="empty-state-desc">
          Create your first task using the "+ CREATE TASK" button above to initialize your
          workspace.
        </p>
      </div>
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
