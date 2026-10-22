import type { Meta, StoryObj } from '@storybook/react-vite';
import { Separator } from './Separator';

const meta = {
  title: 'Primitives/Separator',
  component: Separator,
  tags: ['autodocs'],
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

/* A linha tem 0.3px; o container com fundo e altura garante uma story visível e estável. */
export const Horizontal: Story = {
  tags: ['golden'],
  render: (args) => (
    <div className="flex h-40 w-full items-center bg-surface-card px-6">
      <Separator {...args} />
    </div>
  ),
};
