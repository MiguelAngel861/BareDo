import { useEffect, useState } from 'preact/hooks';
import './server-warmup.css';

const DELAY_THRESHOLD_MS = 1500;
const POLL_INTERVAL_MS = 2500;
const MAX_ATTEMPTS = 30;

export function ServerWarmupBanner() {
  const [isWarmingUp, setIsWarmingUp] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isResolved, setIsResolved] = useState(false);

  useEffect(() => {
    let resolved = false;
    let attempts = 0;
    let pollTimeout: number | null = null;
    let timerInterval: number | null = null;

    const apiBase = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '');
    const healthUrl = `${apiBase}/health`;

    const handleServerReady = () => {
      if (!resolved) {
        resolved = true;
        setIsResolved(true);
        setIsWarmingUp(false);
      }
    };

    window.addEventListener('server-ready', handleServerReady);

    const delayTimer = window.setTimeout(() => {
      if (!resolved) {
        setIsWarmingUp(true);
        timerInterval = window.setInterval(() => {
          setElapsedSeconds((sec) => sec + 1);
        }, 1000);
      }
    }, DELAY_THRESHOLD_MS);

    const probe = async () => {
      if (resolved) {
        return;
      }
      attempts += 1;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(healthUrl, {
          method: 'GET',
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        clearTimeout(timeout);

        if (res.ok) {
          resolved = true;
          clearTimeout(delayTimer);
          if (timerInterval) {
            clearInterval(timerInterval);
          }
          setIsResolved(true);
          setIsWarmingUp(false);
          window.dispatchEvent(new CustomEvent('server-ready'));
          return;
        }
      } catch {
        // Servidor iniciando o red no lista aún
      }

      if (attempts < MAX_ATTEMPTS && !resolved) {
        pollTimeout = window.setTimeout(probe, POLL_INTERVAL_MS);
      } else if (!resolved) {
        setIsWarmingUp(false);
      }
    };

    probe();

    return () => {
      resolved = true;
      clearTimeout(delayTimer);
      if (pollTimeout) {
        clearTimeout(pollTimeout);
      }
      if (timerInterval) {
        clearInterval(timerInterval);
      }
      window.removeEventListener('server-ready', handleServerReady);
    };
  }, []);

  if (!isWarmingUp || isResolved) {
    return null;
  }

  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  const timeDisplay = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  return (
    <div
      id="server-warmup-overlay"
      class="server-warmup-overlay visible"
      role="status"
      aria-live="polite"
    >
      <div class="server-warmup-content">
        <span class="warmup-pulse" aria-hidden="true" />
        <span class="warmup-text">
          Servidor iniciando (servicios gratuitos tardan ~30s). Tiempo transcurrido:{' '}
          <strong id="warmup-timer">{timeDisplay}</strong>
        </span>
      </div>
    </div>
  );
}
