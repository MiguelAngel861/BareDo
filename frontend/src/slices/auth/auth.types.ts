import type { z } from 'zod';
import type {
  AuthResponseSchema,
  MeResponseSchema,
  RefreshResponseSchema,
  UserSchema,
} from './auth.schemas.ts';

export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type RefreshResponse = z.infer<typeof RefreshResponseSchema>;
export type User = z.infer<typeof UserSchema>;
export type MeResponse = z.infer<typeof MeResponseSchema>;
