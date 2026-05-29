// ============================================================
// AssignmentRulesManager — Settings > Assignment page.
// Implements PRD 1.4: round-robin auto-assignment with multi-
// select pool of agents / teams / roles. Manual override is
// always available on the ticket; that lives elsewhere.
// ============================================================
import React, { useMemo, useState } from 'react';
import Modal from '@birdeye/elemental/core/atoms/Modal';
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
import { useCustomFields } from './CustomFieldsContext';
import type { AssignmentRule, AssignmentTarget, AssignmentTargetType } from './CustomFieldsContext';
import styles from './SettingsPages.module.scss';

// Mock directories — in production these come from the user store.
const AGENT_POOL: AssignmentTarget[] = [
  { type: 'agent', id: 'u-abhinav', name: 'Abhinav R.' },
  { type: 'agent', id: 'u-priyanshi', name: 'Priyanshi' },
  { type: 'agent', id: 'u-sahil', name: 'Sahil Gupta' },
  { type: 'agent', id: 'u-prabu', name: 'Prabu G' },
];

const TEAM_POOL: AssignmentTarget[] = [
  { type: 'team', id: 'team-social', name: 'Social media team' },
  { type: 'team', id: 'team-gmb', name: 'GMB team' },
  { type: 'team', id: 'team-exec', name: 'Executive resolution team' },
];

const ROLE_POOL: AssignmentTarget[] = [
  { type: 'role', id: 'role-agent', name: 'Agent' },
  { type: 'role', id: 'role-manager', name: 'Manager' },
  { type: 'role', id: 'role-director', name: 'Director' },
];

const TARGET_DOTS: Record<AssignmentTargetType, string> = {
  agent: '#1976d2',
  team: '#2e7d32',
  role: '#7b1fa2',
};

interface EditorState {
  open: boolean;
  initial: AssignmentRule | null;
}

const AssignmentRulesManager: React.FC = () => {
  const {
    sources,
    assignmentRules,
    addAssignmentRule,
    updateAssignmentRule,
    removeAssignmentRule,
  } = useCustomFields();
  const [editor, setEditor] = useState<EditorState>({ open: false, initial: null });

  const handleSave = (data: Omit<AssignmentRule, 'id'>) => {
    if (editor.initial) {
      updateAssignmentRule(editor.initial.id, data);
    } else {
      addAssignmentRule(data);
    }
    setEditor({ open: false, initial: null });
  };

  const sourceLabel = (ids: string[]): string => {
    if (ids.length === 0) return 'All sources';
    return ids
      .map(id => sources.find(s => s.id === id)?.name ?? '')
      .filter(Boolean)
      .join(', ');
  };

  const assignmentColumns: AeroColumn<AssignmentRule>[] = useMemo(() => [
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
      key: 'pool',
      label: 'Pool',
      render: rule => (
        <span>
          {rule.pool.map(p => (
            <span key={`${p.type}-${p.id}`} className={styles.poolTag}>
              <span
                className={styles.poolTagDot}
                style={{ background: TARGET_DOTS[p.type] }}
                aria-hidden
              />
              {p.name}
            </span>
          ))}
        </span>
      ),
    },
    {
      key: 'enabled',
      label: 'Enabled',
      render: rule => (
        <Toggle
          name={`asg-${rule.id}-enabled`}
          checked={rule.enabled}
          roundedToggle
          onChange={() => updateAssignmentRule(rule.id, { enabled: !rule.enabled })}
        />
      ),
    },
  ], [sources, updateAssignmentRule]);

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <span className={styles.crumbLink}>Ticketing</span>
        <span className={styles.crumbSep}>/</span>
        <span className={styles.crumbCurrent}>Assignment rules</span>
      </div>

      <div className={styles.titleRow}>
        <div>
          <h1 className={styles.title}>Assignment rules</h1>
          <p className={styles.subtitle}>
            Round-robin tickets across a pool of agents, teams, or roles. The member idle the longest takes the next ticket. Managers can still reassign manually.
          </p>
        </div>
        <button
          type="button"
          className={styles.createBtn}
          onClick={() => setEditor({ open: true, initial: null })}
        >
          Add rule
        </button>
      </div>

      <AeroTable<AssignmentRule>
        ariaLabel="Assignment rules"
        columns={assignmentColumns}
        data={assignmentRules}
        getRowKey={r => r.id}
        emptyTitle="No assignment rules yet"
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
              onClick={() => removeAssignmentRule(rule.id)}
            >
              <IconTrash size={16} color="#555" />
            </button>
          </>
        )}
      />

      <AssignmentRuleEditor
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
  initial: AssignmentRule | null;
  onClose: () => void;
  onSave: (data: Omit<AssignmentRule, 'id'>) => void;
}

