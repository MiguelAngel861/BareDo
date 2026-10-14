import { BaseModal, Button } from '@/shared/ui/index.ts';
import './ShortcutHelpModal.css';

interface ShortcutHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutGroup {
  category: string;
  items: {
    keys: string[];
    desc: string;
    actionTag?: string;
  }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    category: 'Vim Navigation',
    items: [
      { keys: ['J', '↓'], desc: 'Select next task in list', actionTag: 'CYCLE' },
      { keys: ['K', '↑'], desc: 'Select previous task in list', actionTag: 'CYCLE' },
      { keys: ['Enter'], desc: 'Open full preview & details for focused task' },
      { keys: ['/'], desc: 'Focus global search bar', actionTag: 'SEARCH' },
    ],
  },
  {
    category: 'Task Actions (0ms Optimistic)',
    items: [
      {
        keys: ['X', 'Space'],
        desc: 'Toggle complete / pending status',
        actionTag: '0MS OPTIMISTIC',
      },
      { keys: ['E'], desc: 'Open edit modal for focused task' },
      { keys: ['D', 'Del'], desc: 'Delete focused task with confirmation' },
      { keys: ['C'], desc: 'Quick create new task modal' },
    ],
  },
  {
    category: 'Global & System Commands',
    items: [
      { keys: ['Ctrl', 'K'], desc: 'Open tactical Command Palette', actionTag: 'PALETTE' },
      { keys: ['?'], desc: 'Display this keyboard reference cheat-sheet' },
      { keys: ['Esc'], desc: 'Dismiss any open modal, preview or palette' },
    ],
  },
];

export function ShortcutHelpModal({ isOpen, onClose }: ShortcutHelpModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel="Keyboard Shortcuts Reference"
      containerClassName="shortcut-help-container"
    >
      <div class="shortcut-help-layout">
        <header class="shortcut-help-header">
          <div class="shortcut-help-header-top">
            <span class="shortcut-help-badge">CLI_ENGINE :: REFERENCE</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Cerrar modal de atajos"
            >
              ESC / CLOSE
            </Button>
          </div>
          <h2 id="shortcut-help-title" class="shortcut-help-title">
            KEYBOARD SHORTCUTS
          </h2>
          <p class="shortcut-help-desc">
            Vim-style navigation and rapid command execution. Zero mouse reliance required.
          </p>
        </header>

        <div class="shortcut-help-body">
          {SHORTCUT_GROUPS.map((group) => (
            <section key={group.category} class="shortcut-group-section">
              <div class="shortcut-group-header">
                <span class="shortcut-group-title">{group.category}</span>
              </div>

              <div class="shortcut-cards-grid">
                {group.items.map((item) => (
                  <div key={item.desc} class="shortcut-card">
                    <div class="shortcut-card-keys">
                      {item.keys.map((k, idx) => (
                        <span key={k} class="shortcut-key-wrap">
                          {idx > 0 && <span class="shortcut-key-separator">/</span>}
                          <kbd class="shortcut-kbd">{k}</kbd>
                        </span>
                      ))}
                    </div>

                    <div class="shortcut-card-info">
                      <span class="shortcut-card-desc">{item.desc}</span>
                      {item.actionTag && <span class="shortcut-card-tag">{item.actionTag}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </BaseModal>
  );
}
