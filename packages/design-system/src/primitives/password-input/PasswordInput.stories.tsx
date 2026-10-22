import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { PasswordInput } from './PasswordInput';

const meta = {
  title: 'Primitives/PasswordInput',
  component: PasswordInput,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-340 p-16">
        <Story />
      </div>
    ),
  ],
  args: {
    'aria-label': 'Senha',
    defaultValue: 'segredo123',
    showLabel: 'Mostrar senha',
    hideLabel: 'Ocultar senha',
  },
} satisfies Meta<typeof PasswordInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Hidden: Story = { tags: ['golden'] };

export const Invalid: Story = { tags: ['golden'], args: { 'aria-invalid': true } };

export const Visible: Story = {
  tags: ['golden'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Mostrar senha' }));
  },
};

export const Toggle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Senha');
    await expect(input).toHaveAttribute('type', 'password');
    await userEvent.click(canvas.getByRole('button', { name: 'Mostrar senha' }));
    await expect(input).toHaveAttribute('type', 'text');
    const hide = canvas.getByRole('button', { name: 'Ocultar senha' });
    await expect(hide).toHaveAttribute('aria-pressed', 'true');
    await expect(hide).toHaveFocus();
  },
};
