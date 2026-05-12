import React from 'react';
import { useAppDispatch } from '../../../../store';
import { surveyActions } from '../../../../store/surveySlice';
import type { Question } from '../../../../types/survey.types';
import Toggle from '@birdeye/elemental/core/atoms/Toggle';
import { IconClose } from '../../../../shared/Icons/Icons';
import styles from './ContactInfoEditor.module.scss';

interface ContactInfoEditorProps {
  question: Question;
}

const ContactInfoEditor: React.FC<ContactInfoEditorProps> = ({ question }) => {
  const dispatch = useAppDispatch();
  const config = question.contactInfoConfig;

  if (!config) return null;

  const handleToggleField = (fieldId: string, enabled: boolean) => {
    dispatch(surveyActions.updateContactInfoField({ 
      questionId: question.id, 
      fieldId, 
      enabled 
    }));
  };

  return (
    <div className={styles.contactEditor}>
      <div className={styles.section}>
        <label className={styles.label}>Fields</label>
        <div className={styles.fieldsList}>
          {config.fields.map((field) => (
            <div key={field.id} className={styles.fieldItem}>
              <span className={styles.fieldName}>{field.label}</span>
              <button 
                className={styles.removeBtn}
                onClick={() => handleToggleField(field.id, false)}
                disabled={!field.enabled}
              >
                <IconClose size={14} color={field.enabled ? "#757575" : "#e0e0e0"} />
              </button>
            </div>
          ))}
        </div>
        <button className={styles.addBtn}>
          + Add field
        </button>
      </div>

      <div className={styles.toggleSection}>
        <div className={styles.toggleRow}>
          <span className={styles.toggleLabel}>Save contact information on Birdeye if not already present</span>
          <Toggle
            checked={config.saveToBirdeye}
            onChange={() => dispatch(surveyActions.toggleSaveToBirdeye(question.id))}
            name="saveToBirdeye"
            className=""
          />
        </div>
      </div>
    </div>
  );
};

export default ContactInfoEditor;
