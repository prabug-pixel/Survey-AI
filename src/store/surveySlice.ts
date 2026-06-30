import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';
import type {
  Survey,
  Question,
  QuestionType,
  SkipLogicRule,
  PreviewMode,
  EditorPanelState,
  MatrixRow,
  WelcomeConfig,
  ThankYouConfig,
  SavedSurvey,
  ExpirationConfig,
  AuditLogEntry,
  CampaignConfig,
} from '../types/survey.types';
import { SAMPLE_SURVEY } from '../constants/sampleSurvey';


export interface EditHistoryEntry {
  editedAt: string;
  editedBy: string;
  score: number;
  changedQuestions: Array<{ questionId: string; questionText: string; from: string | number | string[]; to: string | number | string[] }>;
}

export interface EditedResponseEntry {
  answers: Array<{ questionId: string; value: string | number | string[] }>;
  score: number;
  editedAt: string;
  editedBy: string;
  editedQuestionIds: string[];
  history: EditHistoryEntry[];
}

interface SurveyState {
  survey: Survey | null;
  previewMode: PreviewMode;
  editorPanel: EditorPanelState;
  activeTab: 'ai' | 'manual';
  surveyGenerated: boolean;
  savedSurveys: SavedSurvey[];
  editedResponses: Record<string, EditedResponseEntry>;
}

