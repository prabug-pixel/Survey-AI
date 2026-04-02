import React from 'react';
import type { SkipLogicRule, Question } from '../../../types/survey.types';
import { IconSkipLogic } from '../../../shared/Icons/Icons';
import styles from './SkipLogicBadge.module.scss';

interface SkipLogicBadgeProps {
  rules: SkipLogicRule[];
  allQuestions: Question[];
}

const SkipLogicBadge: React.FC<SkipLogicBadgeProps> = ({ rules, allQuestions }) => {
  const getQuestionLabel = (qId: string): string => {
    const q = allQuestions.find((q) => q.id === qId);
    return q ? `Q${q.order}: ${q.text}` : 'Unknown question';
  };

  return (
    <div className={styles.skipLogicBadge}>
      <div className={styles.header}>
        <IconSkipLogic size={14} />
        <span className={styles.title}>Skip to another question based on the response</span>
        <button className={styles.editLink}>Edit</button>
        <button className={styles.closeBtn} aria-label="Remove skip logic">&times;</button>
      </div>

      <div className={styles.rules}>
        {rules.map((rule) => (
          <div key={rule.id} className={styles.rule}>
            <span className={styles.ruleText}>
              If answer {rule.condition === 'is' ? 'is' : 'is not'}{' '}
              <span className={styles.ruleValue}>{rule.answerValue}</span>{' '}
              then skip to{' '}
              <span className={styles.ruleTarget}>{getQuestionLabel(rule.targetQuestionId)}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkipLogicBadge;
