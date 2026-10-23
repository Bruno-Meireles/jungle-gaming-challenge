# HANDOFF: continuar até o fim em outro coding agent

Atualizado em 2026-10-22. Idioma de trabalho: português. Branch atual: `feat/design-system`. Último commit relevante: `f120c5d`.

## 0. Primeiros 10 minutos (faça nesta ordem)
1. Leia, nesta ordem: este arquivo, `CLAUDE.md`, `prompt.md` (**lei**: tudo o que o enunciado exige precisa existir; nada o remove), `.AI/standards/{grounding,architecture,testing,i18n-quality}.md`.
2. Leia o **fim** de `docs/agent-communication.md` (canal com o Copilot, mensagens em ordem cronológica) e `.AI/plans/decisions.md`, `.AI/plans/test-debt.md`.
3. `git log --oneline | head -40`, `git status --short`, `git worktree list`.
4. **Há trabalho não commitado** (working tree sujo: entities de cart/order, pages login/signup, router, shared/api, i18n). Eram agentes em paralelo no mesmo tree. NÃO faça `git reset`, `git checkout .`, `git stash` nem `git clean`. Rode `pnpm --filter @jg/web exec tsc --noEmit` e `eslint`, corrija o que quebrar e commite por slice (`git add` de caminhos específicos).
5. Stubs de 0 bytes = lacunas reais: `find apps/web/src -size 0 -type f`. Hoje: `app/session/private-session.ts`, `features/auth/model/logout.ts` (e seus testes `*.node.test.ts`), `mocks/orders-api.node.test.ts`, `mocks/reset.node.test.ts`.

## 1. A operação que o usuário mandou (siga exatamente)
O usuário quer **paralelismo máximo, sem parar até tudo estar pronto**, e se irrita com lentidão e com esperar por aprovação.
- **Vigia do canal**: um subagente em segundo plano que fica olhando `docs/agent-communication.md` (loop `until` comparando hash/tamanho, sleep 5, ~9 min por chamada, repetindo), responde dúvidas do Copilot via `architect`, registra decisões, escreve `DESTRAVADO: <recurso> em <caminho>` e arbitra conflitos. Só edita o canal, `ARCHITECTURE.md`, `.AI/plans/decisions.md` e planos; nunca código. Se o vigia não estiver rodando (a sessão anterior acabou), **suba um novo** (ou um `Monitor` de shell com filtro que NÃO case suas próprias mensagens; o anterior ficava ruidoso por casar "Copilot:" em texto meu).
- **Você orquestra sem parar**: quando uma tela termina, dispare planejamento e implementação da próxima automaticamente. Um agente de pipeline por tela, em paralelo; cada um faz plano (`architect`), implementação e commit.
- **Não replicar trabalho**: cada agente só toca nos seus slices; `git add` só dos seus caminhos (nunca `git add -A`).
- **Avisar arquivos em edição** no canal antes de editar áreas compartilhadas (ex.: `features/auth/index.ts`, `app/i18n/resources.ts`, `app/router/router.tsx`).
- **TDD não é mais obrigatório (decisão do usuário, 2026-10-22, definitiva)**: implemente e depois valide os comportamentos essenciais; sem commits RED/GREEN separados. Nunca apague/enfraqueça testes existentes. Dívida de testes (`.AI/plans/test-debt.md`): pague o que for essencial para os requisitos do enunciado antes da entrega.
- **E2E Playwright só no fim**: depois de tudo pronto, um agente mapeia e cobre todas as telas com Playwright **CLI (não o MCP)**, em pt-BR e en, 1440 e 390, com axe. Não use Playwright antes.
- **Agentes/modelos**: sem exigência de Opus/Sonnet nem de três agentes. **Máximo de DUAS frentes simultâneas no total** (Claude, Copilot e subagentes somados); registre responsável/tarefa/arquivos em `docs/agent-communication.md` antes de iniciar; não crie agentes extras por etapa.
- **Sem Docker, nunca.** **Não leia PNGs do Figma**: use `docs/figma/file.json`/`frames.json` (textos e medidas via node).
- Responda dúvidas importantes com o subagente certo e **registre a decisão** no canal e em `decisions.md`.
- Deploy público **só no fim** (F9), por decisão do usuário.

