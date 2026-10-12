const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

export function hasToken(): boolean {
  return !!localStorage.getItem(ACCESS_KEY);
}

export function clear(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function setTokens(response: {
  access_token: string;
  refresh_token: string;
}): void {
  localStorage.setItem(ACCESS_KEY, response.access_token);
  localStorage.setItem(REFRESH_KEY, response.refresh_token);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function isAccessTokenExpired(): boolean {
  const token = localStorage.getItem(ACCESS_KEY);
  if (!token) {
    return true;
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) {
      return true;
    }
    const payload = JSON.parse(atob(parts[1]));
    // Considerar expirado si le quedan menos de 10 segundos para prevenir desincronizaciones de reloj
    const expiresAt = payload.exp * 1000 - 10000;
    return Date.now() >= expiresAt;
  } catch {
    return true;
  }
}
