import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { surveyActions } from '../../../../store/surveySlice';
import { chatActions } from '../../../../store/chatSlice';
import type { Question } from '../../../../types/survey.types';
import Tooltip from '@birdeye/elemental/core/atoms/Tooltip';
import TextArea from '@birdeye/elemental/core/atoms/TextArea';
import RatingScale from '../../../../shared/RatingScale/RatingScale';
import RadioOption from '../../../../shared/RadioOption/RadioOption';
import { IconDragHandle, IconCodeConnect, IconTrash, IconClose, IconPlus, IconLocation, IconStar } from '../../../../shared/Icons/Icons';
import Checkbox from '../../../../shared/Checkbox/Checkbox';
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

      {question.type === 'nps' && question.ratingConfig && (
        <div className={styles.questionBody}>
          <RatingScale
            scale={question.ratingConfig.scale}
            lowLabel={question.ratingConfig.highLabel}
            highLabel={question.ratingConfig.lowLabel}
            startFromZero
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
          {isActive && (
            <button 
              className={styles.addOptionBtn}
              onClick={() => dispatch(surveyActions.addChoiceOption(question.id))}
            >
              <IconPlus size={14} />
              <span>Add option</span>
            </button>
          )}
        </div>
      )}

      {/* Checkboxes & Dropdown */}
      {(question.type === 'checkboxes' || question.type === 'dropdown') && question.choices && (
        <div className={styles.questionBody}>
          {question.type === 'checkboxes' ? (
            question.choices.map((choice) => (
              <Checkbox key={choice.id} label={choice.label} checked={false} onChange={() => {}} name={`q-${question.id}`} />
            ))
          ) : (
            <select
              name={`q-${question.id}`}
              className={styles.previewSelect}
              defaultValue=""
              disabled
            >
              <option value="" disabled>Select option</option>
              {question.choices.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Matrix Questions */}
      {(question.type === 'matrix_radio' || question.type === 'matrix_ratings' || question.type === 'matrix_dropdown') && question.matrixConfig && (
        <div className={styles.matrixBody}>
          {question.type !== 'matrix_dropdown' && (
            <div className={styles.matrixHeader}>
              <div className={styles.rowLabelStub}></div>
              <div className={styles.matrixScaleLabels}>
                {isActive ? (
                  <input
                    className={styles.matrixLabelInput}
                    value={question.matrixConfig.lowLabel ?? ''}
                    placeholder="Low label"
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      dispatch(surveyActions.updateMatrixLabels({ questionId: question.id, lowLabel: e.target.value }))
                    }
                  />
                ) : (
                  <span className={styles.matrixLowLabel}>{question.matrixConfig.lowLabel}</span>
                )}
                {isActive ? (
                  <input
                    className={styles.matrixLabelInput}
                    value={question.matrixConfig.highLabel ?? ''}
                    placeholder="High label"
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      dispatch(surveyActions.updateMatrixLabels({ questionId: question.id, highLabel: e.target.value }))
                    }
                  />
                ) : (
                  <span className={styles.matrixHighLabel}>{question.matrixConfig.highLabel}</span>
                )}
              </div>
            </div>
          )}
          {question.matrixConfig.rows.map((row) => (
            <div key={row.id} className={styles.matrixRow}>
              {isActive ? (
                <input
                  className={styles.rowLabelInput}
                  value={row.label}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    dispatch(surveyActions.updateMatrixRow({ questionId: question.id, rowId: row.id, label: e.target.value }))
                  }
                />
              ) : (
                <div className={styles.rowLabel}>{row.label}</div>
              )}
              {question.type === 'matrix_dropdown' ? (
                <div className={styles.matrixDropdownCell}>
                  <select
                    name={`row-${row.id}`}
                    className={styles.previewSelect}
                    defaultValue=""
                    disabled
                  >
                    <option value="" disabled>Select</option>
                    {(question.choices || []).map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                  {isActive && (
                    <button className={styles.removeRowBtn} onClick={(e) => {
                      e.stopPropagation();
                      dispatch(surveyActions.removeMatrixRow({ questionId: question.id, rowId: row.id }));
                    }}>
                      <IconClose size={14} />
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {Array.from({ length: question.matrixConfig!.columnScale }, (_, i) => (
                    <div key={i} className={styles.matrixRatingCell}>{i + 1}</div>
                  ))}
                  {isActive && (
                    <button className={styles.removeRowBtn} onClick={(e) => {
                      e.stopPropagation();
                      dispatch(surveyActions.removeMatrixRow({ questionId: question.id, rowId: row.id }));
                    }}>
                      <IconClose size={14} />
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
          {isActive && (
            <button className={styles.addMatrixRowBtn} onClick={(e) => {
              e.stopPropagation();
              dispatch(surveyActions.addMatrixRow(question.id));
            }}>
              <IconPlus size={14} />
              <span>Add rows</span>
            </button>
          )}
        </div>
      )}

      {/* Contact Info */}
      {question.type === 'contact_info' && question.contactInfoConfig && (
        <div className={styles.contactBody}>
          <div className={styles.contactFields}>
            {question.contactInfoConfig.fields.filter(f => f.enabled).map((field) => (
              <div key={field.id} className={styles.contactFieldRow}>
                <div className={styles.contactInputStub}>{field.label}</div>
                {isActive && (
                  <button className={styles.removeFieldBtn} onClick={(e) => {
                    e.stopPropagation();
                    dispatch(surveyActions.updateContactInfoField({ questionId: question.id, fieldId: field.id, enabled: false }));
                  }}>
                    <IconClose size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {isActive && (
            <button className={styles.addBtnSmall}>
              <IconPlus size={14} />
              <span>Add field</span>
            </button>
          )}
        </div>
      )}

      {/* Date / Time */}
      {question.type === 'date_time' && question.dateTimeConfig && (
        <div className={styles.dateTimeBody}>
          <div className={styles.dateTimeConfigRow}>
            <Checkbox checked={question.dateTimeConfig.includeDate} label="Date" name="date" onChange={() => {}} />
            <Checkbox checked={question.dateTimeConfig.includeTime} label="Time" name="time" onChange={() => {}} />
          </div>
          <div className={styles.dateTimeInputs}>
            <div className={styles.timeSelectStub}>10:00 AM</div>
            <div className={styles.timeSelectStub}>06:00 PM</div>
            <div className={styles.timeSelectStub}>30 mins</div>
          </div>
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

      {question.type === 'short_text' && (
        <div className={styles.questionBody}>
          <div className={styles.shortTextStub}>
            {question.placeholder || 'Short answer text'}
          </div>
        </div>
      )}

      {question.type === 'paragraph' && (
        <div className={styles.questionBody}>
          <TextArea
            name={`q-paragraph-${question.id}`}
            value=""
            placeholder={question.placeholder || 'Long answer text'}
            disabled
            rows={4}
            noFloatingLabel
            noBorder={false}
            className={styles.textArea}
          />
        </div>
      )}

      {/* Location */}
      {question.type === 'location' && question.locationConfig && (
        <div className={styles.locationBody}>
          <div className={styles.locationDropdownStub}>
            <IconLocation size={16} color="#757575" />
            <span>{question.locationConfig.locationChoices}</span>
          </div>
          <Checkbox checked={question.locationConfig.showAlias} label="Show alias location name" name="showAlias" onChange={() => {}} />
        </div>
      )}

      {/* Review Collector */}
      {question.type === 'review_collector' && (
        <div className={styles.reviewBody}>
          <div className={styles.starRow}>
            {[1, 2, 3, 4, 5].map(i => <IconStar key={i} size={24} color="#bdbdbd" />)}
          </div>
          <div className={styles.feedbackStub}>Share your feedback</div>
          <div className={styles.reviewFooter}>
            <div className={styles.sourceIcons}>
              <div className={styles.sourceCircle}>G</div>
              <div className={styles.sourceCircle}>B</div>
            </div>
          </div>
        </div>
      )}

      {/* Page Title */}
      {question.type === 'page_title' && (
        <div className={styles.questionBody}>
          <div className={styles.shortTextStub}>Page title</div>
        </div>
      )}

      {/* Page Break */}
      {question.type === 'page_break' && (
        <div className={styles.questionBody}>
          <hr style={{ border: 'none', borderTop: '2px dashed #e0e0e0', margin: '8px 0' }} />
        </div>
      )}

      {/* Help Text */}
      {question.type === 'help_text' && (
        <div className={styles.questionBody}>
          <div className={styles.shortTextStub}>Help text content</div>
        </div>
      )}

      {/* Review Request */}
      {question.type === 'review_request' && (
        <div className={styles.questionBody}>
          <div className={styles.shortTextStub}>Leave us a review</div>
        </div>
      )}

      {/* Welcome & Thank You */}
      {question.type === 'welcome' && (
        <div className={styles.welcomeBody}>
          <p className={styles.welcomeDesc}>{question.welcomeConfig?.description || 'Welcome to our survey'}</p>
          <button className={styles.welcomeBtn}>{question.welcomeConfig?.buttonText || 'Start Survey'}</button>
        </div>
      )}

      {/* Thank You */}
      {question.type === 'thank_you' && (
        <div className={styles.thankYouBody}>
          <h2 className={styles.thankYouTitle}>Thank you!</h2>
          <p className={styles.thankYouText}>Thank you for taking the survey!</p>
          {question.thankYouConfig?.showRedirect && (
            <div className={styles.redirectLink}>Redirecting to {question.thankYouConfig.redirectUrl}</div>
          )}
        </div>
      )}

      {question.skipLogicRules && question.skipLogicRules.length > 0 && isActive && (
        <SkipLogicBadge rules={question.skipLogicRules} allQuestions={allQuestions} />
      )}
    </div>
  );
};

export default QuestionCard;
