# Plano: verificacao-visual-final

Autor do plano: `architect` (Opus), gravado por `/plan-create`. Infraestrutura de testes e processo, sem tela nova. Substitui a proposta `local-playwright-sem-docker` (baselines `win32` e fnm), que **não foi gravada** e está descartada por decisão do usuário.

## Decisões do usuário (2026-10-22)

Decisão literal (mensagem do usuário em /plan-create):

1. Durante o desenvolvimento, golden de imagem e Docker deixam de ser verificação obrigatória; saem do fluxo padrão e do `verify` cotidiano. Ficam comportamento, integração, acessibilidade, typecheck e lint.
2. No DS, snapshots estáveis e relevantes de dados e estrutura renderizada para contratos de saída; sem snapshots indiscriminados, nunca como substitutos de teste de comportamento; consolidar após operações completas nos componentes e finalizar ao concluir o projeto.
3. Golden de imagem do DS adiado para a etapa final, com Docker; baselines existentes preservadas, sem atualização automática nem exclusão.
4. Nas telas, Playwright CLI para fluxos e fidelidade ao Figma, sem aprovação de snapshot a cada alteração.
5. Regressão visual das páginas (início, detalhe, carrinho e pagamento) preservada, com baselines versionadas e dados estáveis, consolidada na etapa final; snapshots de DOM não a substituem.
6. Registrar em ADR; atualizar README, planos e scripts; não criar infraestrutura desnecessária.

Respostas às lacunas (AskUserQuestion):

- **Q1** Criar `README.md` mínimo na raiz (só a seção Comandos) e atualizar o `CLAUDE.md` (Estado atual e Comandos): **aprovado pelo usuário**.
- **Q2, Q3/Q4, Q5** **Assumidas com aprovação** ("Aceitar todas"): (Q2) não rodar `verify:final` nesta feature; a composição é provada por guardas e dry run do turbo, a execução real fica para a etapa final; (Q3/Q4) confirmar no GREEN se `--force` existe no turbo 2.11.10 e como o Vitest grava snapshot novo no browser mode, registrando o desvio; (Q5) regressão das páginas em 1440 e 390 obrigatórios, variante en como em `design.md:122`, 768 só se o tablet tiver composição própria (decisão na etapa final).
- **Pendentes, sem resposta, fora deste plano:** ordem Home × app-shell (ver "Próximo plano") e guia de gerenciador de versão (fnm/nvm/asdf). Nada neste plano os assume.

## 1. Requisitos cobertos

| § | Trecho | Como esta feature atende |
|---|---|---|
| prompt.md:235 (§9) | "Inclua regressão visual de início, detalhe, carrinho e pagamento, com baselines versionadas e dados estáveis" | Preservada; consolidada na etapa final (F9), `verify:final` |
| prompt.md:10-12 | desenvolvimento de telas com Playwright CLI | Mantido, sem aprovação de snapshot por alteração (§3.3) |
| prompt.md:285 (§12) | comandos de tipos, lint, testes Playwright | Dois alvos documentados: `verify` cotidiano e `verify:final` |
| prompt.md:281 | README com comandos de execução | `README.md` mínimo na raiz (Q1) |
| prompt.md:5, `testing.md:10` | TDD; `--update-snapshots` sem revisão proibido | Mantidos e guardados por teste (S3) |
| Pedido do usuário | itens 1 a 6 acima | Todo o plano |

## 2. Slice FSD / estrutura

Não se aplica: sem slice de app nem componente.

| Peça | Local | Mudança |
|---|---|---|
| Scripts | `package.json` (raiz) | `verify` perde `storybook:build test:visual`; nasce `verify:final` |
| Turbo | `turbo.json` | nenhuma (`test:visual` segue com `dependsOn: ["storybook:build"]`) |
| Ferramentas | `tools/visual.mjs`, `tools/visual-docker.mjs` | **nenhuma**; basta não chamá-las no `verify` |
| DS | `packages/design-system/package.json`, `playwright.config.ts` | nenhuma |
| Guarda | `packages/design-system/tests/verify-scripts.node.test.ts` (novo) | projeto `node` do Vitest |
| Docs | ver §3.5 | só texto |

