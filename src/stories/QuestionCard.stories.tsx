import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import surveyReducer, { surveyActions } from '../store/surveySlice';
import chatReducer from '../store/chatSlice';
import QuestionCard from '../components/SurveyBuilder/SurveyPreview/QuestionCard/QuestionCard';
import type { Question } from '../types/survey.types';

// Mock store helpers
const createMockStore = (activeQuestionId?: string) => {
  const store = configureStore({
    reducer: {
      survey: surveyReducer,
      chat: chatReducer,
    },
  });
  // Load a sample survey so the store has data
  store.dispatch(surveyActions.loadSampleSurvey());
  if (activeQuestionId) {
    store.dispatch(surveyActions.openEditor(activeQuestionId));
  }
  return store;
};

const npsQuestion: Question = {
  id: 'nps-1',
  type: 'nps',
  text: 'How likely are you to recommend our hotel to your family and friends?',
  required: false,
  order: 1,
  ratingConfig: { scale: 10, lowLabel: 'Not at all likely', highLabel: 'Extremely likely' },
};

const multipleChoiceQuestion: Question = {
  id: 'mc-1',
  type: 'multiple_choice',
  text: 'How did you book your stay?',
  required: false,
  order: 2,
  choices: [
    { id: 'c1', label: 'Online' },
    { id: 'c2', label: 'Phone call' },
    { id: 'c3', label: 'Walk in' },
  ],
};

const ratingQuestion: Question = {
  id: 'r-1',
  type: 'rating',
  text: 'Rate your overall experience',
  required: true,
  order: 3,
  ratingConfig: { scale: 5, lowLabel: 'Very poor', highLabel: 'Excellent' },
};

const textQuestion: Question = {
  id: 't-1',
  type: 'text',
  text: 'Any additional comments or suggestions?',
  required: false,
  order: 4,
  placeholder: 'Type your feedback here...',
};

const allQuestions = [npsQuestion, multipleChoiceQuestion, ratingQuestion, textQuestion];

const CardWrapper = ({
  question,
  isActive = false,
}: {
  question: Question;
  isActive?: boolean;
}) => {
  const store = createMockStore(isActive ? question.id : undefined);
  return (
    <Provider store={store}>
      <div style={{ maxWidth: 680, padding: 16 }}>
        <QuestionCard question={question} allQuestions={allQuestions} isSelected={isActive} />
      </div>
    </Provider>
  );
};

const meta: Meta = {
  title: 'Survey/QuestionCard',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Renders a survey question in the canvas. Supports rating, NPS (0-10), multiple choice, and text question types. Click to select and open the editor panel.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const NPSQuestion: Story = {
  name: 'NPS (0-10 Scale)',
  render: () => <CardWrapper question={npsQuestion} />,
};

export const NPSActive: Story = {
  name: 'NPS (Active/Selected)',
  render: () => <CardWrapper question={npsQuestion} isActive />,
};

export const MultipleChoice: Story = {
  name: 'Multiple Choice',
  render: () => <CardWrapper question={multipleChoiceQuestion} />,
};

export const Rating: Story = {
  name: 'Rating (5-Point)',
  render: () => <CardWrapper question={ratingQuestion} />,
};

export const TextInput: Story = {
  name: 'Text Input',
  render: () => <CardWrapper question={textQuestion} />,
};

export const AllTypes: Story = {
  name: 'All Question Types',
  render: () => {
    const store = createMockStore();
    return (
      <Provider store={store}>
        <div style={{ maxWidth: 680, padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {allQuestions.map((q) => (
            <QuestionCard key={q.id} question={q} allQuestions={allQuestions} />
          ))}
        </div>
      </Provider>
    );
  },
};
