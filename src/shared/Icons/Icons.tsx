// ============================================================
// SVG Icon Library — consistent iconography across the product
// ============================================================

import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const IconHome: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 21V12h6v9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconChat: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconClock: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
    <path d="M12 7v5l3 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconStar: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconCalendar: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="4" width="18" height="17" rx="2" stroke={color} strokeWidth="1.5" />
    <path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconDollar: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
    <path d="M12 7v10M15 9.5c0-1.38-1.34-2.5-3-2.5s-3 1.12-3 2.5 1.34 2.5 3 2.5 3 1.12 3 2.5-1.34 2.5-3 2.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconTarget: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
    <circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.5" />
    <circle cx="12" cy="12" r="1" fill={color} />
  </svg>
);

export const IconUsers: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="9" cy="7" r="4" stroke={color} strokeWidth="1.5" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconSurvey: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="1.5" />
    <path d="M7 8h10M7 12h10M7 16h6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconSettings: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconChevronLeft: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M15 18l-6-6 6-6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconEdit: React.FC<IconProps> = ({ size = 16, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconTrash: React.FC<IconProps> = ({ size = 16, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <polyline points="3,6 5,6 21,6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconPlus: React.FC<IconProps> = ({ size = 16, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconClose: React.FC<IconProps> = ({ size = 16, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconDragHandle: React.FC<IconProps> = ({ size = 16, color = 'currentColor', className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    style={{ transform: 'rotate(90deg)' }}
  >
    <circle cx="9" cy="6" r="1.5" fill={color} />
    <circle cx="15" cy="6" r="1.5" fill={color} />
    <circle cx="9" cy="12" r="1.5" fill={color} />
    <circle cx="15" cy="12" r="1.5" fill={color} />
    <circle cx="9" cy="18" r="1.5" fill={color} />
    <circle cx="15" cy="18" r="1.5" fill={color} />
  </svg>
);

export const IconDesktop: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="3" width="20" height="14" rx="2" stroke={color} strokeWidth="1.5" />
    <line x1="8" y1="21" x2="16" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="12" y1="17" x2="12" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconMobile: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="5" y="2" width="14" height="20" rx="2" stroke={color} strokeWidth="1.5" />
    <line x1="10" y1="18" x2="14" y2="18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconTheme: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconPalette: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M9.98526 17.5827C8.94679 17.5827 7.96818 17.385 7.04943 16.9898C6.13054 16.5945 5.32658 16.0523 4.63755 15.3631C3.94839 14.6741 3.40616 13.8688 3.01089 12.9473C2.61561 12.0257 2.41797 11.0431 2.41797 9.99935C2.41797 8.94171 2.61776 7.9556 3.01734 7.04102C3.41693 6.12643 3.96957 5.32331 4.67526 4.63164C5.38082 3.93983 6.20748 3.39761 7.15526 3.00497C8.1029 2.61234 9.11248 2.41602 10.184 2.41602C11.1979 2.41602 12.1538 2.59018 13.0517 2.93852C13.9498 3.28685 14.7342 3.7647 15.4051 4.37206C16.076 4.97942 16.607 5.69122 16.998 6.50747C17.3891 7.32359 17.5846 8.20227 17.5846 9.14352C17.5846 10.322 17.1768 11.3564 16.3611 12.2468C15.5454 13.1374 14.4949 13.5827 13.2096 13.5827H11.8251C11.6017 13.5827 11.4016 13.6601 11.2248 13.815C11.048 13.97 10.9596 14.1671 10.9596 14.4064C10.9596 14.7056 11.0638 14.9073 11.2721 15.0114C11.4805 15.1156 11.5846 15.4449 11.5846 15.9993C11.5846 16.3689 11.4359 16.7253 11.1384 17.0683C10.8407 17.4112 10.4564 17.5827 9.98526 17.5827ZM6.23443 10.2325C6.44012 10.0268 6.54297 9.7824 6.54297 9.49935C6.54297 9.21629 6.44012 8.97192 6.23443 8.76622C6.02873 8.56053 5.78436 8.45768 5.5013 8.45768C5.21825 8.45768 4.97387 8.56053 4.76818 8.76622C4.56248 8.97192 4.45964 9.21629 4.45964 9.49935C4.45964 9.7824 4.56248 10.0268 4.76818 10.2325C4.97387 10.4382 5.21825 10.541 5.5013 10.541C5.78436 10.541 6.02873 10.4382 6.23443 10.2325ZM8.73443 7.23247C8.94012 7.02678 9.04297 6.7824 9.04297 6.49935C9.04297 6.21629 8.94012 5.97192 8.73443 5.76622C8.52873 5.56053 8.28436 5.45768 8.0013 5.45768C7.71825 5.45768 7.47387 5.56053 7.26818 5.76622C7.06248 5.97192 6.95964 6.21629 6.95964 6.49935C6.95964 6.7824 7.06248 7.02678 7.26818 7.23247C7.47387 7.43817 7.71825 7.54102 8.0013 7.54102C8.28436 7.54102 8.52873 7.43817 8.73443 7.23247ZM12.7344 7.23247C12.9401 7.02678 13.043 6.7824 13.043 6.49935C13.043 6.21629 12.9401 5.97192 12.7344 5.76622C12.5287 5.56053 12.2844 5.45768 12.0013 5.45768C11.7182 5.45768 11.4739 5.56053 11.2682 5.76622C11.0625 5.97192 10.9596 6.21629 10.9596 6.49935C10.9596 6.7824 11.0625 7.02678 11.2682 7.23247C11.4739 7.43817 11.7182 7.54102 12.0013 7.54102C12.2844 7.54102 12.5287 7.43817 12.7344 7.23247ZM15.2344 10.2325C15.4401 10.0268 15.543 9.7824 15.543 9.49935C15.543 9.21629 15.4401 8.97192 15.2344 8.76622C15.0287 8.56053 14.7844 8.45768 14.5013 8.45768C14.2182 8.45768 13.9739 8.56053 13.7682 8.76622C13.5625 8.97192 13.4596 9.21629 13.4596 9.49935C13.4596 9.7824 13.5625 10.0268 13.7682 10.2325C13.9739 10.4382 14.2182 10.541 14.5013 10.541C14.7844 10.541 15.0287 10.4382 15.2344 10.2325ZM9.98526 16.4993C10.1487 16.4993 10.2756 16.4416 10.3659 16.3262C10.4562 16.2108 10.5013 16.1018 10.5013 15.9993C10.5013 15.7771 10.3971 15.5934 10.1888 15.4481C9.98047 15.3028 9.8763 14.9716 9.8763 14.4546C9.8763 13.9161 10.0603 13.4556 10.4284 13.0731C10.7964 12.6906 11.2444 12.4993 11.7721 12.4993H13.2096C14.1905 12.4993 14.9843 12.1599 15.5911 11.481C16.1979 10.802 16.5013 10.0228 16.5013 9.14352C16.5013 7.54102 15.8827 6.1997 14.6455 5.11956C13.4084 4.03942 11.9212 3.49935 10.184 3.49935C8.30693 3.49935 6.72387 4.13129 5.43484 5.39518C4.14582 6.65907 3.5013 8.19379 3.5013 9.99935C3.5013 11.8049 4.13325 13.3396 5.39714 14.6035C6.66102 15.8674 8.1904 16.4993 9.98526 16.4993Z" fill={color} />
  </svg>
);

export const IconEye: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M10.0024 12.9808C10.9468 12.9808 11.7488 12.6503 12.4085 11.9894C13.0682 11.3284 13.3981 10.5258 13.3981 9.58146C13.3981 8.63715 13.0676 7.83514 12.4066 7.17542C11.7456 6.51569 10.943 6.18583 9.9987 6.18583C9.05439 6.18583 8.25238 6.51632 7.59266 7.17729C6.93293 7.83826 6.60307 8.6409 6.60307 9.58521C6.60307 10.5295 6.93356 11.3315 7.59453 11.9913C8.2555 12.651 9.05814 12.9808 10.0024 12.9808ZM10.0006 11.8333C9.37557 11.8333 8.84432 11.6146 8.40682 11.1771C7.96932 10.7396 7.75057 10.2083 7.75057 9.58333C7.75057 8.95833 7.96932 8.42708 8.40682 7.98958C8.84432 7.55208 9.37557 7.33333 10.0006 7.33333C10.6256 7.33333 11.1568 7.55208 11.5943 7.98958C12.0318 8.42708 12.2506 8.95833 12.2506 9.58333C12.2506 10.2083 12.0318 10.7396 11.5943 11.1771C11.1568 11.6146 10.6256 11.8333 10.0006 11.8333ZM10.0006 15.4167C8.24627 15.4167 6.64182 14.9487 5.18724 14.0127C3.73266 13.0769 2.57161 11.8456 1.70411 10.319C1.63467 10.1992 1.58391 10.0786 1.55182 9.95708C1.51988 9.83556 1.50391 9.71083 1.50391 9.58292C1.50391 9.455 1.51988 9.33042 1.55182 9.20917C1.58391 9.08792 1.63467 8.96743 1.70411 8.84771C2.57161 7.32104 3.73266 6.08979 5.18724 5.15396C6.64182 4.21799 8.24627 3.75 10.0006 3.75C11.7549 3.75 13.3593 4.21799 14.8139 5.15396C16.2685 6.08979 17.4295 7.32104 18.297 8.84771C18.3665 8.96743 18.4172 9.08806 18.4493 9.20958C18.4813 9.33111 18.4972 9.45583 18.4972 9.58375C18.4972 9.71167 18.4813 9.83625 18.4493 9.9575C18.4172 10.0788 18.3665 10.1992 18.297 10.319C17.4295 11.8456 16.2685 13.0769 14.8139 14.0127C13.3593 14.9487 11.7549 15.4167 10.0006 15.4167ZM10.0006 14.1667C11.57 14.1667 13.011 13.7535 14.3235 12.9271C15.636 12.1007 16.6395 10.9861 17.3339 9.58333C16.6395 8.18056 15.636 7.06597 14.3235 6.23958C13.011 5.41319 11.57 5 10.0006 5C8.43113 5 6.99016 5.41319 5.67766 6.23958C4.36516 7.06597 3.36168 8.18056 2.66724 9.58333C3.36168 10.9861 4.36516 12.1007 5.67766 12.9271C6.99016 13.7535 8.43113 14.1667 10.0006 14.1667Z" fill={color} />
  </svg>
);

export const IconSend: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M22 2L11 13" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 2l-7 20-4-9-9-4 20-7z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconAttach: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconCode: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <polyline points="16,18 22,12 16,6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="8,6 2,12 8,18" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconMore: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="1.5" fill={color} />
    <circle cx="6" cy="12" r="1.5" fill={color} />
    <circle cx="18" cy="12" r="1.5" fill={color} />
  </svg>
);

export const IconAtSign: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="4" stroke={color} strokeWidth="1.5" />
    <path d="M16 8v5a3 3 0 006 0v-1a10 10 0 10-3.92 7.94" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconSkipLogic: React.FC<IconProps> = ({ size = 20, color = '#1976d2', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="5" cy="17" r="1.6" fill={color} />
    <path d="M5 16C5 12 8 9 12 9h5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 6l3 3-3 3" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconDisplayLogic: React.FC<IconProps> = ({ size = 20, color = '#1976d2', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M5 19V10c0-1.66 1.34-3 3-3h9" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 4l3 3-3 3" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconReorder: React.FC<IconProps> = ({ size = 20, color = '#1976d2', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className}>
    <path d="M14 5h8v2h-8zM14 10.5h8v2h-8zM14 16h8v2h-8zM2 11.5C2 15.08 4.92 18 8.5 18H9v2l3-3-3-3v2h-.5C6.02 16 4 13.98 4 11.5S6.02 7 8.5 7H12V5H8.5C4.92 5 2 7.92 2 11.5z" />
  </svg>
);

export const IconCloud: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

export const IconBirdeye: React.FC<IconProps> = ({ size = 28, className }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <circle cx="16" cy="16" r="16" fill="#1a73e8" />
    <path d="M8 16c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    <circle cx="16" cy="16" r="3" fill="#fff" />
  </svg>
);

export const IconAnalytics: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M18 20V10M12 20V4M6 20v-6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconBulb: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M9 21h6M12 3a6 6 0 014 10.47V17a1 1 0 01-1 1H9a1 1 0 01-1-1v-3.53A6 6 0 0112 3z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconGlobe: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
    <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke={color} strokeWidth="1.5" />
  </svg>
);

export const IconCodeConnect: React.FC<IconProps> = ({ size = 16, color = '#1a73e8', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconCheck: React.FC<IconProps> = ({ size = 16, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconLocation: React.FC<IconProps> = ({ size = 16, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="10" r="3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconChevronDown: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 9l6 6 6-6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconChevronUp: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M18 15l-6-6-6 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconMoreVert: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="5" r="1.5" fill={color} />
    <circle cx="12" cy="12" r="1.5" fill={color} />
    <circle cx="12" cy="19" r="1.5" fill={color} />
  </svg>
);

export const IconExternalLink: React.FC<IconProps> = ({ size = 16, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="15,3 21,3 21,9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="10" y1="14" x2="21" y2="3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconSearch: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="11" cy="11" r="7" stroke={color} strokeWidth="1.5" />
    <path d="M21 21l-4.35-4.35" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconPlusCircle: React.FC<IconProps> = ({ size = 20, color = '#1976d2', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" fill={color} />
    <path d="M12 7v10M7 12h10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const IconFilter: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconLink: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconCopy: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="9" y="9" width="13" height="13" rx="2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconAlertCircle: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="8" x2="12" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="12" y1="16" x2="12.01" y2="16" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const IconBarChart: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <line x1="18" y1="20" x2="18" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="12" y1="20" x2="12" y2="4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="6" y1="20" x2="6" y2="14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="2" y1="20" x2="22" y2="20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IconBuilder: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M15.5013 8.98164V4.25581C15.5013 4.18095 15.4773 4.11949 15.4292 4.07143C15.3812 4.02338 15.3197 3.99935 15.2448 3.99935H4.75776C4.6829 3.99935 4.62144 4.02338 4.57339 4.07143C4.52533 4.11949 4.5013 4.18095 4.5013 4.25581V8.98164H15.5013ZM4.75339 16.0827C4.38366 16.0827 4.06866 15.9515 3.80839 15.6891C3.54811 15.4268 3.41797 15.1114 3.41797 14.7429V4.25581C3.41797 3.88734 3.54915 3.57192 3.81151 3.30956C4.07387 3.0472 4.38929 2.91602 4.75776 2.91602H15.2448C15.6133 2.91602 15.9287 3.0472 16.1911 3.30956C16.4535 3.57192 16.5846 3.88734 16.5846 4.25581V14.7429C16.5846 15.1114 16.4538 15.4268 16.1921 15.6891C15.9305 15.9515 15.616 16.0827 15.2486 16.0827H14.5003C14.3473 16.0827 14.218 16.0312 14.1121 15.9281C14.0062 15.825 13.9532 15.6974 13.9532 15.5452C13.9532 15.3928 14.0051 15.2638 14.109 15.1581C14.2128 15.0523 14.3414 14.9993 14.4948 14.9993H15.2448C15.3197 14.9993 15.3812 14.9753 15.4292 14.9273C15.4773 14.8792 15.5013 14.8178 15.5013 14.7429V10.065H4.5013V14.7429C4.5013 14.8178 4.52533 14.8792 4.57339 14.9273C4.62144 14.9753 4.6829 14.9993 4.75776 14.9993H5.50339C5.65561 14.9993 5.78464 15.0509 5.89047 15.1539C5.99644 15.257 6.04943 15.3846 6.04943 15.5368C6.04943 15.6892 5.99727 15.8182 5.89297 15.9239C5.7888 16.0298 5.65964 16.0827 5.50547 16.0827H4.75339ZM9.61839 17.6768C9.51255 17.5731 9.45964 17.4445 9.45964 17.291V16.0827H8.2513C8.09783 16.0827 7.96922 16.0312 7.86547 15.9281C7.76158 15.825 7.70964 15.6974 7.70964 15.5452C7.70964 15.3928 7.76158 15.2638 7.86547 15.1581C7.96922 15.0523 8.09783 14.9993 8.2513 14.9993H9.45964V13.791C9.45964 13.6375 9.51116 13.5089 9.61422 13.405C9.71727 13.3012 9.84491 13.2493 9.99714 13.2493C10.1495 13.2493 10.2785 13.3012 10.3842 13.405C10.4901 13.5089 10.543 13.6375 10.543 13.791V14.9993H11.7513C11.9048 14.9993 12.0334 15.0509 12.1371 15.1539C12.241 15.257 12.293 15.3846 12.293 15.5368C12.293 15.6892 12.241 15.8182 12.1371 15.9239C12.0334 16.0298 11.9048 16.0827 11.7513 16.0827H10.543V17.291C10.543 17.4445 10.4914 17.5731 10.3884 17.6768C10.2853 17.7807 10.1577 17.8327 10.0055 17.8327C9.85311 17.8327 9.72408 17.7807 9.61839 17.6768Z" fill={color} />
  </svg>
);
