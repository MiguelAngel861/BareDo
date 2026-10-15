import { tasksSignal } from '@/slices/tasks/tasks.state.ts';
import type { Task } from '@/slices/tasks/tasks.types.ts';
import { fireEvent, render, screen } from '@testing-library/preact';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as tagsState from '../../tags.state.ts';
import type { Tag } from '../../tags.types.ts';
import { ManageTagsModal } from './ManageTagsModal.tsx';

describe('ManageTagsModal', () => {
  const mockTags: Tag[] = [
    { tag_id: 1, name: 'work' },
    { tag_id: 2, name: 'home' },
  ];

  const mockTasks: Partial<Task>[] = [
    {
      task_id: '1',
      title: 'Task 1',
      tags: [{ tag_id: 1, name: 'work' }],
    },
    {
      task_id: '2',
      title: 'Task 2',
      tags: [
        { tag_id: 1, name: 'work' },
        { tag_id: 2, name: 'home' },
      ],
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    tagsState.isManageTagsModalOpenSignal.value = true;
    tagsState.tagsSignal.value = [...mockTags];
    tasksSignal.value = mockTasks as Task[];
  });

  it('does not render when modal is closed', () => {
    tagsState.isManageTagsModalOpenSignal.value = false;
    render(<ManageTagsModal />);

    expect(screen.queryByText('Manage Tags')).not.toBeInTheDocument();
  });

  it('renders list of tags with their associated task counts', () => {
    render(<ManageTagsModal />);

    expect(screen.getByText('Manage Tags')).toBeInTheDocument();
    expect(screen.getByText('#work')).toBeInTheDocument();
    expect(screen.getByText('2 tasks')).toBeInTheDocument();
    expect(screen.getByText('#home')).toBeInTheDocument();
    expect(screen.getByText('1 task')).toBeInTheDocument();
  });

  it('allows adding a new tag from the creation bar', async () => {
    const created: Tag = { tag_id: 3, name: 'urgent' };
    const createSpy = vi.spyOn(tagsState, 'findOrCreateTag').mockResolvedValue(created);

    render(<ManageTagsModal />);

    const input = screen.getByLabelText('New tag name');
    fireEvent.input(input, { target: { value: 'urgent' } });

    const addBtn = screen.getByRole('button', { name: /\+ add tag/i });
    fireEvent.click(addBtn);

    expect(createSpy).toHaveBeenCalledWith('urgent');
  });

  it('allows editing a tag inline', async () => {
    const updateSpy = vi.spyOn(tagsState, 'updateTagState').mockResolvedValue({
      tag_id: 1,
      name: 'office',
    });

    render(<ManageTagsModal />);

    const editBtn = screen.getByRole('button', { name: 'Edit tag work' });
    fireEvent.click(editBtn);

    const editInput = screen.getByLabelText('Edit tag work');
    fireEvent.input(editInput, { target: { value: 'office' } });

    const saveBtn = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveBtn);

    expect(updateSpy).toHaveBeenCalledWith(1, 'office');
  });

  it('allows deleting a tag via ConfirmModal confirmation', async () => {
    const deleteSpy = vi.spyOn(tagsState, 'deleteTagState').mockResolvedValue(true);

    render(<ManageTagsModal />);

    const deleteBtn = screen.getByRole('button', { name: 'Delete tag work' });
    fireEvent.click(deleteBtn);

    expect(screen.getByText(/Are you sure you want to delete tag "#work"/i)).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: 'Delete Tag' });
    fireEvent.click(confirmBtn);

    expect(deleteSpy).toHaveBeenCalledWith(1);
  });
});
