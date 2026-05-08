import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import surveyReducer from '../store/surveySlice';
import chatReducer from '../store/chatSlice';
import SurveyL2Nav from '../components/SurveyL2Nav/SurveyL2Nav';

const makeStore = () =>
  configureStore({ reducer: { survey: surveyReducer, chat: chatReducer } });

const withProviders = (initialPath = '/surveys') =>
  (Story: React.ComponentType) => (
    <Provider store={makeStore()}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="*" element={<Story />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );

const meta: Meta<typeof SurveyL2Nav> = {
  title: 'Navigation/SurveyL2Nav',
  component: SurveyL2Nav,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof SurveyL2Nav>;

export const AllSurveysActive: Story = {
  decorators: [withProviders('/surveys')],
  name: 'All Surveys selected',
};

export const CreateSurveyPath: Story = {
  decorators: [withProviders('/surveys/create')],
  name: 'Create Survey path (no active item)',
};
