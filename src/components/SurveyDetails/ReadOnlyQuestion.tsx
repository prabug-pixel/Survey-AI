import React from 'react';
import type { Question } from '../../types/survey.types';
import RatingScale from '../../shared/RatingScale/RatingScale';
import RadioOption from '../../shared/RadioOption/RadioOption';
import Checkbox from '../../shared/Checkbox/Checkbox';
import styles from './ReadOnlyQuestion.module.scss';

interface Props {
  question: Question;
  answer?: string | number | string[];
  editing?: boolean;
  onAnswerChange?: (value: string | number | string[]) => void;
}

const ReadOnlyQuestion: React.FC<Props> = ({ question, answer, editing = false, onAnswerChange }) => {
  if (question.type === 'page_break') {
    return <hr className={styles.pageBreak} />;
  }

  if (question.type === 'welcome') {
    return (
      <div className={`${styles.card} ${styles.welcomeCard}`}>
        <p className={styles.welcomeDesc}>{question.welcomeConfig?.description || 'Welcome to our survey'}</p>
        <button className={styles.welcomeBtn} disabled>
          {question.welcomeConfig?.buttonText || 'Start Survey'}
        </button>
      </div>
    );
  }

  if (question.type === 'thank_you') {
    return (
      <div className={`${styles.card} ${styles.thankYouCard}`}>
        <h2 className={styles.thankYouTitle}>Thank you!</h2>
        <p className={styles.thankYouText}>Thank you for taking the survey!</p>
        {question.thankYouConfig?.showRedirect && (
          <p className={styles.redirectNote}>Redirecting to {question.thankYouConfig.redirectUrl}</p>
        )}
      </div>
    );
  }

  if (question.type === 'page_title') {
    return (
      <div className={styles.pageTitleCard}>
        <span className={styles.pageTitleText}>{question.text || 'Page title'}</span>
      </div>
    );
  }

  if (question.type === 'help_text') {
    return (
      <div className={styles.card}>
        <p className={styles.helpText}>{question.text}</p>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${styles.questionCard}`}>
      <div className={styles.header}>
        <span className={styles.number}>{question.order}.</span>
        <span className={styles.text}>
          {question.text}
          {question.required && <span className={styles.required}>*</span>}
        </span>
      </div>

      {question.type === 'nps' && question.ratingConfig && (
        <div className={styles.body}>
          <RatingScale
            scale={question.ratingConfig.scale}
            lowLabel={question.ratingConfig.highLabel}
            highLabel={question.ratingConfig.lowLabel}
            startFromZero
            selectedValue={typeof answer === 'number' ? answer : null}
            onSelect={editing ? (v) => onAnswerChange?.(v) : undefined}
            disabled={!editing}
            editMode
          />
        </div>
      )}

      {question.type === 'rating' && question.ratingConfig && (
        <div className={styles.body}>
          <RatingScale
            scale={question.ratingConfig.scale}
            lowLabel={question.ratingConfig.lowLabel}
            highLabel={question.ratingConfig.highLabel}
            selectedValue={typeof answer === 'number' ? answer : null}
            onSelect={editing ? (v) => onAnswerChange?.(v) : undefined}
            disabled={!editing}
            editMode
          />
        </div>
      )}

      {question.type === 'multiple_choice' && question.choices && (
        <div className={styles.body}>
          {question.choices.map(choice => (
            <RadioOption
              key={choice.id}
              label={choice.label}
              name={`ro-${question.id}`}
              value={choice.id}
              checked={answer === choice.id}
              onChange={editing ? () => onAnswerChange?.(choice.id) : undefined}
              disabled={!editing}
            />
          ))}
        </div>
      )}

      {question.type === 'checkboxes' && question.choices && (
        <div className={styles.body}>
          {question.choices.map(choice => {
            const checked = Array.isArray(answer) ? answer.includes(choice.id) : false;
            return (
              <Checkbox
                key={choice.id}
                label={choice.label}
                checked={checked}
                onChange={editing
                  ? () => {
                      const current = Array.isArray(answer) ? answer : [];
                      const next = checked
                        ? current.filter(v => v !== choice.id)
                        : [...current, choice.id];
                      onAnswerChange?.(next);
                    }
                  : () => {}}
                name={`ro-${question.id}`}
                disabled={!editing}
              />
            );
          })}
        </div>
      )}

      {question.type === 'dropdown' && question.choices && (
        <div className={styles.body}>
          <div className={styles.selectStub}>Select option</div>
        </div>
      )}

      {(question.type === 'text' || question.type === 'short_text') && (
        <div className={styles.body}>
          <div className={styles.inputStub}>{question.placeholder || 'Short answer text'}</div>
        </div>
      )}

      {question.type === 'paragraph' && (
        <div className={styles.body}>
          <div className={`${styles.inputStub} ${styles.paragraphStub}`}>
            {question.placeholder || 'Long answer text'}
          </div>
        </div>
      )}

      {(question.type === 'matrix_radio' || question.type === 'matrix_ratings') && question.matrixConfig && (
        <div className={styles.matrixBody}>
          <div className={styles.matrixHeader}>
            <div className={styles.matrixRowLabel} />
            {question.matrixConfig.columnLabels.map((label, i) => (
              <div key={i} className={styles.matrixColHeader}>{label}</div>
            ))}
          </div>
          {question.matrixConfig.rows.map(row => (
            <div key={row.id} className={styles.matrixRow}>
              <div className={styles.matrixRowLabel}>{row.label}</div>
              {question.matrixConfig!.columnLabels.map((_, i) => (
                <div key={i} className={styles.matrixCell}>
                  <div className={styles.radioVisual} />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {question.type === 'contact_info' && question.contactInfoConfig && (
        <div className={styles.body}>
          <div className={styles.contactGrid}>
            {question.contactInfoConfig.fields.filter(f => f.enabled).map(field => (
              <div key={field.id} className={styles.contactField}>{field.label}</div>
            ))}
          </div>
        </div>
      )}

      {question.type === 'date_time' && (
        <div className={styles.body}>
          <div className={styles.inputStub}>Select date and time</div>
        </div>
      )}

      {question.type === 'location' && question.locationConfig && (
        <div className={styles.body}>
          <div className={styles.selectStub}>{question.locationConfig.locationChoices}</div>
        </div>
      )}

      {question.type === 'review_collector' && (
        <div className={styles.body}>
          <div className={styles.starRow}>
            {[1, 2, 3, 4, 5].map(i => (
              <span key={i} className={styles.star}>★</span>
            ))}
          </div>
          <div className={styles.inputStub} style={{ marginTop: 8 }}>Share your feedback</div>
        </div>
      )}
    </div>
  );
};

export default ReadOnlyQuestion;
