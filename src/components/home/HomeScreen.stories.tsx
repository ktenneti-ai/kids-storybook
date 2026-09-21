import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import type { Story as StoryModel } from '@/lib/types';
import { HomeScreen } from './HomeScreen';

const PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

const savedStories: StoryModel[] = [
  {
    id: 'saved-1',
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
    title: 'Emma and the Little Star',
    input: { childName: 'Emma', gender: 'girl', age: '6-8', theme: 'space-adventure', length: 2, illustrationStyle: 'pixar-3d' },
    characterReferenceImageUrl: PIXEL,
    characterReferenceStatus: 'ready',
    characterDescription: 'Emma, a cheerful child',
    settingDescription: 'a whimsical outer-space adventure',
    coverImageUrl: PIXEL,
    coverStatus: 'ready',
    mode: 'ai',
    pages: [{ pageNumber: 1, text: 'Emma looked up.', illustrationPrompt: 'Emma at the window', imageUrl: PIXEL, imageStatus: 'ready' }],
  },
];

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

export const WithSavedStories: Story = {
  args: { savedStories, onOpenStory: fn(), onDeleteStory: fn() },
  play: async ({ canvas, userEvent, args }) => {
    await expect(canvas.getByText('Continue a Story')).toBeVisible();
    await userEvent.click(canvas.getByText('Emma and the Little Star'));
    await expect(args.onOpenStory).toHaveBeenCalledWith(savedStories[0]);
  },
};
