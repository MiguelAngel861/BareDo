import { signal } from '@preact/signals';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

export const toastsSignal = signal<ToastItem[]>([]);

export function showToast(
  messageOrContainer: string | HTMLElement,
  typeOrMessage?: ToastType | string,
  durationOrType?: number | string
): void {
  let message: string;
  let type: ToastType = 'info';
  let duration = 4000;

  if (typeof messageOrContainer === 'string') {
    message = messageOrContainer;
    if (
      typeof typeOrMessage === 'string' &&
      (typeOrMessage === 'success' || typeOrMessage === 'error' || typeOrMessage === 'info')
    ) {
      type = typeOrMessage;
    }
    if (typeof durationOrType === 'number') {
      duration = durationOrType;
    }
  } else {
    // Compatibilidad transitoria con firma vieja: showToast(container, message, type)
    message = typeof typeOrMessage === 'string' ? typeOrMessage : '';
    if (
      typeof durationOrType === 'string' &&
      (durationOrType === 'success' || durationOrType === 'error' || durationOrType === 'info')
    ) {
      type = durationOrType;
    }
  }

  const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const item: ToastItem = { id, message, type };

  toastsSignal.value = [...toastsSignal.value, item];

  setTimeout(() => {
    removeToast(id);
  }, duration);
}

export function flushPendingToasts(_container?: HTMLElement): void {
  // Transitorio: vaciar pendientes
}

export function removeToast(id: string): void {
  toastsSignal.value = toastsSignal.value.filter((t) => t.id !== id);
}

export function ToastContainer() {
  if (toastsSignal.value.length === 0) {
    return <div id="toast-container" aria-live="polite" aria-atomic="true" />;
  }

  return (
    <div id="toast-container" aria-live="polite" aria-atomic="true">
      {toastsSignal.value.map((toast) => (
        <div
          key={toast.id}
          class={`toast ${toast.type}`}
          role="status"
          tabIndex={0}
          onClick={() => removeToast(toast.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              removeToast(toast.id);
            }
          }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
