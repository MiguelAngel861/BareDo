import { TagSchema } from '@/slices/tags/tags.schemas.ts';
import { z } from 'zod';

export const SubtaskSchema = z.object({
  subtask_id: z.union([z.string(), z.number()]),
  task_id: z.union([z.string(), z.number()]),
  title: z.string(),
  completed: z.boolean(),
  created_at: z.string(),
});

export const SubtaskCreateSchema = z.object({
  title: z.string().min(1).max(120),
  completed: z.boolean().default(false),
});

export const SubtaskUpdateSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  completed: z.boolean().optional(),
});

export const SubtaskListResponseSchema = z.object({
  subtasks: z.array(SubtaskSchema),
});

export const TaskCreateSchema = z.object({
  title: z.string().min(5).max(40),
  description: z.string().max(500).default(''),
  priority_id: z.number().int().positive().default(3),
  due_date: z.string().optional(),
  completed: z.boolean().default(false),
  tag_ids: z.array(z.number().int()).max(7).optional(),
  subtasks: z.array(SubtaskCreateSchema).optional(),
});

export const TaskUpdateSchema = z.object({
  title: z.string().min(5).max(40).optional(),
  description: z.string().max(500).optional(),
  priority_id: z.number().int().positive().optional(),
  due_date: z.string().optional(),
  completed: z.boolean().optional(),
  tag_ids: z.array(z.number().int()).max(7).optional(),
});

export const TaskResponseSchema = z.object({
  task_id: z.union([z.string(), z.number()]),
  title: z.string(),
  description: z.string().nullable(),
  priority_id: z.number().int().positive(),
  due_date: z.string().nullable(),
  completed: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable().optional(),
  tags: z.array(TagSchema).default([]),
  subtasks: z.array(SubtaskSchema).default([]),
});

export const TrashCountResponseSchema = z.object({
  count: z.number().int().nonnegative(),
});

export const TaskListParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  per_page: z.number().int().positive().max(100).default(5),
  title: z.string().optional(),
  completed: z.boolean().optional(),
  priority_id: z.number().int().positive().optional(),
  sort: z.string().optional(),
  tag_ids: z.union([z.string(), z.array(z.number().int())]).optional(),
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
