# HANDOFF (para o próximo coding agent)

Atualizado em 2026-10-22. Leia isto primeiro, depois `CLAUDE.md` e `prompt.md` (lei: tudo o que o enunciado exige precisa existir). Idioma da equipe: português.

## Regras que continuam valendo
- `prompt.md` é a fonte da verdade; `CLAUDE.md` e `.AI/standards/*.md` (grounding, architecture, testing, i18n-quality).
- Clean Architecture + FSD: `app > pages > widgets > features > entities > shared`, imports só para baixo, acesso a slices via `index.ts`; entre slices da mesma camada não se importa.
- i18n pt-BR e en desde o zero: nenhum texto hardcoded; o design system não embute texto.
- ETH sempre string decimal (`shared/lib/eth`); mocks só na camada MSW; pedidos com Idempotency-Key; logout limpa cache e subscriptions; Socket.IO via `socket.io-client` real.
- Proibido Docker. Não leia PNGs do Figma: use `docs/figma/file.json` e `frames.json` (medidas/textos).
- Commits por etapa, só dos seus caminhos; nunca `git add -A`, nunca reset/stash de arquivos alheios. Trailer: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Deploy público só no fim (F9), por decisão do usuário.

## Exceção temporária do usuário (2026-10-22): SEM TDD por ora
O usuário suspendeu TDD para terminar tudo rápido. Produção direta, sem RED. A dívida de testes está em `.AI/plans/test-debt.md`. Depois de tudo funcionando, voltar ao TDD: pagar a dívida, restaurar testes vermelhos e rodar a suíte inteira.
Modelos: por decisão temporária do usuário, os três agentes de `.claude/agents/` (architect, test-writer, code-writer) rodam em **Haiku, effort low** (o enunciado pede architect=Opus e os outros Sonnet: restaurar no fim). Subagentes avulsos: passar `model: haiku`, `effort: low`.
Também pedido: **E2E Playwright (CLI, não MCP) só no fim**, mapeando todas as telas quando tudo estiver pronto.

## Canal Claude ↔ Copilot
`docs/agent-communication.md` (versionado; a cópia em `.turbo/cache/docs` é descartável). Só acrescentar linhas, avisar arquivos em edição, registrar `DESTRAVADO: <recurso> em <caminho>`. Divisão: Claude = apresentação (pages, widgets, `features/*/ui`, i18n, `app/router`); Copilot = tempo real (`entities/realtime`, `mocks/realtime`), logout/`private-session`, `ARCHITECTURE.md`, scripts de Lighthouse. Agentes de negócio do Claude assumiram contratos/entities/handlers quando o Copilot estava ausente.

## Estado (veja `git log` e `.AI/plans/*.md` para o detalhe)
- Pronto: monorepo, design system (25 componentes), Home (rota `/`), 404, `/unavailable`, safeRedirect, formulários de login/cadastro (44 testes), contratos e hooks de auth/sessão/conta, handlers MSW de auth/conta.
- Em andamento por agentes em paralelo (confira commits e `pages/*/index.ts`): `nft-detail`, `cart`, `checkout-orders`, `account`, páginas `login`/`signup` + `app/router/router.tsx`, comércio (`commerce.ts`, `entities/cart`, `entities/order`, favoritos, handlers cart/orders/favorites).
- Provável pendente: tempo real (Socket.IO real, eventos versionados/idempotentes, reconciliação), `logout.ts`/`private-session.ts`, rotas finais no router (substituir stubs de `/cart`, `/nfts/$nftId`, `/checkout`, `/orders/$orderId`, `/account/*`), chave `forgot-password` em `pages/unavailable`.

## Como descobrir o que falta
1. `git log --oneline | head -40` e `git status --short`.
2. `.AI/plans/*.md` (seção Progresso), `.AI/plans/test-debt.md`, fim de `docs/agent-communication.md`.
3. `find apps/web/src -size 0` lista stubs de 0 bytes (são lacunas, não implementados).
4. `docs/routes.md` §2: cada rota precisa de página real, estados (loading/vazio/erro), guards e i18n.
5. Rode `pnpm --filter @jg/web exec tsc --noEmit` e `eslint`; ambos devem ficar limpos.

## Checklist final (prompt.md)
- [ ] Todas as telas: Home, detalhe do NFT, carrinho, checkout, recibo, login, cadastro, conta (perfil e carteiras), 404, indisponível; desktop 1440, tablet 768, mobile 390.
- [ ] Tempo real funcional com `socket.io-client` real + reconciliação + cleanup no logout.
- [ ] Dívida de testes paga; unit/integração verdes; E2E Playwright mapeando todas as telas (dois idiomas, 1440 e 390), axe sem violações.
- [ ] `README.md` (setup, envs, credenciais fictícias `ana@example.test` / `JungleDemo-Ana-2026!`, `bruno@example.test` / `JungleDemo-Bruno-2026!`, cenários e reset, comandos) e `ARCHITECTURE.md` (contratos REST/eventos, sessão, carrinho, cache, reconciliação, desvios do Figma e decisões, ex.: displayName=username, fundo do modal = Home).
- [ ] Scripts: dev com mocks, build, preview, typecheck, lint, Playwright, Lighthouse (3 medições, mediana; Perf ≥90, A11y ≥95, BP ≥95, SEO ≥90).
- [ ] Deploy público (Vercel/Netlify/Cloudflare Pages) com mocks ativos no build, só no fim.
- [ ] Atualizar a seção "Comandos" do `CLAUDE.md` com os comandos reais.
