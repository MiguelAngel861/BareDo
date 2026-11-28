import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toastsSignal } from '@/shared/ui/Toast/toast.state.ts';
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

  it('does not logout on network error', async () => {
    vi.spyOn(authApi, 'me').mockRejectedValue(new Error('Failed to fetch'));

    await initAuth(2, 0);

    expect(authSignal.value.token).toBe('mock-token');
    expect(authSignal.value.isAuthenticated).toBe(true);
    expect(authSignal.value.isLoading).toBe(false);
    expect(localStorage.getItem('access_token')).toBe('mock-token');
  });

  it('logs out when server explicitly responds with 401 Unauthorized', async () => {
    const errorWith401 = {
      name: 'HTTPError',
      response: { status: 401 } as Response,
    };
    vi.spyOn(authApi, 'me').mockRejectedValue(errorWith401);

    await initAuth(2, 0);

    expect(authSignal.value.token).toBeNull();
    expect(authSignal.value.isAuthenticated).toBe(false);
    expect(localStorage.getItem('access_token')).toBeNull();
  });

  it('recovers automatically after transient network error without server-ready event', async () => {
    const mockUser = {
      user_id: 'u1',
      username: 'tester',
      created_at: '2026-01-01',
    };
    const meSpy = vi
      .spyOn(authApi, 'me')
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockUser);

    await initAuth(2, 0);

    expect(meSpy).toHaveBeenCalledTimes(2);
    expect(authSignal.value.user).toEqual(mockUser);
    expect(authSignal.value.isAuthenticated).toBe(true);
    expect(authSignal.value.isLoading).toBe(false);
  });

  it('stops loading after exhausting retries on persistent network error', async () => {
    vi.spyOn(authApi, 'me').mockRejectedValue(new Error('Persistent network error'));

    await initAuth(2, 0);

    expect(authApi.me).toHaveBeenCalledTimes(2);
    expect(authSignal.value.user).toBeNull();
    expect(authSignal.value.isLoading).toBe(false);
    expect(authSignal.value.isAuthenticated).toBe(true);
  });

  it('shows a warning toast after exhausting retries', async () => {
    const before = toastsSignal.value.length;
    vi.spyOn(authApi, 'me').mockRejectedValue(new Error('Persistent network error'));

    await initAuth(2, 0);

    const toasts = toastsSignal.value.slice(before);
    expect(toasts.length).toBe(1);
    expect(toasts[0]?.message).toBe('Could not load your session. Reload the page to try again.');
    expect(toasts[0]?.type).toBe('warning');
  });

  it('ignores concurrent initAuth calls while one is already in flight', async () => {
    const mockUser = {
      user_id: 'u1',
      username: 'tester',
      created_at: '2026-01-01',
    };
    const meSpy = vi.spyOn(authApi, 'me').mockImplementation(async () => {
      window.dispatchEvent(new CustomEvent('server-ready'));
      return mockUser;
    });

    await Promise.all([initAuth(2, 0), initAuth(2, 0)]);

    expect(meSpy).toHaveBeenCalledTimes(1);
    expect(authSignal.value.user).toEqual(mockUser);
  });

  it('logs out immediately on normalized FriendlyError with status 401 without retrying', async () => {
    const before = toastsSignal.value.length;
    const friendly401 = Object.assign(new Error('Unauthorized'), { status: 401 });
    const meSpy = vi.spyOn(authApi, 'me').mockRejectedValue(friendly401);

    await initAuth(5, 0);

    expect(meSpy).toHaveBeenCalledTimes(1);
    expect(authSignal.value.token).toBeNull();
    expect(authSignal.value.isAuthenticated).toBe(false);
    expect(toastsSignal.value.slice(before)).toHaveLength(0);
  });
});
