# Plano: home

Autor do plano: `architect` (Opus), gravado por `/plan-create`. Plano único que entrega a **Home responsiva** (1440, 768, 390) e absorve o mínimo de F0b (shell, providers, i18n, lint) e do mock do catálogo, conforme `docs/discovery.md` §5. Segue o ADR-15 (sem Docker; `verify` cotidiano sem golden). `prompt.md` é lei: nenhuma decisão deste plano remove exigência do enunciado (ver "Rastreabilidade").

## Decisões do usuário e premissas

Regras do usuário (CLAUDE.md, 2026-10-22): `prompt.md` é lei e o que ele não define é complementado e registrado; dependências necessárias estão pré-autorizadas (versão fixa, compatibilidade verificada, registro em `ARCHITECTURE.md`); Docker é proibido salvo ordem explícita; commit por etapa. As lacunas do `architect` foram resolvidas com a recomendação dele, **assumidas com aprovação por essas regras**; reverter qualquer uma exige novo plano:

- **Q1** ADR-15 vale sem Docker (já em `ARCHITECTURE.md`); `test:e2e` entra no `verify` cotidiano.
- **Q2** Roadmap: Home = F0b mínimo + catálogo; F1 amplia mocks (persistência, reset, demais cenários, Socket.IO); F2 sessão. `design.md` §10 é corrigido no M1 ("Home depende de F0b", não de F2).
- **Q3** Separador decimal: vírgula em pt-BR, ponto em en; desvio do Figma registrado (o Figma mistura os dois).
- **Q4** Abas Todos/Novos lançamentos/Em alta são **filtro de subconjunto** (`new` = listado nos 30 dias antes de `MOCK_NOW`; `trending` = `popularity ≥ 80`); a ordenação fica no Select.
- **Q5** Sem `Accept-Language`: na Home só aparecem título (nome próprio) e preço; o idioma fica fora da `queryKey`. Reavaliar no detalhe (F4).
- **Q6** Desktop: o ícone de busca abre um campo acessível no header (`aria-expanded`); busca submetida por Enter (push no histórico). Mobile: campo direto, como no frame.
- **Q7** Rotas stub renderizam no lugar o conteúdo "não disponível", sem redirecionar: `/nfts/$nftId`, `/login`, `/cart`.
- **Q8** Seletor de idioma no rodapé (desktop e mobile) e no header desktop; desvio do Figma registrado.
- **Q9** Hero: 3 destaques de `/api/highlights`, troca manual, sem autoplay; duas chaves de cópia (desktop e mobile), fiel ao Figma.
- **Q10** `RangeSlider` do DS ganha `getValueText: (value: number) => string` **obrigatória** (`aria-valuetext`; §8 exige acessibilidade); TDD no DS, primeiro item do M4.
- **Q11** Tablet 768 derivado: header desktop, filtros e ordenação no Sheet, grade de 2 colunas, sem barra inferior.
- **Q12** Mobile sem frame abaixo da dobra: paginação igual à do desktop, ordenação no Sheet, rodapé empilhado, destaque lateral omitido.
- **Q13** Imagens dos NFTs: obtidas dos image fills do Figma pela API (token do `.env`, estendendo `tools/figma-extract.mjs`), em WebP com `width`/`height`; origem registrada (§8: documentar substituição de asset). Se a API não entregar algum fill, o item vira lacuna registrada, nunca imagem inventada sem aviso.
- **Q14** Ícones: SVG locais em `shared/ui/icons`, `aria-hidden` (fecha o ADR-11 pendente).
- **Q15** Execução e revisão por marco (`/plan-execute home` até o M*n*, depois revisão), sem dividir o plano.
- **Q16** Breakpoints do DS mantidos (`tablet` 768, `desktop` 1440); layout tablet vale de 768 a 1439 px. Reavaliar no Lighthouse (F9).
- **Q17** i18n com `i18next` + `react-i18next` (tipos via `CustomTypeOptions`).
- **Q18** `zod` na borda (DTO e search schema).
- **Menores:** contador do carrinho oculto até F5; coração de favoritar omitido até F4; botão central da barra inferior (scan) → `/unavailable?feature=scan`; banners "Explorar" → `/?tab=new` e `/?collections=digital-art`; newsletter leva a `/unavailable?feature=newsletter` sem sucesso falso; skip link incluído (desvio registrado); preço riscado do Figma e card sem título omitidos (desvios).
- **Pendente do usuário, fora desta feature:** estratégia de baselines locais para a regressão visual das páginas (§9), tratada na validação final (ADR-15).

## 1. Requisitos cobertos

| § | Trecho | Como a Home atende |
|---|---|---|
| §2 | Stack obrigatória (React, TS, TanStack Router/Query, Axios, Tailwind, shadcn/ui, MSW, Playwright) | todas participam: rotas e `validateSearch`, Query com `signal`, Axios em `shared/api`, mocks MSW, E2E Playwright; shadcn/ui via DS |
| §3 Início (:61) | "Destaques, catálogo, busca, filtros, ordenação e navegação para o NFT" | hero, destaque, grade, busca, filtros, abas, ordenação, link do título para `/nfts/$nftId` |
| §3 (:71) | frames desktop e mobile | `2:2` (1440×3668) e `14:5226` (414×896, validado em 390); 768 derivado |
| §3 (:73) | ações fora do escopo sem sucesso falso | `/unavailable?feature=<id>` e 404 |
| §3 Catálogo (:77-79) | URL como estado, filtros combináveis, `page` reiniciado, vazio/falha/fora de ordem | `validateSearch`, `withFilterChange`, estados, descarte de resposta obsoleta |
| §3 (:91) | ETH string decimal, quantidades inteiras | `priceEth` string; `shared/lib/eth` em bigint de 18 casas |
| §4 (:115-127) | Router, Query, Axios; contratos tipados; estados; cancelamento; isolamento; rotas inexistentes e acesso direto; política de cache documentada | §3 Contratos, testes 12-37, ADR-20 |
| §5 NFTs (:136,144) | listagem com busca/filtros/ordenação/paginação; erros por tipo | `GET /api/nfts`, erros por código |
| §6 (:150-174) | mocks na camada de rede; lentidão, latência, falhas; fixtures com variedade; ativação por configuração e no build de demonstração | `src/mocks` fora do FSD; cenários `default`, `catalog-empty`, `catalog-error`, `catalog-flaky`, `catalog-slow`, `catalog-out-of-order`; 45 fixtures; `VITE_ENABLE_MOCKS` inclusive no build |
| §8 (:200-216) | fidelidade ao Figma; 390/768/1440; skeleton com shimmer sem CLS; movimento reduzido; teclado, foco, drawers, labels, alt, contraste, feedback acessível, sem overflow com zoom; assets locais e substituições documentadas | testes 30, 34-39 e inspeção por captura (40); Q13 |
| §9 (:222,233,235-239) | fluxos 1 e 12; Chromium em desktop e mobile; estado isolado; relógio, latência; REST pelos handlers MSW; relatório HTML e traces | E2E em 1440 e 390 (768 onde há layout); contexto novo por teste; `page.clock`; cenário por `addInitScript`; regressão visual das páginas na validação final (ADR-15, `prompt.md:235` segue valendo) |
| §10 (:243) | Lighthouse de início com build otimizado e mocks | F9; a Home prepara `lang`, `<title>`, `meta description`, imagens com dimensões |
| §12 (:277-285) | deploy obrigatório com mocks; acesso direto e refresh; comandos de dev com mocks, build, preview, tipos, lint, Playwright | M7: SPA rewrite, mocks no build, testes 41-43; scripts `dev:mocks`, `preview`, `test:e2e` |
| Adicionais (prompt.md:14-15) | boas práticas; i18n desde o zero | i18next tipado, paridade, lint de literais, limites numéricos |

Frames do Figma: desktop `2:2` e mobile `14:5226` (`frames.json:4-5,103-104`); PNGs `docs/figma/screens/2-2_Desktop_In_cio.png` e `14-5226_Mobile_In_cio.png`. O frame mobile tem 896 px de altura: rodapé, paginação e ordenação mobile não aparecem nele (Q12).

### Rastreabilidade: exigências do enunciado que NÃO são desta feature

Nenhuma exigência é removida; cada uma tem feature dona (roadmap `design.md` §10, corrigido no M1):

| Exigência | Dona |
|---|---|
| Detalhe (galeria, edição, quantidade, favoritos, compra); favoritos persistentes; atualização otimista com rollback | F4 |
| Carrinho (persistência, visitante→login, cupom, cotação), contador real | F5 |
| Pagamento, carteira e rede, pedido idempotente, recibo | F6 |
| Cadastro, login, logout, expiração, troca de usuário, isolamento por usuário, senhas não em claro | F2 |
| Perfil, avatar, senha, carteiras | F8 |
| Socket.IO (`nft.updated`, `order.updated`), reconciliação, spike do `@mswjs/socket.io-binding` | F1 (mock) e F7 |
| MSW: persistência, reset completo de cenário, ≥ 2 usuários, demais cenários do §6 | F1 |
| Fluxos E2E 2-11 do §9 | features respectivas e F9 |
| Regressão visual de início/detalhe/carrinho/pagamento com baselines versionadas | validação final (ADR-15) |
| Lighthouse (3 medições, mediana, relatórios, LCP/CLS/TBT) | F9 |
| README completo (setup, envs, credenciais, cenários, reset) e `ARCHITECTURE.md` completo | F9 (cada feature acrescenta suas decisões) |
| Deploy público do projeto inteiro | M7 prepara; publicação exige conta do usuário (F9) |

## 2. Slice FSD (pacote `apps/web` salvo indicação contrária)

