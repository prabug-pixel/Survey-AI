import React, { useState } from 'react';
import attachFileIcon from '../../../../assets/figma-icons/attach-file.svg';
import editNoteIcon from '../../../../assets/figma-icons/edit-note.svg';
import moreHorizIcon from '../../../../assets/figma-icons/more-horiz.svg';
import templateIcon from '../../../../assets/figma-icons/template-icon.svg';
import importContactsIcon from '../../../../assets/figma-icons/import-contacts.svg';
import paperPlaneIcon from '../../../../assets/figma-icons/paper-plane.svg';
import styles from './ChatInput.module.scss';

interface ChatInputProps {
  onSend: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
  const [value, setValue] = useState('');

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.promptBox}>
      {/* Placeholder text area */}
      <div className={styles.inputArea}>
        <textarea
          className={styles.textarea}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={'What type of survey would you like to build?\n@mention to apply logics'}
          rows={2}
        />
      </div>

      {/* Figma: Actions row — icons + send button */}
      <div className={styles.actionsRow}>
        <div className={styles.leftActions}>
          <button className={styles.actionIcon} aria-label="Attach file">
            <img src={attachFileIcon} alt="" className={styles.icon24} />
          </button>
          <button className={styles.actionIcon} aria-label="Edit note">
            <img src={editNoteIcon} alt="" className={styles.icon20} />
          </button>
          <button className={styles.actionIcon} aria-label="More options">
            <img src={moreHorizIcon} alt="" className={styles.icon24} />
          </button>
          <button className={styles.actionIcon} aria-label="Templates">
            <img src={templateIcon} alt="" className={styles.icon20} />
          </button>
          <button className={styles.actionIcon} aria-label="Import contacts">
            <img src={importContactsIcon} alt="" className={styles.icon20} />
          </button>
        </div>
        <button
          className={styles.sendBtn}
          onClick={handleSend}
          disabled={!value.trim()}
          aria-label="Send"
        >
          <img src={paperPlaneIcon} alt="" className={styles.icon24} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
