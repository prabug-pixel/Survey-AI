// ============================================================
// Smart Survey Generation Engine
// Uses public industry data and survey methodology to generate
// intelligent, context-aware surveys without an external API.
// ============================================================

import { v4 as uuid } from 'uuid';
import type { Survey, Question } from '../types/survey.types';

// --- Industry Knowledge Base (public domain survey best practices) ---

interface IndustryProfile {
  name: string;
  keywords: string[];
  defaultAudience: string;
  defaultTopics: string[];
  terminology: Record<string, string>;
}

const INDUSTRY_DATABASE: Record<string, IndustryProfile> = {
  healthcare: {
    name: 'Healthcare',
    keywords: ['hospital', 'clinic', 'doctor', 'patient', 'medical', 'health', 'care', 'treatment', 'nurse', 'pharmacy'],
    defaultAudience: 'Patients',
    defaultTopics: ['overall experience', 'wait time', 'staff friendliness', 'treatment explanation', 'facility cleanliness', 'follow-up care'],
    terminology: { customer: 'patient', store: 'facility', product: 'treatment', purchase: 'visit' },
  },
  dental: {
    name: 'Dental',
    keywords: ['dental', 'dentist', 'teeth', 'orthodont', 'oral', 'tooth'],
    defaultAudience: 'Dental patients',
    defaultTopics: ['appointment scheduling', 'wait time', 'treatment explanation', 'pain management', 'staff behavior', 'clinic hygiene'],
    terminology: { customer: 'patient', store: 'clinic', product: 'treatment', purchase: 'visit' },
  },
  restaurant: {
    name: 'Restaurant & Food Service',
    keywords: ['restaurant', 'food', 'dining', 'cafe', 'bar', 'bistro', 'eatery', 'cuisine', 'meal', 'chef', 'menu'],
    defaultAudience: 'Diners',
    defaultTopics: ['food quality', 'service speed', 'staff courtesy', 'ambiance', 'menu variety', 'value for money', 'cleanliness'],
    terminology: { customer: 'guest', store: 'restaurant', product: 'dish', purchase: 'dining experience' },
  },
  hotel: {
    name: 'Hospitality',
    keywords: ['hotel', 'resort', 'accommodation', 'hospitality', 'stay', 'guest', 'room', 'booking', 'check-in', 'concierge'],
    defaultAudience: 'Hotel guests',
    defaultTopics: ['check-in experience', 'room cleanliness', 'staff helpfulness', 'amenities', 'breakfast quality', 'noise level', 'value for money'],
    terminology: { customer: 'guest', store: 'property', product: 'stay', purchase: 'reservation' },
  },
  retail: {
    name: 'Retail',
    keywords: ['store', 'shop', 'retail', 'purchase', 'buy', 'product', 'shopping', 'mall', 'ecommerce', 'e-commerce', 'online store'],
    defaultAudience: 'Customers',
    defaultTopics: ['product quality', 'staff helpfulness', 'store layout', 'checkout experience', 'return policy', 'value for money'],
    terminology: { customer: 'customer', store: 'store', product: 'product', purchase: 'purchase' },
  },
  saas: {
    name: 'SaaS & Technology',
    keywords: ['software', 'app', 'saas', 'platform', 'tech', 'tool', 'subscription', 'onboarding', 'feature', 'dashboard'],
    defaultAudience: 'Users',
    defaultTopics: ['ease of use', 'onboarding experience', 'feature satisfaction', 'customer support', 'performance/speed', 'value for price'],
    terminology: { customer: 'user', store: 'platform', product: 'feature', purchase: 'subscription' },
  },
  education: {
    name: 'Education',
    keywords: ['university', 'school', 'college', 'student', 'course', 'class', 'teacher', 'professor', 'education', 'training', 'workshop'],
    defaultAudience: 'Students',
    defaultTopics: ['teaching quality', 'course content', 'facilities', 'support services', 'learning outcomes', 'campus experience'],
    terminology: { customer: 'student', store: 'institution', product: 'course', purchase: 'enrollment' },
  },
  fitness: {
    name: 'Fitness & Wellness',
    keywords: ['gym', 'fitness', 'yoga', 'wellness', 'spa', 'workout', 'personal training', 'membership'],
    defaultAudience: 'Members',
    defaultTopics: ['equipment quality', 'cleanliness', 'trainer expertise', 'class variety', 'membership value', 'facility hours'],
    terminology: { customer: 'member', store: 'facility', product: 'program', purchase: 'membership' },
  },
  automotive: {
    name: 'Automotive',
    keywords: ['car', 'auto', 'vehicle', 'dealership', 'service center', 'mechanic', 'repair', 'oil change', 'tire'],
    defaultAudience: 'Vehicle owners',
    defaultTopics: ['service quality', 'wait time', 'pricing transparency', 'staff expertise', 'vehicle condition after service', 'communication'],
    terminology: { customer: 'customer', store: 'service center', product: 'service', purchase: 'service visit' },
  },
  finance: {
    name: 'Financial Services',
    keywords: ['bank', 'finance', 'loan', 'insurance', 'investment', 'credit', 'mortgage', 'account', 'financial'],
    defaultAudience: 'Account holders',
    defaultTopics: ['service speed', 'staff knowledge', 'digital banking', 'fee transparency', 'issue resolution', 'trust and security'],
    terminology: { customer: 'client', store: 'branch', product: 'service', purchase: 'transaction' },
  },
  realestate: {
    name: 'Real Estate',
    keywords: ['property', 'real estate', 'apartment', 'tenant', 'landlord', 'rent', 'lease', 'housing', 'condo'],
    defaultAudience: 'Tenants',
    defaultTopics: ['maintenance responsiveness', 'communication', 'property condition', 'amenities', 'lease process', 'value for rent'],
    terminology: { customer: 'tenant', store: 'property', product: 'unit', purchase: 'lease' },
  },
  ecommerce: {
    name: 'E-Commerce',
    keywords: ['online', 'delivery', 'shipping', 'order', 'website', 'cart', 'checkout', 'amazon', 'shopify'],
    defaultAudience: 'Online shoppers',
    defaultTopics: ['website usability', 'product accuracy', 'delivery speed', 'packaging quality', 'return process', 'customer support'],
    terminology: { customer: 'shopper', store: 'website', product: 'item', purchase: 'order' },
  },
};

