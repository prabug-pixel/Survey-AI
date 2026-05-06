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
import MatrixEditor from './MatrixEditor/MatrixEditor';
import ContactInfoEditor from './ContactInfoEditor/ContactInfoEditor';
import DateTimeEditor from './DateTimeEditor/DateTimeEditor';
import LocationEditor from './LocationEditor/LocationEditor';
import ReviewCollectorEditor from './ReviewCollectorEditor/ReviewCollectorEditor';
import styles from './QuestionEditor.module.scss';

const QUESTION_TYPE_OPTIONS = [
  { value: 'rating', label: 'Rating' },
  { value: 'multiple_choice', label: 'Multiple choice' },
  { value: 'text', label: 'Text' },
  { value: 'nps', label: 'Net Promoter Score' },
  { value: 'short_text', label: 'Short text' },
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'help_text', label: 'Help text' },
  { value: 'checkboxes', label: 'Checkboxes' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'matrix_radio', label: 'Matrix radio choice' },
  { value: 'matrix_ratings', label: 'Matrix ratings' },
  { value: 'matrix_dropdown', label: 'Matrix dropdown' },
  { value: 'contact_info', label: 'Contact information' },
  { value: 'date_time', label: 'Date / Time' },
  { value: 'location', label: 'Location' },
  { value: 'review_collector', label: 'Review collector' },
  { value: 'review_request', label: 'Review request' },
  { value: 'welcome', label: 'Welcome' },
  { value: 'thank_you', label: 'Thank you page' },
  { value: 'page_title', label: 'Page title' },
  { value: 'page_break', label: 'Page break' },
];

const NPS_SORT_OPTIONS = [
  { value: '0-10', label: '0 - 10' },
  { value: '10-0', label: '10 - 0' },
];

const QuestionEditor: React.FC = () => {
  const dispatch = useAppDispatch();
  const survey = useAppSelector((s) => s.survey.survey);
  const { questionId } = useAppSelector((s) => s.survey.editorPanel);

  const question = survey?.pages
    .flatMap((p) => p.questions)
    .find((q) => q.id === questionId);

  if (!question) return null;

  const typeLabel = QUESTION_TYPE_OPTIONS.find((o) => o.value === question.type)?.label ?? question.type;

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
        {question.type === 'nps' && (
          <>
            <div className={styles.field}>
              <label className={styles.label}>Sort</label>
              <SingleSelect
                options={NPS_SORT_OPTIONS}
                selected="0-10"
                onChange={() => {}}
                name="npsSort"
                className={styles.singleSelect}
              />
            </div>
            <RatingEditor question={question} />
          </>
        )}
        {(question.type === 'multiple_choice' || question.type === 'checkboxes' || question.type === 'dropdown') && (
          <MultipleChoiceEditor question={question} />
        )}
        {(question.type === 'text' || question.type === 'short_text' || question.type === 'paragraph') && (
          <TextEditor question={question} />
        )}
        {(question.type === 'matrix_radio' || question.type === 'matrix_ratings' || question.type === 'matrix_dropdown') && (
          <MatrixEditor question={question} />
        )}
        {question.type === 'contact_info' && <ContactInfoEditor question={question} />}
        {question.type === 'date_time' && <DateTimeEditor question={question} />}
        {question.type === 'location' && <LocationEditor question={question} />}
        {question.type === 'review_collector' && <ReviewCollectorEditor question={question} />}

        {/* Welcome editor */}
        {question.type === 'welcome' && (
          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textareaInput}
              value={question.welcomeConfig?.description ?? ''}
              onChange={(e) =>
                dispatch(surveyActions.updateWelcomeConfig({
                  questionId: question.id,
                  updates: { description: e.target.value },
                }))
              }
              rows={3}
            />
            <label className={styles.label} style={{ marginTop: 8 }}>Button text</label>
            <input
              className={styles.textInput}
              value={question.welcomeConfig?.buttonText ?? ''}
              onChange={(e) =>
                dispatch(surveyActions.updateWelcomeConfig({
                  questionId: question.id,
                  updates: { buttonText: e.target.value },
                }))
              }
            />
          </div>
        )}

        {/* Thank you editor */}
        {question.type === 'thank_you' && (
          <div className={styles.field}>
            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>Redirect after submission</span>
              <Toggle
                checked={question.thankYouConfig?.showRedirect ?? false}
                onChange={(_: unknown, e: { target: { checked: boolean } }) =>
                  dispatch(surveyActions.updateThankYouConfig({
                    questionId: question.id,
                    updates: { showRedirect: e?.target?.checked ?? !question.thankYouConfig?.showRedirect },
                  }))
                }
                name="showRedirect"
                className={styles.toggleWrap}
              />
            </div>
            {question.thankYouConfig?.showRedirect && (
              <>
                <label className={styles.label} style={{ marginTop: 8 }}>Redirect URL</label>
                <input
                  className={styles.textInput}
                  value={question.thankYouConfig?.redirectUrl ?? ''}
                  placeholder="https://example.com"
                  onChange={(e) =>
                    dispatch(surveyActions.updateThankYouConfig({
                      questionId: question.id,
                      updates: { redirectUrl: e.target.value },
                    }))
                  }
                />
              </>
            )}
          </div>
        )}

        {/* Embed in email toggle (NPS) */}
        {question.type === 'nps' && (
          <div className={styles.toggleRow}>
            <span className={styles.toggleLabel}>Embed in email</span>
            <Toggle
              checked={false}
              onChange={() => {}}
              name="embedInEmail"
              className={styles.toggleWrap}
            />
          </div>
        )}

        {/* Required toggle */}
        <div className={styles.toggleRow}>
          <span className={styles.toggleLabel}>Required</span>
          <Toggle
            checked={question.required}
            onChange={() => handleRequiredToggle()}
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
