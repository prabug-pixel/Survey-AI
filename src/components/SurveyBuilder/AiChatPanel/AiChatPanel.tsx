import React, { useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../../store';
import { processMessage } from '../../../store/chatSlice';
import TabSwitcher from '../TabSwitcher/TabSwitcher';
import ChatMessage from './ChatMessage/ChatMessage';
import ChatInput from './ChatInput/ChatInput';
import styles from './AiChatPanel.module.scss';

const AiChatPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const messages = useAppSelector((s) => s.chat.messages);
  const isTyping = useAppSelector((s) => s.chat.isTyping);
  const surveyGenerated = useAppSelector((s) => s.survey.surveyGenerated);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleQuickAction = (actionId: string) => {
    const labels: Record<string, string> = {
      csat: 'CSAT Survey',
      nps: 'NPS Survey',
      post_purchase: 'Post purchase survey',
      others: 'I want to create a custom survey',
    };
    dispatch(processMessage(labels[actionId] || actionId) as never);
  };

  const handleSend = (message: string) => {
    dispatch(processMessage(message) as never);
  };

  return (
    <div className={styles.chatPanel}>
      <TabSwitcher />

      <div className={styles.messagesArea}>
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            onQuickAction={handleQuickAction}
          />
        ))}

        {isTyping && (
          <div className={styles.typingRow}>
            <div className={styles.typingAvatar}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#1a73e8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className={styles.typingIndicator}>
              <span /><span /><span />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={handleSend} showMention={surveyGenerated} />
    </div>
  );
};

export default AiChatPanel;
