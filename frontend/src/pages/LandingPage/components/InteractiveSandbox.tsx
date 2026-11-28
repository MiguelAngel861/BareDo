import type { JSX } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Badge, Button, CloseIcon, TagChip } from '@/shared/ui/index.ts';

export interface DemoTask {
  id: number;
  title: string;
  priority: 'URGENT' | 'HIGH' | 'NORMAL';
  tag: string;
  completed: boolean;
}

const INITIAL_TASKS: DemoTask[] = [
  {
    id: 1,
    title: 'Refactor auth middleware',
    priority: 'HIGH',
    tag: 'backend',
    completed: false,
  },
  {
    id: 2,
    title: 'Review optimistic rollback PR',
    priority: 'NORMAL',
    tag: 'core',
    completed: false,
  },
  {
    id: 3,
    title: 'Ship keyboard shortcuts guide',
    priority: 'URGENT',
    tag: 'docs',
    completed: true,
  },
];

export function InteractiveSandbox(): JSX.Element {
  const [tasks, setTasks] = useState<DemoTask[]>(INITIAL_TASKS);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [draftTitle, setDraftTitle] = useState<string>('');
  const nextIdRef = useRef<number>(INITIAL_TASKS.length + 1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreating) {
      inputRef.current?.focus();
    }
  }, [isCreating]);

  const toggleTask = useCallback((index: number) => {
    setTasks((prev) =>
      prev.map((task, i) => (i === index ? { ...task, completed: !task.completed } : task))
    );
  }, []);

  const deleteTask = useCallback((index: number) => {
    setTasks((prev) => {
      const next = prev.filter((_, i) => i !== index);
      setSelectedIndex((curr) => {
        if (next.length === 0) {
          return 0;
        }
        if (index < curr) {
          return curr - 1;
        }
        return Math.min(curr, next.length - 1);
      });
      return next;
    });
  }, []);

  const openCreate = useCallback(() => {
    setIsCreating(true);
  }, []);

  const closeCreate = useCallback(() => {
    setIsCreating(false);
    setDraftTitle('');
    containerRef.current?.focus();
  }, []);

  const handleCreateSubmit = (e: Event) => {
    e.preventDefault();
    const title = draftTitle.trim();
    if (!title) {
      closeCreate();
      return;
    }

    const newTask: DemoTask = {
      id: nextIdRef.current++,
      title,
      priority: 'NORMAL',
      tag: 'inbox',
      completed: false,
    };

    setTasks((prev) => {
      const next = [...prev, newTask];
      setSelectedIndex(next.length - 1);
      return next;
    });
    setDraftTitle('');
    setIsCreating(false);
    containerRef.current?.focus();
  };

  const restoreDemo = () => {
    setTasks(INITIAL_TASKS);
    setSelectedIndex(0);
    setIsCreating(false);
    setDraftTitle('');
    containerRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null;
    if (target?.tagName.toLowerCase() === 'input') {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeCreate();
      }
      return;
    }

    const key = e.key.toLowerCase();

    if (key === 'c') {
      e.preventDefault();
      openCreate();
      return;
    }

    if (tasks.length === 0) {
      return;
    }

    if (key === 'j' || e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % tasks.length);
    } else if (key === 'k' || e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + tasks.length) % tasks.length);
    } else if (key === 'x' || e.key === ' ') {
      e.preventDefault();
      toggleTask(selectedIndex);
    } else if (key === 'd' || e.key === 'Delete') {
      e.preventDefault();
      deleteTask(selectedIndex);
    }
  };

  return (
    <div
      ref={containerRef}
      class="sandbox-container"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="Interactive BareDo Task Demo"
    >
      <div class="sandbox-header">
        <div class="sandbox-title-group">
          <span class="sandbox-title">TASKS</span>
          <span class="sandbox-count" aria-live="polite">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => (isCreating ? closeCreate() : openCreate())}
        >
          {isCreating ? 'CANCEL' : '+ NEW TASK'}
        </Button>
      </div>

      {isCreating && (
        <form class="sandbox-create-form" onSubmit={handleCreateSubmit}>
          <input
            ref={inputRef}
            type="text"
            class="sandbox-create-input"
            value={draftTitle}
            onInput={(e) => setDraftTitle((e.target as HTMLInputElement).value)}
            placeholder="Write a task and press Enter..."
            aria-label="New task title"
            maxLength={80}
          />
          <Button type="submit" variant="primary" size="sm">
            ADD
          </Button>
        </form>
      )}

      {tasks.length === 0 ? (
        <div class="sandbox-empty">
          <p class="sandbox-empty-title">NO TASKS PENDING</p>
          <p class="sandbox-empty-desc">Press C to add a task or restore the sample list.</p>
          <Button type="button" variant="secondary" size="sm" onClick={restoreDemo}>
            RESTORE SAMPLE
          </Button>
        </div>
      ) : (
        <ul class="sandbox-task-list">
          {tasks.map((task, idx) => {
            const isSelected = idx === selectedIndex;
            const priorityVariant =
              task.priority === 'URGENT'
                ? 'danger'
                : task.priority === 'HIGH'
                  ? 'solid'
                  : 'outline';

            return (
              <li
                key={task.id}
                class={`sandbox-task-row ${isSelected ? 'is-selected' : ''} ${task.completed ? 'is-completed' : ''}`}
                onClick={() => {
                  setSelectedIndex(idx);
                  toggleTask(idx);
                }}
              >
                <div class="sandbox-row-content">
                  <span class="sandbox-task-title">{task.title}</span>
                  <div class="sandbox-row-meta">
                    <TagChip name={task.tag} variant="subtle" size="sm" />
                    <Badge variant={priorityVariant} size="sm">
                      {task.priority}
                    </Badge>
                    <Badge variant={task.completed ? 'success' : 'default'} size="sm">
                      {task.completed ? 'Completed' : 'Pending'}
                    </Badge>
                  </div>
                </div>

                <button
                  type="button"
                  class="sandbox-delete-btn"
                  aria-label={`Delete ${task.title}`}
                  title="Delete task [D]"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(idx);
                  }}
                >
                  <CloseIcon size={12} strokeWidth={2.25} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div class="sandbox-footer">
        <span class="sandbox-hint">
          <kbd class="sandbox-key">J/K</kbd> move
        </span>
        <span class="sandbox-hint">
          <kbd class="sandbox-key">SPACE</kbd> toggle
        </span>
        <span class="sandbox-hint">
          <kbd class="sandbox-key">C</kbd> new
        </span>
        <span class="sandbox-hint">
          <kbd class="sandbox-key">D</kbd> delete
        </span>
      </div>
    </div>
  );
}
