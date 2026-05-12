import React from 'react';
import { useAppSelector, useAppDispatch } from '../../../store';
import { surveyActions } from '../../../store/surveySlice';
import type { QuestionType } from '../../../types/survey.types';
import Button from '@birdeye/elemental/core/atoms/Button';
import Toggle from '@birdeye/elemental/core/atoms/Toggle';
import Tooltip from '@birdeye/elemental/core/atoms/Tooltip';
import FormInput from '@birdeye/elemental/core/atoms/FormInput';
import TextArea from '@birdeye/elemental/core/atoms/TextArea';
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

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(
      surveyActions.updateQuestionType({
        questionId: question.id,
        type: e.target.value as QuestionType,
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
        {/* Question type — native select */}
        <div className={styles.field}>
          <label className={styles.label}>
            Question type <span className={styles.required}>*</span>
          </label>
          <select
            name="questionType"
            className={styles.nativeSelect}
            value={question.type}
            onChange={handleTypeChange}
          >
            {QUESTION_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Type-specific editor */}
        {question.type === 'rating' && <RatingEditor question={question} />}
        {question.type === 'nps' && (
          <>
            <div className={styles.field}>
              <label className={styles.label}>Sort</label>
              <select
                name="npsSort"
                className={styles.nativeSelect}
                defaultValue="0-10"
              >
                {NPS_SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
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
            <TextArea
              name="welcomeDescription"
              label="Description"
              value={question.welcomeConfig?.description ?? ''}
              onChange={(_event: unknown, value: string) =>
                dispatch(surveyActions.updateWelcomeConfig({
                  questionId: question.id,
                  updates: { description: String(value ?? '') },
                }))
              }
              rows={3}
              autoSize={false}
              noFloatingLabel
            />
            <FormInput
              name="welcomeButtonText"
              type="text"
              label="Button text"
              value={question.welcomeConfig?.buttonText ?? ''}
              onChange={(_event: unknown, value: string) =>
                dispatch(surveyActions.updateWelcomeConfig({
                  questionId: question.id,
                  updates: { buttonText: String(value ?? '') },
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
              <FormInput
                name="thankYouRedirectUrl"
                type="text"
                label="Redirect URL"
                value={question.thankYouConfig?.redirectUrl ?? ''}
                placeholder="https://example.com"
                onChange={(_event: unknown, value: string) =>
                  dispatch(surveyActions.updateThankYouConfig({
                    questionId: question.id,
                    updates: { redirectUrl: String(value ?? '') },
                  }))
                }
              />
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

          <div className={styles.logicList}>
            <button type="button" className={styles.logicBtn} aria-label="Add skip logic">
              <IconSkipLogic size={20} />
              <span>Skip logic</span>
            </button>

            <button type="button" className={styles.logicBtn} aria-label="Add display logic">
              <IconDisplayLogic size={20} />
              <span>Display logic</span>
            </button>

            <button type="button" className={styles.logicBtn} aria-label="Reorder question">
              <IconReorder size={20} />
              <span>Reorder question</span>
            </button>
          </div>
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