Regras: imports só para camadas inferiores; acesso por `index.ts`; slices da mesma camada não se importam. O domínio (`model/domain/**`, `shared/lib/**`) não importa React, Axios, TanStack, MSW nem i18next.

```
apps/web/src
  app/
    bootstrap/enable-mocks.ts       import dinâmico de ../mocks/browser se VITE_ENABLE_MOCKS === 'true'
    providers/AppProviders.tsx      QueryClientProvider + I18nextProvider + RouterProvider
    providers/query-client.ts       política de cache (ADR-20)
    i18n/init.ts, resources.ts, i18next.d.ts, language-store.ts (localStorage 'jg:locale')
    router/router.tsx               árvore de código: root, '/', '/nfts/$nftId', '/login', '/cart', '/unavailable', notFoundComponent, errorComponent
    layouts/RootLayout.tsx          SkipLink + Header + <main id="content"><Outlet/></main> + Footer + BottomNav + LiveRegion
  pages/
    home/            index.ts → { HomePage, homeSearchSchema }   model/useHomeSearch.ts (getRouteApi('/'))
    unavailable/     index.ts → { UnavailablePage, unavailableSearchSchema }  (whitelist de feature ids)
    not-found/       index.ts → { NotFoundPage }
  widgets/
    header/          logo, nav (Início/Mercado → '/', Criadores/Aprenda → /unavailable), busca (feature), carrinho (sem contador), Entrar → /login
    hero/            carrossel manual de 3 destaques (pontos = botões), CTA Explorar → #catalog
    filter-panel/    sidebar ≥1440; Sheet (DS) <1440 com botão de filtros; compõe catalog-filters (+ catalog-sort no Sheet)
    catalog/         toolbar (catalog-view-tabs + catalog-sort), resultados (união loading|empty|error|success), grade, paginação, aria-busy, anúncio de contagem
    featured-nft/    "NFT em destaque / Oferta limitada" (dados de highlights)
    promo-banners/   2 banners com Explorar
    journal/         "Diário da Cunhagem" (texto i18n; "Ler mais" → /unavailable?feature=journal)
    footer/          pilares, newsletter (não funcional), contatos, links → /unavailable, carteiras compatíveis
    bottom-nav/      só <768
  features/
    catalog-search/      formulário role=search; desktop: botão de ícone com aria-expanded abre o campo
    catalog-filters/     coleções e redes (Checkbox + contagem da faceta), faixa de preço (RangeSlider em passos inteiros + Aplicar)
    catalog-sort/        Select (recent|price-asc|price-desc|popular)
    catalog-view-tabs/   Tabs (all|new|trending)
  entities/
    nft/       index.ts → tipos de domínio, normalizeCatalogSearch, withFilterChange, nftKeys, useCatalogQuery, useHighlightsQuery, NftCardView
               model/domain/* (puro), api/fetch-catalog-page.ts, api/fetch-highlights.ts (DTO → domínio), config/locales; network ids em model/domain/network.ts
    collection/ index.ts → COLLECTION_IDS, isCollectionId; config/locales com os rótulos
  shared/
    api/http-client.ts, api/api-error.ts, api/contracts/{nfts,highlights,error}.ts (zod + tipos DTO)
    lib/eth/ (parseEth, compareEth, formatEthAmount(locale), ethToSteps/stepsToEth), lib/i18n/ (Locale, resolveLocale, useDocumentMeta), lib/assert-never.ts
    ui/ wrappers i18n do DS: AppPagination, AppAlert, AppSheet, AppRangeSlider, icons/ (SVG locais)
    config/env.ts, config/site.ts, config/locales/{pt-BR,en}.ts (comum)
  mocks/   (fora do FSD; só app/bootstrap importa; pode importar shared/api/contracts e shared/lib)
    browser.ts, node.ts, scenario.ts (localStorage 'jg:mocks:scenario'), handlers/{catalog,highlights}.ts,
    catalog/query-catalog.ts (filtro/ordem/página/facetas puros), fixtures/nfts.ts (45 itens)
apps/web/public/ mockServiceWorker.js (msw init), images/nfts/*
apps/web/e2e/  *.spec.ts, fixtures/scenario.ts
apps/web/playwright.config.ts, vercel.json, .env.production
```

Pacote do design system: sem componente novo; única mudança é `RangeSlider.getValueText` (Q10).

### Dependências (pré-autorizadas; versão fixa, compatibilidade conferida na instalação, registro nos ADRs)

| Pacote | Versão | Motivo |
|---|---|---|
| `@tanstack/react-router` | 1.170.45 | rotas, `validateSearch`, `notFound` |
| `@tanstack/react-query` | 5.104.5 | cache, `signal`, `placeholderData` |
| `axios` | 1.20.0 | cliente HTTP |
| `msw` | 2.x (2.15.0; conferir o maior 2.x com `pnpm view msw@2 version`) | mocks REST; **não usar 3.x**: `@mswjs/socket.io-binding@0.2.0` exige `msw ^2.10.2` |
| `zod` | 4.6.7 | validação na borda |
| `i18next` / `react-i18next` | 26.5.5 / 17.1.2 | i18n |
| `@playwright/test` | 1.64.1 (igual ao `playwright` instalado) | runner E2E |
| `@axe-core/playwright` | 4.14.0 | axe nos E2E (`testing.md`) |

Antes de cada instalação: conferir peers e compatibilidade com Vite 8.3.5, Tailwind 4.3.3, Vitest 5.0.5, ESLint 10.13.0 e TypeScript 6.0.3. Sem plugins de lint novos (`eslint-plugin-react` e `eslint-plugin-i18next` descartados: peers sem ESLint 10, ADR-21).

**Lint (ADR-21), só regras do núcleo e do typescript-eslint:** `no-restricted-imports` por camada, deep import, slice irmão, `mocks` fora de `app/bootstrap`, React/Axios/TanStack/MSW/i18next em `model/domain` e `shared/lib`; `no-restricted-syntax` para literais com letra em JSX (`JSXText`, atributos `aria-label|aria-description|alt|title|placeholder|label`, template em JSX; exceções: testes, `e2e/**`, `src/mocks/**`; a ordem dos blocos preserva o `no-restricted-syntax` de `.only/.skip` dos testes, `eslint.config.js:31-53`); qualidade em `src/**` exceto testes: `complexity 10`, `max-depth 3`, `max-params 3`, `max-nested-callbacks 3`, `max-lines 200`, `max-lines-per-function 80`, `no-explicit-any`, `as` proibido salvo `as const`, `switch-exhaustiveness-check`; testes `max-lines 400`.

## 3. Contratos

### 3.1 Search params da rota `/` (`homeSearchSchema`)

| Param | Tipo | Default (omitido) | Normalização |
|---|---|---|---|
| `q` | string | — | trim; vazio vira ausente; máx. 100 caracteres |
| `tab` | `all\|new\|trending` | `all` | inválido vira ausente |
| `sort` | `recent\|price-asc\|price-desc\|popular` | `recent` | idem |
| `collections` | slug[] (whitelist) | [] | sem duplicatas, ordenado, desconhecidos descartados |
| `networks` | `ethereum\|polygon\|solana`[] | [] | idem |
| `min`, `max` | string decimal ETH (`^\d+(\.\d{1,18})?$`) | — | inválido descartado; `min > max` (bigint) descarta os dois |
| `page` | inteiro ≥ 1 | 1 | `-1`, `2.5`, `abc` viram ausente; acima de `totalPages` vira a última (`replace`) |

`withFilterChange(search, patch)` zera `page` quando muda `q`, `tab`, `sort`, `collections`, `networks`, `min` ou `max`. Busca e filtros fazem push no histórico; a normalização usa replace.

### 3.2 `GET /api/nfts`

Query: `search?`, `view=all|new|trending`, `sort`, `collections` (repetido, ordenado), `networks` (idem), `minPriceEth?`, `maxPriceEth?`, `page`, `pageSize=9` (fixo).

```ts
type NftSummaryDto = { id: string /* slug */; title: string; collectionId: CollectionId; networkId: NetworkId;
  priceEth: string /* decimal */; image: { src: string; width: number; height: number }; rarity: 'common' | 'rare';
  listedAt: string /* ISO */; popularity: number /* inteiro */; version: number /* inteiro, p/ F7 */ };
type CatalogPageDto = { items: NftSummaryDto[]; page: number; pageSize: number; totalItems: number; totalPages: number;
  facets: { collections: { id: CollectionId; count: number }[]; networks: { id: NetworkId; count: number }[];
            priceRange: { minEth: string; maxEth: string } } };
```

- Facetas **disjuntivas**: a contagem de coleções aplica todos os filtros menos `collections`; a de redes, todos menos `networks`. `priceRange` vem do catálogo inteiro.
- Erros só com código, sem texto: `{ code: 'validation_failed', fieldErrors? }` 400; `{ code: 'service_unavailable' }` 503; `{ code: 'internal_error' }` 500. Falha de rede vira `ApiError{ code: 'network_error' }` no adaptador; resposta fora do schema vira `invalid_response`. `ApiError = { status: number | null; code; transient: boolean; fieldErrors? }`; `transient` vale para 503, `network_error` e 500.

### 3.3 `GET /api/highlights`

`{ hero: NftSummaryDto[] /* exatamente 3 */; featured: NftSummaryDto }`. Recurso separado: não depende dos filtros e mantém estável a chave da lista.

### 3.4 Domínio e UI

DTO → domínio no adaptador: `NftSummary { id; title; collectionId; networkId; price: EthAmount /* string validada */; image; rarity; listedAt }`. A UI recebe `NftCardViewModel { id; title; priceLabel; image: { src; alt }; href; isRare }`; `priceLabel = t('shared:eth.amount', { amount: formatEthAmount(price, locale) })`, que só manipula string (nunca `Number`).

