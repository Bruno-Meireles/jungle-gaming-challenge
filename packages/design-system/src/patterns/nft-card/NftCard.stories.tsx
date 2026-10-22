import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '../../primitives/badge';
import { Button } from '../../primitives/button';
import { NftCard } from './NftCard';
import { NftCardSkeleton } from './NftCardSkeleton';

/* Artes locais (data URI SVG), sem rede; nao sao as artes do Figma. */
const art = (a: string, b: string) =>
  `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='250' height='250'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%23${a}'/><stop offset='1' stop-color='%23${b}'/></linearGradient></defs><rect width='250' height='250' fill='url(%23g)'/><circle cx='125' cy='105' r='46' fill='%23140D0A' fill-opacity='0.55'/></svg>`;

const IMAGES = [art('D28A4C', '55321F'), art('B39463', '38220F'), art('E89B55', '2F1D15'), art('C47B3E', '140D0A')];

const HeartIcon = () => (
  <svg aria-hidden="true" width="15" height="13" viewBox="0 0 15 13" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M7.5 12 1.7 6.3A3.4 3.4 0 0 1 7.5 2.6a3.4 3.4 0 0 1 5.8 3.7L7.5 12Z" />
  </svg>
);

const Favorite = ({ name }: { name: string }) => (
  <Button
    variant="icon"
    aria-label={`Favoritar ${name}`}
    className="size-28 justify-center rounded-full border border-border bg-surface-raised text-primary"
  >
    <HeartIcon />
  </Button>
);

const meta = {
  title: 'Patterns/NftCard',
  component: NftCard,
  tags: ['autodocs'],
  args: {
    title: 'Emerald Ape #042',
    priceLabel: '1.19 ETH',
    image: { src: IMAGES[0]!, alt: 'Arte do NFT Emerald Ape #042' },
    link: <a href="#/nft/emerald-ape-042" />,
  },
  /* Largura de coluna do Figma: 175 (mobile) / 258 (>= tablet). */
  decorators: [
    (Story) => (
      <div className="w-175 tablet:w-258">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NftCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { tags: ['golden', 'golden-focus'] };

export const WithBadge: Story = {
  tags: ['golden'],
  args: { badge: <Badge variant="label">RARO</Badge> },
};

export const WithFavorite: Story = {
  tags: ['golden', 'golden-focus'],
  args: {
    title: 'Sage Nomad #009',
    priceLabel: '1.69 ETH',
    image: { src: IMAGES[1]!, alt: 'Arte do NFT Sage Nomad #009' },
    action: <Favorite name="Sage Nomad #009" />,
  },
};

export const Skeleton: StoryObj<typeof NftCardSkeleton> = {
  tags: ['golden'],
  render: () => <NftCardSkeleton />,
};

const items = [
  { title: 'Emerald Ape #042', priceLabel: '1.19 ETH' },
  { title: 'Sage Nomad #009', priceLabel: '1.69 ETH' },
  { title: 'Neon Vessel #552', priceLabel: '1.99 ETH' },
  { title: 'Cosmic Bloom #118', priceLabel: '1.29 ETH' },
  { title: 'Violet Nomad #314', priceLabel: '1.39 ETH' },
];

/* Grid 3 colunas gap 32 (Product Grid 842) em >= tablet; 2 colunas gap 16 no mobile. Ultimo item: carregando. */
export const Grid: Story = {
  tags: ['golden'],
  decorators: [
    (Story) => (
      <div className="w-full max-w-842">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <ul className="grid grid-cols-2 gap-x-16 gap-y-24 tablet:grid-cols-3 tablet:gap-x-32 tablet:gap-y-72">
      {items.map((item, i) => (
        <li key={item.title}>
          <NftCard
            {...item}
            image={{ src: IMAGES[i % IMAGES.length]!, alt: `Arte do NFT ${item.title}` }}
            link={<a href={`#/nft/${i}`} />}
            badge={i === 0 ? <Badge variant="label">RARO</Badge> : undefined}
            action={i % 2 === 1 ? <Favorite name={item.title} /> : undefined}
          />
        </li>
      ))}
      <li>
        <NftCardSkeleton />
      </li>
    </ul>
  ),
};
