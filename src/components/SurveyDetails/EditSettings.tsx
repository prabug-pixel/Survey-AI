// ============================================================
// EditSettings — landing page for the "Edit settings" tab.
// ------------------------------------------------------------
// Replaces the previous direct-into-expiry flow with a landing
// page that lists all editable survey settings. Clicking a tile
// drills into that section. Currently only "Expiry Settings"
// is wired up; the other tiles are placeholders for upcoming
// features. The sub-section is tracked via `?section=` so the
// browser back button takes the user back to the landing.
// ============================================================
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import type { SavedSurvey } from '../../types/survey.types';
import ExpirySettings from './ExpirySettings';
import {
  IconArrowLeft,
  IconPalette,
  IconAtSign,
  IconUsers,
  IconBulb,
  IconClock,
} from '../../shared/Icons/Icons';
import styles from './EditSettings.module.scss';

interface Props {
  survey: SavedSurvey;
}

type EditSection = 'expiry';

interface SettingTile {
  key: EditSection | 'placeholder';
  title: string;
  description: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

const TILES: SettingTile[] = [
  {
    key: 'placeholder',
    title: 'Survey appearance',
    description: "Customize this survey's appearance to match your business' branding.",
    icon: <IconPalette size={32} color="#1976d2" />,
    disabled: true,
  },
  {
    key: 'placeholder',
    title: 'Email notifications',
    description: 'Setup rules to trigger email alerts when a response is received.',
    icon: <IconAtSign size={32} color="#1976d2" />,
    disabled: true,
  },
  {
    key: 'placeholder',
    title: 'Survey access',
    description: 'Control who can view or edit this survey.',
    icon: <IconUsers size={32} color="#1976d2" />,
    disabled: true,
  },
  {
    key: 'placeholder',
    title: 'Auto rules',
    description: 'Configure automated replies and follow-ups for respondents.',
    icon: <IconBulb size={32} color="#1976d2" />,
    disabled: true,
  },
  {
    key: 'expiry',
    title: 'Expiry settings',
    description: 'Control when this survey closes and what respondents see afterwards.',
    icon: <IconClock size={32} color="#1976d2" />,
  },
];

const EditSettings: React.FC<Props> = ({ survey }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const section = searchParams.get('section') as EditSection | null;

  const openSection = (next: EditSection) => {
    const params = new URLSearchParams(searchParams);
    params.set('section', next);
    setSearchParams(params, { replace: false });
  };

  const backToLanding = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('section');
    setSearchParams(params, { replace: false });
  };

  if (section === 'expiry') {
    return (
      <div className={styles.sectionWrap}>
        <div className={styles.sectionHeader}>
          <button
            type="button"
            className={styles.backBtn}
            aria-label="Back to Edit settings"
            onClick={backToLanding}
          >
            <IconArrowLeft size={20} color="#1C1B1F" />
          </button>
          <h2 className={styles.sectionTitle}>Expiry settings</h2>
        </div>
        <ExpirySettings survey={survey} />
      </div>
    );
  }

  return (
    <div className={styles.landing}>
      <div className={styles.tileGrid}>
        {TILES.map((tile, idx) => {
          const clickable = !tile.disabled && tile.key !== 'placeholder';
          return (
            <button
              key={`${tile.key}-${idx}`}
              type="button"
              className={`${styles.tile} ${tile.disabled ? styles.tileDisabled : ''}`}
              disabled={tile.disabled}
              onClick={clickable ? () => openSection(tile.key as EditSection) : undefined}
            >
              <span className={styles.tileIcon}>{tile.icon}</span>
              <span className={styles.tileTitle}>{tile.title}</span>
              <span className={styles.tileDesc}>{tile.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EditSettings;
