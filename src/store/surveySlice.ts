import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';
import type {
  Survey,
  Question,
  QuestionType,
  SkipLogicRule,
  PreviewMode,
  EditorPanelState,
} from '../types/survey.types';
import { SAMPLE_SURVEY } from '../constants/sampleSurvey';

interface SurveyState {
  survey: Survey | null;
  previewMode: PreviewMode;
  editorPanel: EditorPanelState;
  activeTab: 'ai' | 'manual';
  surveyGenerated: boolean;
}

const initialState: SurveyState = {
  survey: null,
  previewMode: 'desktop',
  editorPanel: { isOpen: false, questionId: null },
  activeTab: 'ai',
  surveyGenerated: false,
};

const surveySlice = createSlice({
  name: 'survey',
  initialState,
  reducers: {
    // Load a full survey (e.g., after AI generation)
    loadSurvey(state, action: PayloadAction<Survey>) {
      state.survey = action.payload;
      state.surveyGenerated = true;
    },

    // Load the sample survey for demo
    loadSampleSurvey(state) {
      state.survey = SAMPLE_SURVEY;
      state.surveyGenerated = true;
    },

    // Reset survey state
    resetSurvey(state) {
      state.survey = null;
      state.surveyGenerated = false;
      state.editorPanel = { isOpen: false, questionId: null };
    },

    // Update survey title
    updateSurveyTitle(state, action: PayloadAction<string>) {
      if (state.survey) {
        state.survey.title = action.payload;
      }
    },

    // Toggle preview mode
    setPreviewMode(state, action: PayloadAction<PreviewMode>) {
      state.previewMode = action.payload;
    },

    // Set active tab
    setActiveTab(state, action: PayloadAction<'ai' | 'manual'>) {
      state.activeTab = action.payload;
    },

    // Open editor for a specific question
    openEditor(state, action: PayloadAction<string>) {
      state.editorPanel = { isOpen: true, questionId: action.payload };
    },

    // Close editor panel
    closeEditor(state) {
      state.editorPanel = { isOpen: false, questionId: null };
    },

    // Update question text
    updateQuestionText(state, action: PayloadAction<{ questionId: string; text: string }>) {
      const question = findQuestion(state.survey, action.payload.questionId);
      if (question) {
        question.text = action.payload.text;
      }
    },

    // Update question type
    updateQuestionType(state, action: PayloadAction<{ questionId: string; type: QuestionType }>) {
      const question = findQuestion(state.survey, action.payload.questionId);
      if (question) {
        question.type = action.payload.type;
        // Initialize defaults for new type
        if (action.payload.type === 'rating' && !question.ratingConfig) {
          question.ratingConfig = { scale: 5, lowLabel: 'Not at all likely', highLabel: 'Extremely likely' };
        }
        if (action.payload.type === 'multiple_choice' && !question.choices) {
          question.choices = [
            { id: uuid(), label: 'Option 1' },
            { id: uuid(), label: 'Option 2' },
            { id: uuid(), label: 'Option 3' },
          ];
        }
        if (action.payload.type === 'text' && !question.placeholder) {
          question.placeholder = 'Enter your response';
        }
      }
    },

    // Toggle required
    toggleRequired(state, action: PayloadAction<string>) {
      const question = findQuestion(state.survey, action.payload);
      if (question) {
        question.required = !question.required;
      }
    },

    // Update rating scale
    updateRatingScale(state, action: PayloadAction<{ questionId: string; scale: number }>) {
      const question = findQuestion(state.survey, action.payload.questionId);
      if (question?.ratingConfig) {
        question.ratingConfig.scale = action.payload.scale;
      }
    },

    // Update rating labels
    updateRatingLabel(
      state,
      action: PayloadAction<{ questionId: string; field: 'lowLabel' | 'highLabel'; value: string }>
    ) {
      const question = findQuestion(state.survey, action.payload.questionId);
      if (question?.ratingConfig) {
        question.ratingConfig[action.payload.field] = action.payload.value;
      }
    },

    // Add choice option
    addChoiceOption(state, action: PayloadAction<string>) {
      const question = findQuestion(state.survey, action.payload);
      if (question?.choices) {
        question.choices.push({ id: uuid(), label: `Option ${question.choices.length + 1}` });
      }
    },

    // Update choice option label
    updateChoiceOption(
      state,
      action: PayloadAction<{ questionId: string; optionId: string; label: string }>
    ) {
      const question = findQuestion(state.survey, action.payload.questionId);
      const option = question?.choices?.find((c) => c.id === action.payload.optionId);
      if (option) {
        option.label = action.payload.label;
      }
    },

    // Remove choice option
    removeChoiceOption(state, action: PayloadAction<{ questionId: string; optionId: string }>) {
      const question = findQuestion(state.survey, action.payload.questionId);
      if (question?.choices) {
        question.choices = question.choices.filter((c) => c.id !== action.payload.optionId);
      }
    },

    // Add skip logic rule
    addSkipLogicRule(state, action: PayloadAction<{ questionId: string; rule: SkipLogicRule }>) {
      const question = findQuestion(state.survey, action.payload.questionId);
      if (question) {
        if (!question.skipLogicRules) question.skipLogicRules = [];
        question.skipLogicRules.push(action.payload.rule);
      }
    },

    // Remove skip logic rule
    removeSkipLogicRule(state, action: PayloadAction<{ questionId: string; ruleId: string }>) {
      const question = findQuestion(state.survey, action.payload.questionId);
      if (question?.skipLogicRules) {
        question.skipLogicRules = question.skipLogicRules.filter((r) => r.id !== action.payload.ruleId);
      }
    },

    // Delete question
    deleteQuestion(state, action: PayloadAction<string>) {
      if (state.survey) {
        for (const page of state.survey.pages) {
          page.questions = page.questions.filter((q) => q.id !== action.payload);
          // Re-order
          page.questions.forEach((q, i) => {
            q.order = i + 1;
          });
        }
        if (state.editorPanel.questionId === action.payload) {
          state.editorPanel = { isOpen: false, questionId: null };
        }
      }
    },

    // Add new question
    addQuestion(state, action: PayloadAction<{ pageId: string; type: QuestionType }>) {
      if (state.survey) {
        const page = state.survey.pages.find((p) => p.id === action.payload.pageId);
        if (page) {
          const newQ: Question = {
            id: uuid(),
            type: action.payload.type,
            text: 'New question',
            required: false,
            order: page.questions.length + 1,
          };
          if (action.payload.type === 'rating') {
            newQ.ratingConfig = { scale: 5, lowLabel: 'Not at all likely', highLabel: 'Extremely likely' };
          }
          if (action.payload.type === 'multiple_choice') {
            newQ.choices = [
              { id: uuid(), label: 'Option 1' },
              { id: uuid(), label: 'Option 2' },
              { id: uuid(), label: 'Option 3' },
            ];
          }
          if (action.payload.type === 'text') {
            newQ.placeholder = 'Enter your response';
          }
          page.questions.push(newQ);
        }
      }
    },

    // Add dropped question
    addDroppedQuestion(state, action: PayloadAction<{ type: QuestionType | string }>) {
      if (!state.survey) {
        state.survey = {
          id: uuid(),
          title: 'Standard survey',
          status: 'draft',
          header: { companyName: '', subtitle: '' },
          pages: [{ id: uuid(), questions: [] }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        state.surveyGenerated = true;
      }
      const page = state.survey.pages[0];

      const rawType = action.payload.type;
      let qType: QuestionType = 'text';
      if (['nps', 'rating', 'multiple_choice'].includes(rawType)) {
        qType = rawType as QuestionType;
      } else if (['short_text', 'paragraph'].includes(rawType)) {
        qType = 'text';
      }

      const newQ: Question = {
        id: uuid(),
        type: qType,
        text: 'Enter question text',
        required: false,
        order: page.questions.length + 1,
      };

      if (qType === 'rating') {
        newQ.ratingConfig = { scale: 5, lowLabel: 'Not at all likely', highLabel: 'Extremely likely' };
      }
      if (qType === 'nps') {
        newQ.ratingConfig = { scale: 10, lowLabel: 'Not at all likely', highLabel: 'Extremely likely' };
      }
      if (qType === 'multiple_choice') {
        newQ.choices = [
          { id: uuid(), label: 'Option 1' },
          { id: uuid(), label: 'Option 2' },
          { id: uuid(), label: 'Option 3' },
        ];
      }
      if (qType === 'text') {
        newQ.placeholder = 'Enter your response';
      }

      page.questions.push(newQ);

      // Select it immediately
      state.editorPanel = { isOpen: true, questionId: newQ.id };
    },
  },
});

// Helper to find a question across all pages
function findQuestion(survey: Survey | null, questionId: string): Question | undefined {
  if (!survey) return undefined;
  for (const page of survey.pages) {
    const q = page.questions.find((q) => q.id === questionId);
    if (q) return q;
  }
  return undefined;
}

export const surveyActions = surveySlice.actions;
export default surveySlice.reducer;
