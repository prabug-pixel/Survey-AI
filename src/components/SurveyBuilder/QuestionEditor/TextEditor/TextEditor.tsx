import React from 'react';
import type { Question } from '../../../../types/survey.types';
import styles from './TextEditor.module.scss';

interface TextEditorProps {
  question: Question;
}

const TextEditor: React.FC<TextEditorProps> = ({ question }) => (
  <div className={styles.textEditor}>
    <label className={styles.label}>Placeholder text</label>
    <input
      name="placeholder"
      type="text"
      value={question.placeholder || ''}
      disabled
      className={styles.nativeInput}
    />
    <p className={styles.hint}>
      Respondents will see a text area to type their answer.
    </p>
  </div>
);

export default TextEditor;
