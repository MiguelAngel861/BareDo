import { PopoutModal } from '@/shared/ui/index.ts';
import { PriorityDropdown } from '@/slices/priorities/index.ts';
import { type Tag, TagInputChips } from '@/slices/tags/index.ts';
import { useEffect, useState } from 'preact/hooks';
import {
  closeFormModal,
  editingTaskSignal,
  isFormModalOpenSignal,
  saveTask,
} from '../tasks.state.ts';

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
    } else {
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriorityId(3);
      setCompleted(false);
      setTags([]);
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
        <div class="form-group">
          <label for="title">
            Title <span class="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            maxLength={40}
            placeholder="Task title (max 40 chars)"
            value={title}
            onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
          />
          {titleError && (
            <span class="error-message" id="title-error">
              {titleError}
            </span>
          )}
        </div>

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

        <div class="form-group">
          <label for="due_date">Due Date</label>
          <input
            type="date"
            id="due_date"
            name="due_date"
            value={dueDate}
            onInput={(e) => setDueDate((e.target as HTMLInputElement).value)}
          />
        </div>

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
          <label class="checkbox-label" for="completed">
            <input
              type="checkbox"
              id="completed"
              name="completed"
              class="checkbox-input"
              checked={completed}
              onChange={(e) => setCompleted((e.target as HTMLInputElement).checked)}
            />
            <span class="checkbox-custom" />
            <span class="checkbox-text">Completed</span>
          </label>
        </div>

        <button type="submit" id="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
        </button>

        <button type="button" id="cancel-edit-btn" class="secondary" onClick={closeFormModal}>
          Cancel
        </button>
      </form>

      {formError && (
        <div id="form-error" class="error-message">
          {formError}
        </div>
      )}
    </PopoutModal>
  );
}
