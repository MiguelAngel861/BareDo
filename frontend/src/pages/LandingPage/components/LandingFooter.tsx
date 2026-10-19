import type { JSX } from 'preact';

export function LandingFooter(): JSX.Element {
  return (
    <footer class="landing-footer">
      <div class="landing-footer-inner">
        <div class="landing-footer-col">
          <div class="landing-brand-lockup">
            <svg
              class="landing-razor-star"
              viewBox="0 0 32 32"
              width="18"
              height="18"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M 16.0,1.5 L 18.9,10.98 L 28.56,8.75 L 21.8,16.0 L 28.56,23.25 L 18.9,21.02 L 16.0,30.5 L 13.1,21.02 L 3.44,23.25 L 10.2,16.0 L 3.44,8.75 L 13.1,10.98 Z M 17.2,13.92 L 18.4,16.0 L 17.2,18.08 L 14.8,18.08 L 13.6,16.0 L 14.8,13.92 Z"
              />
            </svg>
            <span class="landing-brand-divider" aria-hidden="true" />
            <span class="landing-brand-name">BAREDO</span>
          </div>
          <p class="landing-footer-copy">
            High-speed, keyboard-driven productivity client for engineers.
          </p>
        </div>

        <div class="landing-footer-col">
          <div class="landing-status-badge">
            <span class="landing-status-dot" aria-hidden="true" />
            <span>API STATUS: 200 OPERATIONAL</span>
          </div>
          <span class="landing-footer-meta">ARCHITECTURE: SIGNALS + OPTIMISTIC UI</span>
        </div>

        <div class="landing-footer-col landing-footer-right">
          <span class="landing-footer-creed">CUT THE NOISE. EXECUTE.</span>
          <div class="landing-footer-links">
            <a
              href="https://github.com/MiguelAngel861/BareDo"
              target="_blank"
              rel="noopener noreferrer"
              class="landing-footer-link"
            >
              GITHUB
            </a>
            <span class="landing-footer-divider">&middot;</span>
            <span class="landing-footer-link">MIT LICENSE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
