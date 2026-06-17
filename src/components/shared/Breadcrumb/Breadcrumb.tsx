// ============================================================
// Breadcrumb — Aero "Steps" pattern (Figma node 2447:6951)
// ------------------------------------------------------------
// Renders a horizontal trail of segments separated by chevrons.
// Every segment except the last is interactive — either a router
// link (when `to` is set) or a button (when `onClick` is set).
// The last segment is the current page and is rendered in dark
// non-clickable text. Keeps a single source of truth for the
// breadcrumb chrome across pages.
// ============================================================
import React from 'react';
import { Link } from 'react-router-dom';
import { IconChevronRight } from '../../../shared/Icons/Icons';
import styles from './Breadcrumb.module.scss';

export interface BreadcrumbItem {
  label: string;
  to?: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={`${item.label}-${idx}`}>
            {isLast ? (
              <span className={styles.current} aria-current="page">{item.label}</span>
            ) : item.to ? (
              <Link to={item.to} className={styles.link}>{item.label}</Link>
            ) : (
              <button type="button" className={styles.link} onClick={item.onClick}>
                {item.label}
              </button>
            )}
            {!isLast && (
              <span className={styles.separator} aria-hidden="true">
                <IconChevronRight size={20} color="#9e9e9e" />
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
