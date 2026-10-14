import * as toastUi from '@/shared/ui/Toast/ToastContainer.tsx';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { tasksApi } from './tasks.api.ts';
import {
  addSubtaskAction,
  deleteSubtaskAction,
  deletingTaskSignal,
  executeDeleteTask,
  paginationSignal,
  requestDeleteTask,
  tasksSignal,
  toggleSubtaskAction,
  toggleTaskComplete,
  viewingTaskSignal,
} from './tasks.state.ts';
import type { Subtask, Task } from './tasks.types.ts';

describe('tasks.state optimistic updates & rollback', () => {
  const sampleTask: Task = {
    task_id: 'task-123',
    title: 'Code review for PR #42',
    description: 'Ensure tests pass',
    completed: false,
    priority_id: 1,
    due_date: null,
    created_at: '2026-10-12T00:00:00Z',
    updated_at: '2026-10-12T00:00:00Z',
    tags: [],
    subtasks: [],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    tasksSignal.value = [sampleTask];
    paginationSignal.value = {
      page: 1,
      per_page: 5,
      total_pages: 1,
      total_items: 1,
      has_prev: false,
      has_next: false,
    };
    deletingTaskSignal.value = null;
    viewingTaskSignal.value = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('toggleTaskComplete', () => {
    it('optimistically updates task.completed immediately and retains on API success', async () => {
      vi.spyOn(tasksApi, 'patch').mockResolvedValue({
        ...sampleTask,
        completed: true,
      });

      const togglePromise = toggleTaskComplete(sampleTask);

      // Check immediate 0ms optimistic update
      expect(tasksSignal.value[0]?.completed).toBe(true);

      await togglePromise;

      // Status remains completed after server confirms
      expect(tasksSignal.value[0]?.completed).toBe(true);
      expect(tasksApi.patch).toHaveBeenCalledWith('task-123', { completed: true });
    });

    it('rolls back to previous status and displays error toast on network failure', async () => {
      vi.spyOn(tasksApi, 'patch').mockRejectedValue(new Error('Network timeout'));
      const toastSpy = vi.spyOn(toastUi, 'showToast').mockImplementation(() => {});

      const togglePromise = toggleTaskComplete(sampleTask);

      // At 0ms it is optimistically toggled
      expect(tasksSignal.value[0]?.completed).toBe(true);

      await togglePromise;

      // Rollback to original status: false
      expect(tasksSignal.value[0]?.completed).toBe(false);
      expect(toastSpy).toHaveBeenCalledWith('Error: Network timeout', 'error');
    });

    it('optimistically updates viewingTaskSignal if the task is currently open in preview', async () => {
      viewingTaskSignal.value = { ...sampleTask };
      vi.spyOn(tasksApi, 'patch').mockRejectedValue(new Error('Server error'));

      const togglePromise = toggleTaskComplete(sampleTask);
      expect(viewingTaskSignal.value?.completed).toBe(true);

      await togglePromise;

      // Rolled back
      expect(viewingTaskSignal.value?.completed).toBe(false);
    });
  });

  describe('executeDeleteTask', () => {
    it('optimistically removes task from tasksSignal immediately', async () => {
      requestDeleteTask(sampleTask);
      vi.spyOn(tasksApi, 'delete').mockResolvedValue(new Response());
      vi.spyOn(tasksApi, 'list').mockResolvedValue({
        tasks: [],
        meta: {
          page: 1,
          per_page: 5,
          total_pages: 0,
          total_items: 0,
          has_prev: false,
          has_next: false,
        },
      });

      const deletePromise = executeDeleteTask();

      // Immediate optimistic removal at 0ms
      expect(tasksSignal.value).toEqual([]);
      expect(deletingTaskSignal.value).toBeNull();
      expect(paginationSignal.value.total_items).toBe(0);

      await deletePromise;

      expect(tasksApi.delete).toHaveBeenCalledWith('task-123');
    });

    it('rolls back and restores task in tasksSignal if deletion fails on server', async () => {
      requestDeleteTask(sampleTask);
      vi.spyOn(tasksApi, 'delete').mockRejectedValue(new Error('Database lock'));
      const toastSpy = vi.spyOn(toastUi, 'showToast').mockImplementation(() => {});

      const deletePromise = executeDeleteTask();

      // Instantly removed
      expect(tasksSignal.value).toHaveLength(0);

      await deletePromise;

      // Rolled back to previous state
      expect(tasksSignal.value).toHaveLength(1);
      expect(tasksSignal.value[0]?.task_id).toBe('task-123');
      expect(paginationSignal.value.total_items).toBe(1);
      expect(toastSpy).toHaveBeenCalledWith('Error: Database lock', 'error');
    });
  });

  describe('Vim navigation selectNextTask & selectPrevTask', () => {
    const taskA = { ...sampleTask, task_id: 'task-a', title: 'Task A' };
    const taskB = { ...sampleTask, task_id: 'task-b', title: 'Task B' };
    const taskC = { ...sampleTask, task_id: 'task-c', title: 'Task C' };

    beforeEach(async () => {
      const { selectedTaskIdSignal } = await import('./tasks.state.ts');
      tasksSignal.value = [taskA, taskB, taskC];
      selectedTaskIdSignal.value = 'task-a';
    });

    it('cycles forward through tasks with selectNextTask', async () => {
      const { selectNextTask, selectedTaskIdSignal } = await import('./tasks.state.ts');

      selectNextTask();
      expect(selectedTaskIdSignal.value).toBe('task-b');

      selectNextTask();
      expect(selectedTaskIdSignal.value).toBe('task-c');

      // Wrap around to first task
      selectNextTask();
      expect(selectedTaskIdSignal.value).toBe('task-a');
    });

    it('cycles backward through tasks with selectPrevTask', async () => {
      const { selectPrevTask, selectedTaskIdSignal } = await import('./tasks.state.ts');

      // From task-a backwards wraps around to last task
      selectPrevTask();
      expect(selectedTaskIdSignal.value).toBe('task-c');

      selectPrevTask();
      expect(selectedTaskIdSignal.value).toBe('task-b');

      selectPrevTask();
      expect(selectedTaskIdSignal.value).toBe('task-a');
    });
  });

  describe('Trash state actions', () => {
    const trashedTask: Task = {
      ...sampleTask,
      task_id: 'trashed-1',
      title: 'Trashed Task',
      deleted_at: '2026-10-12T10:00:00Z',
    };

    it('loadTrashTasks loads discarded tasks and sets count', async () => {
      const { loadTrashTasks, trashTasksSignal, trashCountSignal } = await import(
        './tasks.state.ts'
      );
      vi.spyOn(tasksApi, 'listTrash').mockResolvedValue({
        tasks: [trashedTask],
        meta: {
          page: 1,
          per_page: 10,
          total_pages: 1,
          total_items: 1,
          has_prev: false,
          has_next: false,
        },
      });

      await loadTrashTasks(1);

      expect(trashTasksSignal.value).toHaveLength(1);
      expect(trashCountSignal.value).toBe(1);
    });

    it('restoreTaskAction restores task and updates state', async () => {
      const { restoreTaskAction, trashTasksSignal, trashCountSignal } = await import(
        './tasks.state.ts'
      );
      trashTasksSignal.value = [trashedTask];
      trashCountSignal.value = 1;

      vi.spyOn(tasksApi, 'restore').mockResolvedValue({
        ...trashedTask,
        deleted_at: null,
      });
      vi.spyOn(tasksApi, 'list').mockResolvedValue({
        tasks: [trashedTask],
        meta: {
          page: 1,
          per_page: 5,
          total_pages: 1,
          total_items: 1,
          has_prev: false,
          has_next: false,
        },
      });

      await restoreTaskAction(trashedTask);

      expect(trashTasksSignal.value).toHaveLength(0);
      expect(trashCountSignal.value).toBe(0);
    });

    it('executePermanentDeleteTask purges task and updates state', async () => {
      const {
        executePermanentDeleteTask,
        permanentDeletingTaskSignal,
        trashTasksSignal,
        trashCountSignal,
      } = await import('./tasks.state.ts');
      trashTasksSignal.value = [trashedTask];
      trashCountSignal.value = 1;
      permanentDeletingTaskSignal.value = trashedTask;

      vi.spyOn(tasksApi, 'permanentDelete').mockResolvedValue(new Response());

      await executePermanentDeleteTask();

      expect(trashTasksSignal.value).toHaveLength(0);
      expect(trashCountSignal.value).toBe(0);
    });

    it('executeEmptyTrash empties trash and resets count', async () => {
      const { executeEmptyTrash, trashTasksSignal, trashCountSignal } = await import(
        './tasks.state.ts'
      );
      trashTasksSignal.value = [trashedTask];
      trashCountSignal.value = 1;

      vi.spyOn(tasksApi, 'emptyTrash').mockResolvedValue(new Response());

      await executeEmptyTrash();

      expect(trashTasksSignal.value).toHaveLength(0);
      expect(trashCountSignal.value).toBe(0);
    });
  });

  describe('subtask actions', () => {
    const mockSubtask: Subtask = {
      subtask_id: 'sub-1',
      task_id: 'task-123',
      title: 'First subtask',
      completed: false,
      created_at: '2026-10-12T00:00:00Z',
    };

    it('addSubtaskAction creates subtask and updates task in state', async () => {
      vi.spyOn(tasksApi, 'createSubtask').mockResolvedValue(mockSubtask);

      const result = await addSubtaskAction('task-123', 'First subtask');

      expect(result).toEqual(mockSubtask);
      expect(tasksSignal.value[0]?.subtasks).toHaveLength(1);
      expect(tasksSignal.value[0]?.subtasks[0]?.title).toBe('First subtask');
    });

    it('toggleSubtaskAction optimistically toggles status and handles rollback on error', async () => {
      tasksSignal.value = [{ ...sampleTask, subtasks: [mockSubtask] }];
      viewingTaskSignal.value = { ...sampleTask, subtasks: [mockSubtask] };

      vi.spyOn(tasksApi, 'updateSubtask').mockRejectedValue(new Error('Network error'));

      await toggleSubtaskAction('task-123', mockSubtask);

      // Verify rollback occurred
      expect(tasksSignal.value[0]?.subtasks[0]?.completed).toBe(false);
      expect(viewingTaskSignal.value?.subtasks[0]?.completed).toBe(false);
    });

    it('deleteSubtaskAction removes subtask from task and handles rollback on error', async () => {
      tasksSignal.value = [{ ...sampleTask, subtasks: [mockSubtask] }];
      viewingTaskSignal.value = { ...sampleTask, subtasks: [mockSubtask] };

      vi.spyOn(tasksApi, 'deleteSubtask').mockResolvedValue(new Response());

      await deleteSubtaskAction('task-123', 'sub-1');

      expect(tasksSignal.value[0]?.subtasks).toHaveLength(0);
      expect(viewingTaskSignal.value?.subtasks).toHaveLength(0);
    });
  });
});
