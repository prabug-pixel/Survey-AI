import React from 'react';
import { useAppDispatch } from '../../../../store';
import { surveyActions } from '../../../../store/surveySlice';
import type { Question } from '../../../../types/survey.types';
import SingleSelect from '@birdeye/elemental/core/atoms/SingleSelect';
import FormInput from '@birdeye/elemental/core/atoms/FormInput';
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
      {/* Scale selector — Elemental SingleSelect */}
      <div className={styles.field}>
        <label className={styles.label}>Scale</label>
        <SingleSelect
          options={SCALE_OPTIONS}
          selected={config.scale}
          onChange={(option: { value: string | number }) =>
            dispatch(surveyActions.updateRatingScale({
              questionId: question.id,
              scale: Number(option.value),
            }))
          }
          name="ratingScale"
          className={styles.scaleSelect}
        />
      </div>

      {/* Rating labels — Elemental FormInput */}
      <div className={styles.labelFields}>
        <div className={styles.field}>
          <FormInput
            name="lowLabel"
            type="text"
            value={config.lowLabel}
            label="Low rating label"
            onChange={(_: unknown, e: React.ChangeEvent<HTMLInputElement>) =>
              dispatch(surveyActions.updateRatingLabel({
                questionId: question.id,
                field: 'lowLabel',
                value: e.target.value,
              }))
            }
          />
        </div>

        <div className={styles.field}>
          <FormInput
            name="highLabel"
            type="text"
            value={config.highLabel}
            label="High rating label"
            onChange={(_: unknown, e: React.ChangeEvent<HTMLInputElement>) =>
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
