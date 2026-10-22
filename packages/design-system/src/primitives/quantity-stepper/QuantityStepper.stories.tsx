import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { QuantityStepper } from './QuantityStepper';

const meta = {
  title: 'Primitives/QuantityStepper',
  component: QuantityStepper,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="p-16">
        <Story />
      </div>
    ),
  ],
  args: { label: 'Quantidade', decrementLabel: 'Diminuir', incrementLabel: 'Aumentar', value: 2, min: 1, max: 5, onValueChange: () => {} },
} satisfies Meta<typeof QuantityStepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { tags: ['golden', 'golden-hover', 'golden-focus'] };

export const AtMin: Story = { tags: ['golden'], args: { value: 1 } };

export const AtMax: Story = { tags: ['golden'], args: { value: 5 } };

function ControlledStepper(args: React.ComponentProps<typeof QuantityStepper>) {
  const [value, setValue] = useState(args.value);
  return <QuantityStepper {...args} value={value} onValueChange={setValue} />;
}

/** Estado controlado: clicar em Aumentar incrementa o valor exibido. */
export const Increment: Story = {
  render: (args) => <ControlledStepper {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Aumentar' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('3');
  },
};
