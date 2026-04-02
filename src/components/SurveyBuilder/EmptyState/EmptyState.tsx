import React from 'react';
import TemplateCards from '../AiChatPanel/TemplateCards/TemplateCards';
import styles from './EmptyState.module.scss';

interface EmptyStateProps {
  onTemplateSelect: (templateId: string) => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onTemplateSelect }) => (
  <div className={styles.emptyState}>
    <div className={styles.illustration}>
      <div className={styles.illustrationCard}>
        <div className={styles.cardLeft}>
          <div className={styles.aiLabel}>AI</div>
          <div className={styles.barShort} />
        </div>
        <div className={styles.cardRight}>
          <div className={styles.lineLong} />
          <div className={styles.dotRow}>
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className={styles.dot} />
            ))}
          </div>
          <div className={styles.lineMedium} />
          <div className={styles.lineShort} />
        </div>
      </div>
    </div>

    <p className={styles.cta}>
      <span className={styles.sparkle}>&#10024;</span>{' '}
      Build your survey, <button className={styles.link}>Create from scratch</button>
    </p>

    <p className={styles.divider}>or</p>

    <p className={styles.libraryLabel}>
      Select from <button className={styles.link}>library</button>{' '}
      <span className={styles.chevron}>&#8964;</span>
    </p>

    <TemplateCards onSelect={onTemplateSelect} />
  </div>
);

export default EmptyState;