Dependências permitidas: nenhuma nova (a guarda usa `node:fs` e `vitest`).

## 3. Contratos

### 3.1 Scripts (mínimo de mudança)

| Script (raiz) | Hoje | Proposto |
|---|---|---|
| `verify` | `turbo run lint typecheck test build storybook:build test:visual` | `turbo run lint typecheck test build` |
| `verify:final` | não existe | `pnpm verify && turbo run test:visual --force` |
| `test:visual`, `storybook:build` | iguais | iguais (uso manual ou final) |

- `storybook:build` sai do `verify`: o único consumidor de `storybook-static` é o golden (`golden/golden.spec.ts:7-9`); o a11y das stories roda no projeto Vitest `storybook` (`vitest.config.ts:46-58`) sem build estático.
- O golden roda **depois** do restante, em série, atacando a causa do timeout registrado (cold start do Docker disputando CPU com os Chromium do Vitest). Nenhum timeout é alterado.
- `--force` evita que o cache do turbo "passe" o golden sem executar; **não verificado** em turbo 2.11.10: conferir com `--help` no GREEN de S2 e, se não existir, usar `--cache=local:r` ou retirar a flag, registrando o desvio.
- `test:visual:update` só existe no DS e só é chamado à mão; S3 prova que nenhum agregador o chama.
- Quando o app tiver E2E, `test:e2e` (só comportamento, sem `toHaveScreenshot`) entra no `verify`; a regressão das páginas entra em `verify:final`. Decisão dos planos dessas features.

### 3.2 Snapshots de DOM e de dados no DS

- **Ferramenta:** `toMatchInlineSnapshot`/`toMatchSnapshot` existem em vitest 5.0.5 (`vitest/dist/index.d.ts:120,140`); sem dependência nova. `toMatchAriaSnapshot` não existe; não usar. **Não verificado:** escrita de snapshot novo no browser mode e com `CI` definido; confirmar no primeiro uso (Q3).
- **Merece:** estrutura acessível normalizada de componentes compostos (papel, nome acessível, `aria-current`/`disabled`/`invalid`/`modal`, `data-slot`, hierarquia, relações `aria-describedby`/`labelledby` resolvidas para o texto do alvo); candidatos `NftCard`, `Pagination`, `Breadcrumb`, `FormField` com erro e dica, `Dialog` aberto, `Select` aberto, `Tabs`.
- **Não merece:** classes, estilos, tokens (já cobertos por medidas, ADR-08); ids gerados; atributos internos do Radix; primitives triviais (`Separator`, `Skeleton`, `Badge`, `Label`, `VisuallyHidden`); o que um teste de comportamento já afirma; árvore inteira de story. Nunca substitui teste de interação.
- **Forma:** `toMatchInlineSnapshot` em `describe('contrato de saída')` no `<Nome>.test.tsx`, sem diretório `__snapshots__`; normalizador pequeno em `src/test/` (remove `class`, `style`, ids), escrito só quando o primeiro snapshot existir.
- **Quando:** agora, **nenhum** (nem piloto nem helper). Por componente, ao fechar uma feature do app que o consuma (ex.: `NftCard`, `Pagination`, `Select` ao fechar a Home); finalização na etapa final. `vitest -u` só com revisão do diff.

### 3.3 Etapa final (F9 `quality-gates`) e Playwright CLI nas telas

**Condição de entrada:** F1 a F8 concluídas com início, detalhe, carrinho e pagamento implementados; DS sem mudança pendente; `pnpm verify` verde; `git status` limpo.

**Conteúdo:**
- (a) Golden do DS: `pnpm verify:final` no Docker `mcr.microsoft.com/playwright:v1.64.1-noble`. As 285 baselines só mudam por `test:visual:update` com revisão de cada PNG.
- (b) Regressão das quatro páginas: spec do app em `apps/web/e2e/visual/`, baselines em `apps/web/e2e/visual/__screenshots__/linux/<project>/` (separadas das do DS); mesma política Linux/Docker e tolerância do ADR-07a salvo decisão em F9; 1440 e 390 obrigatórios, en conforme `design.md:122`, 768 se houver composição própria; dados estáveis: cenário MSW `default` com reset, `page.clock` fixo, imagens e fontes locais, `reducedMotion: 'reduce'`, `animations: 'disabled'`; pagamento com sessão fictícia do mock. Baselines do app só são criadas em F9. Generalizar `visual-docker.mjs` (fixo no DS) é decisão de F9.
- (c) Consolidação dos snapshots de DOM (§3.2).
- (d) Lighthouse e README completo (F9, fora deste plano).

