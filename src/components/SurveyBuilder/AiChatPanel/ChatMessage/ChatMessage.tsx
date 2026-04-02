import React from 'react';
import type { ChatMessage as ChatMessageType } from '../../../../types/survey.types';
import styles from './ChatMessage.module.scss';

interface ChatMessageProps {
  message: ChatMessageType;
  onQuickAction?: (actionId: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onQuickAction }) => {
  const isAi = message.role === 'ai';

  return (
    <div className={`${styles.messageRow} ${isAi ? styles.ai : styles.user}`}>
      {isAi && (
        <div className={styles.avatar}>
          <div className={styles.aiAvatar}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#1a73e8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      )}
      {!isAi && (
        <div className={styles.avatar}>
          <div className={styles.userAvatar}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="12" cy="7" r="4" stroke="#fff" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      )}

      <div className={styles.content}>
        <div className={`${styles.bubble} ${isAi ? styles.aiBubble : styles.userBubble}`}>
          {message.content.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < message.content.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>

        {message.quickActions && message.quickActions.length > 0 && (
          <div className={styles.quickActions}>
            {message.quickActions.map((action) => (
              <button
                key={action.id}
                className={styles.quickActionBtn}
                onClick={() => onQuickAction?.(action.id)}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
