import type { ComponentChildren } from 'preact';
import './EmptyState.css';

export interface EmptyStateProps {
  id?: string;
  tag?: string;
  title: string;
  description?: string;
  action?: ComponentChildren;
  className?: string;
}

export function EmptyState({
  id,
  tag,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  const classes = ['app-empty-state', className].filter(Boolean).join(' ');

  return (
    <div id={id} class={classes} role="region" aria-label={title}>
      {tag && <span class="app-empty-state__tag">{tag}</span>}
      <h3 class="app-empty-state__title">{title}</h3>
      {description && <p class="app-empty-state__desc">{description}</p>}
      {action && <div class="app-empty-state__action">{action}</div>}
    </div>
  );
}
