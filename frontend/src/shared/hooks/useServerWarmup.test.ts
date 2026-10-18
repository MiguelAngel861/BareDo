import { act, renderHook } from '@testing-library/preact';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as healthApi from '../api/health/index.ts';
import { useServerWarmup } from './useServerWarmup.ts';

describe('useServerWarmup', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('starts inactive before delay threshold', () => {
    vi.spyOn(healthApi, 'probeHealth').mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useServerWarmup());

    expect(result.current.isWarmingUp).toBe(false);
    expect(result.current.status).toBe('connecting');
  });

  it('becomes active after delay threshold when probe is still pending', () => {
    vi.spyOn(healthApi, 'probeHealth').mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useServerWarmup());

    act(() => {
      vi.advanceTimersByTime(1600);
    });

    expect(result.current.isWarmingUp).toBe(true);
    expect(result.current.status).toBe('connecting');
  });

  it('transitions to online and closes when probe resolves healthy', async () => {
    vi.spyOn(healthApi, 'probeHealth').mockResolvedValue(true);

    const { result } = renderHook(() => useServerWarmup());

    act(() => {
      vi.advanceTimersByTime(1600);
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(result.current.status).toBe('online');

    act(() => {
      vi.advanceTimersByTime(1100);
    });

    expect(result.current.isWarmingUp).toBe(false);
  });

  it('sets status to timeout after exceeding max attempts', async () => {
    vi.spyOn(healthApi, 'probeHealth').mockResolvedValue(false);

    const { result } = renderHook(() => useServerWarmup());

    act(() => {
      vi.advanceTimersByTime(1600);
    });

    for (let i = 0; i < 31; i++) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2600);
      });
    }

    expect(result.current.status).toBe('timeout');

    // Retrying resets status and triggers probe
    act(() => {
      result.current.retry();
    });

    expect(result.current.status).toBe('connecting');
  });
});
