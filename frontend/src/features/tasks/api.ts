import { kyInstance, validatedRequest } from '@/shared/api/client.ts';
import { DeleteResponseSchema, TaskListResponseSchema, TaskResponseSchema } from './schemas.ts';
import type { TaskCreate, TaskListParams, TaskUpdate } from './types.ts';

interface SearchParams {
  page?: string;
  per_page?: string;
  title?: string;
  completed?: string;
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
  return result;
}

const DEFAULT_PARAMS: TaskListParams = { page: 1, per_page: 5 };

function mergeParams(params: Partial<TaskListParams>): TaskListParams {
  return {
    page: params.page ?? DEFAULT_PARAMS.page,
    per_page: params.per_page ?? DEFAULT_PARAMS.per_page,
    title: params.title,
    completed: params.completed,
  };
}

export const tasksApi = {
  list: (params: Partial<TaskListParams> = {}) =>
    validatedRequest(
      () =>
        kyInstance
          .get('tasks', { searchParams: toSearchParams(mergeParams(params)) })
          .json<unknown>(),
      TaskListResponseSchema
    ),

  get: (id: string) =>
    validatedRequest(() => kyInstance.get(`tasks/${id}`).json<unknown>(), TaskResponseSchema),

  create: (data: TaskCreate) =>
    validatedRequest(
      () => kyInstance.post('tasks', { json: data }).json<unknown>(),
      TaskResponseSchema
    ),

  update: (id: string, data: TaskUpdate) =>
    validatedRequest(
      () => kyInstance.put(`tasks/${id}`, { json: data }).json<unknown>(),
      TaskResponseSchema
    ),

  patch: (id: string, data: TaskUpdate) =>
    validatedRequest(
      () => kyInstance.patch(`tasks/${id}`, { json: data }).json<unknown>(),
      TaskResponseSchema
    ),

  delete: (id: string) =>
    validatedRequest(() => kyInstance.delete(`tasks/${id}`).json<unknown>(), DeleteResponseSchema),

  toggle: (id: string, completed: boolean) =>
    validatedRequest(
      () => kyInstance.patch(`tasks/${id}`, { json: { completed } }).json<unknown>(),
      TaskResponseSchema
    ),
};
