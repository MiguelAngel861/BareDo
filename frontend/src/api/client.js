type RequestInit = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
};

type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  refreshToken?: string;
};

type ApiError = {
  code: string;
  message: string;
  status: number;
  details?: unknown;
};

type ApiResponse = T extends void ? void ;

const API_BASE = (typeof window !== 'undefined' && window.__API_BASE_URL__) || import.meta.env.VITE_API_BASE || '/api/v1';
const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

let refreshPromise: Promise<boolean> | null = null;

function getAuthHeaders(refresh = false): Record<string, string> {
  const key = refresh ? REFRESH_KEY : ACCESS_KEY;
  const token = localStorage.getItem(key);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: getAuthHeaders(true),
      });
      if (!res.ok) throw new Error('refresh failed');
      const { access_token, refresh_token } = await res.json();
      localStorage.setItem(ACCESS_KEY, access_token);
      localStorage.setItem(REFRESH_KEY, refresh_token);
      return true;
    } catch {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
      window.location.href = '/pages/login.html';
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function request(endpoint: string, options: FetchOptions = {}): Promise {
  const { method = 'GET', body, auth = true, refreshToken = false } = options;

  const headers = refreshToken
    ? getAuthHeaders(true)
    : auth
      ? getAuthHeaders()
      : { 'Content-Type': 'application/json' };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (auth && res.status === 401 && !refreshToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request(endpoint, options);
    }
    throw { code: 'AUTH_FAILED', message: 'Sesión expirada', status: 401 };
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = {
      code: data.code || `HTTP_${res.status}`,
      message: data.message || `HTTP ${res.status}`,
      status: res.status,
      details: data.details,
    };
    throw err;
  }

  return data as T;
}

const cache = new Map<string, { data; timestamp: number; ttl: number }>();

function getCacheKey(endpoint: string, params): string {
  return params ? `${endpoint}?${new URLSearchParams(params as Record<string, string>).toString()}` : endpoint;
}

function isFresh(key: string): boolean {
  const entry = cache.get(key);
  if (!entry) return false;
  return Date.now() - entry.timestamp < entry.ttl;
}

function setCache(key: string, data, ttl): void {
  cache.set(key, { data, timestamp: Date.now(), ttl });
}

function invalidateCache(pattern): void {
  for (const key of cache.keys()) {
    if (key.startsWith(pattern)) cache.delete(key);
  }
}

export const api = {
  get: (endpoint: string, params, useCache) => {
    const key = getCacheKey(endpoint, params);
    if (useCache && isFresh(key)) return Promise.resolve(cache.get(key)!.data);

    const url = params ? `${endpoint}?${new URLSearchParams(params as Record<string, string>).toString()}` : endpoint;
    return request(endpoint, { method: 'GET' }).then((data) => {
      setCache(key, data);
      return data;
    });
  },

  post: (endpoint: string, body) =>
    request<unknown>(endpoint, { method: 'POST', body }).then((data) => {
      invalidateCache('/');
      return data;
    }),

  put: (endpoint: string, body) =>
    request<unknown>(endpoint, { method: 'PUT', body }).then((data) => {
      invalidateCache('/');
      return data;
    }),

  patch: (endpoint: string, body) =>
    request<unknown>(endpoint, { method: 'PATCH', body }).then((data) => {
      invalidateCache('/');
      return data;
    }),

  delete: (endpoint: string) =>
    request<unknown>(endpoint, { method: 'DELETE' }).then((data) => {
      invalidateCache('/');
      return data;
    }),

  // Auth endpoints
  auth: {
    register: (username: string, password: string) =>
      request('/auth/register', { method: 'POST', body: { username, password }, auth: false }),
    login: (username: string, password: string) =>
      request('/auth/login', { method: 'POST', body: { username, password }, auth: false }),
    refresh: () => request('/auth/refresh', { method: 'POST', auth: true, refreshToken: true }),
    me: () => request('/auth/me', { method: 'GET', auth: true }),
  },

  // Task endpoints
  tasks: {
    list: (params: { page: number; per_page: number; sort?: string; title?: string; completed?: boolean }) =>
      request('/tasks', { method: 'GET', params }),

    get: (id: number) => request(`/tasks/${id}`, { method: 'GET' }),

    create: (data: { title: string; description?: string; priority?: number; due_date?: string; completed?: boolean }) =>
      request('/tasks', { method: 'POST', body: data }),

    update: (id: number, data: { title: string; description: string; priority: number; due_date: string; completed: boolean }) =>
      request(`/tasks/${id}`, { method: 'PUT', body: data }),

    patch: (id: number, data: Partial<{ title: string; description: string; priority: number; due_date: string; completed: boolean }>) =>
      request(`/tasks/${id}`, { method: 'PATCH', body: data }),

    delete: (id: number) => request(`/tasks/${id}`, { method: 'DELETE' }),

    toggle: (id: number, completed: boolean) => request(`/tasks/${id}`, { method: 'PATCH', body: { completed } }),
  },

  // Helpers
  cache: {
    invalidate: (pattern) => invalidateCache(pattern),
    clear: () => cache.clear(),
  },
};

export type { ApiError };