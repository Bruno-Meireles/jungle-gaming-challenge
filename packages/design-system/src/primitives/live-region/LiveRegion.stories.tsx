import type { Meta, StoryObj } from '@storybook/react-vite';
import { LiveRegion } from './LiveRegion';

const meta = {
  title: 'Primitives/LiveRegion',
  component: LiveRegion,
  tags: ['autodocs'],
} satisfies Meta<typeof LiveRegion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Polite: Story = {
  args: { politeness: 'polite', children: 'Item adicionado ao carrinho' },
};

export const Assertive: Story = {
  args: { politeness: 'assertive', children: 'Falha no pagamento' },
};
