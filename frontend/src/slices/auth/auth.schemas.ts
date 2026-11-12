import { z } from 'zod/mini';

export const UsernameSchema = z
  .string()
  .check(
    z.trim(),
    z.minLength(1, 'Username is required'),
    z.minLength(3, 'Username must be at least 3 characters'),
    z.maxLength(50, 'Username must be 50 characters or less')
  );

export const PasswordSchema = z.string().check(
  z.minLength(1, 'Password is required'),
  z.minLength(8, 'Password must be at least 8 characters'),
  z.maxLength(128, 'Password must be 128 characters or less')
);

export const UserSchema = z.object({
  user_id: z.union([z.string(), z.number()]),
  username: z.string(),
  created_at: z.optional(z.string()),
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
