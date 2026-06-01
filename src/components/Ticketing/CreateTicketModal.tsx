// ============================================================
// CreateTicketModal — opens from the "Create ticket" button in
// the ticketing landing header.
//
// Every field rendered here comes from useCustomFields().fields,
// which is the same source of truth Settings > Fields manages.
// Adding, editing, hiding, or reordering a field in Settings is
// reflected immediately in this modal — and nothing is hardcoded
// here that can drift from Settings.
// ============================================================
import React, { useEffect, useMemo, useState } from 'react';
import Modal from '@birdeye/elemental/core/atoms/Modal';
import SingleSelect from '@birdeye/elemental/core/atoms/SingleSelect';
import FormInput from '@birdeye/elemental/core/atoms/FormInput';
import TextArea from '@birdeye/elemental/core/atoms/TextArea';
import Button from '@birdeye/elemental/core/atoms/Button';
import { IconClose } from '../../shared/Icons/Icons';
import {
  useCustomFields,
  FIELD_SECTION_LABELS,
  FIELD_SECTION_ORDER,
} from './CustomFieldsContext';
import type { CustomField, FieldSection } from './CustomFieldsContext';
import styles from './CreateTicketModal.module.scss';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: TicketDraftValues) => void;
}

/** Values keyed by CustomField.id — mirrors TicketRecord.customValues. */
export type TicketDraftValues = Record<string, string | boolean>;

// User-picker options. Activity modal already uses the same shape, so
// kind='user' fields render against this list in both places.
const ASSIGNEE_OPTIONS = [
  { value: 'prabu',     label: 'prabu G' },
  { value: 'abhinav',   label: 'Abhinav R.' },
  { value: 'priyanshi', label: 'Priyanshi' },
  { value: 'sahil',     label: 'Sahil Gupta' },
];

const CreateTicketModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const { fields } = useCustomFields();

  // The `visible` flag now controls the list-view card rail, not this modal.
  // Date/Watchers are auto-managed meta and aren't user-fillable, so they're
  // dropped from the form. Everything else surfaces here so admins can fill
  // any configured field at create time.
  const visibleFields = useMemo(
    () => fields.filter(f => f.kind !== 'date' && f.kind !== 'watchers'),
    [fields],
  );

  const [values, setValues] = useState<TicketDraftValues>({});

  // Reset on open. New tickets start blank — defaults are managed in
  // Settings (we don't pre-fill from anywhere else).
  useEffect(() => {
    if (isOpen) setValues({});
  }, [isOpen]);

  const setValue = (id: string, v: string | boolean) =>
    setValues(prev => ({ ...prev, [id]: v }));

  // Required-field check, derived directly from the shared config.
  const isValid = useMemo(() => {
    for (const f of visibleFields) {
      if (!f.required) continue;
      const v = values[f.id];
      if (f.type === 'checkbox') {
        if (v !== true) return false;
      } else if (typeof v !== 'string' || !v.trim()) {
        return false;
      }
    }
    return true;
  }, [visibleFields, values]);

  // Group visible fields by section, preserving the order admins set
  // in Settings. Sections with no visible fields are skipped.
  const grouped = useMemo(() => {
    const map = new Map<FieldSection, CustomField[]>();
    for (const section of FIELD_SECTION_ORDER) map.set(section, []);
    for (const f of visibleFields) {
      const arr = map.get(f.section) ?? [];
      arr.push(f);
      map.set(f.section, arr);
    }
    return FIELD_SECTION_ORDER
      .map(section => ({ section, fields: map.get(section) ?? [] }))
      .filter(g => g.fields.length > 0);
  }, [visibleFields]);

  return (
    <Modal
      dialogOptions={{
        isOpen,
        title: '',
        showCloseIcon: false,
        onCloseModal: onClose,
        shouldCloseOnOverlayClick: true,
        shouldCloseOnEsc: true,
        dialogStyles: {
          content: {
            maxWidth: 640,
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
      size="medium"
    >
      <div className={styles.header}>
        <h2 className={styles.title}>Create ticket</h2>
        <button type="button" className={styles.closeBtn} aria-label="Close" onClick={onClose}>
          <IconClose size={16} color="#555" />
        </button>
      </div>

      <div className={styles.body}>
        {grouped.map(({ section, fields: sectionFields }) => (
          <section key={section} className={styles.section}>
            <h3 className={styles.sectionLabel}>{FIELD_SECTION_LABELS[section]}</h3>
            <div className={styles.grid}>
              {sectionFields.map(field => (
                <FieldRow
                  key={field.id}
                  field={field}
                  value={values[field.id]}
                  onChange={v => setValue(field.id, v)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className={styles.footer}>
        <Button theme="secondary" label="Cancel" onClick={onClose} />
        <Button
          theme="primary"
          label="Save"
          disabled={!isValid}
          onClick={() => isValid && onSave(values)}
        />
      </div>
    </Modal>
  );
};

// ── Field row ──────────────────────────────────────────────
// Renders a single configured field. Layout rule: longText fields and
// checkboxes span the full row; everything else fits the 2-col grid.
interface FieldRowProps {
  field: CustomField;
  value: string | boolean | undefined;
  onChange: (v: string | boolean) => void;
}

const FieldRow: React.FC<FieldRowProps> = ({ field, value, onChange }) => {
  const isFullWidth = field.type === 'longText' || field.type === 'checkbox';

  if (field.type === 'checkbox') {
    return (
      <div className={`${styles.field} ${styles.fieldFull}`}>
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
  }

  return (
    <div className={`${styles.field} ${isFullWidth ? styles.fieldFull : ''}`}>
      <label className={styles.fieldLabel}>
        {field.name}
        {field.required && <span className={styles.requiredStar}> *</span>}
      </label>
      {renderControl(field, value, onChange)}
    </div>
  );
};

const renderControl = (
  field: CustomField,
  value: string | boolean | undefined,
  onChange: (v: string | boolean) => void,
) => {
  switch (field.type) {
    case 'dropdown': {
      const opts = (field.options ?? []).map(o => ({ value: o, label: o }));
      return (
        <SingleSelect
          name={`new-${field.id}`}
          displayLabel={field.name}
          options={opts}
          selected={typeof value === 'string' ? value : ''}
          onChange={(option) => onChange(String(option.value))}
          showSearch={false}
          isAeroDesign
        />
      );
    }
    case 'user':
      return (
        <SingleSelect
          name={`new-${field.id}`}
          displayLabel={field.name}
          options={ASSIGNEE_OPTIONS}
          selected={typeof value === 'string' ? value : ''}
          onChange={(option) => onChange(String(option.value))}
          showSearch={false}
          isAeroDesign
        />
      );
    case 'longText':
      return (
        <TextArea
          name={`new-${field.id}`}
          value={typeof value === 'string' ? value : ''}
          onChange={(_e: unknown, v: string) => onChange(String(v ?? ''))}
          placeholder={field.description ?? ''}
          rows={4}
          autoSize={false}
          noFloatingLabel
        />
      );
    case 'number':
    case 'date':
    case 'text':
    default:
      return (
        <FormInput
          name={`new-${field.id}`}
          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
          value={typeof value === 'string' ? value : ''}
          placeholder={field.description ?? ''}
          onChange={(_e: unknown, v: string) => onChange(String(v ?? ''))}
        />
      );
  }
};

export default CreateTicketModal;
