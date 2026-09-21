import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, waitFor } from 'storybook/test';
import { CreateWizard } from './CreateWizard';

const meta = {
  component: CreateWizard,
  tags: ['ai-generated'],
  args: { onSubmit: fn(), onBack: fn() },
} satisfies Meta<typeof CreateWizard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StepOne: Story = {
  play: async ({ canvas }) => {
    // The wizard card fades in via a CSS animation — wait for it before asserting visibility.
    await waitFor(() => expect(canvas.getByLabelText(/child's name/i)).toBeVisible());
  },
};

export const AdvanceToStepTwo: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText(/child's name/i), 'Emma');
    await userEvent.click(canvas.getByRole('button', { name: /continue/i }));
    // The wizard card fades in via a CSS animation — wait for it before asserting visibility.
    await waitFor(() => expect(canvas.getByText(/set the scene/i)).toBeVisible());
  },
};