// --- Survey Type Templates ---

interface SurveyTypeTemplate {
  name: string;
  keywords: string[];
  questionPatterns: QuestionPattern[];
}

interface QuestionPattern {
  type: 'rating' | 'multiple_choice' | 'text' | 'nps';
  template: string; // {topic}, {customer}, {store}, {product} are replaced
  required: boolean;
  ratingConfig?: { scale: number; lowLabel: string; highLabel: string };
  choicesTemplate?: string[]; // {topic} replaced
  skipLogic?: { condition: 'is' | 'is_not'; answerLabel: string; skipToOffset: number };
  placeholder?: string;
}

const SURVEY_TYPES: Record<string, SurveyTypeTemplate> = {
  csat: {
    name: 'Customer Satisfaction (CSAT)',
    keywords: ['csat', 'satisfaction', 'customer satisfaction', 'happy', 'satisfied'],
    questionPatterns: [
      {
        type: 'rating',
        template: 'How satisfied are you with your overall {purchase} experience?',
        required: true,
        ratingConfig: { scale: 5, lowLabel: 'Very dissatisfied', highLabel: 'Very satisfied' },
      },
      {
        type: 'rating',
        template: 'How would you rate the {topic}?',
        required: false,
        ratingConfig: { scale: 5, lowLabel: 'Poor', highLabel: 'Excellent' },
      },
      {
        type: 'multiple_choice',
        template: 'Did you experience any issues during your {purchase}?',
        required: false,
        choicesTemplate: ['No issues at all', 'Minor issues', 'Yes, significant issues'],
        skipLogic: { condition: 'is', answerLabel: 'No issues at all', skipToOffset: 2 },
      },
      {
        type: 'multiple_choice',
        template: 'What area needs the most improvement?',
        required: false,
        choicesTemplate: [], // Filled dynamically from topics
      },
      {
        type: 'rating',
        template: 'How likely are you to return to our {store}?',
        required: false,
        ratingConfig: { scale: 5, lowLabel: 'Not at all likely', highLabel: 'Extremely likely' },
      },
      {
        type: 'text',
        template: 'Any additional comments or suggestions to help us improve?',
        required: false,
        placeholder: 'Share your thoughts...',
      },
    ],
  },
  nps: {
    name: 'Net Promoter Score (NPS)',
    keywords: ['nps', 'net promoter', 'recommend', 'promoter', 'likelihood'],
    questionPatterns: [
      {
        type: 'nps',
        template: 'On a scale of 0-10, how likely are you to recommend our {store} to a friend or colleague?',
        required: true,
        ratingConfig: { scale: 10, lowLabel: 'Not at all likely', highLabel: 'Extremely likely' },
      },
      {
        type: 'multiple_choice',
        template: 'What is the primary reason for your score?',
        required: false,
        choicesTemplate: [], // Filled from topics
      },
      {
        type: 'rating',
        template: 'How satisfied are you with the {topic}?',
        required: false,
        ratingConfig: { scale: 5, lowLabel: 'Very dissatisfied', highLabel: 'Very satisfied' },
      },
      {
        type: 'multiple_choice',
        template: 'Which aspect of our {product} impressed you the most?',
        required: false,
        choicesTemplate: [], // Filled from topics
      },
      {
        type: 'text',
        template: 'What is the one thing we could do to improve your experience?',
        required: false,
        placeholder: 'Your suggestion...',
      },
    ],
  },
  post_purchase: {
    name: 'Post-Purchase Feedback',
    keywords: ['post purchase', 'after purchase', 'bought', 'ordered', 'received', 'delivery'],
    questionPatterns: [
      {
        type: 'rating',
        template: 'How satisfied are you with your recent {purchase}?',
        required: true,
        ratingConfig: { scale: 5, lowLabel: 'Very dissatisfied', highLabel: 'Very satisfied' },
      },
      {
        type: 'rating',
        template: 'How would you rate the {topic}?',
        required: false,
        ratingConfig: { scale: 5, lowLabel: 'Poor', highLabel: 'Excellent' },
      },
      {
        type: 'multiple_choice',
        template: 'How did you hear about us?',
        required: false,
        choicesTemplate: ['Search engine', 'Social media', 'Friend/Family referral', 'Online advertisement', 'Other'],
      },
      {
        type: 'multiple_choice',
        template: 'Would you {purchase} from us again?',
        required: false,
        choicesTemplate: ['Definitely yes', 'Probably yes', 'Not sure', 'Probably not', 'Definitely not'],
      },
      {
        type: 'text',
        template: 'Is there anything we could have done better?',
        required: false,
        placeholder: 'Tell us how we can improve...',
      },
    ],
  },
  general: {
    name: 'General Feedback',
    keywords: ['feedback', 'general', 'other', 'custom'],
    questionPatterns: [
      {
        type: 'rating',
        template: 'How would you rate your overall experience with our {store}?',
        required: true,
        ratingConfig: { scale: 5, lowLabel: 'Very poor', highLabel: 'Excellent' },
      },
      {
        type: 'rating',
        template: 'How would you rate the {topic}?',
        required: false,
        ratingConfig: { scale: 5, lowLabel: 'Poor', highLabel: 'Excellent' },
      },
      {
        type: 'multiple_choice',
        template: 'What aspect of our {product} matters most to you?',
        required: false,
        choicesTemplate: [], // Filled from topics
      },
      {
        type: 'text',
        template: 'What feedback would you like to share with us?',
        required: false,
        placeholder: 'Share your thoughts...',
      },
    ],
  },
};

