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
      containerClassName="confirm-modal-container modal"
    >
      <h3>{title}</h3>
      <p>{message}</p>
      <div class="modal-actions">
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
