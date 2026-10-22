import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from './Button';

const meta = {
  title: 'Primitives/Button',
  component: Button,
  tags: ['autodocs'],
  args: { children: 'Salvar' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

const SearchIcon = () => (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="9" cy="9" r="6" />
    <path d="M14 14l4 4" />
  </svg>
);

export const Primary: Story = { tags: ['golden', 'golden-hover', 'golden-focus'] };

export const Outline: Story = {
  tags: ['golden', 'golden-hover', 'golden-focus'],
  args: { variant: 'outline', children: 'Favoritar' },
};

export const Ghost: Story = {
  tags: ['golden', 'golden-hover', 'golden-focus'],
  args: { variant: 'ghost', children: 'Continuar explorando' },
};

export const Icon: Story = {
  tags: ['golden', 'golden-focus'],
  args: { variant: 'icon', 'aria-label': 'Buscar', children: <SearchIcon /> },
};

export const Disabled: Story = { tags: ['golden'], args: { disabled: true } };

export const Loading: Story = { tags: ['golden'], args: { loading: true } };

export const AsLink: Story = {
  tags: ['golden'],
  args: { asChild: true, children: <a href="#carrinho">Ver carrinho</a> },
};

export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Salvar' })).toHaveFocus();
  },
};
