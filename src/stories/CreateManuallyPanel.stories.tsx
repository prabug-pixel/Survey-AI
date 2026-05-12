import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import surveyReducer from '../store/surveySlice';
import chatReducer from '../store/chatSlice';
import CreateManuallyPanel from '../components/SurveyBuilder/AiChatPanel/CreateManuallyPanel/CreateManuallyPanel';

// Mock store for stories
const createMockStore = () =>
  configureStore({
    reducer: {
      survey: surveyReducer,
      chat: chatReducer,
    },
  });

const StoreDecorator = (Story: React.ComponentType) => (
  <Provider store={createMockStore()}>
    <div style={{ width: 344, height: 700, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
      <Story />
    </div>
  </Provider>
);

const meta: Meta<typeof CreateManuallyPanel> = {
  title: 'Survey/CreateManuallyPanel',
  component: CreateManuallyPanel,
  tags: ['autodocs'],
  decorators: [StoreDecorator],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Panel showing all available question types organized in collapsible categories. Question cards are clickable to add and draggable to the survey canvas.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CreateManuallyPanel>;

export const Default: Story = {
  name: 'All Categories Expanded',
};

export const InPanel: Story = {
  name: 'Panel Context (380px width)',
  decorators: [
    (Story) => (
      <Provider store={createMockStore()}>
        <div style={{ width: 380, height: 800, background: '#fff', border: '1px solid #e0e0e0' }}>
          <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(0,0,0,0.1)', display: 'flex', gap: 40, justifyContent: 'center' }}>
            <span style={{ fontSize: 14, color: '#555' }}>Create with AI</span>
            <span style={{ fontSize: 14, color: '#212121', borderBottom: '2px solid #2f80ed', paddingBottom: 8 }}>Create manually</span>
          </div>
          <Story />
        </div>
      </Provider>
    ),
  ],
};
