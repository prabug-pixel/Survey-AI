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

export type CustomFieldKind =
  // Customer-info system fields
  | 'firstName' | 'lastName' | 'assignTo' | 'status'
  | 'location'  | 'city'     | 'state'
  // Contact-info system fields
  | 'email'     | 'phone'
  // Ticket-info system fields
  | 'source'    | 'description'
  // Ticket-card meta (rendered on the list-view card right rail, not in the
  // create-ticket form). Toggling these on/off lives behind the same Visible
  // toggle as everything else.
  | 'date'      | 'watchers'
  // Preset ticket fields (existing built-ins)
  | 'severity'  | 'sentiment' | 'rootCause' | 'rootCauseComment'
  // User-added fields
  | 'custom';

// Maximum number of fields that can be marked `visible` simultaneously.
// `visible` controls which fields render on the list-view ticket card's
// right rail — beyond five, the rail starts to overflow the row height.
export const MAX_CARD_VISIBLE_FIELDS = 5;

/** Logical grouping used when rendering fields in the Create ticket modal. */
export type FieldSection = 'customer' | 'contact' | 'ticket';

export interface CustomField {
  id: string;
  name: string;
  type: CustomFieldType;
  description?: string;
  options?: string[];
  required: boolean;
  /** When true, the field renders on the list-view ticket card's right rail.
   *  Capped at `MAX_CARD_VISIBLE_FIELDS` across the whole config. */
  visible: boolean;
  filterable: boolean;
  sortable: boolean;
  /** System fields cannot be deleted, only edited. See `isCustomField`. */
  kind: CustomFieldKind;
  /** Section this field belongs to in the Create ticket modal. */
  section: FieldSection;
}

// Severity / Sentiment / Root cause are seeded but treated as business-added
// custom fields (they appear under "Custom fields" in the activity modal and
// surface a "Custom" tag in Settings). Everything else seeded — name, email,
// status, source, etc. — is a true system field with no tag.
const CUSTOM_FIELD_KINDS: ReadonlySet<CustomFieldKind> = new Set<CustomFieldKind>([
  'severity', 'sentiment', 'rootCause', 'rootCauseComment', 'custom',
]);

export const isCustomField = (field: CustomField): boolean =>
  CUSTOM_FIELD_KINDS.has(field.kind);

export const FIELD_SECTION_LABELS: Record<FieldSection, string> = {
  customer: 'Customer information',
  contact:  'Contact Information',
  ticket:   'Ticket details',
};

