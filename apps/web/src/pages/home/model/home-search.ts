import { normalizeCatalogSearch } from '../../../entities/nft';

export const homeSearchSchema = (raw: Record<string, unknown>) => normalizeCatalogSearch(raw);
