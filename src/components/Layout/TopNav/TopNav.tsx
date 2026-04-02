import React from 'react';
import addCircleIcon from '../../../assets/figma-icons/add-circle.svg';
import helpIcon from '../../../assets/figma-icons/help.svg';
import userAvatarIcon from '../../../assets/figma-icons/user-avatar.svg';
import menuIcon from '../../../assets/figma-icons/menu.svg';
import styles from './TopNav.module.scss';

const TopNav: React.FC = () => (
  <header className={styles.topNav}>
    <div className={styles.logoTitle}>
      <span className={styles.title}>Surveys AI</span>
    </div>

    <div className={styles.rightActions}>
      <button className={styles.iconBtn}>
        <img src={addCircleIcon} alt="Add" className={styles.icon} />
      </button>
      <button className={styles.iconBtn}>
        <img src={helpIcon} alt="Help" className={styles.icon} />
      </button>
      <button className={styles.iconBtn}>
        <img src={userAvatarIcon} alt="Profile" className={styles.icon} />
      </button>
      <button className={styles.iconBtn}>
        <img src={menuIcon} alt="Menu" className={styles.icon} />
      </button>
    </div>
  </header>
);

export default TopNav;
