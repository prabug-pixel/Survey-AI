import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';
import surveyReducer from '../store/surveySlice';
import chatReducer from '../store/chatSlice';
import AllSurveys from '../components/AllSurveys/AllSurveys';
import type { SavedSurvey } from '../types/survey.types';

const DEMO_SURVEYS: SavedSurvey[] = [
  { id: uuid(), title: 'Feedback survey', status: 'running', sent: 5, responses: 1, lastUpdated: 'Mar 05, 2026', owner: 'Prabu' },
  { id: uuid(), title: 'Product Sentiment Analysis', status: 'draft', sent: 0, responses: 0, lastUpdated: 'Mar 04, 2026', owner: 'Rupa' },
  { id: uuid(), title: 'Competitive Market Analysis', status: 'running', sent: 23, responses: 21, lastUpdated: 'Mar 04, 2026', owner: 'Raynil' },
  { id: uuid(), title: 'Workplace Satisfaction Survey', status: 'running', sent: 12, responses: 1, lastUpdated: 'Mar 03, 2026', owner: 'Balaji' },
];

const makeStore = (savedSurveys: SavedSurvey[] = []) =>
  configureStore({
    reducer: { survey: surveyReducer, chat: chatReducer },
    preloadedState: {
      survey: {
        survey: null,
        previewMode: 'desktop' as const,
        editorPanel: { isOpen: false, questionId: null },
        activeTab: 'ai' as const,
        surveyGenerated: false,
        savedSurveys,
      },
    },
  });

const withProviders = (savedSurveys: SavedSurvey[]) =>
  (Story: React.ComponentType) => (
    <Provider store={makeStore(savedSurveys)}>
      <MemoryRouter initialEntries={['/surveys']}>
        <Routes>
          <Route path="*" element={<Story />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );

const meta: Meta<typeof AllSurveys> = {
  title: 'Pages/AllSurveys',
  component: AllSurveys,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof AllSurveys>;

export const WithSurveys: Story = {
  decorators: [withProviders(DEMO_SURVEYS)],
  name: 'With saved surveys',
};

export const EmptyState: Story = {
  decorators: [withProviders([])],
  name: 'Empty state (no surveys)',
};
