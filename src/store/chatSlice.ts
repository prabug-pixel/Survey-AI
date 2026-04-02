import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';
import type { ChatMessage } from '../types/survey.types';
import { SAMPLE_CHAT_INITIAL } from '../constants/sampleSurvey';

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  mentionedQuestionId: string | null;
}

const initialState: ChatState = {
  messages: SAMPLE_CHAT_INITIAL,
  isTyping: false,
  mentionedQuestionId: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Add user message
    addUserMessage(state, action: PayloadAction<string>) {
      state.messages.push({
        id: uuid(),
        role: 'user',
        content: action.payload,
        timestamp: new Date().toISOString(),
      });
    },

    // Add AI message
    addAiMessage(state, action: PayloadAction<{ content: string; quickActions?: ChatMessage['quickActions'] }>) {
      state.messages.push({
        id: uuid(),
        role: 'ai',
        content: action.payload.content,
        timestamp: new Date().toISOString(),
        quickActions: action.payload.quickActions,
      });
    },

    // Set full chat history (for loading conversations)
    setChatHistory(state, action: PayloadAction<ChatMessage[]>) {
      state.messages = action.payload;
    },

    // Set AI typing indicator
    setTyping(state, action: PayloadAction<boolean>) {
      state.isTyping = action.payload;
    },

    // Set mentioned question for chat input context
    setMentionedQuestion(state, action: PayloadAction<string | null>) {
      state.mentionedQuestionId = action.payload;
    },

    // Clear chat
    clearChat(state) {
      state.messages = SAMPLE_CHAT_INITIAL;
      state.isTyping = false;
      state.mentionedQuestionId = null;
    },
  },
});

export const chatActions = chatSlice.actions;
export default chatSlice.reducer;
