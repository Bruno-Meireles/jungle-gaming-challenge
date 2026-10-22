import type { Meta, StoryObj } from '@storybook/react-vite';
import { Rating } from './Rating';

const meta = {
  title: 'Primitives/Rating',
  component: Rating,
  tags: ['autodocs'],
  args: { value: 4, max: 5, label: 'Avaliacao 4 de 5' },
  decorators: [
    (Story) => (
      <div className="bg-surface-card p-16">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Rating>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { tags: ['golden'] };

export const Full: Story = { tags: ['golden'], args: { value: 5, label: 'Avaliacao 5 de 5' } };

export const Empty: Story = { args: { value: 0, label: 'Sem avaliacoes' } };
