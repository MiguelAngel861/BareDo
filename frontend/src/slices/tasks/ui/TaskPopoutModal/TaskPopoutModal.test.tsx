import * as tagsState from '@/slices/tags/tags.state.ts';
import { fireEvent, render, screen } from '@testing-library/preact';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as taskState from '../../tasks.state.ts';
import type { Task } from '../../tasks.types.ts';
import { TaskPopoutModal } from './TaskPopoutModal.tsx';

describe('TaskPopoutModal component', () => {
  const mockTask: Task = {
    task_id: '42',
    title: 'Existing Task Title',
    description: 'Existing description',
    priority_id: 4,
    due_date: '2026-12-25',
    completed: false,
    created_at: '2026-10-10T00:00:00Z',
    updated_at: '2026-10-10T00:00:00Z',
    tags: [],
    subtasks: [],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(tagsState, 'fetchTags').mockImplementation(async () => {});
    taskState.isFormModalOpenSignal.value = false;
    taskState.editingTaskSignal.value = null;
  });

  it('does not render when modal is closed', () => {
    const { container } = render(<TaskPopoutModal />);
    expect(container.querySelector('.task-form')).not.toBeInTheDocument();
  });

  it('renders create mode form when modal is open and editingTask is null', () => {
    taskState.isFormModalOpenSignal.value = true;
    render(<TaskPopoutModal />);

    expect(screen.getByRole('heading', { name: /create task/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^title/i)).toBeInTheDocument();
  });

  it('renders edit mode form with task values when editingTask is provided', () => {
    taskState.isFormModalOpenSignal.value = true;
    taskState.editingTaskSignal.value = mockTask;
    render(<TaskPopoutModal />);

    expect(screen.getByRole('heading', { name: /edit task/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update task/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Task Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing description')).toBeInTheDocument();
  });

  it('calls closeFormModal when cancel button is clicked', () => {
    const closeSpy = vi.spyOn(taskState, 'closeFormModal');
    taskState.isFormModalOpenSignal.value = true;
    render(<TaskPopoutModal />);

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);

    expect(closeSpy).toHaveBeenCalledTimes(1);
  });

  it('submits valid task and calls saveTask', async () => {
    const saveSpy = vi.spyOn(taskState, 'saveTask').mockResolvedValue(undefined);
    taskState.isFormModalOpenSignal.value = true;
    render(<TaskPopoutModal />);

    const titleInput = screen.getByLabelText(/^title/i);
    fireEvent.input(titleInput, { target: { value: 'New Test Task' } });

    const submitBtn = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitBtn);

    expect(saveSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New Test Task',
      }),
      false,
      undefined
    );
  });
});
