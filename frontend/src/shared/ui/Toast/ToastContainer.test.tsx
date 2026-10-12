import { act, fireEvent, render, screen } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { ToastContainer, showToast, toastsSignal } from './ToastContainer.tsx';

describe('ToastContainer component', () => {
  it('renders nothing by default when no toasts exist', () => {
    toastsSignal.value = [];
    const { container } = render(<ToastContainer />);
    const toastBox = container.querySelector('#toast-container');
    expect(toastBox).toBeInTheDocument();
    expect(toastBox).toBeEmptyDOMElement();
  });

  it('renders a toast when showToast is called', () => {
    toastsSignal.value = [];
    render(<ToastContainer />);

    act(() => {
      showToast('Operation successful', 'success');
    });

    expect(screen.getByText('Operation successful')).toBeInTheDocument();
  });

  it('removes toast when clicked', () => {
    toastsSignal.value = [];
    render(<ToastContainer />);

    act(() => {
      showToast('Click to close', 'info');
    });

    const toastItem = screen.getByText('Click to close');
    fireEvent.click(toastItem);

    expect(screen.queryByText('Click to close')).not.toBeInTheDocument();
  });
});
