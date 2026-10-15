import { Button } from '@/shared/ui/index.ts';
import { useState } from 'preact/hooks';
import { addSubtaskAction, deleteSubtaskAction, toggleSubtaskAction } from '../../tasks.state.ts';
import type { Subtask } from '../../tasks.types.ts';
import './SubtaskList.css';

export type SubtaskItemType = Subtask | { subtask_id: string; title: string; completed: boolean };

interface SubtaskListProps {
  taskId?: string;
  subtasks: SubtaskItemType[];
  interactive?: boolean;
  onAddDraft?: (title: string) => void;
  onToggleDraft?: (subtaskId: string) => void;
  onDeleteDraft?: (subtaskId: string) => void;
}

export function SubtaskList({
  taskId,
  subtasks = [],
  interactive = true,
  onAddDraft,
  onToggleDraft,
  onDeleteDraft,
}: SubtaskListProps) {
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const completedCount = subtasks.filter((s) => s.completed).length;
  const totalCount = subtasks.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAdd = async (e?: Event) => {
    if (e) {
      e.preventDefault();
    }
    const clean = newTitle.trim();
    if (!clean || isAdding) {
      return;
    }

    if (onAddDraft) {
      onAddDraft(clean);
      setNewTitle('');
      return;
    }

    if (!taskId) {
      return;
    }

    setIsAdding(true);
    try {
      await addSubtaskAction(taskId, clean);
      setNewTitle('');
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggle = (subtask: SubtaskItemType) => {
    if (onToggleDraft) {
      onToggleDraft(subtask.subtask_id);
    } else if (taskId) {
      toggleSubtaskAction(taskId, subtask as Subtask);
    }
  };

  const handleDelete = (subtaskId: string) => {
    if (onDeleteDraft) {
      onDeleteDraft(subtaskId);
    } else if (taskId) {
      deleteSubtaskAction(taskId, subtaskId);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <section class="subtasks-container" aria-label="Task checklist">
      <header class="subtasks-header">
        <h4 class="subtasks-heading">
          SUBTASKS
          {totalCount > 0 && (
            <span class="subtasks-counter">
              [{completedCount}/{totalCount}] {percent}%
            </span>
          )}
        </h4>
        {totalCount > 0 && (
          <div class="subtasks-progress-bar">
            <div class="subtasks-progress-fill" style={{ width: `${percent}%` }} />
          </div>
        )}
      </header>

      {subtasks.length > 0 ? (
        <ul class="subtasks-list">
          {subtasks.map((subtask) => (
            <li
              key={subtask.subtask_id}
              class={`subtask-item ${subtask.completed ? 'is-completed' : ''}`.trim()}
            >
              <label class="subtask-label">
                <input
                  type="checkbox"
                  class="subtask-checkbox"
                  checked={subtask.completed}
                  disabled={!interactive}
                  onChange={() => handleToggle(subtask)}
                />
                <span class="subtask-custom-checkbox" aria-hidden="true">
                  {subtask.completed ? '■' : ''}
                </span>
                <span class="subtask-title">{subtask.title}</span>
              </label>

              {interactive && (
                <button
                  type="button"
                  class="subtask-delete-btn"
                  title="Delete subtask"
                  aria-label={`Delete subtask ${subtask.title}`}
                  onClick={() => handleDelete(subtask.subtask_id)}
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p class="subtasks-empty">No subtasks yet. Add one below.</p>
      )}

      {interactive && (
        <form class="subtasks-add-form" onSubmit={handleAdd}>
          <input
            type="text"
            class="subtasks-add-input"
            placeholder="+ Add subtask (press Enter)"
            value={newTitle}
            maxLength={120}
            onInput={(e) => setNewTitle((e.target as HTMLInputElement).value)}
            onKeyDown={handleKeyDown}
            disabled={isAdding}
            aria-label="New subtask title"
          />
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            disabled={!newTitle.trim() || isAdding}
          >
            Add
          </Button>
        </form>
      )}
    </section>
  );
}
