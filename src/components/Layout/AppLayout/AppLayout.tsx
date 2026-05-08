import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import TopBar from '../TopBar/TopBar';
import SurveyL2Nav from '../../SurveyL2Nav/SurveyL2Nav';
import styles from './AppLayout.module.scss';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isSurveyCreateFlow =
    location.pathname === '/surveys/create' ||
    location.pathname.startsWith('/surveys/create/');
  const showL2 =
    location.pathname.startsWith('/surveys') && !isSurveyCreateFlow;

  return (
    <div className={styles.appLayout}>
      <Sidebar />
      {showL2 && <SurveyL2Nav />}
      <div className={styles.contentColumn}>
        <TopBar />
        <main className={styles.mainContent}>{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
