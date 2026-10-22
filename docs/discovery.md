# Discovery

Levantamento que antecede os planos de feature. Complementa `design.md` (arquitetura e stack), `docs/flows.md` (fluxogramas) e `docs/routes.md` (mapa de rotas). Fontes: `prompt.md` (enunciado), `docs/figma/` (`frames.json`, `screens/*.png`, `file.json`), o design system entregue e o protótipo de referência. Afirmações sobre o protótipo foram **lidas nos arquivos citados**; o que não foi aberto está marcado "não verificado".

## 1. Matriz requisito do enunciado → feature

| Enunciado | Requisito | Feature (roadmap `design.md` §10) |
|---|---|---|
| §3 Início | destaques, catálogo, busca, filtros, ordenação, navegação para o NFT | **Home** (plano `home`, ver §5) |
| §3 Detalhes | galeria, edição, quantidade, favoritos, compra | F4 |
| §3 Carrinho | quantidades, remoção, cupom, resumo | F5 |
| §3 Pagamento / Confirmação | carteira/rede, revisão, pedido idempotente, recibo | F6 |
| §3 Login / Cadastro | autenticação, validação, retorno ao fluxo, conflito | F2 |
| §3 Perfil / Carteiras | edição, avatar, senha, carteiras | F8 |
| §4 Integração e estado | Router, Query, Axios, cancelamento, isolamento por usuário | F2 em diante (base na Home) |
| §6 MSW | cenários, persistência, reset, socket | F1 (a Home leva só o mock do catálogo) |
| §7 Socket.IO | `nft.updated`, `order.updated`, reconciliação | F7 |
| §8 UI/acessibilidade | skeleton com shimmer, foco, teclado, 390/768/1440 | todas |
| §9 Playwright | 12 fluxos; regressão visual de início/detalhe/carrinho/pagamento | F9 (Home entrega o fluxo 1 e 12 no seu escopo) |
| §10 Lighthouse | início e detalhe | F9 |
| Adicionais do usuário | i18n pt-BR/en desde o zero; boas práticas de componentização | F0a e F0b, e toda feature |

## 2. Figma

Inventário completo e inconsistências do Figma: `design.md` §2. Frames da Home: desktop `2:2` (1440×3668) e mobile `14:5226` (414×896; validar em 390). Não há frame de tablet (768): derivado.

## 3. Protótipo de referência (validado com parcimônia)

