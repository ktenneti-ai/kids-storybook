import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { ErrorBanner } from './ErrorBanner';

const meta = {
  component: ErrorBanner,
  tags: ['ai-generated', 'autodocs'],
  parameters: {
    layout: 'padded',
    docs: { description: { component: 'Inline error banner with an optional action button, e.g. Retry, used for pipeline errors.' } },
  },
} satisfies Meta<typeof ErrorBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { message: "We couldn't generate your story right now." },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/couldn't generate your story/i)).toBeVisible();
  },
};

export const WithActions: Story = {
  args: {
    message: "We couldn't create this illustration right now.",
    children: <button type="button">Retry</button>,
  },
};
