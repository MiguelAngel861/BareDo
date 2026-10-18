import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { removeToast, showToast, toastsSignal } from './toast.state.ts';

describe('toast.state', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    toastsSignal.value = [];
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('adds a toast to toastsSignal when showToast is called', () => {
    showToast('Hello world', 'info');

    expect(toastsSignal.value).toHaveLength(1);
    expect(toastsSignal.value[0]?.message).toBe('Hello world');
    expect(toastsSignal.value[0]?.type).toBe('info');
  });

  it('auto-removes toast after specified duration', () => {
    showToast('Auto dismiss', 'success', 2000);

    expect(toastsSignal.value).toHaveLength(1);

    vi.advanceTimersByTime(1999);
    expect(toastsSignal.value).toHaveLength(1);

    vi.advanceTimersByTime(1);
    expect(toastsSignal.value).toHaveLength(0);
  });

  it('removes toast immediately when removeToast is called', () => {
    showToast('Manual remove', 'error');
    const toastId = toastsSignal.value[0]?.id;
    expect(toastId).toBeDefined();

    if (toastId) {
      removeToast(toastId);
    }

    expect(toastsSignal.value).toHaveLength(0);
  });
});
