// ============================================================
// ConfirmDialog — Aero popup pattern (Figma node 5730-45674)
// ------------------------------------------------------------
// Thin wrapper around elemental's Modal that enforces the Aero
// chrome: clean title row, body slot, right-aligned footer with
// a flat secondary link + filled primary button.
//
// Helper sub-components surface the two recurring body bits —
// a warning callout (cream/amber) and an informational note —
// so consumers don't reinvent the styling per dialog.
// ============================================================
import React from 'react';
import Modal from '@birdeye/elemental/core/atoms/Modal';
import Button from '@birdeye/elemental/core/atoms/Button';
import styles from './ConfirmDialog.module.scss';

type PrimaryTheme = 'primary' | 'danger-primary' | 'danger';
type ModalSize = 'extraSmall' | 'small' | 'medium' | 'mediumLarge' | 'large';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  primaryLabel: string;
  onPrimary: () => void;
  primaryTheme?: PrimaryTheme;
  primaryDisabled?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
  size?: ModalSize;
  children: React.ReactNode;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  onClose,
  primaryLabel,
  onPrimary,
  primaryTheme = 'primary',
  primaryDisabled,
  secondaryLabel = 'Cancel',
  onSecondary,
  size = 'small',
  children,
}) => (
  <Modal
    dialogOptions={{
      isOpen,
      // elemental's Modal only renders its built-in header row when a
      // customIcon is set, so we suppress its title and render our own
      // header below — that keeps the Aero title visible on every dialog
      // and gives us room to align it left of elemental's close button.
      title: '',
      showCloseIcon: true,
      onCloseModal: onClose,
      shouldCloseOnOverlayClick: true,
      shouldCloseOnEsc: true,
    }}
    size={size}
  >
    <h2 className={styles.title}>{title}</h2>
    <div className={styles.body}>{children}</div>
    <div className={styles.footer}>
      <Button theme="link" label={secondaryLabel} onClick={onSecondary ?? onClose} />
      <Button
        theme={primaryTheme}
        label={primaryLabel}
        onClick={onPrimary}
        disabled={primaryDisabled}
      />
    </div>
  </Modal>
);

export const DialogWarning: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.warning}>{children}</div>
);

export const DialogNote: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.note}>{children}</div>
);

export default ConfirmDialog;
