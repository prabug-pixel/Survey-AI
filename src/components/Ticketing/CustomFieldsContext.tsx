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

  // Table column order — ordered list of field IDs; controls display order in
  // the field manager table, ticket list rail, and activity modal side rail.
  tableColumnOrder: string[];
  defaultTableColumnOrder: string[];
  reorderTableColumns: (ids: string[]) => void;
  resetTableColumnOrder: () => void;

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
    description: '10-digit phone number',
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
    options: [
      'ACE - Defective - Defective',
      'ACE - Inquiry - Inquiry',
      'Billing/Invoice - Discount Not Provided - Account Info Not Correct',
      'Billing/Invoice - Discount Not Provided - Failure to Set Correct Expectations',
      'Billing/Invoice - Discount Not Provided - Process/Procedural Failure',
      'Billing/Invoice - Fees/Rent - Account Info Not Correct',
      'Billing/Invoice - Fees/Rent - Failure to Set Correct Expectations',
      'Billing/Invoice - Fees/Rent - Final Bill Not Completed',
      'Billing/Invoice - Fees/Rent - Incorrect Billing/Charges',
      'Billing/Invoice - Fees/Rent - Process/Procedural Failure',
      'Billing/Invoice - Fees/Rent - Unrealistic Customer Expectations',
      'Billing/Invoice - LIHEAP - Failure to Set Correct Expectations',
      'Billing/Invoice - LIHEAP - Process/Procedural Failure',
      'Billing/Invoice - Refund Not Issued - Account Info Not Correct',
      'Billing/Invoice - Refund Not Issued - Credit/Dispute Not Approved',
      'Billing/Invoice - Refund Not Issued - Credit/Dispute Not Completed',
      'Billing/Invoice - Refund Not Issued - Failure to Set Correct Expectations',
      'Billing/Invoice - Refund Not Issued - Final Bill Not Completed',
      'Billing/Invoice - Refund Not Issued - Process/Procedural Failure',
      'Billing/Invoice - Unexpected Charge - Account Info Not Correct',
      'Billing/Invoice - Unexpected Charge - Credit/Dispute Not Approved',
      'Billing/Invoice - Unexpected Charge - Credit/Dispute Not Completed',
      'Billing/Invoice - Unexpected Charge - Delivery Method Not Changed',
      'Billing/Invoice - Unexpected Charge - Failure to Set Correct Expectations',
      'Billing/Invoice - Unexpected Charge - Incorrect Billing/Charges',
      'Billing/Invoice - Unexpected Charge - Process/Procedural Failure',
      'Billing/Invoice - Unexpected Charge - Unrealistic Customer Expectations',
      'Complaint- Call Center - Failure to Set Correct Expectations',
      'Complaint- Call Center - No Callback',
      'Delivery - Complaint: Personnel - Process/Procedural Failure',
      'Delivery - Complaint: Property Damage - Process/Procedural Failure',
      'Delivery - Missed Delivery - Account Info Not Correct',
      'Delivery - Missed Delivery - Communication - Call/Text/Email',
      'Delivery - Missed Delivery - Delivered Wrong Tank',
      'Delivery - Missed Delivery - Delivery Method Not Changed',
      'Delivery - Missed Delivery - Incorrect Reason for Rejection',
      'Delivery - Missed Delivery - Missed Delivery',
      'Delivery - Scheduled Date - Blocks Not Removed',
      'Delivery - Scheduled Date - Delivery Date / Time Frame Not Met',
      'Delivery - Scheduled Date - Failure to Set Correct Expectations',
      'Delivery - Scheduled Date - Process/Procedural Failure',
      'Delivery - Scheduled Date - Unrealistic Customer Expectations',
      'Delivery - Unexpected Charge - Delivered Wrong Tank',
      'Delivery - Unexpected Charge - Incorrect Gallons Delivered',
      'No Comment Provided - N/A - No comment added',
      'Non Customer - Complaint - Complaint',
      'Non Customer - Inquiry - Inquiry',
      'Online Issue - Online Account - Blocks Not Removed',
      'Online Issue - Online Account - Failure to Set Correct Expectations',
      'Online Issue - Online Account - Unrealistic Customer Expectations',
      'Positive Comment - N/A - Positive Response',
      'Pricing - Market Rate - Failure to Set Correct Expectations',
      'Pricing/Contract - Community Code - Failure to Set Correct Expectations',
      'Pricing/Contract - Community Code - Process/Procedural Failure',
      'Pricing/Contract - Community Code - Unrealistic Customer Expectations',
      'Pricing/Contract - Competitive Pricing - Unable to Meet Expectations',
      'Pricing/Contract - Competitive Pricing - Unrealistic Customer Expectations',
      'Pricing/Contract - Convenience Pay - Failure to Set Correct Expectations',
      'Pricing/Contract - Convenience Pay - Process/Procedural Failure',
      'Pricing/Contract - GPP - Failure to Set Correct Expectations',
      'Pricing/Contract - GPP - Process/Procedural Failure',
      'Service - Complaint: Personnel - Process/Procedural Failure',
      'Service - Complaint: Property Damage - Process/Procedural Failure',
      'Service - Leak - Communication: Call/Text/Email',
      'Service - Leak - Process/Procedural Failure',
      'Service - Missed Service - Account Info Not Correct',
      'Service - Missed Service - Communication: Call/Text/Email',
      'Service - Missed Service - Failure to Set Correct Expectations',
      'Service - Missed Service - Final Bill Not Completed',
      'Service - Missed Service - Missed Service',
      'Service - Scheduled Date - Failure to Set Correct Expectations',
      'Service - Scheduled Date - Process/Procedural Failure',
      'Service - Scheduled Date - Unrealistic Customer Expectations',
    ],
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

  // ── AmeriGas case-management fields ──
  // Seeded from the case-intake spec. Each entry mirrors the spec's
  // Description / Input Type / Allowed Values columns so admins can edit
  // them in Settings without re-creating the schema by hand.
  {
    id: 'cf-customerName',
    name: 'Customer Name',
    type: 'text',
    description: 'Full name of the customer submitting the complaint or inquiry. Enter first and last name.',
    required: false,
    visible: false,
    filterable: true,
    sortable: true,
    kind: 'custom',
    section: 'customer',
  },
  {
    id: 'cf-accountNumber',
    name: 'Account Number',
    type: 'text',
    description: "Customer's alphanumeric account ID in the system.",
    required: false,
    visible: false,
    filterable: true,
    sortable: true,
    kind: 'custom',
    section: 'customer',
  },
  {
    id: 'cf-customerType',
    name: 'Customer Type',
    type: 'dropdown',
    description: 'What category type is our customer?',
    options: ['Residential', 'Commercial', 'ACE', 'Non-Customer', 'National Account'],
    required: false,
    visible: false,
    filterable: true,
    sortable: true,
    kind: 'custom',
    section: 'customer',
  },
  {
    id: 'cf-teamMember',
    name: 'Team Member',
    type: 'text',
    description: 'Name of the internal team member handling or owning the case.',
    required: false,
    visible: false,
    filterable: true,
    sortable: true,
    kind: 'custom',
    section: 'ticket',
  },
  {
    id: 'cf-division',
    name: 'Division',
    type: 'text',
    description: "Company division associated with the customer's account.",
    required: false,
    visible: false,
    filterable: true,
    sortable: true,
    kind: 'custom',
    section: 'ticket',
  },
  {
    id: 'cf-region',
    name: 'Region',
    type: 'text',
    description: 'Geographic region the customer and/or team member falls under.',
    required: false,
    visible: false,
    filterable: true,
    sortable: true,
    kind: 'custom',
    section: 'ticket',
  },
  {
    id: 'cf-territory',
    name: 'Territory',
    type: 'text',
    description: 'Specific territory within the region for the account.',
    required: false,
    visible: false,
    filterable: true,
    sortable: true,
    kind: 'custom',
    section: 'ticket',
  },
  {
    id: 'cf-areas',
    name: 'Area/s',
    type: 'text',
    description: 'Sub-area or service area associated with the case.',
    required: false,
    visible: false,
    filterable: true,
    sortable: true,
    kind: 'custom',
    section: 'ticket',
  },
  {
    id: 'cf-geoAreas',
    name: 'Geo Areas',
    type: 'text',
    description: 'Broader geographic classification for reporting purposes.',
    required: false,
    visible: false,
    filterable: true,
    sortable: true,
    kind: 'custom',
    section: 'ticket',
  },
  {
    id: 'cf-escalationType',
    name: 'Escalation Type',
    type: 'dropdown',
    description: 'Channel or method by which the escalation was received.',
    options: [
      'Leadership',
      'Legal',
      'Letters',
      'BBB',
      'AG',
      'Other',
      'GMB',
      'Social',
      'NPS Passives',
      'NPS Detractors',
    ],
    required: false,
    visible: false,
    filterable: true,
    sortable: true,
    kind: 'custom',
    section: 'ticket',
  },
  {
    id: 'cf-followUp',
    name: 'Follow Up',
    type: 'dropdown',
    description: "Who we're waiting on and/or status of escalation.",
    options: ['Future Date', 'Resolved', 'Waiting On'],
    required: false,
    visible: false,
    filterable: true,
    sortable: true,
    kind: 'custom',
    section: 'ticket',
  },
  {
    id: 'cf-bbbId',
    name: 'BBB ID#',
    type: 'text',
    description: 'ID number provided by the Better Business Bureau for tracking purposes. BBB-assigned case/reference number.',
    required: false,
    visible: false,
    filterable: true,
    sortable: true,
    kind: 'custom',
    section: 'ticket',
  },
  {
    id: 'cf-dueDate',
    name: 'Due Date',
    type: 'date',
    description: 'Due date set for responses, particularly for BBB/AG cases.',
    required: false,
    visible: false,
    filterable: true,
    sortable: true,
    kind: 'custom',
    section: 'ticket',
  },
  {
    id: 'cf-respondToBbbAg',
    name: 'Respond to BBB/AG',
    type: 'dropdown',
    description: 'Current response status for BBB or Attorney General cases.',
    options: ['Pending', 'Responded to BBB', 'Responded to AG'],
    required: false,
    visible: false,
    filterable: true,
    sortable: true,
    kind: 'custom',
    section: 'ticket',
  },
  {
    id: 'cf-summaryNotes',
    name: 'Summary Notes',
    type: 'longText',
    description: "Narrative field — What / Why / When / Steps Taken / Resolution. All pertinent information surrounding the customer's escalation.",
    required: false,
    visible: false,
    filterable: false,
    sortable: false,
    kind: 'custom',
    section: 'ticket',
  },
  {
    id: 'cf-resoType',
    name: 'Reso Type',
    type: 'dropdown',
    description: 'What action was taken to provide resolution to the customer?',
    options: [
      'Account Update',
      'CS Complaint Addressed',
      'Delivered',
      'Discontinuation of Service',
      'Education Only',
      'Financial Only',
      'Scheduled',
      'Service Work',
      'Tank Pickup Only',
    ],
    required: false,
    visible: false,
    filterable: true,
    sortable: true,
    kind: 'custom',
    section: 'ticket',
  },
  {
    id: 'cf-resoDate',
    name: 'Reso Date',
    type: 'date',
    description: 'The date the resolution was provided to the customer.',
    required: false,
    visible: false,
    filterable: true,
    sortable: true,
    kind: 'custom',
    section: 'ticket',
  },
  {
    id: 'cf-caseLink',
    name: 'Case Link',
    type: 'text',
    description: 'Paste full URL or case link from the CRM or case management system.',
    required: false,
    visible: false,
    filterable: false,
    sortable: false,
    kind: 'custom',
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

const DEFAULT_COLUMN_ORDER = SEED_FIELDS.map(f => f.id);
const COLUMN_ORDER_STORAGE_KEY = 'ticketing-column-order';

const loadStoredColumnOrder = (): string[] => {
  try {
    const stored = localStorage.getItem(COLUMN_ORDER_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as string[];
      // Ensure any newly-added fields are appended at the end
      const extra = DEFAULT_COLUMN_ORDER.filter(id => !parsed.includes(id));
      return [...parsed, ...extra];
    }
  } catch {}
  return DEFAULT_COLUMN_ORDER;
};

export const CustomFieldsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fields, setFields] = useState<CustomField[]>(SEED_FIELDS);
  const [sources, setSources] = useState<TicketSource[]>(SEED_SOURCES);
  const [assignmentRules, setAssignmentRules] = useState<AssignmentRule[]>(SEED_ASSIGNMENT);
  const [slaRules, setSlaRules] = useState<SlaRule[]>(SEED_SLA);
  const [tableColumnOrder, setTableColumnOrder] = useState<string[]>(loadStoredColumnOrder);

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

  // Table column order
  const reorderTableColumns = useCallback((ids: string[]) => {
    setTableColumnOrder(ids);
    try { localStorage.setItem(COLUMN_ORDER_STORAGE_KEY, JSON.stringify(ids)); } catch {}
  }, []);
  const resetTableColumnOrder = useCallback(() => {
    setTableColumnOrder(DEFAULT_COLUMN_ORDER);
    try { localStorage.removeItem(COLUMN_ORDER_STORAGE_KEY); } catch {}
  }, []);

  const value = useMemo<CustomFieldsContextValue>(
    () => ({
      fields, addField, updateField, removeField,
      tableColumnOrder, defaultTableColumnOrder: DEFAULT_COLUMN_ORDER, reorderTableColumns, resetTableColumnOrder,
      sources, addSource, updateSource, removeSource,
      assignmentRules, addAssignmentRule, updateAssignmentRule, removeAssignmentRule,
      slaRules, addSlaRule, updateSlaRule, removeSlaRule,
    }),
    [
      fields, addField, updateField, removeField,
      tableColumnOrder, reorderTableColumns, resetTableColumnOrder,
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