export const FIELD_SECTION_ORDER: FieldSection[] = ['customer', 'contact', 'ticket'];

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
  addField: (f: Omit<CustomField, 'id' | 'kind' | 'section'> & { kind?: CustomFieldKind; section?: FieldSection }) => void;
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
// Single source of truth for every field/property that appears in the
// Create ticket modal AND the Settings > Fields list. System fields
// (firstName, status, source, …) are seeded with a unique kind so they
// can't be removed and render without a tag. Severity / Sentiment /
// Root cause are seeded as business-added "Custom" fields (see
// `isCustomField`) and render the Custom tag.
const SEED_FIELDS: CustomField[] = [
  // ── Customer information ──
  {
    id: 'cf-firstName',
    name: 'First Name',
    type: 'text',
    required: true,
    visible: false,
    filterable: false,
    sortable: false,
    kind: 'firstName',
    section: 'customer',
  },
  {
    id: 'cf-lastName',
    name: 'Last Name',
    type: 'text',
    required: false,
    visible: false,
    filterable: false,
    sortable: false,
    kind: 'lastName',
    section: 'customer',
  },
  {
    id: 'cf-assignTo',
    name: 'Assign to',
    type: 'user',
    required: false,
    visible: false,
    filterable: true,
    sortable: true,
    kind: 'assignTo',
    section: 'customer',
  },
  {
    id: 'cf-status',
    name: 'Status',
    type: 'dropdown',
    options: ['New', 'Assigned', 'In progress', 'Closed'],
    required: false,
    visible: true,
    filterable: true,
    sortable: true,
    kind: 'status',
    section: 'customer',
  },
  {
    id: 'cf-location',
    name: 'Location',
    type: 'dropdown',
    options: ['100 feet road', 'Cut n Looks Unisex Salon', 'Jennifer Smere Dental'],
    required: false,
    visible: true,
    filterable: true,
    sortable: true,
    kind: 'location',
    section: 'customer',
  },
  {
    id: 'cf-city',
    name: 'City',
    type: 'text',
    required: false,
    visible: false,
    filterable: false,
    sortable: false,
    kind: 'city',
    section: 'customer',
  },
  {
    id: 'cf-state',
    name: 'State',
    type: 'dropdown',
    options: ['Alabama', 'California', 'Florida', 'Illinois', 'New York', 'Texas'],
    required: false,
    visible: false,
    filterable: true,
    sortable: true,
    kind: 'state',
    section: 'customer',
  },

  // ── Contact information ──
  {
    id: 'cf-email',
    name: 'Email',
    type: 'text',
    required: false,
    visible: false,
    filterable: false,
    sortable: false,
    kind: 'email',
    section: 'contact',
  },
  {
    id: 'cf-phone',
    name: 'Phone',
    type: 'text',
    required: false,
    visible: false,
    filterable: false,
    sortable: false,
    kind: 'phone',
    section: 'contact',
  },

  // ── Ticket details ──
  {
    id: 'cf-source',
    name: 'Source',
    type: 'dropdown',
    options: ['Social', 'Reviews', 'Survey', 'Email', 'Phone', 'Chat', 'Internal'],
    required: false,
    visible: false,
    filterable: true,
    sortable: true,
    kind: 'source',
    section: 'ticket',
  },
  {
    id: 'cf-description',
    name: 'Ticket description',
    type: 'longText',
    required: false,
    visible: false,
    filterable: false,
    sortable: false,
    kind: 'description',
    section: 'ticket',
  },
  // ── Ticket-card meta ──
  // These two surface ticket meta on the list-view card rail. They're not
  // user-fillable so they're skipped by the Create ticket modal renderer.
  {
    id: 'cf-date',
    name: 'Date',
    type: 'date',
    required: false,
    visible: true,
    filterable: true,
    sortable: true,
    kind: 'date',
    section: 'ticket',
  },
  {
    id: 'cf-watchers',
    name: 'Watchers',
    type: 'number',
    required: false,
    visible: true,
    filterable: false,
    sortable: false,
    kind: 'watchers',
    section: 'ticket',
  },
  {
    id: 'cf-severity',
    name: 'Severity',
    type: 'dropdown',
    description: 'Drives prioritization, color coding, and SLA',
    options: ['High', 'Medium', 'Low'],
    required: true,
    visible: true,
    filterable: true,
    sortable: true,
    kind: 'severity',
    section: 'ticket',
  },
  {
    id: 'cf-sentiment',
    name: 'Sentiment',
    type: 'dropdown',
    description: 'Reviewer / customer sentiment',
    options: ['Positive', 'Neutral', 'Negative', 'Mixed'],
    required: false,
    visible: false,
    filterable: true,
    sortable: true,
    kind: 'sentiment',
    section: 'ticket',
  },
  {
    id: 'cf-rootCause',
    name: 'Root cause',
    type: 'dropdown',
    description: 'Operational/diagnostic categorization',
    options: ['Process error', 'Delivery service team', 'Customer service', 'Field-related'],
    required: false,
    visible: false,
    filterable: true,
    sortable: true,
    kind: 'rootCause',
    section: 'ticket',
  },
  {
    id: 'cf-rootCauseComment',
    name: 'Root cause comment',
    type: 'longText',
    description: 'Elaboration paired with Root cause (separate from general comments)',
    required: false,
    visible: false,
    filterable: false,
    sortable: false,
    kind: 'rootCauseComment',
    section: 'ticket',
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

  // Fields — new entries added from Settings default to the 'ticket'
  // section so they slot in alongside Severity / Sentiment / Root cause
  // in the Create ticket modal.
  const addField = useCallback((f: Omit<CustomField, 'id' | 'kind' | 'section'> & { kind?: CustomFieldKind; section?: FieldSection }) => {
    setFields(prev => [...prev, {
      ...f,
      kind: f.kind ?? 'custom',
      section: f.section ?? 'ticket',
      id: `cf-${Date.now()}`,
    }]);
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
