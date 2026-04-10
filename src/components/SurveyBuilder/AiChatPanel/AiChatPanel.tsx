import React, { useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../../store';
import { processMessage } from '../../../store/chatSlice';
import TabSwitcher from '../TabSwitcher/TabSwitcher';
import ChatMessage from './ChatMessage/ChatMessage';
import ChatInput from './ChatInput/ChatInput';
import CreateManuallyPanel from './CreateManuallyPanel/CreateManuallyPanel';
import aiAvatarGif from '../../../assets/download.gif';
import styles from './AiChatPanel.module.scss';

const AiChatPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const messages = useAppSelector((s) => s.chat.messages);
  const isTyping = useAppSelector((s) => s.chat.isTyping);
  const surveyGenerated = useAppSelector((s) => s.survey.surveyGenerated);
  const activeTab = useAppSelector((s) => s.survey.activeTab);
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

      {activeTab === 'manual' ? (
        <CreateManuallyPanel />
      ) : (
        <>
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
                <img src={aiAvatarGif} alt="" className={styles.typingAvatar} />
                <span className={styles.typingText}>Working on it...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <ChatInput onSend={handleSend} showMention={surveyGenerated} />
        </>
      )}
    </div>
  );
};

export default AiChatPanel;
