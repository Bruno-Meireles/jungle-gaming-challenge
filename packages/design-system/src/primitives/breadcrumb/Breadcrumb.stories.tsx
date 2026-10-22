import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumb } from './Breadcrumb';
import { BreadcrumbItem } from './BreadcrumbItem';
import { BreadcrumbLink } from './BreadcrumbLink';
import { BreadcrumbPage } from './BreadcrumbPage';

const meta = {
  title: 'Primitives/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
  args: { label: 'Trilha' },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

/* Trilha do checkout: "Início / Mercado / Pagamento" (Figma 107123). */
export const Default: Story = {
  tags: ['golden', 'golden-focus'],
  render: (args) => (
    <Breadcrumb {...args}>
      <BreadcrumbItem>
        <BreadcrumbLink href="#inicio">Início</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbLink href="#mercado">Mercado</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem>
        <BreadcrumbPage>Pagamento</BreadcrumbPage>
      </BreadcrumbItem>
    </Breadcrumb>
  ),
};
