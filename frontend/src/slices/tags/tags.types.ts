import type { z } from 'zod';
import type { TagCreateSchema, TagListResponseSchema, TagSchema } from './tags.schemas.ts';

export type Tag = z.infer<typeof TagSchema>;
export type TagCreate = z.infer<typeof TagCreateSchema>;
export type TagListResponse = z.infer<typeof TagListResponseSchema>;
