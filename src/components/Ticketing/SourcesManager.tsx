// ============================================================
// SourcesManager — Settings > Sources page. Demonstrates PRD
// 1.1 (custom configurable sources beyond a fixed enum) and
// 1.5 (email-channel sources expose an inbound address that
// AmeriGas IT forwards their Outlook mailboxes to).
// ============================================================
import React, { useMemo, useState } from 'react';
import Modal from '@birdeye/elemental/core/atoms/Modal';
import SingleSelect from '@birdeye/elemental/core/atoms/SingleSelect';
import FormInput from '@birdeye/elemental/core/atoms/FormInput';
import Toggle from '@birdeye/elemental/core/atoms/Toggle';
import Button from '@birdeye/elemental/core/atoms/Button';
import {
  IconEdit,
  IconTrash,
  IconClose,
  IconCopy,
} from '../../shared/Icons/Icons';
import AeroTable from '../../shared/components/AeroTable';
import type { AeroColumn } from '../../shared/components/AeroTable';
import {
  useCustomFields,
  SOURCE_CHANNEL_LABELS,
  SOURCE_CHANNEL_OPTIONS,
} from './CustomFieldsContext';
import type { TicketSource, SourceChannel } from './CustomFieldsContext';
import styles from './SettingsPages.module.scss';

