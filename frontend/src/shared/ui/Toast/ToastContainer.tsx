import { signal } from '@preact/signals';
import { Toast, type ToastVariant } from './Toast.tsx';
import './Toast.css';

export type ToastType = ToastVariant;

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

export const toastsSignal = signal<ToastItem[]>([]);

export function showToast(message: string, type: ToastType = 'info', duration = 4000): void {
  const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const item: ToastItem = { id, message, type };

  toastsSignal.value = [...toastsSignal.value, item];

  setTimeout(() => {
    removeToast(id);
  }, duration);
}

export function removeToast(id: string): void {
  toastsSignal.value = toastsSignal.value.filter((t) => t.id !== id);
}

export function ToastContainer() {
  if (toastsSignal.value.length === 0) {
    return (
      <div id="toast-container" class="toast-container" aria-live="polite" aria-atomic="true" />
    );
  }

  return (
    <div id="toast-container" class="toast-container" aria-live="polite" aria-atomic="true">
      {toastsSignal.value.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          variant={toast.type}
          onClose={removeToast}
        />
      ))}
    </div>
  );
}
