import { changePage, paginationSignal } from '../tasks.state.ts';

export function TaskPagination() {
  const meta = paginationSignal.value;

  if (meta.total_pages <= 1 && meta.total_items <= meta.per_page) {
    return null;
  }

  return (
    <nav id="pagination" class="pagination" aria-label="Pagination">
      <button
        type="button"
        id="prev-page"
        disabled={!meta.has_prev}
        onClick={() => changePage(meta.page - 1)}
      >
        Previous
      </button>

      <span id="page-indicator">
        Page {meta.page} of {meta.total_pages || 1}
      </span>

      <button
        type="button"
        id="next-page"
        disabled={!meta.has_next}
        onClick={() => changePage(meta.page + 1)}
      >
        Next
      </button>
    </nav>
  );
}
