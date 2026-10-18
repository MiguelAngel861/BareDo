import ky from 'ky';
import {
  clear,
  getAccessToken,
  getRefreshToken,
  isAccessTokenExpired,
  setTokens,
} from '../auth/index.ts';

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
          if (customOnServerReady) {
            customOnServerReady();
          }
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
          }
          return response;
        }
      },
    ],
  },
});
