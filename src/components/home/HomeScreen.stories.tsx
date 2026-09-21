import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import { HomeScreen } from './HomeScreen';

const meta = {
  component: HomeScreen,
  tags: ['ai-generated'],
  args: { onStart: fn() },
} satisfies Meta<typeof HomeScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: /create your story/i }));
    await expect(args.onStart).toHaveBeenCalledTimes(1);
  },
};
