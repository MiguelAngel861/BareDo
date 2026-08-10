import { showModal } from '@/shared/ui/Modal/index.ts';
import { showToast } from '@/shared/ui/Toast/index.ts';
import { SafeRenderer, clearChildren } from '@/shared/utils/dom-utils.ts';
import { tasksApi } from '../api.ts';
import type { Task } from '../types.ts';

class CustomDropdown {
  private readonly element: HTMLElement;
  private readonly trigger: HTMLElement | null;
  private readonly options: NodeListOf<Element>;
  private value: string;
  private readonly onSelect: (value: string) => void;

  constructor(element: HTMLElement, onSelect: (value: string) => void) {
    this.element = element;
    this.trigger = element.querySelector('.dropdown-trigger');
    this.options = element.querySelectorAll('.dropdown-option');
    this.value = element.dataset.value || '';
    this.onSelect = onSelect;

    this.init();
  }

  init(): void {
    this.trigger?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    for (const option of this.options) {
      option.addEventListener('click', (e) => {
        e.stopPropagation();
        this.select(option as HTMLElement);
      });
    }

    this.element.addEventListener('keydown', (e) => this.handleKeyboard(e as KeyboardEvent));

    document.addEventListener('click', () => this.close());
  }

  toggle(): void {
    const isExpanded = this.element.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    this.element.setAttribute('aria-expanded', 'true');
  }

  close(): void {
    this.element.setAttribute('aria-expanded', 'false');
  }

  select(option: HTMLElement): void {
    for (const opt of this.options) {
      opt.classList.remove('selected');
      opt.setAttribute('aria-selected', 'false');
    }

    option.classList.add('selected');
    option.setAttribute('aria-selected', 'true');

    const valueEl = this.trigger?.querySelector('.dropdown-value');
    if (valueEl) {
      valueEl.textContent = option.textContent;
    }

    this.value = option.dataset.value || '';
    this.element.dataset.value = this.value;

    this.close();

    if (this.onSelect) {
      this.onSelect(this.value);
    }
  }

  handleKeyboard(e: KeyboardEvent): void {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        this.toggle();
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (this.element.getAttribute('aria-expanded') === 'false') {
          this.open();
        } else {
          this.focusNextOption();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.focusPrevOption();
        break;
      case 'Escape':
        this.close();
        this.trigger?.focus();
        break;
    }
  }

  focusNextOption(): void {
    const options = Array.from(this.options);
    const currentIndex = options.findIndex((opt) => opt === document.activeElement);
    const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
    (options[nextIndex] as HTMLElement).focus();
  }

  focusPrevOption(): void {
    const options = Array.from(this.options);
    const currentIndex = options.findIndex((opt) => opt === document.activeElement);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
    (options[prevIndex] as HTMLElement).focus();
  }
}

interface TaskListElements {
  list: HTMLElement | null;
  emptyMsg: HTMLElement | null;
  prevBtn: HTMLButtonElement | null;
  nextBtn: HTMLButtonElement | null;
  pageIndicator: HTMLElement | null;
  searchInput: HTMLInputElement | null;
  filterSelect: HTMLElement | null;
}

interface Filters {
  page: number;
  per_page: number;
  title?: string;
  completed?: boolean;
}

export class TaskList {
  private readonly service = tasksApi;
  private readonly toastContainer: HTMLElement;
  private readonly onEdit: (task: Task) => void;
  private currentPage = 1;
  private readonly perPage = 5;
  private filters: Filters = { page: 1, per_page: 5, title: '', completed: false };
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly elements: TaskListElements;

  constructor(toastContainer: HTMLElement, onEdit: (task: Task) => void) {
    this.toastContainer = toastContainer;
    this.onEdit = onEdit;

    this.elements = {
      list: document.getElementById('task-list'),
      emptyMsg: document.getElementById('empty-message'),
      prevBtn: document.getElementById('prev-page') as HTMLButtonElement | null,
      nextBtn: document.getElementById('next-page') as HTMLButtonElement | null,
      pageIndicator: document.getElementById('page-indicator'),
      searchInput: document.getElementById('search-title') as HTMLInputElement | null,
      filterSelect: document.getElementById('filter-completed'),
    };

    this.elements.prevBtn?.addEventListener('click', () => this.changePage(this.currentPage - 1));
    this.elements.nextBtn?.addEventListener('click', () => this.changePage(this.currentPage + 1));
    this.elements.searchInput?.addEventListener('input', (e) =>
      this.debounceSearch((e.target as HTMLInputElement).value)
    );

    new CustomDropdown(this.elements.filterSelect as HTMLElement, (value) => {
      this.setFilter('completed', value);
    });
  }

