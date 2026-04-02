import React from 'react';
import TemplateCards from '../AiChatPanel/TemplateCards/TemplateCards';
import emptyStateBg from '../../../assets/figma-icons/empty-state-bg.svg';
import sparkleIcon from '../../../assets/figma-icons/sparkle.svg';
import styles from './EmptyState.module.scss';

interface EmptyStateProps {
  onTemplateSelect: (templateId: string) => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onTemplateSelect }) => (
  <div className={styles.emptyState}>
    <div className={styles.topSection}>
      {/* Figma: Empty state illustration */}
      <div className={styles.illustration}>
        <img src={emptyStateBg} alt="" className={styles.illustrationImg} />
      </div>

      {/* Figma: CTA text */}
      <div className={styles.ctaGroup}>
        <div className={styles.ctaRow}>
          <img src={sparkleIcon} alt="" className={styles.sparkleIcon} />
          <span className={styles.ctaText}>
            Build your survey, <button className={styles.link}>Create from scratch</button>
          </span>
        </div>
        <p className={styles.orText}>or</p>
        <div className={styles.libraryRow}>
          <span className={styles.ctaText}>
            Select from <button className={styles.link}>library</button>
          </span>
          <span className={styles.chevron}>&#8964;</span>
        </div>
      </div>
    </div>

    {/* Figma: Library cards grid */}
    <TemplateCards onSelect={onTemplateSelect} />
  </div>
);

export default EmptyState;
