import React, { useMemo, useState, useRef, useEffect } from 'react';
import Toggle from '@birdeye/elemental/core/atoms/Toggle';
import Button from '@birdeye/elemental/core/atoms/Button';
import FormInput from '@birdeye/elemental/core/atoms/FormInput';
import TextArea from '@birdeye/elemental/core/atoms/TextArea';
import SingleSelect from '@birdeye/elemental/core/atoms/SingleSelect';
import Tooltip from '@birdeye/elemental/core/atoms/Tooltip';
import DatePicker from '@birdeye/elemental/core/components/DatePicker';
import TimePicker from '@birdeye/elemental/core/components/TimePicker';
import { useAppDispatch } from '../../store';
import { surveyActions } from '../../store/surveySlice';
import type { SavedSurvey, ExpirationConfig } from '../../types/survey.types';
import { GRACE_PERIOD_OPTIONS } from '../../types/survey.types';
import { IconClock, IconInfo, IconWarning } from '../../shared/Icons/Icons';
import styles from './ExpirySettings.module.scss';

interface Props {
  survey: SavedSurvey;
  onOpenAuditLog: () => void;
}

const DEFAULT_CONFIG: ExpirationConfig = {
  enabled: false,
  timezone: 'America/Los_Angeles',
  gracePeriodEnabled: true,
  gracePeriodHours: 24,
  closedMessage: {
    title: 'This survey has closed',
    body: 'Thank you for your interest. This survey is no longer accepting responses.',
    ctaText: '',
    ctaUrl: '',
  },
  notifications: {
    enabled: true,
    hours72: true,
    hours24: true,
    onAutoClose: true,
  },
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

const fmtDateOnly = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

const fmtTimeOnly = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

interface TimeParts {
  hours: number;          // 1..12
  minutes: number;        // 0..59
  meridiem: 'am' | 'pm';
}

const DEFAULT_TIME: TimeParts = { hours: 9, minutes: 0, meridiem: 'am' };

const isoToTimeParts = (iso?: string): TimeParts => {
  if (!iso) return DEFAULT_TIME;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return DEFAULT_TIME;
  const h24 = d.getHours();
  const meridiem: 'am' | 'pm' = h24 >= 12 ? 'pm' : 'am';
  const hours = h24 % 12 === 0 ? 12 : h24 % 12;
  return { hours, minutes: d.getMinutes(), meridiem };
};

const mergeDateAndTime = (dateIso: string, time: TimeParts): string => {
  const d = new Date(dateIso);
  const h24 =
    time.meridiem === 'am'
      ? (time.hours === 12 ? 0 : time.hours)
      : (time.hours === 12 ? 12 : time.hours + 12);
  d.setHours(h24, time.minutes, 0, 0);
  return d.toISOString();
};

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

interface ValidationErrors {
  endDate?: string;
  title?: string;
  body?: string;
  cta?: string;
}

const validate = (config: ExpirationConfig): ValidationErrors => {
  const errors: ValidationErrors = {};
  if (!config.enabled) return errors;

  if (!config.endDate) {
    errors.endDate = 'End date is required';
  } else if (new Date(config.endDate).getTime() <= Date.now()) {
    errors.endDate = 'End date must be in the future';
  }

  if (!config.closedMessage.title.trim()) {
    errors.title = 'Title is required';
  }
  if (!config.closedMessage.body.trim()) {
    errors.body = 'Message body is required';
  }

  const ctaText = (config.closedMessage.ctaText ?? '').trim();
  const ctaUrl = (config.closedMessage.ctaUrl ?? '').trim();
  if ((ctaText && !ctaUrl) || (!ctaText && ctaUrl)) {
    errors.cta = 'Set both CTA text and URL, or leave both empty';
  } else if (ctaUrl && !isValidUrl(ctaUrl)) {
    errors.cta = 'Enter a valid URL (including https://)';
  }

  return errors;
};

const ExpirySettings: React.FC<Props> = ({ survey, onOpenAuditLog }) => {
  const dispatch = useAppDispatch();

  // Config is derived directly from the persisted survey in Redux. Every
  // change dispatches `patchExpiration`, which writes back to the persisted
  // store — so the form, preview, and refresh-restored state all share one
  // source of truth.
  const config = useMemo<ExpirationConfig>(
    () => (survey.expiration ? { ...DEFAULT_CONFIG, ...survey.expiration } : { ...DEFAULT_CONFIG }),
    [survey.expiration]
  );

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const datePickerFieldRef = useRef<HTMLDivElement>(null);
  const timePickerFieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showDatePicker && !showTimePicker) return;
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (showDatePicker && datePickerFieldRef.current && !datePickerFieldRef.current.contains(target)) {
        setShowDatePicker(false);
      }
      if (showTimePicker && timePickerFieldRef.current && !timePickerFieldRef.current.contains(target)) {
        setShowTimePicker(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showDatePicker, showTimePicker]);

  const errors = validate(config);

  const commit = (next: ExpirationConfig) => {
    dispatch(surveyActions.patchExpiration({
      surveyId: survey.id,
      config: next,
      actor: survey.owner,
    }));
  };

  const patch = <K extends keyof ExpirationConfig>(key: K, value: ExpirationConfig[K]) => {
    commit({ ...config, [key]: value });
  };

  const patchMsg = (field: keyof ExpirationConfig['closedMessage'], value: string) => {
    commit({ ...config, closedMessage: { ...config.closedMessage, [field]: value } });
  };

  const patchNotif = (field: keyof ExpirationConfig['notifications'], value: boolean) => {
    commit({ ...config, notifications: { ...config.notifications, [field]: value } });
  };

  const timeParts = isoToTimeParts(config.endDate);

  const handleDatePicked = (startDt?: string) => {
    if (!startDt) {
      patch('endDate', undefined);
      return;
    }
    const parsed = new Date(startDt);
    if (Number.isNaN(parsed.getTime())) return;
    // Preserve the currently-set time portion (or the default) when only the
    // date is picked from the calendar.
    patch('endDate', mergeDateAndTime(parsed.toISOString(), timeParts));
  };

  const handleTimeChange = (
    option: { value: number | string; label: string },
    field: 'hours' | 'minutes' | 'meridiem'
  ) => {
    const baseIso = config.endDate ?? new Date().toISOString();
    const next: TimeParts = { ...timeParts };
    if (field === 'hours') next.hours = Number(option.value);
    else if (field === 'minutes') next.minutes = Number(option.value);
    else next.meridiem = String(option.value).toLowerCase() === 'pm' ? 'pm' : 'am';
    patch('endDate', mergeDateAndTime(baseIso, next));
  };

  const hoursLeft = config.endDate
    ? (new Date(config.endDate).getTime() - Date.now()) / 3600000
    : null;

  const graceLabel = GRACE_PERIOD_OPTIONS.find(o => o.value === config.gracePeriodHours)?.label
    ?? `${config.gracePeriodHours}h`;

  const isWarn = hoursLeft !== null && hoursLeft <= 72 && hoursLeft > 0;
  const isPast = hoursLeft !== null && hoursLeft <= 0;
  // Errors are surfaced live — the form auto-saves, so every keystroke
  // reflects the validation state of the current persisted config.
  const showFieldError = (k: keyof ValidationErrors) => Boolean(errors[k]);

  return (
    <div className={styles.expiryTab}>
      <div className={styles.expiryLeft}>

      {/* ── Status banner (Aero slim warning/info banner) ──── */}
      {config.enabled && config.endDate && (
        <div className={`${styles.banner} ${isWarn || isPast ? styles.bannerWarn : styles.bannerInfo}`}>
          <span className={styles.bannerIcon}>
            {isWarn || isPast
              ? <IconWarning size={16} color="#f57c00" />
              : <IconInfo size={20} color="#1976d2" />}
          </span>
          <p className={styles.bannerMessage}>
            {'Survey closes on '}
            <strong>{fmt(config.endDate)}</strong>
            {` (${config.timezone}) · Grace period: `}
            <strong>{config.gracePeriodEnabled ? graceLabel : 'off'}</strong>
          </p>
        </div>
      )}

      {/* ── Main settings card ────────────────────────────── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderText}>
            <h2 className={styles.cardTitle}>Survey Expiration</h2>
            <p className={styles.cardDesc}>Control when your survey is available to respondents</p>
          </div>
          <Toggle
            name="expiration-enabled"
            checked={config.enabled}
            onChange={(_: unknown, e: { target: { checked: boolean } }) => patch('enabled', e.target.checked)}
            roundedToggle
          />
        </div>

        <div className={styles.cardBody}>

            {/* ── Schedule ───────────────────────────────── */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Schedule</h3>
              <div className={styles.fieldGrid}>
                <div className={styles.fieldGroup}>
                  <div className={styles.fieldLabelRow}>
                    <span className={`${styles.fieldLabel} ${styles.requiredLabel}`}>End Date</span>
                    <Tooltip text="Survey will automatically close on this date" position="right" hideOnScroll>
                      <button type="button" className={styles.infoIconBtn} aria-label="End Date info">
                        <IconInfo size={14} />
                      </button>
                    </Tooltip>
                  </div>
                  <div className={styles.datePickerField} ref={datePickerFieldRef}>
                    <FormInput
                      name="endDate"
                      type="text"
                      value={config.endDate ? fmtDateOnly(config.endDate) : ''}
                      placeholder="Select date"
                      onClick={() => setShowDatePicker(true)}
                      onFocus={() => setShowDatePicker(true)}
                      showLeftIcon
                      customIconClass="icon_phoenix-calendar"
                      readOnly
                    />
                    {showDatePicker && (
                      <div className={styles.datePickerPopup}>
                        <DatePicker
                          name="endDatePopup"
                          startDt={config.endDate || undefined}
                          range={false}
                          disablePastDates
                          enableFutureDates
                          showApplyButtons
                          applyButtonLabel="Apply"
                          sendDateTime={(start) => {
                            handleDatePicked(start);
                            setShowDatePicker(false);
                          }}
                          cancelCalendarPopup={() => setShowDatePicker(false)}
                          closeOnClickOutside={() => setShowDatePicker(false)}
                          dynamicClass="profile-datepicker"
                          insidePopup
                          isRequired
                        />
                      </div>
                    )}
                  </div>
                  {showFieldError('endDate') && <span className={styles.errorText}>{errors.endDate}</span>}
                </div>

                <div className={styles.fieldGroup}>
                  <div className={styles.fieldLabelRow}>
                    <span className={`${styles.fieldLabel} ${styles.requiredLabel}`}>Time</span>
                    <Tooltip text="Time at which the survey closes" position="right" hideOnScroll>
                      <button type="button" className={styles.infoIconBtn} aria-label="Time info">
                        <IconInfo size={14} />
                      </button>
                    </Tooltip>
                  </div>
                  <div className={styles.datePickerField} ref={timePickerFieldRef}>
                    <FormInput
                      name="endTime"
                      type="text"
                      value={config.endDate ? fmtTimeOnly(config.endDate) : ''}
                      placeholder="Select time"
                      onClick={() => setShowTimePicker(true)}
                      onFocus={() => setShowTimePicker(true)}
                      showLeftIcon
                      customIconClass="icon_phoenix-clock"
                      readOnly
                    />
                    {showTimePicker && (
                      <div className={styles.datePickerPopup}>
                        <TimePicker
                          timeObject={timeParts}
                          changeTime={handleTimeChange}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.fieldLabelRow}>
                    <span className={styles.fieldLabel}>Timezone</span>
                    <Tooltip text="Account timezone · contact admin to change" position="right" hideOnScroll>
                      <button type="button" className={styles.infoIconBtn} aria-label="Timezone info">
                        <IconInfo size={14} />
                      </button>
                    </Tooltip>
                  </div>
                  <FormInput
                    name="timezone"
                    type="text"
                    value={config.timezone}
                    disabled
                  />
                </div>
              </div>
            </section>

            {/* ── Grace period ───────────────────────────── */}
            <section className={styles.section}>
              <div className={styles.sectionTitleRow}>
                <div className={styles.sectionTitleText}>
                  <h3 className={styles.sectionTitle}>Grace Period for In-Progress Sessions</h3>
                  <p className={styles.sectionDesc}>
                    Respondents who answered at least one question before expiry can continue for this duration.
                    After it ends, partial responses are saved and they see the closed-survey page.
                  </p>
                </div>
                <Toggle
                  name="grace-period-enabled"
                  checked={config.gracePeriodEnabled}
                  onChange={(_: unknown, e: { target: { checked: boolean } }) => patch('gracePeriodEnabled', e.target.checked)}
                  roundedToggle
                />
              </div>
              {config.gracePeriodEnabled && (
                <div className={styles.fieldGroup}>
                  <SingleSelect
                    name="gracePeriod"
                    displayLabel="Duration"
                    options={GRACE_PERIOD_OPTIONS}
                    selected={config.gracePeriodHours}
                    onChange={(option) => patch('gracePeriodHours', Number(option.value))}
                    isAeroDesign
                  />
                </div>
              )}
            </section>

            {/* ── Closed survey message ──────────────────── */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Closed Survey Page</h3>
                <p className={styles.sectionDesc}>
                  Shown to respondents when the survey is no longer accepting responses
                </p>
              </div>

              <div className={styles.fieldGroup}>
                <FormInput
                  name="closedTitle"
                  type="text"
                  label="Title"
                  labelClass={styles.requiredLabel}
                  value={config.closedMessage.title}
                  onChange={(_event: unknown, value: string) => patchMsg('title', String(value ?? ''))}
                  required
                />
                {showFieldError('title') && <span className={styles.errorText}>{errors.title}</span>}
              </div>

              <div className={styles.fieldGroup}>
                <TextArea
                  name="closedBody"
                  label={<>Message Body <span className={styles.requiredAsterisk}>*</span></>}
                  value={config.closedMessage.body}
                  onChange={(_event: unknown, value: string) => patchMsg('body', String(value ?? ''))}
                  rows={4}
                  autoSize={false}
                  noFloatingLabel
                />
                {showFieldError('body') && <span className={styles.errorText}>{errors.body}</span>}
              </div>

              <div className={styles.fieldGrid}>
                <div className={styles.fieldGroup}>
                  <FormInput
                    name="ctaText"
                    type="text"
                    label="CTA Button Text"
                    placeholder="Enter text"
                    value={config.closedMessage.ctaText ?? ''}
                    onChange={(_event: unknown, value: string) => patchMsg('ctaText', String(value ?? ''))}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <FormInput
                    name="ctaUrl"
                    type="text"
                    label="Redirect URL"
                    placeholder="https://aspendental.com"
                    value={config.closedMessage.ctaUrl ?? ''}
                    onChange={(_event: unknown, value: string) => patchMsg('ctaUrl', String(value ?? ''))}
                  />
                </div>
              </div>
              {showFieldError('cta') && <span className={styles.errorText}>{errors.cta}</span>}
            </section>

            {/* ── Email notifications ────────────────────── */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Email Notifications</h3>
                <p className={styles.sectionDesc}>
                  Sent to the survey owner ({survey.owner})
                </p>
              </div>

              <label className={styles.checkboxRow}>
                <FormInput
                  name="notifEnabled"
                  type="checkbox"
                  checked={config.notifications.enabled}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => patchNotif('enabled', e.target.checked)}
                />
                <span>Enable expiration notifications</span>
              </label>

              {config.notifications.enabled && (
                <div className={styles.checkIndent}>
                  {([
                    { name: 'notif72h', field: 'hours72' as const, label: '72 hours before expiration' },
                    { name: 'notif24h', field: 'hours24' as const, label: '24 hours before expiration' },
                    { name: 'notifAuto', field: 'onAutoClose' as const, label: 'When survey auto-closes' },
                  ] as const).map(({ name, field, label }) => (
                    <label key={name} className={styles.checkboxRow}>
                      <FormInput
                        name={name}
                        type="checkbox"
                        checked={config.notifications[field]}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => patchNotif(field, e.target.checked)}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              )}
            </section>

        </div>

        {/* ── Card footer ────────────────────────────────────
           Form auto-saves to the persisted Redux store on every change,
           so an explicit Save button is no longer required. The audit-log
           shortcut stays. */}
        <div className={styles.cardFooter}>
          <Button
            theme="secondary"
            label="View Audit Log"
            customIcon={<IconClock size={15} color="#555" />}
            onClick={onOpenAuditLog}
          />
        </div>
      </div>

      </div>

      {/* ── Right-side closed-survey preview ────────────── */}
      <div className={styles.expiryRight}>
        <span className={styles.previewLabel}>Preview</span>
        <div className={styles.previewPanel}>
          <div className={styles.previewContent}>
            <div className={styles.closedPreview}>
              <div className={styles.previewLogo}>apt</div>
              <h2 className={styles.previewTitle}>
                {config.closedMessage.title || 'This survey has closed'}
              </h2>
              <p className={styles.previewBody}>
                {config.closedMessage.body || 'Thank you for your interest.'}
              </p>
              {/* Preview button mirrors the CTA Button Text field exactly —
                 whatever the user types is what shows on the button. Click
                 opens the Redirect URL when one is set, otherwise the
                 button is non-clickable. */}
              {(() => {
                const label = config.closedMessage.ctaText ?? '';
                const url = (config.closedMessage.ctaUrl ?? '').trim();
                return url
                  ? (
                    <a
                      className={styles.previewCta}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {label}
                    </a>
                  ) : (
                    <span className={styles.previewCta} aria-disabled="true">
                      {label}
                    </span>
                  );
              })()}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ExpirySettings;
