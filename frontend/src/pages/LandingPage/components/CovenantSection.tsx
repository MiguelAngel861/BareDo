import type { JSX } from 'preact';

export function CovenantSection(): JSX.Element {
  return (
    <section class="landing-section landing-covenant-section" aria-labelledby="covenant-title">
      <div class="landing-covenant-box">
        <span class="landing-section-index">{'[ 04 / 04 ] // ATTENTION_COVENANT'}</span>
        <div class="landing-covenant-header">
          <svg
            class="landing-covenant-star"
            viewBox="0 0 32 32"
            width="28"
            height="28"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M 16.0,1.5 L 18.9,10.98 L 28.56,8.75 L 21.8,16.0 L 28.56,23.25 L 18.9,21.02 L 16.0,30.5 L 13.1,21.02 L 3.44,23.25 L 10.2,16.0 L 3.44,8.75 L 13.1,10.98 Z M 17.2,13.92 L 18.4,16.0 L 17.2,18.08 L 14.8,18.08 L 13.6,16.0 L 14.8,13.92 Z"
            />
          </svg>
          <h2 id="covenant-title" class="landing-covenant-title">
            A CONTRACT WITH YOUR ATTENTION.
          </h2>
        </div>

        <p class="landing-covenant-statement">
          We don’t want you spending your day inside BareDo. We want you finishing your work and
          closing your workstation.
        </p>

        <div class="landing-covenant-points">
          <div class="landing-covenant-point">
            <span class="point-num">01</span>
            <span class="point-title">ZERO ENGAGEMENT TRAPS</span>
            <span class="point-desc">
              No daily streak gamification, no guilt loops, no promotional newsletter blasts.
            </span>
          </div>
          <div class="landing-covenant-point">
            <span class="point-num">02</span>
            <span class="point-title">PURE TOOLING, NOT A SOCIAL NETWORK</span>
            <span class="point-desc">
              Your tasks exist to be completed and cleared, not turned into collaborative
              bureaucracy.
            </span>
          </div>
          <div class="landing-covenant-point">
            <span class="point-num">03</span>
            <span class="point-title">SUB-MILLISECOND TACTILE SPEED</span>
            <span class="point-desc">
              Local signal-driven architecture delivers instantaneous feedback at every keystroke.
            </span>
          </div>
        </div>

        <div class="landing-covenant-actions">
          <a href="/register" class="app-btn app-btn--primary app-btn--lg">
            {'OPEN TERMINAL // REGISTER'}
          </a>
          <a href="/login" class="app-btn app-btn--secondary app-btn--lg">
            SIGN IN TO EXISTING ACCOUNT
          </a>
        </div>
      </div>
    </section>
  );
}
