import React from 'react';
import styles from './RatingScale.module.scss';

interface RatingScaleProps {
  scale: number;
  lowLabel: string;
  highLabel: string;
  selectedValue?: number | null;
  onSelect?: (value: number) => void;
  disabled?: boolean;
  startFromZero?: boolean;
}

const SCALE_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: '#fdecea', text: '#d32f2f' },
  2: { bg: '#fef3e0', text: '#f57c00' },
  3: { bg: '#fff9e6', text: '#fbc02d' },
  4: { bg: '#e8f5e9', text: '#66bb6a' },
  5: { bg: '#e0f2e9', text: '#2e7d32' },
};

// NPS-style colors: 0-6 red/warm, 7-8 yellow/neutral, 9-10 green/positive
const NPS_COLORS: Record<number, { bg: string; text: string }> = {
  0: { bg: '#fdecea', text: '#d32f2f' },
  1: { bg: '#fdecea', text: '#d32f2f' },
  2: { bg: '#fdecea', text: '#d32f2f' },
  3: { bg: '#fef3e0', text: '#e65100' },
  4: { bg: '#fef3e0', text: '#f57c00' },
  5: { bg: '#fff9e6', text: '#f9a825' },
  6: { bg: '#fff9e6', text: '#fbc02d' },
  7: { bg: '#f1f8e9', text: '#9ccc65' },
  8: { bg: '#e8f5e9', text: '#66bb6a' },
  9: { bg: '#e0f2e9', text: '#43a047' },
  10: { bg: '#e0f2e9', text: '#2e7d32' },
};

const RatingScale: React.FC<RatingScaleProps> = ({
  scale,
  lowLabel,
  highLabel,
  selectedValue = null,
  onSelect,
  disabled = false,
  startFromZero = false,
}) => {
  const values = startFromZero
    ? Array.from({ length: scale + 1 }, (_, i) => i)
    : Array.from({ length: scale }, (_, i) => i + 1);

  return (
    <div className={styles.ratingScale}>
      <div className={styles.buttons}>
        {values.map((val) => {
          const colorMap = startFromZero
            ? (NPS_COLORS[val] || NPS_COLORS[5])
            : (SCALE_COLORS[val] || SCALE_COLORS[3]);
          const isSelected = selectedValue === val;

          return (
            <button
              key={val}
              type="button"
              className={`${styles.ratingBtn} ${isSelected ? styles.selected : ''}`}
              style={{
                backgroundColor: colorMap.bg,
                color: colorMap.text,
                borderColor: isSelected ? colorMap.text : 'transparent',
              }}
              onClick={() => onSelect?.(val)}
              disabled={disabled}
              aria-label={`Rating ${val}`}
            >
              {val}
            </button>
          );
        })}
      </div>
      <div className={styles.labels}>
        <span className={styles.label}>{lowLabel}</span>
        <span className={styles.label}>{highLabel}</span>
      </div>
    </div>
  );
};

export default RatingScale;
