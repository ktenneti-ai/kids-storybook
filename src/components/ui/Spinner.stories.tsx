import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { Spinner } from './Spinner';

const meta = {
  component: Spinner,
  tags: ['ai-generated'],
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status')).toBeVisible();
  },
};

export const Large: Story = { args: { className: 'h-10 w-10' } };