const emailFromName = (name: string): string => {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${slug || 'inbox'}@inbound.birdeye.com`;
};

interface EditorState {
  open: boolean;
  initial: TicketSource | null;
}

const SourcesManager: React.FC = () => {
  const { sources, addSource, updateSource, removeSource } = useCustomFields();
  const [editor, setEditor] = useState<EditorState>({ open: false, initial: null });

  const handleSave = (data: Omit<TicketSource, 'id'>) => {
    if (editor.initial) {
      updateSource(editor.initial.id, data);
    } else {
      addSource(data);
    }
    setEditor({ open: false, initial: null });
  };

  const columns: AeroColumn<TicketSource>[] = useMemo(() => [
    {
      key: 'name',
      label: 'Source',
      sortable: true,
      sortValue: s => s.name.toLowerCase(),
      render: src => <span className={styles.fieldName}>{src.name}</span>,
    },
    {
      key: 'channel',
      label: 'Channel',
      sortable: true,
      sortValue: s => SOURCE_CHANNEL_LABELS[s.channel],
      render: src => SOURCE_CHANNEL_LABELS[src.channel],
    },
    {
      key: 'inbound',
      label: 'Inbound email',
      render: src =>
        src.channel === 'email' && src.inboundEmail ? (
          <span className={styles.emailPill}>
            <code>{src.inboundEmail}</code>
            <button
              type="button"
              className={styles.copyBtn}
              aria-label="Copy email"
              onClick={() => navigator.clipboard?.writeText(src.inboundEmail!)}
            >
              <IconCopy size={14} color="#555" />
            </button>
          </span>
        ) : (
          <span className={styles.mutedCell}>—</span>
        ),
    },
    {
      key: 'autoCreate',
      label: 'Auto-create',
      render: src => (src.autoCreate ? 'Yes' : 'No'),
    },
  ], []);

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <span className={styles.crumbLink}>Ticketing</span>
        <span className={styles.crumbSep}>/</span>
        <span className={styles.crumbCurrent}>Sources</span>
      </div>

      <div className={styles.titleRow}>
        <div>
          <h1 className={styles.title}>Sources</h1>
          <p className={styles.subtitle}>
            Configure channels that can create tickets — social, reviews, surveys, and forwarded email inboxes.
          </p>
        </div>
        <button
          type="button"
          className={styles.createBtn}
          onClick={() => setEditor({ open: true, initial: null })}
        >
          Add source
        </button>
      </div>

      <AeroTable<TicketSource>
        ariaLabel="Sources"
        columns={columns}
        data={sources}
        getRowKey={s => s.id}
        resizable
        emptyTitle="No sources yet"
        rowAction={src => (
          <>
            <button
              type="button"
              className={styles.rowIconBtn}
              aria-label={`Edit ${src.name}`}
              onClick={() => setEditor({ open: true, initial: src })}
            >
              <IconEdit size={16} color="#555" />
            </button>
            <button
              type="button"
              className={styles.rowIconBtn}
              aria-label={`Remove ${src.name}`}
              onClick={() => removeSource(src.id)}
            >
              <IconTrash size={16} color="#555" />
            </button>
          </>
        )}
      />

      <SourceEditor
        isOpen={editor.open}
        initial={editor.initial}
        onClose={() => setEditor({ open: false, initial: null })}
        onSave={handleSave}
      />
    </div>
  );
};

// ── Editor modal ───────────────────────────────────────────
interface EditorProps {
  isOpen: boolean;
  initial: TicketSource | null;
  onClose: () => void;
  onSave: (data: Omit<TicketSource, 'id'>) => void;
}

const SourceEditor: React.FC<EditorProps> = ({ isOpen, initial, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<SourceChannel>('custom');
  const [inboundEmail, setInboundEmail] = useState('');
  const [autoCreate, setAutoCreate] = useState(true);

  React.useEffect(() => {
    if (!isOpen) return;
    if (initial) {
      setName(initial.name);
      setChannel(initial.channel);
      setInboundEmail(initial.inboundEmail ?? '');
      setAutoCreate(initial.autoCreate);
    } else {
      setName('');
      setChannel('custom');
      setInboundEmail('');
      setAutoCreate(true);
    }
  }, [isOpen, initial]);

  // Auto-generate an inbound address as the admin types the name, so
  // PRD 1.5 (forward Outlook → Birdeye inbound) is obvious. They can
  // still edit the slug if they need to.
  React.useEffect(() => {
    if (channel === 'email' && !inboundEmail && name) {
      setInboundEmail(emailFromName(name));
    }
  }, [channel, name, inboundEmail]);

  const isValid = name.trim().length > 0;

  return (
    <Modal
      dialogOptions={{
        isOpen,
        title: '',
        showCloseIcon: false,
        onCloseModal: onClose,
        shouldCloseOnOverlayClick: true,
        shouldCloseOnEsc: true,
      }}
      size="medium"
    >
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>{initial ? 'Edit source' : 'Add source'}</h2>
        <button type="button" className={styles.modalClose} aria-label="Close" onClick={onClose}>
          <IconClose size={16} color="#555" />
        </button>
      </div>

      <div className={styles.modalBody}>
        <div className={styles.field}>
          <label className={styles.label}>Source name</label>
          <FormInput
            name="srcName"
            type="text"
            value={name}
            placeholder="e.g. Social inbox, Executive escalation"
            onChange={(_e: unknown, v: string) => setName(String(v ?? ''))}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Channel</label>
          <SingleSelect
            name="srcChannel"
            displayLabel="Channel"
            options={SOURCE_CHANNEL_OPTIONS}
            selected={channel}
            onChange={(option) => setChannel(String(option.value) as SourceChannel)}
            showSearch={false}
            isAeroDesign
          />
        </div>

        {channel === 'email' && (
          <div className={styles.field}>
            <label className={styles.label}>Inbound email address</label>
            <FormInput
              name="srcInbound"
              type="text"
              value={inboundEmail}
              placeholder="auto-generated"
              onChange={(_e: unknown, v: string) => setInboundEmail(String(v ?? ''))}
            />
            <p className={styles.helpText}>
              Forward your Outlook mailbox to this address. Every email becomes a ticket on this source.
            </p>
          </div>
        )}

        <div className={styles.toggleRow}>
          <div className={styles.toggleText}>
            <span className={styles.toggleTitle}>Auto-create tickets</span>
            <span className={styles.toggleHint}>Incoming items on this channel become tickets automatically</span>
          </div>
          <Toggle
            name="srcAuto"
            checked={autoCreate}
            roundedToggle
            onChange={() => setAutoCreate(v => !v)}
          />
        </div>
      </div>

      <div className={styles.modalFooter}>
        <Button theme="secondary" label="Cancel" onClick={onClose} />
        <Button
          theme="primary"
          label={initial ? 'Save changes' : 'Add source'}
          disabled={!isValid}
          onClick={() => isValid && onSave({
            name: name.trim(),
            channel,
            inboundEmail: channel === 'email' ? inboundEmail.trim() : undefined,
            autoCreate,
          })}
        />
      </div>
    </Modal>
  );
};

export default SourcesManager;
