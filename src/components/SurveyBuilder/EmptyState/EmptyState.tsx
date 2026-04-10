import React, { useEffect, useState } from 'react';
import { generateTemplates } from '../../../services/templateGenerator';
import type { SurveyTemplate } from '../../../types/survey.types';
import styles from './EmptyState.module.scss';

interface EmptyStateProps {
  onTemplateSelect: (prompt: string) => void;
}

const Illustration: React.FC = () => (
  <div className={styles.illustration}>
    <div className={styles.illustrationBg} />
    <div className={styles.illustrationCard}>
      <div className={styles.cardLeftPane}>
        <span className={styles.aiTag}>AI*</span>
        <div className={styles.aiTagBars}>
          <div className={styles.barBlue} />
          <div className={styles.barLightBlue} />
        </div>
      </div>
      <div className={styles.cardRightPane}>
        <div className={styles.rightPaneHeader} />
        <div className={styles.rightPaneRows}>
          <div className={styles.rowBlock}>
            <div className={styles.rowLine} />
            <div className={styles.rowDots}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={styles.dot} />
              ))}
            </div>
          </div>
          <div className={styles.rowBlock}>
            <div className={styles.rowLine} />
            <div className={styles.rowLineShort} />
          </div>
          <div className={styles.rowBlock}>
            <div className={styles.rowLine} />
            <div className={styles.rowLinePair}>
              <div className={styles.rowLineHalf} />
              <div className={styles.rowLineHalf} />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SparkleIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5L8 1z" fill="#6834b7" />
    <path d="M12 0l.75 2.25L15 3l-2.25.75L12 6l-.75-2.25L9 3l2.25-.75L12 0z" fill="#9575cd" />
  </svg>
);

const ChevronDownIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={styles.chevronIcon}>
    <path d="M4 6l4 4 4-4" stroke="#1976d2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EmptyState: React.FC<EmptyStateProps> = ({ onTemplateSelect }) => {
  const [templates, setTemplates] = useState<SurveyTemplate[]>([]);

  useEffect(() => {
    setTemplates(generateTemplates(4));
  }, []);

  return (
    <div className={styles.emptyState}>
      <div className={styles.heroSection}>
        <Illustration />

        <div className={styles.ctaSection}>
          <div className={styles.ctaRow}>
            <SparkleIcon />
            <span>Build your survey,</span>
            <button className={styles.link}>Create from scratch</button>
          </div>
          <p className={styles.orText}>or</p>
          <div className={styles.libraryRow}>
            <span>Select from </span>
            <button className={styles.link}>library</button>
            <ChevronDownIcon />
          </div>
        </div>
      </div>

      <div className={styles.templateGrid}>
        {templates.map((template) => (
          <button
            key={template.id}
            className={styles.templateCard}
            onClick={() => onTemplateSelect(template.description)}
          >
            <h4 className={styles.cardTitle}>{template.title}</h4>
            <p className={styles.cardDesc}>{template.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmptyState;
