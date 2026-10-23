# HANDOFF — estado em 2026-10-23

Branch `feat/design-system`. Idioma de trabalho: português. Leia nesta ordem: este arquivo, `CLAUDE.md`, `docs/requirements-status.md` (matriz com evidências), `docs/copilot-queue.md`, fim de `docs/agent-communication.md`, `ARCHITECTURE.md`, `README.md`.

## Regras vigentes (decisão do usuário, 2026-10-22/23)
- TDD e commits RED/GREEN **não** são obrigatórios; nunca apagar/enfraquecer testes. Sem exigência de Opus/Sonnet nem de 3 agentes.
- **Máximo de duas frentes simultâneas no total** (Claude: UI/E2E de apresentação/deploy; Copilot: negócio/mocks/realtime/docs). Cada arquivo tem um dono; `git add` só dos próprios caminhos; nada de reset/stash/clean.
- Sem Docker. Não abrir PNGs do Figma (medidas por `docs/figma/file.json`). Playwright via CLI.
- O Copilot só lê o canal enquanto está em execução: dê-lhe uma ordem única ("leia docs/copilot-queue.md e execute em ordem sem parar").
- Único desvio visual consciente a registrar: seletor de idioma pt-BR/en no header (não existe no Figma).
- Worktrees antigos em `.claude/worktrees/` **não** foram removidos (limpar só no fim).

## Pronto e verificado (execução real)
- Telas: Início (hero, catálogo, filtros, banners, Diário da Cunhagem, Footer), detalhe, carrinho, pagamento, recibo, login, cadastro, perfil, carteiras, 404, indisponível; rotas e guards; sessão, logout, troca de usuário; carrinho de visitante com merge no login; idempotência de pedidos; tempo real (Copilot, `e2e/realtime.spec.ts` 8/8 no canal).
- Verificações: `pnpm lint` ok; `tsc --noEmit` ok; `pnpm build` ok; vitest completo rodou (30 falhas de navegador corrigidas, reexecutar a suíte inteira antes da entrega); Playwright completo 1440+390: 283 passaram, 11 falharam (todas tratadas/reexecutadas: ver `docs/requirements-status.md`); tablet 768 (`@tablet`) passou para telas e Home; E2E contra `vite preview` do build passou (36/36 nos specs de compra, visitante e Home).
- Bugs reais corrigidos na sessão: PATCH do carrinho perdia a quantidade; Home reescrevia a URL ao navegar; CancelledError no login causado pelo bridge de tempo real; a11y (nome acessível, landmarks, links sublinhados); overflow do id da transação no mobile.

## Pendências (nenhuma declarada concluída sem evidência)
1. **Deploy Vercel (obrigatório):** `vercel.json` pronto (build `pnpm turbo run build --filter=@jg/web`, saída `apps/web/dist`, rewrite SPA). O CLI nesta máquina está sem login (`pnpm dlx vercel@latest whoami` → logged out). Passo exato: `pnpm dlx vercel@latest login` (ou `VERCEL_TOKEN`) e depois `pnpm dlx vercel@latest deploy --prod` na raiz; conferir refresh em `/cart`, `/checkout`, `/orders/ord-ana-0001` e login Ana. Alternativa sem login: `vercel deploy --temporary` (reivindicável depois). Registrar a URL no README.
2. **Lighthouse (Copilot, fila item 2):** nenhuma medição existe ainda. Metas Perf≥90, A11y≥95, BP≥95, SEO≥90; 3 medições, mediana, Início e detalhe, mobile e desktop; relatórios em `docs/lighthouse/`. Chunk JS >500 kB é o risco de Performance (code splitting por rota em `app/router/router.tsx` é do Claude).
3. **Fila do Copilot** (`docs/copilot-queue.md`): ARCHITECTURE.md (correções + cache/retries + transporte Socket.IO + Home/mocks/deploy), testes de negócio via MSW, E2E de tempo real restantes (checkout com preço alterado, pedido pendente após refresh, outro usuário), checkout limpo, revisão do README, matriz de backend.
4. **Regressão visual:** baselines `win32` em `apps/web/e2e/visual.spec.ts-snapshots` (estáveis em 2 execuções); só valem nesta plataforma. Não há baseline Linux (CI).
5. **Fidelidade ao Figma:** blocos conferidos por texto/medidas; comparação visual pixel a pixel das telas montadas não foi feita (regra: não abrir PNGs).
6. `prompt.md` está com diff de formatação (bullets) não feito por Claude; revisar antes de commitar.
7. Rodar a suíte completa de novo (vitest + Playwright desktop/mobile/tablet) no estado final e atualizar `docs/requirements-status.md`.

## Comandos
Ver `README.md` (dev, build, preview, typecheck, lint, vitest, Playwright, `node ../../tools/e2e-preview.mjs`, `?mockReset=1&mockScenario=<id>`).
