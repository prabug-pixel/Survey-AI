import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '@birdeye/elemental/core/atoms/Button';
import Toggle from '@birdeye/elemental/core/atoms/Toggle';
import FormInput from '@birdeye/elemental/core/atoms/FormInput';
import SingleSelect from '@birdeye/elemental/core/atoms/SingleSelect';
import Tooltip from '@birdeye/elemental/core/atoms/Tooltip';
import TimePeriod from '@birdeye/elemental/core/atoms/TimePeriod';
import TimePicker from '@birdeye/elemental/core/components/TimePicker';
import { useAppSelector, useAppDispatch } from '../../store';
import { surveyActions } from '../../store/surveySlice';
import type { CampaignConfig } from '../../types/survey.types';
import { DEFAULT_CAMPAIGN_CONFIG, DEFAULT_LINK_EXPIRY } from '../../types/survey.types';
import { IconChevronLeft, IconChevronDown, IconChevronUp, IconCheck, IconEdit, IconInfo } from '../../shared/Icons/Icons';
import styles from './SurveyCampaigns.module.scss';

// Default expiration window — today through 60 days from today,
// both anchored at 12:00 AM (midnight).
const DEFAULT_EXPIRY_DAYS = 60;
const todayAtMidnight = (from: Date = new Date()): Date => {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  return d;
};
const sixtyDaysFromNow = (from: Date = new Date()): Date => {
  const d = todayAtMidnight(from);
  d.setDate(d.getDate() + DEFAULT_EXPIRY_DAYS);
  return d;
};

const fmtTimeOnly = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    : '';

interface TimeParts {
  hours: number;          // 1..12
  minutes: number;        // 0..59
  meridiem: 'am' | 'pm';
}

// 12:00 AM = midnight. In 12-hour format midnight is represented as hour 12 / AM.
const DEFAULT_TIME: TimeParts = { hours: 12, minutes: 0, meridiem: 'am' };

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

const CHANNEL_OPTIONS = [
  { value: 'email_text', label: 'Email and text' },
  { value: 'email', label: 'Email only' },
  { value: 'text', label: 'Text only' },
];

const RECIPIENT_OPTIONS = [
  { value: 'contacts', label: 'Contacts' },
  { value: 'segments', label: 'Segments' },
  { value: 'csv', label: 'CSV upload' },
];

const TEMPLATE_OPTIONS = [
  { value: '', label: 'Select' },
  { value: 'tpl-1', label: 'Default Survey' },
  { value: 'tpl-2', label: 'NPS Follow-up' },
  { value: 'tpl-3', label: 'Service Feedback' },
];

const SCHEDULE_OPTIONS = [
  { value: 'immediately', label: 'Immediately' },
  { value: 'scheduled', label: 'Schedule for later' },
];

const StatusDot: React.FC<{ done: boolean }> = ({ done }) => (
  <div className={`${styles.statusDot} ${done ? styles.statusDone : styles.statusPending}`}>
    {done
      ? <IconCheck size={12} color="#ffffff" />
      : <span className={styles.statusInner}>–</span>}
  </div>
);