// --- NLP-like keyword matching ---

function detectIndustry(text: string): IndustryProfile {
  const lower = text.toLowerCase();
  let bestMatch: IndustryProfile | null = null;
  let bestScore = 0;

  for (const [, profile] of Object.entries(INDUSTRY_DATABASE)) {
    let score = 0;
    for (const kw of profile.keywords) {
      if (lower.includes(kw)) score += kw.length; // Longer matches = more specific
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = profile;
    }
  }

  return bestMatch || INDUSTRY_DATABASE.retail; // Default to retail
}

function detectSurveyType(text: string): SurveyTypeTemplate {
  const lower = text.toLowerCase();
  let bestMatch: SurveyTypeTemplate | null = null;
  let bestScore = 0;

  for (const [, template] of Object.entries(SURVEY_TYPES)) {
    let score = 0;
    for (const kw of template.keywords) {
      if (lower.includes(kw)) score += kw.length;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = template;
    }
  }

  return bestMatch || SURVEY_TYPES.csat; // Default to CSAT
}

function extractTopics(text: string, industry: IndustryProfile): string[] {
  const lower = text.toLowerCase();
  const mentioned: string[] = [];

  for (const topic of industry.defaultTopics) {
    // Check for fuzzy match — any word in the topic appears in user text
    const words = topic.split(' ');
    if (words.some((w) => w.length > 3 && lower.includes(w))) {
      mentioned.push(topic);
    }
  }

  // If user didn't mention specific topics, use top 4 defaults
  if (mentioned.length === 0) {
    return industry.defaultTopics.slice(0, 4);
  }

  return mentioned;
}

