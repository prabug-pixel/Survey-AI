// ============================================================
// AgentProductivityReport — Reports > Agent productivity over
// time. Tabular default per PRD 1.6: rows = agents, columns =
// dates, cells = tickets closed. Filters across date range and
// (optionally) source / severity layer on top.
// ============================================================
import React, { useMemo, useState } from 'react';
import AeroTable from '../../shared/components/AeroTable';
import type { AeroColumn } from '../../shared/components/AeroTable';
import { useCustomFields, SEVERITY_COLORS } from './CustomFieldsContext';
import type { SeverityLevel } from './CustomFieldsContext';
import styles from './SettingsPages.module.scss';

const AGENTS = ['Abhinav R.', 'Priyanshi', 'Sahil Gupta', 'Prabu G', 'Daniela Cruz', 'Brad Pierce'];

// Last 7 calendar days. Anchored to "today" so the report reads naturally.
const buildDateColumns = (count: number): string[] => {
  const out: string[] = [];
  const today = new Date('2026-05-28');
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const mon = d.toLocaleString('en-US', { month: 'short' });
    out.push(`${mon} ${d.getDate()}`);
  }
  return out;
};

// Deterministic fake counts so the table looks lived-in but never
// changes between renders. (Same agent + date → same count.)
const cellCount = (agent: string, date: string): number => {
  let h = 0;
  for (let i = 0; i < agent.length; i++) h = (h * 31 + agent.charCodeAt(i)) | 0;
  for (let i = 0; i < date.length; i++)  h = (h * 31 + date.charCodeAt(i)) | 0;
  return Math.abs(h) % 9; // 0–8 tickets/day
};

const DATE_RANGES = [
  { value: '7',  label: 'Last 7 days' },
  { value: '14', label: 'Last 14 days' },
  { value: '30', label: 'Last 30 days' },
];

const AgentProductivityReport: React.FC = () => {
  const { sources } = useCustomFields();
  const [rangeDays, setRangeDays] = useState<string>('7');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const dateColumns = useMemo(() => buildDateColumns(parseInt(rangeDays, 10)), [rangeDays]);

  const rows = useMemo(() => {
    // The filter applies a small dampening factor so the table responds
    // visibly to filter changes — purely for demo realism.
    const dampen = (sourceFilter !== 'all' || severityFilter !== 'all') ? 0.5 : 1;
    return AGENTS.map(agent => {
      const cells = dateColumns.map(d => Math.round(cellCount(agent, d) * dampen));
      const total = cells.reduce((a, b) => a + b, 0);
      return { agent, cells, total };
    });
  }, [dateColumns, sourceFilter, severityFilter]);

  // Compress the long-tail to keep the table readable when rangeDays >7
  const visibleDateColumns = dateColumns.length <= 7 ? dateColumns : dateColumns.slice(-7);
  const visibleRows = useMemo(() => {
    if (dateColumns.length <= 7) return rows;
    return rows.map(r => ({ ...r, cells: r.cells.slice(-7) }));
  }, [rows, dateColumns]);

  type Row = { agent: string; cells: number[]; total: number };
  const reportColumns: AeroColumn<Row>[] = useMemo(() => {
    const cols: AeroColumn<Row>[] = [
      {
        key: 'agent',
        label: 'Agent',
        sortable: true,
        sortValue: r => r.agent.toLowerCase(),
        minWidth: 160,
        render: r => <span className={styles.fieldName}>{r.agent}</span>,
      },
    ];
    visibleDateColumns.forEach((d, idx) => {
      cols.push({
        key: `d-${d}`,
        label: d,
        align: 'right',
        minWidth: 80,
        sortable: true,
        sortValue: r => r.cells[idx] ?? 0,
        render: r => {
          const n = r.cells[idx] ?? 0;
          return n === 0 ? <span className={styles.mutedCell}>—</span> : n;
        },
      });
    });
    cols.push({
      key: 'total',
      label: 'Total',
      align: 'right',
      sortable: true,
      sortValue: r => r.total,
      minWidth: 80,
      render: r => <strong>{r.total}</strong>,
    });
    return cols;
  }, [visibleDateColumns]);

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <span className={styles.crumbLink}>Ticketing</span>
        <span className={styles.crumbSep}>/</span>
        <span className={styles.crumbCurrent}>Agent productivity</span>
      </div>

      <div className={styles.titleRow}>
        <div>
          <h1 className={styles.title}>Agent productivity over time</h1>
          <p className={styles.subtitle}>
            Tickets closed per agent per day. Filter by source or severity, or expand the date range. Tabular by default — scales cleanly to large teams.
          </p>
        </div>
      </div>

      <div className={styles.reportToolbar}>
        <span className={styles.reportToolbarLabel}>Range</span>
        <select
          className={styles.reportSelect}
          value={rangeDays}
          onChange={e => setRangeDays(e.target.value)}
          aria-label="Date range"
        >
          {DATE_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>

        <span className={styles.reportToolbarLabel}>Source</span>
        <select
          className={styles.reportSelect}
          value={sourceFilter}
          onChange={e => setSourceFilter(e.target.value)}
          aria-label="Filter by source"
        >
          <option value="all">All sources</option>
          {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <span className={styles.reportToolbarLabel}>Severity</span>
        <select
          className={styles.reportSelect}
          value={severityFilter}
          onChange={e => setSeverityFilter(e.target.value)}
          aria-label="Filter by severity"
        >
          <option value="all">Any severity</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {severityFilter !== 'all' && (
          <span
            className={styles.severityCell}
            style={{
              background: SEVERITY_COLORS[severityFilter as SeverityLevel].bg,
              color: SEVERITY_COLORS[severityFilter as SeverityLevel].fg,
            }}
          >
            <span
              className={styles.severityDot}
              style={{ background: SEVERITY_COLORS[severityFilter as SeverityLevel].dot }}
              aria-hidden
            />
            {severityFilter}
          </span>
        )}
      </div>

      <AeroTable
        ariaLabel="Agent productivity"
        columns={reportColumns}
        data={visibleRows}
        getRowKey={r => r.agent}
        hoverable={false}
        resizable
        emptyTitle="No closed tickets in this range"
      />
    </div>
  );
};

export default AgentProductivityReport;
