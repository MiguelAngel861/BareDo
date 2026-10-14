import { fireEvent, render, screen } from '@testing-library/preact';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BaseModal } from './BaseModal.tsx';

describe('BaseModal', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
  });
  it('does not render when isOpen is false', () => {
    render(
      <BaseModal isOpen={false} onClose={vi.fn()} title="Test Base Modal">
        <p>Base modal content</p>
      </BaseModal>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders content when open and sets aria-label', () => {
    render(
      <BaseModal isOpen={true} onClose={vi.fn()} title="Test Base Modal">
        <p>Base modal content</p>
      </BaseModal>
    );

    expect(screen.getByRole('dialog', { name: 'Test Base Modal' })).toBeInTheDocument();
    expect(screen.getByText('Base modal content')).toBeInTheDocument();
  });

  it('calls onClose when clicking overlay backdrop', () => {
    const handleClose = vi.fn();
    render(
      <BaseModal isOpen={true} onClose={handleClose} title="Backdrop Modal">
        <p>Inside content</p>
      </BaseModal>
    );

    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when clicking modal container content', () => {
    const handleClose = vi.fn();
    render(
      <BaseModal isOpen={true} onClose={handleClose} title="Content Modal">
        <p>Inside content</p>
      </BaseModal>
    );

    fireEvent.click(screen.getByText('Inside content'));
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('calls onClose when pressing Escape key', () => {
    const handleClose = vi.fn();
    render(
      <BaseModal isOpen={true} onClose={handleClose} title="Escape Modal">
        <p>Escape content</p>
      </BaseModal>
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('locks body scroll when open and restores it when closed', () => {
    document.body.style.overflow = '';
    const { unmount } = render(
      <BaseModal isOpen={true} onClose={vi.fn()} title="Scroll Lock Modal">
        <p>Scroll content</p>
      </BaseModal>
    );

    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
