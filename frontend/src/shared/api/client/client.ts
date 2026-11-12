import ky from 'ky';
import {
  clear,
  getAccessToken,
  getRefreshToken,
  isAccessTokenExpired,
  setTokens,
} from '../auth/index.ts';
import type { ApiError } from '../errors/errors.ts';
import { type MappedError, mapBackendError } from '../errors/errors.ts';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '');

type TokenGetter = () => string | null;
type UnauthorizedHandler = () => void;
type TokenRefreshedHandler = (newToken: string) => void;
type ServerReadyHandler = () => void;

let customGetToken: TokenGetter | null = null;
let customOnUnauthorized: UnauthorizedHandler | null = null;
let customOnTokenRefreshed: TokenRefreshedHandler | null = null;
let customOnServerReady: ServerReadyHandler | null = null;

export function configureApiAuth(
  getter: TokenGetter,
  onUnauthorized: UnauthorizedHandler,
  onTokenRefreshed?: TokenRefreshedHandler,
  onServerReady?: ServerReadyHandler
): void {
  customGetToken = getter;
  customOnUnauthorized = onUnauthorized;
  customOnTokenRefreshed = onTokenRefreshed || null;
  customOnServerReady = onServerReady || null;
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

    const response = await apiClient.post('auth/refresh', {
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
  prefix: API_BASE_URL,
  timeout: 60000,
  retry: {
    limit: 3,
    methods: ['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'TRACE'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
    backoffLimit: 3000,
    retryOnTimeout: true,
  },
  hooks: {
    beforeRequest: [
      async ({ request }) => {
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
      async ({ request, response, retryCount }) => {
        if (response.ok && !hasNotifiedServerReady) {
          hasNotifiedServerReady = true;
          if (customOnServerReady) {
            customOnServerReady();
          }
        }

        // Handle 401 with token refresh (only on first attempt to avoid loops)
        if (response.status === 401 && retryCount === 0) {
          try {
            await refreshAccessToken();
            const newToken = customGetToken ? customGetToken() : getAccessToken();
            const headers = new Headers(request.headers);
            if (newToken) {
              headers.set('Authorization', `Bearer ${newToken}`);
            }

            // Reintenta la petición original con el token nuevo, sin hooks de auth para evitar loop
            const retryResponse = await ky(String(request.url), {
              method: request.method as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
              headers,
              timeout: 60000,
              retry: { limit: 0 },
              throwHttpErrors: false,
            });

            if (retryResponse.status === 401) {
              // Token aún inválido tras refresh: no buclear, notificar y normalizar error
              if (customOnUnauthorized) {
                customOnUnauthorized();
              } else {
                clear();
              }
              throw await createFriendlyError(retryResponse);
            }

            if (!retryResponse.ok) {
              throw await createFriendlyError(retryResponse);
            }

            return retryResponse;
          } catch {
            if (customOnUnauthorized) {
              customOnUnauthorized();
            } else {
              clear();
            }
            // Fall through to normalize the 401 into a friendly error
          }
        }

        // Normalize every non-ok response into a friendly, user-facing error so raw
        // HTTP statuses, internal error codes and database details never reach the UI.
        if (!response.ok) {
          throw await createFriendlyError(response);
        }

        return response;
      },
    ],
  },
});

async function createFriendlyError(response: Response): Promise<Error> {
  let mapped: MappedError | undefined;
  let code: string | undefined;
  try {
    // Backend error envelope is { code, message, status, details } directly
    // (some paths may nest it under { error: {...} }; accept both).
    const raw = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    const backendError = (raw.error ?? raw) as unknown as ApiError | undefined;
    if (backendError?.code) {
      code = backendError.code;
      mapped = mapBackendError(backendError);
    }
  } catch {
    // Non-JSON or empty error body: fall back to a generic friendly message.
  }

  const err = new Error(mapped?.message ?? 'An unexpected error occurred') as Error & {
    title: string;
    code: string;
    status: number;
    fieldErrors: Record<string, string> | null;
  };
  err.title = mapped?.title ?? 'Error';
  err.code = code ?? String(response.status);
  err.status = response.status;
  err.fieldErrors = mapped?.fieldErrors ?? null;
  return err;
}
