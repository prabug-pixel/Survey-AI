// Storybook reference for the Aero Design System "Text area" component
// (Figma node 2457:21023).
//
// Every story below renders the elemental atom directly — there is no
// custom wrapper, no recreated textarea — so the file doubles as a usage
// reference for the TextArea atom from `@birdeye/elemental`.
//
// Figma states covered (one story per state, plus the documented variants):
//   Default · Hover · Focussed · Active · Disabled · Read only · Error ·
//   With character count · No floating label · No border · Auto-size

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import TextArea from '@birdeye/elemental/core/atoms/TextArea';

// ── Controlled wrapper ─────────────────────────────────────────
type TextAreaProps = React.ComponentProps<typeof TextArea>;
type ControlledProps = TextAreaProps & { initialValue?: string };

const Controlled: React.FC<ControlledProps> = ({ initialValue = '', ...props }) => {
  const [value, setValue] = useState<string>(initialValue);
  return (
    <div style={{ width: 420 }}>
      <TextArea
        {...props}
        value={value}
        onChange={(_event: unknown, value: string) => setValue(String(value ?? ''))}
      />
    </div>
  );
};

const meta: Meta<typeof TextArea> = {
  title: 'Aero Design System/Text area',
  component: TextArea,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          'Aero "Text area" — the canonical multi-line input across the Birdeye platform, used for long-form content (messages, descriptions, comments).',
          '',
          'Figma: https://www.figma.com/design/xecPAre4cKkeXEdvTig1oI/Aero-Design-System?node-id=2457-21023',
          '',
          'Imported from `@birdeye/elemental/core/atoms/TextArea`. Hover and Focussed states are CSS pseudo-states — interact with the textarea below to see them.',
        ].join('\n'),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TextArea>;

// ── 1. Default ────────────────────────────────────────────────
export const Default: Story = {
  name: 'Default · before the user enters value',
  render: () => (
    <Controlled
      name="default"
      label="Message Body"
      placeholder="Enter input"
      rows={4}
      autoSize={false}
      noFloatingLabel
    />
  ),
};

// ── 2. Hover (CSS pseudo-state) ───────────────────────────────
export const Hover: Story = {
  name: 'Hover · the user hovers on the field',
  parameters: {
    docs: {
      description: { story: 'Move the pointer over the textarea to see the hover treatment. The visual is supplied by the component\'s own CSS — no prop is required.' },
    },
  },
  render: () => (
    <Controlled
      name="hover"
      label="Message Body"
      placeholder="Enter input"
      rows={4}
      autoSize={false}
      noFloatingLabel
    />
  ),
};

// ── 3. Focussed (CSS pseudo-state) ────────────────────────────
export const Focussed: Story = {
  name: 'Focussed · the user has clicked on the field',
  parameters: {
    docs: {
      description: { story: 'Click into the textarea (or Tab to it) to see the focus ring. Like Hover, this state is provided by the component\'s own CSS.' },
    },
  },
  render: () => (
    <Controlled
      name="focussed"
      label="Message Body"
      placeholder="Enter input"
      rows={4}
      autoSize={false}
      noFloatingLabel
    />
  ),
};

// ── 4. Active (filled) ────────────────────────────────────────
export const Active: Story = {
  name: 'Active · the user has entered value',
  render: () => (
    <Controlled
      name="active"
      label="Message Body"
      initialValue="Thank you for your interest. This survey is no longer accepting responses."
      rows={4}
      autoSize={false}
    />
  ),
};

// ── 5. Disabled ───────────────────────────────────────────────
export const Disabled: Story = {
  name: 'Disabled · the field is disabled for user entry',
  render: () => (
    <Controlled
      name="disabled"
      label="Message Body"
      placeholder="Enter input"
      rows={4}
      autoSize={false}
      noFloatingLabel
      disabled
    />
  ),
};

// ── 6. Read only ──────────────────────────────────────────────
export const ReadOnly: Story = {
  name: 'Read only · disabled for entry, content is readable',
  parameters: {
    docs: {
      description: { story: 'Read-only behavior comes from passing the native `readOnly` attribute through to the underlying `<textarea>`. The atom keeps its border and content styling intact.' },
    },
  },
  render: () => (
    <Controlled
      name="readonly"
      label="Message Body"
      initialValue="Read-only content goes here."
      rows={4}
      autoSize={false}
      readOnly
    />
  ),
};

// ── 7. Error ──────────────────────────────────────────────────
export const Error: Story = {
  name: 'Error · the field has errored',
  parameters: {
    docs: {
      description: { story: 'Driven through elemental\'s validation pipeline — a required-field rule on an empty value triggers the error border and message on first change.' },
    },
  },
  render: () => (
    <Controlled
      name="error"
      label="Message Body"
      placeholder="Enter input"
      rows={4}
      autoSize={false}
      noFloatingLabel
      required
      validations={{ required: true }}
      errorMessages={{ required: 'This field is required' }}
      validationTrigger="onChange"
    />
  ),
};

// ── 8. With character count ───────────────────────────────────
export const WithCharCount: Story = {
  name: 'With character count',
  parameters: {
    docs: { description: { story: 'Set `showCharCount` and `maxLength` to render the `0/300`-style counter in the top-right of the label row (matches the Aero "Text area" Figma).' } },
  },
  render: () => (
    <Controlled
      name="charcount"
      label="Message Body"
      placeholder="Enter input"
      rows={4}
      autoSize={false}
      noFloatingLabel
      maxLength={300}
      showCharCount
    />
  ),
};

// ── 9. Floating label (Aero default) ──────────────────────────
export const FloatingLabel: Story = {
  name: 'Floating label · Aero default',
  parameters: {
    docs: { description: { story: 'elemental\'s TextArea ships with a floating label by default (label sits inside the border, moves up on focus). Omit `noFloatingLabel` to use this variant — all other stories here pass `noFloatingLabel` so the label sits above the field, matching how the Survey app uses it next to FormInput fields.' } },
  },
  render: () => (
    <Controlled
      name="floating"
      label="Message Body"
      placeholder="Enter input"
      rows={4}
      autoSize={false}
    />
  ),
};

// ── 10. No border ─────────────────────────────────────────────
export const NoBorder: Story = {
  name: 'No border',
  parameters: {
    docs: { description: { story: 'Set `noBorder` for a transparent textarea (useful inside cards that already have their own container border).' } },
  },
  render: () => (
    <Controlled
      name="noborder"
      label="Message Body"
      placeholder="Enter input"
      rows={4}
      autoSize={false}
      noFloatingLabel
      noBorder
    />
  ),
};

// ── 11. Auto-size ─────────────────────────────────────────────
export const AutoSize: Story = {
  name: 'Auto-size',
  parameters: {
    docs: { description: { story: 'Set `autoSize` to let the textarea grow with the typed content. Try pressing Enter several times.' } },
  },
  render: () => (
    <Controlled
      name="autosize"
      label="Message Body"
      placeholder="Type a few lines to see auto-growth"
      autoSize
    />
  ),
};
