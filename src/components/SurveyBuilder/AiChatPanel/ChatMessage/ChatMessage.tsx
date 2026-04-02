import React from 'react';
import type { ChatMessage as ChatMessageType } from '../../../../types/survey.types';
import aiAvatarIcon from '../../../../assets/figma-icons/ai-avatar.svg';
import checkboxIcon from '../../../../assets/figma-icons/checkbox.svg';
import styles from './ChatMessage.module.scss';

interface ChatMessageProps {
  message: ChatMessageType;
  onQuickAction?: (actionId: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onQuickAction }) => {
  const isAi = message.role === 'ai';

  return (
    <div className={styles.messageRow}>
      {/* Figma: Avatar — 20px AI avatar */}
      {isAi && (
        <div className={styles.avatar}>
          <img src={aiAvatarIcon} alt="" className={styles.avatarImg} />
        </div>
      )}

      <div className={styles.content}>
        {/* Message text */}
        <div className={styles.messageText}>
          {message.content.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < message.content.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>

        {/* Figma: Option tabs — quick action buttons with checkbox icon */}
        {message.quickActions && message.quickActions.length > 0 && (
          <div className={styles.quickActions}>
            {message.quickActions.map((action) => (
              <button
                key={action.id}
                className={styles.optionTab}
                onClick={() => onQuickAction?.(action.id)}
              >
                <img src={checkboxIcon} alt="" className={styles.checkboxIcon} />
                <span className={styles.optionLabel}>{action.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
