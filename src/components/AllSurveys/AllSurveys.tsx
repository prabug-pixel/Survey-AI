import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import { surveyActions } from '../../store/surveySlice';
import type { SavedSurvey } from '../../types/survey.types';
import {
  IconChevronDown,
  IconChevronUp,
  IconMoreVert,
  IconExternalLink,
  IconSearch,
} from '../../shared/Icons/Icons';
import styles from './AllSurveys.module.scss';

type SortKey = 'title' | 'status' | 'sent' | 'responses' | 'lastUpdated' | 'owner';
type SortDir = 'asc' | 'desc';

const COLUMNS: { key: SortKey; label: string; defaultDir: SortDir }[] = [
  { key: 'title', label: 'Name', defaultDir: 'asc' },
  { key: 'status', label: 'Status', defaultDir: 'asc' },
  { key: 'sent', label: 'Sent', defaultDir: 'desc' },
  { key: 'responses', label: 'Responses', defaultDir: 'desc' },
  { key: 'lastUpdated', label: 'Last updated', defaultDir: 'desc' },
  { key: 'owner', label: 'Owner', defaultDir: 'asc' },
];

const AllSurveys: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const savedSurveys = useAppSelector(s => s.survey.savedSurveys);

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('lastUpdated');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(COLUMNS.find(c => c.key === key)?.defaultDir ?? 'asc');
    }
  };

  const sorted = [...savedSurveys].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    const cmp = typeof av === 'number' && typeof bv === 'number'
      ? av - bv
      : String(av).localeCompare(String(bv));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const handleEdit = (survey: SavedSurvey) => {
    setOpenMenuId(null);
    if (survey.surveyData) {
      dispatch(surveyActions.loadSurvey(survey.surveyData));
    } else {
      dispatch(surveyActions.resetSurvey());
    }
    navigate('/surveys/create');
  };

  const handleDelete = (id: string) => {
    dispatch(surveyActions.deleteSavedSurvey(id));
    setOpenMenuId(null);
  };

  const SortIcon: React.FC<{ col: SortKey }> = ({ col }) => {
    if (sortKey !== col) return <IconChevronDown size={16} color="#9e9e9e" />;
    return sortDir === 'asc'
      ? <IconChevronUp size={16} color="#212121" />
      : <IconChevronDown size={16} color="#212121" />;
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>All surveys</h1>
          <span className={styles.count}>{savedSurveys.length}</span>
        </div>
        <button className={styles.searchBtn} aria-label="Search surveys">
          <IconSearch size={20} color="#555" />
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <div className={styles.table}>
          {/* Header row */}
          <div className={styles.headerRow}>
            {COLUMNS.map(col => (
              <div
                key={col.key}
                className={`${styles.headerCell} ${col.key === 'title' ? styles.nameCol : ''} ${col.key === 'status' ? styles.statusCol : ''} ${sortKey === col.key ? styles.sortedHeader : ''}`}
                onClick={() => handleSort(col.key)}
              >
                <span>{col.label}</span>
                <SortIcon col={col.key} />
              </div>
            ))}
            <div className={`${styles.headerCell} ${styles.actionsCol}`} />
          </div>

          {/* Data rows */}
          {sorted.map(survey => (
            <div
              key={survey.id}
              className={`${styles.row} ${hoveredId === survey.id ? styles.rowHover : ''}`}
              onMouseEnter={() => setHoveredId(survey.id)}
              onMouseLeave={() => {
                setHoveredId(null);
                if (openMenuId === survey.id) setOpenMenuId(null);
              }}
            >
              {/* Name */}
              <div className={`${styles.cell} ${styles.nameCol}`}>
                <button className={styles.surveyName} onClick={() => handleEdit(survey)}>
                  {survey.title}
                </button>
                <span className={styles.accessLabel}>You have edit access</span>
              </div>

              {/* Status */}
              <div className={`${styles.cell} ${styles.statusCol}`}>
                <span className={`${styles.badge} ${styles[survey.status]}`}>
                  {{ running: 'Running', draft: 'Draft', expiring_soon: 'Expiring Soon', expired: 'Expired' }[survey.status] ?? survey.status}
                </span>
              </div>

              {/* Sent */}
              <div className={styles.cell}>{survey.sent}</div>

              {/* Responses */}
              <div className={styles.cell}>{survey.responses}</div>

              {/* Last updated */}
              <div className={styles.cell}>{survey.lastUpdated}</div>

              {/* Owner */}
              <div className={styles.cell}>{survey.owner}</div>

              {/* Actions */}
              <div className={`${styles.cell} ${styles.actionsCol}`}>
                {hoveredId === survey.id && (
                  <div className={styles.moreContainer} ref={openMenuId === survey.id ? menuRef : undefined}>
                    <button
                      className={styles.moreBtn}
                      aria-label="More actions"
                      onClick={e => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === survey.id ? null : survey.id);
                      }}
                    >
                      <IconMoreVert size={16} color="#555" />
                    </button>

                    {openMenuId === survey.id && (
                      <div className={styles.dropdown}>
                        <button className={styles.dropdownItem} onClick={() => { setOpenMenuId(null); navigate(`/surveys/${survey.id}`); }}>View details</button>
                        <button className={styles.dropdownItem}>Preview</button>
                        <button className={styles.dropdownItem} onClick={() => handleEdit(survey)}>Edit</button>
                        <button className={styles.dropdownItem}>Distribute</button>
                        <button className={styles.dropdownItem}>Duplicate</button>
                        <button className={styles.dropdownItem}>
                          View reports
                          <IconExternalLink size={16} color="#555" />
                        </button>
                        <button
                          className={`${styles.dropdownItem} ${styles.deleteItem}`}
                          onClick={() => handleDelete(survey.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {sorted.length === 0 && (
            <div className={styles.emptyState}>
              No surveys yet. Click <strong>Create survey</strong> to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllSurveys;
