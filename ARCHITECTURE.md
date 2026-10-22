# ARCHITECTURE.md

Registro de decisões duradouras e desvios (formato: contexto, decisão, alternativa descartada, consequência). Escopo atual: monorepo e design system (`.AI/plans/design-system.md`). Contratos REST/eventos, sessão, carrinho, cache e reconciliação REST × Socket.IO entram aqui quando as features do app forem planejadas (ver `design.md`).

## Decisões do monorepo e do design system

**ADR-01 Monorepo pnpm workspaces + Turborepo 2.x.** Contexto: dois pacotes (`apps/web`, `packages/design-system`). Decisão: pnpm + Turborepo, `packageManager` fixado. Descartado: Nx (mais conceitos/geradores). Consequência: `turbo.json` é o grafo de tarefas; lockfile único.

**ADR-02 Configuração compartilhada na raiz.** ESLint flat único, `tsconfig.base.json`, sem pacotes `config-*`. Descartado: pacotes de config (scaffolding extra). Consequência: regras de fronteira vivem em `eslint.config.js`.

**ADR-03 Build do DS com `tsc` para `dist`.** ESM + `.d.ts`; `scripts/copy-assets.mjs` copia CSS e fontes. `exports`: `.`, `./styles.css`, `./tokens.css`, `./fonts/*`, `./package.json`; `react`/`react-dom` como peers; `sideEffects: ["**/*.css"]`. Descartado: tsup, Vite lib, pacote JIT (o typecheck do app não validaria a API publicada). Consequência: o app depende de `^build`; deep import em `src`/`dist` falha no lint.

**ADR-04 Tokens em Tailwind 4 CSS-first (`@theme`) como fonte única.** `tokens.css` zera os padrões (`--color-*`, `--radius-*`, `--shadow-*`, `--font-*`, `--text-*`: `initial`) e declara só valores do Figma, cada um com `/* figma:<id> */` conferido por teste; aliases semânticos via `var()`; `--spacing: 1px`. Descartado: JSON de tokens + geração; spacing de 4 px. Consequência: classes padrão do Tailwind (`h-10`, `bg-red-500`) não existem; use `h-40`.

**ADR-05 shadcn/ui por cópia manual.** Sem CLI nem `components.json`; pacote `@radix-ui/react-<x>` individual, `cva`, `tailwind-merge`, `clsx`, `data-slot`. Consequência: o cabeçalho de origem existe onde houve cópia (ex.: `Separator`); os demais componentes são implementações próprias sobre Radix. Ver `packages/design-system/README.md`.

**ADR-06 Testes em três camadas, tudo em Chromium real.** Vitest browser mode + axe-core; Storybook 10 (addon-a11y em modo erro, addon-vitest roda as `play`); golden Playwright sobre `storybook-static`. Descartado: jsdom + jest-axe (sem layout/`:focus-visible`/contraste/fontes); test-runner do Storybook.

**ADR-07 Regressão visual auto-hospedada, baseline canônica Linux/Docker.** Projects 1440×900, 768×1024, 390×844; `snapshotPathTemplate` com `{platform}`; `updateSnapshots: 'none'`; `forbidOnly: true`. `pnpm test:visual` chama `tools/visual.mjs`: no Linux roda o Playwright; nos demais sistemas delega ao Docker (`tools/visual-docker.mjs`). Consequência: baselines só valem no Docker/Linux.

**ADR-07a Tolerância visual apertada.** Contexto: com `threshold 0.2` e `maxDiffPixelRatio 0.002`, uma baseline obsoleta passou (mudança sutil de `surface-card` no tema escuro). Decisão: `threshold 0.02` e `maxDiffPixelRatio 0.0005`, aceitável porque o render no Docker é determinístico. Descartado: manter a tolerância da ADR-07. Consequência: qualquer mudança visual exige regenerar e revisar a baseline.

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
