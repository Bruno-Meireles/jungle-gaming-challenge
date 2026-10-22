import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';

const meta = {
  title: 'Primitives/Badge',
  component: Badge,
  tags: ['autodocs'],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

/* Badge Count do header (Figma I70522:3240); fundo do tema escuro para o contorno ink ser visivel. */
export const Count: Story = {
  tags: ['golden'],
  args: { variant: 'count', 'aria-label': '6 itens no carrinho', children: '6' },
  render: (args) => (
    <div className="flex h-24 w-full items-center bg-surface-card px-6">
      <Badge {...args} />
    </div>
  ),
};

/* Label "RARO" do card (Figma 15:5418). */
export const Label: Story = {
  tags: ['golden'],
  args: { variant: 'label', children: 'RARO' },
  render: (args) => (
    <div className="flex h-24 w-full items-center bg-surface-card px-6">
      <Badge {...args} />
    </div>
  ),
};
