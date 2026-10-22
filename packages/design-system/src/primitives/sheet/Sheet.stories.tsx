import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Sheet } from './Sheet';
import { SheetClose, SheetDescription, SheetTitle } from './SheetParts';

const meta = {
  title: 'Primitives/Sheet',
  component: Sheet,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { side: 'bottom', defaultOpen: true },
  render: ({ side, defaultOpen }) => <Example side={side} defaultOpen={defaultOpen} />,
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

function Example({ side, defaultOpen = false }: { side: 'bottom' | 'left' | 'right'; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="p-16">
      <button type="button" className="text-foreground" onClick={() => setOpen(true)}>
        Abrir filtros
      </button>
      <Sheet side={side} open={open} onOpenChange={setOpen}>
        <div className="flex flex-col gap-8 pr-24">
          <SheetTitle>Filtros</SheetTitle>
          <SheetDescription>Refine a lista de NFTs.</SheetDescription>
        </div>
        <SheetClose />
      </Sheet>
    </div>
  );
}

export const Bottom: Story = {
  tags: ['golden-page'],
  args: { side: 'bottom' },
};

export const Left: Story = {
  tags: ['golden-page'],
  args: { side: 'left' },
};
