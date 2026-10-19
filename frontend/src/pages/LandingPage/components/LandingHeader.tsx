import { Badge } from '@/shared/ui/index.ts';
import type { JSX } from 'preact';

export function LandingHeader(): JSX.Element {
  return (
    <header class="landing-header">
      <div class="landing-header-inner">
        <div class="landing-header-left">
          <a href="/" class="landing-brand-lockup" aria-label="BareDo Home">
            <svg
              class="landing-razor-star"
              viewBox="0 0 32 32"
              width="22"
              height="22"
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
          </a>
          <Badge variant="outline" size="sm" class="landing-header-badge">
            {'REV_1.0 // ZERO_TELEMETRY'}
          </Badge>
        </div>

        <nav class="landing-nav" aria-label="Main Navigation">
          <a href="#shortcuts" class="landing-nav-link">
            SHORTCUTS
          </a>
          <a href="#philosophy" class="landing-nav-link">
            PHILOSOPHY
          </a>
          <a href="#workflow" class="landing-nav-link">
            WORKFLOW
          </a>
          <a
            href="https://github.com/MiguelAngel861/BareDo"
            target="_blank"
            rel="noopener noreferrer"
            class="landing-nav-link"
          >
            GITHUB
          </a>
        </nav>

        <div class="landing-header-cta">
          <a href="/login" class="app-btn app-btn--secondary app-btn--sm">
            SIGN IN
          </a>
          <a href="/register" class="app-btn app-btn--primary app-btn--sm">
            REGISTER
          </a>
        </div>
      </div>
    </header>
  );
}