## 2. Divisão de papéis
- **Claude (apresentação)**: `pages/**`, `widgets/**`, `features/*/ui/**`, locales, `app/router/**`, E2E de tela.
- **Negócio**: contratos `shared/api/contracts/*`, `entities/**`, `features/*/model`, `app/session`, `mocks/**`. Foi do Copilot, mas ele esteve ausente (arquivos vazios; trocou de conta). Agentes do Claude assumiram auth/sessão/conta (prontos) e comércio (cart, order, favoritos; em andamento). Ao Copilot foi atribuído (mensagem de 02:00 no canal): **A** tempo real (`entities/realtime`, `mocks/realtime`, socket.io-client REAL), **B** `logout.ts` e `private-session.ts`, **C** `ARCHITECTURE.md`, **D** scripts de Lighthouse. **Confira no canal e no git se algum foi feito**; o que não foi, assuma você.

## 3. Estado por frente (verifique com git; isto é o último que sei)
| Frente | Estado |
|---|---|
| Monorepo, design system (25 comps), i18n pt-BR/en | pronto |
| Home `/`, 404, `/unavailable` | pronto (deploy M7 adiado para F9) |
| Auth: safeRedirect, LoginForm/SignupForm (44 testes), contratos, `entities/session`, `useLogin/useRegister`, handlers | pronto e commitado |
| Auth: pages login/signup + AuthSurface (modal sobre Home `inert` no desktop) | GREEN commitado `03975c7`; ajustes não commitados |
| Conta (perfil, senha, carteiras): hooks e handlers | pronto (`0c56593`); UI `pages/account` com RED commitado, GREEN a conferir |
| nft-detail (F4) | plano + RED commitados (`5514187`); código de widgets em `widgets/nft-*`; a conferir |
| cart (F5) | `widgets/cart-lines`, `cart-summary`, `pages/cart` existem; contrato `commerce.ts` e `entities/cart` em andamento (não commitados) |
| checkout-orders (F6) | RED bloco S commitado (`ed48dc9`); `pages/checkout`, `pages/order-receipt`, `widgets/checkout`, `widgets/order-receipt` existem |
| Comércio negócio (cart, order, idempotência, favoritos, handlers) | parcial, não commitado |
| Tempo real Socket.IO + reconciliação | **não feito** (o handshake do `@mswjs/socket.io-binding` já falhou no protótipo; só vale com teste usando `socket.io-client` real) |
| Rotas finais no `router.tsx` | parcial (login/signup ligados); substituir stubs de `/cart`, `/nfts/$nftId`, `/checkout`, `/orders/$orderId`, `/account/*` e adicionar guards `beforeLoad` (A → `/login?redirect=...`) |
| `logout`/`clearPrivateSessionState` | **não feito** (0 bytes) |
| README.md, ARCHITECTURE.md, scripts (dev/build/preview/typecheck/lint/playwright/lighthouse), Lighthouse, deploy | **não feitos** |
| E2E Playwright de todas as telas | **não feito** (só no fim) |

## 4. Worktrees (estado real)
- `git worktree list` mostra o tree principal (`feat/design-system`) e **26 worktrees antigos** em `.claude/worktrees/agent-*` (branches `worktree-agent-*`), sobras de execuções anteriores de subagentes isolados. **Nenhum agente desta fase os usa**: todo o trabalho recente aconteceu no tree principal, porque o código de negócio ainda não estava commitado e worktrees saem do HEAD.
- Não os apague às cegas: antes, `git -C <path> log -1` e `git -C <path> status --short`; se tiver commit útil não mergeado, traga com cherry-pick. Depois de conferir, `git worktree remove <path>` e `git branch -D worktree-agent-*`. Isso é limpeza para o fim, não bloqueia nada.
- Se quiser paralelismo real com worktrees: primeiro **commite tudo** no tree principal (senão o worktree não vê o código), crie um worktree por tela, e mescle por tela. Atenção a conflitos em `router.tsx`, `resources.ts`, `features/auth/index.ts`: um único dono por vez.

