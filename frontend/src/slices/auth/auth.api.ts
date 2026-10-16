import { apiClient } from '@/shared/api/client/index.ts';
import type { AuthResponse, MeResponse, RefreshResponse } from './auth.types.ts';

export const authApi = {
  register: (username: string, password: string): Promise<AuthResponse> =>
    apiClient.post('auth/register', { json: { username, password } }).json<AuthResponse>(),

  login: (username: string, password: string): Promise<AuthResponse> =>
    apiClient.post('auth/login', { json: { username, password } }).json<AuthResponse>(),

  refresh: (refreshToken?: string): Promise<RefreshResponse> =>
    apiClient
      .post(
        'auth/refresh',
        refreshToken ? { headers: { Authorization: `Bearer ${refreshToken}` } } : {}
      )
      .json<RefreshResponse>(),

  me: (): Promise<MeResponse> => apiClient.get('auth/me').json<MeResponse>(),
};
