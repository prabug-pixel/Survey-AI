import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import SurveyL2Nav from '../../SurveyL2Nav/SurveyL2Nav';
import styles from './AppLayout.module.scss';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isSurveysModule = location.pathname.startsWith('/surveys');

  return (
    <div className={styles.appLayout}>
      <Sidebar />
      {isSurveysModule && <SurveyL2Nav />}
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
};

export default AppLayout;
