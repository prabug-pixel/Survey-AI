/**
 * Chip — Aero Design System "Chips - Informative"
 * Figma: https://www.figma.com/design/xecPAre4cKkeXEdvTig1oI/Aero-Design-System?node-id=6678-4519
 *
 * Three visual types × multiple semantic colour variants.
 * All colours reference Aero token variables defined in src/themes/v1/tokens.css.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Chip } from '../components/shared/Chip/Chip';

const meta: Meta<typeof Chip> = {
  title: 'Design System/Chip',
  component: Chip,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['filled', 'outline', 'tonal'],
      description: 'Visual treatment — controls prominence level.',
    },
    color: {
      control: 'select',
      options: ['green', 'yellow', 'red', 'grey', 'ai'],
      description: 'Semantic colour variant (valid options differ per type).',
    },
    children: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

// ─── Single chip (interactive knobs) ─────────────────────────────────────────

export const Default: Story = {
  args: {
    type: 'tonal',
    color: 'grey',
    children: 'Label',
  },
};

// ─── Filled ───────────────────────────────────────────────────────────────────
// High prominence. Use when a strong colour fill is needed.

export const FilledVariants: Story = {
  name: 'Filled — all colours',
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-widest">Filled</p>
        <p className="text-xs text-muted-foreground mb-3">
          Use filled chips wherever <strong>high prominence</strong> is needed.
        </p>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex flex-col items-center gap-1">
            <Chip type="filled" color="green">Label</Chip>
            <span className="text-[10px] text-muted-foreground">green</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Chip type="filled" color="yellow">Label</Chip>
            <span className="text-[10px] text-muted-foreground">yellow</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Chip type="filled" color="red">Label</Chip>
            <span className="text-[10px] text-muted-foreground">red</span>
          </div>
        </div>
      </div>
      <div className="text-xs text-muted-foreground space-y-1 border-l-2 border-border pl-3">
        <p><strong>Green</strong> — positive cases, new feature, BETA (high prominence)</p>
        <p><strong>Yellow</strong> — neutral case, reports (high prominence)</p>
        <p><strong>Red</strong> — negative, alert (high prominence)</p>
      </div>
    </div>
  ),
};

// ─── Outline ──────────────────────────────────────────────────────────────────
// Medium prominence. Border + coloured text, transparent background.

export const OutlineVariants: Story = {
  name: 'Outline — all colours',
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-widest">Outline</p>
        <p className="text-xs text-muted-foreground mb-3">
          Use outline chips wherever <strong>medium prominence</strong> is needed.
        </p>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex flex-col items-center gap-1">
            <Chip type="outline" color="green">Label</Chip>
            <span className="text-[10px] text-muted-foreground">green</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Chip type="outline" color="yellow">Label</Chip>
            <span className="text-[10px] text-muted-foreground">yellow</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Chip type="outline" color="red">Label</Chip>
            <span className="text-[10px] text-muted-foreground">red</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Chip type="outline" color="ai">BETA</Chip>
            <span className="text-[10px] text-muted-foreground">ai (purple)</span>
          </div>
        </div>
      </div>
      <div className="text-xs text-muted-foreground space-y-1 border-l-2 border-border pl-3">
        <p><strong>Green</strong> — positive cases, new feature, BETA (less prominence)</p>
        <p><strong>Yellow</strong> — neutral case, reports (less prominence)</p>
        <p><strong>Red</strong> — negative, alert (less prominence)</p>
        <p><strong>AI / purple</strong> — use <em>only</em> on AI features (BETA, AI labels)</p>
      </div>
    </div>
  ),
};

// ─── Tonal ────────────────────────────────────────────────────────────────────
// Low prominence. Soft background, semantically tinted text.

export const TonalVariants: Story = {
  name: 'Tonal — all colours',
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-widest">Tonal</p>
        <p className="text-xs text-muted-foreground mb-3">
          Use tonal chips wherever <strong>low prominence</strong> is needed.
        </p>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex flex-col items-center gap-1">
            <Chip type="tonal" color="grey">Label</Chip>
            <span className="text-[10px] text-muted-foreground">grey (default)</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Chip type="tonal" color="yellow">Label</Chip>
            <span className="text-[10px] text-muted-foreground">yellow</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Chip type="tonal" color="red">Label</Chip>
            <span className="text-[10px] text-muted-foreground">red</span>
          </div>
        </div>
      </div>
      <div className="text-xs text-muted-foreground space-y-1 border-l-2 border-border pl-3">
        <p><strong>Grey</strong> — default; use in most cases</p>
        <p><strong>Yellow</strong> — reviews "likely spam"</p>
        <p><strong>Red</strong> — reviews confirmed spam</p>
      </div>
    </div>
  ),
};

// ─── Tonal with icon ──────────────────────────────────────────────────────────

export const TonalWithIcon: Story = {
  name: 'Tonal — with leading icon',
  render: () => (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-widest">Tonal + icon-left</p>
      <div className="flex flex-wrap gap-3 items-center">
        <Chip
          type="tonal"
          color="grey"
          iconLeft={
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 1 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
            </svg>
          }
        >
          Verified
        </Chip>
        <Chip
          type="tonal"
          color="yellow"
          iconLeft={
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 1 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
            </svg>
          }
        >
          Likely Spam
        </Chip>
        <Chip
          type="tonal"
          color="red"
          iconLeft={
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 1 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
            </svg>
          }
        >
          Spam
        </Chip>
      </div>
    </div>
  ),
};

// ─── All variants overview ────────────────────────────────────────────────────

export const AllVariants: Story = {
  name: 'All variants — overview',
  render: () => (
    <div className="flex flex-col gap-8 max-w-xl">

      {/* Filled */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
          Filled — High prominence
        </p>
        <div className="flex flex-wrap gap-2">
          <Chip type="filled" color="green">New</Chip>
          <Chip type="filled" color="green">BETA</Chip>
          <Chip type="filled" color="yellow">64.3%</Chip>
          <Chip type="filled" color="red">Alert</Chip>
        </div>
      </div>

      {/* Outline */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
          Outline — Medium prominence
        </p>
        <div className="flex flex-wrap gap-2">
          <Chip type="outline" color="green">New</Chip>
          <Chip type="outline" color="green">BETA</Chip>
          <Chip type="outline" color="yellow">Pending</Chip>
          <Chip type="outline" color="red">Declined</Chip>
          <Chip type="outline" color="ai">BETA</Chip>
          <Chip type="outline" color="ai">AI</Chip>
        </div>
      </div>

      {/* Tonal */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
          Tonal — Low prominence
        </p>
        <div className="flex flex-wrap gap-2">
          <Chip type="tonal" color="grey">Default</Chip>
          <Chip type="tonal" color="grey">Label</Chip>
          <Chip type="tonal" color="yellow">Likely Spam</Chip>
          <Chip type="tonal" color="red">Spam</Chip>
        </div>
      </div>

    </div>
  ),
};

