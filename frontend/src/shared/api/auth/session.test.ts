import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  clear,
  getAccessToken,
  getRefreshToken,
  hasToken,
  isAccessTokenExpired,
  setTokens,
} from './session.ts';

describe('auth session utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('detects when tokens are present or absent', () => {
    expect(hasToken()).toBe(false);
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();

    setTokens({ access_token: 'acc-123', refresh_token: 'ref-456' });

    expect(hasToken()).toBe(true);
    expect(getAccessToken()).toBe('acc-123');
    expect(getRefreshToken()).toBe('ref-456');
  });

  it('clears stored tokens', () => {
    setTokens({ access_token: 'acc-123', refresh_token: 'ref-456' });
    clear();

    expect(hasToken()).toBe(false);
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it('checks access token expiration correctly', () => {
    expect(isAccessTokenExpired()).toBe(true);

    // Malformed token
    localStorage.setItem('access_token', 'not-a-jwt');
    expect(isAccessTokenExpired()).toBe(true);

    // Expired token (exp in past)
    const pastExp = Math.floor(Date.now() / 1000) - 100;
    const expiredPayload = btoa(JSON.stringify({ exp: pastExp }));
    localStorage.setItem('access_token', `header.${expiredPayload}.signature`);
    expect(isAccessTokenExpired()).toBe(true);

    // Valid token (exp in future)
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const validPayload = btoa(JSON.stringify({ exp: futureExp }));
    localStorage.setItem('access_token', `header.${validPayload}.signature`);
    expect(isAccessTokenExpired()).toBe(false);
  });
});
