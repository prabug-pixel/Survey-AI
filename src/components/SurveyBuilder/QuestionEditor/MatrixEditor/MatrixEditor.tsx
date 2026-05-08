import React from 'react';
import { useAppDispatch } from '../../../../store';
import { surveyActions } from '../../../../store/surveySlice';
import type { Question, MatrixRow } from '../../../../types/survey.types';
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

  const handleScaleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(surveyActions.updateMatrixColumnScale({ questionId: question.id, scale: Number(e.target.value) }));
  };

  return (
    <div className={styles.matrixEditor}>
      {question.type !== 'matrix_dropdown' && (
        <div className={styles.field}>
          <label className={styles.label}>Column scale</label>
          <select
            name="matrixScale"
            className={styles.nativeSelect}
            value={config.columnScale}
            onChange={handleScaleChange}
          >
            {SCALE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.section}>
        <label className={styles.sectionLabel}>
          {question.type === 'matrix_dropdown' ? 'Category' : 'Rows'}
        </label>
        <div className={styles.rowsList}>
          {config.rows.map((row: MatrixRow) => (
            <div key={row.id} className={styles.rowItem}>
              <input
                name={`row-${row.id}`}
                type="text"
                value={row.label}
                onChange={(e) => handleRowChange(row.id, e.target.value)}
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
                <input
                  name={`choice-${choice.id}`}
                  type="text"
                  value={choice.label}
                  onChange={(e) =>
                    dispatch(surveyActions.updateChoiceOption({
                      questionId: question.id,
                      optionId: choice.id,
                      label: e.target.value,
                    }))
                  }
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
