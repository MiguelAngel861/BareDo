import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { probeHealth } from '../api/health/index.ts';

export const DELAY_THRESHOLD_MS = 1500;
export const POLL_INTERVAL_MS = 2500;
export const MAX_ATTEMPTS = 30;

export type WarmupStatus = 'connecting' | 'online' | 'timeout';

export interface UseServerWarmupResult {
  isWarmingUp: boolean;
  status: WarmupStatus;
  attempts: number;
  elapsedSeconds: number;
  isClosing: boolean;
  maxAttempts: number;
  retry: () => void;
}

export function useServerWarmup(): UseServerWarmupResult {
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

    const isHealthy = await probeHealth();
    if (isHealthy) {
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
      }
      completeWarmup(true);
      return;
    }

    if (attemptsRef.current < MAX_ATTEMPTS && !resolvedRef.current) {
      pollTimeoutRef.current = window.setTimeout(probe, POLL_INTERVAL_MS);
    } else if (!resolvedRef.current) {
      completeWarmup(false);
    }
  }, [completeWarmup]);

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

  return {
    isWarmingUp,
    status,
    attempts,
    elapsedSeconds,
    isClosing,
    maxAttempts: MAX_ATTEMPTS,
    retry: handleRetry,
  };
}
