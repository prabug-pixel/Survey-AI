import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../store';
import { surveyActions } from '../../../store/surveySlice';
import Button from '@birdeye/elemental/core/atoms/Button';
import Tooltip from '@birdeye/elemental/core/atoms/Tooltip';
import { IconArrowLeft, IconEdit, IconCloud } from '../../../shared/Icons/Icons';
import styles from './SurveyHeader.module.scss';

const SurveyHeader: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
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

  const handleBack = () => {
    navigate('/surveys');
  };

  const handlePublish = () => {
    const surveyId = survey?.id;
    dispatch(surveyActions.publishSurvey());
    navigate(surveyId ? `/surveys/${surveyId}` : '/surveys');
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Tooltip text="Go back" position="bottom" hideOnScroll>
          <button className={styles.backBtn} aria-label="Go back" onClick={handleBack}>
            <IconArrowLeft size={20} color="#424242" />
          </button>
        </Tooltip>

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
            <h1 className={styles.title}>{titleValue}</h1>
          )}
          <Tooltip text="Edit title" position="bottom" hideOnScroll>
            <button
              className={styles.editBtn}
              onClick={() => setIsEditing(true)}
              aria-label="Edit title"
            >
              <IconEdit size={14} color="#9e9e9e" />
            </button>
          </Tooltip>
        </div>
      </div>

      <div className={styles.right}>
        {surveyGenerated && (
          <Tooltip text="Save to cloud" position="bottom" hideOnScroll>
            <button className={styles.cloudBtn} aria-label="Save to cloud">
              <IconCloud size={20} color="#757575" />
            </button>
          </Tooltip>
        )}
        <Button
          label="Publish"
          theme={surveyGenerated ? 'primary' : 'secondary'}
          onClick={handlePublish}
          disabled={!surveyGenerated}
          className={styles.publishBtn}
        />
      </div>
    </header>
  );
};

export default SurveyHeader;
