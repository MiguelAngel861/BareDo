import type { z } from 'zod';
import type {
  AuthResponseSchema,
  LoginRequestSchema,
  MeResponseSchema,
  RefreshResponseSchema,
  RegisterRequestSchema,
  UserSchema,
} from './schemas.ts';

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type RefreshResponse = z.infer<typeof RefreshResponseSchema>;
export type User = z.infer<typeof UserSchema>;
export type MeResponse = z.infer<typeof MeResponseSchema>;
