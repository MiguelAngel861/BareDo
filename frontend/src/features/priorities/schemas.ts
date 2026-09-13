import { z } from 'zod';

export const PrioritySchema = z.object({
  priority_id: z.number().int().positive(),
  name: z.string(),
  level: z.number().int().positive(),
  description: z.string().nullable(),
});

export const PriorityListResponseSchema = z.object({
  priorities: z.array(PrioritySchema),
});
