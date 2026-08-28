// ============================================================
// TicketActivityModal — right-side drawer with two accordion
// sections replacing the previous modal layout.
//
// Accordion 1: Ticket details & activity (body, feed, comment).
// Accordion 2: Assignment & fields (status, watchers, assignee,
//              custom fields with inline drag-reorder via pencil).
//
// Reuses the createPortal drawer pattern from TableCustomizerDrawer,
// the drag-drop logic from the same, and all existing elemental
// atoms (SingleSelect, FormInput, TextArea, Button) — no new
// design primitives introduced.
// ============================================================
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import SingleSelect from '@birdeye/elemental/core/atoms/SingleSelect';
import FormInput from '@birdeye/elemental/core/atoms/FormInput';
import TextArea from '@birdeye/elemental/core/atoms/TextArea';
import Button from '@birdeye/elemental/core/atoms/Button';
import {
  IconClose,
  IconCalendar,
  IconLocation,
  IconBulb,
  IconChevronDown,
  IconChevronUp,
  IconCheck,
  IconSearch,
  IconStarFilled,
  IconUsers,
  IconEdit,
  IconArrowLeft,
} from '../../shared/Icons/Icons';
import { useCustomFields } from './CustomFieldsContext';
import type { CustomField, CustomFieldFileValue } from './CustomFieldsContext';
import TicketDateField from './TicketDateField';
import TicketFileField from './TicketFileField';
import styles from './TicketActivityModal.module.scss';

export interface TicketActivityEntry {
  id: string;
  actor: string;
  actorInitials: string;
  actorTone: 'green' | 'red' | 'blue' | 'gray';
  message: string;
  timestamp: string;
}

export interface TicketRecord {
  id: string;
  title: string;
  createdOn: string;
  dueOn?: string;
  body: string;
  status: string;
  assigneeName: string;
  assigneeInitials: string;
  watcherInitials?: string;
  location: string;
  channel: string;
  activity: TicketActivityEntry[];
  /** Pre-populated values for built-in custom fields (severity, sentiment, etc.). */
  customValues?: Record<string, string | boolean | CustomFieldFileValue[]>;
  /** Review-only fields. Set on tickets that came in from a review source
   *  (Google, Facebook, etc.) so the drawer swaps the bulb/title treatment
   *  for the red-avatar + star-row header. Leave undefined on other types. */
  rating?: 1 | 2 | 3 | 4 | 5;
  reviewerName?: string;
  featured?: boolean;
}

interface Props {
  isOpen: boolean;
  ticket: TicketRecord | null;
  onClose: () => void;
}

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'closed', label: 'Closed' },
];

const ASSIGNEE_OPTIONS = [
  { value: 'abhinav', label: 'Abhinav R.' },
  { value: 'priyanshi', label: 'Priyanshi' },
  { value: 'sahil', label: 'Sahil Gupta' },
  { value: 'prabu', label: 'Prabu G' },
];

type Scope = 'user' | 'roles' | 'teams';
const SCOPE_ORDER: Scope[] = ['user', 'roles', 'teams'];
const SCOPE_LABEL: Record<Scope, string> = {
  user: 'User',
  roles: 'Roles',
  teams: 'Teams',
};
const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'agent', label: 'Agent' },
];
const TEAM_OPTIONS = [
  { value: 'support', label: 'Support' },
  { value: 'sales', label: 'Sales' },
  { value: 'engineering', label: 'Engineering' },
];
const OPTIONS_BY_SCOPE: Record<Scope, { value: string; label: string }[]> = {
  user: ASSIGNEE_OPTIONS,
  roles: ROLE_OPTIONS,
  teams: TEAM_OPTIONS,
};

const ReviewStarRow: React.FC<{ count: 1 | 2 | 3 | 4 | 5 }> = ({ count }) => (
  <div className={styles.starRow} aria-label={`${count} of 5 stars`}>
    {[1, 2, 3, 4, 5].map(i => (
      <IconStarFilled key={i} size={16} color={i <= count ? '#fbc02d' : '#e0e0e0'} />
    ))}
  </div>
);

