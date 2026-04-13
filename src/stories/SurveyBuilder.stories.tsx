import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import surveyReducer, { surveyActions } from '../store/surveySlice';
import chatReducer from '../store/chatSlice';
import SurveyBuilder from '../components/SurveyBuilder/SurveyBuilder';

const createStore = (options?: { withSurvey?: boolean; activeTab?: 'ai' | 'manual' }) => {
  const store = configureStore({
    reducer: {
      survey: surveyReducer,
      chat: chatReducer,
    },
  });
  if (options?.activeTab) {
    store.dispatch(surveyActions.setActiveTab(options.activeTab));
  }
  if (options?.withSurvey) {
    store.dispatch(surveyActions.addDroppedQuestion({ type: 'nps' }));
    store.dispatch(surveyActions.closeEditor());
    store.dispatch(surveyActions.addDroppedQuestion({ type: 'multiple_choice' }));
    store.dispatch(surveyActions.closeEditor());
  }
  return store;
};

const meta: Meta<typeof SurveyBuilder> = {
  title: 'Survey/SurveyBuilder',
  component: SurveyBuilder,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Full survey builder with Create with AI and Create manually tabs. Supports click-to-add and drag-and-drop from the question type panel to the canvas. Right-side editor panel opens on question selection.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SurveyBuilder>;

export const ManualTabEmpty: Story = {
  name: 'Manual Tab - Empty Canvas',
  decorators: [
    (Story) => (
      <Provider store={createStore({ activeTab: 'manual' })}>
        <div style={{ height: '100vh' }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};

export const ManualTabWithQuestions: Story = {
  name: 'Manual Tab - With Questions',
  decorators: [
    (Story) => (
      <Provider store={createStore({ activeTab: 'manual', withSurvey: true })}>
        <div style={{ height: '100vh' }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};

export const AITab: Story = {
  name: 'AI Tab - Default',
  decorators: [
    (Story) => (
      <Provider store={createStore({ activeTab: 'ai' })}>
        <div style={{ height: '100vh' }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};
