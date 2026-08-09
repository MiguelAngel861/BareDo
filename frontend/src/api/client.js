const API_BASE = (typeof window !== 'undefined' && window.__API_BASE_URL__) || '/api/v1';
const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

let refreshPromise = null;

function getAuthHeaders(refresh = false) {
  const key = refresh ? REFRESH_KEY : ACCESS_KEY;
  const token = localStorage.getItem(key);
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function refreshAccessToken() {
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

async function request(endpoint, options = {}) {
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

  return data;
}

const cache = new Map();

function getCacheKey(endpoint, params) {
  return params ? `${endpoint}?${new URLSearchParams(params).toString()}` : endpoint;
}

function isFresh(key) {
  const entry = cache.get(key);
  if (!entry) return false;
  return Date.now() - entry.timestamp < entry.ttl;
}

function setCache(key, data, ttl = 30000) {
  cache.set(key, { data, timestamp: Date.now(), ttl });
}

function invalidateCache(pattern) {
  for (const key of cache.keys()) {
    if (key.startsWith(pattern)) cache.delete(key);
  }
}

export const api = {
  get(endpoint, params, useCache = true) {
    const key = getCacheKey(endpoint, params);
    if (useCache && isFresh(key)) return Promise.resolve(cache.get(key).data);

    const url = params ? `${endpoint}?${new URLSearchParams(params).toString()}` : endpoint;
    return request(endpoint, { method: 'GET' }).then((data) => {
      setCache(key, data);
      return data;
    });
  },

  post(endpoint, body) {
    return request(endpoint, { method: 'POST', body }).then((data) => {
      invalidateCache('/');
      return data;
    });
  },

  put(endpoint, body) {
    return request(endpoint, { method: 'PUT', body }).then((data) => {
      invalidateCache('/');
      return data;
    });
  },

  patch(endpoint, body) {
    return request(endpoint, { method: 'PATCH', body }).then((data) => {
      invalidateCache('/');
      return data;
    });
  },

  delete(endpoint) {
    return request(endpoint, { method: 'DELETE' }).then((data) => {
      invalidateCache('/');
      return data;
    });
  },

  // Auth endpoints
  auth: {
    register(username, password) {
      return request('/auth/register', { method: 'POST', body: { username, password }, auth: false });
    },
    login(username, password) {
      return request('/auth/login', { method: 'POST', body: { username, password }, auth: false });
    },
    refresh() {
      return request('/auth/refresh', { method: 'POST', auth: true, refreshToken: true });
    },
    me() {
      return request('/auth/me', { method: 'GET', auth: true });
    },
  },

  // Task endpoints
  tasks: {
    list(params) {
      return request('/tasks', { method: 'GET', params });
    },

    get(id) {
      return request(`/tasks/${id}`, { method: 'GET' });
    },

    create(data) {
      return request('/tasks', { method: 'POST', body: data });
    },

    update(id, data) {
      return request(`/tasks/${id}`, { method: 'PUT', body: data });
    },

    patch(id, data) {
      return request(`/tasks/${id}`, { method: 'PATCH', body: data });
    },

    delete(id) {
      return request(`/tasks/${id}`, { method: 'DELETE' });
    },

    toggle(id, completed) {
      return request(`/tasks/${id}`, { method: 'PATCH', body: { completed } });
    },
  },

  // Helpers
  cache: {
    invalidate(pattern) {
      invalidateCache(pattern);
    },
    clear() {
      cache.clear();
    },
  },
};

export { api };