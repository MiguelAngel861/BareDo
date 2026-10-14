import { fireEvent, render, screen } from '@testing-library/preact';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as taskState from '../tasks.state.ts';
import type { Task } from '../tasks.types.ts';
import { TaskDetailModal } from './TaskDetailModal.tsx';

describe('TaskDetailModal component', () => {
  const mockTask: Task = {
    task_id: '999',
    title: 'Review System Metrics',
    description: 'Check latency logs and CPU graphs across all nodes.',
    priority_id: 5,
    due_date: '2026-11-20T00:00:00Z',
    completed: false,
    created_at: '2026-10-10T12:00:00Z',
    updated_at: '2026-10-10T14:30:00Z',
    tags: [
      { tag_id: 1, name: 'devops' },
      { tag_id: 2, name: 'monitoring' },
    ],
    subtasks: [],
  };

  beforeEach(() => {
    taskState.viewingTaskSignal.value = null;
    vi.restoreAllMocks();
  });

  it('renders nothing when no task is selected for viewing', () => {
    const { container } = render(<TaskDetailModal />);
    expect(container.firstChild).toBeNull();
  });

  it('renders task preview details correctly when task is selected', () => {
    taskState.viewingTaskSignal.value = mockTask;
    render(<TaskDetailModal />);

    expect(screen.getByRole('dialog', { name: /task preview/i })).toBeInTheDocument();
    expect(screen.getByText('Review System Metrics')).toBeInTheDocument();
    expect(
      screen.getByText('Check latency logs and CPU graphs across all nodes.')
    ).toBeInTheDocument();
    expect(screen.getByText('○ PENDING')).toBeInTheDocument();
    expect(screen.getByText('#devops')).toBeInTheDocument();
    expect(screen.getByText('#monitoring')).toBeInTheDocument();
    expect(screen.getByText('#999')).toBeInTheDocument();
  });

  it('closes modal when header Close button is clicked', () => {
    taskState.viewingTaskSignal.value = mockTask;
    render(<TaskDetailModal />);

    const closeBtn = screen.getByRole('button', { name: /close|cerrar/i });
    fireEvent.click(closeBtn);

    expect(taskState.viewingTaskSignal.value).toBeNull();
  });

  it('switches to edit modal when Edit Task button is clicked', () => {
    const openEditSpy = vi.spyOn(taskState, 'openEditModal');
    taskState.viewingTaskSignal.value = mockTask;
    render(<TaskDetailModal />);

    const editBtn = screen.getByRole('button', { name: /edit task/i });
    fireEvent.click(editBtn);

    expect(openEditSpy).toHaveBeenCalledWith(mockTask);
  });

  it('requests deletion when Delete Task button is clicked', () => {
    const deleteSpy = vi.spyOn(taskState, 'requestDeleteTask');
    taskState.viewingTaskSignal.value = mockTask;
    render(<TaskDetailModal />);

    const deleteBtn = screen.getByRole('button', { name: /delete task/i });
    fireEvent.click(deleteBtn);

    expect(deleteSpy).toHaveBeenCalledWith(mockTask);
    expect(taskState.viewingTaskSignal.value).toBeNull();
  });
});
