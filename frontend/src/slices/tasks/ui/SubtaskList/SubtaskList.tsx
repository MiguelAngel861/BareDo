import { getErrorMessage } from '@/shared/api/errors/index.ts';
import { Badge, Button, Checkbox, CloseIcon, InputField, showToast } from '@/shared/ui/index.ts';
import { useState } from 'preact/hooks';
import { addSubtaskAction, deleteSubtaskAction, toggleSubtaskAction } from '../../tasks.state.ts';
import type { Subtask, SubtaskId, TaskId } from '../../tasks.types.ts';
import './SubtaskList.css';

type SubtaskItemType = Subtask | { subtask_id: SubtaskId; title: string; completed: boolean };

interface SubtaskListProps {
  taskId?: TaskId;
  subtasks: SubtaskItemType[];
  interactive?: boolean;
  onAddDraft?: (title: string) => void;
  onToggleDraft?: (subtaskId: SubtaskId) => void;
  onDeleteDraft?: (subtaskId: SubtaskId) => void;
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
      showToast('Subtask added', 'success');
    } catch (err) {
      showToast(`Error: ${getErrorMessage(err, 'Failed to add subtask')}`, 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggle = async (subtask: SubtaskItemType) => {
    if (onToggleDraft) {
      onToggleDraft(subtask.subtask_id);
    } else if (taskId) {
      try {
        await toggleSubtaskAction(taskId, subtask as Subtask);
      } catch (err) {
        showToast(`Error: ${getErrorMessage(err, 'Failed to update subtask')}`, 'error');
      }
    }
  };

  const handleDelete = async (subtaskId: SubtaskId) => {
    if (onDeleteDraft) {
      onDeleteDraft(subtaskId);
    } else if (taskId) {
      try {
        await deleteSubtaskAction(taskId, subtaskId);
        showToast('Subtask deleted', 'success');
      } catch (err) {
        showToast(`Error: ${getErrorMessage(err, 'Failed to delete subtask')}`, 'error');
      }
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
            <Badge variant="default" size="sm">
              [{completedCount}/{totalCount}] {percent}%
            </Badge>
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
              <Checkbox
                checked={subtask.completed}
                disabled={!interactive}
                onChange={() => handleToggle(subtask)}
                label={<span class="subtask-title">{subtask.title}</span>}
              />

              {interactive && (
                <button
                  type="button"
                  class="subtask-delete-btn"
                  title="Delete subtask"
                  aria-label={`Delete subtask ${subtask.title}`}
                  onClick={() => handleDelete(subtask.subtask_id)}
                >
                  <CloseIcon size={12} strokeWidth={2.2} />
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
          <InputField
            id="subtask-add-input"
            type="text"
            placeholder="+ Add subtask (press Enter)"
            value={newTitle}
            maxLength={120}
            onInput={(val) => setNewTitle(val)}
            onKeyDown={handleKeyDown}
            disabled={isAdding}
            aria-label="New subtask title"
            className="subtasks-add-field"
            inputClassName="subtasks-add-input"
            noMargin={true}
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
