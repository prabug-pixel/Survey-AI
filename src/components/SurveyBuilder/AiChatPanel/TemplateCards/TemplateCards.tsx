import React from 'react';
import { SURVEY_TEMPLATES } from '../../../../constants/templates';
import styles from './TemplateCards.module.scss';

interface TemplateCardsProps {
  onSelect: (templateId: string) => void;
}

const TemplateCards: React.FC<TemplateCardsProps> = ({ onSelect }) => (
  <div className={styles.grid}>
    {SURVEY_TEMPLATES.map((template) => (
      <button
        key={template.id}
        className={styles.card}
        onClick={() => onSelect(template.id)}
      >
        <h4 className={styles.cardTitle}>{template.title}</h4>
        <p className={styles.cardDesc}>{template.description}</p>
      </button>
    ))}
  </div>
);

export default TemplateCards;
