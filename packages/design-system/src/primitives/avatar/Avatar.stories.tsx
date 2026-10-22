import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar';

/* Imagem local (data URI SVG), sem rede. */
const PHOTO =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100' height='100' fill='%23D28A4C'/><circle cx='50' cy='38' r='18' fill='%23140D0A'/><rect x='20' y='62' width='60' height='40' rx='20' fill='%23140D0A'/></svg>";

/* Icone de imagem (Figma Iconly/Curved/Image 2, 9:1550), 20x20, traco 1.5 em currentColor. */
const imageIcon = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <rect x="2" y="2" width="16" height="16" rx="4" />
    <circle cx="7.5" cy="7.5" r="1.5" />
    <path d="m3 15 4.5-4.5 3 3L13 11l4 4" />
  </svg>
);

const meta = {
  title: 'Primitives/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  args: { alt: 'Foto de Ana', fallback: imageIcon },
  decorators: [
    (Story) => (
      <div className="bg-surface-card p-16">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Image: Story = { tags: ['golden'], args: { src: PHOTO } };

export const Fallback: Story = { tags: ['golden'] };
