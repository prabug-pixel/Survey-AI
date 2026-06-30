import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import { surveyActions } from '../../store/surveySlice';
import type { SurveyResponse } from '../../types/survey.types';
import type { EditedResponseEntry } from '../../store/surveySlice';
import CommonDrawer from '@birdeye/elemental/core/atoms/CommonSideDrawer';
import ConfirmDialog from '../shared/ConfirmDialog/ConfirmDialog';
import { Chip } from '../shared/Chip';
import {
  IconArrowLeft,
  IconChevronDown,
  IconChevronUp,
  IconChevronLeft,
  IconChevronRight,
  IconExternalLink,
  IconMoreVert,
  IconLink,
  IconCode,
  IconSend,
  IconCopy,
  IconBarChart,
  IconClock,
} from '../../shared/Icons/Icons';
import ReadOnlyQuestion from './ReadOnlyQuestion';
import EditSettings from './EditSettings';
import Breadcrumb, { type BreadcrumbItem } from '../shared/Breadcrumb/Breadcrumb';
import styles from './SurveyDetails.module.scss';

type DetailTab = 'view' | 'distribute' | 'responses' | 'edit' | 'reports';
type SortKey = keyof Pick<SurveyResponse, 'score' | 'contactName' | 'location' | 'respondedOn'>;
type SortDir = 'asc' | 'desc';

const MOCK_RESPONSES: SurveyResponse[] = [
  {
    id: '1', score: 9.0, contactName: 'Prabu', location: 'Central style, California', respondedOn: 'Mar 10, 2026',
    contactEmail: 'prabu@example.com', contactPhone: '+1 (555) 123-4567', surveySentOn: 'Mar 9, 2026',
    completionStatus: 'Fully completed', assistedBy: '-',
    answers: [{ questionId: 'q1', value: 9 }, { questionId: 'q2', value: 'choice-1' }],
  },
  {
    id: '2', score: 8.0, contactName: 'Rupa', location: '120, Kenal Road, California', respondedOn: 'Mar 10, 2026',
    contactEmail: '-', contactPhone: '-', surveySentOn: 'Mar 9, 2026',
    completionStatus: 'Fully completed', assistedBy: '-',
    answers: [{ questionId: 'q1', value: 8 }, { questionId: 'q2', value: 'choice-0' }],
  },
  {
    id: '3', score: 2.0, contactName: 'Raynil kumar', location: '30, Christed Alford, California', respondedOn: 'Mar 10, 2026',
    contactEmail: '-', contactPhone: '-', surveySentOn: 'Mar 9, 2026',
    completionStatus: 'Partially completed', assistedBy: '-',
    answers: [{ questionId: 'q1', value: 2 }],
  },
];

const STATUS_LABEL: Record<string, string> = {
  published: 'Published',
  draft: 'Draft',
  expiring_soon: 'Published',
  expired: 'Expired',
};

