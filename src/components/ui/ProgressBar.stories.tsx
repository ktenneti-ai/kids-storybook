import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { ProgressBar } from './ProgressBar';

const meta = {
  component: ProgressBar,
  tags: ['ai-generated'],
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Halfway: Story = {
  args: { done: 5, total: 10, label: 'Illustrating your storybook' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('50%')).toBeVisible();
  },
};

export const Empty: Story = { args: { done: 0, total: 11, label: 'Illustrating your storybook' } };
export const Complete: Story = { args: { done: 11, total: 11, label: 'Illustrating your storybook' } };
