import { nftDetailDtoSchema } from '../../../shared/api/contracts/nfts';
import { getJson, httpClient } from '../../../shared/api/http-client';
import type { NftDetail } from '../model/domain/nft-detail';

export async function fetchNftDetail(nftId: string, signal?: AbortSignal): Promise<NftDetail> {
  const dto = await getJson(httpClient, {
    path: `/nfts/${encodeURIComponent(nftId)}`,
    schema: nftDetailDtoSchema,
    ...(signal ? { signal } : {}),
  });
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    tokenId: dto.tokenId,
    rating: dto.rating,
    gallery: dto.gallery,
    contract: dto.contract,
    royaltyPercent: dto.royaltyPercent,
    attributes: dto.attributes,
    editions: dto.editions,
    defaultEditionId: dto.defaultEditionId,
    collectionId: dto.collectionId,
  };
}