// --- Survey Builder ---

function replaceTemplate(template: string, terminology: Record<string, string>, topic?: string): string {
  let result = template;
  result = result.replace(/{customer}/g, terminology.customer || 'customer');
  result = result.replace(/{store}/g, terminology.store || 'business');
  result = result.replace(/{product}/g, terminology.product || 'service');
  result = result.replace(/{purchase}/g, terminology.purchase || 'experience');
  if (topic) {
    result = result.replace(/{topic}/g, topic);
  }
  return result;
}

// --- Public API ---

export interface ConversationContext {
  industry: IndustryProfile | null;
  surveyType: SurveyTypeTemplate | null;
  audience: string | null;
  topics: string[];
  allMessages: string[];
}

export interface ChatResult {
  message: string;
  action: 'ask' | 'generate';
  context: ConversationContext;
  survey?: Survey;
}

export function processUserMessage(
  userMessage: string,
  context: ConversationContext
): ChatResult {
  const allText = [...context.allMessages, userMessage].join(' ');
  const updatedContext = { ...context, allMessages: [...context.allMessages, userMessage] };

  // Step 1: Detect industry if not yet known
  if (!context.industry) {
    const detected = detectIndustry(allText);
    const surveyType = detectSurveyType(allText);
    updatedContext.industry = detected;
    updatedContext.surveyType = surveyType;

    // If the first message is specific enough, ask for audience
    return {
      message: `Great choice! I'll create a ${surveyType.name} for the ${detected.name} industry. Who is the target audience? For example: ${detected.defaultAudience}, new ${detected.terminology.customer}s, or returning ${detected.terminology.customer}s.`,
      action: 'ask',
      context: updatedContext,
    };
  }

  // Step 2: Detect audience if not yet known
  if (!context.audience) {
    updatedContext.audience = userMessage.trim();
    const industry = context.industry;
    const topicSuggestions = industry.defaultTopics.slice(0, 4).join(', ');

    return {
      message: `Perfect! Tell me if there's anything specific you'd like to measure. For example: ${topicSuggestions}. Or I can generate a comprehensive survey right away.`,
      action: 'ask',
      context: updatedContext,
    };
  }

  // Step 3: Extract topics and generate survey
  const topics = extractTopics(userMessage, context.industry);
  updatedContext.topics = topics;

  const survey = buildSurvey(updatedContext);

  return {
    message: `Your survey is ready! I've created a ${survey.pages[0].questions.length}-question "${survey.title}" survey tailored for ${context.industry.name}. Click any element to edit it, or tell me what changes you'd like to make.`,
    action: 'generate',
    context: updatedContext,
    survey,
  };
}

