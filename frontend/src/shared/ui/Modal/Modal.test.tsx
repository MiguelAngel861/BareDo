import { fireEvent, render, screen } from '@testing-library/preact';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmModal, PopoutModal } from './Modal.tsx';

describe('Modal components', () => {
  describe('PopoutModal', () => {
    it('does not render when isOpen is false', () => {
      render(
        <PopoutModal isOpen={false} onClose={vi.fn()} title="Test Modal">
          <p>Modal content</p>
        </PopoutModal>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders content when open and closes on close button click', () => {
      const handleClose = vi.fn();
      render(
        <PopoutModal isOpen={true} onClose={handleClose} title="Test Modal">
          <p>Modal content</p>
        </PopoutModal>
      );

      expect(screen.getByRole('dialog', { name: 'Test Modal' })).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();

      const closeBtn = screen.getByRole('button', { name: /cerrar modal/i });
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('closes on Escape key press', () => {
      const handleClose = vi.fn();
      render(
        <PopoutModal isOpen={true} onClose={handleClose} title="Escape Modal">
          <p>Content</p>
        </PopoutModal>
      );

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('ConfirmModal', () => {
    it('handles confirm and cancel actions', () => {
      const handleConfirm = vi.fn();
      const handleCancel = vi.fn();

      render(
        <ConfirmModal
          isOpen={true}
          title="Delete Item"
          message="Are you sure?"
          confirmLabel="Yes, delete"
          cancelLabel="No, cancel"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      );

      expect(screen.getByText('Delete Item')).toBeInTheDocument();
      expect(screen.getByText('Are you sure?')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'No, cancel' }));
      expect(handleCancel).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: 'Yes, delete' }));
      expect(handleConfirm).toHaveBeenCalledTimes(1);
    });
  });
});
