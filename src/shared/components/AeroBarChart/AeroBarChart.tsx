// ============================================================
// AeroBarChart — SVG bar-chart primitive built on Aero Design
// System tokens. Two orientations:
//   • vertical   (Figma frame 12549:25717) — bars rise from a
//                baseline, value labels float above the bar.
//   • horizontal (Figma frame 12549:35763) — bars extend right
//                from a fixed-width category gutter, label sits
//                immediately after the bar.
//
// Both variants share the same data shape so a caller can swap
// orientation without re-shaping their data. Stacked horizontal
// bars are supported via `series` (used by the open-vs-resolved
// reports). The component is intentionally narrow in scope — no
// tooltips, no animation — it just renders the static chart in
// the same flat style the screenshots show.
// ============================================================
import React, { useMemo } from 'react';
import styles from './AeroBarChart.module.scss';

export interface AeroBarDatum {
  /** Stable identifier (used as the React key). */
  key: string;
  /** Category label shown under (vertical) or beside (horizontal) the bar. */
  label: string;
  /** Single-series value. Ignored when `parts` is provided. */
  value?: number;
  /** Multi-segment value for a stacked horizontal bar. */
  parts?: Array<{ key: string; value: number; color?: string }>;
  /** Override the bar color for this datum (single-series only). */
  color?: string;
}

export interface AeroBarSeries {
  /** Stable identifier — used as the React key and parts key. */
  key: string;
  /** Legend label. */
  label: string;
  /** Series color. */
  color: string;
}

export type AeroBarOrientation = 'vertical' | 'horizontal';

export interface AeroBarChartProps {
  data: AeroBarDatum[];
  orientation?: AeroBarOrientation;
  /** Optional series defs — only used for the legend on stacked charts. */
  series?: AeroBarSeries[];
  /** Fixed chart height (px). Vertical charts use this verbatim, horizontal charts derive from row count. */
  height?: number;
  /** Default bar color when no per-datum / per-series color is supplied. */
  defaultColor?: string;
  /** Number formatter for value labels. Defaults to compact (1.2K). */
  formatValue?: (n: number) => string;
  /** Accessible label for the chart. */
  ariaLabel?: string;
}

// Compact, Figma-aligned formatter: 1.2K / 198.56 / 0.
const defaultFormat = (n: number): string => {
  if (n === 0) return '0';
  if (Math.abs(n) >= 1000) {
    const k = n / 1000;
    return `${k.toFixed(k >= 10 ? 0 : 1)}K`;
  }
  // Two decimals when the value has a fractional part, otherwise integer.
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
};

// Aero spec palette — kept here so callers can reference `AERO_CHART_COLORS`
// when they want category-specific tints without re-importing tokens.
export const AERO_CHART_COLORS = {
  yellow:  '#F2C94C',
  blue:    '#2F80ED',
  purple:  '#7C66E2',
  orange:  '#F2784B',
  green:   '#6FCF97',
  gray:    '#BDBDBD',
  red:     '#EB5757',
} as const;

// Measurements derived from the Aero Design System chart frames
// (vertical 12549:25717, horizontal 12549:35763).
const VERTICAL_PLOT_TOP    = 28;   // headroom for value labels
const VERTICAL_PLOT_BOTTOM = 48;   // x-axis labels
const VERTICAL_PAD_X       = 16;
const VERTICAL_BAR_W       = 24;   // Figma bar thickness
// Column pitch must accommodate the category label without overlap.
// 96 px is the smallest pitch that fits the longest realistic single-
// line label (e.g. "Boulevard Bur…", "Vandana Aga…") without
// neighbours touching.
const VERTICAL_COL_MIN     = 96;

const HORIZONTAL_GUTTER    = 220;  // wider gutter for full location/user names
const HORIZONTAL_VALUE_PAD = 56;   // tail room for value label
const HORIZONTAL_ROW_H     = 32;   // per Aero horizontal-bar row
const HORIZONTAL_BAR_H     = 14;   // bar thickness

