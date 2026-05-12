import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import OverviewIcon from '../../../assets/Icons/Overview.svg';
import InboxIcon from '../../../assets/Icons/Inbox.svg';
import ListingsIcon from '../../../assets/Icons/Listings.svg';
import ReviewsIcon from '../../../assets/Icons/Reviews.svg';
import ReferralsIcon from '../../../assets/Icons/Referrals.svg';
import PaymentsIcon from '../../../assets/Icons/Payments.svg';
import AppointmentsIcon from '../../../assets/Icons/Appointments.svg';
import SocialIcon from '../../../assets/Icons/Social.svg';
import SurveysIcon from '../../../assets/Icons/Surveys.svg';
import TicketingIcon from '../../../assets/Icons/Ticketing.svg';
import ContactsIcon from '../../../assets/Icons/Contacts.svg';
import CampaignsIcon from '../../../assets/Icons/Campaigns.svg';
import MarketingAutomationIcon from '../../../assets/Icons/Marketing Automation.svg';
import ReportsIcon from '../../../assets/Icons/Reports.svg';
import InsightsIcon from '../../../assets/Icons/Insights.svg';
import CompetitorsIcon from '../../../assets/Icons/Competitors.svg';
import SettingsIcon from '../../../assets/Icons/Settings.svg';
import styles from './Sidebar.module.scss';

interface NavItem {
  id: string;
  icon: string;
  label: string;
  path?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home',         icon: OverviewIcon,             label: 'Home' },
  { id: 'inbox',        icon: InboxIcon,                label: 'Inbox' },
  { id: 'listings',     icon: ListingsIcon,             label: 'Listings' },
  { id: 'reviews',      icon: ReviewsIcon,              label: 'Reviews' },
  { id: 'referrals',    icon: ReferralsIcon,            label: 'Referrals' },
  { id: 'payments',     icon: PaymentsIcon,             label: 'Payments' },
  { id: 'appointments', icon: AppointmentsIcon,         label: 'Appointments' },
  { id: 'social',       icon: SocialIcon,               label: 'Social' },
  { id: 'surveys',      icon: SurveysIcon,              label: 'Surveys',    path: '/surveys' },
  { id: 'ticketing',    icon: TicketingIcon,            label: 'Ticketing' },
  { id: 'contacts',     icon: ContactsIcon,             label: 'Contacts' },
  { id: 'campaigns',    icon: CampaignsIcon,            label: 'Campaigns' },
  { id: 'automation',   icon: MarketingAutomationIcon,  label: 'Marketing Automation' },
  { id: 'reports',      icon: ReportsIcon,              label: 'Reports' },
  { id: 'insights',     icon: InsightsIcon,             label: 'Insights' },
  { id: 'competitors',  icon: CompetitorsIcon,          label: 'Competitors' },
];

const BirdeyeLogo: React.FC = () => (
  <svg width={28} height={28} viewBox="0 0 32 32" fill="none">
    <path d="M25.6 11.2C24 7.2 20.27 4.53 16 4.53S8 7.2 6.4 11.2c-1.87 4.67-.4 9.87 3.47 12.67.93.67 2 1.07 3.07 1.33.53.13 1.07.27 1.6.27h2.93c.53 0 1.07-.13 1.6-.27 1.07-.27 2.13-.67 3.07-1.33C26 21.07 27.47 15.87 25.6 11.2z" fill="#2552ED"/>
    <path d="M20.53 14.93c-.4-.93-1.33-1.47-2.4-1.6h-.27c-.93 0-1.73.4-2.4 1.07-.13.13-.13.13-.27.27-.13-.13-.13-.13-.27-.27-.67-.67-1.47-1.07-2.4-1.07h-.27c-1.07.13-1.87.67-2.4 1.6-.53 1.2-.27 2.53.53 3.47l4.53 4.93.27.27.27-.27 4.53-4.93c.93-.93 1.07-2.27.53-3.47z" fill="white"/>
  </svg>
);

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveId = () => {
    // Survey-campaigns drill-down is a Marketing Automation product surface,
    // so highlight the automation icon while the user is in that flow.
    if (/^\/surveys\/[^/]+\/campaigns(\/|$)/.test(location.pathname)) return 'automation';
    if (location.pathname.startsWith('/surveys')) return 'surveys';
    return null;
  };

  const activeId = getActiveId();

  const handleNavClick = (item: NavItem) => {
    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <nav className={styles.sidebar} aria-label="Main navigation">
      <div className={styles.logo}>
        <BirdeyeLogo />
      </div>

      <div className={styles.navList}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeId === item.id;

          return (
            <button
              key={item.id}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={() => handleNavClick(item)}
              title={item.label}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <img src={item.icon} alt="" width={20} height={20} />
            </button>
          );
        })}
      </div>

      <div className={styles.separator} />

      <div className={styles.bottomNav}>
        <button className={styles.navItem} title="Settings" aria-label="Settings">
          <img src={SettingsIcon} alt="" width={20} height={20} />
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