const AssignmentRuleEditor: React.FC<EditorProps> = ({ isOpen, initial, onClose, onSave }) => {
  const { sources } = useCustomFields();
  const [name, setName] = useState('');
  const [sourceIds, setSourceIds] = useState<string[]>([]);
  const [pool, setPool] = useState<AssignmentTarget[]>([]);
  const [enabled, setEnabled] = useState(true);

  React.useEffect(() => {
    if (!isOpen) return;
    if (initial) {
      setName(initial.name);
      setSourceIds(initial.sourceIds);
      setPool(initial.pool);
      setEnabled(initial.enabled);
    } else {
      setName('');
      setSourceIds([]);
      setPool([]);
      setEnabled(true);
    }
  }, [isOpen, initial]);

  const toggleSource = (id: string) => {
    setSourceIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const togglePool = (target: AssignmentTarget) => {
    setPool(prev => {
      const exists = prev.some(p => p.type === target.type && p.id === target.id);
      return exists
        ? prev.filter(p => !(p.type === target.type && p.id === target.id))
        : [...prev, target];
    });
  };

  const inPool = (target: AssignmentTarget) =>
    pool.some(p => p.type === target.type && p.id === target.id);

  const isValid = name.trim().length > 0 && pool.length > 0;

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
        <h2 className={styles.modalTitle}>{initial ? 'Edit assignment rule' : 'Add assignment rule'}</h2>
        <button type="button" className={styles.modalClose} aria-label="Close" onClick={onClose}>
          <IconClose size={16} color="#555" />
        </button>
      </div>

      <div className={styles.modalBody}>
        <div className={styles.field}>
          <label className={styles.label}>Rule name</label>
          <FormInput
            name="ruleName"
            type="text"
            value={name}
            placeholder="e.g. Social team round robin"
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
          <label className={styles.label}>Round-robin pool</label>
          <div className={styles.chipPicker}>
            <div className={styles.poolGroupTitle}>Teams</div>
            {TEAM_POOL.map(t => (
              <label key={t.id} className={styles.checkRow}>
                <input type="checkbox" checked={inPool(t)} onChange={() => togglePool(t)} />
                <span>{t.name}</span>
              </label>
            ))}
            <div className={styles.poolGroupTitle}>Roles</div>
            {ROLE_POOL.map(r => (
              <label key={r.id} className={styles.checkRow}>
                <input type="checkbox" checked={inPool(r)} onChange={() => togglePool(r)} />
                <span>{r.name}</span>
              </label>
            ))}
            <div className={styles.poolGroupTitle}>Individual agents</div>
            {AGENT_POOL.map(a => (
              <label key={a.id} className={styles.checkRow}>
                <input type="checkbox" checked={inPool(a)} onChange={() => togglePool(a)} />
                <span>{a.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.toggleRow}>
          <div className={styles.toggleText}>
            <span className={styles.toggleTitle}>Enabled</span>
            <span className={styles.toggleHint}>Inactive rules won't auto-assign new tickets</span>
          </div>
          <Toggle
            name="ruleEnabled"
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
          label={initial ? 'Save changes' : 'Add rule'}
          disabled={!isValid}
          onClick={() => isValid && onSave({
            name: name.trim(),
            sourceIds,
            pool,
            enabled,
          })}
        />
      </div>
    </Modal>
  );
};

export default AssignmentRulesManager;
