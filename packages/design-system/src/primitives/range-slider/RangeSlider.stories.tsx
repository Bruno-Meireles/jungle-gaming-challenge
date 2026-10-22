import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { RangeSlider } from './RangeSlider';

const meta = {
  title: 'Primitives/RangeSlider',
  component: RangeSlider,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-258 p-16">
        <Story />
      </div>
    ),
  ],
  args: {
    value: [20, 80],
    min: 0,
    max: 100,
    step: 5,
    onValueChange: () => {},
    thumbLabels: ['Preço mínimo', 'Preço máximo'],
  },
} satisfies Meta<typeof RangeSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

const Stateful = (args: React.ComponentProps<typeof RangeSlider>) => {
  const [value, setValue] = useState(args.value);
  return <RangeSlider {...args} value={value} onValueChange={setValue} />;
};

export const Default: Story = {
  tags: ['golden', 'golden-focus'],
  render: (args) => <Stateful {...args} />,
};

export const Disabled: Story = {
  tags: ['golden'],
  args: { disabled: true },
  render: (args) => <Stateful {...args} />,
};

export const Keyboard: Story = {
  render: (args) => <Stateful {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const min = canvas.getByRole('slider', { name: 'Preço mínimo' });
    min.focus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(min).toHaveAttribute('aria-valuenow', '25'));
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    await waitFor(() => expect(min).toHaveAttribute('aria-valuenow', '15'));
    await expect(canvas.getByRole('slider', { name: 'Preço máximo' })).toHaveAttribute('aria-valuenow', '80');
  },
};
