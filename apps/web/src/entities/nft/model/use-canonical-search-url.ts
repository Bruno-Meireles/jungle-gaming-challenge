import { useLocation, useNavigate, useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';

import { normalizeCatalogSearch } from './domain/catalog-query';

/*
 * Normalizacao da URL (plano 3.1): params invalidos (`?tab=foo&page=-3`) somem da barra de enderecos por `replace`,
 * sem criar entrada no historico. Parte da string da propria URL (e nao do search ja validado do router, que pode
 * estar uma navegacao atrasado) e compara com a forma canonica gerada pelo router.
 */
export function useCanonicalSearchUrl(): void {
  const router = useRouter();
  const navigate = useNavigate();
  const current = useLocation({ select: (location) => location.searchStr });
  const pathname = useLocation({ select: (location) => location.pathname });

  useEffect(() => {
    // Na troca de rota a Home ainda esta montada por um instante: nao reescreva a URL de outra rota.
    if (pathname !== '/') return;
    const search = normalizeCatalogSearch(router.options.parseSearch(current));
    const canonical = router.buildLocation({ to: '/', search }).searchStr;
    if (current !== canonical) void navigate({ to: '/', search, replace: true });
  }, [current, pathname, router, navigate]);
}
