import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import styles from './AppLayout.module.scss';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => (
  <div className={styles.appLayout}>
    <Sidebar />
    <main className={styles.mainContent}>{children}</main>
  </div>
);

export default AppLayout;
