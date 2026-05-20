import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';
import surveyReducer from '../store/surveySlice';
import chatReducer from '../store/chatSlice';
import SurveyDetails from '../components/SurveyDetails/SurveyDetails';
import type { SavedSurvey, Survey } from '../types/survey.types';

const DEMO_ID = uuid();
const PAGE_ID = uuid();

const DEMO_SURVEY_DATA: Survey = {
  id: DEMO_ID,
  title: 'Feedback survey',
  status: 'published',
  header: { companyName: 'Lumen Healthcare', subtitle: 'Tell us about your experience' },
  pages: [{
    id: PAGE_ID,
    questions: [
      {
        id: uuid(),
        type: 'nps',
        text: 'How likely are you to recommend our hotel to your family and friends?',
        required: true,
        order: 1,
        ratingConfig: { scale: 10, lowLabel: 'Not at all likely', highLabel: 'Extremely likely' },
      },
      {
        id: uuid(),
        type: 'multiple_choice',
        text: 'How did you book your stay?',
        required: false,
        order: 2,
        choices: [
          { id: uuid(), label: 'Online' },
          { id: uuid(), label: 'Phone call' },
          { id: uuid(), label: 'Walk in' },
        ],
      },
      {
        id: uuid(),
        type: 'checkboxes',
        text: 'What all do you like about us?',
        required: false,
        order: 3,
        choices: [
          { id: uuid(), label: 'Staff' },
          { id: uuid(), label: 'Product' },
          { id: uuid(), label: 'Services' },
        ],
      },
    ],
  }],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DEMO_SURVEY: SavedSurvey = {
  id: DEMO_ID,
  title: 'Feedback survey',
  status: 'published',
  sent: 5,
  responses: 3,
  lastUpdated: 'Mar 05, 2026',
  owner: 'Prabu',
  surveyData: DEMO_SURVEY_DATA,
};

const DRAFT_ID = uuid();
const DRAFT_PAGE_ID = uuid();

const DRAFT_SURVEY_DATA: Survey = {
  id: DRAFT_ID,
  title: 'Product Sentiment Analysis',
  status: 'draft',
  header: { companyName: '', subtitle: '' },
  pages: [{
    id: DRAFT_PAGE_ID,
    questions: [
      {
        id: uuid(),
        type: 'rating',
        text: 'How would you rate your overall experience with our product?',
        required: true,
        order: 1,
        ratingConfig: { scale: 5, lowLabel: 'Very poor', highLabel: 'Excellent' },
      },
      {
        id: uuid(),
        type: 'text',
        text: 'What could we do to improve?',
        required: false,
        order: 2,
        placeholder: 'Share your thoughts...',
      },
    ],
  }],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DRAFT_SURVEY: SavedSurvey = {
  id: DRAFT_ID,
  title: 'Product Sentiment Analysis',
  status: 'draft',
  sent: 0,
  responses: 0,
  lastUpdated: 'Mar 04, 2026',
  owner: 'Rupa',
  surveyData: DRAFT_SURVEY_DATA,
};

const makeStore = (surveys: SavedSurvey[]) =>
  configureStore({
    reducer: { survey: surveyReducer, chat: chatReducer },
    preloadedState: {
      survey: {
        survey: null,
        previewMode: 'desktop' as const,
        editorPanel: { isOpen: false, questionId: null },
        activeTab: 'ai' as const,
        surveyGenerated: false,
        savedSurveys: surveys,
      },
    },
  });

const withProviders = (survey: SavedSurvey) =>
  (Story: React.ComponentType) => (
    <Provider store={makeStore([survey])}>
      <MemoryRouter initialEntries={[`/surveys/${survey.id}`]}>
        <Routes>
          <Route path="/surveys/:surveyId" element={<Story />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );

const meta: Meta<typeof SurveyDetails> = {
  title: 'Pages/SurveyDetails',
  component: SurveyDetails,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof SurveyDetails>;

export const Published: Story = {
  decorators: [withProviders(DEMO_SURVEY)],
  name: 'Published survey (View tab)',
};

export const Draft: Story = {
  decorators: [withProviders(DRAFT_SURVEY)],
  name: 'Draft survey',
};
