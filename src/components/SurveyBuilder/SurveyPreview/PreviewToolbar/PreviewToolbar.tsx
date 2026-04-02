import React from 'react';
import { useAppSelector, useAppDispatch } from '../../../../store';
import { surveyActions } from '../../../../store/surveySlice';
import { IconDesktop, IconMobile, IconTheme, IconEye } from '../../../../shared/Icons/Icons';
import type { PreviewMode } from '../../../../types/survey.types';
import styles from './PreviewToolbar.module.scss';

const PreviewToolbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const previewMode = useAppSelector((s) => s.survey.previewMode);

  const modes: { id: PreviewMode; icon: React.FC<{ size?: number; color?: string }>; label: string }[] = [
    { id: 'desktop', icon: IconDesktop, label: 'Desktop' },
    { id: 'mobile', icon: IconMobile, label: 'Mobile' },
  ];

  return (
    <div className={styles.toolbar}>
      <div className={styles.group}>
        {modes.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            className={`${styles.modeBtn} ${previewMode === id ? styles.active : ''}`}
            onClick={() => dispatch(surveyActions.setPreviewMode(id))}
            title={label}
            aria-label={label}
          >
            <Icon size={18} color={previewMode === id ? '#1a73e8' : '#757575'} />
          </button>
        ))}
      </div>

      <div className={styles.divider} />

      <button className={styles.modeBtn} title="Theme" aria-label="Theme">
        <IconTheme size={18} color="#757575" />
      </button>

      <button className={styles.modeBtn} title="Preview" aria-label="Preview">
        <IconEye size={18} color="#757575" />
      </button>
    </div>
  );
};

export default PreviewToolbar;
