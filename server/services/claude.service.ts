import Anthropic from '@anthropic-ai/sdk';
import { SURVEY_SYSTEM_PROMPT, CHAT_SYSTEM_PROMPT } from '../prompts/surveySystem.js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  message: string;
  action: 'ask' | 'generate' | 'modify' | 'confirm';
  context: {
    industry: string | null;
    surveyType: string | null;
    audience: string | null;
    topics: string[] | null;
  };
}

interface SurveyQuestion {
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

interface GeneratedSurvey {
  industry: string;
  surveyTitle: string;
  headerSubtitle: string;
  questions: SurveyQuestion[];
}

// Conversational AI — manages the chat flow and decides when to generate
export async function chat(
  conversationHistory: ConversationMessage[],
  userMessage: string
): Promise<ChatResponse> {
  const messages = [
    ...conversationHistory.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: userMessage },
  ];

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: CHAT_SYSTEM_PROMPT,
    messages,
  });

  const text =
    response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as ChatResponse;
    }
  } catch {
    // Fallback if JSON parsing fails
  }

  return {
    message: text,
    action: 'ask',
    context: {
      industry: null,
      surveyType: null,
      audience: null,
      topics: null,
    },
  };
}

// Survey generation — takes gathered context and builds a full survey
export async function generateSurvey(
  industry: string,
  surveyType: string,
  audience: string,
  topics: string[],
  additionalContext?: string
): Promise<GeneratedSurvey> {
  const prompt = buildGenerationPrompt(
    industry,
    surveyType,
    audience,
    topics,
    additionalContext
  );

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: SURVEY_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const text =
    response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as GeneratedSurvey;
    }
  } catch {
    throw new Error('Failed to parse survey from AI response');
  }

  throw new Error('No valid survey JSON in AI response');
}

// Survey modification — takes existing survey + user request and modifies it
export async function modifySurvey(
  currentSurvey: GeneratedSurvey,
  userRequest: string
): Promise<GeneratedSurvey> {
  const prompt = `Here is the current survey:
${JSON.stringify(currentSurvey, null, 2)}

The user wants the following changes: "${userRequest}"

Apply the requested changes and return the complete updated survey in the same JSON format. Keep all unchanged questions intact.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: SURVEY_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const text =
    response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as GeneratedSurvey;
    }
  } catch {
    throw new Error('Failed to parse modified survey');
  }

  throw new Error('No valid survey JSON in modification response');
}

// Generate dynamic survey template suggestions
export async function generateTemplateSuggestions(): Promise<
  { id: string; title: string; description: string }[]
> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Generate 4 diverse survey template suggestions that a business might want to create. Each should be from a different industry or use case.

Return ONLY a JSON array (no markdown) with this exact structure:
[
  {
    "id": "unique_slug",
    "title": "Short template title (3-5 words)",
    "description": "A realistic 2-3 sentence prompt that a user would type to describe the survey they need. Write it in first person as if the user is explaining their business context and what they want to measure."
  }
]

Make them varied — mix industries (healthcare, retail, SaaS, hospitality, education, events, HR, etc.) and survey types (CSAT, NPS, feedback, exit interviews, event feedback, onboarding, etc.). Make the descriptions rich with context so they feel like real user requests.`,
      },
    ],
  });

  const text =
    response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // fall through
  }

  throw new Error('Failed to parse template suggestions');
}

function buildGenerationPrompt(
  industry: string,
  surveyType: string,
  audience: string,
  topics: string[],
  additionalContext?: string
): string {
  let prompt = `Generate a professional ${surveyType} survey for the ${industry} industry.

Target audience: ${audience}
`;

  if (topics.length > 0) {
    prompt += `\nSpecific topics to cover:\n${topics.map((t) => `- ${t}`).join('\n')}\n`;
  }

  if (additionalContext) {
    prompt += `\nAdditional requirements: ${additionalContext}\n`;
  }

  prompt += `\nGenerate the survey now. Return ONLY valid JSON, no markdown.`;

  return prompt;
}
