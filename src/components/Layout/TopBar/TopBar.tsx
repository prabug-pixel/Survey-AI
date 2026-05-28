import React from 'react';
import { useLocation } from 'react-router-dom';
import styles from './TopBar.module.scss';

const isMarketingAutomationPath = (pathname: string) =>
  /^\/surveys\/[^/]+\/campaigns(\/|$)/.test(pathname);

const productLabelFor = (pathname: string): string | null => {
  if (isMarketingAutomationPath(pathname)) return 'Marketing Automation AI';
  if (pathname.startsWith('/surveys')) return 'Surveys AI';
  return null;
};

const IconPlusFilled: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M8 3.5v9M3.5 8h9" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const IconHelp: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="#424242" strokeWidth="1.5" />
    <path
      d="M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.5-1.5 1.8-2.2 2.5-.4.4-.5.8-.5 1.4"
      stroke="#424242"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="12" cy="17" r="0.9" fill="#424242" />
  </svg>
);

const IconHamburger: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 7h16M4 12h16M4 17h16" stroke="#212121" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const Avatar: React.FC = () => (
  <div className={styles.avatar} aria-label="User profile">
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="14" fill="#E1BEE7" />
      <circle cx="14" cy="11" r="4.5" fill="#5D4037" />
      <path d="M5 26c1.5-4.5 5-7 9-7s7.5 2.5 9 7" fill="#3E2723" />
    </svg>
  </div>
);

const TopBar: React.FC = () => {
  const location = useLocation();
  const productLabel = productLabelFor(location.pathname);

  return (
    <header className={styles.topBar} aria-label="Top bar">
      <div className={styles.left}>
        {productLabel && <span className={styles.productLabel}>{productLabel}</span>}
      </div>
      <div className={styles.right}>
        <button className={styles.addBtn} aria-label="Quick create">
          <IconPlusFilled size={16} />
        </button>
        <button className={styles.iconBtn} aria-label="Help">
          <IconHelp size={22} />
        </button>
        <Avatar />
        <button className={styles.iconBtn} aria-label="Open menu">
          <IconHamburger size={22} />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
