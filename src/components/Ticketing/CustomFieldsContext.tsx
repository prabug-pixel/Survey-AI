// ============================================================
// Shared store for everything an admin can configure under
// Ticketing > Settings. The mock app keeps it all in one
// provider so the activity modal, the ticket list, and every
// settings page share state without prop-drilling.
// ============================================================
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

// ── Custom fields ──────────────────────────────────────────
export type CustomFieldType =
  | 'text'
  | 'longText'
  | 'dropdown'
  | 'number'
  | 'date'
  | 'checkbox'
  | 'user';

export type CustomFieldKind = 'severity' | 'sentiment' | 'rootCause' | 'rootCauseComment' | 'custom';

export interface CustomField {
  id: string;
  name: string;
  type: CustomFieldType;
  description?: string;
  options?: string[];
  required: boolean;
  visible: boolean;       // shows in the activity modal side rail
  filterable: boolean;
  /** Built-ins (severity / sentiment / rootCause) cannot be deleted, only edited. */
  kind: CustomFieldKind;
}

// ── Sources (1.1 + 1.5) ────────────────────────────────────
export type SourceChannel =
  | 'review'
  | 'survey'
  | 'social'
  | 'email'
  | 'call'
  | 'custom';

export interface TicketSource {
  id: string;
  name: string;
  channel: SourceChannel;
  /** For email-channel sources, the Birdeye-provided inbound address. */
  inboundEmail?: string;
  /** Whether this source can auto-create tickets. */
  autoCreate: boolean;
}

// ── Round robin assignment rules (1.4) ─────────────────────
export type AssignmentTargetType = 'agent' | 'team' | 'role';

export interface AssignmentTarget {
  type: AssignmentTargetType;
  id: string;
  name: string;
}

export interface AssignmentRule {
  id: string;
  name: string;
  /** Tickets matching this source set get round-robin'd. */
  sourceIds: string[];
  /** Pool of targets to round-robin across. */
  pool: AssignmentTarget[];
  enabled: boolean;
}

// ── SLA rules (1.7) ────────────────────────────────────────
export type SeverityLevel = 'High' | 'Medium' | 'Low';

export interface SlaRule {
  id: string;
  name: string;
  sourceIds: string[];         // any → applies to all
  severity?: SeverityLevel;    // optional severity filter
  hours: number;
  workingDaysOnly: boolean;
  escalation?: {
    notify: string;            // role or user label
    afterHours: number;
  };
  enabled: boolean;
}

// ── Context surface ────────────────────────────────────────
interface CustomFieldsContextValue {
  // Fields
  fields: CustomField[];
  addField: (f: Omit<CustomField, 'id' | 'kind'> & { kind?: CustomFieldKind }) => void;
  updateField: (id: string, patch: Partial<CustomField>) => void;
  removeField: (id: string) => void;

  // Sources
  sources: TicketSource[];
  addSource: (s: Omit<TicketSource, 'id'>) => void;
  updateSource: (id: string, patch: Partial<TicketSource>) => void;
  removeSource: (id: string) => void;

  // Assignment rules
  assignmentRules: AssignmentRule[];
  addAssignmentRule: (r: Omit<AssignmentRule, 'id'>) => void;
  updateAssignmentRule: (id: string, patch: Partial<AssignmentRule>) => void;
  removeAssignmentRule: (id: string) => void;

  // SLA rules
  slaRules: SlaRule[];
  addSlaRule: (r: Omit<SlaRule, 'id'>) => void;
  updateSlaRule: (id: string, patch: Partial<SlaRule>) => void;
  removeSlaRule: (id: string) => void;
}

const CustomFieldsContext = createContext<CustomFieldsContextValue | null>(null);

