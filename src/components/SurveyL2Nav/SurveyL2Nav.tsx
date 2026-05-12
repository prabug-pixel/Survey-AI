import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { surveyActions } from '../../store/surveySlice';
import {
  IconChevronDown,
  IconExternalLink,
  IconPlusCircle,
} from '../../shared/Icons/Icons';
import styles from './SurveyL2Nav.module.scss';

const SurveyL2Nav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const isAllSurveysActive = location.pathname === '/surveys' || location.pathname === '/surveys/';

  const handleCreateSurvey = () => {
    dispatch(surveyActions.resetSurvey());
    navigate('/surveys/create');
  };

  return (
    <nav className={styles.l2Nav} aria-label="Survey navigation">
      <div className={styles.productTitle}>Surveys AI</div>

      <div className={styles.navItems}>
        <button className={styles.createBtn} onClick={handleCreateSurvey}>
          <span className={styles.navLabel}>Create survey</span>
          <IconPlusCircle size={20} />
        </button>

        <button
          className={`${styles.navItem} ${isAllSurveysActive ? styles.active : ''}`}
          onClick={() => navigate('/surveys')}
        >
          <span className={styles.navLabel}>All surveys</span>
        </button>

        <button className={styles.navItem}>
          <span className={styles.navLabel}>Agents</span>
          <IconChevronDown size={20} color="#757575" />
        </button>

        <button className={styles.navItem}>
          <span className={styles.navLabel}>Settings</span>
          <IconChevronDown size={20} color="#757575" />
        </button>

        <button className={styles.navItem}>
          <span className={styles.navLabel}>Reports</span>
          <IconExternalLink size={16} color="#757575" />
        </button>
      </div>
    </nav>
  );
};

export default SurveyL2Nav;
