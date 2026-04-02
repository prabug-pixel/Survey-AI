import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { surveyActions } from '../../../../store/surveySlice';
import { chatActions } from '../../../../store/chatSlice';
import type { Question } from '../../../../types/survey.types';
import Tooltip from '@birdeye/elemental/core/atoms/Tooltip';
import TextArea from '@birdeye/elemental/core/atoms/TextArea';
import RatingScale from '../../../../shared/RatingScale/RatingScale';
import RadioOption from '../../../../shared/RadioOption/RadioOption';
import { IconDragHandle, IconCodeConnect, IconTrash } from '../../../../shared/Icons/Icons';
import SkipLogicBadge from '../../SkipLogicBadge/SkipLogicBadge';
import styles from './QuestionCard.module.scss';

interface QuestionCardProps {
  question: Question;
  allQuestions: Question[];
  isSelected?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, allQuestions }) => {
  const dispatch = useAppDispatch();
  const editorQuestionId = useAppSelector((s) => s.survey.editorPanel.questionId);

  const handleClick = () => {
    dispatch(surveyActions.openEditor(question.id));
    dispatch(chatActions.setMentionedQuestion(question.id));
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(surveyActions.deleteQuestion(question.id));
  };

  const isActive = editorQuestionId === question.id;

  return (
    <div
      className={`${styles.card} ${isActive ? styles.active : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Question ${question.order}: ${question.text}`}
    >
      {isActive && (
        <div className={styles.dragHandle}>
          <IconDragHandle size={16} color="#bdbdbd" />
        </div>
      )}

      <div className={styles.questionHeader}>
        <span className={styles.questionNumber}>{question.order}.</span>
        {isActive ? (
          <input
            className={styles.questionInput}
            value={question.text}
            onChange={(e) =>
              dispatch(surveyActions.updateQuestionText({ questionId: question.id, text: e.target.value }))
            }
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className={styles.questionText}>
            {question.text}
            {question.required && <span className={styles.required}>*</span>}
          </span>
        )}

        {isActive && (
          <div className={styles.actions}>
            <Tooltip text="Code connect" position="top" hideOnScroll>
              <button className={styles.actionBtn} aria-label="Code connect">
                <IconCodeConnect size={16} />
              </button>
            </Tooltip>
            <Tooltip text="Delete question" position="top" hideOnScroll>
              <button className={styles.actionBtn} onClick={handleDelete} aria-label="Delete question">
                <IconTrash size={16} color="#9e9e9e" />
              </button>
            </Tooltip>
          </div>
        )}
      </div>

      {question.type === 'rating' && question.ratingConfig && (
        <div className={styles.questionBody}>
          <RatingScale
            scale={question.ratingConfig.scale}
            lowLabel={question.ratingConfig.lowLabel}
            highLabel={question.ratingConfig.highLabel}
            disabled
          />
        </div>
      )}

      {question.type === 'multiple_choice' && question.choices && (
        <div className={styles.questionBody}>
          {question.choices.map((choice) => (
            <RadioOption
              key={choice.id}
              label={choice.label}
              name={`q-${question.id}`}
              value={choice.id}
              disabled
            />
          ))}
        </div>
      )}

      {question.type === 'text' && (
        <div className={styles.questionBody}>
          <TextArea
            name={`q-text-${question.id}`}
            value=""
            placeholder={question.placeholder || 'Enter your response'}
            disabled
            rows={3}
            noFloatingLabel
            noBorder={false}
            className={styles.textArea}
          />
        </div>
      )}

      {question.skipLogicRules && question.skipLogicRules.length > 0 && isActive && (
        <SkipLogicBadge rules={question.skipLogicRules} allQuestions={allQuestions} />
      )}
    </div>
  );
};

export default QuestionCard;
