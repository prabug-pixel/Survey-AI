// ============================================================
// TicketActivityModal — alternative layout where ticket meta
// fields live in a right-side rail so the top stays clean even
// as fields multiply (Status, Assignee, Watchers, Location,
// Channel, Due date, Created, …).
//
// Reuses existing elemental atoms (Modal, SingleSelect,
// FormInput, TextArea, Button) and project tokens — no new
// design primitives are introduced.
// ============================================================
import React, { useEffect, useRef, useState } from 'react';
import Modal from '@birdeye/elemental/core/atoms/Modal';
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
  IconCheck,
  IconSearch,
  IconStarFilled,
  IconUsers,
} from '../../shared/Icons/Icons';
import { useCustomFields } from './CustomFieldsContext';
import type { CustomField } from './CustomFieldsContext';
import TicketDateField from './TicketDateField';
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
  customValues?: Record<string, string | boolean>;
  /** Review-only fields. Set on tickets that came in from a review source
   *  (Google, Facebook, etc.) so the modal swaps the bulb/title treatment
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

// Scope picker for the Watchers / Assign-to fields. The same roster gets
// surfaced under three lenses — individual users, roles, or teams.
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

// Inline star row used by the review-source ticket head. Kept inline so
// the modal stays self-contained — the list view has its own copy.
const ReviewStarRow: React.FC<{ count: 1 | 2 | 3 | 4 | 5 }> = ({ count }) => (
  <div className={styles.starRow} aria-label={`${count} of 5 stars`}>
    {[1, 2, 3, 4, 5].map(i => (
      <IconStarFilled key={i} size={16} color={i <= count ? '#fbc02d' : '#e0e0e0'} />
    ))}
  </div>
);

// Render-side label normalizer for the Status select so saved tickets
// using free-form casing ("Closed", "open") still light up the dropdown.
const statusValueFromLabel = (label: string): string => {
  const match = STATUS_OPTIONS.find(o => o.label.toLowerCase() === label.toLowerCase());
  return match?.value ?? 'open';
};

const TicketActivityModal: React.FC<Props> = ({ isOpen, ticket, onClose }) => {
  // Local controlled state for the right-side fields and comment box.
  // The host page can wire these to a real store later — for now they
  // demonstrate the layout works with existing form components.
  const [status, setStatus] = useState<string>(ticket ? statusValueFromLabel(ticket.status) : 'open');
  const [comment, setComment] = useState('');

  // Watchers and Assign-to share the same scope-picker shape: pick a
  // scope (User / Roles / Teams) which swaps the options shown in the
  // dropdown below, then pick a value from that scoped list. Watchers
  // is multi-select; Assign-to is single-select.
  const [watcherScope, setWatcherScope] = useState<Scope>('user');
  const [watcherValues, setWatcherValues] = useState<string[]>([]);
  const [assigneeScope, setAssigneeScope] = useState<Scope>('user');
  const [assigneeValue, setAssigneeValue] = useState<string>('abhinav');

  // Custom fields configured under Settings > Fields. Values are kept
  // locally keyed by field id; a real implementation would persist per
  // ticket, but the structure is the same.
  const { fields: customFields, tableColumnOrder } = useCustomFields();
  // The fixed rows above (Status, Assignee, Watchers, Location, Channel,
  // Created, Due date) already cover the customer/contact system kinds,
  // so the side rail's "Custom fields" section only surfaces ticket-axis
  // presets (severity/sentiment/root cause) plus anything user-added.
  // `visible` is intentionally ignored — it controls the list-view rail.
  // Order follows the user's saved tableColumnOrder from the customizer.
  const visibleCustomFields = React.useMemo(() => {
    const fieldById = new Map(customFields.map(f => [f.id, f]));
    const ordered = tableColumnOrder
      .map(id => fieldById.get(id))
      .filter(f => f &&
        (f.kind === 'severity' || f.kind === 'sentiment' ||
         f.kind === 'rootCause' || f.kind === 'rootCauseComment' ||
         f.kind === 'custom'));
    // Append any matching fields not yet in the saved order.
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
  const [customValues, setCustomValues] = useState<Record<string, string | boolean>>({});
  const setCustomValue = (id: string, v: string | boolean) =>
    setCustomValues(prev => ({ ...prev, [id]: v }));

  // Reset local controls when the active ticket changes. Pull in any
  // pre-populated custom values from the ticket so built-in fields
  // (severity, sentiment) reflect what was set at creation.
  React.useEffect(() => {
    if (!ticket) return;
    setStatus(statusValueFromLabel(ticket.status));
    setComment('');
    setCustomValues(ticket.customValues ?? {});
    setWatcherScope('user');
    setWatcherValues([]);
    setAssigneeScope('user');
    setAssigneeValue('abhinav');
  }, [ticket]);

  if (!ticket) return null;

  return (
    <Modal
      dialogOptions={{
        isOpen,
        title: '',
        // Suppress elemental's floating X — the custom header has its own
        // close button next to the kebab so the two icons line up.
        showCloseIcon: false,
        onCloseModal: onClose,
        shouldCloseOnOverlayClick: true,
        shouldCloseOnEsc: true,
        // Cap the modal width and height and turn the content into a
        // flex column so the body grid below can flex into the
        // remaining space and scroll the two columns independently
        // (the side rail in particular, per the design). The width
        // cap narrows the elemental "large" preset (1050 px) so the
        // two-column layout reads as a focused activity panel rather
        // than a wide form.
        dialogStyles: {
          content: {
            maxWidth: 950,
            maxHeight: 600,
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      {/* ── Header bar ───────────────────────────────────── */}
      <div className={styles.headerBar}>
        <div className={styles.headerTitleGroup}>
          <span className={styles.ticketId}>Ticket #{ticket.id}</span>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.iconBtn} aria-label="Close" onClick={onClose}>
            <IconClose size={16} color="#555" />
          </button>
        </div>
      </div>

      {/* Ticket head sits above the two-column body so the main and side
         rail both start at the same Y — keeps "ASSIGNMENT" aligned with
         the body text rather than the icon. Review-source tickets swap
         the bulb/title for a reviewer avatar + star row + name/date/
         Featured chip, matching the list-view treatment. */}
      <div className={styles.ticketHead}>
        {ticket.rating !== undefined ? (
          <>
            <div className={styles.reviewerAvatar}>
              {(ticket.reviewerName ?? '?').charAt(0).toUpperCase()}
            </div>
            <div className={styles.ticketHeadText}>
              <ReviewStarRow count={ticket.rating} />
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
            <div className={styles.headTopMeta}>
              <span className={styles.headMetaItem}>
                <IconCalendar size={14} color="#9e9e9e" />
                <span>{ticket.createdOn}</span>
              </span>
              <span className={styles.headMetaItem}>
                <span className={`${styles.headStatusDot} ${styles.headStatusAssigned}`} aria-hidden />
                <span>{ticket.status}</span>
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

      {/* ── Body: main + side rail ──────────────────────── */}
      <div className={styles.body}>
        {/* Main column ────────────────────────────── */}
        <div className={styles.main}>
          <p className={styles.ticketBody}>{ticket.body}</p>

          <div className={styles.divider} />

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
              <Button
                theme="primary"
                label="Comment"
                disabled={!comment.trim()}
                onClick={() => {
                  // Posting wires into a real store later; for now the
                  // local state is reset so the field is reusable.
                  setComment('');
                }}
              />
            </div>
          </div>
        </div>

        {/* Side rail ──────────────────────────────── */}
        <aside className={styles.side}>
          <div className={styles.sideGroup}>
            <h4 className={styles.sideGroupLabel}>Assignment</h4>

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
              onScopeChange={s => {
                setWatcherScope(s);
                setWatcherValues([]);
              }}
              value={watcherValues}
              onChange={setWatcherValues}
              placeholder="Select watchers"
              multiCountLabel={n => `${n} watchers`}
            />

            <ScopedSelect
              label="Assign to"
              scope={assigneeScope}
              onScopeChange={s => {
                setAssigneeScope(s);
                setAssigneeValue('');
              }}
              value={assigneeValue}
              onChange={setAssigneeValue}
              placeholder="Select an assignee"
            />
          </div>

          {visibleCustomFields.length > 0 && (
            <div className={styles.sideGroup}>
              <h4 className={styles.sideGroupLabel}>Custom fields</h4>
              {visibleCustomFields.map(field => (
                <CustomFieldControl
                  key={field.id}
                  field={field}
                  value={customValues[field.id]}
                  onChange={v => setCustomValue(field.id, v)}
                />
              ))}
            </div>
          )}
        </aside>
      </div>
    </Modal>
  );
};

