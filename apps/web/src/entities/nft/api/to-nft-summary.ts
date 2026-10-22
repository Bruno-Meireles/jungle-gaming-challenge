import type { NftSummaryDto } from '../../../shared/api/contracts/nfts';
import { asEthAmount } from '../../../shared/lib/eth/eth';
import type { NftSummary } from '../model/domain/nft';

export function toNftSummary(dto: NftSummaryDto): NftSummary {
  return {
    id: dto.id,
    title: dto.title,
    collectionId: dto.collectionId,
    networkId: dto.networkId,
    price: asEthAmount(dto.priceEth),
    image: dto.image,
    rarity: dto.rarity,
    listedAt: dto.listedAt,
  };
}
