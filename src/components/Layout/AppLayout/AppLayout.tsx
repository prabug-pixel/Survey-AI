import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import TopBar from '../TopBar/TopBar';
import SurveyL2Nav from '../../SurveyL2Nav/SurveyL2Nav';
import styles from './AppLayout.module.scss';

interface AppLayoutProps {
  children: React.ReactNode;
}

// L2 nav belongs only on the survey landing page. Drill-down routes
// (/surveys/:id, /surveys/:id/campaigns, /surveys/create) get their
// own in-page navigation (breadcrumb + tab bar) and should not show it.
const isSurveyLandingPath = (pathname: string) =>
  pathname === '/surveys' || pathname === '/surveys/';

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const showL2Nav = isSurveyLandingPath(location.pathname);

  return (
    <div className={styles.appLayout}>
      <Sidebar />
      {showL2Nav && <SurveyL2Nav />}
      <div className={styles.contentColumn}>
        <TopBar />
        <main className={styles.mainContent}>{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
