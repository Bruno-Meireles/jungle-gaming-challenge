import { delay, http, HttpResponse } from 'msw';

import {
  COLLECTION_IDS,
  NETWORK_IDS,
  SORT_IDS,
  VIEW_IDS,
} from '../../shared/api/contracts/ids';
import { isEthDecimal } from '../../shared/lib/eth/eth';
import { queryCatalog, type CatalogQuery } from '../catalog/query-catalog';
import { MOCK_NOW } from '../clock';
import { NFT_FIXTURES } from '../fixtures/nfts';
import { livePrice } from '../commerce/market';
import { readScenario } from '../scenario';

const DEFAULT_LATENCY_MS = 120;
const SLOW_LATENCY_MS = 1500;
const OUT_OF_ORDER_FIRST_MS = 1200;
const OUT_OF_ORDER_NEXT_MS = 100;
const FLAKY_FAILURES = 2;

function pick<T extends string>(allowed: readonly T[], value: string | null, fallback: T): T {
  return allowed.find((candidate) => candidate === value) ?? fallback;
}

function pickAll<T extends string>(allowed: readonly T[], values: string[]): T[] {
  return allowed.filter((candidate) => values.includes(candidate));
}

function optionalPrice(value: string | null): string | undefined {
  return value !== null && isEthDecimal(value) ? value : undefined;
}

function parseQuery(params: URLSearchParams): CatalogQuery {
  const search = params.get('search') ?? undefined;
  const minPriceEth = optionalPrice(params.get('minPriceEth'));
  const maxPriceEth = optionalPrice(params.get('maxPriceEth'));
  const page = Number.parseInt(params.get('page') ?? '1', 10);
  return {
    ...(search === undefined ? {} : { search }),
    view: pick(VIEW_IDS, params.get('view'), 'all'),
    sort: pick(SORT_IDS, params.get('sort'), 'recent'),
    collections: pickAll(COLLECTION_IDS, params.getAll('collections')),
    networks: pickAll(NETWORK_IDS, params.getAll('networks')),
    ...(minPriceEth === undefined ? {} : { minPriceEth }),
    ...(maxPriceEth === undefined ? {} : { maxPriceEth }),
    page: Number.isInteger(page) && page >= 1 ? page : 1,
  };
}

const unavailable = () => HttpResponse.json({ code: 'service_unavailable' }, { status: 503 });

// Estado de requisicoes por sessao da pagina (reset implicito por contexto novo, ADR-22).
export function createCatalogHandler() {
  let requests = 0;
  return http.get('/api/nfts', async ({ request }) => {
    requests += 1;
    const scenario = readScenario(localStorage);
    if (scenario === 'catalog-error') {
      await delay(DEFAULT_LATENCY_MS);
      return unavailable();
    }
    if (scenario === 'catalog-flaky' && requests <= FLAKY_FAILURES) {
      await delay(DEFAULT_LATENCY_MS);
      return unavailable();
    }
    if (scenario === 'catalog-slow') await delay(SLOW_LATENCY_MS);
    else if (scenario === 'catalog-out-of-order') {
      await delay(requests === 2 ? OUT_OF_ORDER_FIRST_MS : OUT_OF_ORDER_NEXT_MS);
    } else await delay(DEFAULT_LATENCY_MS);

    const source = scenario === 'catalog-empty'
      ? []
      : NFT_FIXTURES.map((nft) => {
          const priceEth = livePrice(nft.id);
          if (priceEth === undefined) throw new Error(`mercado ausente para NFT ${nft.id}`);
          return { ...nft, priceEth };
        });
    const body = queryCatalog(source, parseQuery(new URL(request.url).searchParams), MOCK_NOW);
    return HttpResponse.json(body);
  });
}
