import { apiClient } from '@/shared/api/client/index.ts';
import type {
  Subtask,
  SubtaskCreate,
  SubtaskId,
  SubtaskUpdate,
  Task,
  TaskCreate,
  TaskId,
  TaskListParams,
  TaskListResponse,
  TaskUpdate,
} from './tasks.types.ts';

function toSearchParams(params: TaskListParams): URLSearchParams {
  const result = new URLSearchParams();
  if (params.page !== undefined) {
    result.set('page', String(params.page));
  }
  if (params.per_page !== undefined) {
    result.set('per_page', String(params.per_page));
  }
  if (params.title) {
    result.set('title', params.title);
  }
  if (params.completed !== undefined) {
    result.set('completed', String(params.completed));
  }
  if (params.priority_id !== undefined) {
    result.set('priority_id', String(params.priority_id));
  }
  if (params.sort) {
    result.set('sort', params.sort);
  }
  // Formato lista: un param por ID (?tag_ids=5&tag_ids=7)
  for (const id of params.tag_ids ?? []) {
    result.append('tag_ids', String(id));
  }
  return result;
}

const DEFAULT_PARAMS: TaskListParams = { page: 1, per_page: 5 };

export const tasksApi = {
  list: (params: Partial<TaskListParams> = {}): Promise<TaskListResponse> => {
    const merged: TaskListParams = {
      page: params.page ?? DEFAULT_PARAMS.page,
      per_page: params.per_page ?? DEFAULT_PARAMS.per_page,
      title: params.title,
      completed: params.completed,
      priority_id: params.priority_id,
      sort: params.sort,
      tag_ids: params.tag_ids,
    };
    const searchParams = toSearchParams(merged);
    return apiClient.get('tasks', { searchParams }).json<TaskListResponse>();
  },

  get: (taskId: TaskId): Promise<Task> => apiClient.get(`tasks/${taskId}`).json<Task>(),

  create: (data: TaskCreate): Promise<Task> => apiClient.post('tasks', { json: data }).json<Task>(),

  update: (taskId: TaskId, data: TaskUpdate): Promise<Task> =>
    apiClient.put(`tasks/${taskId}`, { json: data }).json<Task>(),

  patch: (taskId: TaskId, data: Partial<TaskUpdate>): Promise<Task> =>
    apiClient.patch(`tasks/${taskId}`, { json: data }).json<Task>(),

  delete: (taskId: TaskId) => apiClient.delete(`tasks/${taskId}`),

  listTrash: (
    params: { page?: number; per_page?: number; sort?: string } = {}
  ): Promise<TaskListResponse> => {
    const searchParams: Record<string, string> = {};
    if (params.page !== undefined) {
      searchParams.page = String(params.page);
    }
    if (params.per_page !== undefined) {
      searchParams.per_page = String(params.per_page);
    }
    if (params.sort) {
      searchParams.sort = params.sort;
    }
    return apiClient.get('tasks/trash', { searchParams }).json<TaskListResponse>();
  },

  getTrashCount: (): Promise<{ count: number }> =>
    apiClient.get('tasks/trash/count').json<{ count: number }>(),

  restore: (taskId: TaskId): Promise<Task> =>
    apiClient.post(`tasks/${taskId}/restore`).json<Task>(),

  permanentDelete: (taskId: TaskId) => apiClient.delete(`tasks/${taskId}/permanent`),

  emptyTrash: () => apiClient.delete('tasks/trash'),

  listSubtasks: (taskId: TaskId): Promise<{ subtasks: Subtask[] }> =>
    apiClient.get(`tasks/${taskId}/subtasks`).json<{ subtasks: Subtask[] }>(),

  createSubtask: (taskId: TaskId, data: SubtaskCreate): Promise<Subtask> =>
    apiClient.post(`tasks/${taskId}/subtasks`, { json: data }).json<Subtask>(),

  updateSubtask: (taskId: TaskId, subtaskId: SubtaskId, data: SubtaskUpdate): Promise<Subtask> =>
    apiClient.patch(`tasks/${taskId}/subtasks/${subtaskId}`, { json: data }).json<Subtask>(),

  deleteSubtask: (taskId: TaskId, subtaskId: SubtaskId) =>
    apiClient.delete(`tasks/${taskId}/subtasks/${subtaskId}`),
};
