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
} from '../../shared/Icons/Icons';
import TicketActivityModal, { type TicketRecord } from './TicketActivityModal';
import TicketFiltersDrawer from './TicketFiltersDrawer';
import TicketFiltersModal from './TicketFiltersModal';
import CreateTicketModal from './CreateTicketModal';
import { type FilterValues } from './TicketFilters';
import { SEVERITY_COLORS, useCustomFields } from './CustomFieldsContext';
import type { CustomField } from './CustomFieldsContext';
import { useTickets, type Ticket, type TicketAvatarSource } from './TicketsContext';
import styles from './TicketingLanding.module.scss';

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
  const { tickets, addTicket } = useTickets();
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
            <h1 className={styles.title}>{tickets.length.toLocaleString()} tickets</h1>
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
          onSave={values => {
            addTicket(values);
            setCreateTicketOpen(false);
          }}
        />

        {/* ── Ticket list ─────────────────────────────────────── */}
        <div className={styles.listWrapper}>
          <div className={styles.list}>
          {tickets.map(ticket => (
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
    </div>
  );
};

export default TicketingLanding;
