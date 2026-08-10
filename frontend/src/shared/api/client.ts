import ky from 'ky';
import type { ZodSchema } from 'zod';
import { ApiErrorClass } from './errors.ts';

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
        if (response.status === 401) {
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const refreshResponse = await kyInstance.post('auth/refresh', {
                headers: {
                  Authorization: `Bearer ${refreshToken}`,
                  'Content-Type': 'application/json',
                },
              });
              const data = await refreshResponse.json<{
                access_token: string;
                refresh_token: string;
              }>();
              localStorage.setItem('access_token', data.access_token);
              localStorage.setItem('refresh_token', data.refresh_token);
              return kyInstance(_request);
            } catch {
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              window.location.href = '/pages/login.html';
            }
          } else {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/pages/login.html';
          }
        }
        return response;
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
