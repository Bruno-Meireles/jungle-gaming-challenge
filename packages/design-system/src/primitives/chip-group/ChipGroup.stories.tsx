import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChipGroup } from './ChipGroup';
import { ChipGroupItem } from './ChipGroupItem';

const meta = {
  title: 'Primitives/ChipGroup',
  component: ChipGroup,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="p-16">
        <Story />
      </div>
    ),
  ],
  args: { 'aria-label': 'Edições', defaultValue: '1' },
  render: (args) => (
    <ChipGroup {...args}>
      <ChipGroupItem value="1">1/50</ChipGroupItem>
      <ChipGroupItem value="2">1/10</ChipGroupItem>
      <ChipGroupItem value="3">1/1</ChipGroupItem>
    </ChipGroup>
  ),
} satisfies Meta<typeof ChipGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { tags: ['golden'] };

export const SecondSelected: Story = { tags: ['golden'], args: { defaultValue: '2' } };

export const WithDisabled: Story = {
  tags: ['golden'],
  render: (args) => (
    <ChipGroup {...args}>
      <ChipGroupItem value="1">1/50</ChipGroupItem>
      <ChipGroupItem value="2" disabled>
        1/10
      </ChipGroupItem>
      <ChipGroupItem value="3">1/1</ChipGroupItem>
    </ChipGroup>
  ),
};

export const Focus: Story = { tags: ['golden-focus'] };
