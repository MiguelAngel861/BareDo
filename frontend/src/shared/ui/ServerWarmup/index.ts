import './server-warmup.css';

const DELAY_THRESHOLD_MS = 1500;
const POLL_INTERVAL_MS = 2500;
const MAX_ATTEMPTS = 30; // ~75 seconds total

export function initServerWarmup(): void {
  if (document.getElementById('server-warmup-overlay')) {
    return;
  }

  const isTestMode = new URLSearchParams(window.location.search).has('test-warmup');
  const apiBase = import.meta.env.VITE_API_BASE_URL || '';
  const origin = apiBase ? apiBase.replace(/\/api\/v1\/?$/, '') : '';
  const healthUrl = `${origin}/health`;

  let overlayElement: HTMLElement | null = null;
  let isResolved = false;
  let timerInterval: number | null = null;
  let pollTimeout: number | null = null;
  let attempts = 0;
  let elapsedSeconds = 0;

  const formatTimer = (totalSec: number): string => {
    if (totalSec < 60) {
      return `${totalSec}s`;
    }
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs}s`;
  };

  const startTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    timerInterval = window.setInterval(() => {
      elapsedSeconds += 1;
      const timerEl = document.getElementById('warmup-timer');
      if (timerEl) {
        timerEl.textContent = formatTimer(elapsedSeconds);
      }
    }, 1000);
  };

  const showOverlay = () => {
    if (isResolved || document.getElementById('server-warmup-overlay')) {
      return;
    }

    overlayElement = document.createElement('div');
    overlayElement.id = 'server-warmup-overlay';
    overlayElement.className = 'warmup-overlay';
    overlayElement.setAttribute('role', 'dialog');
    overlayElement.setAttribute('aria-modal', 'true');
    overlayElement.setAttribute('aria-labelledby', 'warmup-title');
    overlayElement.innerHTML = `
      <div class="warmup-terminal">
        <div class="warmup-terminal-header">
          <div class="warmup-tag">
            <span class="warmup-indicator" id="warmup-dot"></span>
            <span class="warmup-tag-text">SERVER STATUS</span>
          </div>
          <span class="warmup-status-code" id="warmup-badge">CONNECTING</span>
        </div>
        
        <div class="warmup-terminal-body">
          <h2 id="warmup-title" class="warmup-heading">Connecting to server</h2>
          <p class="warmup-desc">The server is waking up after inactivity. This process typically takes about a minute.</p>
          
          <div class="warmup-grid">
            <div class="warmup-grid-row">
              <span class="warmup-label">Service:</span>
              <span class="warmup-value" id="warmup-target">API Backend</span>
            </div>
            <div class="warmup-grid-row">
              <span class="warmup-label">Status:</span>
              <span class="warmup-value" id="warmup-status">Waiting for response...</span>
            </div>
            <div class="warmup-grid-row">
              <span class="warmup-label">Progress:</span>
              <span class="warmup-value" id="warmup-attempts">Attempt 01/${MAX_ATTEMPTS}</span>
            </div>
            <div class="warmup-grid-row">
              <span class="warmup-label">Elapsed:</span>
              <span class="warmup-value" id="warmup-timer">0s</span>
            </div>
          </div>

          <div class="warmup-tracker">
            <div class="warmup-tracker-bar" id="warmup-bar"></div>
          </div>
        </div>

        <div class="warmup-terminal-footer" id="warmup-footer" style="display: none;">
          <button type="button" class="warmup-retry-btn" id="warmup-retry-btn">Retry connection</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlayElement);

    const retryBtn = document.getElementById('warmup-retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        const footer = document.getElementById('warmup-footer');
        if (footer) {
          footer.style.display = 'none';
        }
        const badge = document.getElementById('warmup-badge');
        if (badge) {
          badge.textContent = 'CONNECTING';
          badge.classList.remove('is-error', 'is-online');
        }
        const title = document.getElementById('warmup-title');
        if (title) {
          title.textContent = 'Connecting to server';
        }
        const status = document.getElementById('warmup-status');
        if (status) {
          status.textContent = 'Waiting for response...';
          status.classList.remove('is-error', 'is-online');
        }
        const dot = document.getElementById('warmup-dot');
        if (dot) {
          dot.classList.remove('is-error', 'is-online');
        }
        const bar = document.getElementById('warmup-bar');
        if (bar) {
          bar.classList.remove('is-online');
        }
        const timerEl = document.getElementById('warmup-timer');
        elapsedSeconds = 0;
        if (timerEl) {
          timerEl.textContent = '0s';
        }

        attempts = 0;
        isResolved = false;
        startTimer();
        checkHealth();
      });
    }

    startTimer();
  };

  const completeWarmup = (success: boolean) => {
    isResolved = true;
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    if (pollTimeout) {
      clearTimeout(pollTimeout);
    }

    if (success) {
      window.dispatchEvent(new CustomEvent('server-ready'));
    }

    if (!overlayElement) {
      return;
    }

    const title = document.getElementById('warmup-title');
    const badge = document.getElementById('warmup-badge');
    const status = document.getElementById('warmup-status');
    const dot = document.getElementById('warmup-dot');
    const bar = document.getElementById('warmup-bar');
    const footer = document.getElementById('warmup-footer');

    if (success) {
      if (badge) {
        badge.textContent = 'ONLINE';
        badge.classList.add('is-online');
      }
      if (status) {
        status.textContent = 'Connection established (200 OK)';
        status.classList.add('is-online');
      }
      if (title) {
        title.textContent = 'Server connected';
      }
      if (dot) {
        dot.classList.add('is-online');
      }
      if (bar) {
        bar.classList.add('is-online');
      }

      setTimeout(() => {
        if (overlayElement) {
          overlayElement.classList.add('is-closing');
          setTimeout(() => overlayElement?.remove(), 300);
        }
      }, 700);
    } else {
      if (badge) {
        badge.textContent = 'TIMEOUT';
        badge.classList.add('is-error');
      }
      if (status) {
        status.textContent = 'Connection timed out';
        status.classList.add('is-error');
      }
      if (title) {
        title.textContent = 'Connection timed out';
      }
      if (dot) {
        dot.classList.add('is-error');
      }
      if (footer) {
        footer.style.display = 'block';
      }
    }
  };

  if (isTestMode) {
    showOverlay();
    setTimeout(() => completeWarmup(true), 6000);
    return;
  }

  const delayTimer = setTimeout(showOverlay, DELAY_THRESHOLD_MS);

  const checkHealth = async () => {
    if (isResolved) {
      return;
    }
    attempts += 1;

    const attemptsEl = document.getElementById('warmup-attempts');
    if (attemptsEl) {
      attemptsEl.textContent = `Attempt ${String(attempts).padStart(2, '0')}/${MAX_ATTEMPTS}`;
    }

    try {
      const res = await fetch(healthUrl, { method: 'GET', cache: 'no-store' });
      if (res.ok) {
        clearTimeout(delayTimer);
        completeWarmup(true);
        return;
      }
    } catch {
      // Server warming up or network error
    }

    clearTimeout(delayTimer);
    showOverlay();

    if (attempts < MAX_ATTEMPTS) {
      pollTimeout = window.setTimeout(checkHealth, POLL_INTERVAL_MS);
    } else {
      completeWarmup(false);
    }
  };

  checkHealth();
}
