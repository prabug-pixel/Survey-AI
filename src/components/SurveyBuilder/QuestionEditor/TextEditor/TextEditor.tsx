import React from 'react';
import type { Question } from '../../../../types/survey.types';
import FormInput from '@birdeye/elemental/core/atoms/FormInput';
import styles from './TextEditor.module.scss';

interface TextEditorProps {
  question: Question;
}

const TextEditor: React.FC<TextEditorProps> = ({ question }) => (
  <div className={styles.textEditor}>
    <FormInput
      name="placeholder"
      type="text"
      value={question.placeholder || ''}
      label="Placeholder text"
      disabled
    />
    <p className={styles.hint}>
      Respondents will see a text area to type their answer.
    </p>
  </div>
);

export default TextEditor;
