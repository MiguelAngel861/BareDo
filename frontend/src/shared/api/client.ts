import ky from 'ky';
import type { ZodSchema } from 'zod';
import { ApiErrorClass } from './errors.ts';

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
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

  return data.access_token;
}

export const kyInstance = ky.create({
  prefixUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  hooks: {
    beforeRequest: [
      async (request) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        if (response.status !== 401) {
          return response;
        }

        // Don't try to refresh if this IS the refresh endpoint
        if (_request.url.includes('auth/refresh')) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/pages/login.html';
          return response;
        }

        // Start refresh if not already in progress
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = refreshAccessToken().finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
        }

        try {
          await refreshPromise;
          // Retry the original request with the new token
          const newToken = localStorage.getItem('access_token');
          const retryRequest = new Request(_request.url, {
            method: _request.method,
            headers: {
              ...Object.fromEntries(_request.headers.entries()),
              Authorization: `Bearer ${newToken}`,
            },
            body:
              _request.method !== 'GET' && _request.method !== 'HEAD'
                ? (_request.body ?? null)
                : null,
          });
          return fetch(retryRequest);
        } catch {
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
