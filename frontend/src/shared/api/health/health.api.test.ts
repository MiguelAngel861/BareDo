import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getHealthUrl, probeHealth } from './health.api.ts';

describe('health.api', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('computes correct health URL based on base API', () => {
    const url = getHealthUrl();
    expect(url).toMatch(/\/health$/);
  });

  it('probeHealth returns true when response is ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));

    const result = await probeHealth();
    expect(result).toBe(true);
  });

  it('probeHealth returns false when response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));

    const result = await probeHealth();
    expect(result).toBe(false);
  });

  it('probeHealth returns false when fetch throws error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Connection refused')));

    const result = await probeHealth();
    expect(result).toBe(false);
  });
});
