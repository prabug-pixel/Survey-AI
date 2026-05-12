import type { Meta, StoryObj } from '@storybook/react';
import RatingScale from '../shared/RatingScale/RatingScale';

const meta: Meta<typeof RatingScale> = {
  title: 'Survey/RatingScale',
  component: RatingScale,
  tags: ['autodocs'],
  argTypes: {
    scale: {
      control: { type: 'select' },
      options: [3, 5, 7, 10],
      description: 'Number of rating points',
    },
    lowLabel: { control: 'text', description: 'Label for the lowest rating' },
    highLabel: { control: 'text', description: 'Label for the highest rating' },
    startFromZero: { control: 'boolean', description: 'Start scale from 0 (NPS style)' },
    disabled: { control: 'boolean', description: 'Disable interaction' },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof RatingScale>;

export const Default: Story = {
  args: {
    scale: 5,
    lowLabel: 'Not at all likely',
    highLabel: 'Extremely likely',
    disabled: false,
    startFromZero: false,
  },
};

export const Scale3: Story = {
  name: '3-Point Scale',
  args: {
    scale: 3,
    lowLabel: 'Poor',
    highLabel: 'Excellent',
  },
};

export const Scale5: Story = {
  name: '5-Point Scale',
  args: {
    scale: 5,
    lowLabel: 'Very dissatisfied',
    highLabel: 'Very satisfied',
  },
};

export const Scale10: Story = {
  name: '10-Point Scale',
  args: {
    scale: 10,
    lowLabel: 'Not likely',
    highLabel: 'Very likely',
  },
};

export const NPS: Story = {
  name: 'NPS (0-10)',
  args: {
    scale: 10,
    lowLabel: 'Extremely likely',
    highLabel: 'Not at all likely',
    startFromZero: true,
  },
};

export const Disabled: Story = {
  args: {
    scale: 5,
    lowLabel: 'Low',
    highLabel: 'High',
    disabled: true,
  },
};

export const AllScales: Story = {
  name: 'All Scale Variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '600px' }}>
      <div>
        <h4 style={{ marginBottom: 8, fontSize: 14, color: '#555' }}>3-Point Scale</h4>
        <RatingScale scale={3} lowLabel="Bad" highLabel="Good" />
      </div>
      <div>
        <h4 style={{ marginBottom: 8, fontSize: 14, color: '#555' }}>5-Point Scale</h4>
        <RatingScale scale={5} lowLabel="Very dissatisfied" highLabel="Very satisfied" />
      </div>
      <div>
        <h4 style={{ marginBottom: 8, fontSize: 14, color: '#555' }}>7-Point Scale</h4>
        <RatingScale scale={7} lowLabel="Strongly disagree" highLabel="Strongly agree" />
      </div>
      <div>
        <h4 style={{ marginBottom: 8, fontSize: 14, color: '#555' }}>NPS (0-10)</h4>
        <RatingScale scale={10} lowLabel="Extremely likely" highLabel="Not at all likely" startFromZero />
      </div>
    </div>
  ),
};
