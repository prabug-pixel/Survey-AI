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
    const labels: Record<string, string> = {
      csat: 'CSAT Survey',
      nps: 'NPS Survey',
      post_visit: 'Post-visit dental feedback',
      patient_experience: 'Patient experience survey',
      others: 'Others',
    };
    dispatch(chatActions.addUserMessage(labels[actionId] || actionId));
    dispatch(chatActions.setTyping(true));
    setTimeout(() => {
      dispatch(chatActions.setTyping(false));
      dispatch(chatActions.setChatHistory(SAMPLE_CHAT_CSAT));
      dispatch(surveyActions.loadSampleSurvey());
    }, 800);
  };

  const handleSend = (message: string) => {
    dispatch(chatActions.addUserMessage(message));
    dispatch(chatActions.setTyping(true));
    setTimeout(() => {
      dispatch(chatActions.setTyping(false));
      if (!surveyGenerated) {
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
      {/* Figma: Tabs at top, 6px pt, 24px px */}
      <TabSwitcher />

      {/* Figma: AI suggestion area — scrollable, flex-end alignment */}
      <div className={styles.messagesArea}>
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            onQuickAction={handleQuickAction}
          />
        ))}

        {isTyping && (
          <div className={styles.typingIndicator}>
            <span /><span /><span />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Figma: Prompt box at bottom */}
      <ChatInput onSend={handleSend} />
    </div>
  );
};

export default AiChatPanel;