**Checklist de aceite da etapa final (não executar agora):**
1. `pnpm verify:final` sai com 0 num checkout limpo, saída colada.
2. `git diff --stat -- packages/design-system/golden/__screenshots__` vazio, ou cada PNG alterado listado com revisão contra o Figma.
3. PNGs do DS: pelo menos 285, mesmo conjunto nos três viewports (S6).
4. Baselines das quatro páginas versionadas em 1440 e 390 (e 768/en se aprovados), cada uma revisada contra `docs/figma/screens/`.
5. Spec visual do app com `updateSnapshots: 'none'` e `forbidOnly`.
6. Snapshots de DOM revisados, sem `__snapshots__` órfão.
7. Relatórios HTML e traces preservados.

**Playwright CLI nas telas (sem aprovação de snapshot):**
- Comportamento: `pnpm --filter @jg/web exec playwright test <arquivo> --project=desktop-1440` e `--project=mobile-390`; specs do dia a dia sem `toHaveScreenshot`.
- Fidelidade: `pnpm --filter @jg/web exec playwright screenshot --viewport-size=1440,900 --full-page <url> <scratchpad>/home-1440.png` (e 390,844); comando e flags existem em playwright-core 1.64.1 (`coreBundle.js:75926-75931`, `72276`); confirmar com `--help`. Captura vai ao scratchpad ou `test-results/` (ignorados), comparada ao PNG do frame; cada desvio vira item (elemento, esperado, observado). Medidas seguem provadas por teste (ADR-08).
- Pré-requisito: `@playwright/test` não está em `apps/web`; adicioná-lo (1.64.1) cabe ao plano da F0b ou da Home, com aprovação.

### 3.4 ADR-15 (para `ARCHITECTURE.md`, após a linha 44)

Ver §8.

### 3.5 Documentos a atualizar

Anotar "(ajustado pelo ADR-15)", no precedente "alterado por design-system-i18n, ADR-14":

- `package.json:20`: `verify` e novo `verify:final`.
- `ARCHITECTURE.md`: ADR-15; notas no fim do ADR-07 (:19) e do ADR-07a (:21), sem reescrevê-los.
- `packages/design-system/README.md`: `:35` ("Gate" vira validação final), `:37` (`verify`), linha de `verify:final`, `:39` (observação do Docker), seção de baseline `:41-47` ("só na validação final; nunca atualizadas automaticamente"), nova seção curta "Snapshots de DOM".
- `.AI/plans/design-system.md` (só anotações): `:9`, `:83`, `:106`, `:148`, `:158`, `:164`, `:167`.
- `design.md`: `:168` (§8) e linha F9 (`:198`).
- `.AI/standards/testing.md`: `:10` (`vitest -u` sem revisão), `:23` (regressão visual na validação final), bloco "Verificação cotidiana × validação final" e critério de snapshot de DOM.
- `.claude/skills/plan-execute/SKILL.md`: `:15` (verificações do GREEN = `verify` cotidiano) e `:20` (fidelidade por captura do CLI; baselines só em F9).
- `.claude/skills/plan-execution-review/SKILL.md`: `:13` ("regressão visual" só na feature de validação final).
- `.claude/agents/test-writer.md:26`: não escreve `toHaveScreenshot` nem snapshot de DOM fora do que o plano listar.
- `README.md` da raiz (**novo, Q1**): só a seção Comandos (`verify` × `verify:final`).
- `CLAUDE.md` (**Q1 aprovado**): "Estado atual" e "Comandos" com os scripts reais.
- **Histórico, não reescrever:** `.AI/plans/executions/*`; seções Progresso/Execução de `design-system.md` e `design-system-i18n.md`; `docs/discovery.md` e `docs/flows.md`.

## 4. Aceite

