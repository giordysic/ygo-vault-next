import React from 'react';
import { Modal } from '../Modal';
import { Button } from '../Button';
import styles from './ConfirmDialog.module.css';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'default';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'default',
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <p className={styles.message}>{message}</p>
    </Modal>
  );
};
