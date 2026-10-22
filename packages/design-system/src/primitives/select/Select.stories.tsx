import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Select } from './Select';
import { SelectContent } from './SelectContent';
import { SelectItem } from './SelectItem';
import { SelectTrigger } from './SelectTrigger';
import { SelectValue } from './SelectValue';

const meta = {
  title: 'Primitives/Select',
  component: Select,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="h-220 w-340 p-16">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <Select {...args}>
      <SelectTrigger aria-label="Ordenar por">
        <SelectValue placeholder="Ordenar por" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="recentes">Mais recentes</SelectItem>
        <SelectItem value="menor">Menor preço</SelectItem>
        <SelectItem value="maior">Maior preço</SelectItem>
      </SelectContent>
    </Select>
  ),
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Placeholder: Story = {
  tags: ['golden', 'golden-focus'],
};

export const Selected: Story = {
  tags: ['golden'],
  args: { defaultValue: 'menor' },
};

export const Open: Story = {
  tags: ['golden-page'],
  args: { defaultValue: 'menor', defaultOpen: true },
  parameters: {
    // Radix Select modal aplica aria-hidden ao resto da pagina (inclui o trigger focavel) enquanto aberto.
    // Desvio documentado: so essa regra, so nesta story; o painel aberto e o trigger fechado seguem cobertos pelo unitario.
    a11y: { config: { rules: [{ id: 'aria-hidden-focus', enabled: false }] } },
  },
};

export const Invalid: Story = {
  tags: ['golden'],
  render: (args) => (
    <Select {...args}>
      <SelectTrigger aria-label="Ordenar por" aria-invalid="true">
        <SelectValue placeholder="Ordenar por" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="recentes">Mais recentes</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: 'Ordenar por' });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    const body = within(document.body);
    await body.findByRole('listbox');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(trigger).toHaveTextContent('Menor preço'));
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
