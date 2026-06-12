import React, { useMemo, useState } from 'react';
import {
  IconStarFilled,
  IconCalendar,
  IconChat,
  IconMoreVert,
  IconChevronDown,
  IconSearch,
  IconFilter,
  IconLocation,
  IconUsers,
  IconEye,
  IconCheck,
  IconMail,
  IconPhone,
  IconInfo,
  IconViewWeek,
} from '../../shared/Icons/Icons';
import TicketActivityModal, { type TicketRecord } from './TicketActivityModal';
import TicketFiltersDrawer from './TicketFiltersDrawer';
import TableCustomizerDrawer from './TableCustomizerDrawer';
import TicketFiltersModal from './TicketFiltersModal';
import CreateTicketModal from './CreateTicketModal';
import { type FilterValues } from './TicketFilters';
import { SEVERITY_COLORS, useCustomFields } from './CustomFieldsContext';
import type { CustomField, SeverityLevel } from './CustomFieldsContext';
import styles from './TicketingLanding.module.scss';

type TicketAvatarSource =
  | 'google'
  | 'facebook'
  | 'survey'
  | 'email'
  | 'phone'
  | 'chat'
  | 'internal';

interface Ticket {
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
const TICKETS: Ticket[] = [
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

const AvatarGlyph: React.FC<{ source: TicketAvatarSource }> = ({ source }) => {
  switch (source) {
    case 'google':   return <>G</>;
    case 'facebook': return <>F</>;
    case 'survey':   return <IconCheck size={18} color="#fff" />;
    case 'email':    return <IconMail size={18} color="#fff" />;
    case 'phone':    return <IconPhone size={18} color="#fff" />;
    case 'chat':     return <IconChat size={18} color="#fff" />;
    case 'internal': return <IconInfo size={18} color="#fff" />;
  }
};

const StarRow: React.FC<{ count: 1 | 2 | 3 | 4 | 5 }> = ({ count }) => (
  <div className={styles.starRow} aria-label={`${count} of 5 stars`}>
    {[1, 2, 3, 4, 5].map(i => (
      <IconStarFilled key={i} size={14} color={i <= count ? '#fbc02d' : '#e0e0e0'} />
    ))}
  </div>
);

// Maps a configured custom field to the inline content rendered on the
// ticket card's right rail. Fields with no corresponding value on the
// ticket return null and the row is skipped.
const renderRailContent = (field: CustomField, ticket: Ticket): React.ReactNode => {
  switch (field.kind) {
    case 'severity':
      return (
        <>
          <span
            className={styles.severityDot}
            style={{ background: SEVERITY_COLORS[ticket.severity].dot }}
            aria-hidden
          />
          <span>{ticket.severity} severity</span>
        </>
      );
    case 'date':
      return (
        <>
          <IconCalendar size={14} color="#9e9e9e" />
          <span>{ticket.dateLabel}</span>
        </>
      );
    case 'status':
      return (
        <>
          <span
            className={`${styles.statusDot} ${ticket.assigned ? styles.statusAssigned : ''}`}
            aria-hidden
          />
          <span>{ticket.assigned ? 'Assigned' : 'Unassigned'}</span>
        </>
      );
    case 'watchers':
      return (
        <>
          <IconEye size={14} color="#9e9e9e" />
          <span>{ticket.watchers} Watchers</span>
        </>
      );
    case 'assignTo':
      return ticket.assignee ? (
        <>
          <IconUsers size={14} color="#9e9e9e" />
          <span>{ticket.assignee}</span>
        </>
      ) : null;
    case 'location':
      return ticket.location ? (
        <>
          <IconLocation size={14} color="#9e9e9e" />
          <span className={styles.sideLocation}>{ticket.location}</span>
        </>
      ) : null;
    case 'sentiment':
      return <span>{ticket.sentiment}</span>;
    default:
      return null;
  }
};

// Severity leads with its colored badge; the rest follow the visual
// priority the design calls out. Anything not listed sorts to the end.
const RAIL_KIND_ORDER: CustomField['kind'][] = [
  'severity', 'date', 'status', 'watchers', 'assignTo', 'location',
  'sentiment',
];
const sortByRailOrder = (a: CustomField, b: CustomField): number => {
  const ai = RAIL_KIND_ORDER.indexOf(a.kind);
  const bi = RAIL_KIND_ORDER.indexOf(b.kind);
  return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
};

const TicketingLanding: React.FC = () => {
  const { fields, tableColumnOrder } = useCustomFields();
  const [recentOpen, setRecentOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState<TicketRecord | null>(null);

  // Drives the right rail on each ticket card. Respects the user's saved
  // column order from the table customizer, falling back to the design's
  // semantic priority order within the ordered set.
  const visibleRailFields = useMemo(() => {
    const fieldById = new Map(fields.map(f => [f.id, f]));
    const ordered = tableColumnOrder
      .map(id => fieldById.get(id))
      .filter((f): f is CustomField => Boolean(f) && f.visible);
    // Append any visible fields not covered by the saved order.
    const inOrder = new Set(tableColumnOrder);
    fields.forEach(f => { if (!inOrder.has(f.id) && f.visible) ordered.push(f); });
    return ordered;
  }, [fields, tableColumnOrder]);

  // Inline filter panel + the full "See all filters" popup.
  // The panel surfaces the location-axis fields; the modal adds
  // the ticket-axis fields on top of those.
  const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [filtersModalOpen, setFiltersModalOpen] = useState(false);
  const [createTicketOpen, setCreateTicketOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const handleFilterChange = (key: string, value: string) =>
    setFilterValues(prev => ({ ...prev, [key]: value }));

  return (
    <div className={styles.page}>
      {/* Main column — flex sibling of the inline filter panel so
         opening the panel pushes this column to the left rather than
         covering it with an overlay. */}
      <div className={styles.mainColumn}>
        {/* ── Page header ─────────────────────────────────────── */}
        <div className={styles.pageHeader}>
          <div className={styles.titleGroup}>
            <h1 className={styles.title}>{TICKETS.length.toLocaleString()} tickets</h1>
          </div>

          <div className={styles.headerActions}>
            <button className={styles.iconBtn} aria-label="Search tickets">
              <IconSearch size={20} color="#555" />
            </button>

            <div className={styles.recentDropdown}>
              <button
                className={styles.recentTrigger}
                onClick={() => setRecentOpen(o => !o)}
                aria-expanded={recentOpen}
              >
                <span>Recent tickets</span>
                <IconChevronDown size={16} color="#555" />
              </button>
            </div>

            <button
              type="button"
              className={styles.createBtn}
              onClick={() => setCreateTicketOpen(true)}
            >
              Create ticket
            </button>

            <button className={styles.iconBtn} aria-label="More actions">
              <IconMoreVert size={20} color="#555" />
            </button>

            <button
              type="button"
              className={`${styles.iconBtn} ${styles.filterBtn}`}
              aria-label="Filters"
              aria-pressed={filtersDrawerOpen}
              onClick={() => setFiltersDrawerOpen(o => !o)}
            >
              <IconFilter size={20} color="#1976d2" />
              <span className={styles.filterBadge}>1</span>
            </button>

            <button
              type="button"
              className={`${styles.iconBtn} ${customizerOpen ? styles.iconBtnActive : ''}`}
              aria-label="Customize table"
              aria-pressed={customizerOpen}
              onClick={() => setCustomizerOpen(o => !o)}
            >
              <IconViewWeek size={20} color={customizerOpen ? '#1976d2' : '#555'} />
            </button>
          </div>
        </div>

        {/* Activity modal — opened from the View activity button on each row.
           Layout uses a right-side rail so N additional fields can slot in
           (Status, Assignee, Watchers, Location, Channel, Due date, etc.)
           without crowding the top of the popup. */}
        <TicketActivityModal
          isOpen={activeTicket !== null}
          ticket={activeTicket}
          onClose={() => setActiveTicket(null)}
        />

        <TicketFiltersModal
          isOpen={filtersModalOpen}
          values={filterValues}
          onChange={handleFilterChange}
          onClose={() => setFiltersModalOpen(false)}
          onApply={() => setFiltersModalOpen(false)}
        />

        <CreateTicketModal
          isOpen={createTicketOpen}
          onClose={() => setCreateTicketOpen(false)}
          onSave={() => setCreateTicketOpen(false)}
        />

        {/* ── Ticket list ─────────────────────────────────────── */}
        <div className={styles.listWrapper}>
          <div className={styles.list}>
          {TICKETS.map(ticket => (
            <article key={ticket.id} className={styles.ticketRow}>
              <div className={styles.ticketLeft}>
                <div className={`${styles.avatar} ${styles[`source-${ticket.source}`]}`}>
                  <AvatarGlyph source={ticket.source} />
                </div>
              </div>

              <div className={styles.ticketBody}>
                <div className={styles.ticketHeaderLine}>
                  <div className={styles.ticketMetaLine}>
                    <span className={styles.authorName}>{ticket.authorName}</span>
                    <span className={styles.metaDot}>•</span>
                    <span className={styles.reviewDate}>{ticket.reviewedOn}</span>
                    {ticket.featured && <span className={styles.featuredTag}>Featured</span>}
                  </div>
                  <div className={styles.ticketSide}>
                    {visibleRailFields.map(field => {
                      const content = renderRailContent(field, ticket);
                      if (!content) return null;
                      return (
                        <div key={field.id} className={styles.sideRow}>
                          {content}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {ticket.rating !== undefined && (
                  <div className={styles.ticketTopLine}>
                    <StarRow count={ticket.rating} />
                  </div>
                )}

                {ticket.subtitle && (
                  <div className={styles.ticketSubtitle}>
                    <span className={styles.subtitleText}>{ticket.subtitle.label}</span>
                    {ticket.subtitle.linkLabel && (
                      <button
                        type="button"
                        className={styles.subtitleLink}
                        onClick={() => setActiveTicket(ticket.activity)}
                      >
                        ({ticket.subtitle.linkLabel})
                      </button>
                    )}
                  </div>
                )}

                <div className={styles.ticketContent}>
                  {ticket.body ? (
                    ticket.body.split('\n').map((line, idx) => (
                      <p key={idx} className={styles.contentLine}>{line}</p>
                    ))
                  ) : (
                    <p className={styles.contentEmpty}>
                      The user didn't write a review, and has just left a rating.
                    </p>
                  )}
                </div>

                <div className={styles.ticketActions}>
                  <button
                    className={styles.activityBtn}
                    onClick={() => setActiveTicket(ticket.activity)}
                  >
                    View activity
                  </button>
                  <button className={styles.actionIconBtn} aria-label="Comments">
                    <IconChat size={18} color="#555" />
                  </button>
                  <button className={styles.actionIconBtn} aria-label="More options">
                    <IconMoreVert size={18} color="#555" />
                  </button>
                </div>
              </div>
            </article>
          ))}
          </div>
        </div>
      </div>

      <TicketFiltersDrawer
        isOpen={filtersDrawerOpen}
        values={filterValues}
        onChange={handleFilterChange}
        onSeeAllFilters={() => {
          setFiltersDrawerOpen(false);
          setFiltersModalOpen(true);
        }}
      />

      <TableCustomizerDrawer
        isOpen={customizerOpen}
        onClose={() => setCustomizerOpen(false)}
      />
    </div>
  );
};

export default TicketingLanding;