const SurveyCampaigns: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const savedSurveys = useAppSelector(s => s.survey.savedSurveys);
  const survey = savedSurveys.find(s => s.id === surveyId);

  if (!survey) {
    return (
      <div className={styles.campaign}>
        <div className={styles.campaignInner}>
          <p style={{ padding: 24 }}>Survey not found.</p>
        </div>
      </div>
    );
  }

  // Config is derived from the persisted survey. Every change dispatches
  // patchCampaign, which writes back to the persisted store.
  const config = useMemo<CampaignConfig>(
    () => (survey.campaign
      ? {
          ...DEFAULT_CAMPAIGN_CONFIG,
          ...survey.campaign,
          options: {
            ...DEFAULT_CAMPAIGN_CONFIG.options,
            ...(survey.campaign.options ?? {}),
            linkExpiry: {
              ...DEFAULT_LINK_EXPIRY,
              ...((survey.campaign.options ?? {}).linkExpiry ?? {}),
            },
          },
        }
      : { ...DEFAULT_CAMPAIGN_CONFIG }
    ),
    [survey.campaign]
  );

  // Expiry edits are blocked once the campaign was launched OR the survey
  // is already running / expiring (the workflow is in flight either way).
  const isLive = config.status === 'live'
    || survey.status === 'running'
    || survey.status === 'expiring_soon';

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [expiryTimeOpen, setExpiryTimeOpen] = useState(false);
  const expiryTimeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expiryTimeOpen) return;
    const handler = (e: MouseEvent) => {
      if (expiryTimeRef.current && !expiryTimeRef.current.contains(e.target as Node)) {
        setExpiryTimeOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [expiryTimeOpen]);

  const commit = (next: CampaignConfig) => {
    dispatch(surveyActions.patchCampaign({ surveyId: survey.id, config: next }));
  };

  const patch = <K extends keyof CampaignConfig>(key: K, value: CampaignConfig[K]) => {
    commit({ ...config, [key]: value });
  };

  const patchExpiry = (updates: Partial<CampaignConfig['options']['linkExpiry']>) => {
    if (isLive) return;
    commit({
      ...config,
      options: {
        ...config.options,
        linkExpiry: { ...config.options.linkExpiry, ...updates },
      },
    });
  };

  // Seed the default range on first mount when the user hasn't set one:
  // today → today + 60 days, both at 12:00 AM. Skipped when the campaign
  // is already live or a persisted value exists, so we never overwrite.
  useEffect(() => {
    if (isLive) return;
    if (config.options.linkExpiry.startDate && config.options.linkExpiry.endDate) return;
    const now = new Date();
    const start = todayAtMidnight(now);
    const end = sixtyDaysFromNow(now);
    patchExpiry({
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      presetKey: 'last_60_days',
      customDate: end.toISOString(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [survey.id]);

  const channelDone = !!config.channel;
  const recipientsDone = !!config.recipientSource;
  const templatesDone = !!(config.emailTemplateId || config.textTemplateId);
  const surveyDone = !!survey.id;
  const scheduleDone = !!config.schedule;
  const reminderDone = true;
  // Link expiration is set when the user has picked a date range
  // (start + end) via the TimePeriod preset picker.
  const optionsDone = !!(
    config.options.linkExpiry.startDate && config.options.linkExpiry.endDate
  );

  const handleLaunch = () => {
    commit({ ...config, status: 'live' });
  };

  return (
    <div className={styles.campaign}>
      <div className={styles.scrollArea}>
      <div className={styles.pageHeaderWrap}>
        <div className={styles.pageTitleRow}>
          <button
            type="button"
            className={styles.backBtn}
            aria-label="Back to survey"
            onClick={() => {
              // history.back() restores the previous URL (including ?tab=...),
              // which puts SurveyDetails on whatever tab the user was on.
              // If the user deep-linked directly to this page (no history),
              // fall back to the Distribute tab.
              if (window.history.length > 1) navigate(-1);
              else navigate(`/surveys/${survey.id}?tab=distribute`);
            }}
          >
            <IconChevronLeft size={20} color="#424242" />
          </button>
          <h1 className={styles.pageTitle}>Survey campaign</h1>
          <button type="button" className={styles.editTitleBtn} aria-label="Rename campaign">
            <IconEdit size={14} color="#757575" />
          </button>
        </div>
      </div>

      <div className={styles.campaignInner}>

        {/* ── Send survey via ─────────────────────────────── */}
        <section className={styles.section}>
          <div className={styles.statusCol}><StatusDot done={channelDone} /></div>
          <div className={styles.body}>
            <h3 className={styles.sectionTitle}>Send survey via</h3>
            <div className={styles.fieldGroup}>
              <SingleSelect
                name="campaignChannel"
                options={CHANNEL_OPTIONS}
                selected={config.channel}
                onChange={(opt) => patch('channel', opt.value as CampaignConfig['channel'])}
                isAeroDesign
              />
            </div>
          </div>
        </section>

        {/* ── Send survey to recipients ───────────────────── */}
        <section className={styles.section}>
          <div className={styles.statusCol}><StatusDot done={recipientsDone} /></div>
          <div className={styles.body}>
            <div className={styles.inlineTitleRow}>
              <h3 className={styles.sectionTitle}>Send survey to recipients from</h3>
              <button type="button" className={styles.inlineLinkBtn}>
                {RECIPIENT_OPTIONS.find(o => o.value === config.recipientSource)?.label ?? 'Contacts'}
              </button>
              <Button
                theme="secondary"
                label="Choose contacts"
                onClick={() => undefined}
              />
            </div>
          </div>
        </section>

        {/* ── Choose your survey template ─────────────────── */}
        <section className={styles.section}>
          <div className={styles.statusCol}><StatusDot done={templatesDone} /></div>
          <div className={styles.body}>
            <h3 className={styles.sectionTitle}>Choose your survey template</h3>

            <div className={styles.fieldRow}>
              <span className={styles.fieldLabel}>Email template</span>
              <div className={styles.fieldRowInputs}>
                <div className={styles.fieldGroup}>
                  <SingleSelect
                    name="emailTemplate"
                    options={TEMPLATE_OPTIONS}
                    selected={config.emailTemplateId ?? ''}
                    onChange={(opt) => patch('emailTemplateId', String(opt.value))}
                    isAeroDesign
                  />
                </div>
                <Button
                  theme="secondary"
                  label="Edit"
                  disabled={!config.emailTemplateId}
                  onClick={() => undefined}
                />
              </div>
            </div>

            <div className={styles.fieldRow}>
              <span className={styles.fieldLabel}>Text template</span>
              <div className={styles.fieldRowInputs}>
                <div className={styles.fieldGroup}>
                  <SingleSelect
                    name="textTemplate"
                    options={TEMPLATE_OPTIONS}
                    selected={config.textTemplateId ?? ''}
                    onChange={(opt) => patch('textTemplateId', String(opt.value))}
                    isAeroDesign
                  />
                </div>
                <Button
                  theme="secondary"
                  label="Edit"
                  disabled={!config.textTemplateId}
                  onClick={() => undefined}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Choose your survey ──────────────────────────── */}
        <section className={styles.section}>
          <div className={styles.statusCol}><StatusDot done={surveyDone} /></div>
          <div className={styles.body}>
            <h3 className={styles.sectionTitle}>Choose your survey</h3>
            <div className={styles.fieldRow}>
              <span className={styles.fieldLabel}>Survey</span>
              <div className={styles.fieldRowInputs}>
                <div className={styles.fieldGroup}>
                  <SingleSelect
                    name="surveyChoice"
                    options={[{ value: survey.id, label: survey.title }]}
                    selected={survey.id}
                    onChange={() => undefined}
                    isAeroDesign
                  />
                </div>
                <Button theme="secondary" label="Preview" onClick={() => undefined} />
              </div>
            </div>
          </div>
        </section>

        {/* ── Schedule your survey ────────────────────────── */}
        <section className={styles.section}>
          <div className={styles.statusCol}><StatusDot done={scheduleDone} /></div>
          <div className={styles.body}>
            <h3 className={styles.sectionTitle}>Schedule your survey</h3>
            <div className={styles.fieldRow}>
              <div className={styles.inlineTitleRow}>
                <span className={styles.inlineLabel}>Send</span>
                <div style={{ minWidth: 180 }}>
                  <SingleSelect
                    name="schedule"
                    options={SCHEDULE_OPTIONS}
                    selected={config.schedule}
                    onChange={(opt) => patch('schedule', opt.value as CampaignConfig['schedule'])}
                    isAeroDesign
                  />
                </div>
              </div>
            </div>

            <label className={styles.checkboxRow}>
              <FormInput
                name="overrideRestrictions"
                type="checkbox"
                checked={config.overrideRestrictions}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  patch('overrideRestrictions', e.target.checked)
                }
              />
              <span>Override any communication restriction for sending this campaign</span>
            </label>

            <div className={styles.helperNote}>
              <IconInfo size={14} color="#9e9e9e" />
              <span>
                To minimize disruption, text messages are only sent to contacts between 8am–8pm.
                Your business location that provides their service determines the time zone setting.
              </span>
            </div>
          </div>
        </section>

        {/* ── Send reminder emails ────────────────────────── */}
        <section className={styles.section}>
          <div className={styles.statusCol}><StatusDot done={reminderDone} /></div>
          <div className={styles.body}>
            <div className={styles.reminderRow}>
              <h3 className={styles.sectionTitle}>Send reminder emails</h3>
              <Toggle
                name="sendReminders"
                checked={config.sendReminders}
                onChange={(_: unknown, e: { target: { checked: boolean } }) =>
                  patch('sendReminders', e.target.checked)
                }
                roundedToggle
              />
            </div>
          </div>
        </section>

        {/* ── Advanced Options (collapsible) ───────────────── */}
        <section className={styles.section}>
          <div className={styles.statusCol}><StatusDot done={optionsDone} /></div>
          <div className={styles.body}>
            <button
              type="button"
              className={styles.collapsibleHeader}
              onClick={() => setAdvancedOpen(o => !o)}
              aria-expanded={advancedOpen}
            >
              <h3 className={styles.sectionTitle}>Advanced Options</h3>
              <div className={styles.collapsibleHeaderRight}>
                {isLive && (
                  <span className={styles.lockedNotice}>
                    Locked — campaign is live
                  </span>
                )}
                {advancedOpen
                  ? <IconChevronUp size={18} color="#555" />
                  : <IconChevronDown size={18} color="#555" />}
              </div>
            </button>

            {advancedOpen && (
              <>
                {/* Expire Date — Aero "Date picker with preset" (TimePeriod
                   atom). Owns its own trigger, dual-month calendar, preset
                   list (Today, Last 7/30/60/… days), and Cancel/Apply.
                   Default range is 60 days from today (seeded on mount). */}
                <div className={`${styles.fieldGroup} ${styles.endDateFieldGroup}`}>
                  <div className={styles.fieldLabelRow}>
                    <span className={`${styles.fieldLabel} ${styles.requiredLabel}`}>Expire Date</span>
                    <Tooltip text="When the survey link is valid — pick a preset or a custom range." position="right" hideOnScroll>
                      <button type="button" className={styles.infoIconBtn} aria-label="Expire Date info">
                        <IconInfo size={14} />
                      </button>
                    </Tooltip>
                  </div>
                  <div className={styles.timePeriodWrap}>
                    <TimePeriod
                      enableFutureDates
                      hideAllTime
                      disable={isLive}
                      initLabel="Select date"
                      selectedDateRange={
                        config.options.linkExpiry.startDate && config.options.linkExpiry.endDate
                          ? {
                              startDate: new Date(config.options.linkExpiry.startDate),
                              endDate: new Date(config.options.linkExpiry.endDate),
                              key: config.options.linkExpiry.presetKey ?? 'CUSTOM',
                            }
                          : undefined
                      }
                      onChangeSelectedDateRange={(range) => {
                        if (!range?.startDate || !range?.endDate) return;
                        const start = range.startDate instanceof Date
                          ? range.startDate
                          : new Date(range.startDate);
                        const end = range.endDate instanceof Date
                          ? range.endDate
                          : new Date(range.endDate);
                        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;
                        // Preserve the user-picked time when only the range
                        // changes — TimePeriod doesn't manage time-of-day.
                        const time = isoToTimeParts(config.options.linkExpiry.endDate);
                        const endIso = mergeDateAndTime(end.toISOString(), time);
                        patchExpiry({
                          startDate: start.toISOString(),
                          endDate: endIso,
                          presetKey: range.key,
                          customDate: endIso,
                        });
                      }}
                    />
                  </div>
                </div>

                {/* Time — FormInput trigger + TimePicker popup, mirrors the
                   pattern used in ExpirySettings. The picked time merges
                   back into the range's endDate ISO. */}
                <div className={`${styles.fieldGroup} ${styles.endDateFieldGroup}`}>
                  <div className={styles.fieldLabelRow}>
                    <span className={`${styles.fieldLabel} ${styles.requiredLabel}`}>Time</span>
                    <Tooltip text="Time of day the link expires" position="right" hideOnScroll>
                      <button type="button" className={styles.infoIconBtn} aria-label="Time info">
                        <IconInfo size={14} />
                      </button>
                    </Tooltip>
                  </div>
                  <div className={styles.datePickerField} ref={expiryTimeRef}>
                    <div
                      className={styles.datePickerTrigger}
                      onClick={() => !isLive && setExpiryTimeOpen(true)}
                      role="button"
                      tabIndex={isLive ? -1 : 0}
                      onKeyDown={(e) => {
                        if (isLive) return;
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setExpiryTimeOpen(true);
                        }
                      }}
                    >
                      <FormInput
                        name="expiryTime"
                        type="text"
                        value={fmtTimeOnly(config.options.linkExpiry.endDate)}
                        placeholder="Select time"
                        showLeftIcon
                        customIconClass="icon_phoenix-clock"
                        readOnly
                        disabled={isLive}
                      />
                    </div>
                    {expiryTimeOpen && (
                      <div
                        className={styles.datePickerPopup}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <TimePicker
                          timeObject={isoToTimeParts(config.options.linkExpiry.endDate)}
                          changeTime={(option, field) => {
                            const baseIso = config.options.linkExpiry.endDate ?? new Date().toISOString();
                            const next: TimeParts = { ...isoToTimeParts(config.options.linkExpiry.endDate) };
                            if (field === 'hours') next.hours = Number(option.value);
                            else if (field === 'minutes') next.minutes = Number(option.value);
                            else next.meridiem = String(option.value).toLowerCase() === 'pm' ? 'pm' : 'am';
                            const endIso = mergeDateAndTime(baseIso, next);
                            patchExpiry({ endDate: endIso, customDate: endIso });
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

      </div>
      </div>

      {/* ── Launch banner (fixed footer outside scroll) ──── */}
      <div className={styles.launchBanner}>
        <div className={styles.launchLeft}>
          <h3 className={styles.launchTitle}>Get ready to launch your survey</h3>
          <p className={styles.launchDesc}>
            Your business is responsible for obtaining permission from customers or contacts
            before initiating text message communication. <a href="#" onClick={(e) => e.preventDefault()}>See usage terms</a>
          </p>
        </div>
        <div className={styles.launchRight}>
          <Button
            theme="secondary"
            label="Finish later"
            onClick={() => undefined}
          />
          <Button
            theme="primary"
            label="Send survey"
            disabled={isLive}
            onClick={handleLaunch}
          />
        </div>
      </div>
    </div>
  );
};

export default SurveyCampaigns;
