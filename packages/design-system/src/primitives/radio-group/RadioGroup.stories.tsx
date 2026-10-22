import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { RadioGroup } from './RadioGroup';
import { RadioGroupItem } from './RadioGroupItem';

const meta = {
  title: 'Primitives/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-405 p-16">
        <Story />
      </div>
    ),
  ],
  args: { 'aria-label': 'Carteira' },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ['golden', 'golden-focus'],
  args: { defaultValue: 'a' },
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroupItem value="a" aria-label="MetaMask" />
      <RadioGroupItem value="b" aria-label="Coinbase Wallet" />
    </RadioGroup>
  ),
};

export const Card: Story = {
  tags: ['golden'],
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroupItem variant="card" value="a">
        MetaMask
      </RadioGroupItem>
      <RadioGroupItem variant="card" value="b">
        Coinbase Wallet
      </RadioGroupItem>
    </RadioGroup>
  ),
};

export const CardSelected: Story = {
  tags: ['golden', 'golden-focus'],
  args: { defaultValue: 'b' },
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroupItem variant="card" value="a">
        MetaMask
      </RadioGroupItem>
      <RadioGroupItem variant="card" value="b">
        Coinbase Wallet
      </RadioGroupItem>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  tags: ['golden'],
  args: { defaultValue: 'a' },
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroupItem variant="card" value="a">
        MetaMask
      </RadioGroupItem>
      <RadioGroupItem variant="card" value="b" disabled>
        Coinbase Wallet
      </RadioGroupItem>
    </RadioGroup>
  ),
};

export const ArrowKeys: Story = {
  args: { defaultValue: 'a' },
  render: Card.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole('radio', { name: 'MetaMask' });
    const second = canvas.getByRole('radio', { name: 'Coinbase Wallet' });
    await userEvent.click(first);
    await userEvent.keyboard('{ArrowDown>}'); // tecla mantida: o Radix marca a selecao num rAF, antes do keyup
    await waitFor(() => expect(second).toBeChecked());
    await waitFor(() => expect(second).toHaveFocus());
    await userEvent.keyboard('{/ArrowDown}');
  },
};
