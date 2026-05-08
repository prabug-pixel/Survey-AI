import React, { useMemo, useState } from 'react';
import Toggle from '@birdeye/elemental/core/atoms/Toggle';
import Button from '@birdeye/elemental/core/atoms/Button';
import TextArea from '@birdeye/elemental/core/atoms/TextArea';
import Tag from '@birdeye/elemental/core/atoms/Tag';
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

const toDatetimeLocal = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
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

const sameConfig = (a: ExpirationConfig, b: ExpirationConfig) =>
  JSON.stringify(a) === JSON.stringify(b);

const ExpirySettings: React.FC<Props> = ({ survey, onSave, onOpenAuditLog }) => {
  const initialConfig = useMemo<ExpirationConfig>(
    () => (survey.expiration ? { ...DEFAULT_CONFIG, ...survey.expiration } : { ...DEFAULT_CONFIG }),
    [survey.expiration]
  );
  const [config, setConfig] = useState<ExpirationConfig>(initialConfig);
  const [showErrors, setShowErrors] = useState(false);

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

  const endDateLocal = config.endDate ? toDatetimeLocal(config.endDate) : '';
  const minDateTime = toDatetimeLocal(new Date(Date.now() + 60_000).toISOString());

  const hoursLeft = config.endDate
    ? (new Date(config.endDate).getTime() - Date.now()) / 3600000
    : null;

  const graceLabel = GRACE_PERIOD_OPTIONS.find(o => o.value === config.gracePeriodHours)?.label
    ?? `${config.gracePeriodHours}h`;

  const isWarn = hoursLeft !== null && hoursLeft <= 72 && hoursLeft > 0;
  const isPast = hoursLeft !== null && hoursLeft <= 0;
  const showFieldError = (k: keyof ValidationErrors) => showErrors && errors[k];

  return (
    <div className={styles.page}>

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
          <div>
            <h2 className={styles.cardTitle}>Survey Expiration</h2>
            <p className={styles.cardDesc}>Control when your survey is available to respondents</p>
          </div>
          <Toggle
            name="expiration-enabled"
            checked={config.enabled}
            onChange={(_: unknown, e: { target: { checked: boolean } }) => patch('enabled', e.target.checked)}
            className=""
          />
        </div>

        {config.enabled && (
          <div className={styles.cardBody}>

            {/* ── Schedule ───────────────────────────────── */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Schedule</h3>
              <div className={styles.fieldGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>End Date &amp; Time *</label>
                  <input
                    name="endDate"
                    type="datetime-local"
                    className={`${styles.nativeInput} ${showFieldError('endDate') ? styles.nativeInputError : ''}`}
                    value={endDateLocal}
                    min={minDateTime}
                    onChange={(e) =>
                      patch('endDate', e.target.value ? new Date(e.target.value).toISOString() : undefined)
                    }
                  />
                  {showFieldError('endDate')
                    ? <span className={styles.errorText}>{errors.endDate}</span>
                    : <span className={styles.hint}>Survey will automatically close at this date and time</span>}
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Timezone</label>
                  <div className={styles.readonlyField}>{config.timezone}</div>
                  <span className={styles.hint}>Account timezone · contact admin to change</span>
                </div>
              </div>
            </section>

            <div className={styles.separator} />

            {/* ── Grace period ───────────────────────────── */}
            <section className={styles.section}>
              <div className={styles.sectionTitleRow}>
                <div>
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
                  className=""
                />
              </div>
              {config.gracePeriodEnabled && (
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Duration</label>
                  <select
                    name="gracePeriod"
                    className={styles.nativeSelect}
                    value={config.gracePeriodHours}
                    onChange={(e) => patch('gracePeriodHours', Number(e.target.value))}
                  >
                    {GRACE_PERIOD_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
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
                <label className={styles.label}>Title *</label>
                <input
                  name="closedTitle"
                  type="text"
                  className={`${styles.nativeInput} ${showFieldError('title') ? styles.nativeInputError : ''}`}
                  value={config.closedMessage.title}
                  onChange={(e) => patchMsg('title', e.target.value)}
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
                  <label className={styles.label}>CTA Button Text (optional)</label>
                  <input
                    name="ctaText"
                    type="text"
                    className={styles.nativeInput}
                    value={config.closedMessage.ctaText ?? ''}
                    onChange={(e) => patchMsg('ctaText', e.target.value)}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>CTA URL (optional)</label>
                  <input
                    name="ctaUrl"
                    type="text"
                    placeholder="https://example.com"
                    className={styles.nativeInput}
                    value={config.closedMessage.ctaUrl ?? ''}
                    onChange={(e) => patchMsg('ctaUrl', e.target.value)}
                  />
                </div>
              </div>
              {showFieldError('cta') && <span className={styles.errorText}>{errors.cta}</span>}

              {/* Closed survey preview */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Preview</label>
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
            </section>

            <div className={styles.separator} />

            {/* ── Email notifications ────────────────────── */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Email Notifications</h3>
              <p className={styles.sectionDesc}>
                Sent to the survey owner ({survey.owner})
              </p>

              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  name="notifEnabled"
                  className={styles.nativeCheckbox}
                  checked={config.notifications.enabled}
                  onChange={(e) => patchNotif('enabled', e.target.checked)}
                />
                Enable expiration notifications
              </label>

              {config.notifications.enabled && (
                <div className={styles.checkIndent}>
                  {([
                    { name: 'notif72h', field: 'hours72' as const, label: '72 hours before expiration' },
                    { name: 'notif24h', field: 'hours24' as const, label: '24 hours before expiration' },
                    { name: 'notifAuto', field: 'onAutoClose' as const, label: 'When survey auto-closes' },
                  ] as const).map(({ name, field, label }) => (
                    <label key={name} className={styles.checkLabel}>
                      <input
                        type="checkbox"
                        name={name}
                        className={styles.nativeCheckbox}
                        checked={config.notifications[field]}
                        onChange={(e) => patchNotif(field, e.target.checked)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              )}
            </section>

          </div>
        )}

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
  );
};

export default ExpirySettings;
