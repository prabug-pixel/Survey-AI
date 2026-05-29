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
import React, { useState } from 'react';
import Modal from '@birdeye/elemental/core/atoms/Modal';
import SingleSelect from '@birdeye/elemental/core/atoms/SingleSelect';
import FormInput from '@birdeye/elemental/core/atoms/FormInput';
import TextArea from '@birdeye/elemental/core/atoms/TextArea';
import Button from '@birdeye/elemental/core/atoms/Button';
import {
  IconClose,
  IconMoreVert,
  IconExternalLink,
  IconCalendar,
  IconLocation,
  IconBulb,
} from '../../shared/Icons/Icons';
import { useCustomFields, SEVERITY_COLORS } from './CustomFieldsContext';
import type { CustomField, SeverityLevel } from './CustomFieldsContext';
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
  const [assignee, setAssignee] = useState<string>('abhinav');
  const [comment, setComment] = useState('');

  // Custom fields configured under Settings > Fields. Only the ones the
  // admin marked visible appear on the activity panel. Values are kept
  // locally keyed by field id; a real implementation would persist per
  // ticket, but the structure is the same.
  const { fields: customFields } = useCustomFields();
  const visibleCustomFields = customFields.filter(f => f.visible);
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
      }}
      size="mediumLarge"
    >
      {/* ── Header bar ───────────────────────────────────── */}
      <div className={styles.headerBar}>
        <div className={styles.headerTitleGroup}>
          <span className={styles.ticketId}>Ticket #{ticket.id}</span>
          {customValues['cf-severity'] && (
            <span
              className={styles.severityPill}
              style={{
                background: SEVERITY_COLORS[customValues['cf-severity'] as SeverityLevel].bg,
                color: SEVERITY_COLORS[customValues['cf-severity'] as SeverityLevel].fg,
              }}
            >
              <span
                className={styles.severityPillDot}
                style={{ background: SEVERITY_COLORS[customValues['cf-severity'] as SeverityLevel].dot }}
                aria-hidden
              />
              {String(customValues['cf-severity'])}
            </span>
          )}
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.iconBtn} aria-label="Open in new tab">
            <IconExternalLink size={16} color="#555" />
          </button>
          <button type="button" className={styles.iconBtn} aria-label="More options">
            <IconMoreVert size={18} color="#555" />
          </button>
          <button type="button" className={styles.iconBtn} aria-label="Close" onClick={onClose}>
            <IconClose size={16} color="#555" />
          </button>
        </div>
      </div>

      {/* Ticket head sits above the two-column body so the main and side
         rail both start at the same Y — keeps "ASSIGNMENT" aligned with
         the body text rather than the icon. */}
      <div className={styles.ticketHead}>
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

            <div className={styles.sideField}>
              <label className={styles.sideFieldLabel}>Assignee</label>
              <SingleSelect
                name="ticketAssignee"
                displayLabel="Assignee"
                options={ASSIGNEE_OPTIONS}
                selected={assignee}
                onChange={(option) => setAssignee(String(option.value))}
                showSearch={false}
                isAeroDesign
              />
            </div>

            <div className={styles.sideField}>
              <label className={styles.sideFieldLabel}>Watchers</label>
              <div className={styles.watcherRow}>
                {ticket.watcherInitials && (
                  <span className={`${styles.miniAvatar} ${styles['tone-blue']}`}>
                    {ticket.watcherInitials}
                  </span>
                )}
                <div className={styles.watcherInput}>
                  <FormInput
                    name="ticketWatchers"
                    type="text"
                    value=""
                    placeholder="Add watchers"
                    onChange={() => undefined}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.sideGroup}>
            <h4 className={styles.sideGroupLabel}>Details</h4>

            <div className={styles.sideField}>
              <label className={styles.sideFieldLabel}>Location</label>
              <div className={styles.staticField}>
                <IconLocation size={14} color="#9e9e9e" />
                <span>{ticket.location}</span>
              </div>
            </div>

            <div className={styles.sideField}>
              <label className={styles.sideFieldLabel}>Channel</label>
              <div className={styles.staticField}>
                <IconBulb size={14} color="#fbc02d" />
                <span>{ticket.channel}</span>
              </div>
            </div>

            {ticket.dueOn && (
              <div className={styles.sideField}>
                <label className={styles.sideFieldLabel}>Due date</label>
                <div className={styles.staticField}>
                  <IconCalendar size={14} color="#9e9e9e" />
                  <span>{ticket.dueOn}</span>
                </div>
              </div>
            )}

            <div className={styles.sideField}>
              <label className={styles.sideFieldLabel}>Created</label>
              <div className={styles.staticFieldPlain}>{ticket.createdOn}</div>
            </div>
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
    case 'number':
    case 'date':
    case 'text':
    default:
      return (
        <div className={styles.sideField}>
          {label}
          <FormInput
            name={`cf-${field.id}`}
            type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
            value={typeof value === 'string' ? value : ''}
            placeholder={field.description ?? ''}
            onChange={(_e: unknown, v: string) => onChange(String(v ?? ''))}
          />
        </div>
      );
  }
};

export default TicketActivityModal;
