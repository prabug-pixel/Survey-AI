// Reusable date input for Ticketing forms. Renders a read-only FormInput
// trigger with a calendar icon; on click/focus, opens the Birdeye elemental
// DatePicker in a popup. The popup is portaled to document.body and uses
// fixed positioning so it escapes Modal scroll/overflow containers, and
// flips above the trigger when there isn't enough room below.
// Storage format is YYYY-MM-DD; display is MM/DD/YYYY.
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import FormInput from '@birdeye/elemental/core/atoms/FormInput';
import DatePicker from '@birdeye/elemental/core/components/DatePicker';
import styles from './TicketDateField.module.scss';

interface Props {
  name: string;
  /** YYYY-MM-DD or empty. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** When true, picker only allows dates from today onward. */
  disablePastDates?: boolean;
}

// Used only for flip-direction math; popup grows naturally inside.
const POPUP_ESTIMATED_HEIGHT = 380;
const POPUP_WIDTH = 320;
const VIEWPORT_MARGIN = 8;

const toDisplay = (iso: string): string => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${m}/${d}/${y}`;
};

const toIsoDate = (input?: string): string => {
  if (!input) return '';
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return '';
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const d = String(parsed.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const TicketDateField: React.FC<Props> = ({ name, value, onChange, placeholder, disablePastDates }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      setPosition(null);
      return;
    }
    const r = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const spaceAbove = r.top;
    const openUp = spaceBelow < POPUP_ESTIMATED_HEIGHT && spaceAbove > spaceBelow;
    const top = openUp
      ? Math.max(VIEWPORT_MARGIN, r.top - POPUP_ESTIMATED_HEIGHT - 4)
      : r.bottom + 4;
    const left = Math.max(
      VIEWPORT_MARGIN,
      Math.min(window.innerWidth - POPUP_WIDTH - VIEWPORT_MARGIN, r.left),
    );
    setPosition({ top, left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const inTrigger = triggerRef.current?.contains(target);
      const inPopup = popupRef.current?.contains(target);
      if (!inTrigger && !inPopup) setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  // FormInput overrides its inner input's onClick with its own internal
  // handler, so user-supplied onClick on the FormInput is dropped. Bind the
  // open trigger to the wrapper div instead — any click inside the field
  // area (icon, input, padding) opens the picker.
  const handleOpen = () => setOpen(true);

  return (
    <div
      className={styles.field}
      ref={triggerRef}
      onMouseDown={handleOpen}
    >
      <FormInput
        name={name}
        type="text"
        value={toDisplay(value)}
        placeholder={placeholder ?? 'MM/DD/YYYY'}
        onFocus={handleOpen}
        showLeftIcon
        customIconClass="icon_phoenix-calendar"
        readOnly
      />
      {open && position && createPortal(
        <div
          ref={popupRef}
          className={styles.popup}
          style={{ top: position.top, left: position.left }}
        >
          <DatePicker
            name={`${name}-popup`}
            startDt={value || undefined}
            range={false}
            disablePastDates={disablePastDates}
            enableFutureDates
            showApplyButtons
            applyButtonLabel="Apply"
            sendDateTime={(start) => {
              onChange(toIsoDate(start));
              setOpen(false);
            }}
            cancelCalendarPopup={() => setOpen(false)}
            closeOnClickOutside={() => setOpen(false)}
            dynamicClass="profile-datepicker"
          />
        </div>,
        document.body,
      )}
    </div>
  );
};

export default TicketDateField;
