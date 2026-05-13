import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import { surveyActions } from '../../store/surveySlice';
import type { SurveyResponse } from '../../types/survey.types';
import CommonDrawer from '@birdeye/elemental/core/atoms/CommonSideDrawer';
import ConfirmDialog from '../shared/ConfirmDialog/ConfirmDialog';
import Tooltip from '@birdeye/elemental/core/atoms/Tooltip';
import DatePicker from '@birdeye/elemental/core/components/DatePicker';
import {
  IconArrowLeft,
  IconChevronLeft,
  IconChevronDown,
  IconChevronUp,
  IconExternalLink,
  IconMoreVert,
  IconFilter,
  IconLink,
  IconCode,
  IconSend,
  IconCopy,
  IconBarChart,
  IconClock,
  IconInfo,
} from '../../shared/Icons/Icons';
import ReadOnlyQuestion from './ReadOnlyQuestion';
import EditSettings from './EditSettings';
import styles from './SurveyDetails.module.scss';

type DetailTab = 'view' | 'distribute' | 'responses' | 'edit' | 'reports';
type SortKey = keyof Pick<SurveyResponse, 'score' | 'contactName' | 'location' | 'respondedOn'>;
type SortDir = 'asc' | 'desc';

const MOCK_RESPONSES: SurveyResponse[] = [
  { id: '1', score: 9.0, contactName: 'Prabu', location: 'Central style, California', respondedOn: 'Mar 10, 2026' },
  { id: '2', score: 8.0, contactName: 'Rupa', location: '120, Kenal Road, California', respondedOn: 'Mar 10, 2026' },
  { id: '3', score: 2.0, contactName: 'Raynil kumar', location: '30, Christed Alford, California', respondedOn: 'Mar 10, 2026' },
];

const STATUS_LABEL: Record<string, string> = {
  running: 'Running',
  draft: 'Draft',
  expiring_soon: 'Running',
  expired: 'Expired',
};

const STATUS_CLASS: Record<string, string> = {
  running: styles.running,
  draft: styles.draft,
  expiring_soon: styles.running,
  expired: styles.expired,
};

