import { z } from 'zod';

export const UsernameSchema = z
  .string()
  .trim()
  .min(1, 'Username is required')
  .min(3, 'Username must be at least 3 characters')
  .max(50, 'Username must be 50 characters or less');

export const PasswordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be 128 characters or less');

export const UserSchema = z.object({
  user_id: z.union([z.string(), z.number()]),
  username: z.string(),
  created_at: z.string().optional(),
});

export const AuthResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  user: UserSchema,
});

export const RefreshResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
});

export const MeResponseSchema = UserSchema;
