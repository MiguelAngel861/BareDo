import type { ComponentChildren } from 'preact';
import './AuthCard.css';

export interface AuthCardProps {
  title: string;
  footer?: ComponentChildren;
  children: ComponentChildren;
}

export function AuthCard({ title, footer, children }: AuthCardProps) {
  return (
    <div class="auth-page">
      <div class="auth-container">
        <h1>{title}</h1>
        {children}
        {footer && <div class="switch-link">{footer}</div>}
      </div>
    </div>
  );
}
