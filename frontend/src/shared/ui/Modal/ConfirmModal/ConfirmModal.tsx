import { Button } from '../../Button/index.ts';
import { BaseModal } from '../BaseModal/index.ts';
import './ConfirmModal.css';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      className="confirm-modal-overlay"
      containerClassName="confirm-modal-container"
    >
      <h3 class="confirm-modal-title">{title}</h3>
      <p class="confirm-modal-desc">{message}</p>
      <div class="confirm-modal-actions">
        <Button type="button" variant="secondary" size="md" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button type="button" variant="danger" size="md" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </BaseModal>
  );
}
