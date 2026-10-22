import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Tabs } from './Tabs';
import { TabsContent } from './TabsContent';
import { TabsList } from './TabsList';
import { TabsTrigger } from './TabsTrigger';

const meta = {
  title: 'Primitives/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-366 p-16">
        <Story />
      </div>
    ),
  ],
  args: { defaultValue: 'todos' },
  render: (args) => (
    <Tabs {...args}>
      <TabsList aria-label="Categorias">
        <TabsTrigger value="todos">Todos os NFTs</TabsTrigger>
        <TabsTrigger value="novos">Novos lançamentos</TabsTrigger>
        <TabsTrigger value="alta">Em alta</TabsTrigger>
      </TabsList>
      <TabsContent value="todos" className="pt-16 text-body-14-regular-lh-16">
        Conteúdo de todos os NFTs
      </TabsContent>
      <TabsContent value="novos" className="pt-16 text-body-14-regular-lh-16">
        Conteúdo de novos lançamentos
      </TabsContent>
      <TabsContent value="alta" className="pt-16 text-body-14-regular-lh-16">
        Conteúdo em alta
      </TabsContent>
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ['golden', 'golden-focus'],
};

export const SecondSelected: Story = {
  tags: ['golden'],
  args: { defaultValue: 'novos' },
};

export const ArrowRight: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole('tab', { name: 'Todos os NFTs' });
    const second = canvas.getByRole('tab', { name: 'Novos lançamentos' });
    await userEvent.click(first);
    await userEvent.keyboard('{ArrowRight>}'); // tecla mantida: o Radix pode marcar apos o keydown (rAF)
    await waitFor(() => expect(second).toHaveAttribute('aria-selected', 'true'));
    await waitFor(() => expect(second).toHaveFocus());
    await userEvent.keyboard('{/ArrowRight}');
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Conteúdo de novos lançamentos');
  },
};
