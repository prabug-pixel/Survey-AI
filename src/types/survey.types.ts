// ============================================================
// Survey domain types
// ============================================================

export type QuestionType =
  | 'rating'
  | 'multiple_choice'
  | 'text'
  | 'nps'
  | 'short_text'
  | 'paragraph'
  | 'help_text'
  | 'checkboxes'
  | 'dropdown'
  | 'matrix_radio'
  | 'matrix_ratings'
  | 'matrix_dropdown'
  | 'welcome'
  | 'contact_info'
  | 'date_time'
  | 'location'
  | 'review_collector'
  | 'review_request'
  | 'thank_you'
  | 'page_title'
  | 'page_break';

export interface RatingConfig {
  scale: number;
  lowLabel: string;
  highLabel: string;
}

export interface ChoiceOption {
  id: string;
  label: string;
}

export interface SkipLogicRule {
  id: string;
  condition: 'is' | 'is_not';
  answerValue: string;
  targetQuestionId: string;
}

export interface MatrixRow {
  id: string;
  label: string;
}

export interface MatrixConfig {
  rows: MatrixRow[];
  columnScale: number;
  columnLabels: string[];
}

export interface ContactInfoField {
  id: string;
  label: string;
  enabled: boolean;
}

export interface ContactInfoConfig {
  fields: ContactInfoField[];
  saveToBirdeye: boolean;
}

export interface DateTimeConfig {
  includeDate: boolean;
  includeTime: boolean;
  startTime: string;
  endTime: string;
  interval: string;
}

export interface LocationConfig {
  locationChoices: string;
  showAlias: boolean;
}

export interface ReviewCollectorConfig {
  sources: string[];
  requestPublicReview: boolean;
  showContactUs: boolean;
  buttonColor: string;
  buttonTextColor: string;
}

export interface WelcomeConfig {
  description: string;
  buttonText: string;
  showImage: boolean;
}

export interface ThankYouConfig {
  redirectUrl: string;
  showRedirect: boolean;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  required: boolean;
  order: number;
  ratingConfig?: RatingConfig;
  choices?: ChoiceOption[];
  skipLogicRules?: SkipLogicRule[];
  placeholder?: string;
  matrixConfig?: MatrixConfig;
  contactInfoConfig?: ContactInfoConfig;
  dateTimeConfig?: DateTimeConfig;
  locationConfig?: LocationConfig;
  reviewCollectorConfig?: ReviewCollectorConfig;
  welcomeConfig?: WelcomeConfig;
  thankYouConfig?: ThankYouConfig;
}

export interface SurveyPage {
  id: string;
  questions: Question[];
}

export interface SurveyHeader {
  logoUrl?: string;
  companyName: string;
  subtitle: string;
}

export interface Survey {
  id: string;
  title: string;
  status: 'draft' | 'published';
  header: SurveyHeader;
  pages: SurveyPage[];
  createdAt: string;
  updatedAt: string;
}

export type ChatRole = 'ai' | 'user';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  quickActions?: QuickAction[];
}

export interface QuickAction {
  id: string;
  label: string;
}

export interface SurveyTemplate {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

export type PreviewMode = 'desktop' | 'mobile';

export type EditorPanelState = {
  isOpen: boolean;
  questionId: string | null;
};

export const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Dubai',
  'Australia/Sydney',
  'UTC',
] as const;

// 1–24 are shown as hours; 48+ are shown as days (the 24h slot already
// represents "1 day", so we skip a separate "1 day" entry to avoid two
// options with the same hour value).
export const GRACE_PERIOD_OPTIONS: { value: number; label: string }[] = [
  ...Array.from({ length: 24 }, (_, i) => {
    const hours = i + 1;
    return { value: hours, label: hours === 1 ? '1 hour' : `${hours} hours` };
  }),
  { value: 48, label: '2 days' },
  { value: 72, label: '3 days' },
  { value: 96, label: '4 days' },
  { value: 120, label: '5 days' },
  { value: 144, label: '6 days' },
];

export interface AuditLogEntry {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  details: string;
}

// ============================================================
// Survey campaign / distribution configuration
// ============================================================

export type CampaignChannel = 'email' | 'text' | 'email_text';
export type CampaignSchedule = 'immediately' | 'scheduled';
// Link expiry has two top-level options ("Link Expiry Options"):
//   • set_amount  → relative count + unit (days/hours/minutes), resolved
//                   to an absolute timestamp at send time.
//   • calendar_date → explicit calendar date + time-of-day.
export type LinkExpiryOption = 'set_amount' | 'calendar_date';
export type LinkExpiryUnit = 'days' | 'hours' | 'minutes';
// `mode` collapses both axes for storage compatibility:
//   set_amount + unit  → mode = 'days' | 'hours' | 'minutes'
//   calendar_date      → mode = 'custom'
//   set_amount, no unit picked yet → mode = undefined
export type LinkExpiryMode = LinkExpiryUnit | 'custom';

export interface LinkExpiryConfig {
  // The first dropdown's selection. Defaults to 'set_amount' so the form
  // opens on the relative-count path per spec.
  option: LinkExpiryOption;
  // The unit (set_amount) or 'custom' (calendar_date). Undefined when the
  // user is on the set_amount path but hasn't picked a unit yet — the
  // Unit value field stays hidden until they do.
  mode?: LinkExpiryMode;
  // Numeric value for the set_amount path (days/hours/minutes count).
  value?: number;
  // Absolute timestamp for the calendar_date path.
  customDate?: string;
  // Legacy range fields, retained so older saved campaigns still load.
  startDate?: string;
  endDate?: string;
  presetKey?: string;
}

export const DEFAULT_LINK_EXPIRY: LinkExpiryConfig = {
  option: 'set_amount',
};

export interface CampaignConfig {
  channel: CampaignChannel;
  recipientSource: 'contacts' | 'segments' | 'csv';
  emailTemplateId?: string;
  textTemplateId?: string;
  surveyId?: string;
  schedule: CampaignSchedule;
  overrideRestrictions: boolean;
  sendReminders: boolean;
  // Once the campaign is launched, fields like linkExpiry become read-only.
  status: 'draft' | 'live';
  options: {
    linkExpiry: LinkExpiryConfig;
  };
}

export const DEFAULT_CAMPAIGN_CONFIG: CampaignConfig = {
  channel: 'email_text',
  recipientSource: 'contacts',
  schedule: 'immediately',
  overrideRestrictions: false,
  sendReminders: false,
  status: 'draft',
  options: {
    linkExpiry: DEFAULT_LINK_EXPIRY,
  },
};

export interface ExpirationConfig {
  enabled: boolean;
  endDate?: string;
  timezone: string;
  gracePeriodEnabled: boolean;
  gracePeriodHours: number;
  closedMessage: {
    title: string;
    body: string;
    ctaText?: string;
    ctaUrl?: string;
  };
  notifications: {
    enabled: boolean;
    hours72: boolean;
    hours24: boolean;
    onAutoClose: boolean;
  };
}

export interface SavedSurvey {
  id: string;
  title: string;
  status: 'draft' | 'running' | 'expiring_soon' | 'expired';
  sent: number;
  responses: number;
  lastUpdated: string;
  owner: string;
  surveyData?: Survey;
  expiration?: ExpirationConfig;
  auditLog?: AuditLogEntry[];
  campaign?: CampaignConfig;
}

export interface SurveyResponse {
  id: string;
  score: number;
  contactName: string;
  location: string;
  respondedOn: string;
}
