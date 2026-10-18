import { signal } from '@preact/signals';
import type { ToastVariant } from './Toast.tsx';

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
