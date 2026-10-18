import { act, fireEvent, render, screen } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { Toast } from './Toast.tsx';
import { ToastContainer } from './ToastContainer.tsx';
import { showToast, toastsSignal } from './toast.state.ts';

describe('Toast and ToastContainer components', () => {
  it('renders individual toast with proper variant class', () => {
    render(<Toast id="test-1" message="Task created" variant="success" onClose={() => {}} />);
    expect(screen.getByText('Task created')).toBeInTheDocument();

    const toastEl = screen.getByRole('status');
    expect(toastEl.className).toContain('toast--success');
  });

  it('renders error, info and warning variants properly', () => {
    const { rerender } = render(
      <Toast id="test-err" message="Error occurred" variant="error" onClose={() => {}} />
    );
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
    expect(screen.getByRole('status').className).toContain('toast--error');

    rerender(<Toast id="test-warn" message="Warning limit" variant="warning" onClose={() => {}} />);
    expect(screen.getByText('Warning limit')).toBeInTheDocument();
    expect(screen.getByRole('status').className).toContain('toast--warning');

    rerender(<Toast id="test-info" message="System note" variant="info" onClose={() => {}} />);
    expect(screen.getByText('System note')).toBeInTheDocument();
    expect(screen.getByRole('status').className).toContain('toast--info');
  });

  it('renders container empty by default when no toasts exist', () => {
    toastsSignal.value = [];
    const { container } = render(<ToastContainer />);
    const toastBox = container.querySelector('#toast-container');
    expect(toastBox).toBeInTheDocument();
    expect(toastBox).toBeEmptyDOMElement();
  });

  it('renders toast through showToast into ToastContainer', () => {
    toastsSignal.value = [];
    render(<ToastContainer />);

    act(() => {
      showToast('Operation successful', 'success');
    });

    expect(screen.getByText('Operation successful')).toBeInTheDocument();
  });

  it('removes toast when close button or toast card is clicked', () => {
    toastsSignal.value = [];
    render(<ToastContainer />);

    act(() => {
      showToast('Click to close', 'info');
    });

    const closeBtn = screen.getByRole('button', { name: /cerrar notificación/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByText('Click to close')).not.toBeInTheDocument();
  });
});
