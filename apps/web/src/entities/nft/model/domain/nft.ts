import type { CollectionId, NetworkId } from '../../../../shared/api/contracts/ids';
import type { EthAmount } from '../../../../shared/lib/eth/eth';

export type NftSummary = {
  id: string;
  title: string;
  collectionId: CollectionId;
  networkId: NetworkId;
  price: EthAmount;
  image: { src: string; width: number; height: number };
  rarity: 'common' | 'rare';
  listedAt: string;
};
