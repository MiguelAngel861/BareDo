import { z } from 'zod';

export const TaskCreateSchema = z.object({
  title: z.string().min(1).max(40),
  description: z.string().max(200).nullable().optional(),
  due_date: z.string().date().nullable().optional(),
  completed: z.boolean().default(false),
});

export const TaskUpdateSchema = z.object({
  title: z.string().min(1).max(40).optional(),
  description: z.string().max(200).nullable().optional(),
  priority: z.number().int().positive().optional(),
  due_date: z.string().date().nullable().optional(),
  completed: z.boolean().optional(),
});

export const TaskResponseSchema = z.object({
  task_id: z.coerce.string(),
  title: z.string(),
  description: z.string().nullable(),
  priority: z.number().int().positive(),
  due_date: z.string().nullable(),
  completed: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const TaskListParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  per_page: z.number().int().positive().max(100).default(5),
  title: z.string().optional(),
  completed: z.boolean().optional(),
});

export const PaginationMetaSchema = z.object({
  page: z.number().int().positive(),
  per_page: z.number().int().positive(),
  total_pages: z.number().int().nonnegative(),
  total_items: z.number().int().nonnegative(),
  has_prev: z.boolean(),
  has_next: z.boolean(),
});

export const TaskListResponseSchema = z.object({
  tasks: z.array(TaskResponseSchema),
  meta: PaginationMetaSchema,
});

export const DeleteResponseSchema = z.object({
  message: z.string(),
});
