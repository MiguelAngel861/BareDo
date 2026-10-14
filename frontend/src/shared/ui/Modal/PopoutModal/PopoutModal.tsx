import type { ComponentChildren } from 'preact';
import { Button } from '../../Button/index.ts';
import { BaseModal } from '../BaseModal/index.ts';
import './PopoutModal.css';

export interface PopoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ComponentChildren;
}

export function PopoutModal({ isOpen, onClose, title, children }: PopoutModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className="popout-overlay"
      containerClassName="popout-container"
    >
      <header class="popout-header">
        <h2>{title}</h2>
        <Button type="button" variant="ghost" size="sm" onClick={onClose} aria-label="Cerrar modal">
          ESC / CLOSE
        </Button>
      </header>
      {children}
    </BaseModal>
  );
}