const AeroBarChart: React.FC<AeroBarChartProps> = ({
  data,
  orientation = 'vertical',
  series,
  height = 240,
  defaultColor = AERO_CHART_COLORS.yellow,
  formatValue = defaultFormat,
  ariaLabel,
}) => {
  // Sum each datum to a single magnitude so the scale handles both
  // single-bar and stacked-bar inputs uniformly.
  const totals = useMemo(
    () => data.map(d => (d.parts ? d.parts.reduce((s, p) => s + p.value, 0) : d.value ?? 0)),
    [data],
  );
  const maxValue = Math.max(1, ...totals);

  if (orientation === 'vertical') {
    // Bars are a fixed 24 px wide per Aero spec; the column width
    // expands with category count so dense data sets remain
    // readable. The whole canvas is rendered at "natural" px size
    // (no aspect-ratio scaling), letting the parent's overflow-x
    // handle long category lists without squishing bar widths.
    const colW   = Math.max(VERTICAL_COL_MIN, VERTICAL_BAR_W + 18);
    const width  = VERTICAL_PAD_X * 2 + data.length * colW;
    const plotH  = height - VERTICAL_PLOT_TOP - VERTICAL_PLOT_BOTTOM;
    const barW   = VERTICAL_BAR_W;

    return (
      <div className={styles.chartWrap} role="img" aria-label={ariaLabel}>
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className={styles.svg}
          preserveAspectRatio="xMinYMid meet"
          style={{ width: `${width}px`, height: `${height}px`, minWidth: `${width}px` }}
        >
          {data.map((d, i) => {
            const total = totals[i];
            const barH  = total === 0 ? 0 : Math.max(2, (total / maxValue) * plotH);
            const cx    = VERTICAL_PAD_X + colW * i + colW / 2;
            const x     = cx - barW / 2;
            const yTop  = height - VERTICAL_PLOT_BOTTOM - barH;
            const color = d.color ?? defaultColor;
            return (
              <g key={d.key}>
                {/* Value label — sits 6 px above the bar (or above the baseline when value is 0) */}
                <text
                  x={cx}
                  y={total === 0 ? height - VERTICAL_PLOT_BOTTOM - 6 : yTop - 6}
                  className={styles.valueLabel}
                  textAnchor="middle"
                >
                  {formatValue(total)}
                </text>

                {d.parts ? (
                  // Stacked vertical (rare — included for parity)
                  (() => {
                    let running = height - VERTICAL_PLOT_BOTTOM;
                    return d.parts.map(p => {
                      const seg = total === 0 ? 0 : (p.value / maxValue) * plotH;
                      running -= seg;
                      return (
                        <rect
                          key={p.key}
                          x={x}
                          y={running}
                          width={barW}
                          height={seg}
                          fill={p.color ?? color}
                          rx={2}
                        />
                      );
                    });
                  })()
                ) : (
                  <rect x={x} y={yTop} width={barW} height={barH} fill={color} rx={2} />
                )}

                {/* Category label */}
                <text
                  x={cx}
                  y={height - VERTICAL_PLOT_BOTTOM + 18}
                  className={styles.categoryLabel}
                  textAnchor="middle"
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>

        {series && series.length > 0 && (
          <div className={styles.legend}>
            {series.map(s => (
              <span key={s.key} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: s.color }} />
                {s.label}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Horizontal ──────────────────────────────────────────────────
  const rows   = data.length;
  const innerH = rows * HORIZONTAL_ROW_H + 16;
  // 1080 px matches the natural Aero horizontal-chart width.
  const width  = 1080;
  const plotW  = width - HORIZONTAL_GUTTER - HORIZONTAL_VALUE_PAD;

  return (
    <div className={styles.chartWrap} role="img" aria-label={ariaLabel}>
      <svg
        width={width}
        height={innerH}
        viewBox={`0 0 ${width} ${innerH}`}
        className={styles.svg}
        preserveAspectRatio="xMinYMid meet"
        style={{ width: `${width}px`, height: `${innerH}px`, minWidth: `${width}px` }}
      >
        {data.map((d, i) => {
          const total = totals[i];
          const barW  = total === 0 ? 0 : Math.max(2, (total / maxValue) * plotW);
          const y     = i * HORIZONTAL_ROW_H + (HORIZONTAL_ROW_H - HORIZONTAL_BAR_H) / 2;
          const color = d.color ?? defaultColor;
          return (
            <g key={d.key}>
              {/* Category label (truncated by max width via CSS) */}
              <text
                x={HORIZONTAL_GUTTER - 8}
                y={y + HORIZONTAL_BAR_H / 2 + 4}
                className={styles.categoryLabel}
                textAnchor="end"
              >
                {d.label}
              </text>

              {d.parts ? (
                (() => {
                  let runX = HORIZONTAL_GUTTER;
                  return d.parts.map(p => {
                    const seg = total === 0 ? 0 : (p.value / maxValue) * plotW;
                    const node = (
                      <rect
                        key={p.key}
                        x={runX}
                        y={y}
                        width={seg}
                        height={HORIZONTAL_BAR_H}
                        fill={p.color ?? color}
                        rx={2}
                      />
                    );
                    runX += seg;
                    return node;
                  });
                })()
              ) : (
                <rect
                  x={HORIZONTAL_GUTTER}
                  y={y}
                  width={barW}
                  height={HORIZONTAL_BAR_H}
                  fill={color}
                  rx={2}
                />
              )}

              {/* Value label */}
              <text
                x={HORIZONTAL_GUTTER + barW + 6}
                y={y + HORIZONTAL_BAR_H / 2 + 4}
                className={styles.valueLabel}
              >
                {formatValue(total)}
              </text>
            </g>
          );
        })}
      </svg>

      {series && series.length > 0 && (
        <div className={styles.legend}>
          {series.map(s => (
            <span key={s.key} className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default AeroBarChart;
