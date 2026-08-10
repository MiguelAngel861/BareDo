import ky from 'ky';
import type { ZodSchema } from 'zod';
import { ApiErrorClass } from './errors.ts';

let refreshPromise: Promise<void> | null = null;

async function refreshAccessToken(): Promise<void> {
  if (refreshPromise) {
    console.log('[auth] reusing existing refresh promise');
    return refreshPromise;
  }

  console.log('[auth] starting token refresh');
  refreshPromise = (async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    const response = await ky.post('auth/refresh', {
      prefixUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    const data = await response.json<{
      access_token: string;
      refresh_token: string;
    }>();

    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    console.log('[auth] token refresh successful');
  })();

  try {
    await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export const kyInstance = ky.create({
  prefixUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  retry: {
    limit: 1,
    statusCodes: [401],
  },
  hooks: {
    beforeRequest: [
      async (request) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
        console.log(`[api] ${request.method} ${request.url}`);
      },
    ],
    afterResponse: [
      async (request, _options, response, state) => {
        console.log(`[api] ${response.status} ${request.url} (retry: ${state.retryCount})`);

        if (response.status !== 401 || state.retryCount > 0) {
          return response;
        }

        console.log('[api] 401 detected, attempting token refresh');
        try {
          await refreshAccessToken();
          const newToken = localStorage.getItem('access_token');
          const headers = new Headers(request.headers);
          headers.set('Authorization', `Bearer ${newToken}`);

          return ky.retry({
            request: new Request(request, { headers }),
            code: 'TOKEN_REFRESHED',
          });
        } catch (error) {
          console.error('[auth] refresh failed:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/pages/login.html';
          return response;
        }
      },
    ],
  },
});

export async function validatedRequest<T>(
  requestFn: () => Promise<unknown>,
  schema: ZodSchema<T>
): Promise<T> {
  const data = await requestFn();
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      console.error('[api] response validation failed:', error.message);
      throw new ApiErrorClass({
        code: 'VALIDATION_ERROR',
        message: `Response validation failed: ${error.message}`,
        status: 200,
        details: error,
      });
    }
    throw error;
  }
}
