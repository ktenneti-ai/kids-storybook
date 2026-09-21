import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import { PhotoUpload } from './PhotoUpload';

const PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

const meta = {
  component: PhotoUpload,
  tags: ['ai-generated'],
  args: { onChange: fn() },
} satisfies Meta<typeof PhotoUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { value: null },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/choose a photo/i)).toBeVisible();
  },
};

export const WithPhoto: Story = {
  args: { value: PIXEL },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: /remove/i }));
    await expect(args.onChange).toHaveBeenCalledWith(null);
  },
};
