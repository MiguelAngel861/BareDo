import type { z } from 'zod';
import type {
  PaginationMetaSchema,
  SubtaskCreateSchema,
  SubtaskSchema,
  SubtaskUpdateSchema,
  TaskCreateSchema,
  TaskListParamsSchema,
  TaskListResponseSchema,
  TaskResponseSchema,
  TaskUpdateSchema,
} from './tasks.schemas.ts';

export type TaskCreate = z.infer<typeof TaskCreateSchema>;
export type TaskUpdate = z.infer<typeof TaskUpdateSchema>;
export type Task = z.infer<typeof TaskResponseSchema>;
export type Subtask = z.infer<typeof SubtaskSchema>;
export type SubtaskCreate = z.infer<typeof SubtaskCreateSchema>;
export type SubtaskUpdate = z.infer<typeof SubtaskUpdateSchema>;
export type TaskListParams = z.infer<typeof TaskListParamsSchema>;
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;
export type TaskListResponse = z.infer<typeof TaskListResponseSchema>;
export type TaskId = string | number;
export type SubtaskId = string | number;
