import { getErrorMessage } from '@/shared/api/errors/index.ts';
import {
  Button,
  ConfirmModal,
  EmptyState,
  PopoutModal,
  TagChip,
  showToast,
} from '@/shared/ui/index.ts';
import {
  cancelEmptyTrash,
  cancelPermanentDeleteTask,
  closeTrashModal,
  executeEmptyTrash,
  executePermanentDeleteTask,
  isConfirmEmptyTrashOpenSignal,
  isLoadingTrashSignal,
  isTrashModalOpenSignal,
  loadTrashTasks,
  permanentDeletingTaskSignal,
  requestEmptyTrash,
  requestPermanentDeleteTask,
  restoreTaskAction,
  trashPaginationSignal,
  trashTasksSignal,
} from '../../tasks.state.ts';
import type { Task } from '../../tasks.types.ts';
import './TrashModal.css';

export function TrashModal() {
  const isOpen = isTrashModalOpenSignal.value;
  const tasks = trashTasksSignal.value;
  const isLoading = isLoadingTrashSignal.value;
  const pagination = trashPaginationSignal.value;
  const taskToPurge = permanentDeletingTaskSignal.value;
  const isConfirmEmptyOpen = isConfirmEmptyTrashOpenSignal.value;

  if (!isOpen) {
    return null;
  }

  const formatDeletedDate = (dateStr?: string | null): string => {
    if (!dateStr) {
      return '';
    }
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const handleRestore = async (task: Task) => {
    try {
      await restoreTaskAction(task);
      showToast('Task restored', 'success');
    } catch (err) {
      showToast(`Error: ${getErrorMessage(err, 'Failed to restore task')}`, 'error');
    }
  };

  const handlePermanentDelete = async () => {
    try {
      await executePermanentDeleteTask();
      showToast('Task permanently deleted', 'success');
    } catch (err) {
      showToast(`Error: ${getErrorMessage(err, 'Failed to delete task permanently')}`, 'error');
    }
  };

  const handleEmptyTrash = async () => {
    try {
      await executeEmptyTrash();
      showToast('Trash emptied', 'success');
    } catch (err) {
      showToast(`Error: ${getErrorMessage(err, 'Failed to empty trash')}`, 'error');
    }
  };

  return (
    <>
      <PopoutModal
        isOpen={isOpen}
        onClose={closeTrashModal}
        title={`Trash Bin // ${pagination.total_items} ${pagination.total_items === 1 ? 'item' : 'items'}`}
      >
        <div class="trash-modal-content">
          <div class="trash-modal-header-actions">
            <p class="trash-modal-desc">
              Discarded tasks remain here until restored or permanently purged.
            </p>
            {tasks.length > 0 && (
              <Button
                type="button"
                id="empty-trash-btn"
                variant="danger"
                size="sm"
                onClick={requestEmptyTrash}
              >
                EMPTY TRASH
              </Button>
            )}
          </div>

          {isLoading ? (
            <div class="trash-empty-state">
              <p class="trash-empty-title">{'// LOADING TRASH...'}</p>
            </div>
          ) : tasks.length === 0 ? (
            <EmptyState
              title="// TRASH IS EMPTY"
              description="No discarded tasks. Items moved to trash will appear here."
            />
          ) : (
            <div class="trash-list" role="list">
              {tasks.map((task) => (
                <div key={task.task_id} class="trash-item-row" role="listitem">
                  <div class="trash-item-info">
                    <span class="trash-item-title">{task.title}</span>
                    <div class="trash-item-meta">
                      {task.deleted_at && <span>DELETED {formatDeletedDate(task.deleted_at)}</span>}
                      {task.tags && task.tags.length > 0 && (
                        <div class="trash-item-tags">
                          {task.tags.map((tag) => (
                            <TagChip key={tag.tag_id} name={tag.name} variant="subtle" size="sm" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div class="trash-item-actions">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRestore(task)}
                      title={`Restore ${task.title}`}
                    >
                      RESTORE
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => requestPermanentDeleteTask(task)}
                      title={`Permanently delete ${task.title}`}
                    >
                      PURGE
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pagination.total_pages > 1 && (
            <div class="trash-pagination">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!pagination.has_prev}
                onClick={() => loadTrashTasks(pagination.page - 1)}
              >
                PREV
              </Button>
              <span>
                PAGE {pagination.page} OF {pagination.total_pages}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!pagination.has_next}
                onClick={() => loadTrashTasks(pagination.page + 1)}
              >
                NEXT
              </Button>
            </div>
          )}
        </div>
      </PopoutModal>

      {/* Confirmation modal for permanent purge of single task */}
      <ConfirmModal
        isOpen={taskToPurge !== null}
        title="Confirm Permanent Deletion"
        message={
          taskToPurge
            ? `Are you sure you want to permanently purge "${taskToPurge.title}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="PURGE FOREVER"
        cancelLabel="CANCEL"
        onConfirm={handlePermanentDelete}
        onCancel={cancelPermanentDeleteTask}
      />

      {/* Confirmation modal for empty trash */}
      <ConfirmModal
        isOpen={isConfirmEmptyOpen}
        title="Confirm Empty Trash"
        message={`Are you sure you want to permanently delete all ${pagination.total_items} items in the trash? This cannot be undone.`}
        confirmLabel="EMPTY TRASH NOW"
        cancelLabel="CANCEL"
        onConfirm={handleEmptyTrash}
        onCancel={cancelEmptyTrash}
      />
    </>
  );
}
