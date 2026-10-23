# ARCHITECTURE.md

Registro de decisões duradouras e desvios (formato: contexto, decisão, alternativa descartada, consequência). Escopo atual: monorepo e design system (`.AI/plans/design-system.md`). Contratos REST/eventos, sessão, carrinho, cache e reconciliação REST × Socket.IO entram aqui quando as features do app forem planejadas (ver `design.md`).

## Decisões do monorepo e do design system

**ADR-01 Monorepo pnpm workspaces + Turborepo 2.x.** Contexto: dois pacotes (`apps/web`, `packages/design-system`). Decisão: pnpm + Turborepo, `packageManager` fixado. Descartado: Nx (mais conceitos/geradores). Consequência: `turbo.json` é o grafo de tarefas; lockfile único.

**ADR-02 Configuração compartilhada na raiz.** ESLint flat único, `tsconfig.base.json`, sem pacotes `config-*`. Descartado: pacotes de config (scaffolding extra). Consequência: regras de fronteira vivem em `eslint.config.js`.

**ADR-03 Build do DS com `tsc` para `dist`.** ESM + `.d.ts`; `scripts/copy-assets.mjs` copia CSS e fontes. `exports`: `.`, `./styles.css`, `./tokens.css`, `./fonts/*`, `./package.json`; `react`/`react-dom` como peers; `sideEffects: ["**/*.css"]`. Descartado: tsup, Vite lib, pacote JIT (o typecheck do app não validaria a API publicada). Consequência: o app depende de `^build`; deep import em `src`/`dist` falha no lint.

**ADR-04 Tokens em Tailwind 4 CSS-first (`@theme`) como fonte única.** `tokens.css` zera os padrões (`--color-*`, `--radius-*`, `--shadow-*`, `--font-*`, `--text-*`: `initial`) e declara só valores do Figma, cada um com `/* figma:<id> */` conferido por teste; aliases semânticos via `var()`; `--spacing: 1px`. Descartado: JSON de tokens + geração; spacing de 4 px. Consequência: classes padrão do Tailwind (`h-10`, `bg-red-500`) não existem; use `h-40`.

**ADR-05 shadcn/ui por cópia manual.** Sem CLI nem `components.json`; pacote `@radix-ui/react-<x>` individual, `cva`, `tailwind-merge`, `clsx`, `data-slot`. Consequência: o cabeçalho de origem existe onde houve cópia (ex.: `Separator`); os demais componentes são implementações próprias sobre Radix. Ver `packages/design-system/README.md`.

**ADR-06 Testes em três camadas, tudo em Chromium real.** Vitest browser mode + axe-core; Storybook 10 (addon-a11y em modo erro, addon-vitest roda as `play`); golden Playwright sobre `storybook-static`. Descartado: jsdom + jest-axe (sem layout/`:focus-visible`/contraste/fontes); test-runner do Storybook.

**ADR-07 Regressão visual auto-hospedada, baseline por plataforma (ajustado pelo ADR-15: sem Docker).** Projects 1440×900, 768×1024, 390×844; `snapshotPathTemplate` com `{platform}`; `updateSnapshots: 'none'`; `forbidOnly: true`. `pnpm test:visual` chama `tools/visual.mjs`, que roda o Playwright local. Consequência: as baselines versionadas (`linux/`) só valem no Linux; ver ADR-15 (a delegação ao Docker original foi removida).

**ADR-07a Tolerância visual apertada.** Contexto: com `threshold 0.2` e `maxDiffPixelRatio 0.002`, uma baseline obsoleta passou (mudança sutil de `surface-card` no tema escuro). Decisão: `threshold 0.02` e `maxDiffPixelRatio 0.0005`, aceitável porque o render da mesma plataforma é determinístico (ajustado pelo ADR-15: vale na plataforma da baseline, na validação final). Descartado: manter a tolerância da ADR-07. Consequência: qualquer mudança visual exige regenerar e revisar a baseline.

**ADR-08 Fidelidade ao Figma por medida, não por pixel do PNG.** Cada componente tem testes de medida (`getBoundingClientRect`/`getComputedStyle`) com valor lido do nó e citação `file.json:linha`. O PNG do Figma é referência de revisão visual.

