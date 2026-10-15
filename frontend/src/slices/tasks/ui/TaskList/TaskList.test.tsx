import { render, screen } from '@testing-library/preact';
import { beforeEach, describe, expect, it } from 'vitest';
import * as taskState from '../../tasks.state.ts';
import type { Task } from '../../tasks.types.ts';
import { TaskList } from './TaskList.tsx';

describe('TaskList component', () => {
  const mockTask1: Task = {
    task_id: '1',
    title: 'First task',
    description: 'First description',
    priority_id: 3,
    due_date: null,
    completed: false,
    created_at: '2026-10-10T00:00:00Z',
    updated_at: '2026-10-10T00:00:00Z',
    tags: [],
    subtasks: [],
  };

  const mockTask2: Task = {
    task_id: '2',
    title: 'Second task',
    description: 'Second description',
    priority_id: 5,
    due_date: null,
    completed: true,
    created_at: '2026-10-11T00:00:00Z',
    updated_at: '2026-10-11T00:00:00Z',
    tags: [],
    subtasks: [],
  };

  beforeEach(() => {
    taskState.tasksSignal.value = [];
    taskState.isLoadingTasksSignal.value = false;
  });

  it('renders loading skeleton cards when loading and no tasks', () => {
    taskState.isLoadingTasksSignal.value = true;
    const { container } = render(<TaskList />);

    expect(container.querySelectorAll('.skeleton-card')).toHaveLength(3);
  });

  it('renders empty state when no tasks are present and not loading', () => {
    render(<TaskList />);

    expect(screen.getByText('NO TASKS FOUND')).toBeInTheDocument();
    expect(screen.getByText('STATUS: 0 TASKS')).toBeInTheDocument();
  });

  it('renders task cards when tasks are present', () => {
    taskState.tasksSignal.value = [mockTask1, mockTask2];
    render(<TaskList />);

    expect(screen.getByText('First task')).toBeInTheDocument();
    expect(screen.getByText('Second task')).toBeInTheDocument();
  });
});
