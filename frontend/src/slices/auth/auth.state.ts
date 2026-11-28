import { signal } from '@preact/signals';
import { clear, getAccessToken, hasToken, setTokens } from '@/shared/api/auth/index.ts';
import { configureApiAuth } from '@/shared/api/client/index.ts';
import { showToast } from '@/shared/ui/Toast/toast.state.ts';
import { tagsSignal } from '@/slices/tags/tags.state.ts';
import {
  filtersSignal,
  paginationSignal,
  tasksSignal,
  trashCountSignal,
  trashTasksSignal,
} from '@/slices/tasks/tasks.state.ts';
import { authApi } from './auth.api.ts';
import type { User } from './auth.types.ts';

const DEFAULT_FILTERS = {
  page: 1,
  per_page: 5,
  title: '',
  completed: undefined,
  priority_id: undefined,
  tag_ids: undefined,
};
const DEFAULT_PAGINATION = {
  page: 1,
  per_page: 5,
  total_pages: 1,
  total_items: 0,
  has_prev: false,
  has_next: false,
};

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
  // Resetear estado de dominio para evitar fugas de datos entre usuarios tras logout
  tasksSignal.value = [];
  trashTasksSignal.value = [];
  trashCountSignal.value = 0;
  filtersSignal.value = DEFAULT_FILTERS;
  paginationSignal.value = DEFAULT_PAGINATION;
  tagsSignal.value = [];
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
  },
  () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('server-ready'));
    }
  }
);

let hasServerReadyListener = false;
let initAuthInFlight = false;

export async function initAuth(retries = 10, delayMs = 1000): Promise<void> {
  if (!authSignal.value.token) {
    authSignal.value = { ...authSignal.value, isLoading: false };
    return;
  }

  if (initAuthInFlight) {
    return;
  }

  if (!hasServerReadyListener && typeof window !== 'undefined') {
    hasServerReadyListener = true;
    window.addEventListener('server-ready', () => {
      if (authSignal.value.token && !authSignal.value.user && !initAuthInFlight) {
        initAuth();
      }
    });
  }

  initAuthInFlight = true;
  try {
    for (let i = 0; i < retries; i++) {
      try {
        const user = await authApi.me();
        authSignal.value = {
          ...authSignal.value,
          user,
          isAuthenticated: true,
          isLoading: false,
        };
        return;
      } catch (err: unknown) {
        // Solo cerrar sesión si el servidor respondió explícitamente con 401 Unauthorized.
        // client.ts normaliza respuestas HTTP a FriendlyError ({ status: 401 }) sin .response.
        if (err && typeof err === 'object') {
          const status =
            'status' in err
              ? (err as { status?: number }).status
              : 'response' in err
                ? (err as { response?: Response }).response?.status
                : undefined;
          if (status === 401) {
            logout();
            return;
          }
        }
        // Error de red o transitorio: reintentar con backoff acotado
        if (i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    // Tras agotar los reintentos, parar la carga para no quedar en infinito.
    // La sesión se conserva en localStorage; el usuario puede recargar de nuevo.
    authSignal.value = {
      ...authSignal.value,
      isLoading: false,
    };
    showToast('Could not load your session. Reload the page to try again.', 'warning');
  } finally {
    initAuthInFlight = false;
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
