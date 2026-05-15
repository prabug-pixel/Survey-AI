import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Button from '@birdeye/elemental/core/atoms/Button';
import Toggle from '@birdeye/elemental/core/atoms/Toggle';
import FormInput from '@birdeye/elemental/core/atoms/FormInput';
import SingleSelect from '@birdeye/elemental/core/atoms/SingleSelect';
import Tooltip from '@birdeye/elemental/core/atoms/Tooltip';
import DatePicker from '@birdeye/elemental/core/components/DatePicker';
import TimePicker from '@birdeye/elemental/core/components/TimePicker';
import { useAppSelector, useAppDispatch } from '../../store';
import { surveyActions } from '../../store/surveySlice';
import type { CampaignConfig, LinkExpiryOption, LinkExpiryUnit } from '../../types/survey.types';
import { DEFAULT_CAMPAIGN_CONFIG, DEFAULT_LINK_EXPIRY } from '../../types/survey.types';
import { IconChevronDown, IconChevronUp, IconCheck, IconEdit, IconInfo } from '../../shared/Icons/Icons';
import Breadcrumb, { type BreadcrumbItem } from '../shared/Breadcrumb/Breadcrumb';
import styles from './SurveyCampaigns.module.scss';

// Per spec, the expiration anchors on the send time at runtime — for
// relative units (days/hours) the engine resolves the absolute timestamp
// when the campaign fires. Only "custom date" mode carries an explicit
// calendar timestamp.

const fmtTimeOnly = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    : '';

const fmtDateOnly = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
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

// Link expiry mirrors the Marketing Automation "delay" pattern: a
// top-level option dropdown, then either a unit + numeric value (for
// the relative path) or a date + time (for the calendar path).
const LINK_EXPIRY_OPTIONS = [
  { value: 'set_amount', label: 'For a set amount of time' },
  { value: 'calendar_date', label: 'Until a calendar date' },
];

