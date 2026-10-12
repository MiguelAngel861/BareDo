import { z } from 'zod';

export const TagSchema = z.object({
  tag_id: z.number().int(),
  name: z.string(),
});

export const TagCreateSchema = z.object({
  name: z.string().min(1).max(30).trim().toLowerCase(),
});

export const TagListResponseSchema = z.object({
  tags: z.array(TagSchema),
});
