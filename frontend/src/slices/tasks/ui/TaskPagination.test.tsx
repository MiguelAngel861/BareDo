import { fireEvent, render, screen } from '@testing-library/preact';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as taskState from '../tasks.state.ts';
import { TaskPagination } from './TaskPagination.tsx';

describe('TaskPagination component', () => {
  beforeEach(() => {
    taskState.paginationSignal.value = {
      page: 1,
      per_page: 10,
      total_items: 25,
      total_pages: 3,
      has_prev: false,
      has_next: true,
    };
  });

  it('does not render when total_pages <= 1 and items fit single page', () => {
    taskState.paginationSignal.value = {
      page: 1,
      per_page: 10,
      total_items: 5,
      total_pages: 1,
      has_prev: false,
      has_next: false,
    };

    render(<TaskPagination />);
    expect(screen.queryByRole('navigation', { name: /pagination/i })).not.toBeInTheDocument();
  });

  it('renders pagination controls and handles page navigation', () => {
    const changePageSpy = vi.spyOn(taskState, 'changePage').mockImplementation(() => {});

    render(<TaskPagination />);

    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    const prevBtn = screen.getByRole('button', { name: /previous/i });
    const nextBtn = screen.getByRole('button', { name: /next/i });

    expect(prevBtn).toBeDisabled();
    expect(nextBtn).not.toBeDisabled();

    fireEvent.click(nextBtn);
    expect(changePageSpy).toHaveBeenCalledWith(2);

    changePageSpy.mockRestore();
  });
});
