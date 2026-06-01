// ============================================================
// TicketCountReport — Reports > Ticket Count. Six chart cards
// (count by owner, by status, status by location, open vs closed
// by location, status by user, open vs closed by user) plus a
// "Tickets closed by user over time" data table that reuses the
// project-standard AeroTable. The bar chart cards reuse the
// shared AeroBarChart primitive — no bespoke chart code lives
// here.
// ============================================================
import React, { useMemo } from 'react';
import AeroTable from '../../shared/components/AeroTable';
import type { AeroColumn } from '../../shared/components/AeroTable';
import AeroBarChart, { AERO_CHART_COLORS } from '../../shared/components/AeroBarChart';
import type { AeroBarDatum, AeroBarSeries } from '../../shared/components/AeroBarChart';
import styles from './ReportPages.module.scss';

const formatCount = (n: number): string => {
  if (n === 0) return '0';
  if (n >= 1000) {
    const k = n / 1000;
    return `${k.toFixed(k >= 10 ? 0 : 1)}K`;
  }
  return String(n);
};

// ── Count by owner (mostly small values + one large Unassigned tail) ──
const COUNT_BY_OWNER: AeroBarDatum[] = [
  { key: 'kjautomation', label: 'kjautomation',     value: 1 },
  { key: 'leonard',      label: 'Leonard Tav…',     value: 1 },
  { key: 'nihar',        label: 'Nihar More',       value: 1 },
  { key: 'vandanaagr',   label: 'Vandana Aga…',     value: 1 },
  { key: 'akashpathak',  label: 'akash pathak',     value: 2 },
  { key: 'raghav',       label: 'Raghav Lakho…',    value: 2 },
  { key: 'hayley',       label: 'Hayley Rafner',    value: 3 },
  { key: 'abhishekt',    label: 'Abhishek Tom…',    value: 3 },
  { key: 'amiE',         label: 'Ami Espinal',      value: 3 },
  { key: 'tarun',        label: 'Tarun Singh',      value: 4 },
  { key: 'abhijeet',     label: 'Abhijeet Sriva…',  value: 4 },
  { key: 'anukul',       label: 'Anukul Jain',      value: 11 },
  { key: 'amit',         label: 'amit kumar',       value: 343, color: AERO_CHART_COLORS.yellow },
  { key: 'unassigned',   label: 'Unassigned',       value: 1200, color: AERO_CHART_COLORS.purple },
];

// ── Count by status (yellow + purple peaks, small tail) ──────────────
const COUNT_BY_STATUS: AeroBarDatum[] = [
  { key: 'new',      label: 'New',         value: 1100, color: AERO_CHART_COLORS.yellow },
  { key: 'assigned', label: 'Assigned',    value: 395,  color: AERO_CHART_COLORS.purple },
  { key: 'inprog',   label: 'In progress', value: 6,    color: AERO_CHART_COLORS.green  },
  { key: 'resolved', label: 'Resolved',    value: 0,    color: AERO_CHART_COLORS.green  },
  { key: 'closed',   label: 'Closed',      value: 0,    color: AERO_CHART_COLORS.gray   },
];

// ── Status segments (legend + per-segment colors)
//    These power both "status by location" and "status by user".
const STATUS_SERIES: AeroBarSeries[] = [
  { key: 'new',      label: 'New',         color: AERO_CHART_COLORS.blue   },
  { key: 'assigned', label: 'Assigned',    color: AERO_CHART_COLORS.purple },
  { key: 'inprog',   label: 'In progress', color: AERO_CHART_COLORS.green  },
  { key: 'resolved', label: 'Resolved',    color: AERO_CHART_COLORS.green  },
  { key: 'closed',   label: 'Closed',      color: AERO_CHART_COLORS.gray   },
];

const OPEN_RESOLVED_SERIES: AeroBarSeries[] = [
  { key: 'open',     label: 'Open',                color: AERO_CHART_COLORS.blue   },
  { key: 'resolved', label: 'Resolved and closed', color: AERO_CHART_COLORS.green  },
];

const stack = (
  key: string,
  label: string,
  parts: Array<[string, number, string | undefined]>,
): AeroBarDatum => ({
  key,
  label,
  parts: parts.map(([k, v, c]) => ({ key: k, value: v, color: c })),
});

