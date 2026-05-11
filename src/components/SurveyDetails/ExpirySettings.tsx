import React, { useMemo, useState, useRef, useEffect } from 'react';
import Toggle from '@birdeye/elemental/core/atoms/Toggle';
import Button from '@birdeye/elemental/core/atoms/Button';
import FormInput from '@birdeye/elemental/core/atoms/FormInput';
import TextArea from '@birdeye/elemental/core/atoms/TextArea';
import Tag from '@birdeye/elemental/core/atoms/Tag';
import SingleSelect from '@birdeye/elemental/core/atoms/SingleSelect';
import DatePicker from '@birdeye/elemental/core/components/DatePicker';
import type { SavedSurvey, ExpirationConfig } from '../../types/survey.types';
import { GRACE_PERIOD_OPTIONS } from '../../types/survey.types';
import { IconClock } from '../../shared/Icons/Icons';
import styles from './ExpirySettings.module.scss';

interface Props {
  survey: SavedSurvey;
  onSave: (config: ExpirationConfig) => void;
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

const sameConfig = (a: ExpirationConfig, b: ExpirationConfig) =>
  JSON.stringify(a) === JSON.stringify(b);

const ExpirySettings: React.FC<Props> = ({ survey, onSave, onOpenAuditLog }) => {
  const initialConfig = useMemo<ExpirationConfig>(
    () => (survey.expiration ? { ...DEFAULT_CONFIG, ...survey.expiration } : { ...DEFAULT_CONFIG }),
    [survey.expiration]
  );
  const [config, setConfig] = useState<ExpirationConfig>(initialConfig);
  const [showErrors, setShowErrors] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerFieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showDatePicker) return;
    const handleOutside = (e: MouseEvent) => {
      if (datePickerFieldRef.current && !datePickerFieldRef.current.contains(e.target as Node)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showDatePicker]);

  const errors = validate(config);
  const hasErrors = Object.keys(errors).length > 0;
  const isDirty = !sameConfig(config, initialConfig);

