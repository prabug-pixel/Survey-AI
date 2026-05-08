import React from 'react';
import { useAppDispatch } from '../../../../store';
import { surveyActions } from '../../../../store/surveySlice';
import type { Question } from '../../../../types/survey.types';
import Checkbox from '../../../../shared/Checkbox/Checkbox';
import styles from './DateTimeEditor.module.scss';

interface DateTimeEditorProps {
  question: Question;
}

const TIME_OPTIONS = [
  { value: '08:00 AM', label: '08:00 AM' },
  { value: '09:00 AM', label: '09:00 AM' },
  { value: '10:00 AM', label: '10:00 AM' },
  { value: '05:00 PM', label: '05:00 PM' },
  { value: '06:00 PM', label: '06:00 PM' },
  { value: '07:00 PM', label: '07:00 PM' },
];

const INTERVAL_OPTIONS = [
  { value: '15 mins', label: '15 mins' },
  { value: '30 mins', label: '30 mins' },
  { value: '1 hour', label: '1 hour' },
];

const DateTimeEditor: React.FC<DateTimeEditorProps> = ({ question }) => {
  const dispatch = useAppDispatch();
  const config = question.dateTimeConfig;

  if (!config) return null;

  const updateConfig = (updates: Partial<typeof config>) => {
    dispatch(surveyActions.updateDateTimeConfig({ questionId: question.id, updates }));
  };

  return (
    <div className={styles.dateTimeEditor}>
      <div className={styles.checkboxGroup}>
        <Checkbox
          checked={config.includeDate}
          onChange={(checked) => updateConfig({ includeDate: checked })}
          label="Date"
          name="includeDate"
        />
        <Checkbox
          checked={config.includeTime}
          onChange={(checked) => updateConfig({ includeTime: checked })}
          label="Time"
          name="includeTime"
        />
      </div>

      <div className={styles.timeSettings}>
        <div className={styles.field}>
          <label className={styles.label}>Start at</label>
          <select
            name="startTime"
            className={styles.nativeSelect}
            value={config.startTime}
            onChange={(e) => updateConfig({ startTime: e.target.value })}
          >
            {TIME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>End at</label>
          <select
            name="endTime"
            className={styles.nativeSelect}
            value={config.endTime}
            onChange={(e) => updateConfig({ endTime: e.target.value })}
          >
            {TIME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Show intervals</label>
          <select
            name="interval"
            className={styles.nativeSelect}
            value={config.interval}
            onChange={(e) => updateConfig({ interval: e.target.value })}
          >
            {INTERVAL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default DateTimeEditor;
