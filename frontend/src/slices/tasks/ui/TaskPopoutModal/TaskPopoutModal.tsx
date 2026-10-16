import { Button, Checkbox, InputField, PopoutModal } from '@/shared/ui/index.ts';
import { PriorityDropdown } from '@/slices/priorities/index.ts';
import { type Tag, TagInputChips } from '@/slices/tags/index.ts';
import { useEffect, useState } from 'preact/hooks';
import {
  closeFormModal,
  editingTaskSignal,
  isFormModalOpenSignal,
  saveTask,
} from '../../tasks.state.ts';
import { SubtaskList } from '../SubtaskList/index.ts';
import './TaskPopoutModal.css';

export function TaskPopoutModal() {
  const isOpen = isFormModalOpenSignal.value;
  const editingTask = editingTaskSignal.value;
  const isEditing = Boolean(editingTask);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priorityId, setPriorityId] = useState<number>(3);
  const [completed, setCompleted] = useState<boolean>(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [draftSubtasks, setDraftSubtasks] = useState<
    Array<{ id: string; title: string; completed: boolean }>
  >([]);

  const [titleError, setTitleError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setDueDate(editingTask.due_date ? editingTask.due_date.substring(0, 10) : '');
      setPriorityId(editingTask.priority_id || 3);
      setCompleted(editingTask.completed);
      setTags(editingTask.tags || []);
      setDraftSubtasks([]);
    } else {
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriorityId(3);
      setCompleted(false);
      setTags([]);
      setDraftSubtasks([]);
    }
    setTitleError(null);
    setFormError(null);
  }, [editingTask]);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setFormError(null);

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setTitleError('Title is required');
      return;
    }
    if (cleanTitle.length < 5) {
      setTitleError('Title must be at least 5 characters');
      return;
    }
    if (cleanTitle.length > 40) {
      setTitleError('Title must be 40 characters or less');
      return;
    }
    setTitleError(null);

    setIsSubmitting(true);

    const payload = {
      title: cleanTitle,
      description: description.trim(),
      priority_id: priorityId,
      completed,
      tag_ids: tags.map((t) => t.tag_id),
      ...(!isEditing && draftSubtasks.length > 0
        ? { subtasks: draftSubtasks.map((s) => ({ title: s.title, completed: s.completed })) }
        : {}),
      ...(dueDate ? { due_date: dueDate.includes('T') ? dueDate : `${dueDate}T00:00:00Z` } : {}),
    };

    try {
      await saveTask(payload, isEditing, editingTask?.task_id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save task';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PopoutModal
      isOpen={isOpen}
      onClose={closeFormModal}
      title={isEditing ? 'Edit Task' : 'Create Task'}
    >
      <form id="task-form" class="task-form" onSubmit={handleSubmit}>
        <InputField
          id="title"
          name="title"
          label="Title"
          required={true}
          showAsterisk={true}
          maxLength={40}
          placeholder="Task title (max 40 chars)"
          value={title}
          error={titleError}
          onInput={(val) => setTitle(val)}
        />

        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            name="description"
            maxLength={200}
            placeholder="Task description (max 200 chars)"
            value={description}
            onInput={(e) => setDescription((e.target as HTMLTextAreaElement).value)}
          />
        </div>

        <InputField
          id="due_date"
          name="due_date"
          type="date"
          label="Due Date"
          value={dueDate}
          onInput={(val) => setDueDate(val)}
        />

        <div class="form-group">
          <label id="priority-label" for="priority-select">
            Priority
          </label>
          <PriorityDropdown
            id="priority-select"
            value={priorityId}
            onChange={(val) => setPriorityId(val || 3)}
            showHelper={true}
          />
        </div>

        <div class="form-group">
          <label id="task-tags-label" for="tag-input-field">
            Tags <span class="field-hint">(max 7, press Enter)</span>
          </label>
          <TagInputChips tags={tags} onChange={setTags} />
        </div>

        <div class="form-group">
          <Checkbox
            id="completed"
            name="completed"
            checked={completed}
            onChange={(val) => setCompleted(val)}
            label="Completed"
          />
        </div>

        {isEditing && editingTask ? (
          <div class="form-group">
            <SubtaskList taskId={editingTask.task_id} subtasks={editingTask.subtasks || []} />
          </div>
        ) : (
          <div class="form-group">
            <SubtaskList
              subtasks={draftSubtasks.map((s) => ({
                subtask_id: s.id,
                title: s.title,
                completed: s.completed,
              }))}
              onAddDraft={(t) =>
                setDraftSubtasks((prev) => [
                  ...prev,
                  { id: String(Date.now() + Math.random()), title: t, completed: false },
                ])
              }
              onToggleDraft={(id) =>
                setDraftSubtasks((prev) =>
                  prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
                )
              }
              onDeleteDraft={(id) => setDraftSubtasks((prev) => prev.filter((s) => s.id !== id))}
            />
          </div>
        )}

        <div class="task-form-actions">
          <Button
            type="button"
            id="cancel-edit-btn"
            variant="secondary"
            size="md"
            onClick={closeFormModal}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            id="submit-btn"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>

      {formError && (
        <div id="form-error" class="error-message">
          {formError}
        </div>
      )}
    </PopoutModal>
  );
}
