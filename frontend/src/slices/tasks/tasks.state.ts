import { getErrorMessage } from '@/shared/api/errors/index.ts';
import { showToast } from '@/shared/ui/index.ts';
import { signal } from '@preact/signals';
import { tasksApi } from './tasks.api.ts';
import type {
  PaginationMeta,
  Subtask,
  SubtaskId,
  Task,
  TaskCreate,
  TaskId,
  TaskListParams,
  TaskUpdate,
} from './tasks.types.ts';

function showErrorToast(err: unknown, fallback: string): void {
  showToast(`Error: ${getErrorMessage(err, fallback)}`, 'error');
}

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
export const isShortcutHelpModalOpenSignal = signal<boolean>(false);
export const selectedTaskIdSignal = signal<TaskId | null>(null);

export const trashTasksSignal = signal<Task[]>([]);
export const trashCountSignal = signal<number>(0);
export const isTrashModalOpenSignal = signal<boolean>(false);
export const isLoadingTrashSignal = signal<boolean>(false);
export const trashPaginationSignal = signal<PaginationMeta>({
  page: 1,
  per_page: 10,
  total_pages: 1,
  total_items: 0,
  has_prev: false,
  has_next: false,
});
export const permanentDeletingTaskSignal = signal<Task | null>(null);
export const isConfirmEmptyTrashOpenSignal = signal<boolean>(false);

export function selectNextTask(): void {
  const tasks = tasksSignal.value;
  if (tasks.length === 0) {
    selectedTaskIdSignal.value = null;
    return;
  }
  const currentIndex = tasks.findIndex(
    (t) => String(t.task_id) === String(selectedTaskIdSignal.value)
  );
  if (currentIndex === -1 || currentIndex >= tasks.length - 1) {
    selectedTaskIdSignal.value = tasks[0]?.task_id ?? null;
  } else {
    selectedTaskIdSignal.value = tasks[currentIndex + 1]?.task_id ?? null;
  }
}

export function selectPrevTask(): void {
  const tasks = tasksSignal.value;
  if (tasks.length === 0) {
    selectedTaskIdSignal.value = null;
    return;
  }
  const currentIndex = tasks.findIndex(
    (t) => String(t.task_id) === String(selectedTaskIdSignal.value)
  );
  if (currentIndex <= 0) {
    selectedTaskIdSignal.value = tasks[tasks.length - 1]?.task_id ?? null;
  } else {
    selectedTaskIdSignal.value = tasks[currentIndex - 1]?.task_id ?? null;
  }
}

export function openShortcutHelpModal(): void {
  isShortcutHelpModalOpenSignal.value = true;
}

export function closeShortcutHelpModal(): void {
  isShortcutHelpModalOpenSignal.value = false;
}

export async function loadTasks(): Promise<void> {
  isLoadingTasksSignal.value = true;
  try {
    const res = await tasksApi.list(filtersSignal.value);
    tasksSignal.value = res.tasks;
    paginationSignal.value = res.meta;
    fetchTrashCount();
    if (res.tasks.length > 0) {
      const stillExists = res.tasks.some(
        (t) => String(t.task_id) === String(selectedTaskIdSignal.value)
      );
      if (!stillExists) {
        selectedTaskIdSignal.value = res.tasks[0]?.task_id ?? null;
      }
    } else {
      selectedTaskIdSignal.value = null;
    }
  } catch (err) {
    showToast(`Error loading tasks: ${getErrorMessage(err, 'Failed to load tasks')}`, 'error');
  } finally {
    isLoadingTasksSignal.value = false;
  }
}

let searchDebounceTimeout: number | null = null;

