import { Badge, Button, Checkbox, TagChip } from '@/shared/ui/index.ts';
import type { JSX } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';

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
    title: 'Refactor auth middleware to zero-allocation pipeline',
    priority: 'HIGH',
    tag: 'backend',
    completed: false,
  },
  {
    id: 2,
    title: 'Review pull request: optimistic rollback engine',
    priority: 'NORMAL',
    tag: 'core',
    completed: false,
  },
  {
    id: 3,
    title: 'Tune Vim navigation latency to 0ms',
    priority: 'URGENT',
    tag: 'frontend',
    completed: true,
  },
];

export function InteractiveSandbox(): JSX.Element {
  const [tasks, setTasks] = useState<DemoTask[]>(INITIAL_TASKS);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [lastAction, setLastAction] = useState<string>('QUEUE_READY');
  const [latency, setLatency] = useState<string>('0.12');
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const triggerFeedback = useCallback((actionLog: string, t0: number) => {
    const elapsed = Math.max(0.08, performance.now() - t0).toFixed(2);
    setLatency(elapsed);
    setLastAction(actionLog);
  }, []);

  const toggleTask = useCallback(
    (index: number) => {
      const t0 = performance.now();
      setTasks((prev) => {
        const target = prev[index];
        const next = prev.map((t, i) => (i === index ? { ...t, completed: !t.completed } : t));
        if (target) {
          triggerFeedback(
            `COMMIT [${target.completed ? 'REOPENED' : 'CLEARED'}] // TASK_0${index + 1}`,
            t0
          );
        }
        return next;
      });
    },
    [triggerFeedback]
  );

  const moveNext = useCallback(() => {
    const t0 = performance.now();
    setSelectedIndex((prev) => {
      const next = (prev + 1) % tasks.length;
      triggerFeedback(`FOCUS TASK_0${next + 1}`, t0);
      return next;
    });
  }, [tasks.length, triggerFeedback]);

  const movePrev = useCallback(() => {
    const t0 = performance.now();
    setSelectedIndex((prev) => {
      const next = (prev - 1 + tasks.length) % tasks.length;
      triggerFeedback(`FOCUS TASK_0${next + 1}`, t0);
      return next;
    });
  }, [tasks.length, triggerFeedback]);

  const resetDemo = () => {
    const t0 = performance.now();
    setTasks(INITIAL_TASKS);
    setSelectedIndex(0);
    setIsAutoPlaying(false);
    triggerFeedback('QUEUE_RESTORED', t0);
  };

  const addQuickTask = () => {
    const t0 = performance.now();
    const nextId = tasks.length + 1;
    const newTask: DemoTask = {
      id: nextId,
      title: `Ship hotfix release v1.0.${nextId}`,
      priority: 'HIGH',
      tag: 'release',
      completed: false,
    };
    setTasks((prev) => [...prev, newTask]);
    setSelectedIndex(tasks.length);
    triggerFeedback(`APPENDED TASK_0${nextId}`, t0);
  };

  // Keyboard handler when sandbox container is focused
  const handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();

    if (key === 'j' || e.key === 'ArrowDown') {
      e.preventDefault();
      moveNext();
    } else if (key === 'k' || e.key === 'ArrowUp') {
      e.preventDefault();
      movePrev();
    } else if (key === 'x' || e.key === ' ') {
      e.preventDefault();
      toggleTask(selectedIndex);
    } else if (key === 'c') {
      e.preventDefault();
      addQuickTask();
    } else if (key === 'r') {
      e.preventDefault();
      resetDemo();
    }
  };

  // Auto-play simulation loop for mobile / observers
  useEffect(() => {
    if (!isAutoPlaying) {
      return;
    }

    let step = 0;
    const interval = setInterval(() => {
      step = (step + 1) % 6;
      if (step === 1 || step === 3) {
        moveNext();
      } else if (step === 2) {
        toggleTask(selectedIndex);
      } else if (step === 4) {
        movePrev();
      } else if (step === 5) {
        toggleTask(0);
      }
    }, 700);

    return () => clearInterval(interval);
  }, [isAutoPlaying, selectedIndex, moveNext, movePrev, toggleTask]);

  return (
    <div
      ref={containerRef}
      class="sandbox-container"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="Interactive Vim Keyboard Sandbox"
    >
      <div class="sandbox-header">
        <div class="sandbox-title-group">
          <span class="sandbox-signal-dot" aria-hidden="true" />
          <span class="sandbox-title">{'QUEUE // HOME_ROW_ACTIVE'}</span>
        </div>
        <div class="sandbox-actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            aria-pressed={isAutoPlaying}
          >
            {isAutoPlaying ? 'PAUSE' : 'SIMULATE'}
          </Button>
          <Button variant="ghost" size="sm" onClick={resetDemo} title="Reset sandbox">
            RESET [R]
          </Button>
        </div>
      </div>

      <ul class="sandbox-task-list">
        {tasks.map((task, idx) => {
          const isSelected = idx === selectedIndex;
          const priorityVariant =
            task.priority === 'URGENT' ? 'danger' : task.priority === 'HIGH' ? 'solid' : 'outline';

          return (
            <li
              key={task.id}
              class={`sandbox-task-row ${isSelected ? 'is-selected' : ''} ${task.completed ? 'is-completed' : ''}`}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (!target.closest('.app-checkbox')) {
                  setSelectedIndex(idx);
                  toggleTask(idx);
                }
              }}
            >
              <div class="sandbox-row-left">
                <Checkbox
                  checked={task.completed}
                  onChange={(_checked, ev) => {
                    ev.stopPropagation();
                    setSelectedIndex(idx);
                    toggleTask(idx);
                  }}
                  ariaLabel={task.title}
                />
                <span class="sandbox-task-title">{task.title}</span>
              </div>

              <div class="sandbox-row-meta">
                <TagChip name={task.tag} size="sm" />
                <Badge variant={priorityVariant} size="sm">
                  {task.priority}
                </Badge>
              </div>
            </li>
          );
        })}
      </ul>

      <div class="sandbox-footer">
        <div class="sandbox-hud">
          <span class="sandbox-hud-key">[J / K] NAV</span>
          <span class="sandbox-hud-sep">&middot;</span>
          <span class="sandbox-hud-key">[SPACE] COMMIT</span>
          <span class="sandbox-hud-sep">&middot;</span>
          <span class="sandbox-hud-key">[C] NEW</span>
        </div>

        <div class="sandbox-telemetry" aria-label="System Performance Readout">
          <span class="sandbox-telemetry-item">
            LATENCY: <strong class="telemetry-value">{latency}ms</strong>
          </span>
          <span class="sandbox-telemetry-sep">&middot;</span>
          <span class="sandbox-telemetry-item">0MS_OPTIMISTIC</span>
          <span class="sandbox-telemetry-sep">&middot;</span>
          <span class="sandbox-log-text">{lastAction}</span>
        </div>
      </div>
    </div>
  );
}