// ── Status by location ──────────────────────────────────────────────
const STATUS_BY_LOCATION: AeroBarDatum[] = [
  stack('testloc',    'test loc test',         [['new', 200, AERO_CHART_COLORS.blue], ['assigned', 404, AERO_CHART_COLORS.purple]]),
  stack('burlingame', 'Burlingame, CA $ Te…',  [['new', 256, AERO_CHART_COLORS.blue]]),
  stack('110078',     '110078',                [['new', 186, AERO_CHART_COLORS.blue]]),
  stack('dallas',     'Dallas',                [['new', 128, AERO_CHART_COLORS.blue]]),
  stack('anchorage',  'Anchorage, AK',         [['new',  74, AERO_CHART_COLORS.blue]]),
  stack('04609',      '04609',                 [['new',  65, AERO_CHART_COLORS.blue]]),
  stack('zetland',    'Zetland, NSW',          [['new',  29, AERO_CHART_COLORS.blue]]),
  stack('vertou',     'Vertou',                [['new',  16, AERO_CHART_COLORS.blue], ['assigned', 6, AERO_CHART_COLORS.purple]]),
  stack('15620',      '15620',                 [['new',  20, AERO_CHART_COLORS.blue]]),
];

// ── Open vs Resolved & Closed by location ───────────────────────────
const OPEN_RESOLVED_BY_LOCATION: AeroBarDatum[] = [
  stack('testloc',    'test loc test',         [['open', 604, AERO_CHART_COLORS.blue]]),
  stack('burlingame', 'Burlingame, CA $ Te…',  [['open', 256, AERO_CHART_COLORS.blue]]),
  stack('110078',     '110078',                [['open', 186, AERO_CHART_COLORS.blue]]),
  stack('dallas',     'Dallas',                [['open', 128, AERO_CHART_COLORS.blue]]),
  stack('anchorage',  'Anchorage, AK',         [['open',  74, AERO_CHART_COLORS.blue]]),
  stack('04609',      '04609',                 [['open',  65, AERO_CHART_COLORS.blue]]),
  stack('zetland',    'Zetland, NSW',          [['open',  29, AERO_CHART_COLORS.blue]]),
  stack('vertou',     'Vertou',                [['open',  22, AERO_CHART_COLORS.blue]]),
  stack('15620',      '15620',                 [['open',  20, AERO_CHART_COLORS.blue]]),
];

// ── Status by user ───────────────────────────────────────────────
const STATUS_BY_USER: AeroBarDatum[] = [
  stack('unassigned', 'Unassigned',         [['new', 1200, AERO_CHART_COLORS.blue]]),
  stack('amit',       'amit kumar',         [['assigned', 338, AERO_CHART_COLORS.purple]]),
  stack('anukul',     'Anukul Jain',        [['new', 11, AERO_CHART_COLORS.blue]]),
  stack('tarun',      'Tarun Singh',        [['new',  4, AERO_CHART_COLORS.blue]]),
  stack('abhishekt',  'Abhishek Tomar',     [['new',  4, AERO_CHART_COLORS.blue]]),
  stack('abhijeet',   'Abhijeet Srivastava',[['new',  4, AERO_CHART_COLORS.blue]]),
  stack('hayley',     'Hayley Rafner',      [['new',  3, AERO_CHART_COLORS.blue]]),
  stack('amiE',       'Ami Espinal',        [['new',  3, AERO_CHART_COLORS.blue]]),
  stack('raghav',     'Raghav Lakhotiya',   [['new',  2, AERO_CHART_COLORS.blue]]),
];

