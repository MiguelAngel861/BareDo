import { act, fireEvent, render, screen } from '@testing-library/preact';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ServerWarmupOverlay } from './ServerWarmupOverlay.tsx';

describe('ServerWarmupOverlay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('does not render immediately before delay threshold', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));

    render(<ServerWarmupOverlay />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders tactical warmup popout after 1500ms delay threshold when server is pending', async () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));

    render(<ServerWarmupOverlay />);

    act(() => {
      vi.advanceTimersByTime(1600);
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Connecting to server')).toBeInTheDocument();
    expect(screen.getByText('SERVER STATUS')).toBeInTheDocument();
    expect(screen.getByText('CONNECTING')).toBeInTheDocument();
    expect(screen.getByText('API Backend')).toBeInTheDocument();
    expect(screen.getByText('Waiting for response...')).toBeInTheDocument();
  });

  it('transitions to ONLINE and unmounts when probe succeeds', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));

    render(<ServerWarmupOverlay />);

    act(() => {
      vi.advanceTimersByTime(1600);
    });

    // When fetch resolves successfully
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(screen.getByText('ONLINE')).toBeInTheDocument();
    expect(screen.getByText('Server connected')).toBeInTheDocument();

    // Advance past close timeout (700ms + 300ms)
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows TIMEOUT and retry button when probe exceeds max attempts', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    render(<ServerWarmupOverlay />);

    act(() => {
      vi.advanceTimersByTime(1600);
    });

    // Advance through 30 attempts (each 2500ms)
    for (let i = 0; i < 31; i++) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2600);
      });
    }

    expect(screen.getByText('TIMEOUT')).toBeInTheDocument();
    expect(screen.getAllByText('Connection timed out').length).toBeGreaterThanOrEqual(1);
    const retryBtn = screen.getByRole('button', { name: /retry connection/i });
    expect(retryBtn).toBeInTheDocument();

    // Clicking retry restarts probing
    fireEvent.click(retryBtn);
    expect(screen.getByText('CONNECTING')).toBeInTheDocument();
  });

  it('closes early if server-ready event is dispatched externally', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));

    render(<ServerWarmupOverlay />);

    act(() => {
      vi.advanceTimersByTime(1600);
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new CustomEvent('server-ready'));
      vi.advanceTimersByTime(1100);
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
