import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';
import type { ChatMessage, Survey } from '../types/survey.types';
import {
  processUserMessage,
  modifySurveyFromRequest,
  type ConversationContext,
} from '../services/surveyEngine';

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  mentionedQuestionId: string | null;
  context: ConversationContext;
  error: string | null;
}

const INITIAL_AI_MESSAGE: ChatMessage = {
  id: 'msg-init',
  role: 'ai',
  content: "Hey there! \u{1F44B}\nI'll help you create the perfect survey in minutes.\nWhat type of survey would you like to create?",
  timestamp: new Date().toISOString(),
  quickActions: [
    { id: 'csat', label: 'CSAT Survey' },
    { id: 'nps', label: 'NPS Survey' },
    { id: 'post_purchase', label: 'Post purchase survey' },
    { id: 'others', label: 'Others' },
  ],
};

const initialState: ChatState = {
  messages: [INITIAL_AI_MESSAGE],
  isTyping: false,
  mentionedQuestionId: null,
  context: {
    industry: null,
    surveyType: null,
    audience: null,
    topics: [],
    allMessages: [],
  },
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Process user message through the survey engine
    sendMessage(state, action: PayloadAction<string>) {
      const userMsg: ChatMessage = {
        id: uuid(),
        role: 'user',
        content: action.payload,
        timestamp: new Date().toISOString(),
      };
      state.messages.push(userMsg);
      state.isTyping = true;
    },

    // Receive AI response (called after processing)
    receiveResponse(
      state,
      action: PayloadAction<{
        message: string;
        context: ConversationContext;
        survey?: Survey;
      }>
    ) {
      state.isTyping = false;
      state.context = action.payload.context;

      const aiMsg: ChatMessage = {
        id: uuid(),
        role: 'ai',
        content: action.payload.message,
        timestamp: new Date().toISOString(),
      };
      state.messages.push(aiMsg);
    },

    setTyping(state, action: PayloadAction<boolean>) {
      state.isTyping = action.payload;
    },

    setMentionedQuestion(state, action: PayloadAction<string | null>) {
      state.mentionedQuestionId = action.payload;
    },

    clearChat(state) {
      state.messages = [INITIAL_AI_MESSAGE];
      state.isTyping = false;
      state.mentionedQuestionId = null;
      state.context = { industry: null, surveyType: null, audience: null, topics: [], allMessages: [] };
      state.error = null;
    },
  },
});

export const chatActions = chatSlice.actions;

// Thunk-like action: process message through the engine with simulated delay
export function processMessage(message: string) {
  return (dispatch: (action: unknown) => void, getState: () => { chat: ChatState; survey: { surveyGenerated: boolean; survey: Survey | null } }) => {
    dispatch(chatActions.sendMessage(message));

    // Simulate AI thinking delay (300-800ms)
    const delay = 300 + Math.random() * 500;

    setTimeout(() => {
      const state = getState();
      const surveyGenerated = state.survey.surveyGenerated;

      // If survey already generated, treat as modification request
      if (surveyGenerated && state.survey.survey) {
        const result = modifySurveyFromRequest(
          JSON.parse(JSON.stringify(state.survey.survey)), // Deep clone
          message
        );
        dispatch(chatActions.receiveResponse({
          message: result.message,
          context: state.chat.context,
          survey: result.survey,
        }));
        // Dispatch survey update
        dispatch({
          type: 'survey/loadSurvey',
          payload: result.survey,
        });
        return;
      }

      // Process through the conversation engine
      const result = processUserMessage(message, state.chat.context);

      dispatch(chatActions.receiveResponse({
        message: result.message,
        context: result.context,
        survey: result.survey,
      }));

      // If survey was generated, load it into the survey store
      if (result.action === 'generate' && result.survey) {
        dispatch({
          type: 'survey/loadSurvey',
          payload: result.survey,
        });
      }
    }, delay);
  };
}

export default chatSlice.reducer;
