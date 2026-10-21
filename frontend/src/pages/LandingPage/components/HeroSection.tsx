import type { JSX } from 'preact';
import { useLocation } from 'preact-iso';
import { useEffect } from 'preact/hooks';
import { InteractiveSandbox } from './InteractiveSandbox.tsx';

export function HeroSection(): JSX.Element {
  const location = useLocation();

  useEffect(() => {
    const handleGlobalEnter = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const target = e.target as HTMLElement | null;
        const tagName = target?.tagName?.toLowerCase();
        if (
          target?.isContentEditable ||
          tagName === 'input' ||
          tagName === 'textarea' ||
          tagName === 'select' ||
          tagName === 'button' ||
          tagName === 'a' ||
          target?.closest('.sandbox-container')
        ) {
          return;
        }
        location.route('/register');
      }
    };

    window.addEventListener('keydown', handleGlobalEnter);
    return () => window.removeEventListener('keydown', handleGlobalEnter);
  }, [location]);

  return (
    <section class="landing-hero" aria-labelledby="hero-title">
      {/* Precision Blueprint Watermark (Optical Architectural Halo) */}
      <div class="landing-hero-blueprint" aria-hidden="true">
        <svg
          class="blueprint-svg"
          viewBox="0 0 400 400"
          width="400"
          height="400"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <title>Blueprint calibration grid</title>
          {/* Concentric Calibration Circles */}
          <circle cx="200" cy="200" r="180" stroke-dasharray="3 3" stroke-width="1" />
          <circle cx="200" cy="200" r="120" stroke-width="1" />
          <circle cx="200" cy="200" r="60" stroke-dasharray="2 4" stroke-width="1" />
          {/* 60-degree Radial Swiss Axes */}
          <line x1="200" y1="10" x2="200" y2="390" stroke-width="1" />
          <line x1="35.88" y1="105" x2="364.12" y2="295" stroke-width="1" />
          <line x1="35.88" y1="295" x2="364.12" y2="105" stroke-width="1" />
          {/* Hexagonal Razor Framing */}
          <polygon
            points="200,80 304,140 304,260 200,320 96,260 96,140"
            stroke-width="1"
            stroke-dasharray="4 2"
          />
          {/* Central Target Coordinates */}
          <line x1="190" y1="200" x2="210" y2="200" stroke-width="2" />
          <line x1="200" y1="190" x2="200" y2="210" stroke-width="2" />
        </svg>
      </div>

      <div class="landing-hero-content">
        <div class="landing-hero-copy">
          <div class="landing-hero-meta-row">
            <span class="landing-eyebrow" aria-label="Product Classification">
              {'// HIGH-SPEED PRODUCTIVITY CLIENT'}
            </span>
          </div>

          <h1 id="hero-title" class="landing-hero-title">
            CUT THE NOISE.
            <br />
            EXECUTE.
          </h1>
          <p class="landing-hero-subtext">
            The keyboard-driven productivity client for engineers who live on the home row and
            refuse to manage their managers.
          </p>

          <div class="landing-hero-actions">
            <a href="/register" class="app-btn app-btn--primary app-btn--lg">
              <span>{'OPEN TERMINAL // GET STARTED'}</span>
            </a>
            <a
              href="https://github.com/MiguelAngel861/BareDo"
              target="_blank"
              rel="noopener noreferrer"
              class="app-btn app-btn--secondary app-btn--lg"
            >
              VIEW GITHUB REPO
            </a>
          </div>
        </div>

        <div class="landing-hero-sandbox-wrapper">
          <InteractiveSandbox />
        </div>
      </div>
    </section>
  );
}
