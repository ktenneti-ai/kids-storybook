import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { Button } from './Button';

const meta = {
  component: Button,
  tags: ['ai-generated', 'autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Primary call-to-action button used throughout the app, with variant, size, icon, and loading states.' } },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { children: 'Generate Story' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: /generate story/i })).toBeVisible();
  },
};

export const Secondary: Story = { args: { children: 'Try Again', variant: 'secondary' } };

export const Loading: Story = {
  args: { children: 'Generating…', loading: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button')).toBeDisabled();
  },
};
