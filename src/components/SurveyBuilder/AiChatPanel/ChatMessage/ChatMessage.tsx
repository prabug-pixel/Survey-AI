import React from 'react';
import type { ChatMessage as ChatMessageType } from '../../../../types/survey.types';
import aiAvatarSvg from '../../../../assets/ai-avatar.svg';
import styles from './ChatMessage.module.scss';

interface ChatMessageProps {
  message: ChatMessageType;
  onQuickAction?: (actionId: string) => void;
}

const UserAvatar: React.FC = () => (
  <div className={styles.userAvatarFallback}>
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="7" r="4" stroke="#fff" strokeWidth="2" />
    </svg>
  </div>
);

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onQuickAction }) => {
  const isAi = message.role === 'ai';

  return (
    <div className={styles.messageRow}>
      <div className={styles.avatar}>
        {isAi ? <img src={aiAvatarSvg} alt="AI" className={styles.aiAvatar} /> : <UserAvatar />}
      </div>

      <div className={styles.content}>
        <div className={styles.bubble}>
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
