import { kyInstance, validatedRequest } from '@/shared/api/client.ts';
import {
  AuthResponseSchema,
  LoginRequestSchema,
  MeResponseSchema,
  RefreshResponseSchema,
  RegisterRequestSchema,
} from './schemas.ts';

export const authApi = {
  register: (username: string, password: string) => {
    const payload = RegisterRequestSchema.parse({ username, password });
    return validatedRequest(
      () => kyInstance.post('auth/register', { json: payload }).json<unknown>(),
      AuthResponseSchema
    );
  },

  login: (username: string, password: string) => {
    const payload = LoginRequestSchema.parse({ username, password });
    return validatedRequest(
      () => kyInstance.post('auth/login', { json: payload }).json<unknown>(),
      AuthResponseSchema
    );
  },

  refresh: (refreshToken?: string) =>
    validatedRequest(
      () =>
        kyInstance
          .post(
            'auth/refresh',
            refreshToken ? { headers: { Authorization: `Bearer ${refreshToken}` } } : {}
          )
          .json<unknown>(),
      RefreshResponseSchema
    ),

  me: () => validatedRequest(() => kyInstance.get('auth/me').json<unknown>(), MeResponseSchema),
};
