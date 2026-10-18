import { Toast } from './Toast.tsx';
import './Toast.css';
import { removeToast, toastsSignal } from './toast.state.ts';

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
