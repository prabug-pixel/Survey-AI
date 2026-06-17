// Frontend API client for the Survey AI backend

const API_BASE = import.meta.env.DEV ? 'http://localhost:3001/api' : '/api';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  message: string;
  action: 'ask' | 'generate' | 'modify' | 'confirm';
  context: {
    industry: string | null;
    surveyType: string | null;
    audience: string | null;
    topics: string[] | null;
  };
}

export interface GeneratedQuestion {
  type: 'rating' | 'multiple_choice' | 'text' | 'nps';
  text: string;
  required: boolean;
  ratingConfig?: { scale: number; lowLabel: string; highLabel: string };
  choices?: { label: string }[];
  skipLogicRules?: {
    condition: 'is' | 'is_not';
    answerValue: string;
    targetQuestionIndex: number;
  }[];
  placeholder?: string;
}

export interface GeneratedSurvey {
  industry: string;
  surveyTitle: string;
  headerSubtitle: string;
  questions: GeneratedQuestion[];
}

// Chat with the AI assistant
export async function chatWithAI(
  conversationHistory: ConversationMessage[],
  message: string
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/survey/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationHistory, message }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' }));
    throw new Error(err.error || `API error: ${res.status}`);
  }

  return res.json();
}

// Generate a complete survey from gathered context
export async function generateSurveyFromContext(
  industry: string,
  surveyType: string,
  audience: string,
  topics: string[],
  additionalContext?: string
): Promise<GeneratedSurvey> {
  const res = await fetch(`${API_BASE}/survey/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      industry,
      surveyType,
      audience,
      topics,
      additionalContext,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' }));
    throw new Error(err.error || `API error: ${res.status}`);
  }

  return res.json();
}

// Modify an existing survey
export async function modifySurveyRequest(
  currentSurvey: GeneratedSurvey,
  userRequest: string
): Promise<GeneratedSurvey> {
  const res = await fetch(`${API_BASE}/survey/modify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentSurvey, userRequest }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' }));
    throw new Error(err.error || `API error: ${res.status}`);
  }

  return res.json();
}
