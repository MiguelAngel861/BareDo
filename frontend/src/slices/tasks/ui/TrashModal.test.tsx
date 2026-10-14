import { fireEvent, render, screen } from '@testing-library/preact';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as tasksState from '../tasks.state.ts';
import type { Task } from '../tasks.types.ts';
import { TrashModal } from './TrashModal.tsx';

describe('TrashModal', () => {
  const mockTrashedTasks: Task[] = [
    {
      task_id: '10',
      title: 'Discarded Task 1',
      description: 'Some description',
      priority_id: 3,
      due_date: null,
      completed: false,
      created_at: '2026-10-10T10:00:00Z',
      updated_at: '2026-10-10T12:00:00Z',
      deleted_at: '2026-10-12T14:30:00Z',
      tags: [{ tag_id: 1, name: 'archived' }],
      subtasks: [],
    },
    {
      task_id: '11',
      title: 'Discarded Task 2',
      description: null,
      priority_id: 2,
      due_date: null,
      completed: true,
      created_at: '2026-10-09T08:00:00Z',
      updated_at: '2026-10-09T09:00:00Z',
      deleted_at: '2026-10-12T15:00:00Z',
      tags: [],
      subtasks: [],
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    tasksState.isTrashModalOpenSignal.value = true;
    tasksState.isLoadingTrashSignal.value = false;
    tasksState.trashTasksSignal.value = [...mockTrashedTasks];
    tasksState.trashCountSignal.value = mockTrashedTasks.length;
    tasksState.trashPaginationSignal.value = {
      page: 1,
      per_page: 10,
      total_pages: 1,
      total_items: mockTrashedTasks.length,
      has_prev: false,
      has_next: false,
    };
    tasksState.permanentDeletingTaskSignal.value = null;
    tasksState.isConfirmEmptyTrashOpenSignal.value = false;
  });

  it('does not render when modal is closed', () => {
    tasksState.isTrashModalOpenSignal.value = false;
    render(<TrashModal />);

    expect(screen.queryByText(/Trash Bin/i)).not.toBeInTheDocument();
  });

  it('renders empty state when there are no discarded tasks', () => {
    tasksState.trashTasksSignal.value = [];
    tasksState.trashPaginationSignal.value = {
      page: 1,
      per_page: 10,
      total_pages: 1,
      total_items: 0,
      has_prev: false,
      has_next: false,
    };

    render(<TrashModal />);

    expect(screen.getByText('// TRASH IS EMPTY')).toBeInTheDocument();
  });

  it('renders list of discarded tasks with tags and action buttons', () => {
    render(<TrashModal />);

    expect(screen.getByText('Discarded Task 1')).toBeInTheDocument();
    expect(screen.getByText('Discarded Task 2')).toBeInTheDocument();
    expect(screen.getByText('#archived')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^restore/i })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /^purge/i })).toHaveLength(2);
    expect(screen.getByRole('button', { name: /empty trash/i })).toBeInTheDocument();
  });

  it('calls restoreTaskAction when RESTORE is clicked', () => {
    const restoreSpy = vi.spyOn(tasksState, 'restoreTaskAction').mockResolvedValue();

    render(<TrashModal />);

    const restoreButtons = screen.getAllByRole('button', { name: /^restore/i });
    const firstRestoreBtn = restoreButtons[0];
    expect(firstRestoreBtn).toBeDefined();
    if (firstRestoreBtn) {
      fireEvent.click(firstRestoreBtn);
    }

    expect(restoreSpy).toHaveBeenCalledWith(mockTrashedTasks[0]);
  });

  it('opens confirmation modal when PURGE is clicked', () => {
    render(<TrashModal />);

    const purgeButtons = screen.getAllByRole('button', { name: /^purge/i });
    const firstPurgeBtn = purgeButtons[0];
    expect(firstPurgeBtn).toBeDefined();
    if (firstPurgeBtn) {
      fireEvent.click(firstPurgeBtn);
    }

    expect(tasksState.permanentDeletingTaskSignal.value).toEqual(mockTrashedTasks[0]);
    expect(
      screen.getByText(/Are you sure you want to permanently purge "Discarded Task 1"\?/i)
    ).toBeInTheDocument();
  });

  it('opens empty trash confirmation modal when EMPTY TRASH is clicked', () => {
    render(<TrashModal />);

    const emptyBtn = screen.getByRole('button', { name: /empty trash/i });
    fireEvent.click(emptyBtn);

    expect(tasksState.isConfirmEmptyTrashOpenSignal.value).toBe(true);
    expect(
      screen.getByText(/Are you sure you want to permanently delete all 2 items in the trash\?/i)
    ).toBeInTheDocument();
  });
});
