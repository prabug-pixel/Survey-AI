import React, { useState } from 'react';
import Toggle from '@birdeye/elemental/core/atoms/Toggle';
import Button from '@birdeye/elemental/core/atoms/Button';
import TextArea from '@birdeye/elemental/core/atoms/TextArea';
import type { SavedSurvey, ExpirationConfig } from '../../types/survey.types';
import { GRACE_PERIOD_OPTIONS } from '../../types/survey.types';
import { IconClock, IconCheck } from '../../shared/Icons/Icons';
import styles from './ExpirySettings.module.scss';

interface Props {
  survey: SavedSurvey;
  onSave: (config: ExpirationConfig) => void;
  onOpenAuditLog: () => void;
}

const DEFAULT_CONFIG: ExpirationConfig = {
  enabled: false,
  timezone: 'America/Los_Angeles',
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

const ExpirySettings: React.FC<Props> = ({ survey, onSave, onOpenAuditLog }) => {
  const [config, setConfig] = useState<ExpirationConfig>(
    survey.expiration ? { ...DEFAULT_CONFIG, ...survey.expiration } : { ...DEFAULT_CONFIG }
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  const patch = <K extends keyof ExpirationConfig>(key: K, value: ExpirationConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const patchMsg = (field: keyof ExpirationConfig['closedMessage'], value: string) => {
    setConfig(prev => ({ ...prev, closedMessage: { ...prev.closedMessage, [field]: value } }));
    setHasChanges(true);
  };

  const patchNotif = (field: keyof ExpirationConfig['notifications'], value: boolean) => {
    setConfig(prev => ({ ...prev, notifications: { ...prev.notifications, [field]: value } }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(config);
    setHasChanges(false);
    setSavedOk(true);
    setTimeout(() => setSavedOk(false), 2500);
  };

  const handleCancel = () => {
    setConfig(survey.expiration ? { ...DEFAULT_CONFIG, ...survey.expiration } : { ...DEFAULT_CONFIG });
    setHasChanges(false);
  };

  const endDateLocal = config.endDate ? toDatetimeLocal(config.endDate) : '';

  const hoursLeft = config.endDate
    ? (new Date(config.endDate).getTime() - Date.now()) / 3600000
    : null;

  const graceLabel = GRACE_PERIOD_OPTIONS.find(o => o.value === config.gracePeriodHours)?.label
    ?? `${config.gracePeriodHours}h`;

  const isWarn = hoursLeft !== null && hoursLeft <= 72 && hoursLeft > 0;

  return (
    <div className={styles.page}>

      {/* ── Status banner ─────────────────────────────────── */}
      {config.enabled && config.endDate && (
        <div className={`${styles.banner} ${isWarn ? styles.bannerWarn : styles.bannerInfo}`}>
          <IconClock size={16} color={isWarn ? '#e65100' : '#1976d2'} />
          <div>
            <span className={styles.bannerTitle}>
              {isWarn ? 'Expiring Soon' : 'Expiration Active'}
            </span>
            <span className={styles.bannerBody}>
              Survey closes on <strong>{fmt(config.endDate)}</strong> ({config.timezone})
              {' · '}Grace period: <strong>{graceLabel}</strong>
            </span>
          </div>
        </div>
      )}

      {/* ── Saved success flash ───────────────────────────── */}
      {savedOk && (
        <div className={styles.successFlash}>
          <IconCheck size={16} color="#377e2c" />
          Expiry settings saved.
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
                    className={styles.nativeInput}
                    value={endDateLocal}
                    onChange={(e) =>
                      patch('endDate', e.target.value ? new Date(e.target.value).toISOString() : undefined)
                    }
                  />
                  <span className={styles.hint}>Survey will automatically close at this date and time</span>
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
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Grace Period for In-Progress Sessions</label>
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
                <span className={styles.hint}>
                  Respondents who answered at least one question before expiry can continue for this duration.
                  After the grace period, partial responses are saved and they see the closed-survey page.
                </span>
              </div>
            </section>

            <div className={styles.separator} />

            {/* ── Closed survey message ──────────────────── */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Closed Survey Page</h3>
              <p className={styles.sectionDesc}>
                Shown to respondents when the survey is no longer accepting responses
              </p>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Title</label>
                <input
                  name="closedTitle"
                  type="text"
                  className={styles.nativeInput}
                  value={config.closedMessage.title}
                  onChange={(e) => patchMsg('title', e.target.value)}
                />
              </div>

              <div className={styles.fieldGroup}>
                <TextArea
                  name="closedBody"
                  label="Message Body"
                  value={config.closedMessage.body}
                  onChange={(_: unknown, e: React.ChangeEvent<HTMLTextAreaElement>) => patchMsg('body', e.target.value)}
                  rows={4}
                  autoSize={false}
                />
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
                    className={styles.nativeInput}
                    value={config.closedMessage.ctaUrl ?? ''}
                    onChange={(e) => patchMsg('ctaUrl', e.target.value)}
                  />
                </div>
              </div>

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
      </div>

      {/* ── Audit log button ──────────────────────────────── */}
      <div className={styles.auditRow}>
        <Button
          theme="secondary"
          label="View Audit Log"
          customIcon={<IconClock size={15} color="#555" />}
          onClick={onOpenAuditLog}
        />
      </div>

      {/* ── Sticky save bar ───────────────────────────────── */}
      {hasChanges && (
        <div className={styles.saveBar}>
          <span className={styles.saveBarNote}>Unsaved changes</span>
          <div className={styles.saveBarBtns}>
            <Button theme="secondary" label="Cancel" onClick={handleCancel} />
            <Button theme="primary" label="Save Changes" onClick={handleSave} />
          </div>
        </div>
      )}

    </div>
  );
};

export default ExpirySettings;
