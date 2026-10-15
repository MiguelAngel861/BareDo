import {
  prioritiesSignal,
  priorityDescriptionsSignal,
} from '@/slices/priorities/priorities.state.ts';
import { fireEvent, render, screen } from '@testing-library/preact';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PriorityDropdown } from './PriorityDropdown.tsx';

describe('PriorityDropdown component', () => {
  beforeEach(() => {
    prioritiesSignal.value = [
      { priority_id: 1, name: 'Urgent', level: 1, description: 'Urgent level' },
      { priority_id: 2, name: 'Normal', level: 2, description: 'Normal level' },
    ];
    priorityDescriptionsSignal.value = new Map([
      [1, 'Urgent level'],
      [2, 'Normal level'],
    ]);
  });

  it('renders options based on prioritiesSignal', () => {
    const handleChange = vi.fn();
    render(<PriorityDropdown value={undefined} onChange={handleChange} includeAllOption={true} />);

    expect(screen.getByRole('button', { name: /priority/i })).toBeInTheDocument();
  });

  it('displays helper text when a priority is selected', () => {
    render(<PriorityDropdown value={1} onChange={vi.fn()} showHelper={true} />);

    expect(screen.getByText('Urgent level')).toBeInTheDocument();
  });

  it('triggers onChange when selection changes', () => {
    const handleChange = vi.fn();
    render(<PriorityDropdown value={undefined} onChange={handleChange} />);

    const trigger = screen.getByRole('button', { name: /priority/i });
    fireEvent.click(trigger);

    const urgentOption = screen.getByText('Urgent');
    fireEvent.click(urgentOption);

    expect(handleChange).toHaveBeenCalledWith(1);
  });
});
