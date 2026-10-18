import { useServerWarmup } from '@/shared/hooks/index.ts';
import './ServerWarmupOverlay.css';

export function ServerWarmupOverlay() {
  const { isWarmingUp, status, attempts, elapsedSeconds, isClosing, maxAttempts, retry } =
    useServerWarmup();

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
                Attempt {String(attempts).padStart(2, '0')}/{maxAttempts}
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
            <button type="button" class="warmup-retry-btn" id="warmup-retry-btn" onClick={retry}>
              Retry connection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
