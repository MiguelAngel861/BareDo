import { showToast } from '@/shared/ui/index.ts';
import { signal } from '@preact/signals';
import { tasksApi } from './tasks.api.ts';
import type {
  PaginationMeta,
  Task,
  TaskCreate,
  TaskListParams,
  TaskUpdate,
} from './tasks.types.ts';

export const tasksSignal = signal<Task[]>([]);
export const isLoadingTasksSignal = signal<boolean>(false);

export const paginationSignal = signal<PaginationMeta>({
  page: 1,
  per_page: 5,
  total_pages: 1,
  total_items: 0,
  has_prev: false,
  has_next: false,
});

export const filtersSignal = signal<Partial<TaskListParams>>({
  page: 1,
  per_page: 5,
  title: '',
  completed: undefined,
  priority_id: undefined,
  tag_ids: undefined,
});

export const editingTaskSignal = signal<Task | null>(null);
export const isFormModalOpenSignal = signal<boolean>(false);
export const deletingTaskSignal = signal<Task | null>(null);
export const viewingTaskSignal = signal<Task | null>(null);

export async function loadTasks(): Promise<void> {
  isLoadingTasksSignal.value = true;
  try {
    const res = await tasksApi.list(filtersSignal.value);
    tasksSignal.value = res.tasks;
    paginationSignal.value = res.meta;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to load tasks';
    showToast(`Error loading tasks: ${msg}`, 'error');
  } finally {
    isLoadingTasksSignal.value = false;
  }
}

let searchDebounceTimeout: number | null = null;

export function setSearch(title: string): void {
  if (searchDebounceTimeout) {
    clearTimeout(searchDebounceTimeout);
  }

  searchDebounceTimeout = window.setTimeout(() => {
    filtersSignal.value = {
      ...filtersSignal.value,
      title: title.trim() || undefined,
      page: 1,
    };
    loadTasks();
  }, 300);
}

export function setFilter<K extends keyof TaskListParams>(key: K, value: TaskListParams[K]): void {
  filtersSignal.value = {
    ...filtersSignal.value,
    [key]: value,
    page: 1,
  };
  loadTasks();
}

export function changePage(page: number): void {
  if (page < 1 || page > paginationSignal.value.total_pages) {
    return;
  }
  filtersSignal.value = {
    ...filtersSignal.value,
    page,
  };
  loadTasks();
}

export async function toggleTaskComplete(task: Task): Promise<void> {
  const newStatus = !task.completed;
  try {
    await tasksApi.patch(task.task_id, { completed: newStatus });
    tasksSignal.value = tasksSignal.value.map((t) =>
      t.task_id === task.task_id ? { ...t, completed: newStatus } : t
    );
    if (viewingTaskSignal.value?.task_id === task.task_id) {
      viewingTaskSignal.value = { ...viewingTaskSignal.value, completed: newStatus };
    }
    showToast(newStatus ? 'Task marked as completed' : 'Task marked as pending', 'success');
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to update status';
    showToast(`Error: ${msg}`, 'error');
  }
}

export function openCreateModal(): void {
  viewingTaskSignal.value = null;
  editingTaskSignal.value = null;
  isFormModalOpenSignal.value = true;
}

export function openEditModal(task: Task): void {
  viewingTaskSignal.value = null;
  editingTaskSignal.value = task;
  isFormModalOpenSignal.value = true;
}

export function closeFormModal(): void {
  isFormModalOpenSignal.value = false;
  editingTaskSignal.value = null;
}

export function openViewModal(task: Task): void {
  viewingTaskSignal.value = task;
}

export function closeViewModal(): void {
  viewingTaskSignal.value = null;
}

export function requestDeleteTask(task: Task): void {
  deletingTaskSignal.value = task;
}

export function cancelDeleteTask(): void {
  deletingTaskSignal.value = null;
}

export async function executeDeleteTask(): Promise<void> {
  const task = deletingTaskSignal.value;
  if (!task) {
    return;
  }

  try {
    await tasksApi.delete(task.task_id);
    if (viewingTaskSignal.value?.task_id === task.task_id) {
      viewingTaskSignal.value = null;
    }
    deletingTaskSignal.value = null;
    showToast('Task deleted successfully', 'success');
    loadTasks();
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to delete task';
    showToast(`Error: ${msg}`, 'error');
  }
}

export async function saveTask(
  data: TaskCreate | TaskUpdate,
  isEditing: boolean,
  taskId?: string
): Promise<void> {
  try {
    if (isEditing && taskId) {
      await tasksApi.patch(taskId, data as TaskUpdate);
      showToast('Task updated successfully', 'success');
    } else {
      await tasksApi.create(data as TaskCreate);
      showToast('Task created successfully', 'success');
    }
    closeFormModal();
    loadTasks();
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to save task';
    showToast(`Error: ${msg}`, 'error');
    throw err;
  }
}
