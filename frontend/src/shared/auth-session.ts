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
