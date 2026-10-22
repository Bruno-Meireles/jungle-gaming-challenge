import type { Meta, StoryObj } from '@storybook/react-vite';
import { Label } from './Label';

const meta = {
  title: 'Primitives/Label',
  component: Label,
  tags: ['autodocs'],
  args: { children: 'Nome de exibição', htmlFor: 'label-story-input' },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

/* O input nativo (apenas para a story ser acessivel) usa o fundo do card; o Input do DS e o componente C7. */
export const Default: Story = {
  tags: ['golden'],
  render: (args) => (
    <div className="flex w-320 flex-col gap-8 bg-surface-card p-24">
      <Label {...args} />
      <input id="label-story-input" className="h-40 rounded-5 border border-secondary bg-transparent px-12" />
    </div>
  ),
};

export const Required: Story = {
  tags: ['golden'],
  args: { required: true, htmlFor: 'label-story-required' },
  render: (args) => (
    <div className="flex w-320 flex-col gap-8 bg-surface-card p-24">
      <Label {...args} />
      <input
        id="label-story-required"
        required
        className="h-40 rounded-5 border border-secondary bg-transparent px-12"
      />
    </div>
  ),
};
