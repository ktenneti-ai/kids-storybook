import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { Badge } from './Badge';

const meta = {
  component: Badge,
  tags: ['ai-generated', 'autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Small pill badge used for theme, demo-mode, and status labels in the reader header.' } },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Space Adventure', tone: 'violet' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Space Adventure')).toBeVisible();
  },
};

export const Amber: Story = { args: { children: 'Demo mode — sample content', tone: 'amber' } };
export const Green: Story = { args: { children: 'AI generated', tone: 'green' } };

// Badge tone="amber" uses bg-amber-100 — fails if Tailwind / global CSS did not load.
export const CssCheck: Story = {
  args: { children: 'Demo mode', tone: 'amber' },
  play: async ({ canvas }) => {
    const badge = canvas.getByText('Demo mode');
    await expect(getComputedStyle(badge).backgroundColor).toBe('oklch(0.962 0.059 95.617)');
  },
};
