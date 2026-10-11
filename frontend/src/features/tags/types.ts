import type { z } from 'zod';
import type {
  TagCreateSchema,
  TagDeleteResponseSchema,
  TagListResponseSchema,
  TagSchema,
} from './schemas.ts';

export type Tag = z.infer<typeof TagSchema>;
export type TagCreate = z.infer<typeof TagCreateSchema>;
export type TagListResponse = z.infer<typeof TagListResponseSchema>;
export type TagDeleteResponse = z.infer<typeof TagDeleteResponseSchema>;
