import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../../../store';
import { surveyActions } from '../../../../store/surveySlice';
import QuestionCard from '../QuestionCard/QuestionCard';
import { IconPlus } from '../../../../shared/Icons/Icons';
import styles from './SurveyForm.module.scss';

const SurveyForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const survey = useAppSelector((s) => s.survey.survey);
  const editorQuestionId = useAppSelector((s) => s.survey.editorPanel.questionId);
  const [isDragOver, setIsDragOver] = useState(false);

  if (!survey) return null;

  const page = survey.pages[0];
  if (!page) return null;

  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('application/question-type')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const questionType = e.dataTransfer.getData('application/question-type');
    if (questionType) {
      dispatch(surveyActions.addDroppedQuestion({ type: questionType }));
    }
  };

  const hasHeader = survey.header.companyName || survey.header.logoUrl;

  return (
    <div className={styles.surveyForm}>
      {/* Survey header (AI-generated) or Page title (manual) */}
      {hasHeader ? (
        <div className={styles.surveyHeader}>
          {survey.header.logoUrl ? (
            <img src={survey.header.logoUrl} alt="Logo" className={styles.logo} />
          ) : (
            <div className={styles.logoPlaceholder}>
              <span className={styles.logoText}>apt</span>
            </div>
          )}
          <h2 className={styles.companyName}>{survey.header.companyName}</h2>
          <p className={styles.subtitle}>{survey.header.subtitle}</p>
        </div>
      ) : (
        <div className={styles.pageTitle}>
          <span className={styles.pageTitleText}>Page 1</span>
          <span className={styles.pageTitleAction}>add title</span>
        </div>
      )}

      {/* Questions */}
      <div className={styles.questions}>
        {page.questions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            allQuestions={page.questions}
            isSelected={editorQuestionId === question.id}
          />
        ))}
      </div>

      {/* Drop zone for adding more questions */}
      <div
        className={`${styles.questionDropZone} ${isDragOver ? styles.dropActive : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p className={styles.dropText}>
          {isDragOver ? 'Release to add question' : 'Drop question here'}
        </p>
      </div>

      {/* Add page */}
      <button className={styles.addPageBtn}>
        <IconPlus size={14} color="#1a73e8" />
        <span>Add page</span>
      </button>
    </div>
  );
};

export default SurveyForm;
