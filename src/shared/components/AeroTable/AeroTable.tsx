// ============================================================
// AeroTable — the project's standard table component, modelled
// 1:1 on the Aero Design System spec
// (figma file: xecPAre4cKkeXEdvTig1oI, frame "Table" 2239:21987).
//
// Spec recap, for reference:
//   • Row height                 48 px (single-line variant)
//   • Border between rows        1 px solid #eaeaea
//   • Header text (idle)         12 px Roboto Regular  #555
//   • Header text (sorted col)   12 px Roboto Medium   #212121
//   • Body cell text             14 px Roboto Regular  #212121
//   • Header padding             16 px vertical, 4 px horizontal
//   • Body cell padding          12 px vertical, 4 px horizontal
//   • Container padding          24 px horizontal, white bg
//   • Hover row bg               #fafafa
//
// API is intentionally simple — pass `columns` (config) and
// `data` (rows). Cell content uses `column.render(row)` so each
// row stays typed without ceremony.
// ============================================================
import React, { useMemo, useState } from 'react';
import styles from './AeroTable.module.scss';
import { IconChevronUp, IconChevronDown } from '../../Icons/Icons';

export type AeroSortOrder = 'asc' | 'desc';

export interface AeroSortState {
  key: string;
  order: AeroSortOrder;
}

export interface AeroColumn<T> {
  /** Stable identifier — used as the React key and the sort field. */
  key: string;
  /** Header label. */
  label: string;
  /** Allow the user to click the header to toggle a sort on this column. */
  sortable?: boolean;
  /** Fixed pixel/percent width (overrides min/max). */
  width?: number | string;
  /** Minimum width (defaults to 128 px per Aero spec for text columns). */
  minWidth?: number | string;
  /** Maximum width. */
  maxWidth?: number | string;
  /** Right-align numeric / action columns. */
  align?: 'left' | 'right' | 'center';
  /** Cell renderer — receives the full row. */
  render: (row: T) => React.ReactNode;
  /** Optional custom header content. */
  renderHeader?: () => React.ReactNode;
  /** Built-in default sort comparator. Falls back to `row[key]` string compare. */
  sortValue?: (row: T) => string | number;
}

export interface AeroTableProps<T> {
  /** Column configuration (left → right). */
  columns: AeroColumn<T>[];
  /** Row data. */
  data: T[];
  /** Stable key for a row — defaults to row.id. */
  getRowKey?: (row: T, index: number) => string;
  /** Controlled sort state. If omitted the table sorts internally when `sortable`. */
  sort?: AeroSortState | null;
  onSortChange?: (sort: AeroSortState | null) => void;
  /** Clicking a row fires this (useful for drill-down screens). */
  onRowClick?: (row: T) => void;
  /** Right-side action cell rendered on row hover. */
  rowAction?: (row: T) => React.ReactNode;
  /** Empty-state copy. */
  emptyTitle?: string;
  emptyDescription?: React.ReactNode;
  /** Whether the table should fill its parent's width (default true). */
  fullWidth?: boolean;
  /**
   * Drop the AeroTable's own 24 px horizontal padding. Use when the
   * parent page already provides that gutter so the table doesn't
   * end up double-inset from the page edge.
   */
  flush?: boolean;
  /** Optional className on the outer container. */
  className?: string;
  /** Accessible label for the table. */
  ariaLabel?: string;
  /** Apply a subtle hover row background (default true per Aero spec). */
  hoverable?: boolean;
}

const buildWidthStyle = (col: AeroColumn<unknown>): React.CSSProperties => {
  const style: React.CSSProperties = {};
  if (col.width !== undefined) style.width = col.width;
  if (col.minWidth !== undefined) style.minWidth = col.minWidth;
  if (col.maxWidth !== undefined) style.maxWidth = col.maxWidth;
  if (col.align && col.align !== 'left') style.textAlign = col.align;
  return style;
};

const defaultSortValue = <T,>(row: T, key: string): string | number => {
  const v = (row as Record<string, unknown>)[key];
  if (typeof v === 'number') return v;
  return String(v ?? '').toLowerCase();
};