export function setSearch(title: string, immediate = false): void {
  if (searchDebounceTimeout) {
    clearTimeout(searchDebounceTimeout);
    searchDebounceTimeout = null;
  }

  const applySearch = () => {
    filtersSignal.value = {
      ...filtersSignal.value,
      title: title.trim() || undefined,
      page: 1,
    };
    loadTasks();
  };

  if (immediate) {
    applySearch();
  } else {
    searchDebounceTimeout = window.setTimeout(applySearch, 300);
  }
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
  const previousStatus = task.completed;
  const newStatus = !previousStatus;

  // 1. Optimistic update (0ms immediate feedback)
  tasksSignal.value = tasksSignal.value.map((t) =>
    t.task_id === task.task_id ? { ...t, completed: newStatus } : t
  );
  if (viewingTaskSignal.value?.task_id === task.task_id) {
    viewingTaskSignal.value = { ...viewingTaskSignal.value, completed: newStatus };
  }

  try {
    await tasksApi.patch(task.task_id, { completed: newStatus });
    showToast(newStatus ? 'Task marked as completed' : 'Task marked as pending', 'success');
  } catch (err) {
    // 2. Rollback on failure
    tasksSignal.value = tasksSignal.value.map((t) =>
      t.task_id === task.task_id ? { ...t, completed: previousStatus } : t
    );
    if (viewingTaskSignal.value?.task_id === task.task_id) {
      viewingTaskSignal.value = { ...viewingTaskSignal.value, completed: previousStatus };
    }
    showErrorToast(err, 'Failed to update status');
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

  // Preserve previous state for potential rollback
  const previousTasks = [...tasksSignal.value];
  const previousPagination = { ...paginationSignal.value };

  // 1. Optimistic removal (0ms immediate feedback)
  deletingTaskSignal.value = null;
  if (viewingTaskSignal.value?.task_id === task.task_id) {
    viewingTaskSignal.value = null;
  }
  tasksSignal.value = previousTasks.filter((t) => t.task_id !== task.task_id);
  paginationSignal.value = {
    ...previousPagination,
    total_items: Math.max(0, previousPagination.total_items - 1),
  };

  try {
    await tasksApi.delete(task.task_id);
    showToast('Task moved to trash', 'success');
    fetchTrashCount();
    // Silent refresh to align pagination metadata if needed
    loadTasks();
  } catch (err) {
    // 2. Rollback on failure
    tasksSignal.value = previousTasks;
    paginationSignal.value = previousPagination;
    showErrorToast(err, 'Failed to delete task');
  }
}

export async function saveTask(
  data: TaskCreate | TaskUpdate,
  isEditing: boolean,
  taskId?: TaskId
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
    showErrorToast(err, 'Failed to save task');
    throw err;
  }
}

export async function fetchTrashCount(): Promise<void> {
  try {
    const res = await tasksApi.getTrashCount();
    trashCountSignal.value = res.count;
  } catch {
    // Keep existing count on error
  }
}

export async function loadTrashTasks(page = 1): Promise<void> {
  isLoadingTrashSignal.value = true;
  try {
    const res = await tasksApi.listTrash({ page, per_page: 10 });
    trashTasksSignal.value = res.tasks;
    trashPaginationSignal.value = res.meta;
    trashCountSignal.value = res.meta.total_items;
  } catch (err) {
    showErrorToast(err, 'Failed to load trash');
  } finally {
    isLoadingTrashSignal.value = false;
  }
}

export function openTrashModal(): void {
  isTrashModalOpenSignal.value = true;
  loadTrashTasks(1);
}

export function closeTrashModal(): void {
  isTrashModalOpenSignal.value = false;
  permanentDeletingTaskSignal.value = null;
  isConfirmEmptyTrashOpenSignal.value = false;
}

export async function restoreTaskAction(task: Task): Promise<void> {
  try {
    await tasksApi.restore(task.task_id);
    showToast('Task restored', 'success');
    trashTasksSignal.value = trashTasksSignal.value.filter((t) => t.task_id !== task.task_id);
    trashCountSignal.value = Math.max(0, trashCountSignal.value - 1);
    loadTasks();
    if (trashTasksSignal.value.length === 0 && trashPaginationSignal.value.page > 1) {
      loadTrashTasks(trashPaginationSignal.value.page - 1);
    }
  } catch (err) {
    showErrorToast(err, 'Failed to restore task');
  }
}

export function requestPermanentDeleteTask(task: Task): void {
  permanentDeletingTaskSignal.value = task;
}

export function cancelPermanentDeleteTask(): void {
  permanentDeletingTaskSignal.value = null;
}

export async function executePermanentDeleteTask(): Promise<void> {
  const task = permanentDeletingTaskSignal.value;
  if (!task) {
    return;
  }
  permanentDeletingTaskSignal.value = null;

  try {
    await tasksApi.permanentDelete(task.task_id);
    showToast('Task permanently deleted', 'success');
    trashTasksSignal.value = trashTasksSignal.value.filter((t) => t.task_id !== task.task_id);
    trashCountSignal.value = Math.max(0, trashCountSignal.value - 1);
    if (trashTasksSignal.value.length === 0 && trashPaginationSignal.value.page > 1) {
      loadTrashTasks(trashPaginationSignal.value.page - 1);
    }
  } catch (err) {
    showErrorToast(err, 'Failed to delete task permanently');
  }
}

