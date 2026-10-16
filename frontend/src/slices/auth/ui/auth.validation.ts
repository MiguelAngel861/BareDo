import { PasswordSchema, UsernameSchema } from '../auth.schemas.ts';

export function validateUsernameField(username: string): string | null {
  const res = UsernameSchema.safeParse(username);
  return res.success ? null : res.error.errors[0]?.message || 'Invalid username';
}

export function validatePasswordField(password: string): string | null {
  const res = PasswordSchema.safeParse(password);
  return res.success ? null : res.error.errors[0]?.message || 'Invalid password';
}