  debounceSearch(value: string): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => this.setFilter('title', value), 300);
  }

  setFilter(key: keyof Filters, value: string | boolean): void {
    if (key === 'page' || key === 'per_page') {
      this.filters[key] = Number(value);
    } else if (key === 'title') {
      this.filters.title = value as string;
    } else if (key === 'completed') {
      if (value === '' || value === undefined) {
        this.filters.completed = undefined;
      } else {
        this.filters.completed = value === 'true';
      }
    }
    this.currentPage = 1;
    this.load();
  }

  async load(): Promise<void> {
    this.renderSkeletons();
    try {
      const data = await this.service.list({
        page: this.currentPage,
        per_page: this.perPage,
        title: this.filters.title,
        completed: this.filters.completed,
      });
      if (!data) {
        return;
      }
      this.renderList(data.tasks);
      this.updatePagination(data.meta);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load tasks';
      showToast(this.toastContainer, `Failed to load tasks: ${message}`, 'error');
    }
  }

  async loadRetry(): Promise<void> {
    try {
      const data = await this.service.list({
        page: this.currentPage,
        per_page: this.perPage,
        title: this.filters.title,
        completed: this.filters.completed,
      });
      if (!data) {
        return;
      }
      this.renderList(data.tasks);
      this.updatePagination(data.meta);
    } catch {
      // silently ignore - edit was already saved
    }
  }

  renderSkeletons(): void {
    if (!this.elements.list) {
      return;
    }
    clearChildren(this.elements.list);
    this.elements.emptyMsg?.classList.add('hidden');
    for (let i = 0; i < 3; i++) {
      const li = SafeRenderer.createElement('li', { className: 'task-skeleton' });
      li.appendChild(
        SafeRenderer.createElement('div', { className: 'skeleton-line skeleton-title' })
      );
      li.appendChild(
        SafeRenderer.createElement('div', { className: 'skeleton-line skeleton-desc' })
      );
      li.appendChild(
        SafeRenderer.createElement('div', { className: 'skeleton-line skeleton-meta' })
      );
      this.elements.list.appendChild(li);
    }
  }

  renderList(tasks: Task[]): void {
    if (!this.elements.list) {
      return;
    }
    clearChildren(this.elements.list);
    if (tasks.length === 0) {
      this.elements.emptyMsg?.classList.remove('hidden');
      return;
    }
    this.elements.emptyMsg?.classList.add('hidden');
    for (const task of tasks) {
      this.elements.list.appendChild(this.buildTaskElement(task));
    }
  }

  buildTaskElement(task: Task): HTMLElement {
    const li = SafeRenderer.createElement('li', { className: 'task-item' });
    const content = SafeRenderer.createElement('div', { className: 'task-content' });

    content.appendChild(
      SafeRenderer.createElement('div', {
        className: `task-title${task.completed ? ' completed' : ''}`,
        textContent: task.title,
      })
    );

    if (task.description) {
      content.appendChild(
        SafeRenderer.createElement('div', {
          className: 'task-description',
          textContent: task.description,
        })
      );
    }

    const meta = SafeRenderer.createElement('div', { className: 'task-meta' });
    if (task.due_date) {
      meta.appendChild(
        SafeRenderer.createElement('span', {
          className: 'task-due-date',
          textContent: `Due: ${task.due_date.substring(0, 10)}`,
        })
      );
    }
    meta.appendChild(
      SafeRenderer.createElement('span', {
        textContent: task.completed ? 'Completed' : 'Pending',
      })
    );
    content.appendChild(meta);
    li.appendChild(content);

    const actions = SafeRenderer.createElement('div', { className: 'task-actions' });

    const editBtn = SafeRenderer.createElement('button', {
      type: 'button',
      className: 'secondary',
      textContent: 'Edit',
    });
    editBtn.addEventListener('click', () => this.onEdit(task));
    actions.appendChild(editBtn);

    const toggleBtn = SafeRenderer.createElement('button', {
      type: 'button',
      textContent: task.completed ? 'Mark Pending' : 'Mark Complete',
    });
    toggleBtn.addEventListener('click', () => this.toggleComplete(task));
    actions.appendChild(toggleBtn);

    const deleteBtn = SafeRenderer.createElement('button', {
      type: 'button',
      className: 'danger',
      textContent: 'Delete',
    });
    deleteBtn.addEventListener('click', () => this.confirmDelete(task));
    actions.appendChild(deleteBtn);

    li.appendChild(actions);
    return li;
  }

  updatePagination(meta: {
    page: number;
    total_pages: number;
    total_items?: number;
    has_prev: boolean;
    has_next: boolean;
  }): void {
    this.currentPage = meta.page;
    if (this.elements.pageIndicator) {
      this.elements.pageIndicator.textContent = `Page ${meta.page} of ${meta.total_pages || 1}`;
    }
    const countEl = document.getElementById('task-count');
    if (countEl) {
      const total = meta.total_items ?? 0;
      countEl.textContent = `${total} task${total !== 1 ? 's' : ''}`;
    }
    if (this.elements.prevBtn) {
      this.elements.prevBtn.disabled = !meta.has_prev;
    }
    if (this.elements.nextBtn) {
      this.elements.nextBtn.disabled = !meta.has_next;
    }
  }

  changePage(page: number): void {
    if (page < 1) {
      return;
    }
    this.currentPage = page;
    this.load();
  }

  async toggleComplete(task: Task): Promise<void> {
    try {
      await this.service.update(task.task_id, {
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        due_date: task.due_date,
        completed: !task.completed,
      });
      showToast(
        this.toastContainer,
        task.completed ? 'Task marked as pending' : 'Task marked as complete',
        'success'
      );
      this.load();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update task';
      showToast(this.toastContainer, `Failed to update task: ${message}`, 'error');
    }
  }

  confirmDelete(task: Task): void {
    showModal({
      title: 'Delete task',
      message: `Are you sure you want to delete \"${task.title}\"? This action cannot be undone.`,
      confirmText: 'Delete',
      onConfirm: () => this.deleteTask(task.task_id),
    });
  }

  async deleteTask(id: string): Promise<void> {
    try {
      await this.service.delete(id);
      showToast(this.toastContainer, 'Task deleted successfully', 'success');
      this.load();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete task';
      showToast(this.toastContainer, `Failed to delete task: ${message}`, 'error');
    }
  }
}
