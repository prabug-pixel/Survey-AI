// ============================================================
// Shared filter field definitions used by both the quick filter
// side drawer and the full "Filter by" modal — keeps one source
// of truth so the two surfaces never drift.
// ============================================================

export interface FilterFieldDef {
  /** Stable key used as the state map key. */
  key: string;
  /** Display label shown in the dropdown placeholder. */
  label: string;
  /** Static option set (mock — backend wires real data later). */
  options: { value: string; label: string }[];
}

// Reusable option packs for the mock — values are illustrative.
const STATE_OPTIONS = ['California', 'Texas', 'New York', 'Florida', 'Illinois']
  .map(v => ({ value: v, label: v }));

const PERSON_OPTIONS = ['Abhinav R.', 'Priyanshi', 'Sahil Gupta', 'Prabu G']
  .map(v => ({ value: v, label: v }));

const BRAND_OPTIONS = ['AmeriGas', 'Acme Co.', 'Globex']
  .map(v => ({ value: v, label: v }));

const TEAM_OPTIONS = ['Social media team', 'GMB team', 'Executive resolution team']
  .map(v => ({ value: v, label: v }));

const STATUS_OPTIONS = [
  { value: 'open',         label: 'Open' },
  { value: 'assigned',     label: 'Assigned' },
  { value: 'in_progress',  label: 'In progress' },
  { value: 'closed',       label: 'Closed' },
];

const TIME_PERIOD_OPTIONS = [
  { value: 'today',     label: 'Today' },
  { value: 'last7',     label: 'Last 7 days' },
  { value: 'last30',    label: 'Last 30 days' },
  { value: 'thisQuarter', label: 'This quarter' },
  { value: 'custom',    label: 'Custom range' },
];

// Channel grouping presented in the filter UI. Each option maps to one
// or more avatar source values on the ticket row (see CHANNEL_SOURCE_MAP
// in TicketingLanding).
export const CHANNEL_OPTIONS = [
  { value: 'social',   label: 'Social' },
  { value: 'reviews',  label: 'Reviews' },
  { value: 'survey',   label: 'Survey' },
  { value: 'email',    label: 'Email' },
  { value: 'phone',    label: 'Phone' },
  { value: 'chat',     label: 'Chat' },
  { value: 'internal', label: 'Internal' },
];

const WATCH_STATUS_OPTIONS = [
  { value: 'watching',   label: 'Watching' },
  { value: 'unwatching', label: 'Not watching' },
];

const NUMBER_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1).padStart(4, '0'),
}));

// ── Location-axis filters (top section of the modal, full list
// of the drawer). Ordered to match the Figma row-by-row reading.
export const LOCATION_FILTERS: FilterFieldDef[] = [
  { key: 'state',           label: 'State',            options: STATE_OPTIONS },
  { key: 'divisionManager', label: 'Division manager', options: PERSON_OPTIONS },
  { key: 'regionalManager', label: 'Regional manager', options: PERSON_OPTIONS },
  { key: 'brand',           label: 'Brand',            options: BRAND_OPTIONS },
  { key: 'brandManager',    label: 'Brand manager',    options: PERSON_OPTIONS },
  { key: 'marketingTeam',   label: 'Marketing team',   options: TEAM_OPTIONS },
  { key: 'branchNumber',    label: 'Branch number',    options: NUMBER_OPTIONS },
  { key: 'branchManager',   label: 'Branch manager',   options: PERSON_OPTIONS },
  { key: 'loStatus',        label: 'Lo status',        options: STATUS_OPTIONS },
  { key: 'campaignTemplate', label: 'Campaign template', options: [
      { value: 'review',    label: 'Review request' },
      { value: 'survey',    label: 'NPS survey' },
      { value: 'followup',  label: 'Closed-loop follow-up' },
  ]},
  { key: 'city',            label: 'City',             options: [
      'Atlanta', 'Chicago', 'Las Vegas', 'Los Angeles', 'New York City', 'Stamford', 'San Diego',
    ].map(v => ({ value: v, label: v }))
  },
  { key: 'expertise',       label: 'Expertise',        options: [
      { value: 'residential', label: 'Residential' },
      { value: 'commercial',  label: 'Commercial' },
      { value: 'industrial',  label: 'Industrial' },
  ]},
  { key: 'location',        label: 'Location',         options: [
      { value: 'cut-n-looks', label: 'Cut n Looks Unisex Salon' },
      { value: 'jennifer-smere', label: 'Jennifer Smere Dental' },
  ]},
];

// ── Ticket-axis filters (bottom section of the modal only —
// not shown in the side drawer per the Figma).
export const TICKET_FILTERS: FilterFieldDef[] = [
  { key: 'timePeriod',    label: 'Time period',    options: TIME_PERIOD_OPTIONS },
  { key: 'assignedTo',    label: 'Assigned to',    options: PERSON_OPTIONS },
  { key: 'channels',      label: 'Channels',       options: CHANNEL_OPTIONS },
  { key: 'status',        label: 'Status',         options: STATUS_OPTIONS },
  { key: 'watchingStatus', label: 'Watching status', options: WATCH_STATUS_OPTIONS },
];

export type FilterValues = Record<string, string>;
