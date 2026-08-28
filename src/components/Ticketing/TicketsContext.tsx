import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { TicketRecord } from './TicketActivityModal';
import { ASSIGNEE_OPTIONS, type TicketDraftValues } from './CreateTicketModal';
import { useCustomFields } from './CustomFieldsContext';
import type { CustomFieldKind, SeverityLevel } from './CustomFieldsContext';

export type TicketAvatarSource =
  | 'google'
  | 'facebook'
  | 'survey'
  | 'email'
  | 'phone'
  | 'chat'
  | 'internal';

export interface Ticket {
  id: string;
  source: TicketAvatarSource;
  sourceId: string;              // FK into the configured sources list
  severity: SeverityLevel;
  sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Mixed';
  authorName: string;
  // Review-only fields; omitted on survey/email/phone/chat/internal tickets
  // so the row drops the star row + featured tag and shows the subtitle line
  // (e.g. survey name with a "view response" link) instead.
  rating?: 1 | 2 | 3 | 4 | 5;
  reviewedOn: string;
  featured?: boolean;
  subtitle?: { label: string; linkLabel?: string };
  body: string;
  dateLabel: string;
  assigned: boolean;
  watchers: number;
  assignee: string;
  location: string;
  activity: TicketRecord;
}

// Three rows match the mock; copy is sentence case and follows
// docs/COPY-GUIDELINES.md (no "Please", no em dashes, no "Successfully" prefix).
const SEED_TICKETS: Ticket[] = [
  {
    id: 't-1',
    source: 'google',
    sourceId: 'src-gmb',
    severity: 'Medium',
    sentiment: 'Positive',
    authorName: 'Prashant Kumar',
    rating: 4,
    reviewedOn: 'May 27, 2026',
    featured: true,
    body:
      "Great beach campground. You aren't supposed to camp at the beach but in the designated spots near the beach. But most people ignore it anyways. The access is pretty doable with a normal vehicle. 4WD is not needed but AWD would be good to not get stuck in some slushy areas and/or not tear up the trails.\nPit toilets in designated camp areas. Unfortunately when I went during memorial day weekend it was jam packed with over 30-40 campers on the beach.. playing loud music and doing stupid 4wd stuff. It's a shame because there was litter and TP flowers in the bushes and soon this awesome spot will be closed off unless people learn to 'Leave No Trace!'\nAnyhoo. Good camping area but leave it better than you found it.",
    dateLabel: 'May 27, 2026',
    assigned: true,
    watchers: 0,
    assignee: 'Priyanshi',
    location: 'Jennifer Smere…',
    activity: {
      id: '1676412',
      title: "Review by Prashant Kumar",
      createdOn: 'May 27, 2026',
      body:
        "Great beach campground. You aren't supposed to camp at the beach but in the designated spots near the beach. The access is doable with a normal vehicle. 4WD is not needed but AWD would help avoid getting stuck.",
      status: 'Assigned',
      assigneeName: 'Priyanshi',
      assigneeInitials: 'PR',
      watcherInitials: 'PG',
      location: 'Jennifer Smere Dental',
      channel: 'Google Reviews',
      rating: 4,
      reviewerName: 'Prashant Kumar',
      featured: true,
      activity: [
        { id: 'a1', actor: 'Prabu G', actorInitials: 'PG', actorTone: 'green', message: 'Prabu G assigned the ticket to Priyanshi', timestamp: 'May 27, 2026 09:12:08 AM' },
        { id: 'a2', actor: 'System',  actorInitials: 'SY', actorTone: 'gray',  message: 'System created the ticket and assigned to Priyanshi', timestamp: 'May 27, 2026 08:42:36 AM' },
      ],
      customValues: {
        'cf-severity': 'Medium',
        'cf-sentiment': 'Positive',
      },
    },
  },
  {
    id: 't-2',
    source: 'facebook',
    sourceId: 'src-facebook',
    severity: 'High',
    sentiment: 'Neutral',
    authorName: 'Trusted Customer',
    rating: 5,
    reviewedOn: 'May 27, 2026',
    featured: true,
    body: '',
    dateLabel: 'May 26, 2026',
    assigned: true,
    watchers: 0,
    assignee: '',
    location: 'Cut n Looks Un…',
    activity: {
      id: '1676413',
      title: 'Review by Trusted Customer',
      createdOn: 'May 26, 2026',
      body: "The user didn't write a review, and has just left a rating.",
      status: 'Assigned',
      assigneeName: 'Prabu G',
      assigneeInitials: 'PG',
      location: 'Cut n Looks Unisex Salon',
      channel: 'Facebook',
      rating: 5,
      reviewerName: 'Trusted Customer',
      featured: true,
      activity: [
        { id: 'a1', actor: 'System', actorInitials: 'SY', actorTone: 'gray', message: 'System created the ticket and assigned to Prabu G', timestamp: 'May 26, 2026 11:04:21 AM' },
      ],
      customValues: {
        'cf-severity': 'High',
        'cf-sentiment': 'Neutral',
      },
    },
  },
  {
    id: 't-3',
    source: 'facebook',
    sourceId: 'src-facebook',
    severity: 'Low',
    sentiment: 'Positive',
    authorName: 'Angela Whitworth',
    rating: 5,
    reviewedOn: 'May 27, 2026',
    featured: true,
    body: 'Excellent as usual',
    dateLabel: 'May 26, 2026',
    assigned: true,
    watchers: 0,
    assignee: '',
    location: 'Cut n Looks Un…',
    activity: {
      id: '1676414',
      title: 'Review by Angela Whitworth',
      createdOn: 'May 26, 2026',
      body: 'Excellent as usual.',
      status: 'Assigned',
      assigneeName: 'Prabu G',
      assigneeInitials: 'PG',
      location: 'Cut n Looks Unisex Salon',
      channel: 'Facebook',
      rating: 5,
      reviewerName: 'Angela Whitworth',
      featured: true,
      activity: [
        { id: 'a1', actor: 'System', actorInitials: 'SY', actorTone: 'gray', message: 'System created the ticket and assigned to Prabu G', timestamp: 'May 26, 2026 09:31:00 AM' },
      ],
      customValues: {
        'cf-severity': 'Low',
        'cf-sentiment': 'Positive',
      },
    },
  },
  {
    id: 't-4',
    source: 'survey',
    sourceId: 'src-nps',
    severity: 'Medium',
    sentiment: 'Positive',
    authorName: 'Anonymous',
    reviewedOn: 'May 25, 2026',
    subtitle: { label: 'Standard survey', linkLabel: 'view response' },
    body:
      'Question: Which location did you visit?\nAnswer: AmeriGas — Austin South\nQuestion: We would appreciate if you can review us on these sites.\nAnswer: Our Website',
    dateLabel: 'May 25, 2026',
    assigned: true,
    watchers: 0,
    assignee: 'Raghav L.',
    location: '78704',
    activity: {
      id: '1676415',
      title: 'Survey response — Standard survey',
      createdOn: 'May 25, 2026',
      body:
        'Question: Which location did you visit?\nAnswer: AmeriGas — Austin South\n\nQuestion: We would appreciate if you can review us on these sites.\nAnswer: Our Website',
      status: 'Assigned',
      assigneeName: 'Raghav L.',
      assigneeInitials: 'RL',
      location: '78704 — Austin South',
      channel: 'NPS survey',
      activity: [
        { id: 'a1', actor: 'System', actorInitials: 'SY', actorTone: 'gray', message: 'System created the ticket from survey response', timestamp: 'May 25, 2026 03:18:42 PM' },
      ],
      customValues: {
        'cf-severity': 'Medium',
        'cf-sentiment': 'Positive',
      },
    },
  },
  {
    id: 't-5',
    source: 'email',
    sourceId: 'src-social-in',
    severity: 'High',
    sentiment: 'Negative',
    authorName: 'Marcus Bell',
    reviewedOn: 'May 24, 2026',
    body:
      "Hi team, I scheduled a delivery for Friday morning but the driver never showed up. I tried calling the local office twice and was sent to voicemail. Can someone confirm when the tank will be filled? We're heading into the weekend.",
    dateLabel: 'May 24, 2026',
    assigned: true,
    watchers: 1,
    assignee: 'Sahil Gupta',
    location: 'Round Rock',
    activity: {
      id: '1676416',
      title: 'Email from Marcus Bell',
      createdOn: 'May 24, 2026',
      body:
        "Hi team, I scheduled a delivery for Friday morning but the driver never showed up. I tried calling the local office twice and was sent to voicemail. Can someone confirm when the tank will be filled?",
      status: 'Assigned',
      assigneeName: 'Sahil Gupta',
      assigneeInitials: 'SG',
      location: 'Round Rock branch',
      channel: 'Social inbox',
      activity: [
        { id: 'a1', actor: 'System', actorInitials: 'SY', actorTone: 'gray', message: 'System created the ticket from inbound email', timestamp: 'May 24, 2026 10:02:11 AM' },
      ],
      customValues: {
        'cf-severity': 'High',
        'cf-sentiment': 'Negative',
      },
    },
  },
  {
    id: 't-6',
    source: 'phone',
    sourceId: 'src-exec',
    severity: 'High',
    sentiment: 'Negative',
    authorName: 'Diane Alvarez',
    reviewedOn: 'May 23, 2026',
    body:
      'Inbound call — customer reported a leak around the regulator. Dispatched a service tech for same-day visit and confirmed the appointment window over the phone.',
    dateLabel: 'May 23, 2026',
    assigned: true,
    watchers: 0,
    assignee: 'Abhinav R.',
    location: 'Dallas',
    activity: {
      id: '1676417',
      title: 'Phone call with Diane Alvarez',
      createdOn: 'May 23, 2026',
      body:
        'Inbound call — customer reported a leak around the regulator. Service tech dispatched for a same-day visit; appointment window confirmed.',
      status: 'Assigned',
      assigneeName: 'Abhinav R.',
      assigneeInitials: 'AR',
      location: 'Dallas branch',
      channel: 'Phone',
      activity: [
        { id: 'a1', actor: 'Abhinav R.', actorInitials: 'AR', actorTone: 'blue', message: 'Abhinav R. logged the inbound call and dispatched a tech', timestamp: 'May 23, 2026 11:47:30 AM' },
      ],
      customValues: {
        'cf-severity': 'High',
        'cf-sentiment': 'Negative',
      },
    },
  },
  {
    id: 't-7',
    source: 'chat',
    sourceId: 'src-social-in',
    severity: 'Low',
    sentiment: 'Neutral',
    authorName: 'Jordan Park',
    reviewedOn: 'May 23, 2026',
    body:
      "Web chat — customer asked whether autopay covers the next refill or if they need to schedule manually. Walked them through the billing portal and confirmed the next delivery date.",
    dateLabel: 'May 23, 2026',
    assigned: false,
    watchers: 0,
    assignee: '',
    location: 'Austin',
    activity: {
      id: '1676418',
      title: 'Web chat with Jordan Park',
      createdOn: 'May 23, 2026',
      body:
        'Web chat — customer asked whether autopay covers the next refill. Walked through the billing portal and confirmed the next delivery date.',
      status: 'Open',
      assigneeName: '',
      assigneeInitials: '',
      location: 'Austin branch',
      channel: 'Web chat',
      activity: [
        { id: 'a1', actor: 'System', actorInitials: 'SY', actorTone: 'gray', message: 'System created the ticket from chat session', timestamp: 'May 23, 2026 09:08:00 AM' },
      ],
      customValues: {
        'cf-severity': 'Low',
        'cf-sentiment': 'Neutral',
      },
    },
  },
  {
    id: 't-8',
    source: 'internal',
    sourceId: 'src-exec',
    severity: 'Medium',
    sentiment: 'Neutral',
    authorName: 'Prabu G',
    reviewedOn: 'May 22, 2026',
    body:
      'Internal note — flagged by ops for executive review. The Austin South branch had three back-to-back missed deliveries this week; route manager already looped in.',
    dateLabel: 'May 22, 2026',
    assigned: true,
    watchers: 2,
    assignee: 'Priyanshi',
    location: 'Austin South',
    activity: {
      id: '1676419',
      title: 'Executive escalation — Austin South missed deliveries',
      createdOn: 'May 22, 2026',
      body:
        'Internal note flagged by ops for executive review. The Austin South branch had three back-to-back missed deliveries this week; route manager looped in.',
      status: 'Assigned',
      assigneeName: 'Priyanshi',
      assigneeInitials: 'PR',
      location: 'Austin South branch',
      channel: 'Executive escalation',
      activity: [
        { id: 'a1', actor: 'Prabu G', actorInitials: 'PG', actorTone: 'green', message: 'Prabu G opened the internal ticket for executive review', timestamp: 'May 22, 2026 02:15:55 PM' },
      ],
      customValues: {
        'cf-severity': 'Medium',
        'cf-sentiment': 'Neutral',
      },
    },
  },
];