### 3.5 Cache, cancelamento e chaves (ADR-20)

- `nftKeys.list(viewer, query) = ['nfts','list',{ viewer },normalizedQuery]`; `viewer = 'anonymous'` até F2. Idioma fora da chave (Q5).
- `queryFn: ({ signal }) => fetchCatalogPage(query, signal)`; troca de parâmetro aborta a requisição.
- `staleTime` 30 s; `retry` só para `transient`, no máximo 1, `retryDelay` 300 ms; `placeholderData: keepPreviousData` com `aria-busy="true"`; skeleton só sem dado.

### 3.6 MSW (só em `src/mocks`)

| Cenário | Comportamento |
|---|---|
| `default` | latência fixa de 120 ms (sem aleatoriedade) |
| `catalog-empty` | 200 com `items: []`, `totalItems: 0`, facetas zeradas |
| `catalog-error` | 503 `service_unavailable` sempre |
| `catalog-flaky` | as 2 primeiras requisições a `/api/nfts` devolvem 503; depois 200 |
| `catalog-slow` | 1500 ms em `/api/nfts` e `/api/highlights` |
| `catalog-out-of-order` | 1ª requisição após a carga inicial leva 1200 ms; as seguintes, 100 ms |

Seleção por `localStorage['jg:mocks:scenario']` (lido só por `mocks/scenario.ts`; desconhecido vira `default`); testes usam `page.addInitScript`. Reset implícito por contexto novo (catálogo é só leitura); persistência e reset completos em F1. Ativação por `VITE_ENABLE_MOCKS=true`, inclusive no build (`.env.production`).

