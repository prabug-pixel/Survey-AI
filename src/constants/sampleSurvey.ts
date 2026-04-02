import type { Survey, ChatMessage } from '../types/survey.types';

export const SAMPLE_SURVEY: Survey = {
  id: 'survey-001',
  title: 'CSAT Survey',
  status: 'draft',
  header: {
    companyName: 'Octapharma Plasma',
    subtitle: 'Hi there! We\'d love your feedback',
  },
  pages: [
    {
      id: 'page-1',
      questions: [
        {
          id: 'q1',
          type: 'rating',
          text: 'How satisfied are you with your overall experience?',
          required: true,
          order: 1,
          ratingConfig: { scale: 5, lowLabel: 'Not at all likely', highLabel: 'Extremely likely' },
        },
        {
          id: 'q2',
          type: 'rating',
          text: 'How would you rate the quality of service you received?',
          required: false,
          order: 2,
          ratingConfig: { scale: 5, lowLabel: 'Not at all likely', highLabel: 'Extremely likely' },
        },
        {
          id: 'q3',
          type: 'rating',
          text: 'How would you rate our delivery experience and staff behaviour?',
          required: false,
          order: 3,
          ratingConfig: { scale: 5, lowLabel: 'Not at all likely', highLabel: 'Extremely likely' },
        },
        {
          id: 'q4',
          type: 'multiple_choice',
          text: 'Did you face any issues during your experience?',
          required: false,
          order: 4,
          choices: [
            { id: 'c1', label: 'None' },
            { id: 'c2', label: 'Just minor issues' },
            { id: 'c3', label: 'Yes, major issues' },
          ],
          skipLogicRules: [
            { id: 'sl1', condition: 'is', answerValue: 'None', targetQuestionId: 'q7' },
            { id: 'sl2', condition: 'is_not', answerValue: 'Yes, major issues', targetQuestionId: 'q8' },
          ],
        },
        {
          id: 'q5',
          type: 'multiple_choice',
          text: 'What can we improve to serve you better?',
          required: false,
          order: 5,
          choices: [
            { id: 'c4', label: 'Wait time' },
            { id: 'c5', label: 'Treatment explanation' },
            { id: 'c6', label: 'Staff friendliness' },
          ],
        },
        {
          id: 'q6',
          type: 'multiple_choice',
          text: 'Would you like to mention any staff member who assisted you?',
          required: false,
          order: 6,
          choices: [
            { id: 'c7', label: 'Yes' },
            { id: 'c8', label: 'No' },
          ],
        },
        {
          id: 'q7',
          type: 'text',
          text: 'Any additional comments or suggestions?',
          required: false,
          order: 7,
          placeholder: 'Enter your response',
        },
      ],
    },
  ],
  createdAt: '2026-04-02T00:00:00Z',
  updatedAt: '2026-04-02T00:00:00Z',
};

export const SAMPLE_CHAT_INITIAL: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'ai',
    content: "Hey John! \u{1F44B}\u{1F3FB}\nI'll help you create the perfect survey in minutes.\nWhat type of survey would you like to create?",
    timestamp: '2026-04-02T10:00:00Z',
    quickActions: [
      { id: 'csat', label: 'CSAT Survey' },
      { id: 'nps', label: 'NPS Survey' },
      { id: 'post_visit', label: 'Post-visit dental feedback' },
      { id: 'patient_experience', label: 'Patient experience survey' },
      { id: 'others', label: 'Others' },
    ],
  },
];

export const SAMPLE_CHAT_CSAT: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'ai',
    content: "Hey John! \u{1F44B}\u{1F3FB}\nI'll help you create the perfect survey in minutes.\nWhat type of survey would you like to create?",
    timestamp: '2026-04-02T10:00:00Z',
  },
  {
    id: 'msg-2',
    role: 'user',
    content: 'CSAT Survey',
    timestamp: '2026-04-02T10:00:30Z',
  },
  {
    id: 'msg-3',
    role: 'ai',
    content: 'Great choice! A CSAT Survey is perfect for measuring satisfaction levels. Who will receive this survey?',
    timestamp: '2026-04-02T10:00:45Z',
  },
  {
    id: 'msg-4',
    role: 'user',
    content: 'New customer',
    timestamp: '2026-04-02T10:01:00Z',
  },
  {
    id: 'msg-5',
    role: 'ai',
    content: "Perfect! Tell me if there's anything specific you'd like to measure. For example: product quality, delivery experience, or staff behavior.",
    timestamp: '2026-04-02T10:01:15Z',
  },
  {
    id: 'msg-6',
    role: 'user',
    content: 'Delivery experience and Staff behaviour.',
    timestamp: '2026-04-02T10:01:30Z',
  },
  {
    id: 'msg-7',
    role: 'ai',
    content: "Your survey is ready! I've created a complete survey with personalized questions based on your selections. Click any element to edit it, or tell me what changes you'd like to make.",
    timestamp: '2026-04-02T10:02:00Z',
  },
];
