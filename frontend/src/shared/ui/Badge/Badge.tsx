import type { ComponentChildren, HTMLAttributes } from 'preact';
import './Badge.css';

export type BadgeVariant = 'default' | 'outline' | 'solid' | 'danger' | 'success';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ComponentChildren;
  className?: string;
  title?: string | undefined;
}

export function Badge({
  variant = 'default',
  size = 'sm',
  className = '',
  children,
  ...props
}: BadgeProps) {
  const classes = ['app-badge', `app-badge--${variant}`, `app-badge--${size}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <span {...props} class={classes}>
      {children}
    </span>
  );
}
