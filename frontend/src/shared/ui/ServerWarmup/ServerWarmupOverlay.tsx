import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import './ServerWarmupOverlay.css';

const DELAY_THRESHOLD_MS = 1500;
const POLL_INTERVAL_MS = 2500;
const MAX_ATTEMPTS = 30;

type WarmupStatus = 'connecting' | 'online' | 'timeout';

export function ServerWarmupOverlay() {
  const [isWarmingUp, setIsWarmingUp] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [status, setStatus] = useState<WarmupStatus>('connecting');
  const [attempts, setAttempts] = useState(1);
  const [isClosing, setIsClosing] = useState(false);

  const resolvedRef = useRef(false);
  const attemptsRef = useRef(0);
  const timerIntervalRef = useRef<number | null>(null);
  const pollTimeoutRef = useRef<number | null>(null);
  const delayTimeoutRef = useRef<number | null>(null);

  const getHealthUrl = useCallback(() => {
    const apiBase = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '');
    const origin = apiBase ? apiBase.replace(/\/api\/v1\/?$/, '') : '';
    return `${origin}/health`;
  }, []);

  const startTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    timerIntervalRef.current = window.setInterval(() => {
      setElapsedSeconds((sec) => sec + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const completeWarmup = useCallback(
    (success: boolean) => {
      resolvedRef.current = true;
      stopTimer();
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }

      if (success) {
        setStatus('online');
        window.dispatchEvent(new CustomEvent('server-ready'));
        setTimeout(() => {
          setIsClosing(true);
          setTimeout(() => {
            setIsWarmingUp(false);
          }, 300);
        }, 700);
      } else {
        setStatus('timeout');
      }
    },
    [stopTimer]
  );

  const probe = useCallback(async () => {
    if (resolvedRef.current) {
      return;
    }

    attemptsRef.current += 1;
    setAttempts(attemptsRef.current);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(getHealthUrl(), {
        method: 'GET',
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeout);

      if (res.ok) {
        if (delayTimeoutRef.current) {
          clearTimeout(delayTimeoutRef.current);
        }
        completeWarmup(true);
        return;
      }
    } catch {
      // Servidor iniciando o red no lista aún
    }

    if (attemptsRef.current < MAX_ATTEMPTS && !resolvedRef.current) {
      pollTimeoutRef.current = window.setTimeout(probe, POLL_INTERVAL_MS);
    } else if (!resolvedRef.current) {
      completeWarmup(false);
    }
  }, [completeWarmup, getHealthUrl]);

  const handleRetry = useCallback(() => {
    resolvedRef.current = false;
    attemptsRef.current = 0;
    setAttempts(1);
    setElapsedSeconds(0);
    setStatus('connecting');
    startTimer();
    probe();
  }, [probe, startTimer]);

  useEffect(() => {
    const isTestMode =
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).has('test-warmup');

    const handleServerReady = () => {
      if (!resolvedRef.current) {
        completeWarmup(true);
      }
    };

    window.addEventListener('server-ready', handleServerReady);

    if (isTestMode) {
      setIsWarmingUp(true);
      startTimer();
      setTimeout(() => completeWarmup(true), 6000);
      return () => {
        stopTimer();
        window.removeEventListener('server-ready', handleServerReady);
      };
    }

    delayTimeoutRef.current = window.setTimeout(() => {
      if (!resolvedRef.current) {
        setIsWarmingUp(true);
        startTimer();
      }
    }, DELAY_THRESHOLD_MS);

    probe();

    return () => {
      resolvedRef.current = true;
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
      }
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
      stopTimer();
      window.removeEventListener('server-ready', handleServerReady);
    };
  }, [completeWarmup, probe, startTimer, stopTimer]);

  if (!isWarmingUp) {
    return null;
  }

  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  const timeDisplay = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  return (
    <div
      id="server-warmup-overlay"
      class={`warmup-overlay ${isClosing ? 'is-closing' : ''}`.trim()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="warmup-title"
    >
      <div class="warmup-terminal">
        <div class="warmup-terminal-header">
          <div class="warmup-tag">
            <span
              id="warmup-dot"
              class={`warmup-indicator ${status === 'online' ? 'is-online' : status === 'timeout' ? 'is-error' : ''}`.trim()}
            />
            <span class="warmup-tag-text">SERVER STATUS</span>
          </div>
          <span
            id="warmup-badge"
            class={`warmup-status-code ${status === 'online' ? 'is-online' : status === 'timeout' ? 'is-error' : ''}`.trim()}
          >
            {status === 'online' ? 'ONLINE' : status === 'timeout' ? 'TIMEOUT' : 'CONNECTING'}
          </span>
        </div>

        <div class="warmup-terminal-body">
          <h2 id="warmup-title" class="warmup-heading">
            {status === 'online'
              ? 'Server connected'
              : status === 'timeout'
                ? 'Connection timed out'
                : 'Connecting to server'}
          </h2>
          <p class="warmup-desc">
            The server is waking up after inactivity. This process typically takes about a minute.
          </p>

          <div class="warmup-grid">
            <div class="warmup-grid-row">
              <span class="warmup-label">Service:</span>
              <span class="warmup-value" id="warmup-target">
                API Backend
              </span>
            </div>
            <div class="warmup-grid-row">
              <span class="warmup-label">Status:</span>
              <span
                class={`warmup-value ${status === 'online' ? 'is-online' : status === 'timeout' ? 'is-error' : ''}`.trim()}
                id="warmup-status"
              >
                {status === 'online'
                  ? 'Connection established (200 OK)'
                  : status === 'timeout'
                    ? 'Connection timed out'
                    : 'Waiting for response...'}
              </span>
            </div>
            <div class="warmup-grid-row">
              <span class="warmup-label">Progress:</span>
              <span class="warmup-value" id="warmup-attempts">
                Attempt {String(attempts).padStart(2, '0')}/{MAX_ATTEMPTS}
              </span>
            </div>
            <div class="warmup-grid-row">
              <span class="warmup-label">Elapsed:</span>
              <span class="warmup-value" id="warmup-timer">
                {timeDisplay}
              </span>
            </div>
          </div>

          <div class="warmup-tracker">
            <div
              id="warmup-bar"
              class={`warmup-tracker-bar ${status === 'online' ? 'is-online' : ''}`.trim()}
            />
          </div>
        </div>

        {status === 'timeout' && (
          <div class="warmup-terminal-footer" id="warmup-footer">
            <button
              type="button"
              class="warmup-retry-btn"
              id="warmup-retry-btn"
              onClick={handleRetry}
            >
              Retry connection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
