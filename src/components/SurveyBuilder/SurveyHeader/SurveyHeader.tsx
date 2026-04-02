import React, { useState, useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../../store';
import { surveyActions } from '../../../store/surveySlice';
import arrowLeftIcon from '../../../assets/figma-icons/arrow-left.svg';
import editIcon from '../../../assets/figma-icons/edit.svg';
import chevronDownIcon from '../../../assets/figma-icons/chevron-down.svg';
import styles from './SurveyHeader.module.scss';

const SurveyHeader: React.FC = () => {
  const dispatch = useAppDispatch();
  const survey = useAppSelector((s) => s.survey.survey);
  const surveyGenerated = useAppSelector((s) => s.survey.surveyGenerated);

  const [isEditing, setIsEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(survey?.title || 'Standard survey');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (survey?.title) setTitleValue(survey.title);
  }, [survey?.title]);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    if (titleValue.trim()) {
      dispatch(surveyActions.updateSurveyTitle(titleValue.trim()));
    }
  };

  return (
    <div className={styles.contentBar}>
      <div className={styles.left}>
        <button className={styles.backBtn} aria-label="Go back">
          <img src={arrowLeftIcon} alt="" className={styles.icon20} />
        </button>

        <div className={styles.titleGroup}>
          {isEditing ? (
            <input
              ref={inputRef}
              className={styles.titleInput}
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          ) : (
            <span className={styles.title}>{titleValue}</span>
          )}
          <button
            className={styles.editBtn}
            onClick={() => setIsEditing(true)}
            aria-label="Edit title"
          >
            <img src={editIcon} alt="" className={styles.icon20} />
          </button>
        </div>
      </div>

      <div className={styles.right}>
        <button
          className={`${styles.publishBtn} ${surveyGenerated ? styles.active : ''}`}
          disabled={!surveyGenerated}
        >
          <span>Publish</span>
          <img src={chevronDownIcon} alt="" className={styles.icon20} />
        </button>
      </div>
    </div>
  );
};

export default SurveyHeader;
