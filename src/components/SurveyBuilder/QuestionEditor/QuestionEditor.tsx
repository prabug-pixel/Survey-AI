import React from 'react';
import { useAppSelector, useAppDispatch } from '../../../store';
import { surveyActions } from '../../../store/surveySlice';
import type { QuestionType } from '../../../types/survey.types';
import Button from '@birdeye/elemental/core/atoms/Button';
import Toggle from '@birdeye/elemental/core/atoms/Toggle';
import SingleSelect from '@birdeye/elemental/core/atoms/SingleSelect';
import Tooltip from '@birdeye/elemental/core/atoms/Tooltip';
import { IconClose, IconSkipLogic, IconDisplayLogic, IconReorder } from '../../../shared/Icons/Icons';
import RatingEditor from './RatingEditor/RatingEditor';
import MultipleChoiceEditor from './MultipleChoiceEditor/MultipleChoiceEditor';
import TextEditor from './TextEditor/TextEditor';
import styles from './QuestionEditor.module.scss';

const QUESTION_TYPE_OPTIONS = [
  { value: 'rating', label: 'Rating' },
  { value: 'multiple_choice', label: 'Multiple choice' },
  { value: 'text', label: 'Text' },
  { value: 'nps', label: 'NPS' },
];

const QuestionEditor: React.FC = () => {
  const dispatch = useAppDispatch();
  const survey = useAppSelector((s) => s.survey.survey);
  const { questionId } = useAppSelector((s) => s.survey.editorPanel);

  const question = survey?.pages
    .flatMap((p) => p.questions)
    .find((q) => q.id === questionId);

  if (!question) return null;

  const typeLabel =
    QUESTION_TYPE_OPTIONS.find((o) => o.value === question.type)?.label || 'Unknown';

  const handleTypeChange = (option: { value: string | number }) => {
    dispatch(
      surveyActions.updateQuestionType({
        questionId: question.id,
        type: option.value as QuestionType,
      })
    );
  };

  const handleRequiredToggle = () => {
    dispatch(surveyActions.toggleRequired(question.id));
  };

  const handleClose = () => {
    dispatch(surveyActions.closeEditor());
  };

  return (
    <div className={styles.editor}>
      <div className={styles.header}>
        <h3 className={styles.title}>{typeLabel}</h3>
        <Tooltip text="Close editor" position="left" hideOnScroll>
          <button className={styles.closeBtn} onClick={handleClose} aria-label="Close editor">
            <IconClose size={16} color="#757575" />
          </button>
        </Tooltip>
      </div>

      <div className={styles.body}>
        {/* Question type — Elemental SingleSelect */}
        <div className={styles.field}>
          <label className={styles.label}>
            Question type <span className={styles.required}>*</span>
          </label>
          <SingleSelect
            options={QUESTION_TYPE_OPTIONS}
            selected={question.type}
            onChange={handleTypeChange}
            placeholder="Select type"
            name="questionType"
            className={styles.singleSelect}
          />
        </div>

        {/* Type-specific editor */}
        {question.type === 'rating' && <RatingEditor question={question} />}
        {question.type === 'multiple_choice' && <MultipleChoiceEditor question={question} />}
        {question.type === 'text' && <TextEditor question={question} />}

        {/* Required toggle — Elemental Toggle */}
        <div className={styles.toggleRow}>
          <span className={styles.toggleLabel}>Required</span>
          <Toggle
            checked={question.required}
            onChange={handleRequiredToggle}
            name="required"
            className={styles.toggleWrap}
          />
        </div>

        {/* Logic section */}
        <div className={styles.logicSection}>
          <h4 className={styles.logicTitle}>Logic</h4>

          <button className={styles.logicBtn}>
            <IconSkipLogic size={14} />
            <span>Skip logic</span>
          </button>

          <button className={styles.logicBtn}>
            <IconDisplayLogic size={14} />
            <span>Display logic</span>
          </button>

          <button className={styles.logicBtn}>
            <IconReorder size={14} />
            <span>Reorder question</span>
          </button>
        </div>
      </div>

      <div className={styles.footer}>
        <Button
          label="Done"
          theme="primary"
          onClick={handleClose}
          expanded
          className={styles.doneBtn}
        />
      </div>
    </div>
  );
};

export default QuestionEditor;
