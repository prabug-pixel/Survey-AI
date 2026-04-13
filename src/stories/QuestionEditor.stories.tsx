import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';
import surveyReducer, { surveyActions } from '../store/surveySlice';
import chatReducer from '../store/chatSlice';
import QuestionEditor from '../components/SurveyBuilder/QuestionEditor/QuestionEditor';

// Helper to create a store with a specific question type open in editor
const createEditorStore = (questionType: string) => {
  const store = configureStore({
    reducer: {
      survey: surveyReducer,
      chat: chatReducer,
    },
  });
  // Create a survey and add a question of the desired type
  store.dispatch(surveyActions.addDroppedQuestion({ type: questionType }));
  return store;
};

const EditorWrapper = ({ questionType }: { questionType: string }) => {
  const store = createEditorStore(questionType);
  return (
    <Provider store={store}>
      <div style={{ width: 320, height: 700, border: '1px solid #e0e0e0' }}>
        <QuestionEditor />
      </div>
    </Provider>
  );
};

const meta: Meta = {
  title: 'Survey/QuestionEditor',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Right-side editor panel for configuring survey questions. Shows type-specific fields: Sort & Embed in email for NPS, Scale & Labels for Rating, Options for Multiple Choice, and placeholder text for Text questions.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const NPSEditor: Story = {
  name: 'NPS Editor',
  render: () => <EditorWrapper questionType="nps" />,
};

export const RatingEditor: Story = {
  name: 'Rating Editor',
  render: () => <EditorWrapper questionType="rating" />,
};

export const MultipleChoiceEditor: Story = {
  name: 'Multiple Choice Editor',
  render: () => <EditorWrapper questionType="multiple_choice" />,
};

export const TextEditor: Story = {
  name: 'Text Editor',
  render: () => <EditorWrapper questionType="text" />,
};