## 5. Como cada tela é entregue (pipeline por tela)
1. Plano em `.AI/plans/<feature>.md` (use `architect`; o usuário já delegou a aprovação).
2. Implementação direta (sem TDD por ora); i18n em `config/locales` do slice + registro em `app/i18n/resources.ts` (só acrescentar); componentes do `@jg/design-system` sempre que existirem; estados loading/vazio/erro/sucesso; a11y; ETH string decimal.
3. `pnpm --filter @jg/web exec tsc --noEmit` e `eslint --max-warnings 0` nos caminhos tocados; commit `feat(green): <feature> ...`.
4. Exportar a página em `pages/<x>/index.ts`; ligar a rota em `app/router/router.tsx` (um dono por vez).

## 6. Regras técnicas que não podem quebrar
FSD `app > pages > widgets > features > entities > shared` (import só para baixo; entre slices da mesma camada não; acesso via `index.ts`); Clean Architecture sem React/Axios/TanStack/MSW no domínio; mocks só na camada MSW; ETH como string decimal (`shared/lib/eth`); pedidos com `Idempotency-Key`; eventos Socket.IO idempotentes/versionados via `socket.io-client`; logout limpa cache privado e subscriptions; nenhum texto hardcoded (lint de JSX literals); design system sem texto de interface.

## 7. Decisões já tomadas (registrar também em ARCHITECTURE.md)
- Fundo do modal de login/cadastro no desktop = Home `inert` (alternativa descartada: background location).
- Cadastro tem 4 campos no Figma; `displayName = username` na API (desvio do Figma).
- Token em `localStorage` `jg.session.token`; `expiresAt` na resposta de auth; 401 `session_invalid` ou `{user:null}` = anônimo e apaga token; 5xx/rede não desloga.
- 409 de conflito traz `fields`; 400 traz `fieldErrors`.
- `shared/api/query-roots.ts` (raiz `session`) evita import entre entities; `fetchSession` em `entities/session/api`.
- Handlers MSW com prefixo `*/api/...` (caminho relativo não casa em testes node).
- Credenciais fictícias: `ana@example.test` / `JungleDemo-Ana-2026!` (com carteira) e `bruno@example.test` / `JungleDemo-Bruno-2026!` (sem). Só hash+sal no mock. Cenários `auth_network_error` e `auth_server_error`; reset em `mocks/reset.ts`.
- "Esqueceu a senha?" e login social levam a `/unavailable?feature=...` (a chave `forgot-password` foi adicionada em `pages/unavailable`; confira).
- Fora do escopo: login social funcional, recuperação de senha.

## 8. Checklist final (prompt.md)
- [ ] Working tree commitado e `tsc`/`eslint` limpos; stubs de 0 bytes resolvidos.
- [ ] Todas as telas (Home, detalhe, carrinho, checkout, recibo, login, cadastro, conta/perfil, conta/carteiras, 404, indisponível) em 1440, 768 e 390, com estados.
- [ ] Rotas finais e guards; sessão expirada; logout.
- [ ] Tempo real com `socket.io-client` real + reconciliação + cleanup.
- [ ] Suíte toda verde; pagar a dívida essencial de `.AI/plans/test-debt.md` (TDD não é mais obrigatório).
- [ ] E2E Playwright CLI de todas as telas (pt-BR/en, 1440/390, axe).
- [ ] `README.md` (setup, envs, credenciais fictícias, cenários/reset, comandos), `ARCHITECTURE.md` (contratos REST/eventos, sessão, carrinho, cache, reconciliação, desvios do Figma), seção "Comandos" do `CLAUDE.md`.
- [ ] Scripts: dev com mocks, build, preview, typecheck, lint, Playwright, Lighthouse (3 medições, mediana; Perf ≥90, A11y ≥95, BP ≥95, SEO ≥90).
- [ ] Limpar worktrees antigos (só ao final; não remover agora).
- [ ] Deploy público (Vercel/Netlify/Cloudflare Pages) com mocks ativos no build.
