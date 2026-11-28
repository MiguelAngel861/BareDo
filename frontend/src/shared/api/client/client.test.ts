import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient, configureApiAuth } from './client.ts';

const mockFetch = vi.fn();

beforeEach(() => {
  vi.restoreAllMocks();
  mockFetch.mockReset();
  (globalThis as { fetch: typeof fetch }).fetch = mockFetch;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('apiClient', () => {
  it('is an instantiated KyInstance', () => {
    expect(apiClient).toBeDefined();
    expect(typeof apiClient.get).toBe('function');
    expect(typeof apiClient.post).toBe('function');
    expect(typeof apiClient.patch).toBe('function');
    expect(typeof apiClient.delete).toBe('function');
  });

  it('allows configuring auth callbacks without window navigation side-effects', () => {
    const tokenGetter = vi.fn(() => 'test-token');
    const onUnauthorized = vi.fn();
    const onTokenRefreshed = vi.fn();
    const onServerReady = vi.fn();

    expect(() => {
      configureApiAuth(tokenGetter, onUnauthorized, onTokenRefreshed, onServerReady);
    }).not.toThrow();
  });

  it('retries once after 401 when token refresh succeeds (ky flow)', async () => {
    const onUnauthorized = vi.fn();
    const onTokenRefreshed = vi.fn();
    const validToken = `a.${btoa(JSON.stringify({ exp: 9999999999999, sub: '1' }))}.c`;

    configureApiAuth(() => validToken, onUnauthorized, onTokenRefreshed, vi.fn());
    localStorage.setItem('access_token', validToken);
    localStorage.setItem('refresh_token', 'rt');

    const urls: string[] = [];
    mockFetch.mockImplementation((input: RequestInfo | URL) => {
      const url = input instanceof Request ? input.url : String(input);
      urls.push(url);
      if (url.includes('auth/refresh')) {
        return Promise.resolve(
          new Response(JSON.stringify({ access_token: 't', refresh_token: 'r' }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          })
        );
      }
      const nonRefreshCount = urls.filter((u) => !u.includes('auth/refresh')).length;
      if (nonRefreshCount === 1) {
        return Promise.resolve(new Response(null, { status: 401 }));
      }
      return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    });

    const result = await apiClient.get('tasks').json<{ ok: boolean }>();
    expect(result).toEqual({ ok: true });
    expect(onUnauthorized).not.toHaveBeenCalled();
    expect(onTokenRefreshed).toHaveBeenCalledTimes(1);
    expect(urls.filter((u) => u.includes('auth/refresh'))).toHaveLength(1);
    expect(urls.length).toBe(3);
  });

  it('completes the original request when the access token is expired at load', async () => {
    const expiredToken = `a.${btoa(JSON.stringify({ exp: 1000, sub: '1' }))}.c`;
    localStorage.setItem('access_token', expiredToken);
    localStorage.setItem('refresh_token', 'rt');

    configureApiAuth(() => localStorage.getItem('access_token'), vi.fn(), vi.fn(), vi.fn());

    const requests: { url: string; authorization: string | null }[] = [];
    mockFetch.mockImplementation((input: RequestInfo | URL) => {
      const request = input instanceof Request ? input : new Request(input);
      requests.push({ url: request.url, authorization: request.headers.get('Authorization') });
      if (request.url.includes('auth/refresh')) {
        return Promise.resolve(
          new Response(JSON.stringify({ access_token: 'new-at', refresh_token: 'new-rt' }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          })
        );
      }
      return Promise.resolve(
        new Response(JSON.stringify({ tasks: [] }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      );
    });

    const result = await apiClient.get('tasks').json<{ tasks: unknown[] }>();
    expect(result).toEqual({ tasks: [] });

    const refresh = requests.find((r) => r.url.includes('auth/refresh'));
    expect(refresh).toBeDefined();
    expect(refresh?.authorization).toBe('Bearer rt');
    expect(localStorage.getItem('access_token')).toBe('new-at');
  });

  it('calls onUnauthorized when refresh fails with network error', async () => {
    const onUnauthorized = vi.fn();
    const onTokenRefreshed = vi.fn();
    const validToken = `a.${btoa(JSON.stringify({ exp: 9999999999999, sub: '1' }))}.c`;

    configureApiAuth(() => validToken, onUnauthorized, onTokenRefreshed, vi.fn());
    localStorage.setItem('access_token', validToken);
    localStorage.setItem('refresh_token', 'rt');

    mockFetch
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockRejectedValueOnce(new Error('Network error'));

    await expect(apiClient.get('tasks').json()).rejects.toBeDefined();
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(onTokenRefreshed).not.toHaveBeenCalled();
  });

  it('notifies onServerReady after recovering a 401 via token refresh', async () => {
    const onServerReady = vi.fn();
    const validToken = `a.${btoa(JSON.stringify({ exp: 9999999999999, sub: '1' }))}.c`;
    localStorage.setItem('access_token', validToken);
    localStorage.setItem('refresh_token', 'rt');

    configureApiAuth(() => localStorage.getItem('access_token'), vi.fn(), vi.fn(), onServerReady);

    mockFetch
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: 'new-at', refresh_token: 'new-rt' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ user_id: '1' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      );

    await apiClient.get('auth/me').json();
    expect(onServerReady).toHaveBeenCalledTimes(1);
  });
});
