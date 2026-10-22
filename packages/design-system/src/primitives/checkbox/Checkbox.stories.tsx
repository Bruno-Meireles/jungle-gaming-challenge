import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Primitives/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="p-16">
        <Story />
      </div>
    ),
  ],
  args: { 'aria-label': 'Igual à carteira principal' },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = { tags: ['golden'] };

export const Checked: Story = { tags: ['golden'], args: { defaultChecked: true } };

export const Disabled: Story = { tags: ['golden'], args: { disabled: true } };

/** Linha de filtro: caixa + rotulo (14/16 foreground) + contagem (text-secondary), como em "Ethereum (119)". */
export const WithCount: Story = {
  tags: ['golden'],
  args: { id: 'network-ethereum', 'aria-label': undefined, defaultChecked: true },
  render: (args) => (
    <div className="flex items-center gap-8 text-body-14-regular-lh-16 text-foreground">
      <Checkbox {...args} />
      <label htmlFor="network-ethereum">Ethereum</label>
      <span className="text-text-secondary">(119)</span>
    </div>
  ),
};

export const Focus: Story = { tags: ['golden-focus'] };
