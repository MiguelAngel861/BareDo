import { CloseIcon } from '../CloseIcon/index.ts';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  message: string;
  variant?: ToastVariant;
  onClose: (id: string) => void;
}

export function Toast({ id, message, variant = 'info', onClose }: ToastProps) {
  return (
    <div
      class={`toast toast--${variant} ${variant}`}
      role="status"
      tabIndex={0}
      onClick={() => onClose(id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClose(id);
        }
      }}
    >
      <span class="toast-message">{message}</span>
      <button
        type="button"
        class="toast-close"
        aria-label="Cerrar notificación"
        onClick={(e) => {
          e.stopPropagation();
          onClose(id);
        }}
      >
        <CloseIcon size={14} strokeWidth={2.2} />
      </button>
    </div>
  );
}
