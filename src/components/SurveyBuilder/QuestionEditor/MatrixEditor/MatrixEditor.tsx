import React from 'react';
import { useAppDispatch } from '../../../../store';
import { surveyActions } from '../../../../store/surveySlice';
import type { Question, MatrixRow } from '../../../../types/survey.types';
import SingleSelect from '@birdeye/elemental/core/atoms/SingleSelect';
import FormInput from '@birdeye/elemental/core/atoms/FormInput';
import Button from '@birdeye/elemental/core/atoms/Button';
import { IconClose } from '../../../../shared/Icons/Icons';
import styles from './MatrixEditor.module.scss';

interface MatrixEditorProps {
  question: Question;
}

const SCALE_OPTIONS = [
  { value: 3, label: '3' },
  { value: 5, label: '5' },
  { value: 7, label: '7' },
];

const MatrixEditor: React.FC<MatrixEditorProps> = ({ question }) => {
  const dispatch = useAppDispatch();
  const config = question.matrixConfig;

  if (!config) return null;

  const handleRowChange = (rowId: string, label: string) => {
    dispatch(surveyActions.updateMatrixRow({ questionId: question.id, rowId, label }));
  };

  const handleAddRow = () => {
    dispatch(surveyActions.addMatrixRow(question.id));
  };

  const handleRemoveRow = (rowId: string) => {
    dispatch(surveyActions.removeMatrixRow({ questionId: question.id, rowId }));
  };

  const handleScaleChange = (option: { value: string | number }) => {
    dispatch(surveyActions.updateMatrixColumnScale({ questionId: question.id, scale: Number(option.value) }));
  };

  return (
    <div className={styles.matrixEditor}>
      {question.type !== 'matrix_dropdown' && (
        <div className={styles.field}>
          <label className={styles.label}>Column scale</label>
          <SingleSelect
            options={SCALE_OPTIONS}
            selected={config.columnScale}
            onChange={handleScaleChange}
            name="matrixScale"
            className={styles.scaleSelect}
          />
        </div>
      )}

      <div className={styles.section}>
        <label className={styles.sectionLabel}>
          {question.type === 'matrix_dropdown' ? 'Category' : 'Rows'}
        </label>
        <div className={styles.rowsList}>
          {config.rows.map((row: MatrixRow) => (
            <div key={row.id} className={styles.rowItem}>
              <FormInput
                name={`row-${row.id}`}
                value={row.label}
                onChange={(_: unknown, e: React.ChangeEvent<HTMLInputElement>) => handleRowChange(row.id, e.target.value)}
                noFloatingLabel
                className={styles.rowInput}
              />
              <button 
                className={styles.removeBtn} 
                onClick={() => handleRemoveRow(row.id)}
                aria-label="Remove row"
              >
                <IconClose size={14} color="#757575" />
              </button>
            </div>
          ))}
        </div>
        <button className={styles.addBtn} onClick={handleAddRow}>
          + Add rows
        </button>
      </div>

      {question.type === 'matrix_dropdown' && question.choices && (
        <div className={styles.section}>
          <label className={styles.sectionLabel}>Dropdown choices</label>
          <div className={styles.rowsList}>
            {question.choices.map((choice) => (
              <div key={choice.id} className={styles.rowItem}>
                <FormInput
                  name={`choice-${choice.id}`}
                  value={choice.label}
                  onChange={(_: unknown, e: React.ChangeEvent<HTMLInputElement>) => 
                    dispatch(surveyActions.updateChoiceOption({ 
                      questionId: question.id, 
                      optionId: choice.id, 
                      label: e.target.value 
                    }))
                  }
                  noFloatingLabel
                  className={styles.rowInput}
                />
                <button 
                  className={styles.removeBtn} 
                  onClick={() => dispatch(surveyActions.removeChoiceOption({ questionId: question.id, optionId: choice.id }))}
                  aria-label="Remove choice"
                >
                  <IconClose size={14} color="#757575" />
                </button>
              </div>
            ))}
          </div>
          <button className={styles.addBtn} onClick={() => dispatch(surveyActions.addChoiceOption(question.id))}>
            + Add choices
          </button>
        </div>
      )}
    </div>
  );
};

export default MatrixEditor;
