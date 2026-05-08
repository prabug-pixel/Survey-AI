import React from 'react';
import type { Question } from '../../../../types/survey.types';
import Checkbox from '../../../../shared/Checkbox/Checkbox';
import styles from './LocationEditor.module.scss';

interface LocationEditorProps {
  question: Question;
}

const LOCATION_OPTIONS = [
  { value: 'All locations', label: 'All locations' },
  { value: 'Region 1', label: 'Region 1' },
];

const LocationEditor: React.FC<LocationEditorProps> = ({ question }) => {
  const config = question.locationConfig;

  if (!config) return null;

  return (
    <div className={styles.locationEditor}>
      <div className={styles.field}>
        <label className={styles.label}>Select location choices</label>
        <select
          name="locationSelect"
          className={styles.nativeSelect}
          defaultValue={config.locationChoices}
        >
          {LOCATION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className={styles.checkboxRow}>
        <Checkbox
          checked={config.showAlias}
          onChange={() => {}}
          label="Show alias location name in the dropdown for survey participants to choose."
          name="showAlias"
        />
      </div>
    </div>
  );
};

export default LocationEditor;
