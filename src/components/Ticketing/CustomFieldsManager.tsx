// ============================================================
// CustomFieldsManager — Settings > Fields page. Lists every
// custom field that has been defined for tickets and lets the
// user create / edit / remove them. Fields with `visible: true`
// surface on the list-view ticket card right rail (capped at 5).
//
// Uses the shared AeroTable so the table chrome (row height,
// borders, type ramp, sort affordances) stays 1:1 with the Aero
// Design System spec.
// ============================================================
import React, { useMemo, useState } from 'react';
import {
  IconSearch,
  IconEdit,
  IconTrash,
} from '../../shared/Icons/Icons';
import AeroTable from '../../shared/components/AeroTable';
import type { AeroColumn } from '../../shared/components/AeroTable';
import { FIELD_TYPE_LABELS, isCustomField, useCustomFields } from './CustomFieldsContext';
import type { CustomField } from './CustomFieldsContext';
import CustomFieldEditor from './CustomFieldEditor';
import styles from './CustomFieldsManager.module.scss';

// Backpocket: Sample data column was removed from the Fields table.
// Uncomment `sampleFor` below and the matching column entry in `columns`
// to restore it.
//
// const sampleFor = (field: CustomField): string => {
//   switch (field.type) {
//     case 'text':     return 'e.g. Triaged by Prabu';
//     case 'longText': return 'e.g. Investigation notes…';
//     case 'dropdown': return field.options?.[0] ?? '—';
//     case 'number':   return '42';
//     case 'date':     return 'May 28, 2026';
//     case 'checkbox': return 'Yes';
//     case 'user':     return 'Prabu G';
//     default:         return '—';
//   }
// };

const CustomFieldsManager: React.FC = () => {
  const { fields, addField, updateField, removeField } = useCustomFields();
  const [search, setSearch] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<CustomField | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return fields;
    return fields.filter(f =>
      f.name.toLowerCase().includes(q) ||
      (f.description ?? '').toLowerCase().includes(q),
    );
  }, [fields, search]);

  const openCreate = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = (field: CustomField) => {
    setEditing(field);
    setEditorOpen(true);
  };

  const handleSave = (data: Omit<CustomField, 'id' | 'kind'>) => {
    if (editing) {
      updateField(editing.id, data);
    } else {
      addField(data);
    }
    setEditorOpen(false);
  };

  const columns: AeroColumn<CustomField>[] = useMemo(() => [
    {
      key: 'name',
      label: 'Contact field',
      sortable: true,
      sortValue: f => f.name.toLowerCase(),
      render: field => (
        <span className={styles.fieldName}>
          {field.name}
          {isCustomField(field) && <span className={styles.customTag}>Custom</span>}
        </span>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      sortValue: f => FIELD_TYPE_LABELS[f.type],
      render: field => FIELD_TYPE_LABELS[field.type],
    },
    {
      key: 'description',
      label: 'Description',
      render: field => field.description || '—',
    },
    // Backpocket: Sample data column — restore alongside the `sampleFor` helper above.
    // {
    //   key: 'sample',
    //   label: 'Sample data',
    //   render: field => sampleFor(field),
    // },
  ], []);

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <span className={styles.crumbLink}>Ticketing</span>
        <span className={styles.crumbSep}>/</span>
        <span className={styles.crumbCurrent}>Manage custom fields</span>
      </div>

      <div className={styles.titleRow}>
        <h1 className={styles.title}>Manage custom fields</h1>

        <div className={styles.titleActions}>
          <div className={styles.searchBox}>
            <IconSearch size={16} color="#9e9e9e" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search fields"
              aria-label="Search fields"
            />
          </div>
          <button type="button" className={styles.createBtn} onClick={openCreate}>
            Create custom field
          </button>
        </div>
      </div>

      <AeroTable<CustomField>
        ariaLabel="Custom fields"
        columns={columns}
        data={filtered}
        getRowKey={f => f.id}
        flush
        resizable
        emptyTitle="No custom fields yet"
        emptyDescription={<>Click <strong>Create custom field</strong> to add one.</>}
        rowAction={field => {
          const isSystem = field.kind !== 'custom';
          return (
            <>
              <button
                type="button"
                className={styles.rowIconBtn}
                aria-label={`Edit ${field.name}`}
                onClick={() => openEdit(field)}
              >
                <IconEdit size={16} color="#555" />
              </button>
              <button
                type="button"
                className={styles.rowIconBtn}
                aria-label={`Remove ${field.name}`}
                disabled={isSystem}
                title={isSystem ? 'System fields cannot be removed' : undefined}
                onClick={() => removeField(field.id)}
              >
                <IconTrash size={16} color="#555" />
              </button>
            </>
          );
        }}
      />

      <CustomFieldEditor
        isOpen={editorOpen}
        initial={editing}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default CustomFieldsManager;
