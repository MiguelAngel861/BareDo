import type { ComponentChildren } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import './BaseModal.css';

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  ariaLabel?: string;
  className?: string;
  containerClassName?: string;
  children: ComponentChildren;
}

export function BaseModal({
  isOpen,
  onClose,
  title,
  ariaLabel,
  className = '',
  containerClassName = '',
  children,
}: BaseModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const label = ariaLabel || title;

  return (
    <div
      class={`modal-overlay ${className}`.trim()}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div class={`modal-container ${containerClassName}`.trim()} ref={containerRef}>
        {children}
      </div>
    </div>
  );
}