// ── Seed data ──────────────────────────────────────────────
// Seeded to match the AmeriGas PRD so the mock demonstrates the
// real use cases (Severity/Sentiment/Root cause, Outlook inboxes,
// 24h executive vs 48h review SLA, etc.) on first load.
const SEED_FIELDS: CustomField[] = [
  {
    id: 'cf-severity',
    name: 'Severity',
    type: 'dropdown',
    description: 'Drives prioritization, color coding, and SLA',
    options: ['High', 'Medium', 'Low'],
    required: true,
    visible: true,
    filterable: true,
    kind: 'severity',
  },
  {
    id: 'cf-sentiment',
    name: 'Sentiment',
    type: 'dropdown',
    description: 'Reviewer / customer sentiment',
    options: ['Positive', 'Neutral', 'Negative', 'Mixed'],
    required: false,
    visible: true,
    filterable: true,
    kind: 'sentiment',
  },
  {
    id: 'cf-rootCause',
    name: 'Root cause',
    type: 'dropdown',
    description: 'Operational/diagnostic categorization',
    options: ['Process error', 'Delivery service team', 'Customer service', 'Field-related'],
    required: false,
    visible: true,
    filterable: true,
    kind: 'rootCause',
  },
  {
    id: 'cf-rootCauseComment',
    name: 'Root cause comment',
    type: 'longText',
    description: 'Elaboration paired with Root cause (separate from general comments)',
    required: false,
    visible: true,
    filterable: false,
    kind: 'rootCauseComment',
  },
];

const SEED_SOURCES: TicketSource[] = [
  { id: 'src-facebook',  name: 'Facebook',         channel: 'social',  autoCreate: true },
  { id: 'src-twitter',   name: 'Twitter / X',      channel: 'social',  autoCreate: true },
  { id: 'src-linkedin',  name: 'LinkedIn',         channel: 'social',  autoCreate: true },
  { id: 'src-gmb',       name: 'Google My Business', channel: 'review', autoCreate: true },
  { id: 'src-bbb',       name: 'BBB reviews',      channel: 'review',  autoCreate: true },
  { id: 'src-nps',       name: 'NPS survey',       channel: 'survey',  autoCreate: true },
  { id: 'src-social-in', name: 'Social inbox',     channel: 'email',   inboundEmail: 'social-amerigas@inbound.birdeye.com', autoCreate: true },
  { id: 'src-gmb-in',    name: 'GMB inbox',        channel: 'email',   inboundEmail: 'gmb-amerigas@inbound.birdeye.com',   autoCreate: true },
  { id: 'src-exec',      name: 'Executive escalation', channel: 'custom', autoCreate: false },
];

const SEED_ASSIGNMENT: AssignmentRule[] = [
  {
    id: 'asg-1',
    name: 'Social team round robin',
    sourceIds: ['src-facebook', 'src-twitter', 'src-linkedin', 'src-social-in'],
    pool: [
      { type: 'team', id: 'team-social', name: 'Social media team' },
    ],
    enabled: true,
  },
  {
    id: 'asg-2',
    name: 'GMB team round robin',
    sourceIds: ['src-gmb', 'src-gmb-in'],
    pool: [
      { type: 'team', id: 'team-gmb', name: 'GMB team' },
    ],
    enabled: true,
  },
];

const SEED_SLA: SlaRule[] = [
  {
    id: 'sla-exec',
    name: 'Executive escalations',
    sourceIds: ['src-exec'],
    hours: 24,
    workingDaysOnly: false,
    escalation: { notify: 'Director', afterHours: 24 },
    enabled: true,
  },
  {
    id: 'sla-review',
    name: 'Online reviews',
    sourceIds: ['src-gmb', 'src-bbb'],
    hours: 48,
    workingDaysOnly: true,
    enabled: true,
  },
  {
    id: 'sla-high',
    name: 'High severity (any source)',
    sourceIds: [],
    severity: 'High',
    hours: 8,
    workingDaysOnly: false,
    escalation: { notify: 'Manager', afterHours: 8 },
    enabled: true,
  },
];