// ScopedSelect — the "Add watchers" / "Assign to" pattern: a label row
// with an inline scope picker (User / Roles / Teams) followed by a
// field-shaped value picker whose options swap with the scope. Mirrors
// the Birdeye design-system "Text field - Standard" treatment in Figma
// (36px row, 1px #ccc border, chevron-down on the right).
type ScopedSelectProps = {
  label: string;
  scope: Scope;
  onScopeChange: (s: Scope) => void;
  placeholder?: string;
} & (
  | { multi?: false; value: string; onChange: (v: string) => void; multiCountLabel?: never }
  | { multi: true; value: string[]; onChange: (v: string[]) => void; multiCountLabel?: (n: number) => string }
);

// Header for the multi-select dropdown — singularize the scope label
// ("Users" → "user") to match Figma copy ("Select user").
const scopeNoun = (s: Scope): string => SCOPE_LABEL[s].toLowerCase().replace(/s$/, '');

const ScopedSelect: React.FC<ScopedSelectProps> = (props) => {
  const { label, scope, onScopeChange, placeholder = 'Select…' } = props;
  const options = OPTIONS_BY_SCOPE[scope];
  const [scopeOpen, setScopeOpen] = useState(false);
  const [valueOpen, setValueOpen] = useState(false);
  const scopeRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLDivElement>(null);

  // Multi mode stages picks in a local draft and only commits on Apply,
  // so closing the dropdown without Apply discards the changes (matches
  // the Figma "Apply" pattern).
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

  // Multi-mode dropdown bits (filtered options, select-all state, draft toggles).
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
                  onClick={() => {
                    onScopeChange(s);
                    setScopeOpen(false);
                  }}
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
          <span
            className={`${styles.scopedFieldValue} ${displayLabel ? '' : styles.scopedFieldPlaceholder}`}
          >
            {displayLabel || placeholder}
          </span>
          <IconChevronDown size={16} color="#9e9e9e" />
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
                <span
                  className={`${styles.msCheckbox} ${allFilteredSelected ? styles.msCheckboxOn : ''}`}
                  aria-hidden
                >
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
                    <span
                      className={`${styles.msCheckbox} ${checked ? styles.msCheckboxOn : ''}`}
                      aria-hidden
                    >
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
                onClick={() => {
                  props.onChange(draft);
                  setValueOpen(false);
                }}
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
                  onClick={() => {
                    props.onChange(o.value);
                    setValueOpen(false);
                  }}
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

// Renders the right control inside the side rail for a single custom
// field. Kept inline so the activity modal stays the only file the
// host needs to import; the shape of the control comes from the
// field's `type` (text, dropdown, number, etc.).
interface CustomFieldControlProps {
  field: CustomField;
  value: string | boolean | undefined;
  onChange: (v: string | boolean) => void;
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
      const opts = ASSIGNEE_OPTIONS;
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
