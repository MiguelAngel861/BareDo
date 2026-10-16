import ky from 'ky';
import type { ZodType } from 'zod';
import {
  clear,
  getAccessToken,
  getRefreshToken,
  isAccessTokenExpired,
  setTokens,
} from '../auth/index.ts';
import { ApiErrorClass } from '../errors/index.ts';

type TokenGetter = () => string | null;
type UnauthorizedHandler = () => void;
type TokenRefreshedHandler = (newToken: string) => void;

let customGetToken: TokenGetter | null = null;
let customOnUnauthorized: UnauthorizedHandler | null = null;
let customOnTokenRefreshed: TokenRefreshedHandler | null = null;

export function configureApiAuth(
  getter: TokenGetter,
  onUnauthorized: UnauthorizedHandler,
  onTokenRefreshed?: TokenRefreshedHandler
): void {
  customGetToken = getter;
  customOnUnauthorized = onUnauthorized;
  customOnTokenRefreshed = onTokenRefreshed || null;
}

let refreshPromise: Promise<void> | null = null;

async function refreshAccessToken(): Promise<void> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
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

    setTokens(data);
    if (customOnTokenRefreshed) {
      customOnTokenRefreshed(data.access_token);
    }
  })();

  try {
    await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

let hasNotifiedServerReady = false;

export const apiClient = ky.create({
  prefixUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 60000,
  retry: {
    limit: 1,
    statusCodes: [401],
  },
  hooks: {
    beforeRequest: [
      async (request) => {
        if (isAccessTokenExpired()) {
          try {
            await refreshAccessToken();
          } catch {
            // Continúa para manejar el 401 en afterResponse
          }
        }

        const token = customGetToken ? customGetToken() : getAccessToken();
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (request, _options, response, state) => {
        if (response.ok && !hasNotifiedServerReady) {
          hasNotifiedServerReady = true;
          window.dispatchEvent(new CustomEvent('server-ready'));
        }

        if (response.status !== 401 || state.retryCount > 0) {
          return response;
        }

        try {
          await refreshAccessToken();
          const newToken = customGetToken ? customGetToken() : getAccessToken();
          const headers = new Headers(request.headers);
          if (newToken) {
            headers.set('Authorization', `Bearer ${newToken}`);
          }

          return ky.retry({
            request: new Request(request, { headers }),
            code: 'TOKEN_REFRESHED',
          });
        } catch {
          if (customOnUnauthorized) {
            customOnUnauthorized();
          } else {
            clear();
            window.location.href = '/login';
          }
          return response;
        }
      },
    ],
  },
});

export async function validatedRequest<T>(
  requestFn: () => Promise<unknown>,
  // biome-ignore lint/suspicious/noExplicitAny: Decouple Output from Input
  schema: ZodType<T, any, any>
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
