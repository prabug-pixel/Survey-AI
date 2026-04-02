import React from 'react';
import { useAppSelector, useAppDispatch } from '../../../store';
import { surveyActions } from '../../../store/surveySlice';
import aiTabIcon from '../../../assets/figma-icons/ai-tab-icon.svg';
import styles from './TabSwitcher.module.scss';

const TabSwitcher: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((s) => s.survey.activeTab);

  return (
    <div className={styles.tabs}>
      <button
        className={`${styles.tab} ${activeTab === 'ai' ? styles.active : ''}`}
        onClick={() => dispatch(surveyActions.setActiveTab('ai'))}
      >
        <span className={styles.tabLabel}>Create with</span>
        <img src={aiTabIcon} alt="AI" className={styles.aiIcon} />
        {activeTab === 'ai' && <div className={styles.activeBar} />}
        {activeTab !== 'ai' && <div className={styles.inactiveBar} />}
      </button>
      <button
        className={`${styles.tab} ${activeTab === 'manual' ? styles.active : ''}`}
        onClick={() => dispatch(surveyActions.setActiveTab('manual'))}
      >
        <span className={styles.tabLabel}>Create manually</span>
        {activeTab === 'manual' && <div className={styles.activeBar} />}
        {activeTab !== 'manual' && <div className={styles.inactiveBar} />}
      </button>
    </div>
  );
};

export default TabSwitcher;
