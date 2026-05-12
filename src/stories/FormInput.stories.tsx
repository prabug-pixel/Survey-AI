// Storybook reference for the Aero Design System "Text field - Standard"
// component (Figma node 2455:19312).
//
// Every story below renders the elemental atom directly — there is no
// custom wrapper, no recreated input — so the file doubles as a usage
// reference for the FormInput atom from `@birdeye/elemental`.
//
// Figma states covered (one story per state, plus the documented variants):
//   Default · Hover · Focussed · Active · Disabled · Read only · Error ·
//   Validation success · With leading icon · With trailing icon ·
//   With hint · Required · Password

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import FormInput from '@birdeye/elemental/core/atoms/FormInput';

// ── Controlled wrapper ─────────────────────────────────────────
// elemental's FormInput is a controlled component. Each story uses this
// wrapper so it behaves the same way the app does (Redux state in real
// usage, local state in Storybook).
type ControlledProps = React.ComponentProps<typeof FormInput> & {
  initialValue?: string;
};

const Controlled: React.FC<ControlledProps> = ({ initialValue = '', ...props }) => {
  const [value, setValue] = useState<string>(initialValue);
  return (
    <div style={{ width: 320 }}>
      <FormInput
        {...props}
        value={value}
        onChange={(_event: unknown, value: string) => setValue(String(value ?? ''))}
      />
    </div>
  );
};

const meta: Meta<typeof FormInput> = {
  title: 'Aero Design System/Text field',
  component: FormInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          'Aero "Text field - Standard" — the canonical single-line input across the Birdeye platform.',
          '',
          'Figma: https://www.figma.com/design/xecPAre4cKkeXEdvTig1oI/Aero-Design-System?node-id=2455-19312',
          '',
          'Imported from `@birdeye/elemental/core/atoms/FormInput`. Hover and Focussed states are',
          'CSS pseudo-states — interact with the input below to see them.',
        ].join('\n'),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FormInput>;

// ── 1. Default ────────────────────────────────────────────────
export const Default: Story = {
  name: 'Default · before the user enters value',
  render: () => (
    <Controlled
      name="default"
      type="text"
      label="Label"
      placeholder="Enter input"
    />
  ),
};

// ── 2. Hover (CSS pseudo-state) ───────────────────────────────
export const Hover: Story = {
  name: 'Hover · the user hovers on the field',
  parameters: {
    docs: {
      description: {
        story: 'Move the pointer over the input to see the hover treatment. No prop is required — the visual is supplied by the component\'s own CSS.',
      },
    },
  },
  render: () => (
    <Controlled
      name="hover"
      type="text"
      label="Label"
      placeholder="Enter input"
    />
  ),
};

// ── 3. Focussed (CSS pseudo-state) ────────────────────────────
export const Focussed: Story = {
  name: 'Focussed · the user has clicked on the field',
  parameters: {
    docs: {
      description: {
        story: 'Click into the field (or Tab to it) to see the focus ring. Like Hover, this state is provided by the component\'s own CSS — no prop is needed.',
      },
    },
  },
  render: () => (
    <Controlled
      name="focussed"
      type="text"
      label="Label"
      placeholder="Enter input"
    />
  ),
};

// ── 4. Active (filled) ────────────────────────────────────────
export const Active: Story = {
  name: 'Active · the user has entered value',
  render: () => (
    <Controlled
      name="active"
      type="text"
      label="Label"
      initialValue="Sample input"
    />
  ),
};

// ── 5. Disabled ───────────────────────────────────────────────
export const Disabled: Story = {
  name: 'Disabled · the field is disabled for user entry',
  render: () => (
    <Controlled
      name="disabled"
      type="text"
      label="Label"
      placeholder="Enter input"
      disabled
    />
  ),
};

// ── 6. Read only ──────────────────────────────────────────────
export const ReadOnly: Story = {
  name: 'Read only · disabled for entry, content is readable',
  render: () => (
    <Controlled
      name="readonly"
      type="text"
      label="Label"
      initialValue="Read-only value"
      readOnly
    />
  ),
};

// ── 7. Error ──────────────────────────────────────────────────
export const Error: Story = {
  name: 'Error · the field has errored',
  parameters: {
    docs: {
      description: {
        story: 'elemental drives the error visual through its own validation pipeline (`validations` + `errorMessages` + `validationTrigger`). Here we wire a required-field rule and a starting empty value so the error border + message appear immediately.',
      },
    },
  },
  render: () => (
    <Controlled
      name="error"
      type="text"
      label="Label"
      placeholder="Enter input"
      required
      validations={{ required: true }}
      errorMessages={{ required: 'This field is required' }}
      validationTrigger="onChange"
    />
  ),
};

// ── 8. Validation success ─────────────────────────────────────
export const ValidationSuccess: Story = {
  name: 'Validation success · entered value matches system requirement',
  parameters: {
    docs: {
      description: {
        story: 'elemental displays a green tick when `showGreenTick` is on and the value passes validation.',
      },
    },
  },
  render: () => (
    <Controlled
      name="success"
      type="text"
      label="Label"
      initialValue="valid@example.com"
      showGreenTick
      validations={{ required: true }}
      validationTrigger="onChange"
    />
  ),
};

// ── 9. With leading icon ──────────────────────────────────────
export const WithLeadingIcon: Story = {
  name: 'With leading icon',
  parameters: {
    docs: { description: { story: 'Use `showLeftIcon` + `customIconClass` to render an icon on the left side. The icon glyph comes from the Phoenix icon font shipped with elemental.' } },
  },
  render: () => (
    <Controlled
      name="leading"
      type="text"
      label="Search"
      placeholder="Search"
      showLeftIcon
      customIconClass="icon_phoenix-search"
    />
  ),
};

// ── 10. With trailing icon ────────────────────────────────────
export const WithTrailingIcon: Story = {
  name: 'With trailing icon',
  render: () => (
    <Controlled
      name="trailing"
      type="text"
      label="Calendar"
      placeholder="Select date"
      showRightIcon
      customIconClass="icon_phoenix-calendar"
    />
  ),
};

// ── 11. With hint ─────────────────────────────────────────────
export const WithHint: Story = {
  name: 'With hint',
  parameters: {
    docs: { description: { story: 'A hint paragraph is rendered as a sibling element below the field — using the same `.hint` SCSS style the Expiry Settings page uses.' } },
  },
  render: () => (
    <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <FormInput
        name="hint"
        type="text"
        label="Email"
        placeholder="you@example.com"
        value=""
        onChange={() => undefined}
      />
      <span style={{ fontSize: 12, color: '#9e9e9e', letterSpacing: '-0.24px' }}>
        We'll only contact you about your account.
      </span>
    </div>
  ),
};

// ── 12. Required ──────────────────────────────────────────────
export const Required: Story = {
  name: 'Required · asterisk in the label',
  render: () => (
    <Controlled
      name="required"
      type="text"
      label="Title *"
      placeholder="Enter input"
      required
    />
  ),
};

// ── 13. Password ──────────────────────────────────────────────
export const Password: Story = {
  name: 'Password type',
  render: () => (
    <Controlled
      name="password"
      type="password"
      label="Password"
      placeholder="••••••••"
    />
  ),
};
