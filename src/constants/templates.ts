import type { SurveyTemplate } from '../types/survey.types';

export const SURVEY_TEMPLATES: SurveyTemplate[] = [
  {
    id: 'csat',
    title: 'Customer satisfaction survey',
    description:
      'Collect feedback from patients about their overall clinic experience, including service quality, wait time, and staff interaction.',
    icon: 'csat',
  },
  {
    id: 'patient',
    title: 'Patient experience survey',
    description:
      'Evaluate how comfortable and satisfied patients feel during their visit, including staff behavior and clinic environment.',
    icon: 'feedback',
  },
  {
    id: 'appointment',
    title: 'Appointment & visit experience survey',
    description:
      'Understand how smooth the booking process was and how the in-clinic experience met customer expectations.',
    icon: 'employee',
  },
  {
    id: 'service',
    title: 'Service quality assessment',
    description:
      'Identify strengths and gaps in your service delivery, including responsiveness, professionalism, and overall satisfaction.',
    icon: 'event',
  },
];

export const QUICK_ACTIONS = [
  { id: 'csat', label: 'CSAT Survey' },
  { id: 'nps', label: 'NPS Survey' },
  { id: 'post_visit', label: 'Post-visit dental feedback' },
  { id: 'patient_experience', label: 'Patient experience survey' },
  { id: 'others', label: 'Others' },
];
