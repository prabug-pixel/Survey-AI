import React from 'react';
import { useAppSelector } from '../../../../store';
import QuestionCard from '../QuestionCard/QuestionCard';
import { IconPlus } from '../../../../shared/Icons/Icons';
import styles from './SurveyForm.module.scss';

const SurveyForm: React.FC = () => {
  const survey = useAppSelector((s) => s.survey.survey);
  const editorQuestionId = useAppSelector((s) => s.survey.editorPanel.questionId);

  if (!survey) return null;

  const page = survey.pages[0];
  if (!page) return null;

  return (
    <div className={styles.surveyForm}>
      {/* Survey header */}
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

      {/* Add page */}
      <button className={styles.addPageBtn}>
        <IconPlus size={14} color="#1a73e8" />
        <span>Add page</span>
      </button>
    </div>
  );
};

export default SurveyForm;
