import { fireEvent, render, screen } from '@testing-library/preact';
import { describe, expect, it, vi } from 'vitest';
import * as taskState from '../../tasks.state.ts';
import type { Task } from '../../tasks.types.ts';
import { TaskCard } from './TaskCard.tsx';

describe('TaskCard component', () => {
  const mockTask: Task = {
    task_id: '123',
    title: 'Migrate to Preact',
    description: 'Use Preact Signals and VSA',
    priority_id: 5,
    due_date: '2026-12-31T00:00:00Z',
    completed: false,
    created_at: '2026-10-10T00:00:00Z',
    updated_at: '2026-10-10T00:00:00Z',
    tags: [
      { tag_id: 1, name: 'frontend' },
      { tag_id: 2, name: 'architecture' },
    ],
    subtasks: [
      {
        subtask_id: '1',
        task_id: '123',
        title: 'Step 1',
        completed: true,
        created_at: '2026-10-10T00:00:00Z',
      },
      {
        subtask_id: '2',
        task_id: '123',
        title: 'Step 2',
        completed: false,
        created_at: '2026-10-10T00:00:00Z',
      },
    ],
  };

  it('renders task details correctly', () => {
    render(<TaskCard task={mockTask} />);

    expect(screen.getByText('Migrate to Preact')).toBeInTheDocument();
    expect(screen.getByText('Use Preact Signals and VSA')).toBeInTheDocument();
    expect(screen.getByText('#frontend')).toBeInTheDocument();
    expect(screen.getByText('#architecture')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Due: 2026-12-31')).toBeInTheDocument();
    expect(screen.getByText('1/2 SUBTASKS')).toBeInTheDocument();
    expect(screen.getByText('Mark Complete')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('opens preview modal when task cell is clicked', () => {
    taskState.viewingTaskSignal.value = null;
    render(<TaskCard task={mockTask} />);

    const cell = screen.getByRole('button', { name: /view task details/i });
    fireEvent.click(cell);

    expect(taskState.viewingTaskSignal.value).toEqual(mockTask);
  });

  it('scrolls into view when task is selected', () => {
    const scrollMock = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollMock;

    taskState.selectedTaskIdSignal.value = '123';
    render(<TaskCard task={mockTask} />);

    expect(scrollMock).toHaveBeenCalledWith({
      block: 'nearest',
      behavior: 'smooth',
    });
  });
});
