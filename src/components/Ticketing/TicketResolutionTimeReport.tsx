// ============================================================
// TicketResolutionTimeReport — Reports > Ticket Resolution Time.
// Four card-bound bar charts that mirror the Aero Design System
// chart spec exactly: resolution time over time, by location, by
// status, and by owner. All charts share the AeroBarChart
// primitive so the chrome stays consistent.
// ============================================================
import React from 'react';
import AeroBarChart, { AERO_CHART_COLORS } from '../../shared/components/AeroBarChart';
import type { AeroBarDatum } from '../../shared/components/AeroBarChart';
import styles from './ReportPages.module.scss';

// Same numeric formatter the screenshots show — `1.7K` for thousands,
// two-decimal floats otherwise, "0" for an empty bar.
const formatDays = (n: number): string => {
  if (n === 0) return '0';
  if (Math.abs(n) >= 1000) {
    const k = n / 1000;
    return `${k.toFixed(k >= 10 ? 0 : 1)}K`;
  }
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
};

const OVER_TIME: AeroBarDatum[] = [
  { key: '2018', label: '2018', value: 0 },
  { key: '2019', label: '2019', value: 0 },
  { key: '2020', label: '2020', value: 88 },
  { key: '2021', label: '2021', value: 26.77 },
  { key: '2022', label: '2022', value: 11.18 },
  { key: '2023', label: '2023', value: 109.24 },
  { key: '2024', label: '2024', value: 0 },
  { key: '2025', label: '2025', value: 0 },
  { key: '2026', label: '2026', value: 0 },
];

const BY_LOCATION: AeroBarDatum[] = [
  { key: 'allenton',    label: 'Allenton, MI',     value: 1700 },
  { key: 'cupertino',   label: 'Cupertino, CA',    value: 316.84 },
  { key: 'smb',         label: 'smb-to-be-add…',   value: 233.87 },
  { key: 'ny',          label: ', NY',             value: 71.44 },
  { key: 'l81g',        label: 'L81g',             value: 62.48 },
  { key: 'colorado2',   label: 'Colorado2',        value: 26.67 },
  { key: 'phone',       label: 'Phone Number',     value: 12 },
  { key: 'sandiego',    label: 'San Diego, CA',    value: 7.29 },
  { key: 'agraties',    label: 'Agraties',         value: 7.05 },
  { key: 'boulevard',   label: 'Boulevard Bur…',   value: 5.45 },
  { key: 'locationger', label: 'Location Ger…',    value: 1.14 },
  { key: 'boston',      label: 'Boston, AB',       value: 0.19 },
  { key: 'test2',       label: 'test2',            value: 0.18 },
  { key: 'nyc',         label: 'New York, NY',     value: 0.04 },
  { key: 'newone',      label: 'new one',          value: 0.01 },
  { key: 'mcdonalds',   label: 'McDonalds',        value: 0.01 },
  { key: 'burlingame',  label: 'Burlingame, C…',   value: 0 },
  { key: 'downtown',    label: 'DownTown',         value: 0 },
  { key: 'notaustin',   label: 'Not Austin',       value: 0 },
  { key: 'newloc',      label: 'new_loc_bulk1',    value: 0 },
  { key: 'aftercheck',  label: 'After CHeck',      value: 0 },
  { key: 'dallas',      label: 'Dallas',           value: 0 },
  { key: 'btal',        label: 'BT_AL',            value: 0 },
  { key: 'campaign',    label: 'CampaignNe…',      value: 0 },
  { key: 'colorado3',   label: 'Colorado3',        value: 0 },
];

const BY_STATUS: AeroBarDatum[] = [
  { key: 'new',       label: 'New',         value: 3.63,   color: AERO_CHART_COLORS.yellow  },
  { key: 'assigned',  label: 'Assigned',    value: 198.56, color: AERO_CHART_COLORS.purple  },
  { key: 'inprog',    label: 'In progress', value: 174.58, color: AERO_CHART_COLORS.orange  },
  { key: 'resolved',  label: 'Resolved',    value: 165.03, color: AERO_CHART_COLORS.green   },
  { key: 'closed',    label: 'Closed',      value: 40.1,   color: AERO_CHART_COLORS.gray    },
];