function buildSurvey(context: ConversationContext): Survey {
  const industry = context.industry!;
  const surveyType = context.surveyType || SURVEY_TYPES.csat;
  const topics = context.topics.length > 0 ? context.topics : industry.defaultTopics.slice(0, 4);
  const terminology = industry.terminology;

  const questions: Question[] = [];
  let topicIdx = 0;

  for (const pattern of surveyType.questionPatterns) {
    // For topic-based patterns, iterate through topics
    if (pattern.template.includes('{topic}')) {
      const topic = topics[topicIdx % topics.length];
      topicIdx++;

      questions.push(buildQuestion(pattern, terminology, topic, questions.length));

      // Add a second topic-based question if we have enough topics
      if (topics.length > 2 && topicIdx < topics.length) {
        const topic2 = topics[topicIdx % topics.length];
        topicIdx++;
        questions.push(buildQuestion(pattern, terminology, topic2, questions.length));
      }
    } else if (pattern.choicesTemplate && pattern.choicesTemplate.length === 0) {
      // Dynamic choices from topics
      const dynamicPattern = {
        ...pattern,
        choicesTemplate: topics.map((t) => t.charAt(0).toUpperCase() + t.slice(1)),
      };
      questions.push(buildQuestion(dynamicPattern, terminology, undefined, questions.length));
    } else {
      questions.push(buildQuestion(pattern, terminology, undefined, questions.length));
    }
  }

  // Assign sequential order
  questions.forEach((q, i) => { q.order = i + 1; });

  // Resolve skip logic offsets to actual question IDs
  for (const q of questions) {
    if (q.skipLogicRules) {
      for (const rule of q.skipLogicRules) {
        if (rule.targetQuestionId.startsWith('__offset_')) {
          const offset = parseInt(rule.targetQuestionId.replace('__offset_', ''), 10);
          const currentIdx = questions.indexOf(q);
          const targetIdx = currentIdx + offset;
          if (targetIdx >= 0 && targetIdx < questions.length) {
            rule.targetQuestionId = questions[targetIdx].id;
          }
        }
      }
    }
  }

  const surveyTitle = `${industry.name} ${surveyType.name}`;

  return {
    id: uuid(),
    title: surveyTitle,
    status: 'draft',
    header: {
      companyName: industry.name,
      subtitle: `Hi there! We'd love your feedback`,
    },
    pages: [{ id: uuid(), questions }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function buildQuestion(
  pattern: QuestionPattern,
  terminology: Record<string, string>,
  topic: string | undefined,
  currentIndex: number
): Question {
  const q: Question = {
    id: uuid(),
    type: pattern.type,
    text: replaceTemplate(pattern.template, terminology, topic),
    required: pattern.required,
    order: currentIndex + 1,
  };

  if (pattern.ratingConfig) {
    q.ratingConfig = { ...pattern.ratingConfig };
  }

  if (pattern.choicesTemplate && pattern.choicesTemplate.length > 0) {
    q.choices = pattern.choicesTemplate.map((label) => ({
      id: uuid(),
      label: replaceTemplate(label, terminology, topic),
    }));
  }

  if (pattern.skipLogic) {
    q.skipLogicRules = [
      {
        id: uuid(),
        condition: pattern.skipLogic.condition,
        answerValue: pattern.skipLogic.answerLabel,
        targetQuestionId: `__offset_${pattern.skipLogic.skipToOffset}`,
      },
    ];
  }

  if (pattern.placeholder) {
    q.placeholder = pattern.placeholder;
  }

  return q;
}

// Handle modification requests
export function modifySurveyFromRequest(
  survey: Survey,
  request: string
): { message: string; survey: Survey } {
  const lower = request.toLowerCase();
  const page = survey.pages[0];

  if (lower.includes('add') && lower.includes('question')) {
    const newQ: Question = {
      id: uuid(),
      type: 'rating',
      text: 'How would you rate this aspect of your experience?',
      required: false,
      order: page.questions.length + 1,
      ratingConfig: { scale: 5, lowLabel: 'Poor', highLabel: 'Excellent' },
    };
    page.questions.push(newQ);
    return { message: `Done! I've added a new rating question (#${newQ.order}). You can click on it to customize the text and type.`, survey };
  }

  if (lower.includes('remove') || lower.includes('delete')) {
    const match = lower.match(/(?:question\s*#?\s*(\d+)|last\s+question|first\s+question)/);
    if (match) {
      const idx = match[1] ? parseInt(match[1], 10) - 1 : (lower.includes('last') ? page.questions.length - 1 : 0);
      if (idx >= 0 && idx < page.questions.length) {
        const removed = page.questions.splice(idx, 1)[0];
        page.questions.forEach((q, i) => { q.order = i + 1; });
        return { message: `Removed question "${removed.text}". The survey now has ${page.questions.length} questions.`, survey };
      }
    }
  }

  if (lower.includes('more question') || lower.includes('few more')) {
    const industry = detectIndustry(survey.header.companyName);
    const extraTopics = industry.defaultTopics.slice(3, 5);
    for (const topic of extraTopics) {
      page.questions.push({
        id: uuid(),
        type: 'rating',
        text: `How would you rate the ${topic}?`,
        required: false,
        order: page.questions.length + 1,
        ratingConfig: { scale: 5, lowLabel: 'Poor', highLabel: 'Excellent' },
      });
    }
    page.questions.forEach((q, i) => { q.order = i + 1; });
    return { message: `Added ${extraTopics.length} more questions about ${extraTopics.join(' and ')}. The survey now has ${page.questions.length} questions.`, survey };
  }

  return { message: `I've noted your request. You can click on any question to edit it directly, or describe specific changes like "add a question about pricing" or "remove question #3".`, survey };
}