const SortIcon: React.FC<{ col: SortKey; sortKey: SortKey; sortDir: SortDir }> = ({ col, sortKey, sortDir }) => {
  if (sortKey !== col) return <IconChevronDown size={16} color="#9e9e9e" />;
  return sortDir === 'asc'
    ? <IconChevronUp size={16} color="#212121" />
    : <IconChevronDown size={16} color="#212121" />;
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

const VALID_TABS: DetailTab[] = ['view', 'distribute', 'responses', 'edit', 'reports'];

const SurveyDetails: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const savedSurveys = useAppSelector(s => s.survey.savedSurveys);
  const survey = savedSurveys.find(s => s.id === surveyId);

  // activeTab is mirrored in the URL (?tab=...) so navigation round-trips
  // (Survey campaigns drill-down → back) restore the previously open tab.
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as DetailTab | null;
  const activeTab: DetailTab = tabFromUrl && VALID_TABS.includes(tabFromUrl) ? tabFromUrl : 'view';
  const setActiveTab = (tab: DetailTab) => {
    const next = new URLSearchParams(searchParams);
    if (tab === 'view') next.delete('tab');
    else next.set('tab', tab);
    // Clear any sub-section param so switching tabs always lands on the
    // top of that tab (e.g. Edit settings' landing page, not a deep view).
    next.delete('section');
    setSearchParams(next, { replace: false });
  };
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);

  // Distribute accordion
  const [distributeExpanded, setDistributeExpanded] = useState({
    surveyLink: true, embed: false, campaigns: false,
  });
  const [linkCopied, setLinkCopied] = useState(false);

  // Expiry-related
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [reopenDialogOpen, setReopenDialogOpen] = useState(false);
  const [reopenEndDate, setReopenEndDate] = useState('');

  const rowMenuRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (rowMenuRef.current && !rowMenuRef.current.contains(e.target as Node)) setOpenMenuId(null);
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) setActionsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!survey) {
    return (
      <div className={styles.notFound}>
        <p>Survey not found.</p>
        <button className={styles.notFoundBtn} onClick={() => navigate('/surveys')}>Back to All Surveys</button>
      </div>
    );
  }

  const surveyUrl = `https://birdeye.com/survey/${survey.id}?businessId=174673293981789`;
  const allQuestions = survey.surveyData?.pages.flatMap(p => p.questions) ?? [];
  const responseRate = survey.sent > 0 ? Math.round((survey.responses / survey.sent) * 100) : 0;
  const isExpired = survey.status === 'expired';
  const isRunning = survey.status === 'running' || survey.status === 'expiring_soon';

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir(key === 'score' ? 'desc' : 'asc'); }
  };

  const sorted = [...MOCK_RESPONSES].sort((a, b) => {
    const av = a[sortKey]; const bv = b[sortKey];
    const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const handleEdit = () => {
    setActionsOpen(false);
    if (survey.surveyData) dispatch(surveyActions.loadSurvey(survey.surveyData));
    navigate('/surveys/create');
  };

  const handleDelete = () => {
    dispatch(surveyActions.deleteSavedSurvey(survey.id));
    navigate('/surveys');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(surveyUrl).catch(() => {});
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const toggleDistribute = (key: keyof typeof distributeExpanded) =>
    setDistributeExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const handleCloseNow = () => {
    dispatch(surveyActions.closeSurveyNow({ surveyId: survey.id, actor: survey.owner }));
    setCloseConfirmOpen(false);
  };

  const handleReopen = () => {
    dispatch(surveyActions.reopenSurvey({
      surveyId: survey.id,
      newEndDate: reopenEndDate || undefined,
      actor: survey.owner,
    }));
    setReopenDialogOpen(false);
    setReopenEndDate('');
  };

  // Seed audit log entries for surveys without any
  const auditLog = survey.auditLog?.length
    ? survey.auditLog
    : [
        { id: 'seed-1', action: 'Created survey', actor: survey.owner, timestamp: new Date(Date.now() - 86400000 * 10).toISOString(), details: 'Survey created as draft' },
        { id: 'seed-2', action: 'Published survey', actor: survey.owner, timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), details: `Survey published and set to ${survey.status}` },
      ];

  return (
    <div className={styles.page}>
      {/* ── Page header ─────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} aria-label="Go back" onClick={() => navigate('/surveys')}>
            <IconArrowLeft size={20} color="#424242" />
          </button>
          <h1 className={styles.title}>{survey.title}</h1>
          <span className={`${styles.statusBadge} ${STATUS_CLASS[survey.status] ?? styles.draft}`}>
            {STATUS_LABEL[survey.status] ?? survey.status}
          </span>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.actionsContainer} ref={actionsRef}>
            <button className={styles.actionsBtn} onClick={() => setActionsOpen(o => !o)}>
              <span>Actions</span>
              <IconChevronDown size={16} color="#424242" />
            </button>
            {actionsOpen && (
              <div className={styles.actionsDropdown}>
                <button className={styles.actionsItem} onClick={handleEdit}>Edit</button>
                <button className={styles.actionsItem} onClick={() => { setActionsOpen(false); setActiveTab('distribute'); }}>Distribute</button>
                <button className={styles.actionsItem}>Duplicate</button>
                {isRunning && (
                  <button className={`${styles.actionsItem} ${styles.warnItem}`} onClick={() => { setActionsOpen(false); setCloseConfirmOpen(true); }}>
                    Close now
                  </button>
                )}
                {isExpired && (
                  <button className={styles.actionsItem} onClick={() => { setActionsOpen(false); setReopenDialogOpen(true); }}>
                    Reopen
                  </button>
                )}
                <button className={`${styles.actionsItem} ${styles.deleteItem}`} onClick={handleDelete}>Delete</button>
              </div>
            )}
          </div>
          <button className={styles.filterBtn} aria-label="Filter">
            <IconFilter size={20} color="#555" />
          </button>
        </div>
      </div>

      {/* ── Tab bar ──────────────────────────────────────── */}
      <div className={styles.tabBar}>
        {(['view', 'distribute', 'responses', 'edit', 'reports'] as DetailTab[]).map(tab => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'responses' && (<>Responses<span className={styles.tabBadge}>{survey.responses}</span></>)}
            {tab === 'reports' && (<>Reports<IconExternalLink size={14} color={activeTab === 'reports' ? '#1976d2' : '#9e9e9e'} /></>)}
            {tab === 'view' && 'View'}
            {tab === 'distribute' && 'Distribute'}
            {tab === 'edit' && 'Edit settings'}
          </button>
        ))}
      </div>

      {/* ── View tab ─────────────────────────────────────── */}
      {activeTab === 'view' && (
        <div className={styles.viewTab}>
          {allQuestions.length === 0 ? (
            <div className={styles.emptyTab}><p>No questions in this survey.</p></div>
          ) : (
            <div className={styles.viewQuestions}>
              {allQuestions.map(q => <ReadOnlyQuestion key={q.id} question={q} />)}
            </div>
          )}
        </div>
      )}

      {/* ── Distribute tab ───────────────────────────────── */}
      {activeTab === 'distribute' && (
        <div className={styles.distributeTab}>
          <div className={styles.distributeLeft}>
            <div className={styles.accordionCard}>
              <button className={styles.accordionHeader} onClick={() => toggleDistribute('surveyLink')}>
                <div className={styles.accordionHeaderLeft}><IconLink size={16} color="#555" /><span>Survey link</span></div>
                {distributeExpanded.surveyLink ? <IconChevronUp size={16} color="#555" /> : <IconChevronDown size={16} color="#555" />}
              </button>
              {distributeExpanded.surveyLink && (
                <div className={styles.accordionBody}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Select location <span className={styles.fieldRequired}>*</span></label>
                    <div className={styles.locationSelect}>
                      <span>{allQuestions.find(q => q.type === 'location')?.locationConfig?.locationChoices || 'All locations'}</span>
                      <IconChevronDown size={16} color="#555" />
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Survey link</label>
                    <div className={styles.linkField}>
                      <span className={styles.linkText}>{surveyUrl}</span>
                      <button className={styles.copyBtn} onClick={handleCopyLink} title={linkCopied ? 'Copied!' : 'Copy link'}>
                        <IconCopy size={16} color={linkCopied ? '#377e2c' : '#555'} />
                      </button>
                    </div>
                  </div>
                  <p className={styles.linkNote}>To track respondent information through the link, <button className={styles.linkNoteAction}>Use custom variables</button></p>
                </div>
              )}
            </div>

            <div className={styles.accordionCard}>
              <button className={styles.accordionHeader} onClick={() => toggleDistribute('embed')}>
                <div className={styles.accordionHeaderLeft}><IconCode size={16} color="#555" /><span>Embed on website</span></div>
                {distributeExpanded.embed ? <IconChevronUp size={16} color="#555" /> : <IconChevronDown size={16} color="#555" />}
              </button>
              {distributeExpanded.embed && (
                <div className={styles.accordionBody}>
                  <div className={styles.embedCodeBlock}>
                    <code className={styles.embedCode}>{`<script src="https://birdeye.com/embed/survey/${survey.id}/570/300"></script>\n<div id="bf-survey-widget"></div>`}</code>
                    <button className={styles.copyBtn}><IconCopy size={16} color="#555" /></button>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.accordionCard}>
              <button
                className={styles.accordionHeader}
                onClick={() => navigate(`/surveys/${survey.id}/campaigns`)}
              >
                <div className={styles.accordionHeaderLeft}><IconSend size={16} color="#555" /><span>Survey campaigns</span></div>
                <div className={styles.accordionHeaderRight}>
                  <IconExternalLink size={14} color="#9e9e9e" />
                </div>
              </button>
            </div>
          </div>

          <div className={styles.distributeRight}>
            <div className={styles.previewPanel}>
              <span className={styles.previewLabel}>Preview</span>
              <div className={styles.previewContent}>
                {allQuestions.length === 0
                  ? <p className={styles.previewEmpty}>No questions to preview.</p>
                  : allQuestions.map(q => <ReadOnlyQuestion key={q.id} question={q} />)
                }
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} />
                <span className={styles.progressLabel}>0% completed</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Responses tab ────────────────────────────────── */}
      {activeTab === 'responses' && (
        <div className={styles.tableWrapper}>
          <div className={styles.table}>
            <div className={styles.headerRow}>
              {[
                { key: 'score' as SortKey, label: 'Overall Score', cls: styles.scoreCol },
                { key: 'contactName' as SortKey, label: 'Contact name', cls: '' },
                { key: 'location' as SortKey, label: 'Location', cls: '' },
                { key: 'respondedOn' as SortKey, label: 'Responded on', cls: '' },
              ].map(({ key, label, cls }) => (
                <div
                  key={key}
                  className={`${styles.headerCell} ${cls} ${sortKey === key ? styles.sortedHeader : ''}`}
                  onClick={() => handleSort(key)}
                >
                  <span>{label}</span>
                  <SortIcon col={key} sortKey={sortKey} sortDir={sortDir} />
                </div>
              ))}
              <div className={`${styles.headerCell} ${styles.actionsCol}`} />
            </div>
            {sorted.map(response => (
              <div
                key={response.id}
                className={`${styles.row} ${hoveredId === response.id ? styles.rowHover : ''}`}
                onMouseEnter={() => setHoveredId(response.id)}
                onMouseLeave={() => { setHoveredId(null); if (openMenuId === response.id) setOpenMenuId(null); }}
              >
                <div className={`${styles.cell} ${styles.scoreCol} ${response.score >= 7 ? styles.scoreGreen : styles.scoreRed}`}>{response.score.toFixed(1)}</div>
                <div className={styles.cell}>{response.contactName}</div>
                <div className={styles.cell}>{response.location}</div>
                <div className={styles.cell}>{response.respondedOn}</div>
                <div className={`${styles.cell} ${styles.actionsCol}`}>
                  {hoveredId === response.id && (
                    <div className={styles.moreContainer} ref={openMenuId === response.id ? rowMenuRef : undefined}>
                      <button className={styles.moreBtn} onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === response.id ? null : response.id); }}>
                        <IconMoreVert size={16} color="#555" />
                      </button>
                      {openMenuId === response.id && (
                        <div className={styles.dropdown}>
                          <button className={styles.dropdownItem}>View survey response</button>
                          <button className={styles.dropdownItem}>Message contact</button>
                          <button className={styles.dropdownItem}>Create ticket</button>
                          <button className={`${styles.dropdownItem} ${styles.deleteItem}`}>Delete</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {sorted.length === 0 && <div className={styles.emptyState}>No responses yet.</div>}
          </div>
        </div>
      )}

      {/* ── Edit Settings tab — landing page + sub-flows ──── */}
      {activeTab === 'edit' && (
        <EditSettings
          survey={survey}
        />
      )}

      {/* ── Reports tab ──────────────────────────────────── */}
      {activeTab === 'reports' && (
        <div className={styles.reportsTab}>
          <div className={styles.reportsInner}>
            <div className={styles.reportsSummaryRow}>
              {[
                { num: survey.sent, label: 'Sent' },
                { num: survey.responses, label: 'Responses' },
                { num: `${responseRate}%`, label: 'Response rate' },
              ].map(({ num, label }) => (
                <div key={label} className={styles.statBox}>
                  <span className={styles.statNum}>{num}</span>
                  <span className={styles.statLabel}>{label}</span>
                </div>
              ))}
            </div>
            <div className={styles.reportLinkList}>
              {[
                { label: 'Survey NPS', desc: 'NPS score breakdown: promoters, passives, detractors' },
                { label: 'Responses', desc: 'Individual response records and trends over time' },
                { label: 'Survey distribution', desc: 'Delivery stats, open rates, and channel breakdown' },
              ].map(section => (
                <div key={section.label} className={styles.reportLinkCard}>
                  <div className={styles.reportLinkIcon}><IconBarChart size={20} color="#1976d2" /></div>
                  <div className={styles.reportLinkMeta}>
                    <span className={styles.reportLinkTitle}>{section.label}</span>
                    <span className={styles.reportLinkDesc}>{section.desc}</span>
                  </div>
                  <button className={styles.reportLinkBtn} onClick={() => navigate('/reports')}>
                    Open in Reports <IconExternalLink size={14} color="#1976d2" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Audit Log Drawer ──────────────────────────────────
         Elemental's CommonDrawer header is replaced with a custom one
         inside `children` so we can place the Aero back-arrow icon to
         the left of the title (matches the Figma "Change log" pattern). */}
      <CommonDrawer
        isOpen={auditDrawerOpen}
        title=""
        onClose={() => setAuditDrawerOpen(false)}
        width="650px"
        shouldScroll={true}
        buttonPosition="right"
      >
        <div className={styles.auditHeader}>
          <button
            type="button"
            className={styles.auditBackBtn}
            onClick={() => setAuditDrawerOpen(false)}
            aria-label="Back"
          >
            <IconArrowLeft size={20} color="#1C1B1F" />
          </button>
          <div className={styles.auditHeaderText}>
            <h2 className={styles.auditTitle}>Audit Log</h2>
            <p className={styles.drawerDesc}>Track all changes to survey expiration settings</p>
          </div>
        </div>
        <div className={styles.auditContent}>
          {auditLog.map((entry, idx) => (
            <div key={entry.id} className={styles.auditItem}>
              <div className={styles.auditLeft}>
                <div className={styles.auditDot}><IconClock size={16} color="#555555" /></div>
              </div>
              <div className={styles.auditBody}>
                <span className={styles.auditAction}>
                  <span className={styles.auditActor}>{entry.actor}</span>
                  {` ${entry.action}`}
                </span>
                <time className={styles.auditTime}>{fmtDate(entry.timestamp)}</time>
              </div>
            </div>
          ))}
        </div>
      </CommonDrawer>

      {/* ── Close Confirm Dialog (Aero popup pattern) ─────── */}
      <ConfirmDialog
        isOpen={closeConfirmOpen}
        title="Close survey"
        onClose={() => setCloseConfirmOpen(false)}
        primaryLabel="Delete"
        primaryTheme="primary"
        onPrimary={handleCloseNow}
      >
        <p>
          You're closing the {survey.title}. All in-progress sessions will end now.
          You can reopen the survey later.
        </p>
      </ConfirmDialog>

      {/* ── Reopen Dialog (Aero popup pattern) ───────────── */}
      <ConfirmDialog
        isOpen={reopenDialogOpen}
        title="Reopen Survey"
        onClose={() => setReopenDialogOpen(false)}
        primaryLabel="Reopen Survey"
        onPrimary={handleReopen}
      >
        <p>Set a new end date to reopen this survey, or leave blank to reopen with no expiration.</p>
        {survey.expiration?.endDate && (
          <p className={styles.modalMeta}>Previously expired: <strong>{fmtDate(survey.expiration.endDate)}</strong></p>
        )}
        <div className={styles.modalField}>
          <div className={styles.modalLabelRow}>
            <span className={styles.modalLabel}>New End Date</span>
            <Tooltip text="Leave empty to reopen without setting a new expiration" position="right" hideOnScroll>
              <button type="button" className={styles.modalInfoBtn} aria-label="New End Date info">
                <IconInfo size={14} />
              </button>
            </Tooltip>
          </div>
          <DatePicker
            name="reopenEndDate"
            startDt={reopenEndDate || undefined}
            range={false}
            showTimePicker
            disablePastDates
            enableFutureDates
            showApplyButtons={false}
            inlineApplyButtonTrigger
            sendDateTime={(startDt) => {
              if (!startDt) {
                setReopenEndDate('');
                return;
              }
              const parsed = new Date(startDt);
              setReopenEndDate(Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString());
            }}
          />
        </div>
        <p className={styles.modalMeta}>
          Previously-issued links resume immediately. This action will be logged.
        </p>
      </ConfirmDialog>

    </div>
  );
};

export default SurveyDetails;
