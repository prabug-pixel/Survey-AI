// ============================================================
// EditSettings illustrations — Aero "Settings" landing graphics.
// ------------------------------------------------------------
// One SVG per tile on the Edit settings landing page. They match
// the Aero illustration style used in the reference screenshot:
// muted gray outlines with a brand-blue accent for the focal
// element of each illustration. Kept scoped to the EditSettings
// surface — the rest of the product still pulls from Icons.tsx.
// ============================================================
import React from 'react';

interface IllustrationProps {
  size?: number;
  className?: string;
}

const STROKE = '#bdbdbd';
const ACCENT = '#1976d2';

export const SurveyAppearanceIllustration: React.FC<IllustrationProps> = ({ size = 100, className }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
    {/* Browser window frame */}
    <rect x="14" y="22" width="72" height="56" rx="3" stroke={STROKE} strokeWidth="2" fill="#ffffff" />
    {/* Blue title bar */}
    <rect x="14" y="22" width="72" height="12" rx="3" fill={ACCENT} />
    <rect x="14" y="31" width="72" height="3" fill={ACCENT} />
    {/* Window dots */}
    <circle cx="20" cy="28" r="1.5" fill="#ffffff" />
    <circle cx="26" cy="28" r="1.5" fill="#ffffff" />
    <circle cx="32" cy="28" r="1.5" fill="#ffffff" />
    {/* Content lines */}
    <rect x="22" y="44" width="44" height="3" rx="1.5" fill={STROKE} />
    <rect x="22" y="54" width="36" height="3" rx="1.5" fill={STROKE} />
    <rect x="22" y="64" width="28" height="3" rx="1.5" fill={STROKE} />
  </svg>
);

export const EmailNotificationsIllustration: React.FC<IllustrationProps> = ({ size = 100, className }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
    {/* Bell body */}
    <path
      d="M50 20c-9 0-16 7-16 16v10l-6 10v4h44v-4l-6-10V36c0-9-7-16-16-16z"
      stroke={STROKE}
      strokeWidth="2.5"
      strokeLinejoin="round"
      fill="#ffffff"
    />
    {/* Bell clapper */}
    <path
      d="M44 60h12c0 3.3-2.7 6-6 6s-6-2.7-6-6z"
      stroke={STROKE}
      strokeWidth="2.5"
      strokeLinejoin="round"
      fill="#ffffff"
    />
    {/* Top knob */}
    <circle cx="50" cy="18" r="2.5" fill={STROKE} />
    {/* Notification dot */}
    <circle cx="68" cy="30" r="6" fill={ACCENT} />
  </svg>
);

export const SurveyAccessIllustration: React.FC<IllustrationProps> = ({ size = 100, className }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
    {/* Document outline */}
    <path
      d="M28 18h32l12 12v44a4 4 0 01-4 4H28a4 4 0 01-4-4V22a4 4 0 014-4z"
      stroke={STROKE}
      strokeWidth="2.5"
      strokeLinejoin="round"
      fill="#ffffff"
    />
    <path d="M60 18v12h12" stroke={STROKE} strokeWidth="2.5" strokeLinejoin="round" />
    {/* Document content lines */}
    <rect x="32" y="40" width="28" height="2.5" rx="1.25" fill={STROKE} />
    <rect x="32" y="48" width="24" height="2.5" rx="1.25" fill={STROKE} />
    <rect x="32" y="56" width="20" height="2.5" rx="1.25" fill={STROKE} />
    {/* Padlock */}
    <rect x="38" y="68" width="24" height="18" rx="2" fill={ACCENT} />
    <path
      d="M44 68v-4a6 6 0 0112 0v4"
      stroke={ACCENT}
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="50" cy="77" r="2" fill="#ffffff" />
  </svg>
);

export const AutoReplyIllustration: React.FC<IllustrationProps> = ({ size = 100, className }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
    {/* Envelope back */}
    <rect x="18" y="34" width="56" height="40" rx="3" stroke={STROKE} strokeWidth="2.5" fill="#ffffff" />
    {/* Envelope flap */}
    <path d="M18 38l28 20 28-20" stroke={STROKE} strokeWidth="2.5" strokeLinejoin="round" fill="none" />
    {/* Paper plane */}
    <path
      d="M58 38l28-12-10 30-8-10-10 5 10-13z"
      fill={ACCENT}
    />
    <path d="M68 51l8-15" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const ExpirySettingsIllustration: React.FC<IllustrationProps> = ({ size = 100, className }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
    {/* Clock face */}
    <circle cx="50" cy="52" r="28" stroke={STROKE} strokeWidth="2.5" fill="#ffffff" />
    {/* Hour ticks */}
    <line x1="50" y1="26" x2="50" y2="30" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
    <line x1="76" y1="52" x2="72" y2="52" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
    <line x1="50" y1="78" x2="50" y2="74" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
    <line x1="24" y1="52" x2="28" y2="52" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
    {/* Hands */}
    <line x1="50" y1="52" x2="50" y2="36" stroke={ACCENT} strokeWidth="3" strokeLinecap="round" />
    <line x1="50" y1="52" x2="64" y2="52" stroke={ACCENT} strokeWidth="3" strokeLinecap="round" />
    {/* Center dot */}
    <circle cx="50" cy="52" r="2.5" fill={ACCENT} />
  </svg>
);
