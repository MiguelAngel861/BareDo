import { kyInstance, validatedRequest } from '@/shared/api/client.ts';
import { AuthResponseSchema, MeResponseSchema } from './schemas.ts';

export const authApi = {
  register: (username: string, password: string) =>
    validatedRequest(
      () => kyInstance.post('auth/register', { json: { username, password } }).json<unknown>(),
      AuthResponseSchema
    ),

  login: (username: string, password: string) =>
    validatedRequest(
      () => kyInstance.post('auth/login', { json: { username, password } }).json<unknown>(),
      AuthResponseSchema
    ),

  refresh: () =>
    validatedRequest(() => kyInstance.post('auth/refresh').json<unknown>(), AuthResponseSchema),

  me: () => validatedRequest(() => kyInstance.get('auth/me').json<unknown>(), MeResponseSchema),
};
