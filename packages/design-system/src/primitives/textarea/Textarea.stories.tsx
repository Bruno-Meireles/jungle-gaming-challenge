import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from './Textarea';

const meta = {
  title: 'Primitives/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-340 p-16">
        <Story />
      </div>
    ),
  ],
  args: { 'aria-label': 'Mensagem' },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { tags: ['golden'] };

export const Placeholder: Story = {
  tags: ['golden'],
  args: { placeholder: 'Escreva sua mensagem' },
};

export const Filled: Story = {
  tags: ['golden'],
  args: { defaultValue: 'Gostaria de saber mais sobre esta colecao.\nObrigado!' },
};

export const Invalid: Story = {
  tags: ['golden'],
  args: { defaultValue: 'Curto', 'aria-invalid': true },
};

export const Disabled: Story = {
  tags: ['golden'],
  args: { placeholder: 'Escreva sua mensagem', disabled: true },
};

export const Focus: Story = {
  tags: ['golden-focus'],
  args: { placeholder: 'Escreva sua mensagem' },
};
