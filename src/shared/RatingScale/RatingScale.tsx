import React from 'react';
import styles from './RatingScale.module.scss';

interface RatingScaleProps {
  scale: number;
  lowLabel: string;
  highLabel: string;
  selectedValue?: number | null;
  onSelect?: (value: number) => void;
  disabled?: boolean;
}

const SCALE_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: '#fdecea', text: '#d32f2f' },
  2: { bg: '#fef3e0', text: '#f57c00' },
  3: { bg: '#fff9e6', text: '#fbc02d' },
  4: { bg: '#e8f5e9', text: '#66bb6a' },
  5: { bg: '#e0f2e9', text: '#2e7d32' },
};

const RatingScale: React.FC<RatingScaleProps> = ({
  scale,
  lowLabel,
  highLabel,
  selectedValue = null,
  onSelect,
  disabled = false,
}) => {
  const values = Array.from({ length: scale }, (_, i) => i + 1);

  return (
    <div className={styles.ratingScale}>
      <div className={styles.buttons}>
        {values.map((val) => {
          const colorMap = SCALE_COLORS[val] || SCALE_COLORS[3];
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
