import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconSearch, IconArrowLeft } from '../../shared/Icons/Icons';
import { FIELD_SECTION_LABELS, useCustomFields } from './CustomFieldsContext';
import type { CustomField } from './CustomFieldsContext';
import styles from './TableCustomizerDrawer.module.scss';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const DragHandle: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className={styles.dragHandleIcon}>
    <circle cx="9" cy="5"  r="1.5" fill="#555555" />
    <circle cx="15" cy="5" r="1.5" fill="#555555" />
    <circle cx="9" cy="12"  r="1.5" fill="#555555" />
    <circle cx="15" cy="12" r="1.5" fill="#555555" />
    <circle cx="9" cy="19"  r="1.5" fill="#555555" />
    <circle cx="15" cy="19" r="1.5" fill="#555555" />
  </svg>
);

const arraysEqual = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) return false;
  return true;
};

const TableCustomizerDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const { fields, tableColumnOrder, defaultTableColumnOrder, reorderTableColumns } = useCustomFields();

  const [localOrder, setLocalOrder] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const isDirty = !arraysEqual(localOrder, tableColumnOrder);
  const isAtDefault = arraysEqual(localOrder, defaultTableColumnOrder);

  useEffect(() => {
    if (!isOpen) return;
    setLocalOrder(tableColumnOrder);
    setSearch('');
  }, [isOpen, tableColumnOrder]);

  // ── Drag-and-drop ─────────────────────────────────────────
  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    dragIndexRef.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    const fromIndex = dragIndexRef.current;
    if (fromIndex === null || fromIndex === dropIndex) {
      setDragOverIndex(null);
      return;
    }
    const next = [...localOrder];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(dropIndex, 0, moved);
    setLocalOrder(next);
    dragIndexRef.current = null;
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    dragIndexRef.current = null;
    setDragOverIndex(null);
  };

  // ── Actions ───────────────────────────────────────────────
  const handleSave = () => {
    if (!isDirty) return;
    reorderTableColumns(localOrder);
    onClose();
  };

  // Restore stages the default order locally — the user still has to Save
  // (or close to discard) so it behaves consistently with drag reorders.
  const handleRestore = () => {
    if (isAtDefault) return;
    setLocalOrder(defaultTableColumnOrder);
  };

  if (!isOpen) return null;

  const fieldById = new Map(fields.map(f => [f.id, f]));
  const orderedFields: CustomField[] = localOrder
    .map(id => fieldById.get(id))
    .filter((f): f is CustomField => Boolean(f));

  const q = search.trim().toLowerCase();
  const displayed = q
    ? orderedFields.filter(f => f.name.toLowerCase().includes(q))
    : orderedFields;

  return createPortal(
    <div className={styles.root}>
      <div className={styles.blanket} onClick={onClose} aria-hidden />

      <aside className={styles.panel} aria-label="Customize table view">
        {/* Header */}
        <div className={styles.header}>
          <button type="button" className={styles.backBtn} aria-label="Close" onClick={onClose}>
            <IconArrowLeft size={18} color="#555" />
          </button>
          <h2 className={styles.title}>Customize table view</h2>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.restoreBtn}
              onClick={handleRestore}
              disabled={isAtDefault}
            >
              Restore defaults
            </button>
            <button
              type="button"
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={!isDirty}
            >
              Save
            </button>
          </div>
        </div>

        {/* Hint */}
        <p className={styles.hint}>Reorder the rows by priority.</p>

        {/* Search */}
        <div className={styles.searchWrap}>
          <div className={styles.searchBox}>
            <IconSearch size={16} color="#9e9e9e" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search rows"
              aria-label="Search rows"
            />
          </div>
        </div>

        {/* Field list */}
        <div className={styles.body}>
          {displayed.map((field, idx) => {
            const trueIndex = q ? localOrder.indexOf(field.id) : idx;
            const isDragOver = dragOverIndex === trueIndex;

            return (
              <div
                key={field.id}
                className={`${styles.row} ${isDragOver ? styles.rowDragOver : ''}`}
                draggable={!q}
                onDragStart={e => handleDragStart(e, trueIndex)}
                onDragOver={e => handleDragOver(e, trueIndex)}
                onDrop={e => handleDrop(e, trueIndex)}
                onDragEnd={handleDragEnd}
              >
                <div className={styles.rowLabel}>
                  <span className={styles.fieldName}>{field.name}</span>
                </div>
                {!q && (
                  <span className={styles.dragHandle} aria-hidden>
                    <DragHandle />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </div>,
    document.body
  );
};

export default TableCustomizerDrawer;
