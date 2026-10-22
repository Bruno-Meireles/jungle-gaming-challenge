import type { CollectionId, NetworkId } from '../../shared/api/contracts/ids';
import type { NftSummaryDto } from '../../shared/api/contracts/nfts';

/*
 * 45 NFTs do mock: os 8 primeiros sao os nomes do Figma; os demais sao sinteticos.
 * O Figma so tem 4 image fills; cada slug tem seu arquivo em public/nfts/<slug>.webp,
 * copia de um dos fills existentes (desvio registrado no ADR-22).
 * listedAt decresce com o indice (o 1o item e o mais recente).
 */
type Row = readonly [
  id: string,
  title: string,
  priceEth: string,
  collectionId: CollectionId,
  networkId: NetworkId,
  rare: boolean,
];

const ROWS: readonly Row[] = [
  ['emerald-ape-042', 'Emerald Ape #042', '1.19', 'digital-art', 'ethereum', false],
  ['sage-nomad-009', 'Sage Nomad #009', '1.69', 'photography', 'polygon', false],
  ['neon-vessel-552', 'Neon Vessel #552', '1.99', 'music', 'solana', true],
  ['cosmic-bloom-118', 'Cosmic Bloom #118', '0.85', '3d-art', 'polygon', false],
  ['violet-nomad-314', 'Violet Nomad #314', '2.40', 'collectibles', 'solana', false],
  ['ivory-baron-088', 'Ivory Baron #088', '3.15', 'generative', 'ethereum', false],
  ['golden-beat-207', 'Golden Beat #207', '0.45', 'gaming', 'solana', true],
  ['golden-signal-160', 'Golden Signal #160', '0.75', 'memberships', 'ethereum', false],
  ['amber-fox-021', 'Amber Fox #021', '0.000000000000000001', 'utility', 'polygon', false],
  ['onyx-relic-333', 'Onyx Relic #333', '12.30', 'digital-art', 'ethereum', false],
  ['coral-drift-476', 'Coral Drift #476', '1.10', 'photography', 'polygon', false],
  ['silver-lotus-110', 'Silver Lotus #110', '0.02', 'music', 'solana', false],
  ['crimson-echo-254', 'Crimson Echo #254', '0.05', '3d-art', 'polygon', true],
  ['azure-totem-689', 'Azure Totem #689', '0.10', 'collectibles', 'solana', false],
  ['jade-oracle-017', 'Jade Oracle #017', '0.33', 'generative', 'ethereum', false],
  ['cobalt-muse-402', 'Cobalt Muse #402', '0.60', 'gaming', 'solana', false],
  ['rust-harbor-138', 'Rust Harbor #138', '0.90', 'memberships', 'ethereum', false],
  ['opal-specter-095', 'Opal Specter #095', '1.25', 'utility', 'polygon', false],
  ['lunar-mason-521', 'Lunar Mason #521', '1.50', 'digital-art', 'ethereum', false],
  ['pearl-vandal-244', 'Pearl Vandal #244', '2.00', 'photography', 'polygon', true],
  ['indigo-wisp-370', 'Indigo Wisp #370', '2.75', 'music', 'solana', false],
  ['saffron-idol-063', 'Saffron Idol #063', '3.60', '3d-art', 'polygon', false],
  ['teal-marrow-781', 'Teal Marrow #781', '4.20', 'collectibles', 'solana', false],
  ['garnet-pilot-199', 'Garnet Pilot #199', '5.00', 'generative', 'ethereum', false],
  ['mint-cipher-308', 'Mint Cipher #308', '5.75', 'gaming', 'solana', false],
  ['dusk-courier-447', 'Dusk Courier #447', '6.40', 'memberships', 'ethereum', false],
  ['ruby-atlas-612', 'Ruby Atlas #612', '7.10', 'utility', 'polygon', false],
  ['slate-dancer-025', 'Slate Dancer #025', '8.00', 'digital-art', 'ethereum', false],
  ['peach-golem-590', 'Peach Golem #590', '8.90', 'photography', 'polygon', true],
  ['ash-cantor-173', 'Ash Cantor #173', '9.50', 'music', 'solana', false],
  ['lilac-forge-286', 'Lilac Forge #286', '10.25', '3d-art', 'polygon', false],
  ['bronze-siren-934', 'Bronze Siren #934', '11.00', 'collectibles', 'solana', false],
  ['frost-vector-401', 'Frost Vector #401', '0.015', 'generative', 'ethereum', false],
  ['ochre-pixel-077', 'Ochre Pixel #077', '0.08', 'gaming', 'solana', false],
  ['plum-sentry-820', 'Plum Sentry #820', '0.20', 'memberships', 'ethereum', false],
  ['copper-haze-265', 'Copper Haze #265', '0.50', 'utility', 'polygon', false],
  ['mauve-titan-158', 'Mauve Titan #158', '0.95', 'digital-art', 'ethereum', true],
  ['citrine-wave-349', 'Citrine Wave #349', '1.35', 'photography', 'polygon', false],
  ['basalt-bard-716', 'Basalt Bard #716', '1.80', 'music', 'solana', false],
  ['velvet-rook-082', 'Velvet Rook #082', '2.25', '3d-art', 'polygon', false],
  ['quartz-nomad-503', 'Quartz Nomad #503', '3.00', 'collectibles', 'solana', false],
  ['moss-phantom-231', 'Moss Phantom #231', '4.00', 'generative', 'ethereum', false],
  ['ember-scribe-667', 'Ember Scribe #667', '6.00', 'gaming', 'solana', false],
  ['sky-warden-114', 'Sky Warden #114', '7.50', 'memberships', 'ethereum', false],
  ['tide-keeper-398', 'Tide Keeper #398', '9.99', 'utility', 'polygon', false],
];

const NEWEST_LISTED_AT = Date.parse('2026-10-01T12:00:00.000Z');
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
const IMAGE_SIZE = 1254;

export const NFT_FIXTURES: readonly NftSummaryDto[] = ROWS.map(
  ([id, title, priceEth, collectionId, networkId, rare], index) => ({
    id,
    title,
    collectionId,
    networkId,
    priceEth,
    image: { src: `/nfts/${id}.webp`, width: IMAGE_SIZE, height: IMAGE_SIZE },
    rarity: rare ? 'rare' : 'common',
    listedAt: new Date(NEWEST_LISTED_AT - index * SIX_HOURS_MS).toISOString(),
    popularity: (index * 37 + 11) % 100,
    version: 1,
  }),
);
