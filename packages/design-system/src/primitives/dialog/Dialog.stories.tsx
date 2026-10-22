import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Dialog } from './Dialog';
import { DialogClose } from './DialogClose';
import { DialogContent } from './DialogContent';
import { DialogDescription } from './DialogDescription';
import { DialogTitle } from './DialogTitle';

const meta = {
  title: 'Primitives/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  render: ({ defaultOpen }) => <Example defaultOpen={defaultOpen} />,
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

function Example({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="p-16">
      <button type="button" className="text-foreground" onClick={() => setOpen(true)}>
        Abrir entrada
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <div className="flex flex-col gap-8">
            <DialogTitle>Entrar</DialogTitle>
            <DialogDescription>Acesse sua conta de colecionador.</DialogDescription>
          </div>
          <DialogClose />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const Open: Story = {
  tags: ['golden-page'],
  args: { defaultOpen: true },
};

export const EscReturnsFocus: Story = {
  play: async ({ canvasElement }) => {
    const opener = within(canvasElement).getByRole('button', { name: 'Abrir entrada' });
    await userEvent.click(opener);
    const dialog = await within(document.body).findByRole('dialog', { name: 'Entrar' });
    await expect(dialog).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(within(document.body).queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(opener).toHaveFocus());
  },
};