const OPEN_RESOLVED_BY_USER: AeroBarDatum[] = [
  stack('unassigned', 'Unassigned',         [['open', 1200, AERO_CHART_COLORS.blue]]),
  stack('amit',       'amit kumar',         [['open',  338, AERO_CHART_COLORS.blue]]),
  stack('anukul',     'Anukul Jain',        [['open',   11, AERO_CHART_COLORS.blue]]),
  stack('tarun',      'Tarun Singh',        [['open',    4, AERO_CHART_COLORS.blue]]),
  stack('abhishekt',  'Abhishek Tomar',     [['open',    4, AERO_CHART_COLORS.blue]]),
  stack('abhijeet',   'Abhijeet Srivastava',[['open',    4, AERO_CHART_COLORS.blue]]),
  stack('hayley',     'Hayley Rafner',      [['open',    3, AERO_CHART_COLORS.blue]]),
  stack('amiE',       'Ami Espinal',        [['open',    3, AERO_CHART_COLORS.blue]]),
  stack('raghav',     'Raghav Lakhotiya',   [['open',    2, AERO_CHART_COLORS.blue]]),
];

// ── Tickets closed by user over time — table rows ────────────────
// Date × user matrix; matches the screenshot one-to-one.
const CLOSED_USERS = ['John Doe', 'Sarah Smith', 'Emma Wilson', 'David Brown', 'Michael Chen', 'Jennifer Lee', 'Robert Martinez'];

interface ClosedRow {
  date: string;
  values: number[];
}

const CLOSED_ROWS: ClosedRow[] = [
  { date: 'Apr 6, 2026',  values: [12, 8, 10, 7, 9, 6, 11] },
  { date: 'Apr 7, 2026',  values: [15, 11, 8, 9, 13, 7, 10] },
  { date: 'Apr 8, 2026',  values: [10, 9, 12, 11, 8, 10, 9] },
  { date: 'Apr 9, 2026',  values: [18, 14, 15, 12, 11, 9, 13] },
  { date: 'Apr 10, 2026', values: [9, 7, 8, 6, 10, 8, 7] },
  { date: 'Apr 11, 2026', values: [5, 4, 3, 5, 4, 6, 3] },
  { date: 'Apr 12, 2026', values: [4, 3, 5, 4, 3, 5, 4] },
  { date: 'Apr 13, 2026', values: [16, 12, 14, 10, 15, 11, 12] },
];

interface ReportCardProps {
  title: string;
  badge?: string;
  headline: { value: string; label: string }[];
  range?: string;
  children: React.ReactNode;
}

const ReportCard: React.FC<ReportCardProps> = ({ title, badge, headline, range = 'Last 12 months', children }) => (
  <section className={styles.reportCard}>
    <header className={styles.cardHeader}>
      <h2 className={styles.cardTitle}>
        {title}
        {badge && <span className={styles.cardBadge}>{badge}</span>}
      </h2>
      <button className={styles.rangeChip} type="button">{range}</button>
    </header>

    <div className={styles.headlineRow}>
      {headline.map(h => (
        <div key={h.label} className={styles.headlineItem}>
          <span className={styles.headlineValue}>{h.value}</span>
          <span className={styles.headlineLabel}>{h.label}</span>
        </div>
      ))}
    </div>

    <div className={styles.chartArea}>{children}</div>
  </section>
);

