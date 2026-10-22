import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from './Skeleton';

const meta = {
  title: 'Primitives/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/* Linha de texto: dimensoes explicitas em px (sem CLS). Fundo da pagina vem do storybook.css. */
export const Default: Story = {
  tags: ['golden'],
  args: { className: 'h-[24px] w-[240px] rounded-8' },
};

/* Bloco (ex.: imagem do card). */
export const Block: Story = {
  args: { className: 'h-[200px] w-[320px] rounded-16' },
};
