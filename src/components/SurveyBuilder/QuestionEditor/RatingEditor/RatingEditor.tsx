import React from 'react';
import { useAppDispatch } from '../../../../store';
import { surveyActions } from '../../../../store/surveySlice';
import type { Question } from '../../../../types/survey.types';
import styles from './RatingEditor.module.scss';

interface RatingEditorProps {
  question: Question;
}

const SCALE_OPTIONS = [
  { value: 3, label: '3' },
  { value: 5, label: '5' },
  { value: 7, label: '7' },
  { value: 10, label: '10' },
];

const RatingEditor: React.FC<RatingEditorProps> = ({ question }) => {
  const dispatch = useAppDispatch();
  const config = question.ratingConfig;

  if (!config) return null;

  return (
    <div className={styles.ratingEditor}>
      <div className={styles.field}>
        <label className={styles.label}>Scale</label>
        <select
          name="ratingScale"
          className={styles.nativeSelect}
          value={config.scale}
          onChange={(e) =>
            dispatch(surveyActions.updateRatingScale({
              questionId: question.id,
              scale: Number(e.target.value),
            }))
          }
        >
          {SCALE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className={styles.labelFields}>
        <div className={styles.field}>
          <label className={styles.label}>Low rating label</label>
          <input
            type="text"
            name="lowLabel"
            className={styles.nativeInput}
            value={config.lowLabel}
            onChange={(e) =>
              dispatch(surveyActions.updateRatingLabel({
                questionId: question.id,
                field: 'lowLabel',
                value: e.target.value,
              }))
            }
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>High rating label</label>
          <input
            type="text"
            name="highLabel"
            className={styles.nativeInput}
            value={config.highLabel}
            onChange={(e) =>
              dispatch(surveyActions.updateRatingLabel({
                questionId: question.id,
                field: 'highLabel',
                value: e.target.value,
              }))
            }
          />
        </div>
      </div>
    </div>
  );
};

export default RatingEditor;
