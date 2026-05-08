import React from 'react';
import { IconBuilder, IconPalette, IconEye } from '../../../../shared/Icons/Icons';
import styles from './PreviewToolbar.module.scss';

const PreviewToolbar: React.FC = () => {
  return (
    <div className={styles.toolbar}>
      <button className={`${styles.btn} ${styles.active}`} title="Builder" aria-label="Builder">
        <IconBuilder size={20} color="#212121" />
      </button>
      <button className={styles.btn} title="Appearance" aria-label="Appearance">
        <IconPalette size={20} color="#424242" />
      </button>
      <button className={styles.btn} title="Preview" aria-label="Preview">
        <IconEye size={20} color="#424242" />
      </button>
    </div>
  );
};

export default PreviewToolbar;
