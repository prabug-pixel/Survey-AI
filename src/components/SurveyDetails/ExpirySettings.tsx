import React, { useMemo, useState, useRef, useEffect } from 'react';
import Toggle from '@birdeye/elemental/core/atoms/Toggle';
import Button from '@birdeye/elemental/core/atoms/Button';
import FormInput from '@birdeye/elemental/core/atoms/FormInput';
import TextArea from '@birdeye/elemental/core/atoms/TextArea';
import SingleSelect from '@birdeye/elemental/core/atoms/SingleSelect';
import Tooltip from '@birdeye/elemental/core/atoms/Tooltip';
import DatePicker from '@birdeye/elemental/core/components/DatePicker';
import { useAppDispatch } from '../../store';
import { surveyActions } from '../../store/surveySlice';
import type { SavedSurvey, ExpirationConfig } from '../../types/survey.types';
import { GRACE_PERIOD_OPTIONS } from '../../types/survey.types';
import { IconInfo, IconWarning } from '../../shared/Icons/Icons';
import styles from './ExpirySettings.module.scss';

interface Props {
  survey: SavedSurvey;
}

const DEFAULT_CONFIG: ExpirationConfig = {
  enabled: false,
  timezone: 'America/Los_Angeles',
  gracePeriodEnabled: true,
  gracePeriodHours: 24,
  closedMessage: {
    title: 'This survey has closed',
    body: 'Thank you for your interest. This survey is no longer accepting responses.',
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
  redirectUrl?: string;
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

  const ctaUrl = (config.closedMessage.ctaUrl ?? '').trim();
  if (ctaUrl && !isValidUrl(ctaUrl)) {
    errors.redirectUrl = 'Enter a valid URL starting with https://';
  }

  return errors;
};

const ExpirySettings: React.FC<Props> = ({ survey }) => {
  const dispatch = useAppDispatch();

  // The persisted config (source of truth from Redux). The form edits a local
  // `draft` copy; Save commits the draft back via `patchExpiration`, Cancel
  // discards it. CTAs only surface when draft diverges from baseline.
  const baseline = useMemo<ExpirationConfig>(
    () => (survey.expiration ? { ...DEFAULT_CONFIG, ...survey.expiration } : { ...DEFAULT_CONFIG }),
    [survey.expiration]
  );

  const [draft, setDraft] = useState<ExpirationConfig>(baseline);

  // Re-sync draft when the persisted config changes externally (e.g. after a
  // Close Now / Reopen action elsewhere). Skip while the user has unsaved
  // edits to avoid clobbering in-progress changes.
  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(baseline),
    [draft, baseline]
  );
  useEffect(() => {
    if (!isDirty) setDraft(baseline);
  }, [baseline, isDirty]);

  const config = draft;

  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerFieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showDatePicker) return;
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (datePickerFieldRef.current && !datePickerFieldRef.current.contains(target)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showDatePicker]);

  const errors = validate(config);
  const hasErrors = Object.keys(errors).length > 0;

  const patch = <K extends keyof ExpirationConfig>(key: K, value: ExpirationConfig[K]) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  };

  const patchMsg = (field: keyof ExpirationConfig['closedMessage'], value: string) => {
    setDraft(prev => ({ ...prev, closedMessage: { ...prev.closedMessage, [field]: value } }));
  };

  const patchNotif = (field: keyof ExpirationConfig['notifications'], value: boolean) => {
    setDraft(prev => ({ ...prev, notifications: { ...prev.notifications, [field]: value } }));
  };

  const handleSave = () => {
    if (hasErrors) return;
    dispatch(surveyActions.patchExpiration({
      surveyId: survey.id,
      config: draft,
      actor: survey.owner,
    }));
  };

  const handleCancel = () => {
    setDraft(baseline);
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

  const showFieldError = (k: keyof ValidationErrors) => Boolean(errors[k]);

  return (
    <div className={styles.expiryTab}>
      <div className={styles.expiryLeft}>

      {/* ── Status banner (Aero slim warning/info banner) ──── */}
      {/* Banner reflects the saved state so users don't see a misleading
         "Survey closes on X" line while their changes are still in draft. */}
      {(() => {
        if (!baseline.enabled || !baseline.endDate) return null;
        const savedHoursLeft = (new Date(baseline.endDate).getTime() - Date.now()) / 3600000;
        const savedWarn = savedHoursLeft <= 72 && savedHoursLeft > 0;
        const savedPast = savedHoursLeft <= 0;
        const savedGraceLabel = GRACE_PERIOD_OPTIONS.find(o => o.value === baseline.gracePeriodHours)?.label
          ?? `${baseline.gracePeriodHours}h`;
        return (
          <div className={`${styles.banner} ${savedWarn || savedPast ? styles.bannerWarn : styles.bannerInfo}`}>
            <span className={styles.bannerIcon}>
              {savedWarn || savedPast
                ? <IconWarning size={16} color="#f57c00" />
                : <IconInfo size={20} color="#1976d2" />}
            </span>
            <p className={styles.bannerMessage}>
              {'Survey closes on '}
              <strong>{fmt(baseline.endDate)}</strong>
              {` (${baseline.timezone}) · Grace period: `}
              <strong>{baseline.gracePeriodEnabled ? savedGraceLabel : 'off'}</strong>
            </p>
          </div>
        );
      })()}

      {/* ── Main settings card ────────────────────────────── */}
      <div className={styles.card}>
        <div className={`${styles.cardHeader} ${config.enabled ? styles.cardHeaderExpanded : ''}`}>
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
                    <span className={`${styles.fieldLabel} ${styles.requiredLabel}`}>End date</span>
                    <Tooltip text="The survey closes automatically on this date" position="right" hideOnScroll>
                      <button type="button" className={styles.infoIconBtn} aria-label="End date info">
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
                          isRequired
                        />
                      </div>
                    )}
                  </div>
                  {showFieldError('endDate') && <span className={styles.errorText}>{errors.endDate}</span>}
                </div>

                <div className={styles.fieldGroup}>
                  <div className={styles.fieldLabelRow}>
                    <span className={styles.fieldLabel}>Timezone</span>
                    <Tooltip text="Account timezone. Contact your admin to change it." position="right" hideOnScroll>
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
                  <h3 className={styles.sectionTitle}>Grace period for in-progress sessions</h3>
                  <p className={styles.sectionDesc}>
                    Applies to multi-page surveys. Respondents who answered at least one question before expiry
                    can continue for this duration. After it ends, we save their partial responses and show
                    them the closed-survey page.
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
                <h3 className={styles.sectionTitle}>Closed survey page</h3>
                <p className={styles.sectionDesc}>
                  Respondents see this when the survey stops accepting responses.
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
                  label={<>Message body <span className={styles.requiredAsterisk}>*</span></>}
                  value={config.closedMessage.body}
                  onChange={(_event: unknown, value: string) => patchMsg('body', String(value ?? ''))}
                  rows={4}
                  autoSize={false}
                  noFloatingLabel
                />
                {showFieldError('body') && <span className={styles.errorText}>{errors.body}</span>}
              </div>

              <div className={styles.fieldGroup}>
                <FormInput
                  name="ctaUrl"
                  type="text"
                  label="Auto-redirect URL"
                  placeholder="https://aspendental.com"
                  value={config.closedMessage.ctaUrl ?? ''}
                  onChange={(_event: unknown, value: string) => patchMsg('ctaUrl', String(value ?? ''))}
                />
                <span className={styles.hint}>
                  When set, we redirect respondents to this URL after a short delay.
                </span>
                {showFieldError('redirectUrl') && <span className={styles.errorText}>{errors.redirectUrl}</span>}
              </div>
            </section>

            {/* ── Email notifications ────────────────────── */}
            <section className={styles.section}>
              <div className={styles.sectionTitleRow}>
                <div className={styles.sectionTitleText}>
                  <h3 className={styles.sectionTitle}>Email notifications</h3>
                  <p className={styles.sectionDesc}>
                    Sent to the survey owner ({survey.owner}).
                  </p>
                </div>
                <Toggle
                  name="notif-enabled"
                  checked={config.notifications.enabled}
                  onChange={(_: unknown, e: { target: { checked: boolean } }) => patchNotif('enabled', e.target.checked)}
                  roundedToggle
                />
              </div>

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

        {isDirty && (
          <div className={styles.formFooter}>
            <Button theme="secondary" label="Cancel" onClick={handleCancel} />
            <Button theme="primary" label="Save changes" onClick={handleSave} disabled={hasErrors} />
          </div>
        )}

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
              {(() => {
                const url = (config.closedMessage.ctaUrl ?? '').trim();
                if (!url) return null;
                return (
                  <p className={styles.previewRedirect}>
                    Redirecting you to <strong>{url}</strong> in a few seconds…
                  </p>
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
