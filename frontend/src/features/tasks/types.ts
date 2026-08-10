import type { z } from 'zod';
import type {
  DeleteResponseSchema,
  PaginationMetaSchema,
  TaskCreateSchema,
  TaskListParamsSchema,
  TaskListResponseSchema,
  TaskResponseSchema,
  TaskUpdateSchema,
} from './schemas.ts';

export type TaskCreate = z.infer<typeof TaskCreateSchema>;
export type TaskUpdate = z.infer<typeof TaskUpdateSchema>;
export type Task = z.infer<typeof TaskResponseSchema>;
export type TaskListParams = z.infer<typeof TaskListParamsSchema>;
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;
export type TaskListResponse = z.infer<typeof TaskListResponseSchema>;
export type DeleteResponse = z.infer<typeof DeleteResponseSchema>;
