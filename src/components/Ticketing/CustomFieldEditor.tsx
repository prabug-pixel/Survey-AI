// ============================================================
// CustomFieldEditor — modal used to create or edit a custom
// ticket field. Mirrors the screenshots: a Field name, a type
// dropdown (Text / Long text / Dropdown / Number / Date /
// User / Url), description, dropdown options when the
// type is "Dropdown", and three toggles (Required, Filterable,
// Visible).
// ============================================================
import React, { useEffect, useState } from 'react';
import Modal from '@birdeye/elemental/core/atoms/Modal';
import SingleSelect from '@birdeye/elemental/core/atoms/SingleSelect';
import FormInput from '@birdeye/elemental/core/atoms/FormInput';
import TextArea from '@birdeye/elemental/core/atoms/TextArea';
import Tooltip from '@birdeye/elemental/core/atoms/Tooltip';
import Button from '@birdeye/elemental/core/atoms/Button';
import Checkbox from '../../shared/Checkbox/Checkbox';
import { IconPlus, IconClose, IconInfo } from '../../shared/Icons/Icons';
import { FIELD_TYPE_OPTIONS, MAX_CARD_VISIBLE_FIELDS, useCustomFields } from './CustomFieldsContext';
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
  const { fields } = useCustomFields();
  const [name, setName] = useState('');
  const [type, setType] = useState<CustomFieldType>('text');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<string[]>(blankOptions());
  const [required, setRequired] = useState(false);
  const [filterable, setFilterable] = useState(false);
  const [sortable, setSortable] = useState(false);
  const [visible, setVisible] = useState(false);

  // Count *other* fields currently marked visible so we can disable the
  // toggle once the cap is reached. If we're editing a field that's already
  // visible, that one doesn't count against the cap.
  const otherVisibleCount = fields.reduce(
    (n, f) => n + (f.visible && f.id !== initial?.id ? 1 : 0),
    0,
  );
  const visibleAtCap = !visible && otherVisibleCount >= MAX_CARD_VISIBLE_FIELDS;

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
      setSortable(initial.sortable);
      setVisible(initial.visible);
    } else {
      setName('');
      setType('text');
      setDescription('');
      setOptions(blankOptions());
      setRequired(false);
      setFilterable(false);
      setSortable(false);
      setVisible(false);
    }
  }, [isOpen, initial]);

  const isDropdown = type === 'dropdown' || type === 'multiSelect';
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
      sortable,
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
        // Cap the popup height and clip at that box — the library's
        // default `overflow: initial` on `.content` let long content (e.g.
        // a long Options list) spill outside the dialog box instead of
        // scrolling. The header/footer are fixed flex children; `.body`
        // (see CustomFieldEditor.module.scss) is the one that scrolls,
        // so they stay pinned in place instead of scrolling with it.
        dialogStyles: {
          content: {
            maxHeight: 600,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        },
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
            <label className={styles.optionsLabel}>
              Options
              <Tooltip text="The sort order will be based on the added options." position="top" hideOnScroll>
                <span className={styles.infoIcon} aria-label="More info">
                  <IconInfo size={14} color="#9e9e9e" />
                </span>
              </Tooltip>
            </label>
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

        <div className={styles.checkboxGroup}>
          <div className={styles.checkboxRow}>
            <Checkbox name="cfRequired" checked={required} onChange={setRequired} />
            <span className={styles.checkboxTitle}>
              Required<span className={styles.requiredStar} aria-hidden="true">*</span>
            </span>
          </div>

          <div className={styles.checkboxRow}>
            <Checkbox name="cfFilterable" checked={filterable} onChange={setFilterable} />
            <span className={styles.checkboxTitle}>
              Filterable
              <Tooltip text="Appears in list filters" position="top" hideOnScroll>
                <span className={styles.infoIcon} aria-label="More info">
                  <IconInfo size={14} color="#9e9e9e" />
                </span>
              </Tooltip>
            </span>
          </div>

          <div className={styles.checkboxRow}>
            <Checkbox name="cfSortable" checked={sortable} onChange={setSortable} />
            <span className={styles.checkboxTitle}>
              Sortable
              <Tooltip text="Lets users sort the list by this field" position="top" hideOnScroll>
                <span className={styles.infoIcon} aria-label="More info">
                  <IconInfo size={14} color="#9e9e9e" />
                </span>
              </Tooltip>
            </span>
          </div>

          <div className={styles.checkboxRow}>
            <Checkbox
              name="cfVisible"
              checked={visible}
              disabled={visibleAtCap}
              onChange={setVisible}
            />
            <span className={styles.checkboxTitle}>
              Visible on ticket card
              <Tooltip
                text={visibleAtCap
                  ? `Limit reached — at most ${MAX_CARD_VISIBLE_FIELDS} fields can be shown on the list view ticket card. Hide one to enable this.`
                  : `Show on the right rail of each ticket card in the list view (max ${MAX_CARD_VISIBLE_FIELDS}).`}
                position="top"
                hideOnScroll
              >
                <span className={styles.infoIcon} aria-label="More info">
                  <IconInfo size={14} color="#9e9e9e" />
                </span>
              </Tooltip>
            </span>
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