const initialsOf = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

interface TicketsContextValue {
  tickets: Ticket[];
  addTicket: (values: TicketDraftValues) => void;
}

const TicketsContext = createContext<TicketsContextValue | null>(null);

export const TicketsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { fields } = useCustomFields();
  const [tickets, setTickets] = useState<Ticket[]>(SEED_TICKETS);

  // Builds a full Ticket + TicketRecord from the values an admin filled in
  // on the Create ticket modal, and prepends it to the list. Field ids are
  // resolved by `kind` (not hardcoded) so this keeps working if Settings
  // ever changes the seeded field ids. Shared by every "Create ticket"
  // entry point (landing page + L2 nav) so all of them land in the same list.
  const addTicket = useCallback((values: TicketDraftValues) => {
    const idFor = (kind: CustomFieldKind) => fields.find(f => f.kind === kind)?.id;
    const stringValue = (kind: CustomFieldKind): string => {
      const id = idFor(kind);
      const v = id ? values[id] : undefined;
      return typeof v === 'string' ? v : '';
    };

    const severity = (stringValue('severity') || 'Medium') as SeverityLevel;
    const sentiment = (stringValue('sentiment') || 'Neutral') as Ticket['sentiment'];
    const location = stringValue('location');
    const body = stringValue('description');
    const assigneeId = stringValue('assignTo');
    const assignee = ASSIGNEE_OPTIONS.find(o => o.value === assigneeId)?.label ?? '';

    const now = new Date();
    const dateLabel = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeLabel = now.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true,
    });
    const id = `t-${Date.now()}`;

    const newTicket: Ticket = {
      id,
      source: 'internal',
      sourceId: 'src-exec',
      severity,
      sentiment,
      authorName: 'Prabu G',
      reviewedOn: dateLabel,
      body,
      dateLabel,
      assigned: Boolean(assignee),
      watchers: 0,
      assignee,
      location,
      activity: {
        id,
        title: 'New ticket',
        createdOn: dateLabel,
        body,
        status: assignee ? 'Assigned' : 'Open',
        assigneeName: assignee,
        assigneeInitials: initialsOf(assignee),
        location,
        channel: 'Internal',
        activity: [
          {
            id: 'a1',
            actor: 'Prabu G',
            actorInitials: 'PG',
            actorTone: 'green',
            message: assignee
              ? `Prabu G created the ticket and assigned to ${assignee}`
              : 'Prabu G created the ticket',
            timestamp: timeLabel,
          },
        ],
        customValues: values,
      },
    };

    setTickets(prev => [newTicket, ...prev]);
  }, [fields]);

  const value = useMemo<TicketsContextValue>(() => ({ tickets, addTicket }), [tickets, addTicket]);

  return <TicketsContext.Provider value={value}>{children}</TicketsContext.Provider>;
};

export const useTickets = (): TicketsContextValue => {
  const ctx = useContext(TicketsContext);
  if (!ctx) throw new Error('useTickets must be used within TicketsProvider');
  return ctx;
};