const TIME_UNIT_OPTIONS = [
  { value: 'days', label: 'Days' },
  { value: 'hours', label: 'Hours' },
  { value: 'minutes', label: 'Minutes' },
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

  // Expiry edits are blocked only once *this* campaign has been launched
  // (its workflow is in flight). A survey may already be in 'running' /
  // 'expiring_soon' from a prior campaign — that shouldn't lock a fresh
  // draft campaign's expiry configuration.
  const isLive = config.status === 'live';

  const [advancedOpen, setAdvancedOpen] = useState(true);
  const [expiryDateOpen, setExpiryDateOpen] = useState(false);
  const [expiryTimeOpen, setExpiryTimeOpen] = useState(false);
  const expiryDateRef = useRef<HTMLDivElement>(null);
  const expiryTimeRef = useRef<HTMLDivElement>(null);

  // Advanced Options sits inside `.scrollArea` (overflow-y: auto), which
  // clips any absolutely-positioned popup. To let the date/time menus
  // escape the scroll area and float above the launch banner, we anchor
  // them with `position: fixed` and snapshot the trigger's viewport rect
  // each time the popup opens.
  const [datePopupAnchor, setDatePopupAnchor] = useState<{ bottom: number; left: number; width: number } | null>(null);
  const [timePopupAnchor, setTimePopupAnchor] = useState<{ bottom: number; left: number; width: number } | null>(null);

  const anchorAbove = (ref: React.RefObject<HTMLDivElement | null>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      bottom: window.innerHeight - rect.top + 4,
      left: rect.left,
      width: rect.width,
    };
  };

  const openDatePopup = () => {
    if (isLive) return;
    setDatePopupAnchor(anchorAbove(expiryDateRef));
    setExpiryDateOpen(true);
  };

  const openTimePopup = () => {
    if (isLive) return;
    setTimePopupAnchor(anchorAbove(expiryTimeRef));
    setExpiryTimeOpen(true);
  };

  useEffect(() => {
    if (!expiryDateOpen && !expiryTimeOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (expiryDateOpen && expiryDateRef.current && !expiryDateRef.current.contains(target)) {
        setExpiryDateOpen(false);
      }
      if (expiryTimeOpen && expiryTimeRef.current && !expiryTimeRef.current.contains(target)) {
        setExpiryTimeOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [expiryDateOpen, expiryTimeOpen]);

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

  // No mount-time seeding required — DEFAULT_LINK_EXPIRY already encodes
  // "60 days from send" (mode: 'days', value: 60), so the form opens to
  // the spec default without overwriting any persisted choice.

  const channelDone = !!config.channel;
  const recipientsDone = !!config.recipientSource;
  const templatesDone = !!(config.emailTemplateId || config.textTemplateId);
  const surveyDone = !!survey.id;
  const scheduleDone = !!config.schedule;
  const reminderDone = true;
  // Link expiration counts as done when the configured option has a usable
  // value — set_amount needs both a unit and a positive count; calendar_date
  // needs a customDate.
  const linkExpiry = config.options.linkExpiry;
  const optionsDone = linkExpiry.option === 'calendar_date'
    ? !!linkExpiry.customDate
    : !!linkExpiry.mode && (linkExpiry.value ?? 0) > 0;

  const handleLaunch = () => {
    commit({ ...config, status: 'live' });
  };

  const crumbs: BreadcrumbItem[] = [
    { label: 'Surveys AI', to: '/surveys' },
    { label: survey.title, to: `/surveys/${survey.id}` },
    { label: 'Distribute', to: `/surveys/${survey.id}?tab=distribute` },
    { label: 'Survey campaign' },
  ];

  return (
    <div className={styles.campaign}>
      <Breadcrumb items={crumbs} />
      <div className={styles.scrollArea}>
      <div className={styles.pageHeaderWrap}>
        <div className={styles.pageTitleRow}>
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
              <IconInfo size={16} color="#9e9e9e" />
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
                {/* Dropdown 1 — Link Expiry Options.
                   Top-level path picker: relative duration vs explicit date.
                   Switching paths clears the companion fields so values
                   from the other path can't survive a mode swap. */}
                <div className={`${styles.fieldGroup} ${styles.endDateFieldGroup}`}>
                  <div className={styles.fieldLabelRow}>
                    <span className={`${styles.fieldLabel} ${styles.requiredLabel}`}>Link Expiry Options</span>
                  </div>
                  <SingleSelect
                    name="linkExpiryOption"
                    displayLabel="Link Expiry Options"
                    options={LINK_EXPIRY_OPTIONS}
                    selected={linkExpiry.option}
                    onChange={(option) => {
                      const next = option.value as LinkExpiryOption;
                      if (next === linkExpiry.option) return;
                      if (next === 'calendar_date') {
                        patchExpiry({
                          option: 'calendar_date',
                          mode: 'custom',
                          value: undefined,
                        });
                      } else {
                        patchExpiry({
                          option: 'set_amount',
                          mode: undefined,
                          value: undefined,
                          customDate: undefined,
                        });
                      }
                    }}
                    showSearch={false}
                    disabled={isLive}
                    isAeroDesign
                  />
                </div>

                {linkExpiry.option === 'set_amount' ? (
                  <>
                    {/* Dropdown 2 — Time unit.
                       Placeholder "Select time units" until the user picks.
                       Once picked, the Unit value field below appears. */}
                    <div className={`${styles.fieldGroup} ${styles.endDateFieldGroup}`}>
                      <div className={styles.fieldLabelRow}>
                        <span className={`${styles.fieldLabel} ${styles.requiredLabel}`}>Time unit</span>
                      </div>
                      <SingleSelect
                        name="timeUnit"
                        displayLabel="Time unit"
                        options={TIME_UNIT_OPTIONS}
                        selected={linkExpiry.mode}
                        onChange={(option) => {
                          patchExpiry({ mode: option.value as LinkExpiryUnit });
                        }}
                        placeholder="Select time units"
                        showSearch={false}
                        disabled={isLive}
                        isAeroDesign
                      />
                    </div>

                    {/* Input 3 — Unit value (numeric).
                       Only rendered after a time unit is selected. */}
                    {linkExpiry.mode && linkExpiry.mode !== 'custom' && (
                      <div className={`${styles.fieldGroup} ${styles.endDateFieldGroup}`}>
                        <div className={styles.fieldLabelRow}>
                          <span className={`${styles.fieldLabel} ${styles.requiredLabel}`}>Unit value</span>
                        </div>
                        <FormInput
                          name="expiryValue"
                          type="number"
                          value={linkExpiry.value !== undefined ? String(linkExpiry.value) : ''}
                          placeholder="Enter unit value"
                          onChange={(_event: unknown, value: string) => {
                            if (value === '' || value === null || value === undefined) {
                              patchExpiry({ value: undefined });
                              return;
                            }
                            const n = Math.max(0, Number(value) || 0);
                            patchExpiry({ value: n });
                          }}
                          disabled={isLive}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Set date — calendar picker for the calendar_date path. */}
                    <div className={`${styles.fieldGroup} ${styles.endDateFieldGroup}`}>
                      <div className={styles.fieldLabelRow}>
                        <span className={`${styles.fieldLabel} ${styles.requiredLabel}`}>Set date</span>
                      </div>
                      <div className={styles.datePickerField} ref={expiryDateRef}>
                        <div
                          className={styles.datePickerTrigger}
                          onClick={openDatePopup}
                          role="button"
                          tabIndex={isLive ? -1 : 0}
                          onKeyDown={(e) => {
                            if (isLive) return;
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              openDatePopup();
                            }
                          }}
                        >
                          <FormInput
                            name="expiryDate"
                            type="text"
                            value={fmtDateOnly(linkExpiry.customDate)}
                            placeholder="Select date"
                            showLeftIcon
                            customIconClass="icon_phoenix-calendar"
                            readOnly
                            disabled={isLive}
                          />
                        </div>
                        {expiryDateOpen && datePopupAnchor && (
                          <div
                            className={styles.datePickerPopup}
                            style={{
                              position: 'fixed',
                              bottom: datePopupAnchor.bottom,
                              left: datePopupAnchor.left,
                              top: 'auto',
                              minWidth: datePopupAnchor.width,
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DatePicker
                              name="expiryDatePopup"
                              startDt={linkExpiry.customDate || undefined}
                              range={false}
                              disablePastDates
                              enableFutureDates
                              showApplyButtons
                              applyButtonLabel="Apply"
                              sendDateTime={(start) => {
                                if (!start) {
                                  patchExpiry({ customDate: undefined });
                                  setExpiryDateOpen(false);
                                  return;
                                }
                                const parsed = new Date(start);
                                if (Number.isNaN(parsed.getTime())) return;
                                const time = isoToTimeParts(linkExpiry.customDate);
                                const merged = mergeDateAndTime(parsed.toISOString(), time);
                                patchExpiry({ customDate: merged });
                                setExpiryDateOpen(false);
                              }}
                              cancelCalendarPopup={() => setExpiryDateOpen(false)}
                              closeOnClickOutside={() => setExpiryDateOpen(false)}
                              dynamicClass="profile-datepicker"
                              insidePopup
                              isRequired
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Select time — paired with the calendar date. */}
                    <div className={`${styles.fieldGroup} ${styles.endDateFieldGroup}`}>
                      <div className={styles.fieldLabelRow}>
                        <span className={`${styles.fieldLabel} ${styles.requiredLabel}`}>Select time</span>
                        <Tooltip text="Time of day the link expires" position="right" hideOnScroll>
                          <button type="button" className={styles.infoIconBtn} aria-label="Time info">
                            <IconInfo size={14} />
                          </button>
                        </Tooltip>
                      </div>
                      <div className={styles.datePickerField} ref={expiryTimeRef}>
                        <div
                          className={styles.datePickerTrigger}
                          onClick={openTimePopup}
                          role="button"
                          tabIndex={isLive ? -1 : 0}
                          onKeyDown={(e) => {
                            if (isLive) return;
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              openTimePopup();
                            }
                          }}
                        >
                          <FormInput
                            name="expiryTime"
                            type="text"
                            value={fmtTimeOnly(linkExpiry.customDate)}
                            placeholder="Select time"
                            showLeftIcon
                            customIconClass="icon_phoenix-clock"
                            readOnly
                            disabled={isLive}
                          />
                        </div>
                        {expiryTimeOpen && timePopupAnchor && (
                          <div
                            className={styles.datePickerPopup}
                            style={{
                              position: 'fixed',
                              bottom: timePopupAnchor.bottom,
                              left: timePopupAnchor.left,
                              top: 'auto',
                              minWidth: timePopupAnchor.width,
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <TimePicker
                              timeObject={isoToTimeParts(linkExpiry.customDate)}
                              changeTime={(option, field) => {
                                const baseIso = linkExpiry.customDate ?? new Date().toISOString();
                                const next: TimeParts = { ...isoToTimeParts(linkExpiry.customDate) };
                                if (field === 'hours') next.hours = Number(option.value);
                                else if (field === 'minutes') next.minutes = Number(option.value);
                                else next.meridiem = String(option.value).toLowerCase() === 'pm' ? 'pm' : 'am';
                                patchExpiry({ customDate: mergeDateAndTime(baseIso, next) });
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
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