const STATUS_CLASS: Record<string, string> = {
  published: styles.published,
  draft: styles.draft,
  expiring_soon: styles.published,
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
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(null);
  const [detailMenuOpen, setDetailMenuOpen] = useState(false);
  const [generatedAnswers, setGeneratedAnswers] = useState<Array<{ questionId: string; value: string | number | string[] }>>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editAnswers, setEditAnswers] = useState<Array<{ questionId: string; value: string | number | string[] }>>([]);

  const editedResponses = useAppSelector(s => s.survey.editedResponses);

  // Distribute accordion
  const [distributeExpanded, setDistributeExpanded] = useState({
    surveyLink: true, embed: false, campaigns: false,
  });
  const [linkCopied, setLinkCopied] = useState(false);

  // Expiry-related
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [reopenDialogOpen, setReopenDialogOpen] = useState(false);

  const rowMenuRef = useRef<HTMLDivElement>(null);
  const detailMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (rowMenuRef.current && !rowMenuRef.current.contains(e.target as Node)) setOpenMenuId(null);
      if (detailMenuRef.current && !detailMenuRef.current.contains(e.target as Node)) setDetailMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!survey) {
    return (
      <div className={styles.notFound}>
        <p>Survey not found.</p>
        <button className={styles.notFoundBtn} onClick={() => navigate('/surveys')}>Back to all surveys</button>
      </div>
    );
  }

  const surveyUrl = `https://birdeye.com/survey/${survey.id}?businessId=174673293981789`;
  const allQuestions = survey.surveyData?.pages.flatMap(p => p.questions) ?? [];
  const responseRate = survey.sent > 0 ? Math.round((survey.responses / survey.sent) * 100) : 0;
  const isExpired = survey.status === 'expired';
  const isRunning = survey.status === 'published' || survey.status === 'expiring_soon';

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir(key === 'score' ? 'desc' : 'asc'); }
  };

  const computeScore = (answers: Array<{ questionId: string; value: string | number | string[] }>): number => {
    const numeric: number[] = [];
    for (const a of answers) {
      const q = allQuestions.find(q => q.id === a.questionId);
      if (!q || typeof a.value !== 'number') continue;
      if (q.type === 'nps') {
        numeric.push(a.value); // already 0–10
      } else if (q.type === 'rating' && q.ratingConfig) {
        numeric.push((a.value / q.ratingConfig.scale) * 10);
      }
    }
    if (!numeric.length) return 0;
    return Math.round((numeric.reduce((s, v) => s + v, 0) / numeric.length) * 10) / 10;
  };

  const openResponseDetail = (id: string) => {
    setIsEditing(false);
    const savedKey = `${survey.id}_${id}`;
    if (editedResponses[savedKey]) {
      setGeneratedAnswers(editedResponses[savedKey].answers);
      setSelectedResponseId(id);
      return;
    }
    const answers = allQuestions
      .filter(q => !['welcome', 'thank_you', 'page_break', 'page_title', 'help_text', 'contact_info', 'location'].includes(q.type))
      .map(q => {
        let value: string | number | string[];
        if (q.type === 'nps' && q.ratingConfig) {
          value = Math.floor(Math.random() * 11);
        } else if (q.type === 'rating' && q.ratingConfig) {
          value = Math.floor(Math.random() * q.ratingConfig.scale) + 1;
        } else if ((q.type === 'multiple_choice' || q.type === 'dropdown') && q.choices?.length) {
          value = q.choices[Math.floor(Math.random() * q.choices.length)].id;
        } else if (q.type === 'checkboxes' && q.choices?.length) {
          const shuffled = [...q.choices].sort(() => Math.random() - 0.5);
          value = shuffled.slice(0, Math.floor(Math.random() * 2) + 1).map(c => c.id);
        } else if (q.type === 'review_collector') {
          value = Math.floor(Math.random() * 5) + 1;
        } else {
          value = '';
        }
        return { questionId: q.id, value };
      });
    setGeneratedAnswers(answers);
    setSelectedResponseId(id);
  };

  const handleStartEdit = () => {
    setEditAnswers([...generatedAnswers]);
    setIsEditing(true);
    setDetailMenuOpen(false);
  };

  const handleEditAnswerChange = (questionId: string, value: string | number | string[]) => {
    setEditAnswers(prev => prev.map(a => a.questionId === questionId ? { ...a, value } : a));
  };

  const handleSaveEdit = () => {
    const newScore = computeScore(editAnswers);
    const key = `${survey.id}_${selectedResponseId}`;
    const prevAnswers = generatedAnswers;
    const changedIds = editAnswers
      .filter(a => {
        const prev = prevAnswers.find(p => p.questionId === a.questionId);
        return !prev || JSON.stringify(prev.value) !== JSON.stringify(a.value);
      })
      .map(a => a.questionId);
    // Preserve previously edited question IDs and merge with new ones
    const existingEntry = editedResponses[key];
    const mergedEditedIds = Array.from(new Set([
      ...(existingEntry?.editedQuestionIds ?? []),
      ...changedIds,
    ]));
    const entry: EditedResponseEntry = {
      answers: editAnswers,
      score: newScore,
      editedAt: new Date().toISOString(),
      editedBy: 'Prabu',
      editedQuestionIds: mergedEditedIds,
    };
    dispatch(surveyActions.saveEditedResponse({ key, entry }));
    setGeneratedAnswers(editAnswers);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const sorted = [...MOCK_RESPONSES].sort((a, b) => {
    const av = a[sortKey]; const bv = b[sortKey];
    const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
    return sortDir === 'asc' ? cmp : -cmp;
  });

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
      actor: survey.owner,
    }));
    setReopenDialogOpen(false);
  };

  // Seed audit log entries for surveys without any
  const auditLog = survey.auditLog?.length
    ? survey.auditLog
    : [
        { id: 'seed-1', action: 'Created survey', actor: survey.owner, timestamp: new Date(Date.now() - 86400000 * 10).toISOString(), details: 'Survey created as draft' },
        { id: 'seed-2', action: 'Published survey', actor: survey.owner, timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), details: `Survey published and set to ${survey.status}` },
      ];

  // Breadcrumb trail — root → survey title → tab → sub-section.
  // Every segment except the last is clickable so users can hop back
  // up the path without relying on browser history.
  const TAB_LABEL: Record<DetailTab, string> = {
    view: 'View',
    distribute: 'Distribute',
    responses: 'Responses',
    edit: 'Settings',
    reports: 'Reports',
  };
  const sectionFromUrl = searchParams.get('section');
  const SECTION_LABEL: Record<string, string> = { expiry: 'Expiry settings' };
  const surveyPath = `/surveys/${survey.id}`;
  const tabHref = (tab: DetailTab) => (tab === 'view' ? surveyPath : `${surveyPath}?tab=${tab}`);
  const selectedResponse = MOCK_RESPONSES.find(r => r.id === selectedResponseId) ?? null;

  const crumbs: BreadcrumbItem[] = [
    { label: 'Surveys AI', to: '/surveys' },
    { label: survey.title, to: tabHref('view') },
  ];
  if (activeTab !== 'view') {
    const isResponseDetail = activeTab === 'responses' && !!selectedResponseId;
    crumbs.push(
      isResponseDetail
        ? { label: TAB_LABEL[activeTab], onClick: () => setSelectedResponseId(null) }
        : { label: TAB_LABEL[activeTab], to: tabHref(activeTab) }
    );
  }
  if (activeTab === 'edit' && sectionFromUrl && SECTION_LABEL[sectionFromUrl]) {
    crumbs.push({ label: SECTION_LABEL[sectionFromUrl] });
  }
  if (activeTab === 'responses' && selectedResponse) {
    crumbs.push({ label: selectedResponse.contactName });
  }

  return (
    <div className={styles.page}>
      {/* ── Breadcrumb (replaces the page-level back arrow) ─ */}
      <Breadcrumb items={crumbs} />

      {/* ── Page header ─────────────────────────────────── */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>{survey.title}</h1>
          <span className={`${styles.statusBadge} ${STATUS_CLASS[survey.status] ?? styles.draft}`}>
            {STATUS_LABEL[survey.status] ?? survey.status}
          </span>
        </div>

        <div className={styles.headerRight}>
          {isRunning && (
            <button className={styles.actionsBtn} onClick={() => setCloseConfirmOpen(true)}>
              Close now
            </button>
          )}
          {isExpired && (
            <button className={styles.actionsBtn} onClick={() => setReopenDialogOpen(true)}>
              Reopen
            </button>
          )}
        </div>
      </div>

      {/* ── Tab bar ──────────────────────────────────────── */}
      {!(activeTab === 'responses' && selectedResponseId) && <div className={styles.tabBar}>
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
            {tab === 'edit' && 'Settings'}
          </button>
        ))}
      </div>}

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
      {activeTab === 'responses' && !selectedResponseId && (
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
                style={{ cursor: 'pointer' }}
                onClick={() => openResponseDetail(response.id)}
                onMouseEnter={() => setHoveredId(response.id)}
                onMouseLeave={() => { setHoveredId(null); if (openMenuId === response.id) setOpenMenuId(null); }}
              >
                {(() => {
                  const rowKey = `${survey.id}_${response.id}`;
                  const rowEdited = editedResponses[rowKey];
                  const rowScore = rowEdited ? rowEdited.score : response.score;
                  return (
                    <div className={`${styles.cell} ${styles.scoreCol} ${rowScore >= 7 ? styles.scoreGreen : styles.scoreRed}`}>
                      {rowScore.toFixed(1)}
                      {rowEdited && <span className={styles.editedLabel}>&nbsp;(Edited)</span>}
                    </div>
                  );
                })()}
                <div className={styles.cell}>{response.contactName}</div>
                <div className={styles.cell}>{response.location}</div>
                <div className={styles.cell}>{response.respondedOn}</div>
                <div className={`${styles.cell} ${styles.actionsCol}`}>
                  {hoveredId === response.id && (
                    <div className={styles.moreContainer} ref={openMenuId === response.id ? rowMenuRef : undefined}>
                      <button
                        className={styles.moreBtn}
                        onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === response.id ? null : response.id); }}
                      >
                        <IconMoreVert size={16} color="#555" />
                      </button>
                      {openMenuId === response.id && (
                        <div className={styles.dropdown}>
                          <button className={styles.dropdownItem} onClick={e => { e.stopPropagation(); openResponseDetail(response.id); setOpenMenuId(null); }}>View survey response</button>
                          <button className={styles.dropdownItem} onClick={e => e.stopPropagation()}>Message contact</button>
                          <button className={styles.dropdownItem} onClick={e => e.stopPropagation()}>Create ticket</button>
                          <button className={`${styles.dropdownItem} ${styles.deleteItem}`} onClick={e => e.stopPropagation()}>Delete</button>
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

      {/* ── Response detail view ─────────────────────────── */}
      {activeTab === 'responses' && selectedResponse && (() => {
        const currentIdx = sorted.findIndex(r => r.id === selectedResponse.id);
        const prevResponse = currentIdx > 0 ? sorted[currentIdx - 1] : null;
        const nextResponse = currentIdx < sorted.length - 1 ? sorted[currentIdx + 1] : null;
        const savedKey = `${survey.id}_${selectedResponse.id}`;
        const isEdited = !!editedResponses[savedKey];
        const displayScore = isEdited ? editedResponses[savedKey].score : selectedResponse.score;
        const activeAnswers = isEditing ? editAnswers : generatedAnswers;
        const filteredQs = allQuestions.filter(q =>
          !['welcome', 'thank_you', 'page_break', 'page_title', 'help_text'].includes(q.type)
        );

        return (
          <div className={styles.responseDetail}>
            {/* Detail header */}
            <div className={styles.responseDetailHeader}>
              <div className={styles.responseDetailLeft}>
                <span className={styles.responseDetailName}>{selectedResponse.contactName}</span>
                <span className={`${styles.responseDetailScore} ${displayScore >= 7 ? styles.scoreGreen : styles.scoreRed}`}>
                  Overall score:&nbsp;{displayScore.toFixed(1)}
                </span>
                {isEdited && (
                  <Chip
                    type="tonal"
                    color="grey"
                    className="!font-medium"
                    style={{
                      height: '20px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      color: 'rgba(85, 85, 85, 1)',
                      backgroundColor: 'rgba(234, 234, 234, 1)',
                    }}
                  >
                    Edited
                  </Chip>
                )}
              </div>
              <div className={styles.responseDetailRight}>
                {isEditing ? (
                  <>
                    <button className={styles.actionsBtn} onClick={handleCancelEdit}>Cancel</button>
                    <button className={`${styles.actionsBtn} ${styles.actionsBtnPrimary}`} onClick={handleSaveEdit}>Save</button>
                  </>
                ) : (
                  <>
                    <div className={styles.moreContainer} ref={detailMenuRef}>
                      <button className={styles.moreBtn} onClick={() => setDetailMenuOpen(o => !o)}>
                        <IconMoreVert size={16} color="#555" />
                      </button>
                      {detailMenuOpen && (
                        <div className={styles.dropdown}>
                          <button className={styles.dropdownItem} onClick={handleStartEdit}>Edit responses</button>
                          <button className={styles.dropdownItem} onClick={() => setDetailMenuOpen(false)}>Direct message</button>
                          <button className={styles.dropdownItem} onClick={() => setDetailMenuOpen(false)}>Create ticket</button>
                        </div>
                      )}
                    </div>
                    <button className={styles.actionsBtn}>Ticket response</button>
                    <button
                      className={styles.moreBtn}
                      disabled={!prevResponse}
                      onClick={() => prevResponse && openResponseDetail(prevResponse.id)}
                      title="Previous response"
                    >
                      <IconChevronLeft size={16} color={prevResponse ? '#555' : '#ccc'} />
                    </button>
                    <button
                      className={styles.moreBtn}
                      disabled={!nextResponse}
                      onClick={() => nextResponse && openResponseDetail(nextResponse.id)}
                      title="Next response"
                    >
                      <IconChevronRight size={16} color={nextResponse ? '#555' : '#ccc'} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Scrollable body */}
            <div className={styles.responseDetailBody}>
              {/* Contact information card */}
              <p className={styles.responseSection}>CONTACT INFORMATION</p>
              <div className={styles.responseContactCard}>
                {[
                  { label: 'Contact email', value: selectedResponse.contactEmail ?? '-' },
                  { label: 'Contact phone', value: selectedResponse.contactPhone ?? '-' },
                  { label: 'Survey sent on', value: selectedResponse.surveySentOn ?? '-' },
                  { label: 'Location', value: selectedResponse.location },
                  { label: 'Completion Status', value: selectedResponse.completionStatus ?? '-' },
                  { label: 'Responded on', value: selectedResponse.respondedOn },
                  { label: 'Assisted by', value: selectedResponse.assistedBy ?? '-' },
                ].map(({ label, value }) => (
                  <div key={label} className={styles.responseContactField}>
                    <span className={styles.responseContactLabel}>{label}</span>
                    <span className={styles.responseContactValue}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Survey responses */}
              <p className={styles.responseSection}>SURVEY RESPONSE</p>
              <div className={styles.responseQuestions}>
                {filteredQs.map(q => {
                  const ans = activeAnswers.find(a => a.questionId === q.id);
                  const savedEntry = editedResponses[savedKey];
                  const isQuestionEdited = !isEditing && !!savedEntry?.editedQuestionIds?.includes(q.id);
                  return (
                    <ReadOnlyQuestion
                      key={q.id}
                      question={q}
                      answer={ans?.value}
                      editing={isEditing}
                      onAnswerChange={isEditing ? (v) => handleEditAnswerChange(q.id, v) : undefined}
                      isEdited={isQuestionEdited}
                      editedBy={isQuestionEdited ? savedEntry.editedBy : undefined}
                      editedAt={isQuestionEdited ? savedEntry.editedAt : undefined}
                    />
                  );
                })}
                {filteredQs.length === 0 && (
                  <p className={styles.emptyState}>No questions in this survey.</p>
                )}
              </div>
            </div>
          </div>
        );
      })()}

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
          {auditLog.map((entry) => (
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
        title="Close this survey?"
        onClose={() => setCloseConfirmOpen(false)}
        primaryLabel="Close survey"
        primaryTheme="primary"
        onPrimary={handleCloseNow}
      >
        <p>
          You're closing {survey.title}. All in-progress sessions will end.
          You can reopen it later.
        </p>
      </ConfirmDialog>

      {/* ── Reopen Dialog (Aero popup pattern) ───────────── */}
      <ConfirmDialog
        isOpen={reopenDialogOpen}
        title="Reopen this survey?"
        onClose={() => setReopenDialogOpen(false)}
        primaryLabel="Reopen survey"
        onPrimary={handleReopen}
      >
        {survey.expiration?.endDate && (
          <p className={styles.modalMeta}>Previously expired: <strong>{fmtDate(survey.expiration.endDate)}</strong></p>
        )}
        <p className={styles.modalMeta}>
          Previously-issued links resume immediately. We'll log this change.
        </p>
      </ConfirmDialog>

    </div>
  );
};

export default SurveyDetails;
