import type { SurveyTemplate } from '../types/survey.types';

export const SURVEY_TEMPLATES: SurveyTemplate[] = [
  {
    id: 'csat',
    title: 'Customer satisfaction survey',
    description:
      'I work for a consulting firm and we\'re looking to gather feedback from our clients about their experience working with us. The survey should cover customer experience topics like the q...',
    icon: 'csat',
  },
  {
    id: 'feedback',
    title: 'Feedback form',
    description:
      'Our university is conducting a survey on student satisfaction. We are interested in their opinions on the quality of teaching, research opportunities, various facilities like the libraries and dining halls, a...',
    icon: 'feedback',
  },
  {
    id: 'employee',
    title: 'Employee experience survey',
    description:
      'We need a survey for employee exit interviews. The survey should assess how the departing employee feels about various aspects of the company culture, such as diversity, equity, an...',
    icon: 'employee',
  },
  {
    id: 'event',
    title: 'Event feedback form',
    description:
      'My company is hosting a webinar for the first time. We want to survey attendees after the event to get feedback on how it went. We\'d like to know their overall impression, whether they would attend another...',
    icon: 'event',
  },
];

export const QUICK_ACTIONS = [
  { id: 'csat', label: 'CSAT Survey' },
  { id: 'nps', label: 'NPS Survey' },
  { id: 'post_purchase', label: 'Post purchase survey' },
  { id: 'others', label: 'Others' },
];
