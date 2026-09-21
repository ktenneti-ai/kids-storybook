import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import { HomeScreen } from './HomeScreen';

const meta = {
  component: HomeScreen,
  tags: ['ai-generated', 'autodocs'],
  args: { onStart: fn() },
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Landing page introducing StoryStars and starting the story-creation wizard.' } },
  },
} satisfies Meta<typeof HomeScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: /create your story/i }));
    await expect(args.onStart).toHaveBeenCalledTimes(1);
  },
};