| # | Critério observável | Prova |
|---|---|---|
| A1 | `pnpm verify` não executa `storybook:build`, `test:visual` nem Docker | S1 e dry run (V1) |
| A2 | `verify:final` existe e roda `verify` e depois `test:visual` sem update | S2 e V1 |
| A3 | Nenhum agregador chama `--update-snapshots` ou `vitest -u`; só o DS `test:visual:update` contém `--update-snapshots` | S3 |
| A4 | `lint`, `typecheck`, `test`, `build` não dependem de `storybook:build` nem `test:visual` no turbo | S4 |
| A5 | O config do golden mantém `updateSnapshots: 'none'`, `forbidOnly: true`, `{platform}` | S5 |
| A6 | Baselines preservadas: ≥ 285 PNGs, mesmo conjunto nos 3 viewports; diff de `golden/__screenshots__` vazio | S6 e V2 |
| A7 | `pnpm verify` verde | V2 |
| A8 | ADR-15, notas no ADR-07/07a e docs de §3.5 (inclui README raiz e CLAUDE.md) atualizados | `/plan-execution-review` |

## 5. Testes RED

Todos em `packages/design-system/tests/verify-scripts.node.test.ts`, unitário node, sem viewport. **E2E 1440/390: não se aplica** (sem tela nem fluxo; a cobertura de viewports do golden é adiada à etapa final por decisão do usuário).

| # | Teste | RED |
|---|---|---|
| S1 | `verify` cotidiano não contém `test:visual`, `storybook:build`, `docker` nem `--update-snapshots` | real hoje (`package.json:20`) |
| S2 | `verify:final` existe, contém `pnpm verify` antes de `test:visual`, sem `update` | real (script não existe) |
| S3 | nenhum script além de `test:visual:update` (raiz, DS, web) atualiza snapshots (`--update-snapshots`, ` -u`, `--update`) | guarda; prova por mutação com variável de ambiente (padrão `JG_DS_PACKAGE_JSON`) |
| S4 | `dependsOn` de `lint`, `typecheck`, `test`, `build` em `turbo.json` sem `storybook:build`/`test:visual` | guarda; mutação |
| S5 | `playwright.config.ts`: `updateSnapshots === 'none'`, `forbidOnly === true`, `snapshotPathTemplate` com `{platform}` | guarda; mutação |
| S6 | `golden/__screenshots__/linux/{desktop-1440,tablet-768,mobile-390}` com o mesmo conjunto de nomes e total ≥ 285 | guarda; mutação (renomear PNG e reverter) |
| V1 | `pnpm exec turbo run lint typecheck test build --dry=json` sem `storybook:build` nem `test:visual` (confirmar sintaxe com `--help`) | verificação |
| V2 | `pnpm verify` verde com saída colada e `git diff --stat -- packages/design-system/golden/__screenshots__` vazio | verificação |

Ordem: S1 RED→GREEN (muda `verify`); S2 RED→GREEN (`verify:final`, conferindo `--force`); S3–S6 com mutação; docs em um commit por etapa; V1 e V2. `verify:final` **não** é executado nesta feature (Q2).

## 6. Riscos e lacunas remanescentes

- **R1:** a regressão visual do DS fica sem detecção até F9. Mitigação: medidas (ADR-08), axe e snapshots de DOM consolidados.
- **R2:** a dockerização do app em F9 pode exigir generalizar `visual-docker.mjs` (fixo em `packages/design-system`, `visual-docker.mjs:30-31`); custo em F9.
- **R3 (pré-existente):** a story golden `PasswordInput/Visible` tem `play`, contra o ADR-10; revisar na validação final.
- **P1 (pendente, sem resposta):** ordem do próximo plano. A documentação conflita: `design.md:192` põe `catalog` depois de F2, enquanto `docs/discovery.md:52-61` e `docs/routes.md:58-59` preveem a Home com F0b mínimo e só o mock do catálogo. Não existe plano de Home nem de app-shell, e `apps/web` é só `<main/>`. Recomendação do `architect`: `/plan-create app-shell` (F0b) e depois `/plan-create home`, corrigindo `design.md` §10. Será perguntado ao criar o próximo plano; nada aqui o assume.
- **P2 (pendente, sem resposta):** guia de gerenciador de versão (fnm/nvm/asdf). Fora deste plano; há `.nvmrc`, `engines` e `packageManager`.

