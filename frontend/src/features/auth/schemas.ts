import { z } from 'zod';

export const LoginRequestSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8).max(128),
});

export const RegisterRequestSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8).max(128),
});

export const AuthResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  user: z.object({
    user_id: z.coerce.string(),
    username: z.string(),
  }),
});

export const RefreshResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
});

export const UserSchema = z.object({
  user_id: z.coerce.string(),
  username: z.string(),
});

export const MeResponseSchema = z.object({
  user: UserSchema,
});
