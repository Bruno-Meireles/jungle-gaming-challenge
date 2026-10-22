import { useQuery } from '@tanstack/react-query';

import { fetchHighlights } from '../api/fetch-highlights';
import { nftKeys } from './nft-keys';

const ANONYMOUS_VIEWER = 'anonymous';

// Recurso sem filtros: a chave nao depende da busca do catalogo (plano home §3.3).
export function useHighlightsQuery() {
  return useQuery({
    queryKey: nftKeys.highlights(ANONYMOUS_VIEWER),
    queryFn: ({ signal }) => fetchHighlights(signal),
  });
}
