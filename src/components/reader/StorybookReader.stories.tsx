import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, waitFor } from 'storybook/test';
import type { useStoryPipeline } from '@/hooks/useStoryPipeline';
import type { Story as StoryModel } from '@/lib/types';
import { StorybookReader } from './StorybookReader';

const PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

const mockStory: StoryModel = {
  title: 'Emma and the Little Star',
  input: {
    childName: 'Emma',
    age: '6-8',
    theme: 'space-adventure',
    length: 2,
    illustrationStyle: 'storybook-watercolor',
    photoDataUrl: null,
  },
  characterDescription: 'Emma, a cheerful child with a bright smile',
  settingDescription: 'a whimsical outer-space adventure with candy-colored planets',
  coverImageUrl: PIXEL,
  coverStatus: 'ready',
  mode: 'mock',
  pages: [
    {
      pageNumber: 1,
      text: 'Emma looked up and saw a swirl of stardust outside her window.',
      illustrationPrompt: 'Emma at the window',
      imageUrl: PIXEL,
      imageStatus: 'ready',
    },
    {
      pageNumber: 2,
      text: 'From that day on, Emma remembered that kindness can light up the sky. The End.',
      illustrationPrompt: 'Emma waving goodbye',
      imageUrl: PIXEL,
      imageStatus: 'ready',
    },
  ],
};

function mockPipeline(overrides: Partial<ReturnType<typeof useStoryPipeline>> = {}): ReturnType<typeof useStoryPipeline> {
  return {
    story: mockStory,
    phase: 'ready',
    error: null,
    canFallbackToMock: false,
    progress: { done: 3, total: 3 },
    preferMock: true,
    generate: fn(),
    retry: fn(),
    continueInDemoMode: fn(),
    regenerateStory: fn(),
    regenerateCover: fn(),
    regeneratePageImage: fn(),
    reset: fn(),
    ...overrides,
  };
}

const meta = {
  component: StorybookReader,
  tags: ['ai-generated'],
  args: { onNewStory: fn(), onHome: fn() },
} satisfies Meta<typeof StorybookReader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CoverPage: Story = {
  args: { pipeline: mockPipeline() },
  play: async ({ canvas }) => {
    // The reader card fades in via a CSS animation — wait for it before asserting visibility.
    await waitFor(() => expect(canvas.getByText('Emma and the Little Star')).toBeVisible());
  },
};

export const NavigateToNextPage: Story = {
  args: { pipeline: mockPipeline() },
  play: async ({ canvas, userEvent }) => {
    await waitFor(() => expect(canvas.getByRole('button', { name: /next/i })).toBeVisible());
    await userEvent.click(canvas.getByRole('button', { name: /next/i }));
    await waitFor(() => expect(canvas.getByText(/page 1 \/ 2/i)).toBeVisible());
  },
};

export const Illustrating: Story = {
  args: { pipeline: mockPipeline({ phase: 'illustrating', progress: { done: 1, total: 3 } }) },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/illustrating your storybook/i)).toBeVisible();
  },
};
