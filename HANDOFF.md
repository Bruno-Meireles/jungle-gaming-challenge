# HANDOFF — estado em 2026-10-23

Branch `feat/design-system`. Idioma de trabalho: português. Leia nesta ordem: este arquivo, `CLAUDE.md`, `docs/requirements-status.md` (matriz com evidências), `docs/copilot-queue.md`, fim de `docs/agent-communication.md`, `ARCHITECTURE.md`, `README.md`.

## Regras vigentes (decisão do usuário, 2026-10-22/23)
- TDD e commits RED/GREEN **não** são obrigatórios; nunca apagar/enfraquecer testes. Sem exigência de Opus/Sonnet nem de 3 agentes.
- **Máximo de duas frentes simultâneas no total** (Claude: UI/E2E de apresentação/deploy; Copilot: negócio/mocks/realtime/docs). Cada arquivo tem um dono; `git add` só dos próprios caminhos; nada de reset/stash/clean.
- Sem Docker. Não abrir PNGs do Figma (medidas por `docs/figma/file.json`). Playwright via CLI.
- O Copilot só lê o canal enquanto está em execução: dê-lhe uma ordem única ("leia docs/copilot-queue.md e execute em ordem sem parar").
- Seletor de idioma pt-BR/en removido a pedido do usuário; o idioma é resolvido pela preferência já salva, `navigator.languages` e fallback pt-BR.
- Worktrees antigos em `.claude/worktrees/` **não** foram removidos (limpar só no fim).

## Pronto e verificado (execução real)
- Telas: Início (hero, catálogo, filtros, banners, Diário da Cunhagem, Footer), detalhe, carrinho, pagamento, recibo, login, cadastro, perfil, carteiras, 404, indisponível; rotas e guards; sessão, logout, troca de usuário; carrinho de visitante com merge no login; idempotência de pedidos; tempo real (Copilot, `e2e/realtime.spec.ts` 8/8 no canal).
- Verificações: `pnpm lint` ok; `tsc --noEmit` ok; `pnpm build` ok; vitest completo rodou (30 falhas de navegador corrigidas, reexecutar a suíte inteira antes da entrega); Playwright completo 1440+390: 283 passaram, 11 falharam (todas tratadas/reexecutadas: ver `docs/requirements-status.md`); tablet 768 (`@tablet`) passou para telas e Home; E2E contra `vite preview` do build passou (36/36 nos specs de compra, visitante e Home).
- Bugs reais corrigidos na sessão: PATCH do carrinho perdia a quantidade; Home reescrevia a URL ao navegar; CancelledError no login causado pelo bridge de tempo real; a11y (nome acessível, landmarks, links sublinhados); overflow do id da transação no mobile.

## Pendências (nenhuma declarada concluída sem evidência)
1. **Deploy Vercel (obrigatorio, NAO feito):** CLI 65.2.0 instalada e logada (`vercel whoami` = bruno-meireles). Ordem combinada: merge na `main` -> validacao manual do usuario -> `vercel deploy --prod` na raiz (vercel.json: build `pnpm turbo run build --filter=@jg/web`, saida `apps/web/dist`, rewrite SPA). Conferir refresh em `/cart`, `/checkout`, `/orders/ord-ana-0001` e login Ana; registrar URL no README. MCP da Vercel adicionado ao escopo do usuario (OAuth pendente); `vercel-plugin` nao instalado (pedia confirmacao interativa).
2. **Lighthouse (medido, meta de Performance NAO atingida):** Perf 49/30/58/32 (Home mobile/desktop, detalhe mobile/desktop); A11y/BP/SEO 100. Detalhes e ressalva de causalidade em `docs/lighthouse/README.md`. Proximo passo possivel: reduzir JS de boot (bundle 509 kB + chunk MSW 468 kB) sem desativar mocks e re-medir.
3. **Testes na verificacao final:** vitest 1138 ok/3 timeouts sob carga; Playwright 295 ok/5 timeouts de 30s, todos passam isolados (ver `docs/requirements-status.md`). Reconexao automatica do mesmo socket: parcial.
3. **Fila do Copilot** (`docs/copilot-queue.md`): ARCHITECTURE.md (correções + cache/retries + transporte Socket.IO + Home/mocks/deploy), testes de negócio via MSW, E2E de tempo real restantes (checkout com preço alterado, pedido pendente após refresh, outro usuário), checkout limpo, revisão do README, matriz de backend.
4. **Regressão visual:** baselines `win32` em `apps/web/e2e/visual.spec.ts-snapshots` (estáveis em 2 execuções); só valem nesta plataforma. Não há baseline Linux (CI).
5. **Fidelidade ao Figma:** blocos conferidos por texto/medidas; comparação visual pixel a pixel das telas montadas não foi feita (regra: não abrir PNGs).
6. `prompt.md` está com diff de formatação (bullets) não feito por Claude; revisar antes de commitar.
7. Rodar a suíte completa de novo (vitest + Playwright desktop/mobile/tablet) no estado final e atualizar `docs/requirements-status.md`.

## Comandos
Ver `README.md` (dev, build, preview, typecheck, lint, vitest, Playwright, `node ../../tools/e2e-preview.mjs`, `?mockReset=1&mockScenario=<id>`).
