import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import { IllustrationFrame } from './IllustrationFrame';

const PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

const meta = {
  component: IllustrationFrame,
  tags: ['ai-generated', 'autodocs'],
  args: { onRetry: fn(), alt: 'Illustration for page 3' },
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Loading/ready/error states for one illustration, with the story text overlaid as a bottom gradient scrim.' } },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
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

export const ReadyWithTextOverlay: Story = {
  args: {
    status: 'ready',
    imageUrl: PIXEL,
    overlay: <p>Emma waved at the fox as the sun set over the meadow.</p>,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/emma waved at the fox/i)).toBeVisible();
  },
};

export const ErrorState: Story = {
  args: { status: 'error', error: "We couldn't create this illustration right now." },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: /try again/i }));
    await expect(args.onRetry).toHaveBeenCalledTimes(1);
  },
};