function AeroTable<T>(props: AeroTableProps<T>) {
  const {
    columns,
    data,
    getRowKey,
    sort: controlledSort,
    onSortChange,
    onRowClick,
    rowAction,
    emptyTitle = 'No data',
    emptyDescription,
    fullWidth = true,
    flush = false,
    className,
    ariaLabel,
    hoverable = true,
  } = props;

  // Uncontrolled fallback sort state.
  const [internalSort, setInternalSort] = useState<AeroSortState | null>(null);
  const sort = controlledSort !== undefined ? controlledSort : internalSort;

  const handleSort = (col: AeroColumn<T>) => {
    if (!col.sortable) return;
    let next: AeroSortState | null;
    if (sort?.key !== col.key) next = { key: col.key, order: 'asc' };
    else if (sort.order === 'asc') next = { key: col.key, order: 'desc' };
    else next = null; // third click clears
    if (onSortChange) onSortChange(next);
    else setInternalSort(next);
  };

  // Sort rows locally when sort is uncontrolled (or controlled but no
  // caller handler — defensive default so the API "just works").
  const rows = useMemo(() => {
    if (!sort) return data;
    const col = columns.find(c => c.key === sort.key);
    if (!col) return data;
    const getValue = col.sortValue ?? ((r: T) => defaultSortValue(r, sort.key));
    const sorted = [...data].sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      if (va < vb) return -1;
      if (va > vb) return 1;
      return 0;
    });
    return sort.order === 'desc' ? sorted.reverse() : sorted;
  }, [data, sort, columns]);

  const containerClass = [
    styles.container,
    fullWidth ? styles.fullWidth : '',
    flush ? styles.flush : '',
    hoverable ? styles.hoverable : '',
    className ?? '',
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClass}>
      <table className={styles.table} role="table" aria-label={ariaLabel}>
        <thead className={styles.thead}>
          <tr className={styles.tr}>
            {columns.map(col => {
              const isSorted = sort?.key === col.key;
              const ariaSort = isSorted
                ? (sort?.order === 'asc' ? 'ascending' : 'descending')
                : (col.sortable ? 'none' : undefined);
              return (
                <th
                  key={col.key}
                  scope="col"
                  className={`${styles.th} ${isSorted ? styles.thSorted : ''} ${col.sortable ? styles.thSortable : ''}`}
                  style={buildWidthStyle(col as AeroColumn<unknown>)}
                  aria-sort={ariaSort}
                  onClick={col.sortable ? () => handleSort(col) : undefined}
                >
                  <span className={styles.thLabel}>
                    {col.renderHeader ? col.renderHeader() : col.label}
                    {col.sortable && (
                      <span className={styles.sortIcon} aria-hidden>
                        {isSorted && sort?.order === 'asc'
                          ? <IconChevronUp size={16} color="currentColor" />
                          : <IconChevronDown size={16} color="currentColor" />}
                      </span>
                    )}
                  </span>
                </th>
              );
            })}
            {rowAction && <th aria-hidden className={`${styles.th} ${styles.thAction}`} />}
          </tr>
        </thead>

        <tbody className={styles.tbody}>
          {rows.length === 0 ? (
            <tr className={styles.emptyRow}>
              <td className={styles.emptyCell} colSpan={columns.length + (rowAction ? 1 : 0)}>
                <div className={styles.emptyTitle}>{emptyTitle}</div>
                {emptyDescription && <div className={styles.emptyDescription}>{emptyDescription}</div>}
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => {
              const key = getRowKey ? getRowKey(row, idx) : String((row as { id?: string }).id ?? idx);
              return (
                <tr
                  key={key}
                  className={`${styles.tr} ${styles.bodyRow} ${onRowClick ? styles.clickable : ''}`}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={styles.td}
                      style={buildWidthStyle(col as AeroColumn<unknown>)}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                  {rowAction && (
                    <td className={`${styles.td} ${styles.tdAction}`} onClick={e => e.stopPropagation()}>
                      <div className={styles.rowActionWrap}>{rowAction(row)}</div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AeroTable;
