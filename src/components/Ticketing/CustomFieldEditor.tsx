// ============================================================
// CustomFieldEditor — modal used to create or edit a custom
// ticket field. Mirrors the screenshots: a Field name, a type
// dropdown (Text / Long text / Dropdown / Number / Date /
// Checkbox / User), description, dropdown options when the
// type is "Dropdown", and three toggles (Required, Filterable,
// Visible).
// ============================================================
import React, { useEffect, useState } from 'react';
import Modal from '@birdeye/elemental/core/atoms/Modal';
import SingleSelect from '@birdeye/elemental/core/atoms/SingleSelect';
import FormInput from '@birdeye/elemental/core/atoms/FormInput';
import TextArea from '@birdeye/elemental/core/atoms/TextArea';
import Toggle from '@birdeye/elemental/core/atoms/Toggle';
import Button from '@birdeye/elemental/core/atoms/Button';
import { IconPlus, IconClose } from '../../shared/Icons/Icons';
import { FIELD_TYPE_OPTIONS } from './CustomFieldsContext';
import type { CustomField, CustomFieldType } from './CustomFieldsContext';
import styles from './CustomFieldEditor.module.scss';

interface Props {
  isOpen: boolean;
  initial?: CustomField | null;     // when set, the modal acts as an edit form
  onClose: () => void;
  onSave: (data: Omit<CustomField, 'id' | 'kind'>) => void;
}

const blankOptions = (): string[] => ['Option 1', 'Option 2'];

const CustomFieldEditor: React.FC<Props> = ({ isOpen, initial, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<CustomFieldType>('text');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<string[]>(blankOptions());
  const [required, setRequired] = useState(false);
  const [filterable, setFilterable] = useState(false);
  const [visible, setVisible] = useState(true);

  // Sync local state when the modal opens for create vs edit.
  useEffect(() => {
    if (!isOpen) return;
    if (initial) {
      setName(initial.name);
      setType(initial.type);
      setDescription(initial.description ?? '');
      setOptions(initial.options ?? blankOptions());
      setRequired(initial.required);
      setFilterable(initial.filterable);
      setVisible(initial.visible);
    } else {
      setName('');
      setType('text');
      setDescription('');
      setOptions(blankOptions());
      setRequired(false);
      setFilterable(false);
      setVisible(true);
    }
  }, [isOpen, initial]);

  const isDropdown = type === 'dropdown';
  const isValid =
    name.trim().length > 0 &&
    (!isDropdown || options.filter(o => o.trim()).length >= 1);

  const handleSave = () => {
    if (!isValid) return;
    onSave({
      name: name.trim(),
      type,
      description: description.trim() || undefined,
      options: isDropdown ? options.map(o => o.trim()).filter(Boolean) : undefined,
      required,
      filterable,
      visible,
    });
  };

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
      <div className={styles.header}>
        <h2 className={styles.title}>{initial ? 'Edit custom field' : 'Create custom field'}</h2>
        <button type="button" className={styles.closeBtn} aria-label="Close" onClick={onClose}>
          <IconClose size={16} color="#555" />
        </button>
      </div>

      <div className={styles.body}>
        <div className={styles.field}>
          <label className={styles.label}>Field name</label>
          <FormInput
            name="cfName"
            type="text"
            value={name}
            placeholder="e.g. Severity"
            onChange={(_e: unknown, v: string) => setName(String(v ?? ''))}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Field type</label>
          <SingleSelect
            name="cfType"
            displayLabel="Select type"
            options={FIELD_TYPE_OPTIONS}
            selected={type}
            onChange={(option) => setType(String(option.value) as CustomFieldType)}
            showSearch={false}
            isAeroDesign
          />
        </div>

        {isDropdown && (
          <div className={styles.field}>
            <label className={styles.label}>Options</label>
            <div className={styles.options}>
              {options.map((opt, idx) => (
                <div key={idx} className={styles.optionRow}>
                  <div className={styles.optionInput}>
                    <FormInput
                      name={`cfOption-${idx}`}
                      type="text"
                      value={opt}
                      placeholder={`Option ${idx + 1}`}
                      onChange={(_e: unknown, v: string) => {
                        const next = options.slice();
                        next[idx] = String(v ?? '');
                        setOptions(next);
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className={styles.optionRemove}
                    aria-label="Remove option"
                    disabled={options.length <= 1}
                    onClick={() => setOptions(options.filter((_, i) => i !== idx))}
                  >
                    <IconClose size={14} color="#9e9e9e" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className={styles.addOption}
                onClick={() => setOptions([...options, `Option ${options.length + 1}`])}
              >
                <IconPlus size={14} color="#1976d2" />
                <span>Add option</span>
              </button>
            </div>
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.label}>Description (optional)</label>
          <TextArea
            name="cfDescription"
            value={description}
            onChange={(_e: unknown, v: string) => setDescription(String(v ?? ''))}
            placeholder="What is this field used for?"
            rows={2}
            autoSize={false}
            noFloatingLabel
          />
        </div>

        <div className={styles.toggleGroup}>
          <div className={styles.toggleRow}>
            <div className={styles.toggleText}>
              <span className={styles.toggleTitle}>Required</span>
              <span className={styles.toggleHint}>Must be filled before saving</span>
            </div>
            <Toggle
              name="cfRequired"
              checked={required}
              roundedToggle
              onChange={() => setRequired(v => !v)}
            />
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleText}>
              <span className={styles.toggleTitle}>Filterable &amp; sortable</span>
              <span className={styles.toggleHint}>Appears in list filters and sorting</span>
            </div>
            <Toggle
              name="cfFilterable"
              checked={filterable}
              roundedToggle
              onChange={() => setFilterable(v => !v)}
            />
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleText}>
              <span className={styles.toggleTitle}>Visible</span>
              <span className={styles.toggleHint}>Show on the ticket activity panel</span>
            </div>
            <Toggle
              name="cfVisible"
              checked={visible}
              roundedToggle
              onChange={() => setVisible(v => !v)}
            />
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <Button theme="secondary" label="Cancel" onClick={onClose} />
        <Button
          theme="primary"
          label={initial ? 'Save changes' : 'Save field'}
          disabled={!isValid}
          onClick={handleSave}
        />
      </div>
    </Modal>
  );
};

export default CustomFieldEditor;
