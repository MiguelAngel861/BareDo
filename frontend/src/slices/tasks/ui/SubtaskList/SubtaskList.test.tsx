import { fireEvent, render, screen } from '@testing-library/preact';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as taskState from '../../tasks.state.ts';
import type { Subtask } from '../../tasks.types.ts';
import { SubtaskList } from './SubtaskList.tsx';

describe('SubtaskList component', () => {
  const mockSubtasks: Subtask[] = [
    {
      subtask_id: '1',
      task_id: '100',
      title: 'First item',
      completed: false,
      created_at: '2026-10-13T10:00:00Z',
    },
    {
      subtask_id: '2',
      task_id: '100',
      title: 'Second item',
      completed: true,
      created_at: '2026-10-13T10:05:00Z',
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders subtask list with counter and items correctly', () => {
    render(<SubtaskList taskId="100" subtasks={mockSubtasks} />);

    expect(screen.getByText('First item')).toBeInTheDocument();
    expect(screen.getByText('Second item')).toBeInTheDocument();
    expect(screen.getByText(/\[1\/2\] 50%/)).toBeInTheDocument();
  });

  it('calls toggleSubtaskAction when a checkbox is changed', () => {
    const toggleSpy = vi.spyOn(taskState, 'toggleSubtaskAction').mockResolvedValue();
    render(<SubtaskList taskId="100" subtasks={mockSubtasks} />);

    const [firstCheckbox] = screen.getAllByRole('checkbox');
    expect(firstCheckbox).toBeDefined();
    if (firstCheckbox) {
      fireEvent.click(firstCheckbox);
    }

    expect(toggleSpy).toHaveBeenCalledWith('100', mockSubtasks[0]);
  });

  it('calls deleteSubtaskAction when delete button is clicked', () => {
    const deleteSpy = vi.spyOn(taskState, 'deleteSubtaskAction').mockResolvedValue();
    render(<SubtaskList taskId="100" subtasks={mockSubtasks} />);

    const [firstDeleteBtn] = screen.getAllByTitle('Delete subtask');
    expect(firstDeleteBtn).toBeDefined();
    if (firstDeleteBtn) {
      fireEvent.click(firstDeleteBtn);
    }

    expect(deleteSpy).toHaveBeenCalledWith('100', '1');
  });

  it('calls addSubtaskAction when input is submitted with text', async () => {
    const addSpy = vi.spyOn(taskState, 'addSubtaskAction').mockResolvedValue({
      subtask_id: '3',
      task_id: '100',
      title: 'New step',
      completed: false,
      created_at: '2026-10-13T10:10:00Z',
    });

    render(<SubtaskList taskId="100" subtasks={mockSubtasks} />);

    const input = screen.getByLabelText(/new subtask title/i);
    fireEvent.input(input, { target: { value: 'New step' } });

    const addBtn = screen.getByRole('button', { name: /^add$/i });
    fireEvent.click(addBtn);

    expect(addSpy).toHaveBeenCalledWith('100', 'New step');
  });
});