  const patch = <K extends keyof ExpirationConfig>(key: K, value: ExpirationConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const patchMsg = (field: keyof ExpirationConfig['closedMessage'], value: string) => {
    setConfig(prev => ({ ...prev, closedMessage: { ...prev.closedMessage, [field]: value } }));
  };

  const patchNotif = (field: keyof ExpirationConfig['notifications'], value: boolean) => {
    setConfig(prev => ({ ...prev, notifications: { ...prev.notifications, [field]: value } }));
  };

  const handleSave = () => {
    setShowErrors(true);
    if (hasErrors) return;
    onSave(config);
  };

  const handleDiscard = () => {
    setConfig(initialConfig);
    setShowErrors(false);
  };

  const handleDatePicked = (startDt?: string) => {
    if (!startDt) {
      patch('endDate', undefined);
      return;
    }
    const parsed = new Date(startDt);
    if (!Number.isNaN(parsed.getTime())) {
      patch('endDate', parsed.toISOString());
    }
  };

  const hoursLeft = config.endDate
    ? (new Date(config.endDate).getTime() - Date.now()) / 3600000
    : null;

  const graceLabel = GRACE_PERIOD_OPTIONS.find(o => o.value === config.gracePeriodHours)?.label
    ?? `${config.gracePeriodHours}h`;

  const isWarn = hoursLeft !== null && hoursLeft <= 72 && hoursLeft > 0;
  const isPast = hoursLeft !== null && hoursLeft <= 0;
  const showFieldError = (k: keyof ValidationErrors) => showErrors && Boolean(errors[k]);

  return (
    <div className={styles.expiryTab}>
      <div className={styles.expiryLeft}>

      {/* ── Status banner ─────────────────────────────────── */}
      {config.enabled && config.endDate && (
        <div className={`${styles.banner} ${isWarn || isPast ? styles.bannerWarn : styles.bannerInfo}`}>
          <IconClock size={16} color={isWarn || isPast ? '#e65100' : '#1976d2'} />
          <div className={styles.bannerContent}>
            <div className={styles.bannerHead}>
              <Tag
                title={isPast ? 'Expired' : isWarn ? 'Expiring Soon' : 'Expiration Active'}
                color={isPast ? 'red' : isWarn ? 'orange' : 'blue'}
                size="x-small"
              />
              <span className={styles.bannerEffective}>Effective expiration</span>
            </div>
            <span className={styles.bannerBody}>
              Survey closes on <strong>{fmt(config.endDate)}</strong> ({config.timezone})
              {config.gracePeriodEnabled
                ? <> · Grace period: <strong>{graceLabel}</strong></>
                : <> · Grace period: <strong>off</strong></>}
            </span>
          </div>
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
                  <div className={styles.datePickerField} ref={datePickerFieldRef}>
                    <FormInput
                      name="endDate"
                      type="text"
                      label="End Date & Time *"
                      value={config.endDate ? fmt(config.endDate) : ''}
                      placeholder="Select date and time"
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
                          showTimePicker
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
                  {showFieldError('endDate')
                    ? <span className={styles.errorText}>{errors.endDate}</span>
                    : <span className={styles.hint}>Survey will automatically close at this date and time</span>}
                </div>
                <div className={styles.fieldGroup}>
                  <FormInput
                    name="timezone"
                    type="text"
                    label="Timezone"
                    value={config.timezone}
                    disabled
                  />
                  <span className={styles.hint}>Account timezone · contact admin to change</span>
                </div>
              </div>
            </section>

            <div className={styles.separator} />

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

            <div className={styles.separator} />

            {/* ── Closed survey message ──────────────────── */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Closed Survey Page</h3>
              <p className={styles.sectionDesc}>
                Shown to respondents when the survey is no longer accepting responses
              </p>

              <div className={styles.fieldGroup}>
                <FormInput
                  name="closedTitle"
                  type="text"
                  label="Title *"
                  value={config.closedMessage.title}
                  onChange={(_: unknown, e: React.ChangeEvent<HTMLInputElement>) => patchMsg('title', e.target.value)}
                  required
                />
                {showFieldError('title') && <span className={styles.errorText}>{errors.title}</span>}
              </div>

              <div className={styles.fieldGroup}>
                <TextArea
                  name="closedBody"
                  label="Message Body *"
                  value={config.closedMessage.body}
                  onChange={(_: unknown, e: React.ChangeEvent<HTMLTextAreaElement>) => patchMsg('body', e.target.value)}
                  rows={4}
                  autoSize={false}
                />
                {showFieldError('body') && <span className={styles.errorText}>{errors.body}</span>}
              </div>

              <div className={styles.fieldGrid}>
                <div className={styles.fieldGroup}>
                  <FormInput
                    name="ctaText"
                    type="text"
                    label="CTA Button Text (optional)"
                    value={config.closedMessage.ctaText ?? ''}
                    onChange={(_: unknown, e: React.ChangeEvent<HTMLInputElement>) => patchMsg('ctaText', e.target.value)}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <FormInput
                    name="ctaUrl"
                    type="text"
                    label="CTA URL (optional)"
                    placeholder="https://example.com"
                    value={config.closedMessage.ctaUrl ?? ''}
                    onChange={(_: unknown, e: React.ChangeEvent<HTMLInputElement>) => patchMsg('ctaUrl', e.target.value)}
                  />
                </div>
              </div>
              {showFieldError('cta') && <span className={styles.errorText}>{errors.cta}</span>}
            </section>

            <div className={styles.separator} />

            {/* ── Email notifications ────────────────────── */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Email Notifications</h3>
              <p className={styles.sectionDesc}>
                Sent to the survey owner ({survey.owner})
              </p>

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

        {/* ── Card footer (save / discard) ───────────────── */}
        <div className={styles.cardFooter}>
          <Button
            theme="secondary"
            label="View Audit Log"
            customIcon={<IconClock size={15} color="#555" />}
            onClick={onOpenAuditLog}
          />
          <div className={styles.footerRight}>
            {isDirty && (
              <Button theme="noBorder" label="Discard" onClick={handleDiscard} />
            )}
            <Button
              theme="primary"
              label="Save Changes"
              onClick={handleSave}
              disabled={!isDirty || (showErrors && hasErrors)}
            />
          </div>
        </div>
      </div>

      </div>

      {/* ── Right-side closed-survey preview ────────────── */}
      <div className={styles.expiryRight}>
        <div className={styles.previewPanel}>
          <span className={styles.previewLabel}>Preview</span>
          <div className={styles.previewContent}>
            <div className={styles.closedPreview}>
              <div className={styles.previewLogo}>apt</div>
              <h2 className={styles.previewTitle}>
                {config.closedMessage.title || 'This survey has closed'}
              </h2>
              <p className={styles.previewBody}>
                {config.closedMessage.body || 'Thank you for your interest.'}
              </p>
              {config.closedMessage.ctaText && config.closedMessage.ctaUrl && (
                <a
                  className={styles.previewCta}
                  href={config.closedMessage.ctaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {config.closedMessage.ctaText}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ExpirySettings;