Local: `C:\Users\opera\OneDrive\Documentos\Frontend -Marketplace-de-NFTs\Frontend-Marketplace-de-NFTs-1\`. Contém só a fundação e a Home parcial: `src/router.tsx`, `src/features/{catalog,header,footer,home}`, `src/mocks/{browser,data,handlers}.ts`, `src/shared/api/{client,contracts}.ts`, `e2e/*.spec.ts`. Não há login, carrinho, detalhe, pedidos nem socket funcionando.

| Item | O que foi lido | Decisão |
|---|---|---|
| Router de código (`createRootRoute`, `validateSearch`, `Register`) | `src/router.tsx` | **Reaproveitar o padrão** (rota raiz com header/outlet/footer; `validateSearch` por rota); reescrever com schema e ids estáveis |
| Parser de search params do catálogo | `src/features/catalog/catalog-search.ts` | **Reaproveitar a ideia** (normaliza arrays, descarta valores inválidos); os valores aqui são nomes em pt-BR |
| Categorias e redes como união de strings em pt-BR (`"Arte digital"`, `"Música"`…) | `catalog-search.ts`, `contracts.ts`, `handlers.ts` | **Não reaproveitar**: viola o i18n (chave = texto). Usar ids estáveis (`digital-art`, `music`…) e traduzir no app |
| `ApiError.message` com texto | `contracts.ts` | **Não reaproveitar**: a API devolve só `code` e `fieldErrors` por código; o texto é do app |
| `ethToWei` com `BigInt` e validação por regex | `handlers.ts` | **Reaproveitar a abordagem** (valida a ideia de domínio em inteiro de 18 casas); mover para `shared/lib` testado, fora do mock |
| Cenários `default`, `catalog-error`, `empty-catalog` | `contracts.ts`, `handlers.ts` | **Reaproveitar o conceito**; a lista completa está no enunciado §6 (entra em F1; a Home usa estes três mais latência) |
| Contagens fixas (33, 12, 65…) no código do catálogo | `catalog-search.ts` | **Não reaproveitar**: contagens vêm da API (facetas), não do front |
| Spike de `@mswjs/socket.io-binding` | `docs/agents/LEARNINGS.md` | **Risco mantido**: handshake não conectou; não declarar tempo real funcional sem teste com `socket.io-client` (F1/F7) |
| Fontes locais Roboto Mono | `LEARNINGS.md` | Já resolvido no design system (`src/fonts/`, OFL) |
| E2E (`e2e/*.spec.ts`) | não aberto | **Não verificado**; os E2E novos seguem o padrão do `testing.md` |

## 4. Decisões de rotina tomadas neste levantamento (delegadas pelo usuário)

- Roteamento por **árvore de código** (como no protótipo), sem plugin de geração de rotas: nenhuma dependência extra.
- **Ids estáveis** (slugs) para coleções, redes e ordenações na URL e na API; rótulos vêm do i18n.
- **Idioma em estado** (persistido + `<html lang>`), sem prefixo na URL: não duplica rotas nem o mapa de rotas.
- Home e telas de conta/checkout usam o mesmo `Layout` raiz (header, outlet, footer); no mobile, a barra inferior é um widget do layout.
- Conteúdo editorial do catálogo (título, descrição) é dado do mock em pt-BR; a interface é totalmente i18n. Registrar como limitação em `ARCHITECTURE.md` (decidir se o servidor passa a localizar via `Accept-Language`).

## 5. Home: recorte para o plano `home`

Escopo pedido: **somente a Home responsiva** (1440, 768, 390), sem avançar para outras páginas. Como a Home depende de infraestrutura que ainda não existe, o plano precisa incluir o mínimo dela (e nada além):

- **Shell do app (parte de F0b):** providers (Query, Router, i18n), layout raiz com header e footer, estilo, regras FSD/qualidade/i18n no lint.
- **i18n (F0b):** biblioteca, recursos pt-BR e en, seletor de idioma. Depende de `design-system-i18n` (F0a) concluído.
- **Dados do catálogo:** cliente Axios mínimo, contrato `GET /api/nfts` (busca, filtros, ordenação, paginação) e facetas, mock MSW só do catálogo, com cenários `default`, vazio, erro e lentidão, e fixtures com variedade (≥ 40 NFTs para paginar).
- **UI:** header (logo, navegação, busca, carrinho com contador, "Entrar"), hero com CTA "Explorar", barra lateral (coleções com contagem, faixa de preço com `RangeSlider` e Aplicar, rede), abas Todos/Novos lançamentos/Em alta, ordenação (`Select`), grade de `NftCard` (3 colunas no desktop; 2 no mobile), paginação, banners, "NFT em destaque", rodapé; no mobile, busca, botão de filtros (`Sheet`), hero compacto e barra inferior.
- **Estados:** skeleton com shimmer (`NftCardSkeleton`), vazio, erro com nova tentativa, atualização em segundo plano; URL como fonte do estado; cancelamento de resposta obsoleta.
- **Fora do escopo da Home:** login/cadastro (o botão "Entrar" leva à rota de login ainda inexistente: tratar como ação fora do escopo, ver `docs/routes.md` §5), carrinho e contador real (valor fixo/zero até F5), favoritar (exige sessão), tempo real, páginas editoriais ("Diário da Cunhagem", "Ler mais", rodapé), newsletter funcional.
- **Navegação do card:** o título leva a `/nfts/$nftId`; como o detalhe é F4, a rota existe só como destino coerente (página "ainda não disponível") até lá. Ver `docs/routes.md`.

## 6. Lacunas e perguntas abertas

- Tablet 768 e 390 sem frame: derivados (ADR-12 do design system).
- Desktop: onde fica a busca (ícone no header abre campo?). O Figma mostra só o ícone; mobile mostra campo "Explorar coleções". **Assumido:** no desktop o ícone abre um campo de busca acessível no header; mobile segue o frame.
- "Novos lançamentos" e "Em alta" como abas: o Figma não define o critério. **Assumido:** `new` = ordenado por data de lançamento; `trending` = ordenado por popularidade (campos que já existem no contrato do protótipo: `popularity`).
- Hero: três pontos indicam carrossel; o Figma não define conteúdo nem tempo. **Assumido:** 3 destaques vindos da API, troca manual (sem autoplay, por acessibilidade).
- "NFT em destaque / Oferta limitada" na barra lateral: dado do catálogo (`featured`); sem lógica de oferta nesta fase.
- Itens de menu fora do escopo ("Criadores", "Aprenda", "Mercado" vs "Início"): ver `docs/routes.md` §5.
