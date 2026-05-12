import React from 'react';
import Tooltip from '@birdeye/elemental/core/atoms/Tooltip';
import FormInput from '@birdeye/elemental/core/atoms/FormInput';
import { IconInfo } from '../../../../shared/Icons/Icons';
import type { Question } from '../../../../types/survey.types';
import styles from './TextEditor.module.scss';

interface TextEditorProps {
  question: Question;
}

const TextEditor: React.FC<TextEditorProps> = ({ question }) => (
  <div className={styles.textEditor}>
    <div className={styles.labelRow}>
      <span className={styles.label}>Placeholder text</span>
      <Tooltip text="Respondents will see a text area to type their answer." position="right" hideOnScroll>
        <button type="button" className={styles.infoIconBtn} aria-label="Placeholder text info">
          <IconInfo size={14} />
        </button>
      </Tooltip>
    </div>
    <FormInput
      name="placeholder"
      type="text"
      value={question.placeholder || ''}
      disabled
    />
  </div>
);

export default TextEditor;
