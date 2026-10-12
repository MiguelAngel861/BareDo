import { apiClient, validatedRequest } from '@/shared/api/client/index.ts';
import { AuthResponseSchema, MeResponseSchema, RefreshResponseSchema } from './auth.schemas.ts';
import type { AuthResponse, MeResponse, RefreshResponse } from './auth.types.ts';

export const authApi = {
  register: (username: string, password: string): Promise<AuthResponse> => {
    return validatedRequest(
      () => apiClient.post('auth/register', { json: { username, password } }).json<unknown>(),
      AuthResponseSchema
    );
  },

  login: (username: string, password: string): Promise<AuthResponse> => {
    return validatedRequest(
      () => apiClient.post('auth/login', { json: { username, password } }).json<unknown>(),
      AuthResponseSchema
    );
  },

  refresh: (refreshToken?: string): Promise<RefreshResponse> =>
    validatedRequest(
      () =>
        apiClient
          .post(
            'auth/refresh',
            refreshToken ? { headers: { Authorization: `Bearer ${refreshToken}` } } : {}
          )
          .json<unknown>(),
      RefreshResponseSchema
    ),

  me: (): Promise<MeResponse> =>
    validatedRequest(() => apiClient.get('auth/me').json<unknown>(), MeResponseSchema),
};
