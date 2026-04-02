import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import TopNav from '../TopNav/TopNav';
import styles from './AppLayout.module.scss';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => (
  <div className={styles.appLayout}>
    {/* Figma: Primary Rail Nav — leftmost, full height */}
    <Sidebar />

    {/* Right of sidebar: TopNav + content */}
    <div className={styles.rightSection}>
      {/* Figma: Top Nav — sticky, full width */}
      <TopNav />

      {/* Content below top nav */}
      <main className={styles.mainContent}>{children}</main>
    </div>
  </div>
);

export default AppLayout;
