import { PasswordSchema, UsernameSchema } from '../auth.schemas.ts';

// Misma regla de complejidad que el backend (auth_schemas.py), para rechazar
// una contraseña débil en el cliente en lugar de hacer un viaje redondo a un 422.
const PASSWORD_COMPLEXITY_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,128}$/;

export function validateUsernameField(username: string): string | null {
  const res = UsernameSchema.safeParse(username);
  return res.success ? null : res.error.issues[0]?.message || 'Invalid username';
}

export function validatePasswordField(password: string): string | null {
  const res = PasswordSchema.safeParse(password);
  if (!res.success) {
    return res.error.issues[0]?.message || 'Invalid password';
  }
  if (!PASSWORD_COMPLEXITY_RE.test(password)) {
    return 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)';
  }
  return null;
}
