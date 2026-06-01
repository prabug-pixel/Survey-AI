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
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  /**
   * Opt this column out of resize when the table has `resizable` enabled.
   * Columns are resizable by default whenever the table-level flag is on.
   */
  resizable?: boolean;
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
  /**
   * Allow the user to drag-resize column boundaries from the header. Off
   * by default so existing tables keep their declarative widths; opt-in
   * per surface (the Aero spec frame "Resize" 303:58880).
   */
  resizable?: boolean;
  /** Minimum pixel width the user can drag a column down to (default 56). */
  minColumnWidth?: number;
  /**
   * Optional summary row pinned to the top of the body — useful for
   * totals or aggregates that should sit directly under the header
   * row and stay aligned with the columns. One entry per column, in
   * column order. Cells render with bold text and a heavier bottom
   * border to separate them from the data rows below.
   */
  summaryRow?: React.ReactNode[];
}

const buildWidthStyle = (
  col: AeroColumn<unknown>,
  overrideWidth?: number,
): React.CSSProperties => {
  const style: React.CSSProperties = {};
  if (overrideWidth !== undefined) {
    style.width = `${overrideWidth}px`;
    style.minWidth = `${overrideWidth}px`;
    style.maxWidth = `${overrideWidth}px`;
  } else {
    if (col.width !== undefined) style.width = col.width;
    if (col.minWidth !== undefined) style.minWidth = col.minWidth;
    if (col.maxWidth !== undefined) style.maxWidth = col.maxWidth;
  }
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
    resizable = false,
    minColumnWidth = 56,
    summaryRow,
  } = props;

  // Uncontrolled fallback sort state.
  const [internalSort, setInternalSort] = useState<AeroSortState | null>(null);
  const sort = controlledSort !== undefined ? controlledSort : internalSort;

  // ── Column resize state ──────────────────────────────────────
  // `colWidths` holds user-overridden widths by column key. We seed the
  // value lazily from the live DOM measurement on mousedown so the user
  // can drag from the column's current rendered width — no need to know
  // it up-front.
  const [colWidths, setColWidths] = useState<Record<string, number>>({});
  const [activeResizeKey, setActiveResizeKey] = useState<string | null>(null);
  const headerRefs = useRef<Record<string, HTMLTableCellElement | null>>({});

  const startResize = useCallback(
    (colKey: string, e: React.PointerEvent<HTMLSpanElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const headerEl = headerRefs.current[colKey];
      if (!headerEl) return;
      const startX = e.clientX;
      const startWidth = headerEl.getBoundingClientRect().width;

      setActiveResizeKey(colKey);

      const onMove = (ev: PointerEvent) => {
        const next = Math.max(minColumnWidth, startWidth + (ev.clientX - startX));
        setColWidths(w => ({ ...w, [colKey]: next }));
      };
      const onUp = () => {
        setActiveResizeKey(null);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    },
    [minColumnWidth],
  );

  // Apply a global "resizing" body cursor so the cursor stays
  // col-resize even when the pointer drifts off the handle.
  useEffect(() => {
    if (!activeResizeKey) return;
    const prevCursor = document.body.style.cursor;
    const prevSelect = document.body.style.userSelect;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    return () => {
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevSelect;
    };
  }, [activeResizeKey]);

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
    resizable ? styles.resizable : '',
    className ?? '',
  ].filter(Boolean).join(' ');

  // `table-layout: fixed` is required so explicit pixel widths on `<th>`
  // actually constrain the column — the default `auto` layout uses
  // content size as a hint and will ignore narrow widths when content
  // doesn't fit. Only flipped when the table opts into resize so other
  // surfaces keep their content-driven sizing.
  const tableStyle: React.CSSProperties = resizable ? { tableLayout: 'fixed' } : {};

  return (
    <div className={containerClass}>
      <table className={styles.table} role="table" aria-label={ariaLabel} style={tableStyle}>
        <thead className={styles.thead}>
          <tr className={styles.tr}>
            {columns.map(col => {
              const isSorted = sort?.key === col.key;
              const ariaSort = isSorted
                ? (sort?.order === 'asc' ? 'ascending' : 'descending')
                : (col.sortable ? 'none' : undefined);
              const canResize = resizable && col.resizable !== false;
              const userWidth = colWidths[col.key];
              const isActiveResize = activeResizeKey === col.key;
              return (
                <th
                  key={col.key}
                  ref={el => { headerRefs.current[col.key] = el; }}
                  scope="col"
                  className={`${styles.th} ${isSorted ? styles.thSorted : ''} ${col.sortable ? styles.thSortable : ''} ${canResize ? styles.thResizable : ''} ${isActiveResize ? styles.thResizing : ''}`}
                  style={buildWidthStyle(col as AeroColumn<unknown>, userWidth)}
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
                  {canResize && (
                    <span
                      className={`${styles.resizeHandle} ${isActiveResize ? styles.resizeHandleActive : ''}`}
                      role="separator"
                      aria-orientation="vertical"
                      aria-label={`Resize ${col.label} column`}
                      onPointerDown={e => startResize(col.key, e)}
                      onClick={e => e.stopPropagation()}
                    >
                      <span className={styles.resizeBar} aria-hidden />
                    </span>
                  )}
                </th>
              );
            })}
            {rowAction && <th aria-hidden className={`${styles.th} ${styles.thAction}`} />}
          </tr>
        </thead>

        <tbody className={styles.tbody}>
          {summaryRow && (
            <tr className={`${styles.tr} ${styles.summaryRow}`}>
              {columns.map((col, i) => (
                <td
                  key={col.key}
                  className={`${styles.td} ${styles.summaryCell}`}
                  style={buildWidthStyle(col as AeroColumn<unknown>, colWidths[col.key])}
                >
                  {summaryRow[i]}
                </td>
              ))}
              {rowAction && <td className={`${styles.td} ${styles.tdAction} ${styles.summaryCell}`} aria-hidden />}
            </tr>
          )}
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
                      style={buildWidthStyle(col as AeroColumn<unknown>, colWidths[col.key])}
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
