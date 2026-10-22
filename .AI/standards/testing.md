# Testes: TDD e Playwright

## TDD (red → green → refactor)
- **Um comportamento por vez**: um teste vermelho, o mínimo para verde, depois o próximo. Escrever todos os testes antes de qualquer código é o desvio a evitar.
- **RED vale** quando o teste falha por ausência do comportamento (assert que não se cumpre), não por erro de import, typo ou setup. Cole a saída.
- **GREEN** é o código mais simples que passa; generalize só quando um segundo teste exigir (triangulação).
- **Refactor** só no verde, rodando os testes a cada passo.
- Testes verificam comportamento pela interface pública (função exportada, tela, resposta HTTP), não detalhes internos. Mock só nas bordas (rede via MSW); domínio roda real.
- Teste existente não é editado para passar. Se estiver errado, o `test-writer` o corrige com justificativa.
- Proibidos no repositório: `.only`, `.skip`, `test.fixme` sem issue registrada, `--update-snapshots` sem revisão visual do diff.

## Pirâmide
- **Unitário** (Vitest, a confirmar no scaffold): domínio e casos de uso, rápidos e determinísticos.
- **Integração**: adaptador + MSW (contratos REST/Socket.IO).
- **E2E Playwright**: fluxos de tela do enunciado §9, sempre contra os mocks MSW.

## Playwright (CLI: `pnpm exec playwright test|codegen|show-trace`; nunca o MCP)
- **Locators por papel**: `getByRole`, `getByLabel`, `getByText`; `getByTestId` só quando não houver semântica. Sem seletores CSS/XPath frágeis.
- **Asserções web-first** (`await expect(locator).toBeVisible()`, `toHaveURL`, `toHaveText`) que reexecutam sozinhas. Sem `waitForTimeout`; espere por condição observável. `expect.poll` para estado não-DOM.
- **Isolamento**: cada teste com contexto novo e cenário MSW conhecido (reset do estado simulado antes). Nenhum teste depende de outro.
- **Tempo e rede controlados**: `page.clock` para relógio; latência, falhas e timeouts pelos cenários MSW. Eventos Socket.IO são disparados pelo servidor simulado (handler MSW), e o cliente `socket.io-client` real os recebe; nunca por setter, callback ou cache da UI.
- **Viewports** como projects: desktop 1440, tablet 768, mobile 390. Chromium para os fluxos principais.
- **Regressão visual** (`toHaveScreenshot`): início, detalhe, carrinho e pagamento; dados estáveis, animações desligadas (`reducedMotion`, `animations: 'disabled'`), fontes carregadas, baselines versionadas, tolerância explícita no config. Referência inicial: `docs/figma/screens/`.
- **Acessibilidade**: navegação por teclado, foco visível e em diálogos, labels e mensagens associadas. Verificação automática com axe (`@axe-core/playwright`) é recomendada e exige aprovação para instalar.
- **Diagnóstico**: `trace: 'retain-on-failure'`, relatório HTML. Falha → abrir o trace, achar a causa, corrigir o código; aumentar timeout não é correção.
- **Imagens custam tokens (regra do usuário, 2026-10-22):** nenhum agente abre screenshots (Read de PNG) por padrão. Fidelidade ao Figma se verifica de forma determinística: medidas, cores e tipografia lidas de `docs/figma/file.json` e comparadas ao CSS computado em testes (`*.measure.test.tsx`); estrutura e estados, por asserções de DOM/ARIA. Capturas podem ser **geradas** (Playwright CLI) e guardadas para o usuário, sem serem lidas. Abrir uma imagem só quando o usuário pedir ou para um desvio que nenhuma asserção consiga expressar; nesse caso, uma imagem por vez, recortada ou reduzida, e dizer por quê.
- Mapeamento de UI: `playwright codegen` e leitura do DOM acessível; descrever o que foi observado, não o que se espera ver.

## Cenários mínimos
Os 12 do enunciado §9 e os cenários determinísticos do §6 (sucesso, vazio, latência/fora de ordem, falhas 4xx/5xx, sessão expirada, conflito, cupom inválido, preço/edição alterados, timeout com idempotência, pagamento confirmado/recusado).
