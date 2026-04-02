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
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
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

export const IconEye: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5" />
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

export const IconSkipLogic: React.FC<IconProps> = ({ size = 16, color = '#1a73e8', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M13 17l5-5-5-5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 17l5-5-5-5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconDisplayLogic: React.FC<IconProps> = ({ size = 16, color = '#1a73e8', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 4h16v4H4zM4 12h10v4H4zM4 20h6v4H4z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconReorder: React.FC<IconProps> = ({ size = 16, color = '#1a73e8', className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M7 16l5 5 5-5M7 8l5-5 5 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
