import type { z } from 'zod';
import type { PriorityListResponseSchema, PrioritySchema } from './priorities.schemas.ts';

export type Priority = z.infer<typeof PrioritySchema>;
export type PriorityListResponse = z.infer<typeof PriorityListResponseSchema>;
