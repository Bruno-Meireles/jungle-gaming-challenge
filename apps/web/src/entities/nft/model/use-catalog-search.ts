import { useNavigate, useRouter, useSearch } from '@tanstack/react-router';

import {
  normalizeCatalogSearch,
  withFilterChange,
  type CatalogSearch,
} from './domain/catalog-query';

type UpdateOptions = { replace?: boolean };

/*
 * A URL e a fonte de verdade dos filtros (plano 3.1). `strict: false` deixa o Header (fora da rota `/`) usar a
 * mesma regra: em outras rotas a busca normalizada fica vazia e navegar leva a `/`.
 * Filtros e busca fazem push no historico; correcoes de normalizacao usam `replace`.
 */
export function useCatalogSearch() {
  const raw = useSearch({ strict: false });
  const navigate = useNavigate();
  const router = useRouter();
  const search = normalizeCatalogSearch(raw);

  const update = (patch: Partial<CatalogSearch>, options: UpdateOptions = {}): void => {
    void navigate({ to: '/', search: withFilterChange(search, patch), replace: options.replace });
  };
  const hrefFor = (patch: Partial<CatalogSearch>): string =>
    router.buildLocation({ to: '/', search: withFilterChange(search, patch) }).href;

  return { search, update, hrefFor };
}
