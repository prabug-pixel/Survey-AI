import React from 'react';
import { useAppDispatch } from '../../../../store';
import { surveyActions } from '../../../../store/surveySlice';
import type { Question } from '../../../../types/survey.types';
import Button from '@birdeye/elemental/core/atoms/Button';
import Tooltip from '@birdeye/elemental/core/atoms/Tooltip';
import { IconClose } from '../../../../shared/Icons/Icons';
import styles from './MultipleChoiceEditor.module.scss';

interface MultipleChoiceEditorProps {
  question: Question;
}

const MultipleChoiceEditor: React.FC<MultipleChoiceEditorProps> = ({ question }) => {
  const dispatch = useAppDispatch();
  const choices = question.choices || [];
  const indicatorClass =
    question.type === 'checkboxes' ? styles.checkbox :
    question.type === 'dropdown' ? styles.dropdownIndicator :
    styles.radio;

  return (
    <div className={styles.choiceEditor}>
      <div className={styles.optionList}>
        {choices.map((choice) => (
          <div key={choice.id} className={styles.optionRow}>
            <span className={indicatorClass} />
            <input
              name={`option-${choice.id}`}
              type="text"
              value={choice.label}
              onChange={(e) =>
                dispatch(surveyActions.updateChoiceOption({
                  questionId: question.id,
                  optionId: choice.id,
                  label: e.target.value,
                }))
              }
              className={styles.optionInput}
            />
            <Tooltip text="Remove option" position="top" hideOnScroll>
              <button
                className={styles.removeBtn}
                onClick={() =>
                  dispatch(surveyActions.removeChoiceOption({
                    questionId: question.id,
                    optionId: choice.id,
                  }))
                }
                aria-label={`Remove option ${choice.label}`}
              >
                <IconClose size={12} color="#9e9e9e" />
              </button>
            </Tooltip>
          </div>
        ))}
      </div>

      <Button
        label="Add option"
        theme="link"
        onClick={() => dispatch(surveyActions.addChoiceOption(question.id))}
        icon="icon_phoenix-plus"
        className={styles.addBtn}
      />
    </div>
  );
};

export default MultipleChoiceEditor;
