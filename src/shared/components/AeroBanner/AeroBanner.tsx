// ============================================================
// AeroBanner — Aero Design System alert / banner component.
// Spec: Figma xecPAre4cKkeXEdvTig1oI node 1306-2061.
//
// Five semantic variants: success · error · info · warning · ai
// Optionally dismissible (onClose) and supports up to two
// inline action buttons. Corner radius 4 px per spec — use
// this component for ALL in-product alert / notification
// banners going forward.
// ============================================================
import React from 'react';
import {
  IconCheck,
  IconAlertCircle,
  IconInfo,
  IconWarning,
  IconAiBadge,
  IconClose,
} from '../../Icons/Icons';
import styles from './AeroBanner.module.scss';

export type BannerVariant = 'success' | 'error' | 'info' | 'warning' | 'ai';

export interface AeroBannerProps {
  variant?: BannerVariant;
  message: React.ReactNode;
  button1Label?: string;
  onButton1?: () => void;
  button2Label?: string;
  onButton2?: () => void;
  /** Renders the dismiss (×) button. Omit to make non-dismissible. */
  onClose?: () => void;
  className?: string;
}

const ICON_COLOR: Record<BannerVariant, string> = {
  success: '#34a853',
  error:   '#c62828',
  info:    '#1976d2',
  warning: '#f59e0b',
  ai:      '#7c3aed',
};

const BannerIcon: React.FC<{ variant: BannerVariant }> = ({ variant }) => {
  const color = ICON_COLOR[variant];
  switch (variant) {
    case 'success': return <IconCheck      size={20} color={color} />;
    case 'error':   return <IconAlertCircle size={20} color={color} />;
    case 'info':    return <IconInfo        size={20} color={color} />;
    case 'warning': return <IconWarning     size={20} color={color} />;
    case 'ai':      return <IconAiBadge     size={20} color={color} />;
  }
};

const AeroBanner: React.FC<AeroBannerProps> = ({
  variant = 'info',
  message,
  button1Label,
  onButton1,
  button2Label,
  onButton2,
  onClose,
  className,
}) => (
  <div
    className={`${styles.banner} ${styles[variant]}${className ? ` ${className}` : ''}`}
    role="alert"
    aria-live="polite"
  >
    {/* Icon slot — 36 × 36 px with 8 px inset matching Figma spec */}
    <div className={styles.iconSlot} aria-hidden>
      <BannerIcon variant={variant} />
    </div>

    <div className={styles.message}>{message}</div>

    {button1Label && (
      <button type="button" className={styles.actionBtn} onClick={onButton1}>
        {button1Label}
      </button>
    )}
    {button2Label && (
      <button type="button" className={styles.actionBtn} onClick={onButton2}>
        {button2Label}
      </button>
    )}

    {onClose && (
      <button
        type="button"
        className={styles.closeBtn}
        aria-label="Dismiss"
        onClick={onClose}
      >
        <IconClose size={24} color="#555" />
      </button>
    )}
  </div>
);

export default AeroBanner;
