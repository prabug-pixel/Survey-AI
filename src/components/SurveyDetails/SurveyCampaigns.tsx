import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Button from '@birdeye/elemental/core/atoms/Button';
import Toggle from '@birdeye/elemental/core/atoms/Toggle';
import FormInput from '@birdeye/elemental/core/atoms/FormInput';
import SingleSelect from '@birdeye/elemental/core/atoms/SingleSelect';
import Tooltip from '@birdeye/elemental/core/atoms/Tooltip';
import { useAppSelector, useAppDispatch } from '../../store';
import { surveyActions } from '../../store/surveySlice';
import type { CampaignConfig } from '../../types/survey.types';
import { DEFAULT_CAMPAIGN_CONFIG, DEFAULT_LINK_EXPIRY } from '../../types/survey.types';
import { IconCheck, IconEdit, IconInfo } from '../../shared/Icons/Icons';
import Breadcrumb, { type BreadcrumbItem } from '../shared/Breadcrumb/Breadcrumb';
import styles from './SurveyCampaigns.module.scss';

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
  // (its workflow is in flight). A survey may already be in 'published' /
  // 'expiring_soon' from a prior campaign — that shouldn't lock a fresh
  // draft campaign's expiry configuration.
  const isLive = config.status === 'live';

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
  // Link expiry counts as done when the toggle is off (nothing to configure)
  // or when it's on with a positive number of days entered.
  const linkExpiry = config.options.linkExpiry;
  const optionsDone = !linkExpiry.enabled || (linkExpiry.value ?? 0) > 0;

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
              <span>Override communication restrictions for this campaign</span>
            </label>

            <div className={styles.helperNote}>
              <IconInfo size={16} color="#9e9e9e" />
              <span>
                Text messages are sent between 8am and 8pm to minimize disruption.
                The contact's location determines the time zone.
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

        {/* ── Advanced Options ────────────────────────────── */}
        {/* Section is gated by the link-expiry toggle. Toggle on → expand
           and show the Days-only input. Toggle off → collapse. */}
        <section className={styles.section}>
          <div className={styles.statusCol}><StatusDot done={optionsDone} /></div>
          <div className={styles.body}>
            <div className={styles.collapsibleHeader}>
              <h3 className={styles.sectionTitle}>Advanced options</h3>
              <div className={styles.collapsibleHeaderRight}>
                {isLive && (
                  <span className={styles.lockedNotice}>
                    Locked: campaign is live
                  </span>
                )}
                <Toggle
                  name="linkExpiryEnabled"
                  checked={linkExpiry.enabled}
                  onChange={(_: unknown, e: { target: { checked: boolean } }) => {
                    const next = e.target.checked;
                    patchExpiry({
                      enabled: next,
                      option: 'set_amount',
                      mode: 'days',
                      // Clear the value when turning off so re-enabling
                      // starts with an empty field.
                      value: next ? linkExpiry.value : undefined,
                    });
                  }}
                  disabled={isLive}
                  roundedToggle
                />
              </div>
            </div>

            {linkExpiry.enabled && (
              <div className={styles.fieldRow}>
                <div className={styles.fieldLabelRow}>
                  <span className={`${styles.fieldLabel} ${styles.requiredLabel}`}>Set amount of time</span>
                  <Tooltip text="Only a maximum of 90 days allowed" position="right" hideOnScroll>
                    <button type="button" className={styles.infoIconBtn} aria-label="Set amount of time info">
                      <IconInfo size={14} />
                    </button>
                  </Tooltip>
                </div>
                <div className={`${styles.fieldGroup} ${styles.endDateFieldGroup}`}>
                  <FormInput
                    name="expiryValue"
                    type="number"
                    value={linkExpiry.value !== undefined ? String(linkExpiry.value) : ''}
                    placeholder="Enter number of days"
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
              </div>
            )}
          </div>
        </section>

      </div>
      </div>

      {/* ── Launch banner (fixed footer outside scroll) ──── */}
      <div className={styles.launchBanner}>
        <div className={styles.launchLeft}>
          <h3 className={styles.launchTitle}>Ready to launch your survey</h3>
          <p className={styles.launchDesc}>
            You're responsible for getting permission from contacts before sending text messages.
            {' '}<a href="#" onClick={(e) => e.preventDefault()}>See usage terms</a>
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
