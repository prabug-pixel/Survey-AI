import React, { useState } from 'react';
import {
  IconBirdeye,
  IconHome,
  IconChat,
  IconClock,
  IconStar,
  IconCalendar,
  IconDollar,
  IconTarget,
  IconUsers,
  IconSurvey,
  IconAnalytics,
  IconBulb,
  IconGlobe,
  IconSettings,
} from '../../../shared/Icons/Icons';
import styles from './Sidebar.module.scss';

interface NavItem {
  id: string;
  icon: React.FC<{ size?: number; color?: string }>;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', icon: IconHome, label: 'Home' },
  { id: 'chat', icon: IconChat, label: 'Messages' },
  { id: 'clock', icon: IconClock, label: 'Activity' },
  { id: 'star', icon: IconStar, label: 'Reviews' },
  { id: 'calendar', icon: IconCalendar, label: 'Calendar' },
  { id: 'dollar', icon: IconDollar, label: 'Payments' },
  { id: 'target', icon: IconTarget, label: 'Campaigns' },
  { id: 'users', icon: IconUsers, label: 'Contacts' },
  { id: 'survey', icon: IconSurvey, label: 'Surveys' },
  { id: 'analytics', icon: IconAnalytics, label: 'Analytics' },
  { id: 'bulb', icon: IconBulb, label: 'Insights' },
  { id: 'globe', icon: IconGlobe, label: 'Listings' },
];

const Sidebar: React.FC = () => {
  const [activeItem, setActiveItem] = useState('survey');

  return (
    <nav className={styles.sidebar} aria-label="Main navigation">
      <div className={styles.logo}>
        <IconBirdeye size={28} />
      </div>

      <div className={styles.navList}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
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
              <Icon size={20} color={isActive ? '#1a73e8' : '#757575'} />
            </button>
          );
        })}
      </div>

      <div className={styles.bottomNav}>
        <button className={styles.navItem} title="Settings" aria-label="Settings">
          <IconSettings size={20} color="#757575" />
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
