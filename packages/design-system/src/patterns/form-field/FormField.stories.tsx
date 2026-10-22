import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '../../primitives/input';
import { FormField } from './FormField';

const meta = {
  title: 'Patterns/FormField',
  component: FormField,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-340 bg-surface-card p-24">
        <Story />
      </div>
    ),
  ],
  args: {
    label: 'E-mail',
    children: <Input placeholder="contato@email.com" />,
  },
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { tags: ['golden'] };

export const WithHint: Story = {
  tags: ['golden'],
  args: { hint: 'Usaremos apenas para contato sobre o pedido.' },
};

export const WithError: Story = {
  tags: ['golden'],
  args: {
    error: 'Informe um e-mail válido.',
    children: <Input defaultValue="contato@" />,
  },
};

export const Required: Story = {
  tags: ['golden'],
  args: { required: true, hint: 'Campo obrigatório.' },
};