const BY_OWNER: AeroBarDatum[] = [
  { key: 'test1',       label: 'Test User1',       value: 1700 },
  { key: 'varun',       label: 'varun verma',      value: 119.05 },
  { key: 'ab',          label: 'a b',              value: 51.93 },
  { key: 'unassigned',  label: 'Unassigned',       value: 5.78 },
  { key: 'raghav',      label: 'raghav mahes…',    value: 1.14 },
  { key: 'edd',         label: 'ed d',             value: 0 },
  { key: 'hello',       label: 'hello world',      value: 0 },
  { key: 'saurabh',     label: 'Saurabh Mehta',    value: 0 },
  { key: 'blbl',        label: 'bl bl',            value: 0 },
  { key: 'performance', label: 'Performance',      value: 0 },
  { key: 'ankit',       label: 'Ankit Gupta',      value: 0 },
  { key: 'ashu',        label: 'ashu ashu',        value: 0 },
  { key: 'bam',         label: 'Bam user',         value: 0 },
  { key: 'bluejay',     label: 'Bluejay',          value: 0 },
  { key: 'sachin',      label: 'Sachin Sharma',    value: 0 },
  { key: 'dg',          label: 'D G',              value: 0 },
  { key: 'blossom',     label: 'Blossom Dent…',    value: 0 },
  { key: 'vandnav',     label: 'Vandna V',         value: 0 },
  { key: 'vandana',     label: 'Vandana Agar…',    value: 0 },
  { key: 'testuser',    label: 'Test User',        value: 0 },
  { key: 'tarun',       label: 'Tarun Singh',      value: 0 },
  { key: 'shubham',     label: 'Shubham Aga…',     value: 0 },
  { key: 'sk',          label: 'S K',              value: 0 },
  { key: 'rontest',     label: 'ron test1',        value: 0 },
  { key: 'rajsheth1',   label: 'Raj Sheth',        value: 0 },
  { key: 'rajsheth2',   label: 'Raj Sheth',        value: 0 },
];

interface ReportCardProps {
  title: string;
  headline: { value: string; label: string }[];
  range?: string;
  children: React.ReactNode;
}

const ReportCard: React.FC<ReportCardProps> = ({ title, headline, range = 'All time', children }) => (
  <section className={styles.reportCard}>
    <header className={styles.cardHeader}>
      <h2 className={styles.cardTitle}>{title}</h2>
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

const TicketResolutionTimeReport: React.FC = () => {
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Ticket resolution time</h1>
      </div>

      <ReportCard
        title="Ticket resolution time over time"
        headline={[{ value: '16.15', label: 'Days · Resolution time' }]}
      >
        <AeroBarChart
          ariaLabel="Ticket resolution time over time"
          data={OVER_TIME}
          orientation="vertical"
          height={400}
          defaultColor={AERO_CHART_COLORS.yellow}
          formatValue={formatDays}
        />
      </ReportCard>

      <ReportCard
        title="Ticket resolution time by location"
        headline={[{ value: '16.15', label: 'Days · Resolution time' }]}
      >
        <AeroBarChart
          ariaLabel="Ticket resolution time by location"
          data={BY_LOCATION}
          orientation="vertical"
          height={400}
          defaultColor={AERO_CHART_COLORS.yellow}
          formatValue={formatDays}
        />
      </ReportCard>

      <ReportCard
        title="Ticket resolution time by status"
        headline={[{ value: '45.5', label: 'Days · Time' }]}
      >
        <AeroBarChart
          ariaLabel="Ticket resolution time by status"
          data={BY_STATUS}
          orientation="vertical"
          height={400}
          formatValue={formatDays}
        />
      </ReportCard>

      <ReportCard
        title="Ticket resolution time by owner"
        headline={[
          { value: '6.17', label: 'Days · Time to resolve' },
          { value: '5.78', label: 'Days · Unassigned time to resolve' },
          { value: '7.46', label: 'Days · Assigned time to resolve' },
        ]}
      >
        <AeroBarChart
          ariaLabel="Ticket resolution time by owner"
          data={BY_OWNER}
          orientation="vertical"
          height={400}
          defaultColor={AERO_CHART_COLORS.yellow}
          formatValue={formatDays}
        />
      </ReportCard>
    </div>
  );
};

export default TicketResolutionTimeReport;
