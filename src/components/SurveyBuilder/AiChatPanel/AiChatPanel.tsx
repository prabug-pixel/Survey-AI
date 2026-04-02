import React, { useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../../store';
import { chatActions } from '../../../store/chatSlice';
import { surveyActions } from '../../../store/surveySlice';
import { SAMPLE_CHAT_CSAT } from '../../../constants/sampleSurvey';
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
    // Simulate selecting CSAT Survey and generating
    dispatch(chatActions.addUserMessage(
      actionId === 'csat' ? 'CSAT Survey' :
      actionId === 'nps' ? 'NPS Survey' :
      actionId === 'post_purchase' ? 'Post purchase survey' : 'Others'
    ));

    // Simulate AI conversation flow
    dispatch(chatActions.setTyping(true));
    setTimeout(() => {
      dispatch(chatActions.setTyping(false));
      dispatch(chatActions.setChatHistory(SAMPLE_CHAT_CSAT));
      dispatch(surveyActions.loadSampleSurvey());
    }, 800);
  };

  const handleSend = (message: string) => {
    dispatch(chatActions.addUserMessage(message));

    // Simulate AI response
    dispatch(chatActions.setTyping(true));
    setTimeout(() => {
      dispatch(chatActions.setTyping(false));

      if (!surveyGenerated) {
        // First message triggers survey generation flow
        dispatch(chatActions.setChatHistory(SAMPLE_CHAT_CSAT));
        dispatch(surveyActions.loadSampleSurvey());
      } else {
        dispatch(chatActions.addAiMessage({
          content: "Great suggestion, I've added a few targeted questions to help identify issues and capture staff-specific feedback.",
        }));
      }
    }, 800);
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
