import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient, configureApiAuth } from './client.ts';

describe('apiClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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
});
