import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { authApi } from './auth.api.ts';
import { authSignal, initAuth, logout } from './auth.state.ts';

describe('auth.state initAuth resilience', () => {
  beforeEach(() => {
    localStorage.setItem('access_token', 'mock-token');
    localStorage.setItem('refresh_token', 'mock-refresh');
    authSignal.value = {
      token: 'mock-token',
      user: null,
      isAuthenticated: true,
      isLoading: true,
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    logout();
  });

  it('does not logout on cold start / network error', async () => {
    vi.spyOn(authApi, 'me').mockRejectedValue(new Error('Failed to fetch'));

    await initAuth();

    expect(authSignal.value.token).toBe('mock-token');
    expect(authSignal.value.isAuthenticated).toBe(true);
    expect(localStorage.getItem('access_token')).toBe('mock-token');
  });

  it('logs out when server explicitly responds with 401 Unauthorized', async () => {
    const errorWith401 = {
      name: 'HTTPError',
      response: { status: 401 } as Response,
    };
    vi.spyOn(authApi, 'me').mockRejectedValue(errorWith401);

    await initAuth();

    expect(authSignal.value.token).toBeNull();
    expect(authSignal.value.isAuthenticated).toBe(false);
    expect(localStorage.getItem('access_token')).toBeNull();
  });

  it('retries and populates user when server-ready event is dispatched', async () => {
    const mockUser = {
      user_id: 'u1',
      username: 'tester',
      created_at: '2026-01-01',
    };
    const meSpy = vi
      .spyOn(authApi, 'me')
      .mockRejectedValueOnce(new Error('Cold start'))
      .mockResolvedValueOnce(mockUser);

    await initAuth();
    expect(authSignal.value.user).toBeNull();

    window.dispatchEvent(new CustomEvent('server-ready'));
    // Wait for the async callback
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(meSpy).toHaveBeenCalledTimes(2);
    expect(authSignal.value.user).toEqual(mockUser);
    expect(authSignal.value.isAuthenticated).toBe(true);
  });
});
