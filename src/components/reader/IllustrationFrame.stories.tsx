import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import { IllustrationFrame } from './IllustrationFrame';

const PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

const meta = {
  component: IllustrationFrame,
  tags: ['ai-generated'],
  args: { onRegenerate: fn(), alt: 'Illustration for page 3', regenerateLabel: 'Regenerate illustration' },
} satisfies Meta<typeof IllustrationFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: { status: 'loading' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/painting the illustration/i)).toBeVisible();
  },
};

export const Ready: Story = {
  args: { status: 'ready', imageUrl: PIXEL },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: /illustration for page 3/i })).toBeVisible();
  },
};

export const ErrorState: Story = {
  args: { status: 'error', error: "We couldn't create this illustration right now." },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: /try again/i }));
    await expect(args.onRegenerate).toHaveBeenCalledTimes(1);
  },
};
