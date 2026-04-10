// ============================================================
// Survey domain types
// ============================================================

export type QuestionType = 'rating' | 'multiple_choice' | 'text' | 'nps';

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
