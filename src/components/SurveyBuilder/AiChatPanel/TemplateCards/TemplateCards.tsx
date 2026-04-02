import React from 'react';
import { SURVEY_TEMPLATES } from '../../../../constants/templates';
import styles from './TemplateCards.module.scss';

interface TemplateCardsProps {
  onSelect: (templateId: string) => void;
}

const TemplateCards: React.FC<TemplateCardsProps> = ({ onSelect }) => (
  <div className={styles.cardsRow}>
    {SURVEY_TEMPLATES.map((template) => (
      <button
        key={template.id}
        className={styles.card}
        onClick={() => onSelect(template.id)}
      >
        <div className={styles.cardContent}>
          <p className={styles.cardTitle}>{template.title}</p>
          <p className={styles.cardDesc}>{template.description}</p>
        </div>
      </button>
    ))}
  </div>
);

export default TemplateCards;
