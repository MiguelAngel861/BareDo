import { API_BASE_URL } from '../client/index.ts';

export function getHealthUrl(): string {
  const origin = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
  return `${origin}/health`;
}

export async function probeHealth(timeoutMs = 2000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(getHealthUrl(), {
      method: 'GET',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}
