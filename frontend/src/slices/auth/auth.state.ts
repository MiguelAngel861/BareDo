import { clear, getAccessToken, hasToken, setTokens } from '@/shared/api/auth/index.ts';
import { configureApiAuth } from '@/shared/api/client/index.ts';
import { signal } from '@preact/signals';
import { authApi } from './auth.api.ts';
import type { User } from './auth.types.ts';

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialToken = getAccessToken();

export const authSignal = signal<AuthState>({
  token: initialToken,
  user: null,
  isAuthenticated: hasToken(),
  isLoading: hasToken(), // Si tiene token, carga su perfil de usuario
});

export function logout(): void {
  clear();
  authSignal.value = {
    token: null,
    user: null,
    isAuthenticated: false,
    isLoading: false,
  };
}

// Conectar el cliente HTTP Ky con el estado reactivo sin dependencias circulares
configureApiAuth(
  () => authSignal.value.token,
  () => logout(),
  (newToken) => {
    authSignal.value = {
      ...authSignal.value,
      token: newToken,
      isAuthenticated: true,
    };
  }
);

let hasServerReadyListener = false;

export async function initAuth(): Promise<void> {
  if (!authSignal.value.token) {
    authSignal.value = { ...authSignal.value, isLoading: false };
    return;
  }

  if (!hasServerReadyListener && typeof window !== 'undefined') {
    hasServerReadyListener = true;
    window.addEventListener('server-ready', () => {
      if (authSignal.value.token && !authSignal.value.user) {
        initAuth();
      }
    });
  }

  try {
    const user = await authApi.me();
    authSignal.value = {
      ...authSignal.value,
      user,
      isAuthenticated: true,
      isLoading: false,
    };
  } catch (err: unknown) {
    // Solo cerrar sesión si el servidor respondió explícitamente con 401 Unauthorized
    // Si el servidor está apagado, iniciando (cold start), 502/503 o hay error de red, NO borrar sesión
    if (err && typeof err === 'object' && 'response' in err) {
      const response = (err as { response?: Response }).response;
      if (response && response.status === 401) {
        logout();
        return;
      }
    }
    // El servidor puede estar en cold start; conservar el token y mantener isLoading: false
    authSignal.value = {
      ...authSignal.value,
      isLoading: false,
    };
  }
}

export async function login(username: string, password: string): Promise<void> {
  const response = await authApi.login(username, password);
  setTokens(response);
  authSignal.value = {
    token: response.access_token,
    user: response.user,
    isAuthenticated: true,
    isLoading: false,
  };
}

export async function register(username: string, password: string): Promise<void> {
  const response = await authApi.register(username, password);
  setTokens(response);
  authSignal.value = {
    token: response.access_token,
    user: response.user,
    isAuthenticated: true,
    isLoading: false,
  };
}
