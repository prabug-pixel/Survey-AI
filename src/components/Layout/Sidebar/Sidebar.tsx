import React, { useState } from 'react';
import styles from './Sidebar.module.scss';

// Figma-exact icon assets
import birdeyeLogo from '../../../assets/figma-icons/birdeye-logo.svg';
import homeIcon from '../../../assets/figma-icons/home.svg';
import inboxIcon from '../../../assets/figma-icons/inbox.svg';
import listingsIcon from '../../../assets/figma-icons/listings.svg';
import reviewsIcon from '../../../assets/figma-icons/reviews.svg';
import referralsIcon from '../../../assets/figma-icons/referrals.svg';
import paymentsIcon from '../../../assets/figma-icons/payments.svg';
import appointmentsIcon from '../../../assets/figma-icons/appointments.svg';
import socialIcon from '../../../assets/figma-icons/social.svg';
import surveysIcon from '../../../assets/figma-icons/surveys.svg';
import ticketingIcon from '../../../assets/figma-icons/ticketing.svg';
import contactsIcon from '../../../assets/figma-icons/contacts.svg';
import campaignsIcon from '../../../assets/figma-icons/campaigns.svg';
import marketingAutoIcon from '../../../assets/figma-icons/marketing-auto.svg';
import reportsIcon from '../../../assets/figma-icons/reports.svg';
import insightsIcon from '../../../assets/figma-icons/insights.svg';
import competitorsIcon from '../../../assets/figma-icons/competitors.svg';
import settingsIcon from '../../../assets/figma-icons/settings.svg';

interface NavItem {
  id: string;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', icon: homeIcon, label: 'Overview' },
  { id: 'inbox', icon: inboxIcon, label: 'Inbox' },
  { id: 'listings', icon: listingsIcon, label: 'Listings' },
  { id: 'reviews', icon: reviewsIcon, label: 'Reviews' },
  { id: 'referrals', icon: referralsIcon, label: 'Referrals' },
  { id: 'payments', icon: paymentsIcon, label: 'Payments' },
  { id: 'appointments', icon: appointmentsIcon, label: 'Appointments' },
  { id: 'social', icon: socialIcon, label: 'Social' },
  { id: 'surveys', icon: surveysIcon, label: 'Surveys' },
  { id: 'ticketing', icon: ticketingIcon, label: 'Ticketing' },
  { id: 'contacts', icon: contactsIcon, label: 'Contacts' },
  { id: 'campaigns', icon: campaignsIcon, label: 'Campaigns' },
  { id: 'marketing', icon: marketingAutoIcon, label: 'Marketing Automation' },
  { id: 'reports', icon: reportsIcon, label: 'Reports' },
  { id: 'insights', icon: insightsIcon, label: 'Insights' },
  { id: 'competitors', icon: competitorsIcon, label: 'Competitors' },
];

const Sidebar: React.FC = () => {
  const [activeItem, setActiveItem] = useState('surveys');

  return (
    <nav className={styles.sidebar} aria-label="Primary navigation">
      {/* Birdeye logo */}
      <div className={styles.logoRow}>
        <img src={birdeyeLogo} alt="Birdeye" className={styles.logo} />
      </div>

      {/* Main nav items */}
      <div className={styles.navList}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={() => setActiveItem(item.id)}
              title={item.label}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <img src={item.icon} alt="" className={styles.navIcon} />
            </button>
          );
        })}

        {/* Divider */}
        <div className={styles.divider} />

        {/* Settings */}
        <button className={styles.navItem} title="Settings" aria-label="Settings">
          <img src={settingsIcon} alt="" className={styles.navIcon} />
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
