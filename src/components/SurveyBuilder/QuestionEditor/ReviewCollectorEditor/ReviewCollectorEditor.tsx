import React from 'react';
import { useAppDispatch } from '../../../../store';
import { surveyActions } from '../../../../store/surveySlice';
import type { Question } from '../../../../types/survey.types';
import SingleSelect from '@birdeye/elemental/core/atoms/SingleSelect';
import Toggle from '@birdeye/elemental/core/atoms/Toggle';
import FormInput from '@birdeye/elemental/core/atoms/FormInput';
import styles from './ReviewCollectorEditor.module.scss';

interface ReviewCollectorEditorProps {
  question: Question;
}

const SOURCE_OPTIONS = [
  { value: '2 selected', label: '2 selected' },
  { value: 'All sources', label: 'All sources' },
];

const ReviewCollectorEditor: React.FC<ReviewCollectorEditorProps> = ({ question }) => {
  const dispatch = useAppDispatch();
  const config = question.reviewCollectorConfig;

  if (!config) return null;

  const updateConfig = (updates: Partial<typeof config>) => {
    dispatch(surveyActions.updateReviewCollectorConfig({ questionId: question.id, updates }));
  };

  return (
    <div className={styles.reviewEditor}>
      <div className={styles.field}>
        <label className={styles.label}>Select source <span className={styles.required}>*</span></label>
        <SingleSelect
          options={SOURCE_OPTIONS}
          selected="2 selected"
          onChange={() => {}}
          name="sourceSelect"
        />
      </div>

      <div className={styles.toggleRow}>
        <span className={styles.toggleText}>Request responder to leave this feedback as public review</span>
        <Toggle
          checked={config.requestPublicReview}
          onChange={(_: unknown, e: { target: { checked: boolean } }) => updateConfig({ requestPublicReview: e?.target?.checked ?? !config.requestPublicReview })}
          name="requestPublicReview"
        />
      </div>

      <div className={styles.toggleRow}>
        <span className={styles.toggleText}>Show 'Contact us' option</span>
        <Toggle
          checked={config.showContactUs}
          onChange={(_: unknown, e: { target: { checked: boolean } }) => updateConfig({ showContactUs: e?.target?.checked ?? !config.showContactUs })}
          name="showContactUs"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Button color</label>
        <div className={styles.colorInputWrap}>
          <FormInput
            name="buttonColor"
            value={config.buttonColor}
            onChange={(_: any, e: any) => updateConfig({ buttonColor: e.target.value })}
            noFloatingLabel
            className={styles.colorInput}
          />
          <div className={styles.colorPreview} style={{ backgroundColor: config.buttonColor }} />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Button text color</label>
        <div className={styles.colorInputWrap}>
          <FormInput
            name="buttonTextColor"
            value={config.buttonTextColor}
            onChange={(_: any, e: any) => updateConfig({ buttonTextColor: e.target.value })}
            noFloatingLabel
            className={styles.colorInput}
          />
          <div className={styles.colorPreview} style={{ backgroundColor: config.buttonTextColor, border: '1px solid #e0e0e0' }} />
        </div>
      </div>
    </div>
  );
};

export default ReviewCollectorEditor;
