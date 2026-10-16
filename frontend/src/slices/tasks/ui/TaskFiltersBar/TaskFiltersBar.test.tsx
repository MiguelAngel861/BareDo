import { fireEvent, render, screen } from '@testing-library/preact';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as taskState from '../../tasks.state.ts';
import { TaskFiltersBar } from './TaskFiltersBar.tsx';

describe('TaskFiltersBar component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    taskState.filtersSignal.value = {
      completed: undefined,
      priority_id: undefined,
      tag_ids: undefined,
      title: '',
    };
  });

  it('renders search bar and status, priority, and tag filter dropdowns', () => {
    render(<TaskFiltersBar />);

    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by status')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by tag')).toBeInTheDocument();
  });

  it('updates search query when input changes', () => {
    vi.useFakeTimers();
    const setSearchSpy = vi.spyOn(taskState, 'setSearch').mockImplementation(() => {});
    render(<TaskFiltersBar />);

    const searchInput = screen.getByRole('searchbox');
    fireEvent.input(searchInput, { target: { value: 'deploy' } });

    vi.advanceTimersByTime(350);
    expect(setSearchSpy).toHaveBeenCalledWith('deploy', true);
    vi.useRealTimers();
  });

  it('updates status filter when status dropdown changes', () => {
    const setFilterSpy = vi.spyOn(taskState, 'setFilter').mockImplementation(() => {});
    render(<TaskFiltersBar />);

    const statusDropdown = screen.getByLabelText('Filter by status');
    fireEvent.click(statusDropdown);

    const completedOption = screen.getByRole('option', { name: 'Completed' });
    fireEvent.click(completedOption);

    expect(setFilterSpy).toHaveBeenCalledWith('completed', true);
  });
});
