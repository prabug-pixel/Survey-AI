import React, { useState, useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../../../store';
import { chatActions } from '../../../../store/chatSlice';
import { IconClose } from '../../../../shared/Icons/Icons';
import attachFileIcon from '../../../../assets/icons/attach_file.svg';
import editNoteIcon from '../../../../assets/icons/edit_note.svg';
import moreHorizIcon from '../../../../assets/icons/more_horiz.svg';
import styles from './ChatInput.module.scss';

interface ChatInputProps {
  onSend: (message: string) => void;
  showMention?: boolean;
}

const SendIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M20 11.9898C20.0006 12.2189 19.9402 12.444 19.8251 12.6418C19.7101 12.8397 19.5445 13.003 19.3455 13.115L5.9105 20.8312C5.71748 20.9412 5.4995 20.9993 5.2776 21C5.07297 20.9996 4.87141 20.9499 4.68983 20.8551C4.50826 20.7603 4.35195 20.6232 4.23401 20.4552C4.11607 20.2872 4.03994 20.0933 4.01199 19.8897C3.98405 19.6861 4.00511 19.4787 4.07341 19.2849L6.26176 12.8594C6.28332 12.7958 6.32417 12.7406 6.37856 12.7016C6.43295 12.6625 6.49815 12.6415 6.56501 12.6416H12.3187C12.4065 12.6418 12.4933 12.6239 12.5739 12.5889C12.6545 12.554 12.727 12.5028 12.787 12.4385C12.8471 12.3742 12.8933 12.2982 12.9229 12.2152C12.9524 12.1322 12.9647 12.044 12.9589 11.9561C12.9443 11.7907 12.8682 11.637 12.7456 11.5257C12.6231 11.4144 12.4632 11.3536 12.2979 11.3557H6.57061C6.50385 11.3558 6.43872 11.335 6.38434 11.2961C6.32996 11.2571 6.28906 11.2021 6.26736 11.1387L4.07181 4.70917C3.98631 4.4628 3.97744 4.19613 4.04639 3.94458C4.11534 3.69303 4.25883 3.4685 4.45783 3.3008C4.65682 3.1331 4.90189 3.03017 5.1605 3.00568C5.41911 2.98119 5.67901 3.03629 5.9057 3.16367L19.3479 10.8703C19.5456 10.9821 19.7102 11.1447 19.8248 11.3414C19.9394 11.5381 19.9998 11.7619 20 11.9898Z" fill={color} />
  </svg>
);

const ChatInput: React.FC<ChatInputProps> = ({ onSend, showMention = false }) => {
  const dispatch = useAppDispatch();
  const mentionedQuestionId = useAppSelector((s) => s.chat.mentionedQuestionId);
  const survey = useAppSelector((s) => s.survey.survey);
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      <div className={`${styles.promptBox} ${mentionedQuestion ? styles.promptBoxSelected : ''}`}>
        {mentionedQuestion && (
          <div className={styles.mentionBadge}>
            <span className={styles.mentionNumber}>{mentionedQuestion.order}</span>
            <span className={styles.mentionIcon}>
              {mentionedQuestion.type === 'rating' ? '\u2605' : '\u25C9'}
            </span>
            <span className={styles.mentionText}>{mentionedQuestion.text.substring(0, 30)}...</span>
            <button className={styles.mentionClose} onClick={removeMention} aria-label="Remove mention">
              <IconClose size={14} color="#9e9e9e" />
            </button>
          </div>
        )}

        <div className={styles.textareaWrap}>
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
            rows={2}
          />
        </div>

        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <button className={styles.toolBtn} title="Attach file" aria-label="Attach file">
              <img src={attachFileIcon} alt="" width={24} height={24} />
            </button>
            <button className={styles.toolBtn} title="Enhance prompt" aria-label="Enhance prompt">
              <img src={editNoteIcon} alt="" width={20} height={20} />
            </button>
            <button className={styles.toolBtn} title="More options" aria-label="More options">
              <img src={moreHorizIcon} alt="" width={24} height={24} />
            </button>
          </div>
          <button
            className={styles.sendBtn}
            onClick={handleSend}
            disabled={!value.trim()}
            aria-label="Send message"
          >
            <SendIcon
              color={
                !value.trim()
                  ? '#CCCCCC'
                  : mentionedQuestion
                  ? '#7C3AED'
                  : '#1976d2'
              }
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
