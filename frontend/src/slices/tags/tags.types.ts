import type { z } from 'zod';
import type { TagListResponseSchema, TagSchema } from './tags.schemas.ts';

export type Tag = z.infer<typeof TagSchema>;
export type TagListResponse = z.infer<typeof TagListResponseSchema>;