const initialState: SurveyState = {
  survey: null,
  previewMode: 'desktop',
  editorPanel: { isOpen: false, questionId: null },
  activeTab: 'ai',
  surveyGenerated: false,
  savedSurveys: [],
  editedResponses: {},
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
        const newType = action.payload.type;
        question.type = newType;
        // Initialize defaults for new type
        if (newType === 'rating' && !question.ratingConfig) {
          question.ratingConfig = { scale: 5, lowLabel: 'Not at all likely', highLabel: 'Extremely likely' };
        }
        if (newType === 'nps' && !question.ratingConfig) {
          question.ratingConfig = { scale: 10, lowLabel: 'Not at all likely', highLabel: 'Extremely likely' };
        }
        if ((newType === 'multiple_choice' || newType === 'checkboxes' || newType === 'dropdown') && !question.choices) {
          question.choices = [
            { id: uuid(), label: 'Option 1' },
            { id: uuid(), label: 'Option 2' },
            { id: uuid(), label: 'Option 3' },
          ];
        }
        if ((newType === 'text' || newType === 'short_text' || newType === 'paragraph') && !question.placeholder) {
          question.placeholder = 'Enter your response';
        }
        if ((newType === 'matrix_radio' || newType === 'matrix_ratings') && !question.matrixConfig) {
          question.matrixConfig = {
            rows: [
              { id: uuid(), label: 'Row 1' },
              { id: uuid(), label: 'Row 2' },
              { id: uuid(), label: 'Row 3' },
            ],
            columnScale: 3,
            columnLabels: ['Extremely unsatisfactory', 'Unsatisfactory', 'Neutral'],
          };
        }
        if (newType === 'matrix_dropdown' && !question.matrixConfig) {
          question.matrixConfig = {
            rows: [
              { id: uuid(), label: 'Category 1' },
              { id: uuid(), label: 'Category 2' },
              { id: uuid(), label: 'Category 3' },
            ],
            columnScale: 0,
            columnLabels: [],
          };
          if (!question.choices) {
            question.choices = [
              { id: uuid(), label: 'Good' },
              { id: uuid(), label: 'Average' },
              { id: uuid(), label: 'Excellent' },
            ];
          }
        }
        if (newType === 'contact_info' && !question.contactInfoConfig) {
          question.contactInfoConfig = {
            fields: [
              { id: 'firstName', label: 'First name', enabled: true },
              { id: 'lastName', label: 'Last name', enabled: true },
              { id: 'email', label: 'Email', enabled: true },
              { id: 'phone', label: 'Phone', enabled: true },
            ],
            saveToBirdeye: true,
          };
        }
        if (newType === 'date_time' && !question.dateTimeConfig) {
          question.dateTimeConfig = {
            includeDate: true,
            includeTime: true,
            startTime: '10:00 AM',
            endTime: '06:00 PM',
            interval: '30 mins',
          };
        }
        if (newType === 'location' && !question.locationConfig) {
          question.locationConfig = {
            locationChoices: 'All locations',
            showAlias: true,
          };
        }
        if (newType === 'review_collector' && !question.reviewCollectorConfig) {
          question.reviewCollectorConfig = {
            sources: ['google', 'birdeye'],
            requestPublicReview: true,
            showContactUs: true,
            buttonColor: '#1976D2',
            buttonTextColor: '#FFFFFF',
          };
        }
        if (newType === 'welcome' && !question.welcomeConfig) {
          question.welcomeConfig = {
            description: 'Tell us about your experience',
            buttonText: 'Start Survey',
            showImage: true,
          };
        }
        if (newType === 'thank_you' && !question.thankYouConfig) {
          question.thankYouConfig = {
            redirectUrl: '',
            showRedirect: false,
          };
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
      const KNOWN_TYPES: QuestionType[] = [
        'nps', 'rating', 'multiple_choice', 'text',
        'short_text', 'paragraph', 'help_text',
        'checkboxes', 'dropdown',
        'matrix_radio', 'matrix_ratings', 'matrix_dropdown',
        'welcome', 'contact_info', 'date_time', 'location',
        'review_collector', 'review_request', 'thank_you',
        'page_title', 'page_break',
      ];
      const qType: QuestionType = KNOWN_TYPES.includes(rawType as QuestionType)
        ? (rawType as QuestionType)
        : 'text';

      const newQ: Question = {
        id: uuid(),
        type: qType,
        text: qType === 'help_text' ? 'Help text' : 'Enter question',
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
      if (qType === 'checkboxes') {
        newQ.choices = [
          { id: uuid(), label: 'Option 1' },
          { id: uuid(), label: 'Option 2' },
          { id: uuid(), label: 'Option 3' },
        ];
      }
      if (qType === 'dropdown') {
        newQ.choices = [
          { id: uuid(), label: 'Option 1' },
          { id: uuid(), label: 'Option 2' },
          { id: uuid(), label: 'Option 3' },
        ];
      }
      if (qType === 'text' || qType === 'short_text' || qType === 'paragraph') {
        newQ.placeholder = 'Enter your response';
      }
      if (qType === 'matrix_radio' || qType === 'matrix_ratings') {
        newQ.matrixConfig = {
          rows: [
            { id: uuid(), label: 'Row 1' },
            { id: uuid(), label: 'Row 2' },
            { id: uuid(), label: 'Row 3' },
          ],
          columnScale: 3,
          columnLabels: ['Extremely unsatisfactory', 'Unsatisfactory', 'Neutral'],
        };
      }
      if (qType === 'matrix_dropdown') {
        newQ.matrixConfig = {
          rows: [
            { id: uuid(), label: 'Category 1' },
            { id: uuid(), label: 'Category 2' },
            { id: uuid(), label: 'Category 3' },
          ],
          columnScale: 0,
          columnLabels: [],
        };
        newQ.choices = [
          { id: uuid(), label: 'Good' },
          { id: uuid(), label: 'Average' },
          { id: uuid(), label: 'Excellent' },
        ];
      }
      if (qType === 'contact_info') {
        newQ.contactInfoConfig = {
          fields: [
            { id: 'firstName', label: 'First name', enabled: true },
            { id: 'lastName', label: 'Last name', enabled: true },
            { id: 'email', label: 'Email', enabled: true },
            { id: 'phone', label: 'Phone', enabled: true },
          ],
          saveToBirdeye: true,
        };
      }
      if (qType === 'date_time') {
        newQ.dateTimeConfig = {
          includeDate: true,
          includeTime: true,
          startTime: '10:00 AM',
          endTime: '06:00 PM',
          interval: '30 mins',
        };
      }
      if (qType === 'location') {
        newQ.locationConfig = {
          locationChoices: 'All locations',
          showAlias: true,
        };
      }
      if (qType === 'review_collector') {
        newQ.reviewCollectorConfig = {
          sources: ['google', 'birdeye'],
          requestPublicReview: true,
          showContactUs: true,
          buttonColor: '#1976D2',
          buttonTextColor: '#FFFFFF',
        };
      }
      if (qType === 'welcome') {
        newQ.welcomeConfig = {
          description: 'Tell us about your experience',
          buttonText: 'Start Survey',
          showImage: true,
        };
      }
      if (qType === 'thank_you') {
        newQ.thankYouConfig = {
          redirectUrl: '',
          showRedirect: false,
        };
      }

      page.questions.push(newQ);

      // Select it immediately
      state.editorPanel = { isOpen: true, questionId: newQ.id };
    },

    // Matrix: add row
    addMatrixRow(state, action: PayloadAction<string>) {
      const question = findQuestion(state.survey, action.payload);
      if (question?.matrixConfig) {
        question.matrixConfig.rows.push({
          id: uuid(),
          label: `Row ${question.matrixConfig.rows.length + 1}`,
        });
      }
    },

    // Matrix: update row label
    updateMatrixRow(state, action: PayloadAction<{ questionId: string; rowId: string; label: string }>) {
      const question = findQuestion(state.survey, action.payload.questionId);
      const row = question?.matrixConfig?.rows.find((r: MatrixRow) => r.id === action.payload.rowId);
      if (row) {
        row.label = action.payload.label;
      }
    },

    // Matrix: remove row
    removeMatrixRow(state, action: PayloadAction<{ questionId: string; rowId: string }>) {
      const question = findQuestion(state.survey, action.payload.questionId);
      if (question?.matrixConfig) {
        question.matrixConfig.rows = question.matrixConfig.rows.filter(
          (r: MatrixRow) => r.id !== action.payload.rowId
        );
      }
    },

    // Matrix: update column scale
    updateMatrixColumnScale(state, action: PayloadAction<{ questionId: string; scale: number }>) {
      const question = findQuestion(state.survey, action.payload.questionId);
      if (question?.matrixConfig) {
        const scale = action.payload.scale;
        question.matrixConfig.columnScale = scale;
        const LABELS_MAP: Record<number, string[]> = {
          3: ['Extremely unsatisfactory', 'Unsatisfactory', 'Neutral'],
          5: ['Extremely unsatisfactory', 'Unsatisfactory', 'Neutral', 'Satisfactory', 'Extremely satisfactory'],
          7: ['Extremely unsatisfactory', 'Very unsatisfactory', 'Unsatisfactory', 'Neutral', 'Satisfactory', 'Very satisfactory', 'Extremely satisfactory'],
        };
        question.matrixConfig.columnLabels = LABELS_MAP[scale] || LABELS_MAP[3];
      }
    },

    // Contact Info: update field enabled
    updateContactInfoField(state, action: PayloadAction<{ questionId: string; fieldId: string; enabled: boolean }>) {
      const question = findQuestion(state.survey, action.payload.questionId);
      if (question?.contactInfoConfig) {
        const field = question.contactInfoConfig.fields.find(f => f.id === action.payload.fieldId);
        if (field) {
          field.enabled = action.payload.enabled;
        }
      }
    },

    // Contact Info: toggle save to Birdeye
    toggleSaveToBirdeye(state, action: PayloadAction<string>) {
      const question = findQuestion(state.survey, action.payload);
      if (question?.contactInfoConfig) {
        question.contactInfoConfig.saveToBirdeye = !question.contactInfoConfig.saveToBirdeye;
      }
    },

    // Date/Time: update config
    updateDateTimeConfig(state, action: PayloadAction<{ questionId: string; updates: Partial<any> }>) {
      const question = findQuestion(state.survey, action.payload.questionId);
      if (question?.dateTimeConfig) {
        question.dateTimeConfig = { ...question.dateTimeConfig, ...action.payload.updates };
      }
    },

    // Review Collector: update config
    updateReviewCollectorConfig(state, action: PayloadAction<{ questionId: string; updates: Partial<any> }>) {
      const question = findQuestion(state.survey, action.payload.questionId);
      if (question?.reviewCollectorConfig) {
        question.reviewCollectorConfig = { ...question.reviewCollectorConfig, ...action.payload.updates };
      }
    },

    // Welcome: update config
    updateWelcomeConfig(state, action: PayloadAction<{ questionId: string; updates: Partial<WelcomeConfig> }>) {
      const question = findQuestion(state.survey, action.payload.questionId);
      if (question?.welcomeConfig) {
        question.welcomeConfig = { ...question.welcomeConfig, ...action.payload.updates };
      }
    },

    // Thank You: update config
    updateThankYouConfig(state, action: PayloadAction<{ questionId: string; updates: Partial<ThankYouConfig> }>) {
      const question = findQuestion(state.survey, action.payload.questionId);
      if (question?.thankYouConfig) {
        question.thankYouConfig = { ...question.thankYouConfig, ...action.payload.updates };
      }
    },

    publishSurvey(state) {
      if (state.survey) {
        const now = new Date();
        const formatted = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        const surveySnapshot = { ...state.survey, status: 'published' as const };
        const existing = state.savedSurveys.findIndex(s => s.id === state.survey!.id);
        const prior = existing >= 0 ? state.savedSurveys[existing] : undefined;
        const saved: SavedSurvey = {
          id: state.survey.id,
          title: state.survey.title,
          status: 'published',
          sent: prior?.sent ?? 0,
          responses: prior?.responses ?? 0,
          lastUpdated: formatted,
          owner: prior?.owner ?? 'Prabu',
          surveyData: surveySnapshot,
          expiration: prior?.expiration,
          auditLog: prior?.auditLog,
          campaign: prior?.campaign,
        };
        if (existing >= 0) {
          state.savedSurveys[existing] = saved;
        } else {
          state.savedSurveys.unshift(saved);
        }
      }
      state.survey = null;
      state.surveyGenerated = false;
      state.editorPanel = { isOpen: false, questionId: null };
    },

    // Save the in-progress survey as a Draft. Used by the Back button so
    // unpublished work is preserved in `All Surveys` instead of being
    // discarded. If the survey was previously published, keep its current
    // saved status (don't downgrade a Published survey to Draft).
    saveSurveyAsDraft(state) {
      if (state.survey && state.survey.pages.some(p => p.questions.length > 0)) {
        const now = new Date();
        const formatted = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        const existing = state.savedSurveys.findIndex(s => s.id === state.survey!.id);
        const prior = existing >= 0 ? state.savedSurveys[existing] : undefined;
        const keepStatus = prior && prior.status !== 'draft' ? prior.status : 'draft';
        const surveySnapshot = { ...state.survey, status: 'draft' as const };
        const saved: SavedSurvey = {
          id: state.survey.id,
          title: state.survey.title,
          status: keepStatus,
          sent: prior?.sent ?? 0,
          responses: prior?.responses ?? 0,
          lastUpdated: formatted,
          owner: prior?.owner ?? 'Prabu',
          surveyData: surveySnapshot,
          expiration: prior?.expiration,
          auditLog: prior?.auditLog,
          campaign: prior?.campaign,
        };
        if (existing >= 0) {
          state.savedSurveys[existing] = saved;
        } else {
          state.savedSurveys.unshift(saved);
        }
      }
      state.survey = null;
      state.surveyGenerated = false;
      state.editorPanel = { isOpen: false, questionId: null };
    },

    deleteSavedSurvey(state, action: PayloadAction<string>) {
      state.savedSurveys = state.savedSurveys.filter(s => s.id !== action.payload);
    },

    updateExpiration(
      state,
      action: PayloadAction<{ surveyId: string; config: ExpirationConfig; actor: string }>
    ) {
      const s = state.savedSurveys.find(sv => sv.id === action.payload.surveyId);
      if (!s) return;
      const prev = s.expiration;
      s.expiration = action.payload.config;
      if (action.payload.config.enabled && action.payload.config.endDate) {
        const now = Date.now();
        const end = new Date(action.payload.config.endDate).getTime();
        const hoursLeft = (end - now) / 3600000;
        if (s.status === 'published' && hoursLeft <= 72 && hoursLeft > 0) {
          s.status = 'expiring_soon';
        }
      } else if (!action.payload.config.enabled && s.status === 'expiring_soon') {
        s.status = 'published';
      }
      if (!s.auditLog) s.auditLog = [];
      const isNew = !prev?.enabled && action.payload.config.enabled;
      const detail = isNew
        ? `Expiration enabled · end date: ${action.payload.config.endDate
            ? new Date(action.payload.config.endDate).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
            : 'not set'}`
        : action.payload.config.enabled
        ? `Expiration settings updated`
        : `Expiration disabled`;
      s.auditLog.unshift({
        id: uuid(),
        action: isNew ? 'Enabled expiration' : 'Modified expiration settings',
        actor: action.payload.actor,
        timestamp: new Date().toISOString(),
        details: detail,
      });
    },

    // Live autosave path used by the Expiry Settings form.
    // Mirrors updateExpiration's data + status logic, but only writes an
    // audit-log entry when the user flips the expiration on/off — typing in
    // text fields persists silently so the log isn't spammed.
    patchExpiration(
      state,
      action: PayloadAction<{ surveyId: string; config: ExpirationConfig; actor: string }>
    ) {
      const s = state.savedSurveys.find(sv => sv.id === action.payload.surveyId);
      if (!s) return;
      const prev = s.expiration;
      s.expiration = action.payload.config;

      if (action.payload.config.enabled && action.payload.config.endDate) {
        const hoursLeft = (new Date(action.payload.config.endDate).getTime() - Date.now()) / 3600000;
        if (s.status === 'published' && hoursLeft <= 72 && hoursLeft > 0) {
          s.status = 'expiring_soon';
        } else if (s.status === 'expiring_soon' && hoursLeft > 72) {
          s.status = 'published';
        }
      } else if (!action.payload.config.enabled && s.status === 'expiring_soon') {
        s.status = 'published';
      }

      const prevEnabled = !!prev?.enabled;
      const nextEnabled = action.payload.config.enabled;
      if (prevEnabled !== nextEnabled) {
        if (!s.auditLog) s.auditLog = [];
        s.auditLog.unshift({
          id: uuid(),
          action: nextEnabled ? 'Enabled expiration' : 'Disabled expiration',
          actor: action.payload.actor,
          timestamp: new Date().toISOString(),
          details: nextEnabled
            ? `Expiration enabled · end date: ${action.payload.config.endDate
                ? new Date(action.payload.config.endDate).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
                : 'not set'}`
            : 'Expiration disabled',
        });
      }
    },

    closeSurveyNow(state, action: PayloadAction<{ surveyId: string; actor: string }>) {
      const s = state.savedSurveys.find(sv => sv.id === action.payload.surveyId);
      if (!s) return;
      s.status = 'expired';
      if (!s.auditLog) s.auditLog = [];
      s.auditLog.unshift({
        id: uuid(),
        action: 'Manually closed survey',
        actor: action.payload.actor,
        timestamp: new Date().toISOString(),
        details: 'Survey closed via "Close now" action. All in-progress sessions terminated.',
      });
    },

    reopenSurvey(
      state,
      action: PayloadAction<{ surveyId: string; newEndDate?: string; actor: string }>
    ) {
      const s = state.savedSurveys.find(sv => sv.id === action.payload.surveyId);
      if (!s) return;
      s.status = 'published';
      if (s.expiration) {
        s.expiration.enabled = false;
        if (action.payload.newEndDate) {
          s.expiration.endDate = action.payload.newEndDate;
          s.expiration.enabled = true;
        }
      }
      if (!s.auditLog) s.auditLog = [];
      s.auditLog.unshift({
        id: uuid(),
        action: 'Reopened survey',
        actor: action.payload.actor,
        timestamp: new Date().toISOString(),
        details: action.payload.newEndDate
          ? `Survey reopened · new end date: ${new Date(action.payload.newEndDate).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`
          : 'Survey reopened with no expiration set. Previously-issued links restored.',
      });
    },

    addAuditEntry(
      state,
      action: PayloadAction<{ surveyId: string; entry: Omit<AuditLogEntry, 'id'> }>
    ) {
      const s = state.savedSurveys.find(sv => sv.id === action.payload.surveyId);
      if (!s) return;
      if (!s.auditLog) s.auditLog = [];
      s.auditLog.unshift({ ...action.payload.entry, id: uuid() });
    },

    // Live autosave for the Survey Campaigns builder. Refuses writes to
    // link-expiry fields once status === 'live' (the form already disables
    // the control, this is the persistence-side guard).
    patchCampaign(
      state,
      action: PayloadAction<{ surveyId: string; config: CampaignConfig }>
    ) {
      const s = state.savedSurveys.find(sv => sv.id === action.payload.surveyId);
      if (!s) return;
      const prev = s.campaign;
      const next = action.payload.config;
      // Lock expiry edits after launch.
      if (prev?.status === 'live' && prev.options?.linkExpiry) {
        next.options = { ...next.options, linkExpiry: prev.options.linkExpiry };
      }
      s.campaign = next;
    },

    saveEditedResponse(
      state,
      action: PayloadAction<{ key: string; entry: EditedResponseEntry }>
    ) {
      state.editedResponses[action.payload.key] = action.payload.entry;
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