Fixtures (45 NFTs): slugs únicos `^[a-z0-9-]+$`; 9 coleções (`digital-art, photography, music, 3d-art, collectibles, generative, gaming, memberships, utility`) e 3 redes com ≥ 2 itens cada; 6 raros; preços de `0.000000000000000001` a `12.30`, incluindo `1.19`, `1.10`, `0.02`; nomes do Figma presentes (Emerald Ape #042 = 1.19, Sage Nomad #009 = 1.69, Neon Vessel #552 = 1.99, Cosmic Bloom #118, Violet Nomad #314, Ivory Baron #088, Golden Beat #207, Golden Signal #160); imagens da Q13; 5 páginas com `pageSize` 9.

### 3.7 Rotas stub

`/nfts/$nftId`, `/login` e `/cart` renderizam no lugar `UnavailablePage` com a feature (`nft-detail`, `auth`, `cart`), sem redirecionar. `/unavailable?feature=<id>` usa a whitelist `creators|learn|auth|nft-detail|cart|favorites|journal|newsletter|footer|social|scan`; id desconhecido mostra mensagem genérica. Rota inexistente cai no `notFoundComponent` com link para `/`. Sem eventos Socket.IO nesta feature.

### 3.8 i18n

Namespaces por slice em `config/locales/{pt-BR,en}.ts`: `shared, header, footer, bottomNav, hero, catalog, filters, search, sort, viewTabs, nft, collection, featured, banners, journal, language, pageHome, pageUnavailable, pageNotFound`. `en` tipado `satisfies LocaleShape<typeof ptBR>`; teste de paridade confere chaves e `{{placeholders}}`. Prioridade: `jg:locale` salvo, `navigator.languages` por prefixo, `pt-BR`. `useDocumentMeta` define `<html lang>`, `<title>` e `meta description` por rota. Conteúdo editorial do catálogo (título) é dado do mock em pt-BR, não mensagem (limitação registrada).

## 4. Aceite

| # | Critério observável | Teste |
|---|---|---|
| A1 | Lint reprova imports contra FSD, deep import, domínio com framework e literais em JSX; limites ativos | 3, 4, 5 |
| A2 | Paridade de chaves e placeholders pt-BR/en | 2 |
| A3 | `<html lang>` e `<title>` corretos e traduzidos; troca sem reload, persistida | 6, 7, 35 |
| A4 | ETH string decimal fim a fim; 18 casas exatas; pt-BR "1,19 ETH", en "1.19 ETH" | 9, 10, 12, 16, 22 |
| A5 | Contrato `GET /api/nfts`: parâmetros, DTO validado, erros por código, cancelamento por `signal` | 12-17 |
| A6 | Listagem com 9 cards, contagem anunciada, título leva a `/nfts/<slug>` | 22 |
| A7 | URL como fonte: filtros combináveis, ordenação, abas, busca, paginação, histórico, refresh, `page` reiniciado, params inválidos normalizados | 18, 19, 23-28 |
| A8 | Resposta obsoleta nunca aparece | 29 |
| A9 | Skeleton com shimmer, sem CLS, sem animação com movimento reduzido | 30 |
| A10 | Vazio com "Limpar filtros"; erro traduzido com "Tentar novamente" e recuperação | 31, 32 |
| A11 | Atualização em segundo plano com `aria-busy` e dados anteriores visíveis | 33 |
| A12 | Hero manual sem autoplay; destaque com link | 34 |
| A13 | Teclado, foco visível, Sheet com foco preso e retorno, labels | 36, 38 |
| A14 | Layout 1440/768/390 sem overflow horizontal (e reflow em 320) | 37 |
| A15 | 404, `/unavailable` e stubs coerentes, sem simular sucesso | 8 |
| A16 | Medidas do Figma nos widgets (ADR-08) e desvios da captura pelo CLI listados | 39, 40 |
| A17 | `RangeSlider` anuncia o valor formatado (`aria-valuetext`) | 23a, 24 |
| A18 | Build de demonstração com mocks ativos; acesso direto e refresh funcionam | 41, 42, 43 |

## 5. Testes RED (um por vez, menor para maior; RED → GREEN, cada um em commit próprio)

**V** ✔ = entra no `verify` cotidiano (Vitest em `test`; E2E em `test:e2e`). Projetos Playwright: `desktop-1440` (1440×900), `tablet-768` (768×1024, só specs `@tablet`) e `mobile-390` (390×844), Chromium, `locale 'pt-BR'`, `trace 'retain-on-failure'`, relatório HTML, `forbidOnly`, `webServer` com `vite` e `VITE_ENABLE_MOCKS=true`, **sem `toHaveScreenshot`**. O projeto Vitest `node` do app inclui `src/**/*.node.test.ts`.

### M1: shell, i18n e lint
Pronto: `lint typecheck test` verdes; `/` renderiza o layout com i18n; `design.md` §10 corrigido; dependências instaladas e registradas (ADR-16, 17, 21).

| # | Teste | Arquivo | Tipo | VP | V |
|---|---|---|---|---|---|
| 1 | `resolveLocale`: salvo > `navigator.languages` por prefixo > `pt-BR` | `src/shared/lib/i18n/resolve-locale.node.test.ts` | unit | — | ✔ |
| 2 | Paridade pt-BR/en: mesmas chaves e `{{x}}` em todos os namespaces | `src/app/i18n/locales-parity.node.test.ts` | unit | — | ✔ |
| 3 | Lint FSD: shared→entities, entities→features, feature→feature, deep import, `react`/`axios`/`@tanstack/*` em `model/domain`, `mocks` fora de `app/bootstrap` dão erro; import por `index.ts` passa | `apps/web/tests/lint-fsd.node.test.ts` | unit (API do ESLint) | — | ✔ |
| 4 | Lint i18n: JSXText com letra, `aria-label`/`alt`/`placeholder`/`title` literais e template em JSX dão erro; glifo sem letra passa; testes isentos mantêm o `no-restricted-syntax` de `.only/.skip` | `apps/web/tests/lint-i18n.node.test.ts` | unit | — | ✔ |
| 5 | Lint de qualidade: complexidade 11, profundidade 4, 4 parâmetros, função de 81 linhas, arquivo de 201 linhas, `any`, `as X` dão erro; `as const` passa | `apps/web/tests/lint-quality.node.test.ts` | unit | — | ✔ |
| 6 | `AppProviders`: `<html lang>` segue o idioma; trocar atualiza texto e `lang` sem remontar e grava `jg:locale` | `src/app/providers/AppProviders.test.tsx` | integração (Vitest browser) | 1440 | ✔ |
| 7 | Shell: landmarks banner/main/contentinfo, skip link leva o foco ao `main`, `lang="pt-BR"` e título pt; com `locale 'en-US'` → `lang="en"` e título en | `e2e/shell.spec.ts` | E2E | 1440, 390 | ✔ |
| 8 | Rotas: `/rota-x` mostra 404 com link para `/`; `/unavailable?feature=creators` mostra mensagem e link de volta; `/login`, `/cart` e `/nfts/emerald-ape-042` mostram "não disponível" mantendo a URL; feature desconhecida mostra o genérico | `e2e/routes.spec.ts` | E2E | 1440, 390 | ✔ |

### M2: shared/api, MSW e contrato
Pronto: contrato validado por zod nos dois lados; handlers testados com `msw/node`; worker registrado no dev (ADR-16, 18, 19, 22).

| # | Teste | Arquivo | Tipo | V |
|---|---|---|---|---|
| 9 | `parseEth`/`compareEth`: válidos (`0`, `1.19`, `12.30`, `0.000000000000000001`) e inválidos (`1e3`, `-1`, `.5`, `1.`, `1,5`, 19 casas); `1.10 == 1.1`; `0.1 > 0.09`; ida e volta canônica | `src/shared/lib/eth/eth.node.test.ts` | unit | ✔ |
| 10 | `formatEthAmount`: pt-BR `1,19`, en `1.19`; 18 casas preservadas; milhar; o fonte não usa `Number(`/`parseFloat` | `src/shared/lib/eth/format-eth.node.test.ts` | unit | ✔ |
| 11 | `ethToSteps('12.30','0.01') = 1230`, `stepsToEth(2,'0.01') = '0.02'`; arredondamento piso/teto | `src/shared/lib/eth/eth-steps.node.test.ts` | unit | ✔ |
| 12 | Schemas zod aceitam DTO válido; rejeitam `priceEth` numérico, decimal inválido, slug desconhecido, `hero` com ≠ 3 itens | `src/shared/api/contracts/nfts.node.test.ts` | unit | ✔ |
| 13 | `httpClient`: 503 → `service_unavailable` transitório; 400 → não transitório com `fieldErrors`; rede → `network_error`; abort identificável | `src/shared/api/http-client.node.test.ts` | integração (`msw/node`) | ✔ |
| 14 | `queryCatalog` (puro): busca sem diferenciar maiúsculas em título e coleção; OR na dimensão e AND entre dimensões; preço inclusivo por bigint; `view`; 4 ordenações; `page` limitado; facetas disjuntivas; `priceRange` | `src/mocks/catalog/query-catalog.node.test.ts` | unit | ✔ |
| 15 | Fixtures: ≥ 40 itens, slugs únicos, toda coleção e rede com ≥ 2, ≥ 3 raros, preços válidos, imagens existem em `public/` | `src/mocks/fixtures/nfts.node.test.ts` | unit | ✔ |
| 16 | `fetchCatalogPage(query, signal)`: query string esperada; DTO vira domínio com `price` string; DTO inválido vira `invalid_response`; `signal` abortado rejeita | `src/entities/nft/api/fetch-catalog-page.node.test.ts` | integração (`msw/node`) | ✔ |
| 17 | `readScenario`: whitelist; desconhecido ou ausente → `default` | `src/mocks/scenario.node.test.ts` | unit | ✔ |

### M3: entidade e lista
Pronto: a Home lista a página 1 do cenário `default` nos dois viewports.

| # | Teste | Arquivo | Tipo | VP | V |
|---|---|---|---|---|---|
| 18 | `normalizeCatalogSearch`: defaults omitidos, arrays sem duplicatas e ordenados, inválidos descartados, `min > max` descarta os dois, `q` com trim | `src/entities/nft/model/domain/catalog-query.node.test.ts` | unit | — | ✔ |
| 19 | `withFilterChange` zera `page`; `toApiParams` mapeia `q→search`, `tab→view`, `min→minPriceEth` | idem | unit | — | ✔ |
| 20 | `nftKeys.list`: mesma chave para arrays em ordem diferente e default explícito × omitido; chave distinta por parâmetro e por `viewer` | `src/entities/nft/model/nft-keys.node.test.ts` | unit | — | ✔ |
| 21 | `toCardViewModel`: `href` `/nfts/<id>`, `priceLabel` por idioma, `alt` traduzido, `isRare` | `src/entities/nft/model/to-card-view-model.node.test.ts` | unit | — | ✔ |
| 22 | Sucesso: 9 cards; 1º "Emerald Ape #042" com "1,19 ETH"; `status` anuncia "45 NFTs"; link do título leva a `/nfts/emerald-ape-042`; com `?sort=price-asc` o 1º preço é "0,000000000000000001 ETH" | `e2e/home-catalog.spec.ts` | E2E | 1440, 390 | ✔ |

### M4: filtros e URL
Pronto: o fluxo §9.1 passa.

| # | Teste | Arquivo | Tipo | VP | V |
|---|---|---|---|---|---|
| 23a | **DS:** `RangeSlider` exige `getValueText` (RED de tipo, `@ts-expect-error` no `typetest`) e cada thumb expõe `aria-valuetext` com o texto recebido (inglês no teste de repasse); stories e testes existentes passam a fornecê-lo; baselines intactas | `packages/design-system/src/primitives/range-slider/RangeSlider.test.tsx` + `tests/ui-text-props.typetest.tsx` | unit (browser) + tipo | 1440 | ✔ |
| 23 | Coleção + rede combinadas: URL `?collections=digital-art&networks=polygon`; contagens da API; partindo de `?page=2`, `page` volta a 1. Em 390, via botão de filtros (Sheet) e "Aplicar" | `e2e/home-filters.spec.ts` | E2E | 1440, 390 | ✔ |
| 24 | Faixa de preço por teclado (setas nos thumbs) e Aplicar: URL `min`/`max` como strings decimais; todos os preços visíveis dentro da faixa; `aria-valuetext` "12,30 ETH"; rótulo "Preço: 0,02 - 12,30 ETH" | idem | E2E | 1440, 390 | ✔ |
| 25 | Ordenação por teclado no Select: `?sort=price-desc`; 1º card é o mais caro; em 390, dentro do Sheet | `e2e/home-sort-tabs.spec.ts` | E2E | 1440, 390 | ✔ |
| 26 | Abas por setas: `?tab=new`, conjunto conforme a fixture, página reiniciada | idem | E2E | 1440, 390 | ✔ |
| 27 | Busca: desktop, botão com `aria-expanded` abre o campo e Enter submete; mobile, campo direto: `?q=nomad` mostra só nomes com "Nomad"; limpar remove o param; Esc fecha o campo e devolve o foco | `e2e/home-search.spec.ts` | E2E | 1440, 390 | ✔ |
| 28 | Paginação e histórico: `page=2` traz itens distintos e o foco vai ao título dos resultados; voltar restaura a página 1 e os filtros; refresh mantém; `?page=999` vira a última (replace); `?tab=foo&page=-3` vira `/` sem erro | `e2e/home-url-history.spec.ts` | E2E | 1440, 390 | ✔ |
| 29 | Fora de ordem (`catalog-out-of-order`): marcar A (lenta) e depois B (rápida); quando A terminar, a grade continua a de B e a URL é a de B | `e2e/home-out-of-order.spec.ts` | E2E | 1440, 390 | ✔ |

### M5: estados
Pronto: fluxo §9.12; união de estados exaustiva (`assertNever`).

| # | Teste | Arquivo | Tipo | VP | V |
|---|---|---|---|---|---|
| 30 | Skeleton (`catalog-slow`): região com `aria-busy="true"` e status "Carregando" traduzido; 9 skeletons; `animation-name` ≠ `none`; altura do skeleton igual à do card (±1 px); com `reducedMotion 'reduce'`, animação `none` | `e2e/home-states.spec.ts` | E2E | 1440, 390 | ✔ |
| 31 | Vazio (`catalog-empty` e `?q=zzz`): título e texto; "Limpar filtros" leva a `/` | idem | E2E | 1440, 390 | ✔ |
| 32 | Erro: `catalog-error` mostra `role=alert` traduzido e "Tentar novamente" focável; tentar de novo mantém o erro. `catalog-flaky`: erro e, após tentar de novo, sucesso. Mesma mensagem em en | idem | E2E | 1440, 390 | ✔ |
| 33 | Atualização em segundo plano (`catalog-slow` após a carga): mudar filtro mantém os cards anteriores com `aria-busy="true"`; depois `false` e novos cards; sem skeleton | idem | E2E | 1440, 390 | ✔ |
| 34 | Destaques: hero com 3 botões de ponto ("Destaque 2 de 3") com `aria-current`; clique troca a imagem; com `page.clock`, avançar 30 s não troca; destaque lateral (1440) linka para o detalhe; "Explorar" leva o foco a `#catalog` | `e2e/home-highlights.spec.ts` | E2E | 1440, 390 | ✔ |

### M6: layout responsivo, i18n, a11y e fidelidade
Pronto: testes verdes em todos os projetos; relatório da captura pelo CLI anexado à seção Execução.

| # | Teste | Arquivo | Tipo | VP | V |
|---|---|---|---|---|---|
| 35 | Idioma: seletor troca pt-BR para en; `lang`, título, navegação, abas, ordenação, coleções e "1.19 ETH" mudam; reload mantém en; primeiro acesso com `en-US` abre em en | `e2e/home-i18n.spec.ts` | E2E | 1440, 390 | ✔ |
| 36 | Teclado: ordem de Tab (skip, navegação, busca, filtros, abas, ordenação, cards, paginação, rodapé); foco visível (`outline-style` ≠ `none`); Sheet de filtros com foco preso, Esc fecha e devolve o foco; todo checkbox, slider e campo com nome acessível | `e2e/home-a11y.spec.ts` | E2E | 1440, 390 | ✔ |
| 37 | Layout `@tablet`: 1440 tem sidebar e grade de 3 colunas; 768 tem botão de filtros e 2 colunas, sem barra inferior; 390 tem campo de busca, botão de filtros, 2 colunas e barra inferior; nos três `scrollWidth ≤ clientWidth`; em 320 sem overflow horizontal | `e2e/home-layout.spec.ts` | E2E | 1440, 768, 390 | ✔ |
| 38 | axe sem violações na Home carregada, no vazio, no erro e com o Sheet aberto | `e2e/home-axe.spec.ts` | E2E | 1440, 390 | ✔ |
| 39 | Medidas (ADR-08) de header, hero, sidebar, toolbar, grade (gaps) e barra inferior, com o valor lido do nó em `docs/figma/file.json` (`2:2`/`14:5226`) e citação de `arquivo:linha`; valor ausente vira Lacuna, não palpite | `src/widgets/*/ui/*.measure.test.tsx` | integração (Vitest browser) | 1440 / 390 | ✔ |
| 40 | **Opcional, só a pedido do usuário** (imagens custam tokens; a fidelidade vem do item 39, determinístico). Inspeção, não é teste: `pnpm --filter @jg/web exec playwright screenshot --viewport-size=1440,900 --full-page http://localhost:5173/ <scratchpad>/home-1440.png` (e `390,844`, `768,1024`; conferir flags com `--help`); comparar com `docs/figma/screens/2-2_*.png` e `14-5226_*.png`; cada desvio vira item (elemento, esperado, observado) | — | CLI | 1440, 768, 390 | ✘ |

### M7: build de demonstração e deploy (§12) — ADIADO PARA F9 (decisão do usuário, 2026-10-22: deploy só com o projeto inteiro finalizado; o enunciado segue exigindo o deploy público no fechamento)
Pronto: `build` com mocks ativos; acesso direto e refresh funcionam no preview; pronto para publicar. A **publicação** exige a conta do usuário (Vercel recomendada pelo enunciado) e fica para o fechamento (F9) ou quando o usuário a fizer.

| # | Teste | Arquivo | Tipo | VP | V |
|---|---|---|---|---|---|
| 41 | Config de deploy: `vercel.json` com rewrite SPA de qualquer caminho para `/index.html`; `.env.production` define `VITE_ENABLE_MOCKS=true`; `build` e `preview` existem no `package.json`; `dev:mocks` ativa os mocks | `apps/web/tests/deploy-config.node.test.ts` | unit | — | ✔ |
| 42 | Sobre o build de preview (mocks do build, sem dev server): acesso direto e refresh em `/`, `/nfts/emerald-ape-042` e `/rota-x` (404) funcionam; o catálogo carrega dos handlers MSW | `e2e/preview.spec.ts` (`@preview`) | E2E | 1440, 390 | ✔ |
| 43 | Scripts: `pnpm --filter @jg/web dev:mocks`, `preview` e `test:e2e` existem e rodam; evidência colada | — | verificação | — | ✘ |

Scripts em `apps/web/package.json`: `dev:mocks`, `preview`, `test:e2e`; no `turbo.json`, `test:e2e` com `dependsOn: ["^build"]` e entrada no `verify` da raiz. Se `test:e2e` + `build` exceder o tempo razoável do `verify`, registrar a medição e decidir sem relaxar timeout.

## 6. Riscos e lacunas remanescentes

- **R1:** `msw/node` pode não interceptar o Axios 1.20 nessa configuração; fallback: Vitest browser com `setupWorker` (não verificado).
- **R2:** se o abort não propagar pelo service worker, o teste 29 continua válido (afirma a UI).
- **R3:** as contagens do Figma (33, 12, 65… e 119/78/86) são ilustrativas e inconsistentes entre si; fixtures têm 45 itens; desvio registrado.
- **R4:** assinaturas do TanStack Router e Query (`getRouteApi`, `keepPreviousData`, `notFoundComponent`) devem ser confirmadas nos tipos instalados antes do GREEN (`grounding.md`).
- **R5:** sem Docker, a regressão visual das páginas depende da decisão pendente do usuário sobre baselines locais (ADR-15); a Home não cria baselines.
- **R6:** a obtenção das imagens pela API do Figma depende do token do `.env` e do alcance dos image fills (Q13); falha vira lacuna registrada.
- **R7:** de 768 a 1439 px vale o layout tablet; o Lighthouse desktop emula ~1350 px (Q16).

## 7. Fora do escopo

Login, cadastro, sessão e interceptors (F2); detalhe, favoritos (F4); carrinho e contador real (F5); checkout e pedidos (F6); Socket.IO e `nft.updated` (F7); perfil e carteiras (F8); persistência e reset completos dos mocks, demais cenários do §6 e spike do socket (F1); páginas editoriais e de suporte, newsletter funcional, login social; regressão visual com baselines, snapshots de DOM consolidados, Lighthouse e README completo (F9); publicação do deploy; `Accept-Language`; qualquer componente novo no DS além do `getValueText`.

## 8. Decisões para ARCHITECTURE.md (ADR-16 em diante; o ADR-15 já está registrado)

**ADR-16 Stack de rotas, dados e mocks do app.** Contexto: enunciado §2/§4 exige Router, Query, Axios e MSW; `@mswjs/socket.io-binding@0.2.0` declara peer `msw ^2.10.2`. Decisão: `@tanstack/react-router 1.170.45` com árvore de código; `@tanstack/react-query 5.104.5`; `axios 1.20.0`; `msw` 2.x fixado; `zod 4.6.7` na borda; mocks em `src/mocks`, fora do FSD, importados só por `app/bootstrap` e ativados por `VITE_ENABLE_MOCKS`. Descartado: MSW 3.x (quebra o binding de Socket.IO), plugin de geração de rotas, guards manuais no lugar do zod. Consequência: atualizar o MSW exige reavaliar o binding em F1.

**ADR-17 i18n do app.** `i18next 26.5.5` + `react-i18next 17.1.2`; namespaces por slice em TS, `en` tipado pelo shape do pt-BR, teste de paridade de placeholders; detecção própria (salvo, `navigator.languages`, pt-BR); idioma em estado, sem URL; `useDocumentMeta` controla `lang`, `title` e `description`; conteúdo editorial não localizado e idioma fora da `queryKey`. Descartado: `react-intl`, Lingui, `i18next-browser-languagedetector`. Consequência: localizar conteúdo em F4 exige pôr o `locale` na chave e enviar `Accept-Language`.

**ADR-18 ETH em bigint com helpers próprios.** `shared/lib/eth`: parse e validação por regex, comparação em bigint de 18 casas, formatação por idioma só por string, slider em passos inteiros (`ethToSteps`/`stepsToEth`). Descartado: biblioteca decimal; slider em `number` de ETH (passa por float). Consequência: carrinho e cotação (F5) reutilizam o módulo.

**ADR-19 Contrato do catálogo.** `GET /api/nfts` (busca, `view`, `sort`, coleções, redes, preço em string, `page`, `pageSize` 9) com facetas disjuntivas e `priceRange`; `GET /api/highlights`; erros só por código; slugs estáveis; semântica de `view` no servidor simulado. Descartado: contagens fixas no front, texto em erro, destaques dentro da listagem. Consequência: a UI traduz todos os códigos; contagens do Figma registradas como ilustrativas.

**ADR-20 Política de cache do catálogo.** Chave `['nfts','list',{ viewer },query]` com `viewer='anonymous'` até F2; `staleTime` 30 s; retry só em erro transitório, máx. 1, 300 ms; `keepPreviousData` com `aria-busy`; skeleton só sem dado; `signal` ao Axios. Descartado: skeleton a cada troca de filtro, retry em 4xx. Consequência: F2 troca o `viewer` e limpa o cache no logout.

**ADR-21 Lint de FSD, i18n e qualidade sem plugins.** Regras do núcleo e do typescript-eslint com os limites numéricos acima. Descartado: `eslint-plugin-react` (peer só até ESLint ^9.7), `eslint-plugin-i18next` (sem compatibilidade declarada com ESLint 10), `eslint-plugin-boundaries`. Consequência: guardas provadas por testes da API do ESLint, como no ADR-14.

**ADR-22 Cenários MSW determinísticos.** Cenário por `localStorage['jg:mocks:scenario']` (lido só pela camada de mocks, injetado nos E2E por `addInitScript`); latências fixas; "fora de ordem" por ordem de chegada; falha temporária nas N primeiras requisições. Descartado: `delay()` realista do MSW (aleatório), cenário na URL do app. Consequência: F1 acrescenta reset e persistência sobre o mesmo seletor.

**ADR-23 Rotas stub para destinos futuros.** `/nfts/$nftId`, `/login` e `/cart` renderizam no lugar "não disponível", mantendo a URL final, sem redirecionar. Descartado: redirecionar para `/unavailable` (quebra o voltar e o link direto). Consequência: F2, F4 e F5 só trocam o componente.

**ADR-24 Build de demonstração com mocks e SPA fallback.** `.env.production` com `VITE_ENABLE_MOCKS=true`; `vercel.json` com rewrite para `/index.html`; E2E sobre o build de preview. Descartado: mocks só em dev (viola §6/§12). Consequência: o deploy público exibe os mocks e as rotas diretas funcionam.

**Desvios do Figma a registrar:** separador decimal (Q3), skip link, preço riscado omitido, card sem título não replicado, contagens ilustrativas, cópia do hero por breakpoint (Q9), layout tablet derivado (Q11), mobile sem frame abaixo da dobra (Q12). A interface não oferece seletor de idioma por decisão posterior do usuário (2026-10-23).

## Progresso

M1
- [x] 1 `resolveLocale`: RED `b562e22` (9 falhas por asserção, esperado en recebido pt-BR), GREEN (19/19; node 24/24; typecheck e lint limpos)
- [x] 2 paridade pt-BR/en: RED `adb28bb` (6 falhas por asserção), GREEN (8/8; node 32/32; typecheck e lint limpos)
- [x] 3 lint FSD: RED `97489b9` (40 falhas por asserção), GREEN (91/91 node do app; lint do DS e lint-boundary 21/21; typecheck e lint limpos). Limitação: regras casam só imports relativos e profundidade até 5 pastas; estender se o app adotar alias
- [x] 4 lint i18n: RED `f840e7d` (10 falhas por asserção), GREEN (node 114/114; lint do DS e lint-boundary/test-hygiene 57/57; typecheck e lint limpos)
- [x] 5 lint de qualidade: RED `35461f3` (10 falhas por asserção) + correção do teste (off-by-one em `functionOfLines`; caso `switch-exhaustiveness-check` retirado por ser type-aware e inviável com `lintText` de arquivos virtuais: exaustividade fica por `assertNever` + `tsc`, desvio do ADR-21), GREEN (node 133/133; typecheck, lint do app e do DS limpos; lint-boundary/test-hygiene 57/57)
- [x] 6 `AppProviders` e idioma: RED `6f4c6cd` (5 falhas por ausência do comportamento), GREEN (5/5; app 167/167; typecheck e lint limpos). Desvio: `i18next.d.ts` (CustomTypeOptions) adiado para os namespaces reais; chaves tipadas passam a ser exigidas quando houver o primeiro namespace (item 7)
- [x] 7 shell E2E: RED `1ec9bf5` (8 falhas: locator ausente, título e lang errados; servidor de pé), GREEN (E2E 8/8 em 1440 e 390 pelo CLI; app 175/175; typecheck, lint e build limpos; no-docker 9/9). Desvios: `use-document-meta` em `shared/hooks` (lint proíbe react em `shared/lib`); chaves tipadas (CustomTypeOptions) adiadas para o item 7b
- [x] 7b chaves de i18n tipadas: RED `4af4a83` (3× TS2578; AppProviders.test e locales-parity ajustados por dependerem de namespace inexistente/indexação por string, mesmo comportamento), GREEN (`i18next.d.ts`; typecheck/lint limpos; app 175/175; build ok; E2E shell 8/8). Nota: `defaultNS` tipado como união dos namespaces (só tipagem)
- [x] 8 rotas stub, 404 e `/unavailable` E2E: RED `c3c4e16` (22 falhas: heading não encontrado e link de volta ausente), GREEN (E2E rotas+shell 30/30 em 1440 e 390; app 179/179; typecheck, lint e build limpos). Textos inventados pelo code-writer a conferir: meta descriptions, corpo do 404 e rótulos de favorites/journal/newsletter/footer/social/scan
- [x] Docs M1: `design.md` §10 corrigido; ADR-16 (parcial, completa no M2), ADR-17 e ADR-21 em `ARCHITECTURE.md`; dependências do M1 instaladas (commit `361cd07`)

M2
- [x] 9 `parseEth`/`compareEth`/`toWei`: RED `89c970d` (29 falhas por asserção), GREEN (node 195/195; typecheck e lint limpos; sem Number/parseFloat/toFixed)
- [x] 10 `formatEthAmount`: RED `e94d650` (21 falhas por asserção com o item 11), GREEN (node 226/226; typecheck e lint limpos)
- [x] 11 `ethToSteps`/`stepsToEth`: RED `e94d650`, GREEN (junto do 10)
- [x] 12 schemas zod: RED `4b3c810` (21 falhas por asserção), GREEN (node 252/252; typecheck e lint limpos). Desvios: ids de coleção/rede em `shared/api/contracts/ids.ts` (shared não importa de entities); `hero` inferido como array (`.length(3)`), não tupla
- [x] 13 `httpClient`: RED `4ec5b15` (10 falhas por asserção; contrato de `getJson` ajustado para objeto de requisição por causa do max-params 3; msw/node intercepta o Axios, R1 descartado), GREEN (node 263/263; typecheck e lint limpos)
- [ ] 14 `queryCatalog`
- [ ] 15 invariantes das fixtures (inclui imagens, Q13)
- [ ] 16 `fetchCatalogPage`
- [ ] 17 `readScenario`

M3
- [ ] 18 `normalizeCatalogSearch`
- [ ] 19 `withFilterChange` e `toApiParams`
- [ ] 20 `nftKeys`
- [ ] 21 `toCardViewModel`
- [x] 22 sucesso E2E: E2E 8/8 (desktop-1440 e mobile-390; suíte e2e completa 38/38), typecheck e lint limpos, node 368/368, browser 375/375. Ver Execução

M4
- [x] 23a DS `RangeSlider.getValueText`: GREEN `6a222db` (DS 991/991, typecheck e lint limpos; usos antigos, stories e teste 'desabilitado' passam a fornecer getValueText)
- [x] 23 filtros combinados E2E: GREEN `f0b2e02` (desktop-1440 e mobile-390 verdes)
- [ ] 24 faixa de preço E2E: implementação GREEN `f0b2e02`, mas o teste falha por defeito do próprio teste (ver Execução M4); comportamento validado com cópia temporária corrigida (2/2)
- [x] 25 ordenação E2E: GREEN `0a36832`
- [x] 26 abas E2E: GREEN `0a36832`
- [x] 27 busca E2E: GREEN (6/6)
- [ ] 28 paginação e histórico E2E: GREEN `7810968` (3 dos 4 testes; "voltar restaura..." falha por corrida no próprio teste, ver Execução M4)
- [x] 29 fora de ordem E2E: verde com 25/26 (`7810968`)

M5
- [x] 30 skeleton E2E (regressão: já passava no RED)
- [x] 31 vazio E2E: RED cfb8243, GREEN (link "Limpar filtros" no estado vazio, i18n pt-BR/en; spec 18/18; typecheck, lint e node 400/400 limpos)
- [x] 32 erro e retry E2E (regressão: já passava no RED)
- [x] 33 atualização em segundo plano E2E (regressão: já passava no RED)
- [x] 34 destaques E2E: RED `c6c3187`, GREEN (spec 24/24; suíte E2E 62/62; node+browser 378/378; typecheck e lint limpos). Ver Execução

M6
- [x] 35 i18n E2E (regressão: já passava)
- [x] 36 teclado e foco E2E
- [x] 37 layout responsivo E2E
- [x] 38 axe E2E
- [x] 39 medidas do Figma: GREEN (22 correções no código, 6 desvios documentados na seção Execução; measure 68 passed/8 todo; app 469 passed; DS 991 passed; E2E 138 passed + 1 falha de partida a frio em shell.spec mobile que passou ao reexecutar, 8/8)
- [ ] 40 inspeção por captura do CLI (relatório de desvios)

M7
- [ ] 41 config de deploy
- [ ] 42 preview E2E
- [ ] 43 scripts `dev:mocks`, `preview`, `test:e2e`
- [ ] Docs finais: ADR-18/19/20/22/23/24, desvios do Figma, README raiz (comandos)

## Execução

### M1: shell, i18n e lint (concluído, aguardando revisão)

Itens 1–8 e 7b executados em RED→GREEN com commit próprio (hashes no Progresso). Verificação final do marco (`pnpm verify` na raiz, local, sem Docker, 9/9 tarefas, 80 s): DS 73 arquivos / 989 testes, app 12 arquivos / 179 testes, E2E 30 passed nos projetos desktop-1440 e mobile-390 (shell e rotas, pelo Playwright CLI), typecheck, lint e build limpos. Nenhum E2E de tablet-768 neste marco (sem specs @tablet).

Desvios do plano no M1:
- **Versões de i18n:** `i18next 26.4.6` e `react-i18next 17.0.20` no lugar de 26.5.5 e 17.1.2 (as novas violam `minimumReleaseAge`; sem exceção à política). ADR-17.
- **Lint:** `switch-exhaustiveness-check` fora (type-aware, inviável com `lintText` de arquivos virtuais); exaustividade por `assertNever` + `tsc`. Regras de camada casam só imports relativos e até 5 pastas de profundidade. ADR-21.
- **Item 5:** o teste foi corrigido após o GREEN (off-by-one em `functionOfLines`; caso type-aware retirado) com commit próprio (`578be21`).
- **Item 7b adicionado** (chaves de i18n tipadas, exigência de `.AI/standards/i18n-quality.md`); `AppProviders.test` e `locales-parity` ajustados por dependerem de namespace inexistente.
- `use-document-meta` em `shared/hooks` (o lint proíbe React em `shared/lib`) e `SkipLink` em `shared/ui`.
- **A conferir:** textos criados pelo code-writer no item 8 (meta descriptions, corpo do 404, rótulos de favorites/journal/newsletter/footer/social/scan).
- **Dívida anterior:** 78 arquivos fora do Prettier no repositório (`pnpm format:check`), fora do `verify`.
- **Aviso:** na primeira execução com cache frio, `App.test.tsx` falhou uma vez com "Invalid hook call" (reotimização de dependências do Vitest); não reproduziu nas execuções seguintes. Vigiar.


### M2/M3: itens GREEN em andamento

- **Item 15 (fixtures):** `apps/web/src/mocks/fixtures/nfts.ts` (45 itens, tabela de linhas mais um construtor). **Desvio/Lacuna (imagens):** o Figma tem só 4 image fills distintos; os 37 itens sintéticos (nomes e slugs inventados, p.ex. `amber-fox-021`) usam, cada um, uma cópia em `public/nfts/<slug>.webp` de um dos 8 WebP existentes (rotação por índice), pois o teste exige `/nfts/<id>.webp` existente. Preços dos itens do Figma sem valor no plano (Cosmic Bloom 0.85, Violet Nomad 2.40, Ivory Baron 3.15, Golden Beat 0.45, Golden Signal 0.75) e quais itens são raros (índices 2, 6, 12, 19, 28, 36) foram escolhidos pelo code-writer: o Figma/plano não os definem. Extremos `0.000000000000000001` e `12.30`, mais `1.10` e `0.02`, estão em itens sintéticos.
- **Item 21 (toCardViewModel):** criado o namespace `nft` (`entities/nft/config/locales`, exportado por `entities/nft/index.ts` como `nftLocales`, registrado em `app/i18n/resources.ts` e `i18next.d.ts`) com `nft:image.alt = {{title}}`, e `shared:eth.amount = {{amount}} ETH` nos dois idiomas. `CatalogSearch.collections/networks` são `readonly` (o teste do item 20 passa tuplas `as const`). `CatalogQuery` é redeclarado no domínio (`catalog-query.ts`), pois `entities` não pode importar `mocks`; é estruturalmente igual ao de `mocks/catalog`.

- **Item 22 (GREEN da Home visível):** MSW (`mocks/handlers/{catalog,highlights}.ts`, `browser.ts`, `clock.ts` com `MOCK_NOW`; `public/mockServiceWorker.js` por `msw init --save=false`; `.env.production` com `VITE_ENABLE_MOCKS=true`, liberado no `.gitignore`), `app/bootstrap/enable-mocks.ts`, rota `/` com `homeSearchSchema`, `useCatalogQuery` e `NftCardView` em `entities/nft`, `widgets/catalog` (`CatalogResults`: status com contagem plural, skeletons, vazio, erro com retry), `pages/home` compondo. Capturas: `scratchpad/home-1440.png` e `home-390.png`. Desvios:
  - **Mocks vs. render:** a UI renderiza sem esperar o worker (esperar quebrava o teste do skip link do shell: `load` disparava antes do React); enquanto o worker sobe, `onlineManager.setOnline(false)` pausa as buscas e libera ao final.
  - **`vitest.config.ts`:** o projeto `unit` (browser) passou a excluir `src/**/*.node.test.ts` (4 testes node falhavam por rodarem no browser; erro anterior ao item 22, não visto nas execuções só do projeto node).
  - `retry` e `staleTime` ficam no `QueryClient` (ADR-20), não repetidos no hook.
  - `stubRoute` ficou genérico (`<P extends string>`) para `Link to="/nfts/$nftId"` ser tipado.
  - **Risco:** o parser de search padrão do TanStack converte `min=1.5`/`q=123` em `number` (perde precisão em 18 casas e descarta pelo `normalizeCatalogSearch`); tratar com `parseSearch` próprio no M4 (itens 23/24).
  - Cenários `catalog-flaky`/`catalog-out-of-order` mantêm contador por carga da página; testes msw/node dos handlers não criados (cobertos pelo E2E).
  - Skeleton: região `status` "Carregando NFTs" + `aria-busy`; layout 3 col (≥1440) e 2 col sem sidebar/hero (próximos passos).

### Item 34 (GREEN: destaques, header completo)

Entregue: `entities/nft` (`fetchHighlights`, `useHighlightsQuery`, `nftKeys.highlights`, `toNftSummary` extraído), `features/language-switch` (Select do DS, namespace `language`), `widgets/header` (marca, nav "Principal", carrinho sem contador, Entrar), `widgets/hero` (carrossel manual, pontos com `aria-current`, sem autoplay nem transição), `widgets/featured-nft` (só ≥1440), `pages/home` com `#catalog` (`tabIndex=-1`) e `PageContainer`/ícones em `shared/ui`. Capturas: `scratchpad/home2-1440.png` e `home2-390.png`.

Decisão posterior (2026-10-23): a pedido do usuário, o `features/language-switch` foi removido da interface e do app. A aplicação continua pt-BR/en, escolhendo `jg:locale` já salvo, depois `navigator.languages` e pt-BR como fallback.

Desvios e lacunas (Figma x implementado):
- **Mobile:** o frame não tem header; foi mantido um header compacto (marca, carrinho, Entrar) porque o spec exige a marca no banner. Sem nav abaixo de 768. O seletor de idioma foi removido por decisão posterior do usuário; o idioma é resolvido pela preferência salva ou navegador. Busca (ícone no header desktop; campo no mobile) e barra inferior ficam para o item 27 e o M6.
- **Hero mobile:** a imagem secundária sobreposta (58x58) e o fundo (círculos/gradiente do grupo 14:5290) não foram replicados; gradiente aproximado por `primary/20 -> primary/5` (stops do Figma não mapeados em tokens). Desktop: o vetor 2:104 não tem fill, então sem fundo.
- **Pontos:** áreas de toque de 24 px (WCAG 2.5.8) com marca de 8 px; passo de 24 px no lugar de 16 px do Figma. Posição dos pontos em tablet (768) derivada.
- **Tablet (768-1439):** hero com imagem 300 px e título 28 px, derivados (sem frame, Q11).
- **Header:** ícones de carrinho e Entrar desenhados à mão (a geometria dos vetores do Figma não foi extraída); ícone de busca omitido; o botão Entrar usa o Button do DS com ajustes (h-35, raio 6, 16/500) sobre o primary md (h-40, raio 3); contador do carrinho omitido (menores do plano). Mercado e Início apontam para `/`; só Início fica ativo.
- **Destaque lateral:** o Figma tem formas decorativas (retângulos 30/31/32) não replicadas; fundo por gradiente aproximado. Filtros ainda não existem, então a coluna lateral só tem o destaque (no Figma fica abaixo dos filtros).
- **Título do hero** usa `\n` na chave i18n com `whitespace-pre-line` para reproduzir a quebra do Figma.
- Observado fora do escopo deste item (nas capturas): contagem "45 NFTs" visível acima da grade (o Figma não tem), ausência de abas, ordenação, filtros e paginação (itens 23-28), preços longos quebram de linha no card de 390.
- Arquivos alheios ao item (`.gitignore`, `.claude/settings.json`, `tools/action-log.mjs`) apareceram modificados no working tree e não foram commitados.

### M4: filtros e URL (GREEN dos itens 23a, 22b, 23-29)

Entregue (FSD): `app/router/search-serialization.ts` (parseSearch/stringifySearch, ligados ao `createRouter`); `entities/nft` com `useCatalogSearch` (URL como fonte; push em filtros/busca, `replace` opcional), `useCanonicalSearchUrl` (normaliza `?tab=foo&page=-3` para `/` por replace) e `CatalogQueryResult`; `features/catalog-filters` (coleções, redes, faixa de preço), `catalog-sort`, `catalog-view-tabs`, `catalog-search` (toggle no header com `aria-expanded`; campo direto no mobile); `widgets/filter-panel` (`FilterSidebar` >= 1440 com preço só no Aplicar; `FilterSheet` < 1440 com rascunho e um único Aplicar), `widgets/catalog` (`Catalog`: título "Resultados" sr-only focado após paginar, toolbar, resultados, paginação do DS com `href` real, clamp de `page` por replace); `shared/lib/eth`: `formatEthFixed` e `asEthAmount`; `shared/hooks/useLocale`; ícones de busca e filtros. i18n pt-BR/en com paridade (namespaces `filters`, `sort`, `viewTabs`, `search`; `catalog` ganhou `title` e `pagination`).

Verificação final (resultado real): lint e typecheck do app e do DS limpos; Vitest app 400/400 e DS 991/991; E2E completa 84 passed, 4 failed (os 2 testes abaixo, em 1440 e 390).

Decisões e desvios:
- **Passo e faixa do slider:** passo 0.01 ETH; faixa da API arredondada para fora (`boundsOf`, piso do mínimo e teto do máximo) via `ethToSteps`/`stepsToEth`; extremos viram "sem filtro" (param omitido na URL); `aria-valuetext` com 2 casas fixas ("12,30 ETH").
- **Preço do card preserva os zeros da API:** `price` do domínio passou de `parseEth` (canônico, "12.3") para `asEthAmount` (valida sem normalizar, "12.30"), pois o E2E 25 exige "12,30 ETH" e o 24 exige sempre casas decimais. `parseEth` continua canônico (testes 9 e 21 intactos).
- **Fixtures NÃO ajustadas (decisão (b) do chamador não aplicada):** tornar "Novos lançamentos" subconjunto real quebraria os testes 26 (`?tab=new` espera "45 NFTs") e 29 (B = 45 NFTs); incluir digital-art em polygon quebraria o 23 (`Arte digital (0)` com Polygon). Os testes são lei; fixtures ficam como estão até o test-writer rever.
- **Rótulo das coleções e redes** moram no namespace `filters` da feature (e não em `entities/collection`, que não foi criada); cada checkbox tem `aria-label` "Nome (contagem)" porque o nome por conteúdo do flex não é confiável.
- **Checkboxes** circulares do DS no lugar do texto simples do Figma (necessários para o papel `checkbox`); contagem fixa "(5)" etc. vem das facetas da API (fixtures), não das ilustrativas do Figma.
- **Título "Resultados"** é `sr-only` (o Figma não tem esse título); recebe o foco programático após trocar de página (foco invisível: desvio a avaliar no item 36).
- **Sheet:** `side="bottom"`, vale também em 768 (botão de filtros acima do hero, alinhado à direita); em 390 fica ao lado do campo de busca (Figma: campo + botão 45 px). Ordenação fica no Sheet < 1440 e na barra >= 1440.
- **Abas** usam o DS com 14 px (Figma 15 px na barra desktop); aba ativa bold + sublinhado do DS.
- **Busca:** campo `type=search` sem botão de envio (Enter); no desktop/tablet começa aberto se há `?q`.
- **`useCanonicalSearchUrl`** parte da string real da URL (não do search validado pelo router, que fica uma navegação atrás e desfazia o clique na paginação).

Defeitos nos testes RED (NÃO alterados; devolver ao `test-writer`):
1. `e2e/home-filters.spec.ts` teste 24 (faixa de preço), em 1440 e 390: (a) após "Aplicar" o teste lê `cards(page).allTextContents()` imediatamente; com `keepPreviousData` (exigido pelo teste 33) os cards antigos seguem visíveis por ~120 ms, então lê dados obsoletos (falta esperar `aria-busy="false"`/contagem); (b) `allTextContents` concatena título e preço sem separador ("Sage Nomad #0091,69 ETH"), e a regex `(\d+,\d+) ETH` extrai "0091,69" (= 91,69), logo qualquer card falha em `<= 12.29`. Cópia temporária corrigida (espera `[aria-busy=true]` zerar e lê `innerText`) passou 2/2 (1440 e 390), confirmando URL `min`/`max`, `aria-valuetext`, rótulo "Preço: 1,50 - 12,29 ETH" e todos os preços dentro da faixa. A cópia foi apagada.
2. `e2e/home-url-history.spec.ts` "voltar restaura a página 1..." (1440 e 390): `second = await titles(page)` é lido logo após `toHaveURL(page=2)`, antes de os 6 cards chegarem (ainda os 9 da página 1). Falta `await expect(cards(page)).toHaveCount(6)` antes da captura (o primeiro teste do arquivo já faz isso). Cópia temporária com a espera passou 2/2; apagada.

Capturas (Playwright CLI, `scratchpad/`): `home3-1440.png`, `home3-390.png`, `home3-768.png`, `home3-390-top.png`, `home3-390-sheet.png`, `home3-768-top.png`, `home3-768-sheet.png`.

Desvios do Figma observados nas capturas (M4):
- Sidebar: Figma sem checkboxes e com contagens ilustrativas (33, 12, 65...); implementado com checkbox circular do DS e contagens reais das fixtures (5 por coleção, 15 por rede). Item selecionado em `text-accent` e demais em `secondary` conforme o Figma.
- Faixa de preço: rótulo "Preço: 0,00 - 12,30 ETH" (Figma "0,02 - 12,30") porque o piso vem do menor preço da fixture (1e-18) arredondado para 0,00; botão "Aplicar" 32 px (Figma 70485 sem medida extraída).
- Toolbar: abas em 14 px (Figma 15/500); "Ordenar por: Listados recentemente" com chevron do DS; contagem "45 NFTs" visível acima da grade (não existe no Figma; é a região `status` exigida pelo teste 22).
- Paginação: 1-5 + seta, alinhada à direita no 1440 e centralizada < 1440; o Figma mostra 1-4 + seta (45 itens = 5 páginas).
- Busca: ícone no header (Figma tem o ícone sem campo); campo de 240 px quando aberto (largura derivada); mobile com campo 45 px e botão de filtros 45 px com gradiente primary (Figma: 15:5313, medida do botão não extraída).
- Preço extremo "0,000000000000000001 ETH" quebra em duas linhas no card de 390 (já listado no item 34).
- Seletor de idioma do header aparece junto da busca no 1440; abaixo disso segue sem seletor (rodapé pendente, Q8).

Item 31 (GREEN): em CatalogResults.tsx o estado vazio ganhou `<Link to="/" search={{}}>` com a chave `empty.clear` ("Limpar filtros"/"Clear filters") nos locales do widget catalog. Itens 30, 32 e 33 passaram sem mudança (regressão). Nota de execução: com o outro agente rodando E2E em paralelo, a execução com `test-results` compartilhado deu ENOENT e o servidor dev compartilhado deu ERR_CONNECTION_REFUSED; reexecução com `--workers=1 --output` próprio: 18/18.

### M6: GREEN dos itens 36, 37 e 38

Itens 35 (regressão), 36, 37 e 38 verdes em desktop-1440, tablet-768 e mobile-390. Capturas (Playwright CLI) em `scratchpad/home4-{1440,768,390,320}.png`.

Mudanças e desvios:
- **Foco visível (36):** o link do título do `NftCard` (DS) trocou `focus-visible:outline-none` por `outline-transparent`: o anel visível continua no `::after` (card inteiro), e o link mantém um contorno próprio `solid` transparente (aparece em modo de alto contraste). O `Input` do DS trocou `outline-none` do `<input>` por `outline-transparent` (o anel visível segue no wrapper). O teste do DS `NftCard.test.tsx` (C25.1) agora espera `solid` + `rgba(0, 0, 0, 0)` no link em vez de `none`. O app consome `dist` do DS: rebuild (`pnpm --filter @jg/design-system build`) necessário para o E2E enxergar o DS.
- **Barra inferior (37):** novo `widgets/bottom-nav` (`navigation` "Navegação inferior"/"Bottom navigation", só < 768, fixa, com espaçador). Itens do Figma 14:5226 (Tab Bar 70395:245): Início `/`, Favoritos e Escanear (central, 65 px elevado) em `/unavailable?feature=...`, Compras `/cart`, Perfil `/login`. Rótulo "Compras"/"Shop" (e não "Carrinho") para não duplicar o nome do link do cabeçalho (o spec 36 usa `getByRole('link', { name: 'Carrinho' })`). Sem rótulos visíveis (Figma só tem ícones; nome por `aria-label`). Entalhe do vetor 15:5504 não replicado (topo arredondado). Ícones novos em `shared/ui/icons` desenhados à mão (vetores do Figma não extraídos). Namespace `bottomNav` com paridade pt-BR/en.
- **320 px (37):** `min-w-0` no campo de busca e a lista de abas dentro de contêiner com `overflow-x-auto` (rola na horizontal dentro da toolbar, sem esconder conteúdo).
- **axe (38):** `CatalogViewTabs` virou raiz do `Tabs` com `CatalogViewTabsList` e `CatalogViewPanel` (`TabsContent`, `tabIndex={-1}`), e o `Catalog` põe resultados e paginação no painel: o `aria-controls` da aba ativa aponta para um `tabpanel` real (o Radix 1.x sempre emite `aria-controls`). Headings: sidebar ganhou `h2` sr-only "Filtros"; o título do estado vazio passou de `h2` para `h3`.

### Item 39 (GREEN: medidas do Figma, ADR-08)
28 testes `*.measure.test.tsx` estavam vermelhos por divergência real; 22 foram corrigidos no código (commits `feat(green): home 39 ...`), 6 viraram **desvio documentado** com o teste ajustado em commit `test:` próprio. Resultado de `pnpm exec vitest run --project unit measure` em `apps/web`: 6 arquivos, 68 passed, 8 todo.

Correções no código (valor do Figma atingido):
- **Header:** item ativo com peso 700 (a classe `regular` vencia a `bold` na ordem do CSS; agora `activeProps`/`inactiveProps` excludentes), line-height 21,1 nos itens, sublinhado 3 px, divisor na cor primária.
- **Hero 1440:** `pt-43` com `items-start` (cópia a 43 do topo), eyebrow-título 8 (`mb-4` sobre o gap 4), botão Explorar `min-w 140` e line-height 20, pontos a `bottom-35`/`left-592` (primeiro ponto a 600 e 43 da base). **Hero 390:** margem 8 extra (banner a 24), gap 8, line-heights 16/29/18; o título usa `leading-[29px]` com reset em `tablet:` (`--tw-leading` do Tailwind 4 vence o token do breakpoint).
- **Filtros:** rótulo da faixa 15 px; Aplicar 92x36, raio 6, 16 px bold (`PriceFilter`, também no Sheet); botão de filtros mobile com raio 14.
- **Toolbar:** abas 15 px medium no desktop (14 no mobile, como já estava), gap 16 no mobile (20 no desktop), 16 até a grade no mobile.
- **Grade:** colunas `repeat(3, minmax(0, 258px))`, gaps 32/72 no desktop; mobile com a coluna direita 32 abaixo (`translate-y-32` nos pares + `pb-32` para não invadir a paginação). Sem alterar os E2E de layout (ver verificação final).
- **Barra inferior:** ícones 20 px, ícone de scan 26,8x24, ícone de início a 36 da borda (`px-24`).

Desvios documentados (elemento, esperado, observado, motivo); testes marcados "desvio documentado" no commit `test:`:
| Elemento | Esperado (Figma) | Observado | Motivo |
|---|---|---|---|
| Divisor do header (`header.divider.w`, 70504:3016, file.json:3737) | 0,3 px | 1 px computado | Chrome arredonda bordas menores que 1 px para 1 px de dispositivo; `border-width: 0.3px` computa 1px (testado). Cor primária aplicada. |
| Raio da sidebar (`side.radius`, 70485:382, file.json:5563) | 0 | 8 | O nó não define raio (0 é inferência); mantido o raio 8 decidido antes (consistência com os cards). |
| Passo dos pontos do hero (`hero.dot.pitch`, 3:128, file.json:4849) | 16 | 24 | Cada ponto é botão de 24x24 (WCAG 2.5.8); o primeiro ponto está em 600/43 como no Figma. |
| Altura do hero mobile (`heroM.h`, 70395:240, file.json:276628) | 190 | 254 (390 px) | Quadro do Figma tem 414 (coluna de texto de 188); em 390 a coluna tem 164, o texto quebra em mais linhas, e o Explorar é Button (40 px) e não link de 14 px. O teste exige altura mínima 190. |
| Explorar mobile (`heroM.explore.fs/fill`, 15:5294, file.json:277516) | link de texto 12 px, cor `#e89b55`, sem fundo | Button do DS 16 px, fundo primário | Decisão registrada de manter o Button do DS (alvo de toque, WCAG 2.5.8). Peso 700 confere. |
| Ícone de scan (`tabbar.scan.fill`, 15:5530, file.json:288736) | `#f5f1eb` | `#140d0a` (ink) | Sobre o gradiente primário o claro dá contraste ~2,6:1 (< 3:1, WCAG 1.4.11); o ink mantém o contraste. Tamanho 26,8x24 conferido. |

Verificação final do item 39 (local, sem Docker): `pnpm lint` e `pnpm typecheck` em `apps/web` limpos; vitest app (node+unit) 30 arquivos, 469 passed, 8 todo; DS 73 arquivos, 991 passed (DS não foi alterado); `playwright test --workers=1`: 138 passed e 1 falha em `e2e/shell.spec.ts:4` (mobile-390, banner não encontrado na primeira navegação, partida a frio do servidor); reexecução de `shell.spec.ts`: 8 passed. Os E2E de layout (home-layout: 3 colunas, sem overflow) permaneceram verdes com a grade nova.