**ADR-09 Fontes locais Roboto Mono 400/500/700** (`@font-face`, `font-display: swap`, URL relativa, em `src/fonts/` para valer em `src` e `dist`; licença OFL). Descartado: Google Fonts CDN. Lacuna: o token `--text-body-large-18-light` pede peso 300, que não tem face (cai no 400).

**ADR-10 Stories golden sem `play`.** Tags `golden`, `golden-hover`, `golden-focus`, `golden-page`; hover e foco produzidos pelo spec Playwright. `play` só no projeto `storybook` do Vitest.

**ADR-11 Ícones como SVG local** (decisão do usuário). O DS não exporta ícones; local final dos ícones do app é decisão pendente (`design.md` §4).

**ADR-12 Desvios de acessibilidade e de Figma** (decisão do usuário e do architect, registrados também em cada `.AI/plans/executions/C*.md`):
- erro em coral `#F0805F` (contraste 7,29:1; o `#EA6B4F` da description do Figma está defasado); `--color-error` (#ED1B2E, 4,39:1) não é usado como cor de texto;
- borda de input em `--color-secondary` (contraste ≥ 3:1 com o fundo);
- `Separator` em primary com 0,3 px (nó "Line 1" do Header With Divider), e não `--color-border` como o plano supunha;
- mobile 414 → 390 (o enunciado exige 390; medidas lidas do frame de 414 sem conversão);
- estados derivados só com tokens existentes (hover = `primary-light`, active = `primary-dark`, foco = outline 2 px `--color-focus`, disabled = `disabled-bg`/`disabled-text`);
- Skeleton derivado de `surface-card`/`surface-raised`; shimmer sem valor no Figma;
- defeitos do Figma não replicados (canto reto do selo "RARO", botão de remover sobreposto no carrinho mobile);
- componentes sem frame no Figma (Alert, Textarea, Sheet, Tabs desktop, estados disabled e hover): medidas derivadas, marcadas como Lacuna nas evidências;
- `Rating` arredonda para estrelas inteiras (4,5 aparece como 5 estrelas; o rótulo textual continua correto).

**ADR-13 `apps/web` mínimo.** Contexto: o plano prevê o app com `<main/>` e um smoke (Q7). Decisão: `index.html`, `src/main.tsx`, `src/app/App.tsx` (`<main/>`), `vite.config.ts` (React + Tailwind) e `build` = `tsc -b && vite build`; o smoke I1 prova o consumo do DS (`@import` via `exports` e `@source` do `dist`). Consequência: o app roda e builda; telas e rotas vêm nas features seguintes.

**ADR-14 Design system agnóstico de idioma; i18n só no app.** Contexto: requisito de i18n desde o momento zero (pt-BR e en); o DS tinha rótulos e defaults em pt-BR; o usuário decidiu em 2026-10-22 que o DS só recebe por props os textos e valores a exibir e que toda a i18n pertence ao app. Decisão: (1) todo texto visível ou acessível entra por prop **obrigatória no tipo, sem default**, com padrão de nome (`label` para a raiz de um contêiner; `<ação>Label` para controles de ação; `toneLabel` para rótulo sr-only auxiliar; plural em tupla `thumbLabels`; `aria-label`/`alt` nativos quando o componente é o elemento nativo); (2) valores exibidos (ETH, moeda, datas, plurais, contagens) chegam como `string` já formatada (`NftCard.priceLabel`), `number` só como valor de controle; (3) o app é dono de lib de i18n, dicionários, seleção e persistência de idioma, `<html lang>`, formatação `Intl`, tradução de códigos de erro e wrappers `shared/ui` com `t()`; (4) guardas: G1 (AST, sem literal em `src`), T1–T6 (obrigatoriedade por tipo), G2.a (`package.json` sem lib de i18n), G2.b (sem `Intl`/`toLocale*`/`localeCompare`/`navigator.language(s)`/`documentElement.lang` em `src`), G2.c (ESLint barra import de i18n); (5) exceções: glifos sem letra com `aria-hidden` e inteiros de controle renderizados crus (página e quantidade; idênticos em pt-BR e en abaixo de 1000). Descartado: props opcionais sem default (só o axe pegaria), defaults em inglês (troca um idioma fixo por outro), `jsx-no-literals` no DS (dependência nova, não cobre defaults/mapas), lib de i18n ou `Intl` no DS com prop `locale` (acopla o DS a idioma e duplica a formatação do app). Consequência: muda o contrato de `design-system.md` §3; todo consumidor passa texto traduzido e valor formatado e o compilador acusa a falta; fixtures do DS em pt-BR com repasse em inglês; baselines inalteradas. Pendência herdada: `RangeSlider` sem texto do valor por thumb (`aria-valuetext`), a tratar na feature de filtros.

**ADR-15 Sem Docker; verificação cotidiana sem regressão visual; golden e regressão das páginas na validação final, local.** Contexto: o `verify` incluía `storybook:build test:visual`, que no Windows delegava ao Docker (ADR-07); o cold start do container estourou 30 s dentro do `verify` completo (suíte isolada: 296 passed, 7 skipped), o que tornou cada alteração pequena lenta e instável, com impacto no prazo; o render difere entre sistemas, então as 285 baselines `linux/` não valem fora do Linux. O usuário decidiu em 2026-10-22: Docker é proibido em desenvolvimento, testes e validações, salvo ordem explícita (regra no `CLAUDE.md`), e a regressão de imagem sai do fluxo cotidiano. Decisão: (1) `verify` = `lint typecheck test build` (comportamento, integração, axe, tipos, lint), sem Docker nem Storybook estático; (2) `tools/visual.mjs` roda o Playwright local em qualquer SO e `tools/visual-docker.mjs` e `test:visual:docker` foram removidos; (3) as baselines existentes são preservadas, nunca atualizadas nem apagadas automaticamente, e `test:visual:update` é só manual com revisão de cada PNG; (4) o golden do DS e a regressão visual de início, detalhe, carrinho e pagamento (exigência do enunciado §9, que continua valendo) são consolidados na validação final, executados localmente; como obter baselines válidas na máquina de desenvolvimento (por plataforma, geradas e revisadas localmente) é decisão pendente do usuário; (5) nas telas, fidelidade ao Figma por captura do Playwright CLI e testes de medida, sem aprovação de snapshot a cada alteração; (6) no DS, snapshots de DOM normalizados só para contratos de saída estáveis, sem substituir testes de comportamento; (7) guarda node (`no-docker.node.test.ts`) falha se qualquer script, `tools/*.mjs` ou o `verify` voltar a citar Docker ou o golden. Descartado: Docker (proibido); golden no `verify` com timeout maior (aumentar timeout não é correção); serviço externo de regressão visual. Consequências: a regressão visual não é detectada no dia a dia (mitigação: medidas ADR-08, axe, snapshots de DOM); `pnpm test:visual` falha numa plataforma sem baseline própria até a decisão pendente; o gate visual por componente de `design-system.md` passa a valer só na entrega. Reversão: se uma regressão visual escapar até a entrega e gerar retrabalho real, reavaliar o `test:visual` no `verify`.

**ADR-16 Stack de rotas, dados e mocks do app (parcial; completa no M2).** Contexto: enunciado §2/§4 exige TanStack Router, TanStack Query, Axios e MSW; `@mswjs/socket.io-binding@0.2.0` declara peer `msw ^2.10.2`. Decisão (M1): `@tanstack/react-router 1.170.45` com rotas em árvore de código (`app/router/router.tsx`) e `@tanstack/react-query 5.104.5` (cliente em `app/providers/query-client.ts`, política do ADR-20), ambos com versão exata. No M2 entram `axios`, `msw` (fixado em 2.x, nunca 3.x) e `zod`, e este ADR é completado; os mocks ficam em `src/mocks`, fora do FSD, importados só por `app/bootstrap` e ativados por `VITE_ENABLE_MOCKS`. Descartado: MSW 3.x (quebra o binding de Socket.IO), plugin de geração de rotas. Consequência: atualizar o MSW exige reavaliar o binding em F1.

**ADR-17 i18n do app.** Decisão: `i18next 26.4.6` + `react-i18next 17.0.20` (as versões 26.5.5 e 17.1.2 do plano foram trocadas por violarem a política `minimumReleaseAge` do pnpm; sem exceção à política). Cada slice é dono do seu namespace em `config/locales/{pt-BR,en}.ts`; `app/i18n/resources.ts` registra os namespaces, o `en` é validado com `satisfies` contra o shape do pt-BR e `findParityIssues` (teste) confere chaves e `{{placeholders}}`; **chaves tipadas** por `CustomTypeOptions` em `app/i18n/i18next.d.ts` (`t()` com chave ou namespace inexistente falha no `tsc`, provado por `tests/i18n-keys.typetest.tsx`; `defaultNS` tipado como união dos namespaces, só tipagem). O idioma ativo vem de `resolveLocale` (preferência salva em `localStorage['jg:locale']`, depois `navigator.languages` por prefixo, depois pt-BR), vive em estado (sem prefixo na URL) e `AppProviders` mantém `<html lang>` e grava a preferência a cada troca, sem remontar a árvore; título e meta description por rota via `useDocumentMeta` (`shared/hooks`, pois `shared/lib` não pode importar React). Conteúdo editorial do catálogo não é localizado e o idioma fica fora da `queryKey`. Descartado: `react-intl` e Lingui, `i18next-browser-languagedetector`. Consequência: localizar conteúdo no detalhe (F4) exige pôr o `locale` na chave e enviar `Accept-Language`.

**ADR-21 Lint de FSD, i18n e qualidade sem plugins.** Decisão: só regras do núcleo do ESLint e do typescript-eslint, em `eslint.config.js`, escopo `apps/web/src` (o DS não recebe estes limites): `no-restricted-imports` impõe camadas (cada uma só importa de inferiores), proíbe slice irmão e deep import (acesso só por `index.ts`), React/Axios/TanStack/MSW/i18next em `model/domain` e `shared/lib`, e `mocks` fora de `app/bootstrap`; `no-restricted-syntax` proíbe texto com letra em JSX (texto, `aria-label|aria-description|alt|title|placeholder|label`, template) e `as X` (só `as const`), com `.tsx` compondo as duas listas porque o ESLint não faz merge de `no-restricted-syntax` entre blocos; limites `complexity 10`, `max-depth 3`, `max-params 3`, `max-nested-callbacks 3`, `max-lines 200` e `max-lines-per-function 80` (sem linhas vazias e comentários; testes: `max-lines 400`); `no-explicit-any` do recommended. Cada regra é provada por teste da API do ESLint (`tests/lint-fsd`, `lint-i18n`, `lint-quality`). Desvios: (a) as regras de camada casam só imports relativos e até 5 pastas abaixo do slice; estender se o app adotar alias; (b) `switch-exhaustiveness-check` não entrou: é type-aware e o `lintText` de arquivos virtuais não suporta `projectService`; a exaustividade é garantida em compilação por `assertNever` + `tsc`. Descartado: `eslint-plugin-react` (peer só até ESLint ^9.7), `eslint-plugin-i18next` (sem compatibilidade declarada com ESLint 10), `eslint-plugin-boundaries`.
**ADR-22 Imagens dos NFTs extraídas do Figma (Q13); `sharp 0.34.5` (devDependency da raiz).** Decisão: `tools/figma-images.mjs` (`node --env-file=.env tools/figma-images.mjs`) baixa os image fills pela API (`/v1/files/:key/images`), converte para WebP (qualidade 82) com `sharp` e grava `apps/web/public/nfts/<slug>.webp` mais `manifest.json` (`slug,title,width,height,sourceNodeId`). `sharp` usa binários pré-compilados (sem script de build; `allowBuilds.sharp: false`), só roda em `tools/`, nunca no app. **Lacuna/desvio:** o Figma tem só 4 image fills distintos (1254×1254) e 8 títulos de NFT; as 8 entradas do manifest reutilizam esses 4 fills (Sage Nomad, Cosmic Bloom e Violet Nomad compartilham a mesma imagem; idem Neon Vessel/Ivory Baron e Golden Beat/Golden Signal). Os 45 itens das fixtures precisam reutilizar estas imagens e inventar nomes/slugs além dos 8 do Figma, o que deve constar como desvio. **Registrado (item 15 GREEN):** os 37 itens sintéticos de `apps/web/src/mocks/fixtures/nfts.ts` têm cada um seu `public/nfts/<slug>.webp`, cópia de um dos 8 WebP do Figma (rotação por índice); a diversidade visual real do catálogo fica limitada a 4 imagens.

## Desvios de método

- **TypeScript 6.0.3** (e não a última 7.x): `typescript-eslint` 8.72 exige `typescript < 6.1`. Revalidar ao atualizar o lint.
- **Guardas de invariante sem RED** (T2, T8, T15, T18 do plano): a propriedade já valia quando o teste foi escrito; cada uma tem mutação que prova que o teste falha quando a regra é violada (evidências no plano).
- **RED em blocos por componente** (e não um teste por vez) e **esqueleto de API antes do RED**, para o teste falhar por asserção e não por import inexistente. Decisão do coordenador na execução, **não aprovada explicitamente pelo usuário**: levar ao usuário na revisão.
- **Execução paralela** de até 5 workers em worktrees (decisão do usuário): cada componente tem RED e GREEN em commits próprios no seu branch, mesclados com `--no-ff`.
- **Flakiness de testes em Chromium** tratada na raiz: setup global que solta o ponteiro após cada teste (`src/test/setup.ts`), helper `pressArrow` para radios Radix (o Radix só marca o item se a seta ainda estiver pressionada no frame seguinte) e `testTimeout` de 30 s nos projetos `node` (o ESLint carrega a frio sob carga).

## Pendências conhecidas

- Alvos de toque abaixo de 24×24 (WCAG 2.2, 2.5.8): `DialogClose` (18×18) e o botão do `PasswordInput` (20×20). Decidir se o projeto adota WCAG 2.2 AA; o Figma desenha esses tamanhos.
- `eslint-plugin-storybook` instalado e não configurado.
- Overlay do Dialog: derivado da cor-base das sombras do DS (sem fonte no Figma).

**ADR-16 (adendo, item 22 da Home): bootstrap dos mocks.** `msw 2.15.0` já instalado; `public/mockServiceWorker.js` gerado por `msw init` (sem `--save`). `app/bootstrap/enable-mocks.ts` importa `mocks/browser` dinamicamente só com `VITE_ENABLE_MOCKS=true` (`.env.production` versionado com `true`, exceção no `.gitignore`). A UI não espera o worker: as buscas do TanStack Query ficam pausadas via `onlineManager` até ele iniciar. Sem dependência nova.

**ADR-16 (adendo, item 38 da Home): `@axe-core/playwright` 4.14.0 em `apps/web` (devDependency, versão fixa).** Verificação automática de acessibilidade nos E2E da Home (`e2e/home-axe.spec.ts`). Usa o `axe-core` 4.14.0 já fixado no design system (peer `playwright-core >= 1.0.0`, compatível com `@playwright/test` 1.64.1). Pré-autorizada pelo `CLAUDE.md` (necessária ao enunciado §8).

## Contratos de negócio e integração do app

Esta seção registra os contratos implementados em `apps/web/src/shared/api/contracts`, consumidos por entidades e simulados em `apps/web/src/mocks`. O cliente Axios usa `baseURL: '/api'`, valida respostas com Zod e envia o token da sessão autenticada como Bearer. Os handlers MSW são a única fonte de respostas simuladas; componentes e hooks não fabricam respostas de API.

### REST

| Área | Endpoint | Contrato e observações |
| --- | --- | --- |
| Sessão | `POST /api/auth/login`, `POST /api/auth/register` | Login recebe `email` e `password`; cadastro recebe `displayName`, `username`, `email` e `password`. Retornam `{ token, expiresAt, user }`, com `expiresAt` em epoch milliseconds; cadastro responde `201`. |
| Sessão | `GET /api/auth/session`, `POST /api/auth/logout` | Sessão anônima responde `200 { user: null }`; token inválido ou expirado responde `401 session_invalid`. Logout responde `204`. |
| Perfil e carteiras | `GET/PUT /api/account/profile`, `PUT /api/account/password`, `GET/PUT /api/account/wallets` | Perfil e lista de carteiras são por usuário autenticado. Atualização de senha responde `204`; carteiras são salvas por tipo (`primary` ou `secondary`) e rede. |
| Conexão de carteira | `POST/DELETE /api/wallet/connect` | `POST` recebe `walletId` e responde `{ connectionId, provider }`; recusa simulada responde `403 forbidden`; `DELETE` desconecta e responde `204`. Conexão é distinta do cadastro de carteiras. |
| Catálogo | `GET /api/nfts`, `GET /api/nfts/:nftId`, `GET /api/highlights` | A listagem aceita `search`, `view`, `sort`, `collections`, `networks`, `minPriceEth`, `maxPriceEth`, `page` e `pageSize` (9 por padrão). Detalhes expõem edições e disponibilidade; conteúdo editorial localizado é selecionado no cliente. |
| Favoritos | `GET /api/favorites`, `PUT/DELETE /api/favorites/:nftId` | Recurso privado; a resposta contém `nftIds` e `version`. A alteração otimista da UI reverte em falha. |
| Carrinho | `GET /api/cart`, `POST /api/cart/items`, `PATCH/DELETE /api/cart/items/:lineId` | Carrinho de visitante ou autenticado. A linha é identificada por `(nftId, editionId)` e tem `lineId` estável; mutações retornam o carrinho atualizado. Disponibilidade insuficiente responde `409 availability_conflict`. |
| Cupom e cotação | `PUT/DELETE /api/cart/coupon`, `GET /api/cart/quote?networkId=...` | Cupom inválido/expirado responde `422 coupon_invalid`/`coupon_expired`. A cotação autoritativa contém `quoteHash`, `cartVersion`, valores, estado de disponibilidade e `canCheckout`; taxas variam pela rede. |
| Pedidos | `POST /api/orders`, `GET /api/orders`, `GET /api/orders/:orderId` | Criar pedido exige `Idempotency-Key`, cotação revalidada, rede, carteira, dados do comprador e linhas. Primeira criação responde `201`; replay idempotente responde `200`. A lista responde `{ orders }`; detalhe não encontrado ou pertencente a outro usuário não é exposto. |

O DTO do carrinho contém `lines`, `couponCode`, `itemCount` e `version`; cada linha inclui NFT/edição, quantidade, preço unitário e `maxQuantity`. A cotação retorna `quoteHash`, `cartVersion`, `networkId`, linhas com `status`/`available`, `subtotalEth`, `discountEth`, `networkFeeEth`, `totalEth`, cupom, `canCheckout` e `expiresAt`. O pedido congela esses valores e suas linhas no snapshot.

Erros de validação usam `400 validation_failed`; credenciais inválidas e sessão inválida usam `401`; conflitos de conta usam `409 account_conflict` com campos; cotação/preço alterado, disponibilidade e idempotência usam `409 quote_changed`, `409 availability_conflict` e `409 idempotency_conflict`; cupom inválido/expirado usa `422`; indisponibilidade do serviço é `503 service_unavailable`. Falhas de transporte são tratadas pelo cliente como erros de rede, não como resposta de sucesso.

Valores monetários em ETH trafegam como strings decimais e permanecem strings/valores exatos no domínio; não se usa `Number` ou `parseFloat` para calcular ETH. Quantidades, versões e percentuais são inteiros. O recibo usa o snapshot imutável gravado no pedido, incluindo preços e totais, referência de transação e URL de exploração simuladas.

### Sessão e persistência

- O token do cliente fica em `localStorage['jg.session.token']`; `GET /api/auth/session` recupera a sessão após refresh. O registro mock contém usuário, salt e hash de senha, nunca a senha em claro.
- O identificador de carrinho visitante persiste em `localStorage['jg.guest.cart-id']` e é enviado como `X-Guest-Cart-Id`, inclusive durante login/cadastro. O handler autentica a sessão e mescla o carrinho visitante ao do usuário: soma quantidades respeitando a disponibilidade, preserva o cupom do usuário, remove o carrinho visitante e pode repetir a operação sem duplicar o merge.
- O estado mock de identidade/sessões/carteiras usa `jg:mocks:state`; comércio (carrinhos, favoritos, mercado, pedidos, versões e contadores de cenários) usa `jg:mocks:commerce`. Ambos persistem em `localStorage`; sem storage, o estado de comércio recorre a memória.
- Chaves React Query são organizadas pelas fábricas de sessão, carrinho, NFT/favoritos, pedidos e usuário. A chave do carrinho é `['cart']` e não inclui viewer; o isolamento entre visitantes/usuários é garantido limpando essa raiz no logout/troca de usuário e invalidando-a após login/cadastro. As raízes privadas removidas no logout/troca de usuário são `cartKeys.all`, `orderKeys.all`, `favoritesKeys.all` e `userKeys.all`.
- Logout tenta invalidar a sessão no servidor, mas limpa o estado local mesmo se a requisição falhar: executa `registerPrivateTeardown` pendentes, cancela/remove queries privadas, remove `jg.idempotency.*` de `sessionStorage`, apaga o token e define a sessão como anônima. Depois invalida o carrinho para carregar o viewer atual.
- Chaves de criação de pedido são derivadas do fingerprint do conteúdo e salvas em `sessionStorage` sob `jg.idempotency.*`; tentativas simultâneas com o mesmo conteúdo compartilham a chamada e retries de rede reutilizam a mesma chave. No servidor, a repetição da chave com o mesmo conteúdo devolve o mesmo pedido; a mesma chave com conteúdo diferente responde `idempotency_conflict`. O pedido aceita estados `pending`, `confirmed` e `refused`; após confirmação, somente as quantidades compradas saem do carrinho.

### Eventos Socket.IO e reconciliação REST

O cliente conecta a `wss://realtime.jungle.test`, no path Socket.IO `/socket.io/`, e identifica a sessão pelo evento `session.identify` com o token. Todos os eventos carregam `eventId`, `version` monotônica por recurso, `occurredAt` e `resource`. O cliente valida o envelope, ignora IDs já vistos e versões antigas/iguais para o recurso e registra o disconnect como teardown privado.

| Evento | Dados | Efeito no cliente |
| --- | --- | --- |
| `nft.updated` | `resource: { type: 'nft', id }`; `priceEth` da edição padrão e `editions[]` com `id`, `priceEth` e `remaining`. | Atualiza caches existentes de catálogo, destaques, detalhe e linhas do carrinho; invalida a cotação para recalcular disponibilidade e totais pela API. |
| `order.updated` | `resource: { type: 'order', id }`, `userId` e `data: { status, transactionRef }`. | Só é aplicado se pertencer ao usuário identificado; ignora pedido terminal ou versão antiga e invalida a consulta do pedido. |

O estado REST permanece a fonte autoritativa. Após reconexão, as consultas de NFTs, carrinho e pedidos são invalidadas para reconciliar eventos perdidos. Pedido pendente também tem polling de um segundo como fallback do `order.updated`; o polling termina em estado terminal. O handler MSW emite os mesmos envelopes e restringe eventos de pedido ao usuário identificado.

### Mock e inicialização

MSW 2.15.0 é ativado por `VITE_ENABLE_MOCKS=true` e importado dinamicamente pelo bootstrap; `onlineManager` pausa as consultas enquanto o worker inicia para impedir chamadas antes dos handlers. O mock de realtime usa `@mswjs/socket.io-binding` 0.2.0 e o cliente real `socket.io-client` 4.8.4. Em produção de demonstração, `.env.production` mantém os mocks ativados conforme o enunciado.

### Transporte Socket.IO nos mocks e limitações

O handler de realtime registra `ws.link('wss://realtime.jungle.test')` no MSW e adapta cada conexão com `toSocketIo` de `@mswjs/socket.io-binding`. O client real `socket.io-client` é carregado por import dinâmico em `useRealtimeSync` apenas depois do bootstrap aguardar `worker.start`; conecta com `transports: ['websocket']`, sem fallback de polling HTTP. O binding termina a negociação Socket.IO no WebSocket simulado: o path de transporte `/socket.io/` não é uma rota HTTP/servidor separada do mock. O handler envia ping Engine.IO a cada 20 segundos por `connection.client.send('2')` para manter a conexão mock.

Este transporte simula eventos no worker da página atual: não há servidor remoto Socket.IO, conexão entre navegadores/dispositivos, nem simulação de polling HTTP. Eventos de comércio são disparados pelo estado/controles MSW; a REST permanece necessária para carregar dados e reconciliar alterações.

### Política de cache, retries e sincronização

- `createQueryClient` configura `staleTime` padrão de 30 segundos; o retry padrão permite uma repetição apenas para erros marcados como transitórios, após 300 ms. Falhas de validação e demais erros não transitórios não são repetidos.
- Catálogo e cotação do carrinho usam `keepPreviousData` enquanto carregam os novos parâmetros. A cotação continua sendo obtida/revalidada na API; a revalidação pré-compra usa `staleTime: 0`.
- As consultas que aceitam cancelamento propagam o `AbortSignal` do TanStack Query até Axios. A consulta de sessão deliberadamente não consome esse signal: guards `ensureQueryData` e observers compartilham a mesma busca e o cancelamento quando o último observer desmonta rejeitaria o guard com `CancelledError`.
- Pedido não terminal é consultado novamente a cada segundo como fallback de `order.updated`; consultas de detalhe param quando o pedido chega a `confirmed` ou `refused`.
- Mutations de adicionar/remover/atualizar item e aplicar/remover cupom atualizam a query com a resposta REST e invalidam a raiz do carrinho para reconciliação. Alterar quantidade e remover linha são otimistas; em erro, restauram o snapshot anterior. Favoritos também são otimizados, revertidos em erro e invalidados ao terminar.
- Eventos realtime atualizam caches existentes apenas para o recurso afetado e invalidam cotações/pedidos conforme o contrato acima. Reconexão invalida consultas de catálogo, carrinho e pedidos; REST decide os valores finais.

### Home: banners, Diário da Cunhagem e Footer

`widgets/promo-banners` usa imagens locais do catálogo de mocks em lugar de image fills específicos do Figma; o botão “Explorar” leva para `/?tab=new` ou `/?tab=trending`. `widgets/journal` (“Diário da Cunhagem”) usa conteúdo editorial fixo da demonstração e imagens do catálogo mock; links de leitura levam a `/unavailable?feature=journal`. A newsletter em `widgets/footer` valida o endereço e informa que o cadastro não está disponível, sem simular sucesso. Links de suporte, redes sociais e outros recursos fora do escopo navegam para `/unavailable?feature=...`, conforme a funcionalidade indicada.

### Controles de mock por URL

Com MSW ativo, `app/bootstrap/mock-controls.ts` interpreta `?mockReset=1&mockScenario=<id>` antes de iniciar o worker. `mockReset=1` limpa o estado persistido e restaura os seeds; um identificador válido em `mockScenario` seleciona o cenário (incluindo `default`), e ambos os parâmetros são removidos da barra de endereço após a aplicação. Sem reset nem cenário, o estado persistido não é modificado.

### Deploy

O deploy Vercel está configurado em `vercel.json`: instala com `pnpm install --frozen-lockfile`, builda `@jg/web` pelo Turbo, publica `apps/web/dist` e reescreve rotas SPA para `/index.html`. `apps/web/.env.production` define `VITE_ENABLE_MOCKS=true`, portanto os mocks MSW são incluídos/ativados no build público de demonstração.

### Desvio visual consciente em relação ao Figma

- O seletor de idioma pt-BR/en no header não aparece no Figma; foi acrescentado para cumprir o requisito de i18n do app. Fica visível a partir de 1440 px, inclusive ao lado/sobre o modal desktop de login. Abaixo desse breakpoint, o idioma continua respeitando a preferência `jg:locale` e `navigator.languages`.

### Decisões de fluxo e contrato

- Cadastro envia `displayName` igual ao `username`, embora o formulário peça username. Login/cadastro são modal sobre a Home inerte em desktop e página em mobile.
- Detalhe não possui ação de compartilhar; favoritar exige sessão e não é aplicado automaticamente após o login.
- Carrinho permite remover cada linha, mantém Header/BottomNav globais, apresenta desconto mesmo zerado (`(-) 0,00 ETH`) e formata valores conforme o locale; relacionados aparecem a partir de 768 px.
- No checkout/recibo, o recibo é modal sobre a Home em desktop e página em mobile; a data usa `Intl`, o botão de fechar é acessível e a linha de desconto só aparece quando não é zero.
- Na conta, há um único botão Salvar, o avatar é enviado como data URL e a navegação mobile é horizontal. Campos do Figma sem contrato de API (por exemplo, nome ENS e apelido da carteira) foram omitidos.
