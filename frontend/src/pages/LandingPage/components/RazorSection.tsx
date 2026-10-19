import { Badge } from '@/shared/ui/index.ts';
import type { JSX } from 'preact';

interface CutItem {
  removed: string;
  instead: string;
}

const CUTS: CutItem[] = [
  {
    removed: 'Loading spinners and artificial round-trip pauses',
    instead: '0ms Optimistic state updates with automated background rollback',
  },
  {
    removed: 'Unread badge counts, guilt streaks, and gamification confetti',
    instead: 'Quiet buffer status: queue either holds pending tasks or is cleared',
  },
  {
    removed: 'Bloated multi-tab project managers and endless comment threads',
    instead: 'Focused linear queue designed for pure solo developer momentum',
  },
  {
    removed: 'Mandatory mouse usage and deep nested dropdown menus',
    instead: 'Home-row Vim navigation (J/K/X/C) and global Command Palette',
  },
];

export function RazorSection(): JSX.Element {
  return (
    <section
      id="philosophy"
      class="landing-section landing-razor-section"
      aria-labelledby="razor-title"
    >
      <div class="landing-section-header">
        <span class="landing-section-index">{'[ 02 / 04 ] // REDUCTION_AUDIT'}</span>
        <h2 id="razor-title" class="landing-section-title">
          AMPUTATING THE BLOAT.
        </h2>
        <p class="landing-section-subhead">
          BareDo is defined not by what it adds, but by what it ruthlessly amputates from modern
          productivity software.
        </p>
      </div>

      <div class="landing-razor-grid">
        <div class="landing-razor-column column-excised">
          <Badge variant="danger" size="sm">
            WHAT WE REMOVED
          </Badge>
          <ul class="landing-razor-list">
            {CUTS.map((item) => (
              <li key={item.removed} class="landing-razor-item item-excised">
                <span class="razor-indicator-cross" aria-hidden="true">
                  ✕
                </span>
                <span class="razor-text">{item.removed}</span>
              </li>
            ))}
          </ul>
        </div>

        <div class="landing-razor-column column-retained">
          <Badge variant="solid" size="sm">
            WHAT REMAINS
          </Badge>
          <ul class="landing-razor-list">
            {CUTS.map((item) => (
              <li key={item.instead} class="landing-razor-item item-retained">
                <span class="razor-indicator-check" aria-hidden="true">
                  ■
                </span>
                <span class="razor-text">{item.instead}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
