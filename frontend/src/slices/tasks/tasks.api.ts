import { apiClient, validatedRequest } from '@/shared/api/client/index.ts';
import {
  SubtaskListResponseSchema,
  SubtaskSchema,
  TaskListResponseSchema,
  TaskResponseSchema,
  TrashCountResponseSchema,
} from './tasks.schemas.ts';
import type {
  Subtask,
  SubtaskCreate,
  SubtaskUpdate,
  Task,
  TaskCreate,
  TaskListParams,
  TaskListResponse,
  TaskUpdate,
} from './tasks.types.ts';

interface SearchParams {
  page?: string;
  per_page?: string;
  title?: string;
  completed?: string;
  priority_id?: string;
  sort?: string;
  tag_ids?: string;
  [key: string]: string | undefined;
}

function toSearchParams(params: TaskListParams): SearchParams {
  const result: SearchParams = {};
  if (params.page !== undefined) {
    result.page = String(params.page);
  }
  if (params.per_page !== undefined) {
    result.per_page = String(params.per_page);
  }
  if (params.title) {
    result.title = params.title;
  }
  if (params.completed !== undefined) {
    result.completed = String(params.completed);
  }
  if (params.priority_id !== undefined) {
    result.priority_id = String(params.priority_id);
  }
  if (params.sort) {
    result.sort = params.sort;
  }
  if (params.tag_ids !== undefined) {
    if (Array.isArray(params.tag_ids)) {
      result.tag_ids = params.tag_ids.join(',');
    } else {
      result.tag_ids = params.tag_ids;
    }
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
    return validatedRequest(
      () => apiClient.get('tasks', { searchParams }).json<unknown>(),
      TaskListResponseSchema
    );
  },

  get: (taskId: string): Promise<Task> =>
    validatedRequest(() => apiClient.get(`tasks/${taskId}`).json<unknown>(), TaskResponseSchema),

  create: (data: TaskCreate): Promise<Task> =>
    validatedRequest(
      () => apiClient.post('tasks', { json: data }).json<unknown>(),
      TaskResponseSchema
    ),

  update: (taskId: string, data: TaskUpdate): Promise<Task> =>
    validatedRequest(
      () => apiClient.put(`tasks/${taskId}`, { json: data }).json<unknown>(),
      TaskResponseSchema
    ),

  patch: (taskId: string, data: Partial<TaskUpdate>): Promise<Task> =>
    validatedRequest(
      () => apiClient.patch(`tasks/${taskId}`, { json: data }).json<unknown>(),
      TaskResponseSchema
    ),

  delete: (taskId: string) => apiClient.delete(`tasks/${taskId}`),

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
    return validatedRequest(
      () => apiClient.get('tasks/trash', { searchParams }).json<unknown>(),
      TaskListResponseSchema
    );
  },

  getTrashCount: (): Promise<{ count: number }> =>
    validatedRequest(
      () => apiClient.get('tasks/trash/count').json<unknown>(),
      TrashCountResponseSchema
    ),

  restore: (taskId: string): Promise<Task> =>
    validatedRequest(
      () => apiClient.post(`tasks/${taskId}/restore`).json<unknown>(),
      TaskResponseSchema
    ),

  permanentDelete: (taskId: string) => apiClient.delete(`tasks/${taskId}/permanent`),

  emptyTrash: () => apiClient.delete('tasks/trash'),

  listSubtasks: (taskId: string): Promise<{ subtasks: Subtask[] }> =>
    validatedRequest(
      () => apiClient.get(`tasks/${taskId}/subtasks`).json<unknown>(),
      SubtaskListResponseSchema
    ),

  createSubtask: (taskId: string, data: SubtaskCreate): Promise<Subtask> =>
    validatedRequest(
      () => apiClient.post(`tasks/${taskId}/subtasks`, { json: data }).json<unknown>(),
      SubtaskSchema
    ),

  updateSubtask: (taskId: string, subtaskId: string, data: SubtaskUpdate): Promise<Subtask> =>
    validatedRequest(
      () =>
        apiClient.patch(`tasks/${taskId}/subtasks/${subtaskId}`, { json: data }).json<unknown>(),
      SubtaskSchema
    ),

  deleteSubtask: (taskId: string, subtaskId: string) =>
    apiClient.delete(`tasks/${taskId}/subtasks/${subtaskId}`),
};
