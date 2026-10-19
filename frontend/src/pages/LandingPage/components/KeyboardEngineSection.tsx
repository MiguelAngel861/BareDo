import type { JSX } from 'preact';

interface ShortcutCard {
  keys: string[];
  action: string;
  description: string;
}

const SHORTCUTS: ShortcutCard[] = [
  {
    keys: ['J', 'K'],
    action: 'CURSOR CYCLE',
    description:
      'Circular movement across the task queue with instant visual lock. Keep fingers anchored to the home row.',
  },
  {
    keys: ['SPACE', 'X'],
    action: '0MS COMMIT',
    description:
      'Optimistic UI toggles task completion immediately. Zero waiting for backend response round-trips.',
  },
  {
    keys: ['CTRL', 'K'],
    action: 'FUZZY PALETTE',
    description:
      'Instant global search, tag filtering (#tags), and priority switching without touching the mouse.',
  },
  {
    keys: ['C', 'E', 'D'],
    action: 'INLINE TRIAGE',
    description:
      'Create new entries [C], edit focused task [E], or delete [D] with keyboard-driven popout modals.',
  },
];

export function KeyboardEngineSection(): JSX.Element {
  return (
    <section
      id="shortcuts"
      class="landing-section landing-shortcuts-section"
      aria-labelledby="shortcuts-title"
    >
      <div class="landing-section-header">
        <span class="landing-section-index">{'[ 01 / 04 ] // INPUT_PIPELINE'}</span>
        <h2 id="shortcuts-title" class="landing-section-title">
          ZERO MOUSE DEPENDENCY.
        </h2>
        <p class="landing-section-subhead">
          Every core operation is wired directly to standard Vim bindings and global keyboard
          shortcuts.
        </p>
      </div>

      <div class="landing-shortcuts-grid">
        {SHORTCUTS.map((item) => (
          <div key={item.action} class="landing-shortcut-card">
            <div class="landing-shortcut-key-row">
              {item.keys.map((k) => (
                <kbd key={k} class="landing-kbd">
                  {k}
                </kbd>
              ))}
            </div>
            <h3 class="landing-shortcut-action">{item.action}</h3>
            <p class="landing-shortcut-desc">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
