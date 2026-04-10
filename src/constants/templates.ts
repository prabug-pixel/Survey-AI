import type { SurveyTemplate } from '../types/survey.types';

export const SURVEY_TEMPLATES: SurveyTemplate[] = [
  {
    id: 'csat',
    title: 'Customer satisfaction survey',
    description:
      "I work for a consulting firm and we're looking to gather feedback from our clients about their experience working with us. The survey should cover customer experience topics like the quality of our services, communication with our team, responsiveness to issues, overall satisfaction with our consulting firm, and whether they would recommend us to colleagues.",
  },
  {
    id: 'feedback',
    title: 'Feedback form',
    description:
      'Our university is conducting a survey on student satisfaction. We are interested in their opinions on the quality of teaching, research opportunities, various facilities like the libraries and dining halls, and student extracurricular activities. Include student demographics like year of graduation, gender, and age.',
  },
  {
    id: 'employee',
    title: 'Employee experience survey',
    description:
      'We need a survey for employee exit interviews. The survey should assess how the departing employee feels about various aspects of the company culture, such as diversity, equity, and inclusion, whether their work was meaningful, their opinion on working with their team and supervisor, and their reasons for leaving.',
  },
  {
    id: 'event',
    title: 'Event feedback form',
    description:
      "My company is hosting a webinar for the first time. We want to survey attendees after the event to get feedback on how it went. We'd like to know their overall impression, whether they would attend another webinar, and their opinions on how well the event was organized and the length.",
  },
];

export const QUICK_ACTIONS = [
  { id: 'csat', label: 'CSAT Survey' },
  { id: 'nps', label: 'NPS Survey' },
  { id: 'post_purchase', label: 'Post purchase survey' },
  { id: 'others', label: 'Others' },
];
