import React, { useState, useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../../../store';
import { chatActions } from '../../../../store/chatSlice';
import { IconSend, IconAttach, IconCode, IconMore, IconAtSign, IconClose } from '../../../../shared/Icons/Icons';
import styles from './ChatInput.module.scss';

interface ChatInputProps {
  onSend: (message: string) => void;
  showMention?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, showMention = false }) => {
  const dispatch = useAppDispatch();
  const mentionedQuestionId = useAppSelector((s) => s.chat.mentionedQuestionId);
  const survey = useAppSelector((s) => s.survey.survey);
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Find mentioned question text
  const mentionedQuestion = mentionedQuestionId && survey
    ? survey.pages.flatMap((p) => p.questions).find((q) => q.id === mentionedQuestionId)
    : null;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const removeMention = () => {
    dispatch(chatActions.setMentionedQuestion(null));
  };

  return (
    <div className={styles.chatInputWrapper}>
      {mentionedQuestion && (
        <div className={styles.mentionBadge}>
          <span className={styles.mentionNumber}>{mentionedQuestion.order}</span>
          <span className={styles.mentionIcon}>
            {mentionedQuestion.type === 'rating' ? '\u2605' : '\u25C9'}
          </span>
          <span className={styles.mentionText}>{mentionedQuestion.text.substring(0, 30)}...</span>
          <button className={styles.mentionClose} onClick={removeMention} aria-label="Remove mention">
            <IconClose size={12} color="#757575" />
          </button>
        </div>
      )}
      <div className={styles.inputRow}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={mentionedQuestion
            ? 'Describe what you want to modify and\n@mention to apply logics'
            : 'What type of survey would you like to build?\n@mention to apply logics'
          }
          rows={1}
        />
      </div>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          {showMention && (
            <button className={styles.toolBtn} title="Mention question" aria-label="Mention question">
              <IconAtSign size={16} color="#9e9e9e" />
            </button>
          )}
          <button className={styles.toolBtn} title="Attach file" aria-label="Attach file">
            <IconAttach size={16} color="#9e9e9e" />
          </button>
          <button className={styles.toolBtn} title="Code" aria-label="Code">
            <IconCode size={16} color="#9e9e9e" />
          </button>
          <button className={styles.toolBtn} title="More" aria-label="More options">
            <IconMore size={16} color="#9e9e9e" />
          </button>
        </div>
        <button
          className={`${styles.sendBtn} ${value.trim() ? styles.active : ''}`}
          onClick={handleSend}
          disabled={!value.trim()}
          aria-label="Send message"
        >
          <IconSend size={16} color={value.trim() ? '#1a73e8' : '#bdbdbd'} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
