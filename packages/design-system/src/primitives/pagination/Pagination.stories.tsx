import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Pagination } from './Pagination';

const meta = {
  title: 'Primitives/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  args: {
    page: 1,
    pageCount: 4,
    getItemProps: (n: number) => ({ href: `#pagina-${n}` }),
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const First: Story = { tags: ['golden', 'golden-focus'], args: { page: 1 } };

export const Middle: Story = { tags: ['golden'], args: { page: 2 } };

export const Last: Story = { tags: ['golden'], args: { page: 4 } };

export const Keyboard: Story = {
  args: { page: 2 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: '1' })).toHaveFocus();
    await expect(canvas.getByRole('link', { name: '2' })).toHaveAttribute('aria-current', 'page');
  },
};
