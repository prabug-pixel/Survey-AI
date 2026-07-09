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
import React, { useMemo, useRef, useState } from 'react';
import {
  IconSearch,
  IconEdit,
  IconTrash,
  IconMoreVert,
  IconTool,
} from '../../shared/Icons/Icons';
import AeroTable from '../../shared/components/AeroTable';
import AeroBanner from '../../shared/components/AeroBanner';
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

const DragHandle: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className={styles.dragHandleIcon}>
    <circle cx="9"  cy="5"  r="1.5" fill="#bbb" />
    <circle cx="15" cy="5"  r="1.5" fill="#bbb" />
    <circle cx="9"  cy="12" r="1.5" fill="#bbb" />
    <circle cx="15" cy="12" r="1.5" fill="#bbb" />
    <circle cx="9"  cy="19" r="1.5" fill="#bbb" />
    <circle cx="15" cy="19" r="1.5" fill="#bbb" />
  </svg>
);

const CustomFieldsManager: React.FC = () => {
  const {
    fields,
    addField,
    updateField,
    removeField,
    tableColumnOrder,
    reorderTableColumns,
  } = useCustomFields();
  const [search, setSearch] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<CustomField | null>(null);

  // ── "More" dropdown ───────────────────────────────────────
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  // ── Rearrange mode ─────────────────────────────────────────
  const [rearrangeMode, setRearrangeMode] = useState(false);
  const [rearrangeOrder, setRearrangeOrder] = useState<CustomField[]>([]);
  // Snapshot of the order at the moment rearrange was opened — used by Restore Defaults.
  const savedOrderRef = useRef<CustomField[]>([]);
  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const enterRearrange = () => {
    const fieldById = new Map(fields.map(f => [f.id, f]));
    const ordered = tableColumnOrder
      .map(id => fieldById.get(id))
      .filter((f): f is CustomField => Boolean(f));
    const inOrder = new Set(tableColumnOrder);
    fields.forEach(f => { if (!inOrder.has(f.id)) ordered.push(f); });
    savedOrderRef.current = ordered;
    setRearrangeOrder(ordered);
    setRearrangeMode(true);
    setMoreMenuOpen(false);
  };

  const saveRearrange = () => {
    reorderTableColumns(rearrangeOrder.map(f => f.id));
    setRearrangeMode(false);
  };

  const restoreDefaults = () => {
    setRearrangeOrder([...savedOrderRef.current]);
  };


  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    dragIndexRef.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent<HTMLTableRowElement>, dropIndex: number) => {
    e.preventDefault();
    const fromIndex = dragIndexRef.current;
    if (fromIndex === null || fromIndex === dropIndex) {
      setDragOverIndex(null);
      return;
    }
    const next = [...rearrangeOrder];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(dropIndex, 0, moved);
    setRearrangeOrder(next);
    dragIndexRef.current = null;
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    dragIndexRef.current = null;
    setDragOverIndex(null);
  };

  // Apply the user's saved column order then filter by search query.
  const filtered = useMemo(() => {
    const fieldById = new Map(fields.map(f => [f.id, f]));
    const ordered = tableColumnOrder
      .map(id => fieldById.get(id))
      .filter((f): f is CustomField => Boolean(f));
    // Append any fields not yet in the saved order (e.g. newly added).
    const inOrder = new Set(tableColumnOrder);
    fields.forEach(f => { if (!inOrder.has(f.id)) ordered.push(f); });

    const q = search.trim().toLowerCase();
    if (!q) return ordered;
    return ordered.filter(f =>
      f.name.toLowerCase().includes(q) ||
      (f.description ?? '').toLowerCase().includes(q),
    );
  }, [fields, tableColumnOrder, search]);

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
          {isCustomField(field) && (
            <span className={styles.customIcon} title="Custom field">
              <IconTool />
            </span>
          )}
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
    <div className={styles.pageShell}>
      <div className={styles.page}>
        <div className={styles.stickyHeader}>
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
            <div className={styles.moreDropdown}>
              <button
                type="button"
                className={`${styles.moreBtn} ${moreMenuOpen ? styles.moreBtnActive : ''}`}
                aria-haspopup="true"
                aria-expanded={moreMenuOpen}
                onClick={() => setMoreMenuOpen(o => !o)}
              >
                <IconMoreVert size={16} color="#555" />
              </button>
              {moreMenuOpen && (
                <div className={styles.moreMenu} role="menu">
                  <button
                    type="button"
                    role="menuitem"
                    className={styles.moreMenuItem}
                    onClick={enterRearrange}
                  >
                    Rearrange list rows
                  </button>
                </div>
              )}
            </div>
            <button type="button" className={styles.createBtn} onClick={openCreate}>
              Create custom field
            </button>
          </div>
        </div>
        </div>{/* end stickyHeader */}

        {rearrangeMode && (
          <div className={styles.bannerWrapper}>
            <AeroBanner
              variant="info"
              message="Drag and reorder rows to set their priority. Changes will apply to activities across all tickets."
              button1Label="Restore defaults"
              onButton1={restoreDefaults}
              button2Label="Save"
              onButton2={saveRearrange}
            />
          </div>
        )}

        <div className={styles.scrollBody}>
          {rearrangeMode ? (
            <table className={styles.rearrangeTable} aria-label="Rearrange fields">
              <thead className={styles.rearrangeThead}>
                <tr>
                  <th className={styles.rearrangeThHandle} />
                  <th className={styles.rearrangeTh}>Contact field</th>
                  <th className={styles.rearrangeTh}>Type</th>
                  <th className={styles.rearrangeTh}>Description</th>
                </tr>
              </thead>
              <tbody>
                {rearrangeOrder.map((field, index) => (
                  <tr
                    key={field.id}
                    className={`${styles.rearrangeRow} ${dragOverIndex === index ? styles.rearrangeRowOver : ''}`}
                    draggable
                    onDragStart={e => handleDragStart(e, index)}
                    onDragOver={e => handleDragOver(e, index)}
                    onDrop={e => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    <td className={styles.rearrangeTdHandle}>
                      <DragHandle />
                    </td>
                    <td className={styles.rearrangeTd}>
                      <span className={styles.fieldName}>
                        {field.name}
                        {isCustomField(field) && (
            <span className={styles.customIcon} title="Custom field">
              <IconTool />
            </span>
          )}
                      </span>
                    </td>
                    <td className={styles.rearrangeTd}>{FIELD_TYPE_LABELS[field.type]}</td>
                    <td className={styles.rearrangeTd}>{field.description || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
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
          )}
        </div>{/* end scrollBody */}

        <CustomFieldEditor
          isOpen={editorOpen}
          initial={editing}
          onClose={() => setEditorOpen(false)}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default CustomFieldsManager;