// ─── Real-world usage example ─────────────────────────────────────────────────

export const UsageExample: Story = {
  name: 'Usage — in context',
  render: () => (
    <div className="flex flex-col gap-4 max-w-sm">
      <p className="text-xs text-muted-foreground uppercase tracking-widest">
        Review card example
      </p>
      <div className="border border-border rounded-lg p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium" style={{ color: 'var(--token-text-primary)' }}>
            John D.
          </span>
          <div className="flex gap-1.5">
            <Chip type="filled" color="green">5★</Chip>
            <Chip type="tonal" color="grey">Google</Chip>
          </div>
        </div>
        <p className="text-xs" style={{ color: 'var(--token-text-secondary)' }}>
          Great service, highly recommended!
        </p>
      </div>
      <div className="border border-border rounded-lg p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium" style={{ color: 'var(--token-text-primary)' }}>
            Anonymous
          </span>
          <div className="flex gap-1.5">
            <Chip type="filled" color="red">1★</Chip>
            <Chip type="tonal" color="red">Spam</Chip>
          </div>
        </div>
        <p className="text-xs" style={{ color: 'var(--token-text-secondary)' }}>
          Buy cheap watches now!!!
        </p>
      </div>
      <div className="border border-border rounded-lg p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium" style={{ color: 'var(--token-text-primary)' }}>
            Sarah M.
          </span>
          <div className="flex gap-1.5">
            <Chip type="outline" color="ai">AI Summary</Chip>
            <Chip type="tonal" color="grey">Yelp</Chip>
          </div>
        </div>
        <p className="text-xs" style={{ color: 'var(--token-text-secondary)' }}>
          Positive sentiment detected in review.
        </p>
      </div>
    </div>
  ),
};
