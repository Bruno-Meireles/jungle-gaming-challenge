import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './Input';

const meta = {
  title: 'Primitives/Input',
  component: Input,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-340 p-16">
        <Story />
      </div>
    ),
  ],
  args: { 'aria-label': 'E-mail' },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { tags: ['golden'] };

export const Placeholder: Story = {
  tags: ['golden'],
  args: { placeholder: 'contato@email.com' },
};

export const Filled: Story = {
  tags: ['golden'],
  args: { defaultValue: 'contato@email.com' },
};

export const Invalid: Story = {
  tags: ['golden'],
  args: { defaultValue: 'contato@', 'aria-invalid': true },
};

export const Disabled: Story = {
  tags: ['golden'],
  args: { placeholder: 'contato@email.com', disabled: true },
};

export const WithIcon: Story = {
  tags: ['golden'],
  args: {
    'aria-label': 'Buscar',
    placeholder: 'Buscar',
    startSlot: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="6" cy="6" r="4.5" />
        <path d="m9.5 9.5 3 3" />
      </svg>
    ),
  },
};

export const Focus: Story = {
  tags: ['golden-focus'],
  args: { placeholder: 'contato@email.com' },
};