const statusValueFromLabel = (label: string): string => {
  const match = STATUS_OPTIONS.find(o => o.label.toLowerCase() === label.toLowerCase());
  return match?.value ?? 'open';
};

// Inline drag handle for the reorder list.
const DragHandle: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className={styles.dragHandleIcon}>
    <circle cx="9"  cy="5"  r="1.5" fill="#555555" />
    <circle cx="15" cy="5"  r="1.5" fill="#555555" />
    <circle cx="9"  cy="12" r="1.5" fill="#555555" />
    <circle cx="15" cy="12" r="1.5" fill="#555555" />
    <circle cx="9"  cy="19" r="1.5" fill="#555555" />
    <circle cx="15" cy="19" r="1.5" fill="#555555" />
  </svg>
);

const arraysEqual = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) return false;
  return true;
};

const TicketActivityModal: React.FC<Props> = ({ isOpen, ticket, onClose }) => {
  const [status, setStatus] = useState<string>(ticket ? statusValueFromLabel(ticket.status) : 'open');
  const [comment, setComment] = useState('');

  const [watcherScope, setWatcherScope] = useState<Scope>('user');
  const [watcherValues, setWatcherValues] = useState<string[]>([]);
  const [assigneeScope, setAssigneeScope] = useState<Scope>('user');
  const [assigneeValue, setAssigneeValue] = useState<string>('abhinav');

  const { fields: customFields, tableColumnOrder, reorderTableColumns } = useCustomFields();

  const visibleCustomFields = React.useMemo(() => {
    const fieldById = new Map(customFields.map(f => [f.id, f]));
    const ordered = tableColumnOrder
      .map(id => fieldById.get(id))
      .filter(f => f &&
        (f.kind === 'severity' || f.kind === 'sentiment' ||
         f.kind === 'rootCause' || f.kind === 'rootCauseComment' ||
         f.kind === 'custom'));
    const inOrder = new Set(tableColumnOrder);
    customFields.forEach(f => {
      if (!inOrder.has(f.id) &&
          (f.kind === 'severity' || f.kind === 'sentiment' ||
           f.kind === 'rootCause' || f.kind === 'rootCauseComment' ||
           f.kind === 'custom')) {
        ordered.push(f);
      }
    });
    return ordered.filter(Boolean);
  }, [customFields, tableColumnOrder]);

  const [customValues, setCustomValues] = useState<Record<string, string | boolean | CustomFieldFileValue[]>>({});
  const setCustomValue = (id: string, v: string | boolean | CustomFieldFileValue[]) =>
    setCustomValues(prev => ({ ...prev, [id]: v }));

  // Accordion open/close state — all open by default.
  const [acc1Open, setAcc1Open] = useState(true);
  const [assignmentOpen, setAssignmentOpen] = useState(true);
  const [customFieldsOpen, setCustomFieldsOpen] = useState(true);

  // Sub-panel navigation: 'main' is the default two-accordion view;
  // 'allFields' lists every custom field; 'reorder' lets the user drag-reorder.
  const [drawerView, setDrawerView] = useState<'main' | 'allFields' | 'reorder'>('main');

  // Custom-field reorder state (used in 'reorder' view).
  const [localOrder, setLocalOrder] = useState<string[]>([]);
  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    dragIndexRef.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    const fromIndex = dragIndexRef.current;
    if (fromIndex === null || fromIndex === dropIndex) { setDragOverIndex(null); return; }
    const next = [...localOrder];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(dropIndex, 0, moved);
    setLocalOrder(next);
    dragIndexRef.current = null;
    setDragOverIndex(null);
  };
  const handleDragEnd = () => { dragIndexRef.current = null; setDragOverIndex(null); };

  const enterReorderView = () => {
    setLocalOrder(tableColumnOrder);
    setDrawerView('reorder');
  };
  const cancelReorder = () => setDrawerView('main');
  const saveReorder = () => {
    if (!arraysEqual(localOrder, tableColumnOrder)) {
      reorderTableColumns(localOrder);
    }
    setDrawerView('main');
  };

  React.useEffect(() => {
    if (!ticket) return;
    setStatus(statusValueFromLabel(ticket.status));
    setComment('');
    setCustomValues(ticket.customValues ?? {});
    setWatcherScope('user');
    setWatcherValues([]);
    setAssigneeScope('user');
    setAssigneeValue('abhinav');
    setDrawerView('main');
    setAcc1Open(true);
    setAssignmentOpen(true);
    setCustomFieldsOpen(true);
  }, [ticket]);

  if (!isOpen || !ticket) return null;

  // Build the ordered field list for reorder mode display.
  const fieldById = new Map(customFields.map(f => [f.id, f]));
  const reorderFields: CustomField[] = localOrder
    .map(id => fieldById.get(id))
    .filter((f): f is CustomField => Boolean(f) &&
      (f.kind === 'severity' || f.kind === 'sentiment' ||
       f.kind === 'rootCause' || f.kind === 'rootCauseComment' ||
       f.kind === 'custom'));

  const SUB_VIEW_TITLES: Record<'allFields' | 'reorder', string> = {
    allFields: 'Custom fields',
    reorder: 'Reorder fields',
  };

  return createPortal(
    <div className={styles.drawerRoot}>
      <div className={styles.drawerBlanket} onClick={onClose} aria-hidden />

      <aside className={styles.drawerPanel} aria-label={`Ticket #${ticket.id}`}>
        {/* ── Header — changes by view ──────────────────── */}
        {drawerView === 'main' ? (
          <div className={styles.drawerHeader}>
            <span className={styles.ticketId}>Ticket #{ticket.id}</span>
            <button type="button" className={styles.iconBtn} aria-label="Close" onClick={onClose}>
              <IconClose size={16} color="#555" />
            </button>
          </div>
        ) : (
          <div className={styles.drawerHeader}>
            <button
              type="button"
              className={styles.iconBtn}
              aria-label="Back"
              onClick={() => setDrawerView('main')}
            >
              <IconArrowLeft size={18} color="#555" />
            </button>
            <span className={styles.subViewTitle}>{SUB_VIEW_TITLES[drawerView]}</span>
            {drawerView === 'reorder' && (
              <div className={styles.subViewActions}>
                <button type="button" className={styles.reorderCancelBtn} onClick={cancelReorder}>
                  Cancel
                </button>
                <button type="button" className={styles.reorderSaveBtn} onClick={saveReorder}>
                  Save
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Body ─────────────────────────────────────── */}
        {drawerView === 'allFields' && (
          <div className={styles.drawerBody}>
            <div className={styles.subViewBody}>
              {visibleCustomFields.map(field => (
                <CustomFieldControl
                  key={field.id}
                  field={field}
                  value={customValues[field.id]}
                  onChange={v => setCustomValue(field.id, v)}
                />
              ))}
            </div>
          </div>
        )}

        {drawerView === 'reorder' && (
          <div className={styles.drawerBody}>
            <div className={styles.subViewBody}>
              <p className={styles.reorderHint}>Drag rows to set the display priority.</p>
              <div className={styles.reorderList}>
                {reorderFields.map((field, idx) => (
                  <div
                    key={field.id}
                    className={`${styles.reorderRow} ${dragOverIndex === idx ? styles.reorderRowDragOver : ''}`}
                    draggable
                    onDragStart={e => handleDragStart(e, idx)}
                    onDragOver={e => handleDragOver(e, idx)}
                    onDrop={e => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                  >
                    <span className={styles.reorderFieldName}>{field.name}</span>
                    <span className={styles.dragHandle} aria-hidden>
                      <DragHandle />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Main view (two accordions) ─────────────── */}
        {drawerView === 'main' && (
        <div className={styles.drawerBody}>

          {/* ── Accordion 1: Ticket details & activity ── */}
          <div className={styles.accordionItem}>
            <button
              type="button"
              className={styles.accordionTrigger}
              aria-expanded={acc1Open}
              onClick={() => setAcc1Open(v => !v)}
            >
              <span className={styles.accordionTitle}>Ticket details &amp; activity</span>
              {acc1Open
                ? <IconChevronUp size={16} color="#555" />
                : <IconChevronDown size={16} color="#555" />}
            </button>

            {acc1Open && (
              <div className={styles.accordionContent}>
                {/* Ticket head */}
                <div className={styles.ticketHead}>
                  {ticket.rating !== undefined ? (
                    <>
                      <div className={styles.reviewerAvatar}>
                        {(ticket.reviewerName ?? '?').charAt(0).toUpperCase()}
                      </div>
                      <div className={styles.ticketHeadText}>
                        {/* Stars + status + assignee + location all on one horizontal line */}
                        <div className={styles.reviewMetaRow}>
                          <ReviewStarRow count={ticket.rating} />
                          <div className={styles.reviewMetaRight}>
                            <span className={styles.headMetaItem}>
                              <IconCalendar size={14} color="#9e9e9e" />
                              <span>{ticket.createdOn}</span>
                            </span>
                            {ticket.assigneeName && (
                              <span className={styles.headMetaItem}>
                                <IconUsers size={14} color="#9e9e9e" />
                                <span>{ticket.assigneeName}</span>
                              </span>
                            )}
                            {ticket.location && (
                              <span className={`${styles.headMetaItem} ${styles.headMetaLocation}`}>
                                <IconLocation size={14} color="#9e9e9e" />
                                <span>{ticket.location}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Reviewer name + date + featured on the second line */}
                        <div className={styles.ticketMeta}>
                          <span className={styles.reviewerName}>{ticket.reviewerName}</span>
                          <span className={styles.metaSep}>·</span>
                          <span>{ticket.createdOn}</span>
                          {ticket.featured && (
                            <>
                              <span className={styles.metaSep}>·</span>
                              <span className={styles.featuredChip}>Featured</span>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={styles.ticketIcon}>
                        <IconBulb size={20} color="#fbc02d" />
                      </div>
                      <div className={styles.ticketHeadText}>
                        <h2 className={styles.ticketTitle}>{ticket.title}</h2>
                        <div className={styles.ticketMeta}>
                          <span>{ticket.createdOn}</span>
                          {ticket.dueOn && (
                            <>
                              <span className={styles.metaSep}>·</span>
                              <span className={styles.metaDue}>
                                <IconCalendar size={14} color="#9e9e9e" />
                                Due {ticket.dueOn}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Body text */}
                <p className={styles.ticketBody}>{ticket.body}</p>

                <div className={styles.divider} />

                {/* Activity feed */}
                <h3 className={styles.sectionLabel}>Activity</h3>
                <ul className={styles.activityList}>
                  {ticket.activity.map(entry => (
                    <li key={entry.id} className={styles.activityItem}>
                      <div className={`${styles.activityAvatar} ${styles[`tone-${entry.actorTone}`]}`}>
                        {entry.actorInitials}
                      </div>
                      <div className={styles.activityText}>
                        <div className={styles.activityMessage}>{entry.message}</div>
                        <div className={styles.activityTime}>{entry.timestamp}</div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Comment + CTA */}
                <div className={styles.commentBlock}>
                  <TextArea
                    name="ticketComment"
                    value={comment}
                    onChange={(_event: unknown, value: string) => setComment(String(value ?? ''))}
                    placeholder="Add a comment..."
                    rows={3}
                    autoSize={false}
                    noFloatingLabel
                  />
                  <div className={styles.commentFooter}>
                    {comment.trim() && (
                      <Button
                        theme="secondary"
                        label="Cancel"
                        onClick={() => { setComment(''); }}
                      />
                    )}
                    <Button
                      theme="primary"
                      label="Comment"
                      disabled={!comment.trim()}
                      onClick={() => { setComment(''); }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.accordionDivider} />

          {/* ── Accordion 2: Assignment ───────────────── */}
          <div className={styles.accordionItem}>
            <button
              type="button"
              className={styles.accordionTrigger}
              aria-expanded={assignmentOpen}
              onClick={() => setAssignmentOpen(v => !v)}
            >
              <span className={styles.accordionTitle}>Assignment</span>
              {assignmentOpen
                ? <IconChevronUp size={16} color="#555" />
                : <IconChevronDown size={16} color="#555" />}
            </button>

            {assignmentOpen && (
              <div className={styles.accordionContent}>
                <div className={styles.sideField}>
                  <label className={styles.sideFieldLabel}>Status</label>
                  <SingleSelect
                    name="ticketStatus"
                    displayLabel="Status"
                    options={STATUS_OPTIONS}
                    selected={status}
                    onChange={(option) => setStatus(String(option.value))}
                    showSearch={false}
                    isAeroDesign
                  />
                </div>

                <ScopedSelect
                  multi
                  label="Add watchers"
                  scope={watcherScope}
                  onScopeChange={s => { setWatcherScope(s); setWatcherValues([]); }}
                  value={watcherValues}
                  onChange={setWatcherValues}
                  placeholder="Select watchers"
                  multiCountLabel={n => `${n} watchers`}
                />

                <ScopedSelect
                  label="Assign to"
                  scope={assigneeScope}
                  onScopeChange={s => { setAssigneeScope(s); setAssigneeValue(''); }}
                  value={assigneeValue}
                  onChange={setAssigneeValue}
                  placeholder="Select an assignee"
                />
              </div>
            )}
          </div>

          {/* ── Accordion 3: Custom fields ────────────── */}
          {visibleCustomFields.length > 0 && (
            <>
              <div className={styles.accordionDivider} />
              <div className={styles.accordionItem}>
                <button
                  type="button"
                  className={styles.accordionTrigger}
                  aria-expanded={customFieldsOpen}
                  onClick={() => setCustomFieldsOpen(v => !v)}
                >
                  <span className={styles.accordionTitle}>Custom fields</span>
                  <div className={styles.accordionTriggerActions}>
                    <span
                      role="button"
                      tabIndex={0}
                      className={styles.reorderTriggerBtn}
                      aria-label="Reorder custom fields"
                      onClick={e => { e.stopPropagation(); enterReorderView(); }}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); enterReorderView(); } }}
                    >
                      <IconEdit size={14} color="#555" />
                    </span>
                    {customFieldsOpen
                      ? <IconChevronUp size={16} color="#555" />
                      : <IconChevronDown size={16} color="#555" />}
                  </div>
                </button>

                {customFieldsOpen && (
                  <div className={styles.accordionContent}>
                    {visibleCustomFields.slice(0, 3).map(field => (
                      <CustomFieldControl
                        key={field.id}
                        field={field}
                        value={customValues[field.id]}
                        onChange={v => setCustomValue(field.id, v)}
                      />
                    ))}

                    {visibleCustomFields.length > 3 && (
                      <button
                        type="button"
                        className={styles.showAllBtn}
                        onClick={() => setDrawerView('allFields')}
                      >
                        Show all
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        )}
      </aside>
    </div>,
    document.body
  );
};

// ── ScopedSelect ────────────────────────────────────────────
type ScopedSelectProps = {
  label: string;
  scope: Scope;
  onScopeChange: (s: Scope) => void;
  placeholder?: string;
} & (
  | { multi?: false; value: string; onChange: (v: string) => void; multiCountLabel?: never }
  | { multi: true; value: string[]; onChange: (v: string[]) => void; multiCountLabel?: (n: number) => string }
);

const scopeNoun = (s: Scope): string => SCOPE_LABEL[s].toLowerCase().replace(/s$/, '');

const ScopedSelect: React.FC<ScopedSelectProps> = (props) => {
  const { label, scope, onScopeChange, placeholder = 'Select…' } = props;
  const options = OPTIONS_BY_SCOPE[scope];
  const [scopeOpen, setScopeOpen] = useState(false);
  const [valueOpen, setValueOpen] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLDivElement>(null);

  const [draft, setDraft] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  useEffect(() => {
    if (valueOpen && props.multi) {
      setDraft(props.value);
      setSearch('');
    }
  }, [valueOpen, props.multi, props.multi ? props.value : null]);

  let displayLabel = '';
  if (props.multi) {
    const selected = props.value;
    if (selected.length === 1) {
      displayLabel = options.find(o => o.value === selected[0])?.label ?? '';
    } else if (selected.length > 1) {
      displayLabel = props.multiCountLabel
        ? props.multiCountLabel(selected.length)
        : `${selected.length} selected`;
    }
  } else {
    displayLabel = options.find(o => o.value === props.value)?.label ?? '';
  }

  useEffect(() => {
    if (!scopeOpen && !valueOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (scopeRef.current && !scopeRef.current.contains(t)) setScopeOpen(false);
      if (valueRef.current && !valueRef.current.contains(t)) setValueOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [scopeOpen, valueOpen]);

  const filteredOptions = props.multi
    ? options.filter(o => o.label.toLowerCase().includes(search.trim().toLowerCase()))
    : options;
  const allFilteredSelected =
    filteredOptions.length > 0 && filteredOptions.every(o => draft.includes(o.value));
  const toggleDraft = (v: string) =>
    setDraft(prev => (prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]));
  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setDraft(prev => prev.filter(v => !filteredOptions.some(o => o.value === v)));
    } else {
      const merged = new Set(draft);
      filteredOptions.forEach(o => merged.add(o.value));
      setDraft([...merged]);
    }
  };

  return (
    <div className={styles.scopedSelect}>
      <div className={styles.scopedLabelRow}>
        <span className={styles.scopedLabel}>{label}: </span>
        <div className={styles.scopedScopeWrap} ref={scopeRef}>
          <button
            type="button"
            className={styles.scopedScopeBtn}
            aria-haspopup="listbox"
            aria-expanded={scopeOpen}
            onClick={() => setScopeOpen(o => !o)}
          >
            <span>{SCOPE_LABEL[scope]}</span>
            <IconChevronDown size={14} color="#1976d2" />
          </button>
          {scopeOpen && (
            <div className={styles.scopedScopeMenu} role="listbox">
              {SCOPE_ORDER.map(s => (
                <button
                  key={s}
                  type="button"
                  role="option"
                  aria-selected={s === scope}
                  className={`${styles.scopedScopeOption} ${s === scope ? styles.scopedScopeOptionActive : ''}`}
                  onClick={() => { onScopeChange(s); setScopeOpen(false); }}
                >
                  <span>{SCOPE_LABEL[s]}</span>
                  {s === scope && <IconCheck size={14} color="#212121" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className={styles.scopedFieldWrap} ref={valueRef}>
        <button
          type="button"
          className={styles.scopedField}
          aria-haspopup="listbox"
          aria-expanded={valueOpen}
          onClick={() => setValueOpen(o => !o)}
        >
          <span className={`${styles.scopedFieldValue} ${displayLabel ? '' : styles.scopedFieldPlaceholder}`}>
            {displayLabel || placeholder}
          </span>
          <IconChevronDown size={16} color="#212121" />
        </button>
        {valueOpen && props.multi && (
          <div className={styles.msMenu} role="dialog" aria-label={`Select ${scopeNoun(scope)}`}>
            <div className={styles.msHeader}>Select {scopeNoun(scope)}</div>
            <div className={styles.msBody}>
              <div className={styles.msSearch}>
                <IconSearch size={16} color="#8f8f8f" />
                <input
                  type="text"
                  value={search}
                  placeholder="Search"
                  onChange={e => setSearch(e.target.value)}
                  aria-label="Search options"
                />
              </div>
              <label className={styles.msTile}>
                <span className={`${styles.msCheckbox} ${allFilteredSelected ? styles.msCheckboxOn : ''}`} aria-hidden>
                  {allFilteredSelected && <IconCheck size={14} color="#ffffff" />}
                </span>
                <input
                  type="checkbox"
                  className={styles.msCheckboxInput}
                  checked={allFilteredSelected}
                  onChange={toggleSelectAll}
                  aria-label="Select all"
                />
                <span className={styles.msTileLabel}>Select all</span>
              </label>
              {filteredOptions.map(o => {
                const checked = draft.includes(o.value);
                return (
                  <label key={o.value} className={styles.msTile}>
                    <span className={`${styles.msCheckbox} ${checked ? styles.msCheckboxOn : ''}`} aria-hidden>
                      {checked && <IconCheck size={14} color="#ffffff" />}
                    </span>
                    <input
                      type="checkbox"
                      className={styles.msCheckboxInput}
                      checked={checked}
                      onChange={() => toggleDraft(o.value)}
                    />
                    <span className={styles.msTileLabel}>{o.label}</span>
                  </label>
                );
              })}
              {filteredOptions.length === 0 && (
                <div className={styles.msEmpty}>No matches</div>
              )}
            </div>
            <div className={styles.msDivider} />
            <div className={styles.msFooter}>
              <button
                type="button"
                className={styles.msApply}
                onClick={() => { props.onChange(draft); setValueOpen(false); }}
              >
                Apply
              </button>
            </div>
          </div>
        )}
        {valueOpen && !props.multi && (
          <div className={styles.scopedValueMenu} role="listbox">
            {options.map(o => {
              const selected = o.value === props.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={styles.scopedValueOption}
                  onClick={() => { props.onChange(o.value); setValueOpen(false); }}
                >
                  <span>{o.label}</span>
                  {selected && <IconCheck size={14} color="#212121" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ── CustomFieldControl ──────────────────────────────────────
interface CustomFieldControlProps {
  field: CustomField;
  value: string | boolean | CustomFieldFileValue[] | undefined;
  onChange: (v: string | boolean | CustomFieldFileValue[]) => void;
}

const CustomFieldControl: React.FC<CustomFieldControlProps> = ({ field, value, onChange }) => {
  const label = (
    <label className={styles.sideFieldLabel}>
      {field.name}
      {field.required && <span className={styles.requiredStar}> *</span>}
    </label>
  );

  switch (field.type) {
    case 'dropdown': {
      const opts = (field.options ?? []).map(o => ({ value: o, label: o }));
      return (
        <div className={styles.sideField}>
          {label}
          <SingleSelect
            name={`cf-${field.id}`}
            displayLabel={field.name}
            options={opts}
            selected={typeof value === 'string' ? value : ''}
            onChange={(option) => onChange(String(option.value))}
            showSearch={false}
            isAeroDesign
          />
        </div>
      );
    }
    case 'user': {
      return (
        <div className={styles.sideField}>
          {label}
          <SingleSelect
            name={`cf-${field.id}`}
            displayLabel={field.name}
            options={ASSIGNEE_OPTIONS}
            selected={typeof value === 'string' ? value : ''}
            onChange={(option) => onChange(String(option.value))}
            showSearch={false}
            isAeroDesign
          />
        </div>
      );
    }
    case 'longText':
      return (
        <div className={styles.sideField}>
          {label}
          <TextArea
            name={`cf-${field.id}`}
            value={typeof value === 'string' ? value : ''}
            onChange={(_e: unknown, v: string) => onChange(String(v ?? ''))}
            placeholder={field.description ?? ''}
            rows={2}
            autoSize={false}
            noFloatingLabel
          />
        </div>
      );
    case 'checkbox':
      return (
        <div className={styles.sideField}>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={value === true}
              onChange={e => onChange(e.target.checked)}
            />
            <span>
              {field.name}
              {field.required && <span className={styles.requiredStar}> *</span>}
            </span>
          </label>
        </div>
      );
    case 'date':
      return (
        <div className={styles.sideField}>
          {label}
          <TicketDateField
            name={`cf-${field.id}`}
            value={typeof value === 'string' ? value : ''}
            onChange={onChange}
            placeholder="MM/DD/YYYY"
          />
        </div>
      );
    case 'files':
      return (
        <div className={styles.sideField}>
          {label}
          <TicketFileField
            name={`cf-${field.id}`}
            value={Array.isArray(value) ? value : []}
            onChange={onChange}
          />
        </div>
      );
    case 'number':
    case 'text':
    default:
      return (
        <div className={styles.sideField}>
          {label}
          <FormInput
            name={`cf-${field.id}`}
            type={field.type === 'number' ? 'number' : 'text'}
            value={typeof value === 'string' ? value : ''}
            placeholder={field.description ?? ''}
            onChange={(_e: unknown, v: string) => onChange(String(v ?? ''))}
          />
        </div>
      );
  }
};

export default TicketActivityModal;
