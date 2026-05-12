import React from 'react';
import { IconCheck } from '../Icons/Icons';
import styles from './Checkbox.module.scss';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  name,
  disabled = false,
  className = '',
}) => {
  const handleChange = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div 
      className={`${styles.checkboxContainer} ${disabled ? styles.disabled : ''} ${className}`}
      onClick={handleChange}
    >
      <div className={`${styles.box} ${checked ? styles.checked : ''}`}>
        {checked && <IconCheck size={14} color="#fff" />}
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={() => {}} // Controlled via container click for better hit area
          disabled={disabled}
          className={styles.hiddenInput}
        />
      </div>
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
};

export default Checkbox;