export function requestEmptyTrash(): void {
  isConfirmEmptyTrashOpenSignal.value = true;
}

export function cancelEmptyTrash(): void {
  isConfirmEmptyTrashOpenSignal.value = false;
}

export async function executeEmptyTrash(): Promise<void> {
  isConfirmEmptyTrashOpenSignal.value = false;
  try {
    await tasksApi.emptyTrash();
    showToast('Trash emptied', 'success');
    trashTasksSignal.value = [];
    trashCountSignal.value = 0;
    trashPaginationSignal.value = {
      page: 1,
      per_page: 10,
      total_pages: 1,
      total_items: 0,
      has_prev: false,
      has_next: false,
    };
  } catch (err) {
    showErrorToast(err, 'Failed to empty trash');
  }
}

export async function addSubtaskAction(taskId: TaskId, title: string): Promise<Subtask | null> {
  const cleanTitle = title.trim();
  if (!cleanTitle) {
    return null;
  }
  try {
    const created = await tasksApi.createSubtask(taskId, { title: cleanTitle, completed: false });
    tasksSignal.value = tasksSignal.value.map((t) =>
      t.task_id === taskId ? { ...t, subtasks: [...(t.subtasks || []), created] } : t
    );
    if (viewingTaskSignal.value?.task_id === taskId) {
      viewingTaskSignal.value = {
        ...viewingTaskSignal.value,
        subtasks: [...(viewingTaskSignal.value.subtasks || []), created],
      };
    }
    showToast('Subtask added', 'success');
    return created;
  } catch (err) {
    showErrorToast(err, 'Failed to add subtask');
    return null;
  }
}

export async function toggleSubtaskAction(taskId: TaskId, subtask: Subtask): Promise<void> {
  const newStatus = !subtask.completed;
  const updateList = (subtasks: Subtask[]) =>
    subtasks.map((s) => (s.subtask_id === subtask.subtask_id ? { ...s, completed: newStatus } : s));

  tasksSignal.value = tasksSignal.value.map((t) =>
    t.task_id === taskId ? { ...t, subtasks: updateList(t.subtasks || []) } : t
  );
  if (viewingTaskSignal.value?.task_id === taskId) {
    viewingTaskSignal.value = {
      ...viewingTaskSignal.value,
      subtasks: updateList(viewingTaskSignal.value.subtasks || []),
    };
  }

  try {
    await tasksApi.updateSubtask(taskId, subtask.subtask_id, { completed: newStatus });
  } catch (err) {
    const rollbackList = (subtasks: Subtask[]) =>
      subtasks.map((s) =>
        s.subtask_id === subtask.subtask_id ? { ...s, completed: subtask.completed } : s
      );
    tasksSignal.value = tasksSignal.value.map((t) =>
      t.task_id === taskId ? { ...t, subtasks: rollbackList(t.subtasks || []) } : t
    );
    if (viewingTaskSignal.value?.task_id === taskId) {
      viewingTaskSignal.value = {
        ...viewingTaskSignal.value,
        subtasks: rollbackList(viewingTaskSignal.value.subtasks || []),
      };
    }
    showErrorToast(err, 'Failed to update subtask');
  }
}

export async function deleteSubtaskAction(taskId: TaskId, subtaskId: SubtaskId): Promise<void> {
  const previousViewing = viewingTaskSignal.value;
  const previousTasks = [...tasksSignal.value];

  const filterList = (subtasks: Subtask[]) => subtasks.filter((s) => s.subtask_id !== subtaskId);

  tasksSignal.value = tasksSignal.value.map((t) =>
    t.task_id === taskId ? { ...t, subtasks: filterList(t.subtasks || []) } : t
  );
  if (viewingTaskSignal.value?.task_id === taskId) {
    viewingTaskSignal.value = {
      ...viewingTaskSignal.value,
      subtasks: filterList(viewingTaskSignal.value.subtasks || []),
    };
  }

  try {
    await tasksApi.deleteSubtask(taskId, subtaskId);
    showToast('Subtask deleted', 'success');
  } catch (err) {
    tasksSignal.value = previousTasks;
    viewingTaskSignal.value = previousViewing;
    showErrorToast(err, 'Failed to delete subtask');
  }
}
