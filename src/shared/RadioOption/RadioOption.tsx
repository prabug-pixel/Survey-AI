import React from 'react';
import styles from './RadioOption.module.scss';

interface RadioOptionProps {
  label: string;
  name: string;
  value: string;
  checked?: boolean;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const RadioOption: React.FC<RadioOptionProps> = ({
  label,
  name,
  value,
  checked = false,
  onChange,
  disabled = false,
}) => (
  <label className={`${styles.radioOption} ${checked ? styles.checked : ''}`}>
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={() => onChange?.(value)}
      disabled={disabled}
      className={styles.input}
    />
    <span className={styles.radio} />
    <span className={styles.label}>{label}</span>
  </label>
);

export default RadioOption;
