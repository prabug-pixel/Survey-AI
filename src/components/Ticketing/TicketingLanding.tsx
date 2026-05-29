import React, { useMemo, useState } from 'react';
import {
  IconStar,
  IconCalendar,
  IconChat,
  IconMoreVert,
  IconChevronDown,
  IconSearch,
  IconFilter,
  IconLocation,
  IconUsers,
  IconEye,
} from '../../shared/Icons/Icons';
import TicketActivityModal, { type TicketRecord } from './TicketActivityModal';
import { useCustomFields, SEVERITY_COLORS } from './CustomFieldsContext';
import type { SeverityLevel } from './CustomFieldsContext';
import styles from './TicketingLanding.module.scss';

type TicketAvatarSource = 'google' | 'facebook';

interface Ticket {
  id: string;
  source: TicketAvatarSource;
  sourceId: string;              // FK into the configured sources list
  severity: SeverityLevel;
  sentiment: 'Positive' | 'Neutral' | 'Negative' | 'Mixed';
  authorName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  reviewedOn: string;
  featured: boolean;
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
      activity: [
        { id: 'a1', actor: 'System', actorInitials: 'SY', actorTone: 'gray', message: 'System created the ticket and assigned to Prabu G', timestamp: 'May 26, 2026 09:31:00 AM' },
      ],
      customValues: {
        'cf-severity': 'Low',
        'cf-sentiment': 'Positive',
      },
    },
  },
];

const SOURCE_LETTER: Record<TicketSource, string> = {
  google: 'G',
  facebook: 'F',
};

const StarRow: React.FC<{ count: 1 | 2 | 3 | 4 | 5 }> = ({ count }) => (
  <div className={styles.starRow} aria-label={`${count} of 5 stars`}>
    {[1, 2, 3, 4, 5].map(i => (
      <IconStar key={i} size={14} color={i <= count ? '#fbc02d' : '#e0e0e0'} />
    ))}
  </div>
);

const SEVERITY_FILTERS: (SeverityLevel | 'All')[] = ['All', 'High', 'Medium', 'Low'];

const TicketingLanding: React.FC = () => {
  const [recentOpen, setRecentOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState<TicketRecord | null>(null);
  const [severityFilter, setSeverityFilter] = useState<SeverityLevel | 'All'>('All');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const { sources } = useCustomFields();

  // Apply the chip-row filters + the source dropdown together.
  const visibleTickets = useMemo(() => {
    return TICKETS.filter(t => {
      if (severityFilter !== 'All' && t.severity !== severityFilter) return false;
      if (sourceFilter !== 'all' && t.sourceId !== sourceFilter) return false;
      return true;
    });
  }, [severityFilter, sourceFilter]);

  return (
    <div className={styles.page}>
      {/* ── Page header ─────────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>{visibleTickets.length.toLocaleString()} tickets</h1>
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

          <button className={styles.createBtn}>Create ticket</button>

          <button className={styles.iconBtn} aria-label="More actions">
            <IconMoreVert size={20} color="#555" />
          </button>

          <button className={`${styles.iconBtn} ${styles.filterBtn}`} aria-label="Filters">
            <IconFilter size={20} color="#1976d2" />
            <span className={styles.filterBadge}>1</span>
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

      {/* ── Filter row (severity chips + source select) ──────── */}
      <div className={styles.filterRow}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Severity</span>
          {SEVERITY_FILTERS.map(level => {
            const colors = level !== 'All' ? SEVERITY_COLORS[level] : undefined;
            const isActive = severityFilter === level;
            return (
              <button
                key={level}
                type="button"
                className={`${styles.chip} ${isActive ? styles.chipActive : ''}`}
                style={isActive && colors ? { background: colors.bg, color: colors.fg, borderColor: colors.bg } : undefined}
                onClick={() => setSeverityFilter(level)}
              >
                {level !== 'All' && (
                  <span className={styles.chipDot} style={{ background: colors!.dot }} aria-hidden />
                )}
                {level}
              </button>
            );
          })}
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Source</span>
          <select
            className={styles.sourceSelect}
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            aria-label="Filter by source"
          >
            <option value="all">All sources</option>
            {sources.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Ticket list ─────────────────────────────────────── */}
      <div className={styles.listWrapper}>
        <div className={styles.list}>
          {visibleTickets.map(ticket => (
            <article key={ticket.id} className={styles.ticketRow}>
              <div className={styles.ticketLeft}>
                <div className={`${styles.avatar} ${styles[`source-${ticket.source}`]}`}>
                  {SOURCE_LETTER[ticket.source]}
                </div>
              </div>

              <div className={styles.ticketBody}>
                <div className={styles.ticketTopLine}>
                  <StarRow count={ticket.rating} />
                </div>

                <div className={styles.ticketMetaLine}>
                  <span className={styles.authorName}>{ticket.authorName}</span>
                  <span className={styles.metaDot}>•</span>
                  <span className={styles.reviewDate}>{ticket.reviewedOn}</span>
                  {ticket.featured && <span className={styles.featuredTag}>Featured</span>}
                </div>

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

              <div className={styles.ticketSide}>
                <div className={styles.sideRow}>
                  <span
                    className={styles.severityBadge}
                    style={{
                      background: SEVERITY_COLORS[ticket.severity].bg,
                      color: SEVERITY_COLORS[ticket.severity].fg,
                    }}
                  >
                    <span
                      className={styles.severityDot}
                      style={{ background: SEVERITY_COLORS[ticket.severity].dot }}
                      aria-hidden
                    />
                    {ticket.severity} severity
                  </span>
                </div>
                <div className={styles.sideRow}>
                  <IconCalendar size={14} color="#9e9e9e" />
                  <span>{ticket.dateLabel}</span>
                </div>
                <div className={styles.sideRow}>
                  <span
                    className={`${styles.statusDot} ${ticket.assigned ? styles.statusAssigned : ''}`}
                    aria-hidden
                  />
                  <span>{ticket.assigned ? 'Assigned' : 'Unassigned'}</span>
                </div>
                <div className={styles.sideRow}>
                  <IconEye size={14} color="#9e9e9e" />
                  <span>{ticket.watchers} Watchers</span>
                </div>
                {ticket.assignee && (
                  <div className={styles.sideRow}>
                    <IconUsers size={14} color="#9e9e9e" />
                    <span>{ticket.assignee}</span>
                  </div>
                )}
                {ticket.location && (
                  <div className={styles.sideRow}>
                    <IconLocation size={14} color="#9e9e9e" />
                    <span className={styles.sideLocation}>{ticket.location}</span>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TicketingLanding;
