import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IconChevronDown, IconChevronUp, IconPlusCircle } from '../../shared/Icons/Icons';
import styles from './TicketingL2Nav.module.scss';

type TicketingView = 'my' | 'all';

interface NavLink {
  label: string;
  path: string;
}

const SETTINGS_LINKS: NavLink[] = [
  { label: 'Fields',           path: '/ticketing/settings/fields' },
  { label: 'Sources',          path: '/ticketing/settings/sources' },
  { label: 'Assignment rules', path: '/ticketing/settings/assignment' },
  { label: 'SLA rules',        path: '/ticketing/settings/sla' },
];

const REPORTS_LINKS: NavLink[] = [
  { label: 'Agent productivity', path: '/ticketing/reports/agent-productivity' },
];

const TicketingL2Nav: React.FC = () => {
  const [actionsOpen, setActionsOpen] = useState(true);
  const [reportsOpen, setReportsOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [activeView, setActiveView] = useState<TicketingView>('all');

  const location = useLocation();
  const navigate = useNavigate();

  const onSettingsRoute = location.pathname.startsWith('/ticketing/settings');
  const onReportsRoute = location.pathname.startsWith('/ticketing/reports');
  const onActionsRoute = !onSettingsRoute && !onReportsRoute;

  const goToTickets = (view: TicketingView) => {
    setActiveView(view);
    navigate('/ticketing');
  };

  const renderSubItem = (link: NavLink) => (
    <button
      key={link.path}
      className={`${styles.navItem} ${location.pathname === link.path ? styles.active : ''}`}
      onClick={() => navigate(link.path)}
      type="button"
    >
      <span className={styles.navLabel}>{link.label}</span>
    </button>
  );

  return (
    <nav className={styles.l2Nav} aria-label="Ticketing navigation">
      <div className={styles.productTitle}>Ticketing AI</div>

      <div className={styles.navItems}>
        <button className={styles.createBtn} type="button">
          <span className={styles.navLabel}>Create ticket</span>
          <IconPlusCircle size={20} />
        </button>

        <button
          className={styles.sectionHeader}
          onClick={() => setActionsOpen(o => !o)}
          aria-expanded={actionsOpen}
          type="button"
        >
          <span className={styles.sectionLabel}>Actions</span>
          {actionsOpen
            ? <IconChevronUp size={18} color="#555" />
            : <IconChevronDown size={18} color="#555" />}
        </button>

        {actionsOpen && (
          <>
            <button
              className={`${styles.navItem} ${onActionsRoute && activeView === 'my' ? styles.active : ''}`}
              onClick={() => goToTickets('my')}
              type="button"
            >
              <span className={styles.navLabel}>My tickets</span>
            </button>

            <button
              className={`${styles.navItem} ${onActionsRoute && activeView === 'all' ? styles.active : ''}`}
              onClick={() => goToTickets('all')}
              type="button"
            >
              <span className={styles.navLabel}>View all tickets</span>
            </button>
          </>
        )}

        <button
          className={styles.sectionHeader}
          onClick={() => setReportsOpen(o => !o)}
          aria-expanded={reportsOpen}
          type="button"
        >
          <span className={styles.sectionLabel}>Reports</span>
          {reportsOpen
            ? <IconChevronUp size={18} color="#555" />
            : <IconChevronDown size={18} color="#555" />}
        </button>

        {reportsOpen && REPORTS_LINKS.map(renderSubItem)}

        <button
          className={styles.sectionHeader}
          onClick={() => setSettingsOpen(o => !o)}
          aria-expanded={settingsOpen}
          type="button"
        >
          <span className={styles.sectionLabel}>Settings</span>
          {settingsOpen
            ? <IconChevronUp size={18} color="#555" />
            : <IconChevronDown size={18} color="#555" />}
        </button>

        {settingsOpen && SETTINGS_LINKS.map(renderSubItem)}
      </div>
    </nav>
  );
};

export default TicketingL2Nav;