const TicketCountReport: React.FC = () => {
  // Columns for the AeroTable — one per user plus the date column.
  // Totals row is appended manually (AeroTable doesn't have a built-in
  // summary row, and the screenshot expects bold totals at the bottom).
  const closedColumns = useMemo<AeroColumn<ClosedRow>[]>(() => {
    const cols: AeroColumn<ClosedRow>[] = [
      {
        key: 'date',
        label: 'Date',
        minWidth: 140,
        render: r => <span className={styles.dateCell}>{r.date}</span>,
        sortable: true,
        sortValue: r => r.date,
      },
    ];
    CLOSED_USERS.forEach((u, idx) => {
      cols.push({
        key: `u-${idx}`,
        // Display as sentence case: only the first letter capitalized,
        // remainder lowercased (e.g. "John Doe" -> "John doe").
        label: u.charAt(0).toUpperCase() + u.slice(1).toLowerCase(),
        minWidth: 100,
        render: r => r.values[idx] ?? 0,
        sortable: true,
        sortValue: r => r.values[idx] ?? 0,
      });
    });
    return cols;
  }, []);

  const totals = useMemo(() => {
    const sums = CLOSED_USERS.map((_, idx) =>
      CLOSED_ROWS.reduce((acc, row) => acc + (row.values[idx] ?? 0), 0),
    );
    return sums;
  }, []);

  const grandTotal = totals.reduce((a, b) => a + b, 0);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Tickets</h1>
      </div>

      <ReportCard
        title="Ticket count by owner"
        headline={[
          { value: '1.5K', label: 'Tickets' },
          { value: '1.2K', label: 'Unassigned' },
        ]}
      >
        <AeroBarChart
          ariaLabel="Ticket count by owner"
          data={COUNT_BY_OWNER}
          orientation="vertical"
          height={400}
          defaultColor={AERO_CHART_COLORS.yellow}
          formatValue={formatCount}
        />
      </ReportCard>

      <ReportCard
        title="Ticket count by status"
        headline={[{ value: '1.5K', label: 'Tickets' }]}
      >
        <AeroBarChart
          ariaLabel="Ticket count by status"
          data={COUNT_BY_STATUS}
          orientation="vertical"
          height={400}
          formatValue={formatCount}
        />
      </ReportCard>

      <ReportCard
        title="Ticket status by location"
        headline={[
          { value: '1.5K', label: 'Total tickets' },
          { value: '1.1K', label: 'New' },
          { value: '390',  label: 'Assigned' },
          { value: '6',    label: 'In progress' },
          { value: '0',    label: 'Resolved' },
          { value: '0',    label: 'Closed' },
        ]}
      >
        <AeroBarChart
          ariaLabel="Ticket status by location"
          data={STATUS_BY_LOCATION}
          orientation="horizontal"
          series={STATUS_SERIES}
          defaultColor={AERO_CHART_COLORS.blue}
          formatValue={formatCount}
        />
      </ReportCard>

      <ReportCard
        title="Open vs Resolved & closed tickets by location"
        headline={[
          { value: '1.5K', label: 'Total tickets' },
          { value: '1.5K', label: 'Open' },
          { value: '0',    label: 'Resolved and closed' },
        ]}
      >
        <AeroBarChart
          ariaLabel="Open vs Resolved & closed tickets by location"
          data={OPEN_RESOLVED_BY_LOCATION}
          orientation="horizontal"
          series={OPEN_RESOLVED_SERIES}
          defaultColor={AERO_CHART_COLORS.blue}
          formatValue={formatCount}
        />
      </ReportCard>

      <ReportCard
        title="Ticket status by user"
        headline={[
          { value: '1.5K', label: 'Total tickets' },
          { value: '1.1K', label: 'New' },
          { value: '390',  label: 'Assigned' },
          { value: '6',    label: 'In progress' },
          { value: '0',    label: 'Resolved' },
          { value: '0',    label: 'Closed' },
        ]}
      >
        <AeroBarChart
          ariaLabel="Ticket status by user"
          data={STATUS_BY_USER}
          orientation="horizontal"
          series={STATUS_SERIES}
          defaultColor={AERO_CHART_COLORS.blue}
          formatValue={formatCount}
        />
      </ReportCard>

      <ReportCard
        title="Open vs Resolved & closed tickets by user"
        headline={[
          { value: '1.5K', label: 'Total tickets' },
          { value: '1.5K', label: 'Open' },
          { value: '0',    label: 'Resolved and closed' },
        ]}
      >
        <AeroBarChart
          ariaLabel="Open vs Resolved & closed tickets by user"
          data={OPEN_RESOLVED_BY_USER}
          orientation="horizontal"
          series={OPEN_RESOLVED_SERIES}
          defaultColor={AERO_CHART_COLORS.blue}
          formatValue={formatCount}
        />
      </ReportCard>

      <ReportCard
        title="Tickets closed by user over time"
        badge="NEW"
        range="Last 30 days"
        headline={[{ value: String(grandTotal), label: 'Total tickets closed' }]}
      >
        <AeroTable<ClosedRow>
          ariaLabel="Tickets closed by user over time"
          columns={closedColumns}
          data={CLOSED_ROWS}
          getRowKey={r => r.date}
          hoverable
          flush
          resizable
          emptyTitle="No tickets closed in this range"
          summaryRow={['Total', ...totals]}
        />
      </ReportCard>
    </div>
  );
};

export default TicketCountReport;
