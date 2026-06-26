/**
 * Chip — Aero Design System "Chips - Informative" (Figma node 6678:4519)
 *
 * Three visual types, each with a defined set of semantic colour variants.
 * Use chips to communicate status, category, or a label at a glance.
 *
 * Type    │ Prominence │ Colours available
 * ─────── │ ────────── │ ────────────────────────────────
 * filled  │ High       │ green · yellow · red
 * outline │ Medium     │ green · yellow · red · ai
 * tonal   │ Low        │ grey · yellow · red
 */

import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ChipType = 'filled' | 'outline' | 'tonal';

export type ChipColor =
  | 'green'    // positive / new feature / BETA
  | 'yellow'   // neutral / warning / spam-likely
  | 'red'      // negative / alert / spam
  | 'grey'     // default / most common (tonal only)
  | 'ai';      // AI-exclusive label (outline only, purple)

export interface ChipProps {
  /** Visual treatment — controls fill, border, and text colour strategy. */
  type: ChipType;
  /**
   * Semantic colour variant.
   * - filled  accepts: green | yellow | red
   * - outline accepts: green | yellow | red | ai
   * - tonal   accepts: grey | yellow | red
   */
  color?: ChipColor;
  /** Chip label text. */
  children: React.ReactNode;
  /** Optional leading icon (16 × 16). Only rendered for the tonal type. */
  iconLeft?: React.ReactNode;
  className?: string;
}

// ─── Style maps (all values reference Aero tokens from tokens.css) ────────────

const FILLED_BG: Record<string, string> = {
  green:  'var(--token-chip-filled-green-bg,  #4cae3d)',
  yellow: 'var(--token-chip-filled-yellow-bg, #fbc123)',
  red:    'var(--token-chip-filled-red-bg,    #de1b0c)',
};

const OUTLINE_COLOR: Record<string, string> = {
  green:  'var(--token-chip-outline-green,  #4cae3d)',
  yellow: 'var(--token-chip-outline-yellow, #e6aa04)',
  red:    'var(--token-chip-outline-red,    #de1b0c)',
  ai:     'var(--token-chip-outline-ai,     #6834b7)',
};

const TONAL_BG: Record<string, string> = {
  grey:   'var(--token-chip-tonal-grey-bg,   #eaeaea)',
  yellow: 'var(--token-chip-tonal-yellow-bg, #fef3d6)',
  red:    'var(--token-chip-tonal-red-bg,    #fef6f5)',
};

const TONAL_TEXT: Record<string, string> = {
  grey:   'var(--token-chip-tonal-grey-text,   #555555)',
  yellow: 'var(--token-chip-tonal-yellow-text, #c69204)',
  red:    'var(--token-chip-tonal-red-text,     #de1b0c)',
};

// ─── Base class (shared across all types) ─────────────────────────────────────
// px-2 = 8px  py-1 = 4px  rounded = 4px  text-xs = 12px  leading-[18px]
const BASE =
  'inline-flex items-center gap-1 px-2 py-1 rounded text-xs leading-[18px] tracking-[-0.24px] whitespace-nowrap font-normal select-none';

// ─── Component ────────────────────────────────────────────────────────────────

export function Chip({
  type,
  color,
  children,
  iconLeft,
  className = '',
}: ChipProps) {
  // ── Filled ─────────────────────────────────────────────────────────────────
  if (type === 'filled') {
    const resolvedColor = color ?? 'green';
    const bg = FILLED_BG[resolvedColor] ?? FILLED_BG.green;
    return (
      <span
        className={`${BASE} text-white ${className}`}
        style={{ backgroundColor: bg }}
      >
        {children}
      </span>
    );
  }

  // ── Outline ────────────────────────────────────────────────────────────────
  if (type === 'outline') {
    const resolvedColor = color ?? 'green';
    const accent = OUTLINE_COLOR[resolvedColor] ?? OUTLINE_COLOR.green;
    return (
      <span
        className={`${BASE} border border-solid bg-transparent ${className}`}
        style={{ borderColor: accent, color: accent }}
      >
        {children}
      </span>
    );
  }

  // ── Tonal ──────────────────────────────────────────────────────────────────
  const resolvedColor = color ?? 'grey';
  const bg   = TONAL_BG[resolvedColor]   ?? TONAL_BG.grey;
  const text = TONAL_TEXT[resolvedColor] ?? TONAL_TEXT.grey;
  return (
    <span
      className={`${BASE} ${className}`}
      style={{ backgroundColor: bg, color: text }}
    >
      {iconLeft && (
        <span className="inline-flex items-center justify-center shrink-0 size-4">
          {iconLeft}
        </span>
      )}
      {children}
    </span>
  );
}

export default Chip;