## 7. Fora do escopo

Executar o golden ou o Docker agora; atualizar, regenerar ou apagar baselines; criar snapshots de DOM ou o normalizador; alterar `tools/visual*.mjs`, `playwright.config.ts` ou timeouts; baselines `win32`, fnm ou remoção do Docker; spec de regressão visual do app e dockerização do app (F9); Lighthouse e README completo da entrega (F9); adicionar `@playwright/test` ou `test:e2e` ao app; reescrever histórico (`executions/*`, Progresso/Execução); implementar F0b ou Home.

## 8. Decisões para ARCHITECTURE.md

**ADR-15 Verificação cotidiana sem regressão visual; golden e regressão das páginas na validação final.** Contexto: o `verify` incluía `storybook:build test:visual`, que no Windows delega ao Docker (ADR-07); o cold start do container estourou 30 s dentro do `verify` completo (`design-system-i18n.md`, seção Execução) embora a suíte isolada passe (296 passed, 7 skipped); isso tornou cada alteração pequena lenta e instável, com impacto no prazo; o render difere entre sistemas, por isso as baselines só valem em Linux; o usuário decidiu em 2026-10-22 tirar a regressão de imagem do fluxo cotidiano. Decisão: (1) `verify` = `lint typecheck test build`: comportamento, integração, axe, tipos e lint, sem Docker nem Storybook estático; (2) `verify:final` = `verify` seguido de `test:visual --force` em série, a validação de entrega, com o golden do DS no Docker e, a partir de F9, a regressão visual de início, detalhe, carrinho e pagamento com baselines Linux versionadas e dados estáveis; (3) baselines existentes preservadas, nunca atualizadas nem apagadas automaticamente, `test:visual:update` só manual e com revisão; (4) nas telas, fidelidade ao Figma por captura do Playwright CLI e testes de medida, sem aprovação de snapshot; (5) no DS, snapshots de DOM normalizados só para contratos de saída estáveis, consolidados por componente após operações completas e finalizados em F9, sem substituir testes de comportamento nem a regressão visual; (6) uma guarda node falha se o `verify` cotidiano voltar a chamar golden, Docker ou `--update-snapshots`. Descartado: baselines por plataforma (`win32`) com fnm (duplica baselines e o render do Windows não é determinístico entre máquinas); remover o Docker (perde o ambiente canônico das 285 baselines); manter o golden no `verify` com timeout maior (aumentar timeout não é correção, `testing.md:25`); serviço externo de regressão visual (já descartado). Consequências: a regressão visual do DS não é detectada no dia a dia (mitigação: medidas, axe e snapshots de DOM); o gate visual por componente de `design-system.md` passa a valer só na entrega; F9 ganha golden, regressão das páginas e consolidação dos snapshots. Reversão: se até F9 uma regressão visual escapar e gerar retrabalho real, ou se o Docker rodar a suíte em menos de 2 minutos sem timeout, reavaliar a volta de `test:visual` ao `verify`. Notas a acrescentar sem reescrever: no ADR-07 "Ajustado pelo ADR-15: deixa de ser gate do `verify` cotidiano; roda em `verify:final`"; no ADR-07a "Ajustado pelo ADR-15: a tolerância vale na validação final; regenerar baseline só nessa etapa, com revisão".

## Progresso

- [ ] S1 `verify` cotidiano sem golden, storybook estático, Docker nem update
- [ ] S2 `verify:final` (conferir `--force` no turbo 2.11.10)
- [ ] S3 nenhum script além de `test:visual:update` atualiza snapshots (+ mutação)
- [ ] S4 tarefas cotidianas do turbo sem dependência do golden (+ mutação)
- [ ] S5 config do golden não grava baseline sozinho (+ mutação)
- [ ] S6 baselines do DS preservadas (+ mutação)
- [ ] Docs: ADR-15 + notas ADR-07/07a, README do DS, `design-system.md`, `design.md`, `testing.md`, skills, `test-writer`, README raiz, CLAUDE.md
- [ ] V1 dry run do turbo; V2 `pnpm verify` verde e diff de baselines vazio
