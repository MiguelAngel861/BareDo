import { Button, ConfirmModal, PopoutModal } from '@/shared/ui/index.ts';
import { tasksSignal } from '@/slices/tasks/tasks.state.ts';
import { useState } from 'preact/hooks';
import {
  closeManageTagsModal,
  deleteTagState,
  findOrCreateTag,
  isManageTagsModalOpenSignal,
  tagsSignal,
  updateTagState,
} from '../../tags.state.ts';
import type { Tag } from '../../tags.types.ts';
import './ManageTagsModal.css';

export function ManageTagsModal() {
  const isOpen = isManageTagsModalOpenSignal.value;
  const tags = tagsSignal.value;
  const tasks = tasksSignal.value;

  const [newTagName, setNewTagName] = useState('');
  const [editingTagId, setEditingTagId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const handleCreate = async (e: Event) => {
    e.preventDefault();
    const clean = newTagName.trim().toLowerCase().replace(/^#/, '');
    if (!clean) {
      return;
    }
    if (clean.length > 30) {
      setError('Tag name cannot exceed 30 characters');
      return;
    }

    setError(null);
    const created = await findOrCreateTag(clean);
    if (created) {
      setNewTagName('');
    }
  };

  const startEdit = (tag: Tag) => {
    setEditingTagId(tag.tag_id);
    setEditingName(tag.name);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingTagId(null);
    setEditingName('');
    setError(null);
  };

  const handleSaveEdit = async (tagId: number) => {
    const clean = editingName.trim().toLowerCase().replace(/^#/, '');
    if (!clean) {
      setError('Tag name cannot be empty');
      return;
    }
    if (clean.length > 30) {
      setError('Tag name cannot exceed 30 characters');
      return;
    }

    setError(null);
    const res = await updateTagState(tagId, clean);
    if (res) {
      setEditingTagId(null);
      setEditingName('');
    }
  };

  const handleConfirmDelete = async () => {
    if (!tagToDelete) {
      return;
    }
    await deleteTagState(tagToDelete.tag_id);
    setTagToDelete(null);
  };

  const getTaskCountForTag = (tagId: number): number => {
    return tasks.filter((t) => t.tags.some((tg) => tg.tag_id === tagId)).length;
  };

  const taskCountForTagToDelete = tagToDelete ? getTaskCountForTag(tagToDelete.tag_id) : 0;

  return (
    <>
      <PopoutModal isOpen={isOpen} onClose={closeManageTagsModal} title="Manage Tags">
        <div class="manage-tags-content">
          <p class="manage-tags-desc">
            Rename or delete tags. Changes immediately sync across all associated tasks.
          </p>

          <form class="manage-tags-create-bar" onSubmit={handleCreate}>
            <input
              type="text"
              placeholder="Create new tag..."
              maxLength={30}
              value={newTagName}
              onInput={(e) => setNewTagName((e.target as HTMLInputElement).value)}
              aria-label="New tag name"
            />
            <Button type="submit" variant="primary" size="md">
              + ADD TAG
            </Button>
          </form>

          {error && <span class="error-message">{error}</span>}

          <div class="manage-tags-list" role="list">
            {tags.length === 0 ? (
              <div class="manage-tags-empty">No tags created yet.</div>
            ) : (
              tags.map((tag) => {
                const isEditing = editingTagId === tag.tag_id;
                const taskCount = getTaskCountForTag(tag.tag_id);

                if (isEditing) {
                  return (
                    <div key={tag.tag_id} class="manage-tag-row">
                      <div class="manage-tag-edit-form">
                        <input
                          type="text"
                          class="manage-tag-edit-input"
                          maxLength={30}
                          value={editingName}
                          onInput={(e) => setEditingName((e.target as HTMLInputElement).value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveEdit(tag.tag_id);
                            } else if (e.key === 'Escape') {
                              cancelEdit();
                            }
                          }}
                          aria-label={`Edit tag ${tag.name}`}
                        />
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => handleSaveEdit(tag.tag_id)}
                        >
                          Save
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={tag.tag_id} class="manage-tag-row" role="listitem">
                    <div class="manage-tag-info">
                      <span class="tag-chip">#{tag.name}</span>
                      <span class="manage-tag-count">
                        {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
                      </span>
                    </div>

                    <div class="manage-tag-actions">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(tag)}
                        aria-label={`Edit tag ${tag.name}`}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setTagToDelete(tag)}
                        aria-label={`Delete tag ${tag.name}`}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </PopoutModal>

      <ConfirmModal
        isOpen={Boolean(tagToDelete)}
        title="Delete Tag"
        message={`Are you sure you want to delete tag "#${tagToDelete?.name}"? It will be removed from ${taskCountForTagToDelete} task(s). This action cannot be undone.`}
        confirmLabel="Delete Tag"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setTagToDelete(null)}
      />
    </>
  );
}
