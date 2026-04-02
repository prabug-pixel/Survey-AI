import React from 'react';
import { useAppSelector, useAppDispatch } from '../../../store';
import { surveyActions } from '../../../store/surveySlice';
import TabHeader from '@birdeye/elemental/core/atoms/TabHeader';
import styles from './TabSwitcher.module.scss';

const TAB_CONTENT = [
  { label: 'Create with AI', value: 'ai' },
  { label: 'Create manually', value: 'manual' },
];

const TabSwitcher: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((s) => s.survey.activeTab);

  const handleTabClick = (tab: { value: string | number }) => {
    dispatch(surveyActions.setActiveTab(tab.value as 'ai' | 'manual'));
  };

  return (
    <div className={styles.tabSwitcher}>
      <TabHeader
        content={TAB_CONTENT}
        clickTab={handleTabClick}
        activeTab={activeTab}
        isAeroDesign
      />
    </div>
  );
};

export default TabSwitcher;
