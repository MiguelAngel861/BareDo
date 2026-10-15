import { Button } from '@/shared/ui/index.ts';
import { changePage, paginationSignal } from '../../tasks.state.ts';
import './TaskPagination.css';

export function TaskPagination() {
  const meta = paginationSignal.value;

  if (meta.total_pages <= 1 && meta.total_items <= meta.per_page) {
    return null;
  }

  return (
    <nav id="pagination" class="pagination" aria-label="Pagination">
      <Button
        type="button"
        id="prev-page"
        variant="secondary"
        size="sm"
        disabled={!meta.has_prev}
        onClick={() => changePage(meta.page - 1)}
      >
        Previous
      </Button>

      <span id="page-indicator">
        Page {meta.page} of {meta.total_pages || 1}
      </span>

      <Button
        type="button"
        id="next-page"
        variant="secondary"
        size="sm"
        disabled={!meta.has_next}
        onClick={() => changePage(meta.page + 1)}
      >
        Next
      </Button>
    </nav>
  );
}
