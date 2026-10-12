import type { ButtonHTMLAttributes, ComponentChildren } from 'preact';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  children: ComponentChildren;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  class: className = '',
  children,
  ...props
}: ButtonProps) {
  const classes = [
    'app-btn',
    `app-btn--${variant}`,
    `app-btn--${size}`,
    fullWidth ? 'app-btn--full-width' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      class={classes}
      aria-busy={isLoading ? 'true' : undefined}
    >
      {children}
    </button>
  );
}
