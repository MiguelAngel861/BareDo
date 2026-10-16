import { Button } from '@/shared/ui/Button/index.ts';
import { BaseModal } from '@/shared/ui/Modal/index.ts';
import { prioritiesSignal } from '@/slices/priorities/priorities.state.ts';
import { openManageTagsModal, tagsSignal } from '@/slices/tags/index.ts';
import {
  openCreateModal,
  openShortcutHelpModal,
  openViewModal,
  selectedTaskIdSignal,
  setFilter,
  tasksSignal,
} from '@/slices/tasks/tasks.state.ts';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import './CommandPalette.css';
import {
  closeCommandPalette,
  isCommandPaletteOpenSignal,
  toggleCommandPalette,
} from './command-palette.state.ts';

export interface CommandOption {
  id: string;
  category: string;
  label: string;
  icon: string;
  badge?: string;
  perform: () => void;
}

export function CommandPalette() {
  const isOpen = isCommandPaletteOpenSignal.value;
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Autofocus input on open and reset query
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      const frameId = requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      return () => cancelAnimationFrame(frameId);
    }
  }, [isOpen]);

  const allCommands = useMemo<CommandOption[]>(() => {
    const commands: CommandOption[] = [
      // 1. Quick Actions
      {
        id: 'action-create',
        category: 'Quick Actions',
        label: 'Create new task',
        icon: '+',
        badge: 'C',
        perform: () => openCreateModal(),
      },
      {
        id: 'action-clear-filters',
        category: 'Quick Actions',
        label: 'Clear all filters',
        icon: '↺',
        perform: () => {
          setFilter('title', undefined);
          setFilter('completed', undefined);
          setFilter('priority_id', undefined);
          setFilter('tag_ids', undefined);
        },
      },
      {
        id: 'action-filter-completed',
        category: 'Quick Actions',
        label: 'Filter: Show completed only',
        icon: '✓',
        perform: () => setFilter('completed', true),
      },
      {
        id: 'action-filter-pending',
        category: 'Quick Actions',
        label: 'Filter: Show pending only',
        icon: '○',
        perform: () => setFilter('completed', false),
      },
      {
        id: 'action-manage-tags',
        category: 'Quick Actions',
        label: 'Manage tags (rename or delete)',
        icon: '#',
        perform: () => openManageTagsModal(),
      },
      {
        id: 'action-shortcuts-help',
        category: 'Quick Actions',
        label: 'View keyboard shortcuts guide',
        icon: '?',
        badge: '?',
        perform: () => openShortcutHelpModal(),
      },
    ];

    // 2. Priority Filters
    for (const p of prioritiesSignal.value) {
      commands.push({
        id: `priority-${p.priority_id}`,
        category: 'Filter by Priority',
        label: `Filter by: ${p.name} Priority`,
        icon: '!',
        perform: () => setFilter('priority_id', p.priority_id),
      });
    }

    // 3. Tag Filters
    for (const t of tagsSignal.value) {
      commands.push({
        id: `tag-${t.tag_id}`,
        category: 'Filter by Tag',
        label: `Filter by: #${t.name}`,
        icon: '#',
        perform: () => setFilter('tag_ids', [t.tag_id]),
      });
    }

    // 4. Current Tasks Jump
    for (const task of tasksSignal.value) {
      commands.push({
        id: `task-${task.task_id}`,
        category: 'Jump to Task',
        label: task.title,
        icon: '→',
        badge: task.completed ? 'DONE' : 'PENDING',
        perform: () => {
          selectedTaskIdSignal.value = task.task_id;
          openViewModal(task);
        },
      });
    }

    return commands;
  }, []);

  // Filter commands by query
  const filteredCommands = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return allCommands;
    }
    return allCommands.filter(
      (cmd) => cmd.label.toLowerCase().includes(q) || cmd.category.toLowerCase().includes(q)
    );
  }, [allCommands, query]);

  // Keep index within bounds
  useEffect(() => {
    if (selectedIndex >= filteredCommands.length) {
      setSelectedIndex(Math.max(0, filteredCommands.length - 1));
    }
  }, [filteredCommands.length, selectedIndex]);

  const executeCommand = (cmd: CommandOption) => {
    closeCommandPalette();
    cmd.perform();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 >= filteredCommands.length ? 0 : prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev <= 0 ? filteredCommands.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredCommands[selectedIndex];
      if (selected) {
        executeCommand(selected);
      }
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={closeCommandPalette}
      ariaLabel="Command Palette"
      containerClassName="command-palette-container"
    >
      <div onKeyDown={handleKeyDown}>
        <div class="command-palette-header">
          <span class="command-palette-badge">COMMAND PALETTE</span>
          <input
            ref={inputRef}
            type="text"
            class="command-palette-input"
            placeholder="Type a command or search tasks..."
            value={query}
            onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
            aria-autocomplete="list"
            aria-controls="command-palette-results"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={closeCommandPalette}
            aria-label="Cerrar paleta de comandos"
          >
            ESC / CLOSE
          </Button>
        </div>

        <div id="command-palette-results" class="command-palette-list" role="listbox" tabIndex={-1}>
          {filteredCommands.length === 0 ? (
            <div class="command-palette-empty">
              <span class="command-palette-empty-tag">404_NOT_FOUND</span>
              <p>NO MATCHING COMMANDS OR TASKS FOUND</p>
            </div>
          ) : (
            filteredCommands.map((cmd, index) => {
              const isSelected = index === selectedIndex;
              const prevCmd = filteredCommands[index - 1];
              const showCategoryHeader = !prevCmd || prevCmd.category !== cmd.category;

              return (
                <div key={cmd.id} class="command-palette-row">
                  {showCategoryHeader && (
                    <div class="command-palette-group-title">
                      <span>{cmd.category}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    class={`command-palette-item ${isSelected ? 'command-palette-item--active' : ''}`.trim()}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => executeCommand(cmd)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div class="command-palette-item-main">
                      <span class="command-palette-item-icon" aria-hidden="true">
                        {cmd.icon}
                      </span>
                      <span class="command-palette-item-label">{cmd.label}</span>
                    </div>
                    {cmd.badge && (
                      <span
                        class={`command-palette-item-badge ${
                          cmd.badge === 'DONE'
                            ? 'command-palette-item-badge--done'
                            : cmd.badge === 'PENDING'
                              ? 'command-palette-item-badge--pending'
                              : ''
                        }`.trim()}
                      >
                        {cmd.badge}
                      </span>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div class="command-palette-footer">
          <div class="command-palette-hints">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
