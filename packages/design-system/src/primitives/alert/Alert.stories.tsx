import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert } from './Alert';
import { Button } from '../button';

const meta = {
  title: 'Primitives/Alert',
  component: Alert,
  tags: ['autodocs'],
  args: { tone: 'info', children: 'Frete calculado para o seu endereco.' },
  decorators: [
    (Story) => (
      <div className="w-full p-16">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = { tags: ['golden'] };

export const Success: Story = {
  tags: ['golden'],
  args: { tone: 'success', title: 'Pedido criado', children: 'Voce recebera a confirmacao por e-mail.' },
};

export const Failure: Story = {
  tags: ['golden'],
  args: { tone: 'error', title: 'Pagamento recusado', children: 'Verifique os dados e tente novamente.' },
};

export const WithAction: Story = {
  tags: ['golden'],
  args: {
    tone: 'error',
    children: 'Nao foi possivel salvar.',
    action: <Button variant="outline">Tentar de novo</Button>,
  },
};
