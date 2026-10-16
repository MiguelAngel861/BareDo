import { z } from 'zod';

export const TagSchema = z.object({
  tag_id: z.number().int(),
  name: z.string(),
});

export const TagListResponseSchema = z.object({
  tags: z.array(TagSchema),
});
