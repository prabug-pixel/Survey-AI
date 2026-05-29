// ============================================================
// SlaRulesManager — Settings > SLA page. Implements PRD 1.7:
// configurable SLA timers per source, severity, or both,
// working-days toggle, and an escalation notification target.
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
} from '../../shared/Icons/Icons';
import AeroTable from '../../shared/components/AeroTable';
import type { AeroColumn } from '../../shared/components/AeroTable';
import {
  useCustomFields,
  SEVERITY_COLORS,
} from './CustomFieldsContext';
import type { SlaRule, SeverityLevel } from './CustomFieldsContext';
import styles from './SettingsPages.module.scss';

const SEVERITY_OPTIONS = [
  { value: '',       label: 'Any severity' },
  { value: 'High',   label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low',    label: 'Low' },
];

const ESCALATION_OPTIONS = [
  { value: '',         label: 'No escalation' },
  { value: 'Manager',  label: 'Manager' },
  { value: 'Director', label: 'Director' },
  { value: 'Team lead', label: 'Team lead' },
];

interface EditorState {
  open: boolean;
  initial: SlaRule | null;
}

const SlaRulesManager: React.FC = () => {
  const {
    sources,
    slaRules,
    addSlaRule,
    updateSlaRule,
    removeSlaRule,
  } = useCustomFields();
  const [editor, setEditor] = useState<EditorState>({ open: false, initial: null });

  const sourceLabel = (ids: string[]): string => {
    if (ids.length === 0) return 'All sources';
    return ids.map(id => sources.find(s => s.id === id)?.name ?? '').filter(Boolean).join(', ');
  };

  const slaColumns: AeroColumn<SlaRule>[] = useMemo(() => [
    {
      key: 'name',
      label: 'Rule',
      sortable: true,
      sortValue: r => r.name.toLowerCase(),
      render: rule => <span className={styles.fieldName}>{rule.name}</span>,
    },
    {
      key: 'sources',
      label: 'Sources',
      render: rule => sourceLabel(rule.sourceIds),
    },
    {
      key: 'severity',
      label: 'Severity',
      render: rule => {
        if (!rule.severity) return <span className={styles.mutedCell}>Any</span>;
        const c = SEVERITY_COLORS[rule.severity];
        return (
          <span className={styles.severityCell} style={{ background: c.bg, color: c.fg }}>
            <span className={styles.severityDot} style={{ background: c.dot }} aria-hidden />
            {rule.severity}
          </span>
        );
      },
    },
    {
      key: 'hours',
      label: 'Time to respond',
      sortable: true,
      sortValue: r => r.hours,
      render: rule => `${rule.hours}h ${rule.workingDaysOnly ? '· working days' : '· calendar'}`,
    },
    {
      key: 'escalation',
      label: 'Escalation',
      render: rule =>
        rule.escalation
          ? `${rule.escalation.notify} after ${rule.escalation.afterHours}h`
          : <span className={styles.mutedCell}>—</span>,
    },
    {
      key: 'enabled',
      label: 'Enabled',
      render: rule => (
        <Toggle
          name={`sla-${rule.id}-enabled`}
          checked={rule.enabled}
          roundedToggle
          onChange={() => updateSlaRule(rule.id, { enabled: !rule.enabled })}
        />
      ),
    },
  ], [sources, updateSlaRule]);

  const handleSave = (data: Omit<SlaRule, 'id'>) => {
    if (editor.initial) {
      updateSlaRule(editor.initial.id, data);
    } else {
      addSlaRule(data);
    }
    setEditor({ open: false, initial: null });
  };

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <span className={styles.crumbLink}>Ticketing</span>
        <span className={styles.crumbSep}>/</span>
        <span className={styles.crumbCurrent}>SLA rules</span>
      </div>

      <div className={styles.titleRow}>
        <div>
          <h1 className={styles.title}>SLA rules</h1>
          <p className={styles.subtitle}>
            Configure response-time targets by source and severity. When a ticket breaches its SLA the assignee — and optionally an escalation target — is notified.
          </p>
        </div>
        <button
          type="button"
          className={styles.createBtn}
          onClick={() => setEditor({ open: true, initial: null })}
        >
          Add SLA rule
        </button>
      </div>

      <AeroTable<SlaRule>
        ariaLabel="SLA rules"
        columns={slaColumns}
        data={slaRules}
        getRowKey={r => r.id}
        emptyTitle="No SLA rules yet"
        rowAction={rule => (
          <>
            <button
              type="button"
              className={styles.rowIconBtn}
              aria-label={`Edit ${rule.name}`}
              onClick={() => setEditor({ open: true, initial: rule })}
            >
              <IconEdit size={16} color="#555" />
            </button>
            <button
              type="button"
              className={styles.rowIconBtn}
              aria-label={`Remove ${rule.name}`}
              onClick={() => removeSlaRule(rule.id)}
            >
              <IconTrash size={16} color="#555" />
            </button>
          </>
        )}
      />

      <SlaRuleEditor
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
  initial: SlaRule | null;
  onClose: () => void;
  onSave: (data: Omit<SlaRule, 'id'>) => void;
}

const SlaRuleEditor: React.FC<EditorProps> = ({ isOpen, initial, onClose, onSave }) => {
  const { sources } = useCustomFields();
  const [name, setName] = useState('');
  const [sourceIds, setSourceIds] = useState<string[]>([]);
  const [severity, setSeverity] = useState<'' | SeverityLevel>('');
  const [hours, setHours] = useState<string>('24');
  const [workingDaysOnly, setWorkingDaysOnly] = useState(false);
  const [escalationNotify, setEscalationNotify] = useState<string>('');
  const [escalationAfter, setEscalationAfter] = useState<string>('24');
  const [enabled, setEnabled] = useState(true);

  React.useEffect(() => {
    if (!isOpen) return;
    if (initial) {
      setName(initial.name);
      setSourceIds(initial.sourceIds);
      setSeverity(initial.severity ?? '');
      setHours(String(initial.hours));
      setWorkingDaysOnly(initial.workingDaysOnly);
      setEscalationNotify(initial.escalation?.notify ?? '');
      setEscalationAfter(String(initial.escalation?.afterHours ?? initial.hours));
      setEnabled(initial.enabled);
    } else {
      setName('');
      setSourceIds([]);
      setSeverity('');
      setHours('24');
      setWorkingDaysOnly(false);
      setEscalationNotify('');
      setEscalationAfter('24');
      setEnabled(true);
    }
  }, [isOpen, initial]);

  const toggleSource = (id: string) => {
    setSourceIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const hoursNum = parseInt(hours, 10);
  const isValid = name.trim().length > 0 && Number.isFinite(hoursNum) && hoursNum > 0;

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
      size="mediumLarge"
    >
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>{initial ? 'Edit SLA rule' : 'Add SLA rule'}</h2>
        <button type="button" className={styles.modalClose} aria-label="Close" onClick={onClose}>
          <IconClose size={16} color="#555" />
        </button>
      </div>

      <div className={styles.modalBody}>
        <div className={styles.field}>
          <label className={styles.label}>Rule name</label>
          <FormInput
            name="slaName"
            type="text"
            value={name}
            placeholder="e.g. Executive escalations, Online reviews"
            onChange={(_e: unknown, v: string) => setName(String(v ?? ''))}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Apply to sources</label>
          <div className={styles.chipPicker}>
            <label className={styles.checkRow}>
              <input
                type="checkbox"
                checked={sourceIds.length === 0}
                onChange={() => setSourceIds([])}
              />
              <span>All sources</span>
            </label>
            {sources.map(s => (
              <label key={s.id} className={styles.checkRow}>
                <input
                  type="checkbox"
                  checked={sourceIds.includes(s.id)}
                  onChange={() => toggleSource(s.id)}
                />
                <span>{s.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Severity filter (optional)</label>
          <SingleSelect
            name="slaSeverity"
            displayLabel="Severity"
            options={SEVERITY_OPTIONS}
            selected={severity}
            onChange={(option) => setSeverity(String(option.value) as '' | SeverityLevel)}
            showSearch={false}
            isAeroDesign
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Time to respond (hours)</label>
          <FormInput
            name="slaHours"
            type="number"
            value={hours}
            placeholder="24"
            onChange={(_e: unknown, v: string) => setHours(String(v ?? ''))}
          />
        </div>

        <div className={styles.toggleRow}>
          <div className={styles.toggleText}>
            <span className={styles.toggleTitle}>Working days only</span>
            <span className={styles.toggleHint}>Exclude weekends from the SLA clock</span>
          </div>
          <Toggle
            name="slaWorking"
            checked={workingDaysOnly}
            roundedToggle
            onChange={() => setWorkingDaysOnly(v => !v)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Escalate to (optional)</label>
          <SingleSelect
            name="slaEscalation"
            displayLabel="Escalation target"
            options={ESCALATION_OPTIONS}
            selected={escalationNotify}
            onChange={(option) => setEscalationNotify(String(option.value))}
            showSearch={false}
            isAeroDesign
          />
        </div>

        {escalationNotify && (
          <div className={styles.field}>
            <label className={styles.label}>Escalate after (hours)</label>
            <FormInput
              name="slaEscalationHours"
              type="number"
              value={escalationAfter}
              onChange={(_e: unknown, v: string) => setEscalationAfter(String(v ?? ''))}
            />
          </div>
        )}

        <div className={styles.toggleRow}>
          <div className={styles.toggleText}>
            <span className={styles.toggleTitle}>Enabled</span>
            <span className={styles.toggleHint}>Inactive rules don't fire the SLA clock</span>
          </div>
          <Toggle
            name="slaEnabled"
            checked={enabled}
            roundedToggle
            onChange={() => setEnabled(v => !v)}
          />
        </div>
      </div>

      <div className={styles.modalFooter}>
        <Button theme="secondary" label="Cancel" onClick={onClose} />
        <Button
          theme="primary"
          label={initial ? 'Save changes' : 'Add SLA rule'}
          disabled={!isValid}
          onClick={() => isValid && onSave({
            name: name.trim(),
            sourceIds,
            severity: severity || undefined,
            hours: hoursNum,
            workingDaysOnly,
            escalation: escalationNotify
              ? { notify: escalationNotify, afterHours: parseInt(escalationAfter, 10) || hoursNum }
              : undefined,
            enabled,
          })}
        />
      </div>
    </Modal>
  );
};

export default SlaRulesManager;