export const CustomFieldsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fields, setFields] = useState<CustomField[]>(SEED_FIELDS);
  const [sources, setSources] = useState<TicketSource[]>(SEED_SOURCES);
  const [assignmentRules, setAssignmentRules] = useState<AssignmentRule[]>(SEED_ASSIGNMENT);
  const [slaRules, setSlaRules] = useState<SlaRule[]>(SEED_SLA);

  // Fields
  const addField = useCallback((f: Omit<CustomField, 'id' | 'kind'> & { kind?: CustomFieldKind }) => {
    setFields(prev => [...prev, { ...f, kind: f.kind ?? 'custom', id: `cf-${Date.now()}` }]);
  }, []);
  const updateField = useCallback((id: string, patch: Partial<CustomField>) => {
    setFields(prev => prev.map(f => (f.id === id ? { ...f, ...patch } : f)));
  }, []);
  // Built-ins (severity / sentiment / root cause) are protected — only
  // `custom`-kind fields can be deleted.
  const removeField = useCallback((id: string) => {
    setFields(prev => prev.filter(f => !(f.id === id && f.kind === 'custom')));
  }, []);

  // Sources
  const addSource = useCallback((s: Omit<TicketSource, 'id'>) => {
    setSources(prev => [...prev, { ...s, id: `src-${Date.now()}` }]);
  }, []);
  const updateSource = useCallback((id: string, patch: Partial<TicketSource>) => {
    setSources(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)));
  }, []);
  const removeSource = useCallback((id: string) => {
    setSources(prev => prev.filter(s => s.id !== id));
  }, []);

  // Assignment rules
  const addAssignmentRule = useCallback((r: Omit<AssignmentRule, 'id'>) => {
    setAssignmentRules(prev => [...prev, { ...r, id: `asg-${Date.now()}` }]);
  }, []);
  const updateAssignmentRule = useCallback((id: string, patch: Partial<AssignmentRule>) => {
    setAssignmentRules(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));
  }, []);
  const removeAssignmentRule = useCallback((id: string) => {
    setAssignmentRules(prev => prev.filter(r => r.id !== id));
  }, []);

  // SLA rules
  const addSlaRule = useCallback((r: Omit<SlaRule, 'id'>) => {
    setSlaRules(prev => [...prev, { ...r, id: `sla-${Date.now()}` }]);
  }, []);
  const updateSlaRule = useCallback((id: string, patch: Partial<SlaRule>) => {
    setSlaRules(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));
  }, []);
  const removeSlaRule = useCallback((id: string) => {
    setSlaRules(prev => prev.filter(r => r.id !== id));
  }, []);

  const value = useMemo<CustomFieldsContextValue>(
    () => ({
      fields, addField, updateField, removeField,
      sources, addSource, updateSource, removeSource,
      assignmentRules, addAssignmentRule, updateAssignmentRule, removeAssignmentRule,
      slaRules, addSlaRule, updateSlaRule, removeSlaRule,
    }),
    [
      fields, addField, updateField, removeField,
      sources, addSource, updateSource, removeSource,
      assignmentRules, addAssignmentRule, updateAssignmentRule, removeAssignmentRule,
      slaRules, addSlaRule, updateSlaRule, removeSlaRule,
    ],
  );

  return (
    <CustomFieldsContext.Provider value={value}>{children}</CustomFieldsContext.Provider>
  );
};

export const useCustomFields = (): CustomFieldsContextValue => {
  const ctx = useContext(CustomFieldsContext);
  if (!ctx) throw new Error('useCustomFields must be used within CustomFieldsProvider');
  return ctx;
};

// ── Static label tables ────────────────────────────────────
export const FIELD_TYPE_LABELS: Record<CustomFieldType, string> = {
  text: 'Text',
  longText: 'Long text',
  dropdown: 'Dropdown',
  number: 'Number',
  date: 'Date',
  checkbox: 'Checkbox',
  user: 'User',
};

export const FIELD_TYPE_OPTIONS: { value: CustomFieldType; label: string }[] = [
  { value: 'text',     label: 'Text' },
  { value: 'longText', label: 'Long text' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'number',   label: 'Number' },
  { value: 'date',     label: 'Date' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'user',     label: 'User' },
];

export const SOURCE_CHANNEL_LABELS: Record<SourceChannel, string> = {
  review: 'Review',
  survey: 'Survey',
  social: 'Social',
  email: 'Email inbox',
  call: 'Call',
  custom: 'Custom',
};

export const SOURCE_CHANNEL_OPTIONS: { value: SourceChannel; label: string }[] = [
  { value: 'review', label: 'Review' },
  { value: 'survey', label: 'Survey' },
  { value: 'social', label: 'Social' },
  { value: 'email',  label: 'Email inbox' },
  { value: 'call',   label: 'Call' },
  { value: 'custom', label: 'Custom' },
];

// Color tokens for the Severity badge — High/Med/Low ramp shared by
// the ticket list, the activity modal pill, and the SLA list.
export const SEVERITY_COLORS: Record<SeverityLevel, { bg: string; fg: string; dot: string }> = {
  High:   { bg: '#fde7e7', fg: '#b71c1c', dot: '#d32f2f' },
  Medium: { bg: '#fff4d6', fg: '#7a5300', dot: '#f9a825' },
  Low:    { bg: '#e6f4ea', fg: '#1b5e20', dot: '#2e7d32' },
};
