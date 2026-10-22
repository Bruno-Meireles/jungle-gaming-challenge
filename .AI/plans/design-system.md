# Plano: `design-system` (fundação do monorepo + `@jg/design-system`)

Autor: `architect` (Opus), gravado por `/plan-create`. Status: **aguardando aprovação** (sem aprovação, `/plan-execute` não inicia).
Fontes: `prompt.md`, `figma.md`, `.AI/standards/*`, `docs/figma/{file.json,frames.json,screens/}`. Linhas citadas de `file.json` são do retorno do architect e devem ser relidas pelo test-writer antes de cada medida (grounding.md). Versões de pacotes **não verificadas por mim**: revalidar no registro e nos tipos instalados na execução.

## Decisões do usuário (respondidas em /plan-create)
| Tema | Decisão |
|---|---|
| Baselines | **Linux via Docker** é o gate canônico (`mcr.microsoft.com/playwright:v<versão instalada>-noble`). Exige Docker Desktop. |
| Ícones | **SVGs exportados do Figma** (API `/v1/images?format=svg`) viram componentes locais. Licença Iconly não verificada: conferir antes de versionar. |
| Contraste | **Corrigir ambos**: texto de erro em `--color-text-coral` (fill real #F0805F; a description do estilo dizia #EA6B4F, 6,15:1; reconferir no T18); borda de input em `--color-secondary` (6,72:1). Desvios visuais registrados em ARCHITECTURE.md. |
| Git/deps | Repositório git **já existe** (`.git/HEAD` verificado); preservar histórico. Autorizado: `.gitattributes` e instalar as dependências do plano, validando versões e compatibilidade. Rotina sem consulta; consultar só em bloqueio real ou mudança relevante de escopo. |

### Demais lacunas: assumidas com a recomendação do architect (cobertas pela delegação do usuário; reverter exige novo plano)
Q2 versões fixas exatas revalidadas no registro; Q3 Playwright auto-hospedado (sem Chromatic/Argos, prompt.md:285); Q6 shadcn por cópia manual do registro oficial, sem CLI; Q7 `apps/web` mínimo (Vite+React+Tailwind, `<main/>`, 1 smoke); Q10 estados derivados só com tokens existentes (hover=primary-light, active=primary-dark, foco=outline 2px `--color-focus` offset 2px, disabled=fundo `border-soft` + texto `secondary`); Q11 `Text/Primary` extraído de nó que use o estilo `70548:1724` (senão não usar o token); Q12 Roboto Mono em woff2 do repositório oficial googlefonts/RobotoMono (OFL); Q13 imagens das stories exportadas do Figma para `src/stories/assets`; Q14 golden em 390, medidas mobile lidas do frame de 414 sem conversão; Q15 `--spacing: 1px`; Q18 sem Toast agora (`LiveRegion` + `Alert`); Q19 line-height do Figma, exceto se cortar/sobrepor (então `normal` + desvio); Q20 não replicar defeitos do Figma (registrar); Q21 Checkbox com indicador circular.
**Q1 pendente de verificação (passo 0):** `node -v; pnpm -v; docker -v` — não verificados. Se Docker ausente = bloqueio real, consultar o usuário.

---

## 1. Requisitos cobertos
| § | Trecho | Atendimento |
|---|---|---|
| prompt.md:13 | design system, "um pacote para o projeto e um pacote para o design system" | pnpm workspaces + Turborepo: `apps/web`, `packages/design-system` |
| prompt.md:5 | TDD red/green | ciclo por componente (§5) |
| prompt.md:10-12 | Playwright, Playwright CLI | goldens com `pnpm exec playwright test` |
| §2 | React, TS, Tailwind, shadcn/ui, Playwright | stack do DS |
| §1 | "Estados não desenhados devem seguir o mesmo padrão visual" | estados derivados, sempre registrados como desvio |
| §8 | preservar tipografia/cores/espaçamentos; adaptar shadcn | tokens do Figma + teste de paridade |
| §8 | larguras 390, 768, 1440 | viewports de stories e goldens |
| §8 | skeleton com shimmer, dimensões preservadas, movimento reduzido | `Skeleton`, `NftCardSkeleton`, C4 |
| §8 | teclado, foco visível, foco em diálogos/drawers, labels/erros, alt, contraste, feedback acessível | testes de foco, axe, `FormField`, `Dialog`, `Sheet`, `LiveRegion` |
| §8 | fontes/imagens acessíveis localmente; documentar substituições | fontes locais; desvios em ARCHITECTURE.md |
| §9 | regressão visual com baselines versionadas e dados estáveis | goldens Playwright |
| §12 | lockfile, comandos, checkout limpo sem serviços privados | scripts, Turborepo, sem Chromatic |
| architecture.md:18-19 | DS nunca importa do app; sem regra de negócio no DS | lint de fronteira (T2–T6) |
| figma.md:31-33 | tokens no DS como variáveis do Tailwind; não inventar medidas | tokens com origem conferida por teste |

## 2. Slice FSD / estrutura

### 2.1 Layout
```
/  package.json (private, "packageManager": "pnpm@<fixado>"), pnpm-workspace.yaml, turbo.json,
   tsconfig.base.json, eslint.config.js, .prettierrc.json, .prettierignore,
   .gitattributes (*.png binary; eol=lf), .nvmrc
/tools/serve-static.mjs        servidor estático node:http sem dependências (serve storybook-static)
/apps/web  (@jg/web)           Vite + React + Tailwind, SEM telas
  src/main.tsx, src/app/App.tsx (só <main/>), src/app/styles.css
  tests/workspace.node.test.ts, tests/lint-boundary.node.test.ts, src/app/design-system.smoke.test.tsx
/packages/design-system  (@jg/design-system)
  src/index.ts                 único entry público de JS
  src/styles/{tokens.css,fonts.css,base.css,index.css}
  src/lib/cn.ts                clsx + tailwind-merge
  src/primitives/<nome>/{<Nome>.tsx,<Nome>.test.tsx,<Nome>.stories.tsx,index.ts}
  src/patterns/<nome>/{mesmo formato}
  src/test/{axe.ts,figma.ts}   helpers (fora do build)
  assets/fonts/RobotoMono-{Regular,Medium,Bold}.woff2, OFL.txt
  tests/*.node.test.ts
  golden/{golden.spec.ts,motion.spec.ts,stories.ts,__screenshots__/<platform>/<project>/*.png}
  .storybook/{main.ts,preview.tsx,storybook.css}
  vitest.config.ts (projects: node | unit | storybook), playwright.config.ts
  tsconfig.json, tsconfig.build.json, scripts/copy-assets.mjs, README.md
```
Camadas internas do DS (imports só para baixo): `styles < lib < primitives < patterns`. Primitive nunca importa pattern; pattern importa primitives só via `index.ts`. O DS é um pacote `shared` externo; não usa as camadas FSD do app.

### 2.2 Dependências permitidas
| Peça | Pacote | Pode depender de | Proibido |
|---|---|---|---|
| tokens/base/fonts (CSS) | DS | `tailwindcss` (fornecido pelo consumidor) | JS |
| `lib/cn` | DS | `clsx`, `tailwind-merge` | React |
| primitives | DS | `react`, `@radix-ui/react-*` (só o necessário), `class-variance-authority`, `lib`, `styles` | `@jg/web`, `@tanstack/*`, `axios`, `msw`, `socket.io-client`, fetch/XHR, `patterns` |
| patterns (NftCard) | DS | primitives via `index.ts` | idem |
| `apps/web` | app | `@jg/design-system` (só `.` e `./styles.css`) | deep import `/src/*` ou `/dist/*` |

Componentes burros: sem regra de negócio, rede, router, cache. Dinheiro chega pronto (`priceLabel: string`); o DS nunca formata ETH. Navegação entra por `asChild` (Radix Slot).

### 2.3 Decisões (para ARCHITECTURE.md; formato contexto/decisão/alternativa/consequência)
- **ADR-01 Monorepo pnpm workspaces + Turborepo 2.x**, `packageManager` fixado via corepack. Descartado: Nx (mais conceitos/geradores). Consequência: `turbo.json` é o grafo de tarefas; lockfile único.
- **ADR-02 Config compartilhada na raiz** (tsconfig.base, ESLint flat único, Prettier); sem pacotes `config-*` (scaffolding extra, vetado pelo CLAUDE.md).
- **ADR-03 Build do DS com `tsc`** (ESM + `.d.ts`, um módulo por arquivo) para `dist`; `copy-assets.mjs` copia CSS e fontes. `exports`: `.`, `./styles.css`, `./tokens.css`, `./fonts/*`, `./package.json`; `type: module`; `sideEffects: ["**/*.css"]`; `react`/`react-dom` como peer. Descartados: tsup, Vite lib, pacote JIT (typecheck do app não validaria a API publicada). App depende de `^build`.
- **ADR-04 Tokens: Tailwind 4 CSS-first (`@theme`) como fonte única.** `tokens.css` zera os padrões (`--color-*: initial; --radius-*: initial; --shadow-*: initial; --font-*: initial; --text-*: initial`) e declara só valores do Figma, cada um com `/* figma:<nodeId|styleId> */` conferido por teste. Aliases semânticos só via `var()`. `--spacing: 1px`. Descartados: JSON de tokens + geração (duas fontes); spacing 4px com valores arbitrários.
- **ADR-05 shadcn/ui por cópia manual** (sem CLI/`components.json`), cabeçalho com URL e data do registro, reestilizado com tokens; `@radix-ui/react-<x>` individual, `cva`, `tailwind-merge`, `clsx`, `data-slot`. Classes como `h-9` são reescritas (intencional).
- **ADR-06 Testes em 3 camadas, tudo em Chromium real**: (1) Vitest browser mode (`@vitest/browser-playwright`, `vitest-browser-react`, `page.getByRole`, `userEvent`, `expect.element`) + axe-core em `src/test/axe.ts`; (2) Storybook 10 (`@storybook/react-vite`, addon-docs, addon-a11y com `parameters.a11y.test: 'error'`, addon-vitest que roda cada story e as `play`); (3) golden Playwright `toHaveScreenshot` sobre `storybook-static`. Descartados: jsdom + jest-axe (sem layout/`:focus-visible`/contraste/fontes); test-runner do Storybook (exige servidor).
- **ADR-07 Regressão visual auto-hospedada, baseline canônica Linux/Docker.** Projects `desktop-1440` (1440×900), `tablet-768` (768×1024), `mobile-390` (390×844), só Chromium. `snapshotPathTemplate: '{testDir}/__screenshots__/{platform}/{projectName}/{arg}{ext}'`; `expect.toHaveScreenshot: { animations:'disabled', caret:'hide', scale:'css', threshold:0.2, maxDiffPixelRatio:0.002 }`; `use.reducedMotion:'reduce'`; `updateSnapshots:'none'`; `forbidOnly:true`. Scripts `test:visual:docker` (gate) e `test:visual:update` (só com revisão).
- **ADR-08 Fidelidade ao Figma por medida, não por pixel do PNG** (rasterizadores diferentes). Cada componente tem testes de medida (`getBoundingClientRect`/`getComputedStyle`) com valor lido do nó, citando `file.json:linha`. PNG do Figma é referência de revisão visual da baseline, não gate.
- **ADR-09 Fontes locais Roboto Mono 400/500/700** (`@font-face`, `font-display: swap`, URL relativa, sem rede). Descartado: Google Fonts CDN.
- **ADR-10 Stories golden sem `play`.** Tags `golden`, `golden-hover`, `golden-focus`, `golden-page` (overlays: página inteira). Hover/foco produzidos pelo spec Playwright. `play` só no projeto `storybook` do Vitest.
- **ADR-11 Ícones**: SVGs do Figma como componentes locais (decisão do usuário).
- **ADR-12 Desvios de acessibilidade/Figma**: erro em coral; borda de input em `--color-secondary`; estados derivados; Skeleton derivado; defeitos do Figma não replicados; mobile 414→390.

### 2.4 Turborepo e scripts
`turbo.json` tasks: `build` (dependsOn `^build`, outputs `dist/**`), `typecheck` e `test` (dependsOn `^build`), `lint`, `storybook` (persistent, sem cache), `storybook:build` (outputs `storybook-static/**`), `test:visual` (dependsOn `storybook:build`, outputs `playwright-report/**`, `test-results/**`), `dev` (persistent).

| Script | Raiz | DS | web |
|---|---|---|---|
| dev | `turbo run dev` | `tsc -p tsconfig.build.json -w` | `vite` |
| build | `turbo run build` | `tsc -p tsconfig.build.json && node scripts/copy-assets.mjs` | `tsc -b && vite build` (restaurado após a revisão: o app mínimo tem `index.html`, `main.tsx`, `App.tsx`) |
| typecheck | `turbo run typecheck` | `tsc --noEmit` | `tsc --noEmit` |
| lint | `turbo run lint` | `eslint .` | `eslint .` |
| format / format:check | `prettier --write .` / `--check` | – | – |
| test | `turbo run test` | `vitest run` (projects node+unit+storybook) | `vitest run` |
| storybook | `turbo run storybook --filter=@jg/design-system` | `storybook dev -p 6006 --no-open` | – |
| storybook:build | `turbo run storybook:build` | `storybook build -o storybook-static` | – |
| test:visual | `turbo run test:visual` | `playwright test` (estático em 6007 via `tools/serve-static.mjs`) | – |
| test:visual:update | – | `playwright test --update-snapshots=changed` (só com revisão) | – |
| test:visual:docker | – | `docker run … playwright:v<ver>-noble …` | – |
| verify | `turbo run lint typecheck test build storybook:build test:visual` | – | – |

## 3. Contratos
REST, MSW e Socket.IO: não se aplicam (§7).

**Pacote:** JS público só `@jg/design-system` (`src/index.ts` reexporta cada `index.ts`). CSS público `@jg/design-system/styles.css` (tokens+fonts+base+`@source "../"`); consumidor: `@import "tailwindcss"; @import "@jg/design-system/styles.css";`. Qualquer outro subpath → `ERR_PACKAGE_PATH_NOT_EXPORTED`.

**Tokens de cor** (origem `file.json:398283-398906`; prefixo `Color/` removido, kebab-case):
ink #140D0A · foreground #F5F1EB · primary #D28A4C · primary-light #DD9A5F · primary-dark #C47B3E · secondary #B39463 · text-accent #E89B55 · text-secondary #CFB28C · text-coral #F0805F (fill real dos nós; description do estilo dizia #EA6B4F) · surface-card #241612 · surface-raised #2F1D15 · surface-dark #38220F · border #3F2319 · border-soft #55321F · background-elevated #FBFBFB · gray-light #EDEDED · amber #E3A44E · success #00A66C · error #ED1B2E · black #000 · white #FFF · logo-google-{green #59C36A, yellow #FFDA2D, blue #4086F4} · logo-blue #4175DF · logo-orange #FF641A · logo-facebook #3B5999 · logo-light-blue #03A9F4 · logo-indigo #283593 · `Text/Primary`: **sem hex (Lacuna Q11)**.
Fundo da página = `--color-ink` (frame 2:2 usa variável 70320:316, file.json:19-25). Aliases: `--color-background: var(--color-ink)`, `--color-focus: var(--color-primary)`, `--color-input-border: var(--color-secondary)` (decisão de contraste), `--color-destructive-text: var(--color-text-coral)`, `--color-destructive: var(--color-error)` (só borda/ícone ≥3:1).

**Tipografia:** `--font-sans`/`--font-mono` = `"Roboto Mono", ui-monospace, monospace`; pesos 400/500/700; tamanhos vistos 9–43. `--text-*` sob demanda, cada um com `/* figma:<styleId> */`; primeiro: `--text-body-14-bold-lh-16` (estilo 70321:354, 14/16/700/ls 0; "lh auto" → `normal`).

**Medidas confirmadas (resto é extraído do nó durante o RED):**
- Button primário `70386:262` (file.json:253028-253230): 131×40, raio 3, fundo primary, texto ink 14/16 bold, +40 px de padding por lado.
- Input `70381:242` (file.json:192892-193115): 340×40, raio 5, padding 16/12, borda 1px, placeholder secondary 14/16. Foco `70381:243` (193116-193128): borda primary. **Desvio:** cor da borda em repouso = `--color-secondary` (Figma: `--color-border`).
- Sombras confirmadas: `0 0 20` e `0 -10 30`, rgba(10,6,4,.45) (31005-31022, 286267-286284). Demais: cor não verificada, só por nó.
- Componentes do Figma: Header Row, Header With Divider, Footer, Filters (310), Password Input, Social Button, Marketplace Page, Checkout Page, Mobile Social Block (398010-398280).

**Props (confirmar contra tipos instalados do Radix):**
```ts
Button: ButtonHTMLAttributes & { variant?: 'primary'|'outline'|'ghost'|'icon'; size?: 'md'|'lg'|'block'; asChild?: boolean; loading?: boolean }
Badge: { variant: 'count'|'label'; children: ReactNode }
Skeleton: HTMLAttributes<HTMLDivElement>   // aria-hidden; tamanho do consumidor
LiveRegion: { politeness?: 'polite'|'assertive'; children?: ReactNode }
Label, Input (+startSlot/endSlot), Textarea, PasswordInput { showLabel?; hideLabel? }
FormField: { label; required?; hint?; error?; children: ReactElement }  // injeta id, aria-describedby, aria-invalid
Checkbox, RadioGroup/RadioGroupItem (variant 'default'|'card'), ChipGroup/ChipGroupItem
QuantityStepper: { value; min; max; onValueChange(n); label; decrementLabel?; incrementLabel? }  // inteiro
Avatar: { src?; alt; fallback }
Breadcrumb/BreadcrumbItem/BreadcrumbLink(asChild)/BreadcrumbPage(aria-current)
Tabs*, Pagination { page; pageCount; getItemProps? } + PaginationLink(asChild), Rating { value; max:5; label } (role=img)
Select* (Radix), RangeSlider { value:[n,n]; min; max; step; onValueChange; thumbLabels:[s,s] }
Alert { tone:'info'|'error'|'success'; title?; children; action? }
Dialog*/DialogClose(closeLabel="Fechar"), Sheet (side 'bottom'|'left'|'right')
NftCard { title; priceLabel; image:{src,alt}; badge?; action?; link? }, NftCardSkeleton (mesmas dimensões)
```
**Stories:** `title: 'Primitives/<Nome>'|'Patterns/<Nome>'`, CSF3, `tags:['autodocs']`; IDs padrão listados em tags `golden`/`golden-hover`/`golden-focus`/`golden-page` lidas de `storybook-static/index.json` (`golden/stories.ts`; manifest.ts removido no GATE-INFRA). `preview.tsx`: `a11y.test='error'`, viewports mobile390/tablet768/desktop1440, `backgrounds` desligado.

## 4. Aceite
| # | Critério | Prova |
|---|---|---|
| A1 | `pnpm install --frozen-lockfile && pnpm verify` sai com 0 num checkout limpo | execução colada no fechamento |
| A2 | app resolve `@jg/design-system` pelo workspace | T1 |
| A3 | DS importando app/libs de dados, primitive importando pattern, deep import no app falham no lint | T3–T6 |
| A4 | `.only`/`.skip`/`.fixme` falham no lint | T7 |
| A5 | só `.`, `styles.css`, `tokens.css`, `fonts/*` e `package.json` exportados | T8 |
| A6 | toda cor/tipo/raio/sombra tem origem no `file.json`; paleta padrão do Tailwind não gera classe | T9–T13 |
| A7 | Roboto Mono 400/500/700 carrega sem rede | T14–T15 |
| A8 | foco por teclado visível em todo interativo | sub-itens `foco` |
| A9 | axe sem violações A/AA em toda story e teste `axe` | projeto `storybook` + unitários |
| A10 | shimmer anima com `no-preference`, para com `reduce` | C4.5, C4.6 |
| A11 | baselines dos 3 viewports versionadas e verdes no ambiente canônico (Linux/Docker) | `golden.spec.ts` |
| A12 | medidas batem com os nós do Figma | sub-itens `medida` |
| A13 | app renderiza Button do DS com cor/fonte dos tokens | I1 |
| A14 | nenhum componente faz rede nem importa router/query/axios/msw | T2–T4 + revisão |
| A15 | README do DS documenta instalação, comandos, política de baseline, cópia do shadcn | `/plan-execution-review` |

Gates por componente: unitários + medida + axe verdes; projeto `storybook` verde; golden verde nos 3 viewports; lint e typecheck verdes.

## 5. Testes RED
**Ciclo TDD por componente (estrito):** (1) unitário RED→GREEN→refactor, um comportamento por vez, saída vermelha colada; (2) medida é teste unitário RED com valor do nó citando `file.json:linha`; nó sem o valor = Lacuna → volta ao architect; (3) stories escritas após o verde unitário e devem passar de primeira (falha de `play` = bug → novo RED unitário); (4) golden RED: IDs em tags `golden`/`golden-hover`/`golden-focus`/`golden-page` lidas de `storybook-static/index.json` (`golden/stories.ts`; manifest.ts removido no GATE-INFRA) → falha "story ausente"/"baseline inexistente"; (5) golden GREEN: `test:visual:update -g "<id>"` **no Docker**, comparar PNG gerado com o PNG do frame do Figma e registrar a revisão no log antes de versionar; (6) proibido: vários testes antes do código, `--update-snapshots` sem revisão, editar teste para passar.
Unitários browser rodam em 1440×900; casos responsivos trocam o viewport (confirmar API em `vitest/browser`).

**Passo 0 (setup, sem teste):** verificar Node/pnpm/Docker (Q1); `package.json` raiz, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, ESLint e Prettier, `package.json` dos dois pacotes, `.gitattributes`; instalar dependências aprovadas — raiz: `turbo typescript eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-storybook prettier` (+ opcionais `prettier-plugin-tailwindcss`, `eslint-plugin-jsx-a11y`); DS: `react react-dom @radix-ui/react-{slot,separator,checkbox,radio-group,tabs,select,slider,dialog,avatar,label} class-variance-authority clsx tailwind-merge tailwindcss @tailwindcss/vite vite vitest @vitest/browser-playwright vitest-browser-react axe-core storybook @storybook/react-vite @storybook/addon-docs @storybook/addon-a11y @storybook/addon-vitest @playwright/test`; app: `react react-dom vite @vitejs/plugin-react tailwindcss @tailwindcss/vite vitest @vitest/browser-playwright vitest-browser-react`. Preservar histórico git; commits só quando o usuário pedir.

### Fundação
| # | Nome | Arquivo | Tipo | VP |
|---|---|---|---|---|
| T1 | `@jg/web` resolve `@jg/design-system/package.json` para `packages/design-system` (realpath) | apps/web/tests/workspace.node.test.ts | integração node | – |
| T2 | package.json do DS não declara `@jg/web`, `@tanstack/*`, `axios`, `msw`, `socket.io-client` | packages/design-system/tests/package-boundary.node.test.ts | unitário node | – |
| T3 | ESLint `lintText` em `packages/design-system/src/x.ts` reporta `no-restricted-imports` para `@jg/web` | …/tests/lint-boundary.node.test.ts | unitário node | – |
| T4 | idem para `@tanstack/react-query`, `@tanstack/react-router`, `axios`, `msw`, `socket.io-client` (`it.each`) | idem | unitário node | – |
| T5 | arquivo em `src/primitives/**` importando `../../patterns/*` é reportado | idem | unitário node | – |
| T6 | arquivo em `apps/web/src/**` importando `@jg/design-system/src/...` ou `/dist/...` é reportado | apps/web/tests/lint-boundary.node.test.ts | unitário node | – |
| T7 | `it.only`, `test.skip`, `describe.only`, `test.fixme` reportados | …/tests/lint-test-hygiene.node.test.ts | unitário node | – |
| T8 | chaves de `exports` exatas e `import('@jg/design-system/primitives/button')` lança `ERR_PACKAGE_PATH_NOT_EXPORTED` | …/tests/exports.node.test.ts | integração node | – |

### Tokens
| # | Nome | Arquivo | Tipo | VP |
|---|---|---|---|---|
| T9 | todo estilo FILL com hex em `file.json.styles` existe como `--color-<nome>` com o mesmo hex; `Text/Primary` listado como Lacuna | …/tests/tokens.node.test.ts | unitário node | – |
| T10 | compilar Tailwind com `tokens.css` gera `.bg-primary` e **não** `.bg-red-500` (API `compile`, conferir tipos) | …/tests/tokens-compile.node.test.ts | unitário node | – |
| T11 | todo alias semântico é `var(--color-<token existente>)`, sem hex literal | tokens.node.test.ts | unitário node | – |
| T12 | todo `--text-*` tem `/* figma:<styleId> */` e bate com tamanho/peso/lh/ls do estilo | tokens.node.test.ts | unitário node | – |
| T13 | todo `--radius-*`/`--shadow-*` tem `/* figma:<nodeId> */` e bate com `cornerRadius`/`effects` | tokens.node.test.ts | unitário node | – |
| T14 | `fonts.css`: 3 `@font-face` Roboto Mono 400/500/700, `font-display: swap`, URLs relativas existentes, sem `http`; `OFL.txt` presente | …/tests/fonts.node.test.ts | unitário node | – |
| T15 | `document.fonts.load('700 16px "Roboto Mono"')` resolve com face carregada (e 400, 500) | src/styles/fonts.test.tsx | unitário browser | 1440 |
| T16 | `body` com background ink, color foreground, font-family iniciando em "Roboto Mono" | src/styles/base.test.tsx | unitário browser | 1440 |
| T17 | `<a href>` focado por Tab tem outline 2px sólido `--color-focus`, offset 2px | src/styles/base.test.tsx | unitário browser | 1440 |
| T18 | contraste: par texto-de-erro (coral) × ink ≥ 4,5:1 e borda de input (secondary) × ink ≥ 3:1, calculado a partir dos tokens | …/tests/contrast.node.test.ts | unitário node | – |

### Componentes
Formato `N.k` = sub-item (tipo). Arquivos: `src/<camada>/<nome>/<Nome>.test.tsx` (unitário browser, 1440 salvo indicação), `<Nome>.stories.tsx`, `golden/golden.spec.ts` (tags) (golden em 1440, 768, 390).

**C1 LiveRegion + VisuallyHidden** (§8): 1 `role=status` `aria-live=polite` `aria-atomic=true`; 2 `assertive`→`role=alert`; 3 oculto visualmente (1×1, clip) e presente na árvore acessível; 4 stories Polite/Assertive; 5 golden: nenhum (invisível, exceção justificada).
**C2 Separator** (Header With Divider 70504:3017): 1 `role=separator`, `decorative`→`none`; 2 medida espessura/cor; 3 story; 4 golden.
**C3 Badge** (Badge Count file.json:2410; "RARO" 14:5226): 1 count mostra número e aceita aria-label; 2 label renderiza texto; 3 medida count; 4 medida label (sem replicar canto reto defeituoso, Q20); 5 axe; 6 stories; 7 golden.
**C4 Skeleton** (derivado de surface-card/surface-raised; desvio): 1 `aria-hidden`, aceita tamanho do consumidor; 2 mantém dimensões (sem CLS); 3 `--animate-shimmer` aplicado; 4 stories Default/Block; 5 `reducedMotion:'no-preference'` → `animation-name≠none` (Playwright motion.spec.ts, 1440); 6 `reduce` → `none` (motion.spec.ts, 1440 e 390); 7 golden Default.
**C5 Button** (70386:262; "Entrar"; COMPRAR/Favoritar 10:244; Confirmar compra 11:2862; Social Button 70483:263): 1 `<button type=button>` com nome; 2 medida primary md (40, raio 3, padding-x 40, 14/16 700, cores); 3 medida outline (nó "Favoritar"); 4 medida ghost ("Continuar explorando" 11:1278); 5 medida icon + `aria-label` obrigatório; 6 hover → primary-light; 7 `disabled` não dispara onClick; 8 `loading`: aria-busy, desabilitado, nome preservado; 9 `asChild` → `<a>`; 10 foco Tab → outline; 11 axe todas as variantes; 12 stories Primary/Outline/Ghost/Icon/Disabled/Loading/AsLink/Keyboard (play Tab); 13 golden das variantes + hover + foco.
**I1 Integração app:** `apps/web/src/app/design-system.smoke.test.tsx` importa `styles.css` e `{ Button }` de `@jg/design-system`; botão computa `background-color` rgb(210,138,76) e `font-family` com "Roboto Mono" (integração browser, 1440). Prova também `@import` via `exports` e o `@source` do dist; falha = Lacuna, sem caminho alternativo silencioso.
**C6 Label** (9:1670, 11:2862): 1 `htmlFor` (getByLabelText); 2 `required` asterisco `text-coral` aria-hidden + `required` no campo; 3 medida fonte/cor; 4 stories; 5 golden.
**C7 Input** (70381:242; perfil 9:1238): 1 textbox com nome via label; 2 medida (40, raio 5, 16/12, borda 1px **secondary**, placeholder secondary 14/16); 3 medida variante perfil/pagamento (se divergir: variante nomeada); 4 foco → borda primary + outline; 5 `aria-invalid` → borda `--color-error`; 6 `startSlot` (busca 14:5226) não focável; 7 `disabled`; 8 axe; 9 stories Default/Placeholder/Filled/Invalid/Disabled/WithIcon; 10 golden + foco.
**C8 FormField:** 1 gera id e liga label→controle; 2 `hint` via `aria-describedby`; 3 `error` → `aria-invalid` + mensagem ligada e anunciada (`role=alert` só na mudança); 4 texto de erro em `text-coral`; 5 axe com erro; 6 stories Default/WithHint/WithError/Required; 7 golden.
**C9 PasswordInput** (70504:2973; ícones 9:964, 9:1592): 1 `type=password` default; 2 botão "Mostrar/Ocultar senha" com `aria-pressed` alterna tipo; 3 foco permanece no botão; 4 medida; 5 axe; 6 stories Hidden/Visible/Invalid + play Toggle; 7 golden.
**C10 Textarea** (11:2862): 1 label + medida; 2 `aria-invalid`; 3 axe; 4 stories; 5 golden.
**C11 Checkbox** (Filters 70485:381; "Igual à carteira principal" 9:1670, "Usar outra carteira?" 11:2862): 1 `role=checkbox`, Space alterna; 2 controlado; 3 medida do indicador; 4 foco visível; 5 estado não só por cor (forma); 6 axe; 7 stories Unchecked/Checked/Disabled/WithCount; 8 golden + foco.
**C12 RadioGroup** (carteira/rede 11:2862): 1 radiogroup com setas (roving); 2 Tab entra no selecionado; 3 medida default e card; 4 card selecionado: borda primary + indicador preenchido; 5 axe; 6 stories Default/Card/CardSelected/Disabled + play ArrowKeys; 7 golden + foco.
**C13 ChipGroup** (edições, 10:244): 1 seleção única radiogroup + setas; 2 item disabled não selecionável e anunciado; 3 medida normal/selecionado; 4 axe; 5 stories; 6 golden + foco.
**C14 QuantityStepper** (10:244, 11:1278): 1 grupo com nome; "Diminuir"/"Aumentar" com nomes; 2 aumentar → `onValueChange(value+1)`; 3 diminuir no `min` desabilitado; 4 aumentar no `max` desabilitado; 5 valor em `<output aria-live=polite>`; 6 medida; 7 axe; 8 stories Default/AtMin/AtMax + play Increment; 9 golden.
**C15 Avatar** (9:1238): 1 `img` com alt; 2 sem src/erro → fallback (ícone 9:1550); 3 medida; 4 stories Image/Fallback; 5 golden.
**C16 Breadcrumb:** 1 `nav aria-label="Trilha"` lista ordenada; 2 atual com `aria-current=page`; 3 `BreadcrumbLink asChild`; 4 medida + separador decorativo; 5 axe; 6 story; 7 golden.
**C17 Tabs** (2:2; 10:244): 1 tablist/tab/tabpanel, setas; 2 `aria-selected` + sublinhado primary; 3 medida; 4 axe; 5 stories + play ArrowRight; 6 golden.
**C18 Pagination** (file.json:18915): 1 `nav aria-label="Paginação"`, atual `aria-current=page`; 2 "Próxima" com nome, desabilitada na última; 3 `asChild`; 4 medida item/ativo/raio; 5 axe; 6 stories First/Middle/Last; 7 golden + foco.
**C19 Rating** (10:244): 1 `role=img` + label por prop; 2 medida (Star 11:1192); 3 story; 4 golden.
**C20 Select** (9:1670/11:2862; "Ordenar por" 2:2): 1 `combobox` com nome; 2 Enter abre, setas, Enter seleciona, foco volta ao trigger; 3 Esc fecha sem alterar; 4 medida trigger/chevron (9:1589); 5 `aria-invalid`; 6 axe aberto; 7 stories Placeholder/Selected/Open(`golden-page`)/Invalid; 8 golden.
**C21 RangeSlider** (Filters 70485:381): 1 dois `slider` com nomes e `aria-valuenow`; 2 setas por `step`, mínimo não ultrapassa máximo; 3 medida; 4 axe; 5 story + play Keyboard; 6 golden + foco.
**C22 Alert:** 1 error→`role=alert`, info/success→`status`; 2 slot `action` focável; 3 tom não só por cor; 4 axe; 5 stories; 6 golden.
**C23 Dialog** (9:115, 9:1022, 11:4385; X 9:947): 1 foco entra, `role=dialog`, `aria-modal`, `aria-labelledby`; 2 Tab circula (trap); 3 Esc fecha e devolve foco; 4 fechar nomeado "Fechar"; 5 medida (largura, surface-card, overlay, sombra); 6 em 390 sem overflow horizontal (390); 7 axe aberto; 8 stories Open(`golden-page`) + play EscReturnsFocus; 9 golden.
**C24 Sheet** (botão filtro mobile 15:5313, derivado): 1 foco como C23.1–4; 2 `side=bottom` ancorado em 390; 3 animação some com reduced motion (motion.spec.ts, 390); 4 axe; 5 stories Bottom/Left; 6 golden.
**C25 NftCard + NftCardSkeleton** (2:2, 10:244, 14:5226): 1 título como link (Slot), card clicável sem link aninhado; 2 `image.alt` obrigatório e renderizado; 3 `priceLabel` literal (nenhum `Number()`); 4 slots `badge`/`action` e `action` focável à parte; 5 medida desktop (1440); 6 medida mobile (390, frame 414); 7 Skeleton com bounding box igual ao NftCard (1440 e 390); 8 axe; 9 stories Default/WithBadge/WithFavorite/Skeleton/Grid; 10 golden.

## 6. Riscos técnicos
- Compatibilidade Vitest × addon-vitest validada só pelo peer range; confirmar no primeiro `storybook add` e colar a saída.
- `@import` do CSS do DS e `@source "../"` dependem de resolução por `exports` (provado por I1).
- Medidas divergentes do "mesmo" componente → variante nomeada com nó citado, ou Lacuna; nunca média.
- Tablet 768 não tem frame: comportamento derivado, golden registra o estado.
- Docker Desktop ausente = bloqueio real (consultar usuário).

## 7. Fora do escopo
Telas, rotas, TanStack Router/Query, Axios, MSW, Socket.IO, sessão, carrinho, formatação/aritmética de ETH; widgets do app (Header/Footer, painel Filters, menu do perfil, bottom nav, tabelas, carrossel, newsletter); Toast visual, Spinner, Tooltip, DropdownMenu, Switch, tema claro; deploy, Lighthouse, README da solução, ARCHITECTURE.md completo (só entradas ADR-01..12), E2E de telas do §9; comparação por pixel com PNG do Figma; publicação em registry.

## Progresso
- [x] Passo 0 setup/verificação de ambiente — Node v24.19.0, pnpm 12.14.0 (npm -g; corepack exige admin), Docker 29.2.1 (daemon iniciado), git `284c930` preservado. Desvio: TypeScript 6.0.3 (typescript-eslint 8.72.0 exige `typescript <6.1.0`; 7.0.2 é o latest). `allowBuilds: esbuild` em pnpm-workspace.yaml.
- [x] T1 — RED: `Cannot find module '@jg/design-system/package.json'` (MODULE_NOT_FOUND, subprocesso sem NODE_PATH; 1ª versão dava falso verde por hoist privado do `pnpm exec`). GREEN: `"@jg/design-system": "workspace:*"` em apps/web/package.json; `vitest run tests/workspace.node.test.ts` 1 passed; `typecheck` e `lint` limpos (reexecutados). Edição do teste justificada: removeu `_ignored` (no-unused-vars).
- [x] T2 — **Desvio:** guarda de invariante, sem RED (o package.json do DS já não declara dependências proibidas; RED válido exigiria módulo de produção). Evidência: 13 testes verdes (reexecutado); mutação com `optionalDependencies:{axios}` via `JG_DS_PACKAGE_JSON` falhou (`Expected [] / Received ["optionalDependencies:axios"]`); typecheck e lint limpos.
- [x] T3 — RED: `AssertionError: expected [] to include 'no-restricted-imports'` (reexecutado). GREEN: bloco em eslint.config.js (`packages/design-system/**`, `no-restricted-imports` patterns `@jg/web`, `@jg/web/*`); DS 14 testes e web 1 teste verdes, typecheck e lint limpos nos dois pacotes (reexecutados).
- [x] T4 — RED: 6 falhas `expected [] to include 'no-restricted-imports'` (T3 segue verde; reexecutado). GREEN: patterns `@tanstack/*`, `axios(/*)`, `msw(/*)`, `socket.io-client(/*)` no bloco do DS; DS 20 testes e web 1 verdes, typecheck e lint limpos (reexecutados). Nota: subpaths `/*` de axios/msw/socket.io-client sem teste próprio.
- [x] T5 — RED: 2 falhas `expected [] to include 'no-restricted-imports'` (primitive→`../../patterns/nft-card` e `../../patterns`; 9 verdes, incl. 2 negativos; reexecutado). GREEN: constante `dsForbiddenImports` compartilhada + bloco `src/primitives/**` com `**/patterns(/*)` (flat config substitui opções, por isso a constante); axios em primitives segue reportado (verificação manual via API); DS 24 e web 1 testes verdes, typecheck/lint limpos (reexecutados).
- [x] T6 — RED: 2 falhas `expected [] to include 'no-restricted-imports'` (`@jg/design-system/src/primitives/button`, `/dist/index.js`; 2 negativos verdes; reexecutado). GREEN: bloco `apps/web/src/**` com patterns `@jg/design-system/{src,dist}(/*)`; DS 24 e web 5 testes verdes, typecheck/lint limpos (reexecutados).
- [x] T7 — RED: 21 falhas `expected [] to include 'no-restricted-properties'` (3 negativos verdes; reexecutado). GREEN: bloco de testes (`**/*.{test,spec}.{ts,tsx}`, `**/tests/**`, `**/golden/**`) com `no-restricted-properties` {it,test,describe}×{only,skip,fixme}; DS 48 e web 5 testes verdes, typecheck/lint limpos (reexecutados).
- [x] T8 — **Desvio:** guarda de invariante sem RED (o `exports` nasceu no passo 0). Evidência: DS 54 testes verdes (reexecutado); mutação com chave extra `./primitives/*` via `JG_DS_PACKAGE_JSON` falhou (`extra: ["./primitives/*"]`); typecheck/lint limpos.
- [x] T9 — RED: 29 falhas `tokens.css deve declarar --color-<nome>: #HEX: expected undefined` (reexecutado, 3 verdes). Ajuste do verificador: hex esperado = fill real dos nós (Text/Coral = #F0805F; description #EA6B4F defasada); estilos sem uso em nós (Border, Border Soft, Primary Light/Dark) usam a description; Text/Primary = Lacuna. GREEN: `src/styles/tokens.css` com `@theme` e 29 `--color-*` + `/* figma:<styleId> */`; DS 86 e web 5 testes verdes, typecheck/lint limpos (reexecutados). Nota: Surface Card/Raised estão ligados no Figma a variáveis `color/text-primary`/`text-secondary` (ruído, hex ok).
- [x] T10 — RED: `expected '/*! tailwindcss v4.3.3…' not to contain '.bg-red-500'` (reexecutado; `.bg-primary`/`.text-ink` já gerados). GREEN: resets `--color-*/--radius-*/--shadow-*/--font-*/--text-*: initial` no `@theme`; DS 87 e web 5 testes verdes, typecheck/lint limpos (reexecutados).
- [x] T11 — RED: 11 falhas `tokens.css deve declarar --color-background: var(--color-ink): expected undefined` (reexecutado, 32 verdes). GREEN: 5 aliases (`background→ink`, `focus→primary`, `input-border→secondary`, `destructive-text→text-coral`, `destructive→error`) no `@theme`; DS 98 e web 5 verdes, typecheck/lint limpos (reexecutados). Nota: `@theme` simples (sem `inline`): utilitário emite `var(--color-background)` → `var(--color-ink)`.
- [x] T12 — RED: `--text-body-14-bold-lh-16` com tudo `undefined` e `ao menos um --text-* declarado: expected 0 to be greater than 0` (reexecutado, 44 verdes). GREEN: token + `--line-height: 16px`, `--font-weight: 700`, `--letter-spacing: 0` com `/* figma:70321:354 */` (estilo "Body/14 Bold · lh 16", file.json:398634-398639; nó Save Button 253134-253147); DS 101 e web 5 verdes, typecheck/lint limpos (reexecutados). Unidades px/0 escolhidas pelo test-writer.
- [x] T13 — RED: 4 falhas (`--radius-3`/`--radius-5` undefined, `ao menos um --radius-*`, `--spacing: 1px`; reexecutado, 49 verdes). Raios conferidos no file.json: 70386:262 cornerRadius 3 (253196), 70381:242 cornerRadius 5 (193043). GREEN: `--radius-3`/`--radius-5` com `/* figma:<nodeId> */` e `--spacing: 1px`; sombras ainda nenhuma (teste valida sombras futuras, formato `Xpx Ypx Rpx rgba()` definido pelo test-writer); DS 108 e web 5 verdes, typecheck/lint limpos (reexecutados).
- [x] T14 — RED: 5 falhas por asserção (0 `@font-face`, `OFL.txt` ausente, `--font-sans/--font-mono` undefined; reexecutado). GREEN: `src/styles/fonts.css` (3 `@font-face` 400/500/700, swap, `url('../fonts/…')`), `src/fonts/RobotoMono-{Regular,Medium,Bold}.woff2` (12680/12936/12696 B, assinatura wOF2, subset latin de `@fontsource/roboto-mono@5.3.0`, OFL-1.1, baixado em dir isolado, sem dependência no repo) + `OFL.txt`, `--font-sans/--font-mono` no `@theme`; DS 113 e web 5 verdes, typecheck/lint limpos (reexecutados). **Desvio de layout:** fontes em `src/fonts/` (não `assets/fonts/`) para a URL relativa valer em `src` e `dist`.
- [x] T15 — **Desvio:** guarda de integração sem RED (fonts.css já existe). Infra: projeto `unit` do Vitest em browser mode (`@vitest/browser-playwright`, chromium headless, 1440×900, plugin `@tailwindcss/vite`), `tsconfig` com `types: [node, vite/client]`. Evidência: 3 testes verdes (reexecutado: suíte DS 8 arquivos/116 testes); mutação (Bold.woff2 renomeado) falhou só o peso 700 (`NetworkError`); restauração conferida por mim (12696 B, node 5/5); typecheck/lint limpos.
- [x] T16 — RED (3 `it` independentes, reexecutado): `background-color` `expected 'rgba(0, 0, 0, 0)' to be 'rgb(20, 13, 10)'` e `color` `expected 'rgb(0, 0, 0)' to be 'rgb(245, 241, 235)'`; `font-family` já passava (preflight do Tailwind aplica `--font-sans`), fica como guarda. GREEN: `src/styles/base.css` (`@layer base { body { background-color: var(--color-background); color: var(--color-foreground) } }`), `src/styles/index.css` (tokens+fonts+base), `src/test/entry.css` aponta para `../styles/index.css`; 5 execuções seguidas da suíte DS (119 testes) verdes, web 5, typecheck/lint limpos (todos reexecutados por mim). Ressalva: uma execução isolada do `code-writer` falhou sem causa capturada e não reproduziu em 8 reexecuções (sem evidência de flaky). Correção: o code-writer havia afirmado que `--color-background` não existia (leitura truncada); corrigido.
- [x] T17 — RED (reexecutado): 4 falhas `expected 'auto' to be 'solid'` (link, button, input, `[tabindex="0"]` focados por Tab); clique de mouse sem outline passa como guarda. GREEN: `base.css` `@layer base { :focus-visible { outline: 2px solid var(--color-focus); outline-offset: 2px } }`; `vitest.config.ts` projeto `unit` com `optimizeDeps.include: [react/jsx-dev-runtime, vitest-browser-react]` (causa da falha intermitente do modo browser em cache frio: reotimização de deps do Vite). Verificação minha com cache frio apagado (`.vite`, `.vite-temp`, `.vitest`): DS 9 arquivos/124 testes verdes, web 5, typecheck/lint limpos. Nota: a chave `optimizeDeps` foi validada só pelo efeito (não li a doc).
- [x] T18 — **Desvio:** guarda sem RED (os tokens já existiam). 8 testes (função WCAG + pares sobre `--color-background`=ink #140D0A). Razões reais: foreground 17,10:1; destructive-text (coral **#F0805F**) 7,29:1 (o plano estimava 6,15:1 com #EA6B4F); input-border (secondary) 6,72:1; focus (primary) 6,85:1; error #ED1B2E 4,39:1 (**não usar como cor de texto**); border 1,34:1. Mutação (`--color-input-border`→`var(--color-border)` via `JG_TOKENS_CSS`) falhou: `expected 1.3426… to be ≥ 3`. Reexecutado: DS 10 arquivos/132 testes, typecheck/lint limpos.
- [x] C1 [x] C2 [x] C3 [x] C4 [x] C5 [x] I1 [x] C6 [x] C7 [x] C8 [x] C9 [x] C10 [x] C11 [x] C12 [x] C13
- Lote 1 (C3 Badge, C4 Skeleton, C5 Button, C6 Label, C7 Input) mesclado em 2026-10-22; evidências em `.AI/plans/executions/C*.md`. Lição: `--spacing: 1px`, então stories/classes usam px (`h-40`, não `h-10`). I1 pendente (exige infra em apps/web + build do DS).
- [x] C14 [x] C15 [x] C16 [x] C17 [x] C18 [x] C19 [x] C20 [x] C21 [x] C22 [x] C23 [x] C24 [x] C25
- **Desvio de método (componentes):** (a) antes do RED de cada componente, um **esqueleto de API** (assinatura do contrato §3.5, `return null`) feito pelo code-writer, para o RED falhar por asserção e não por import inexistente; (b) os sub-itens de cada componente são agrupados em ciclos RED/GREEN por bloco (comportamento; medida/foco/axe), não um teste por vez; (c) item extra **L1** `lib/cn` antes do C3.
- **C1 (itens 1–3, unitário)** — RED reexecutado: 7 falhas (`Cannot find element with locator: getByRole('status')`/`('alert')`/`getByText(...)`; esqueleto devolve null). GREEN: `LiveRegion` (`role` status|alert, `aria-live`, `aria-atomic="true"`) e `VisuallyHidden` (`<span class="sr-only">`); DS 12 arquivos/139 testes, web 5, typecheck/lint limpos (reexecutados). Golden: nenhum (invisível, exceção justificada). **C1.4 stories + infra Storybook** — Storybook 10.6.3 montado (`.storybook/{main.ts,preview.tsx,storybook.css}`, projeto `storybook` do Vitest via `storybookTest`, a11y `error`, viewports 390/768/1440); stories `Polite`/`Assertive`/`Default` passam (desvio de RED: infra). Mutação descartável (`<button type="button" />` sem nome) falhou com `button-name` e foi removida. Verificação minha: `pnpm --filter @jg/design-system test` 14 arquivos/142 testes, typecheck/lint limpos, `storybook:build` concluído.
- **C2 Separator (itens 1–2, unitário)** — RED reexecutado: 5 falhas `Cannot find element with locator: getByRole('separator')`/`getByTestId('sep')`. Medida do Figma conferida por mim (file.json:3750-3772, Line 1 de 70504:3017): **stroke #D28A4C = `--color-primary`, strokeWeight 0.3px** (o plano supunha `--color-border`: corrigido). GREEN: `Separator` sobre `@radix-ui/react-separator` (shadcn por cópia manual), `bg-primary`, `h-[0.3px] w-full` / `h-full w-[0.3px]`, `data-slot`; DS 15 arquivos/147 testes, web 5, typecheck/lint limpos (reexecutados). Desvio: sem `cn` ainda (concatenação simples até L1). Pendente: story (3) e golden (4).
- **C2.3 story + C2.4 golden (+ infra de golden)** — Infra: `playwright.config.ts` (3 projects, snapshotPathTemplate `{platform}/{projectName}`, `updateSnapshots:'none'`), `golden/{manifest.ts,golden.spec.ts}`, `tools/serve-static.mjs`, `tools/visual-docker.mjs` (imagem `mcr.microsoft.com/playwright:v1.64.1-noble`, volume `jg-ds-pw-node-modules`; `pnpm test:visual:docker [--update-snapshots=changed]`), Radix em `optimizeDeps.include`, `testTimeout: 30000` no project `node` (cold start do ESLint). RED reexecutado por mim no Docker: `A snapshot doesn't exist at …/linux/<project>/primitives-separator--horizontal.png` ×3 (index.json passa 3/3; 0 PNG). GREEN: baselines geradas por mim com `--update-snapshots=changed` no Docker e REVISADAS visualmente (linha 0,3px primary sobre ink, bloco surface-card; 1440/768/390); 2 reexecuções seguidas `6 passed`. **Desvio/achado:** a tolerância do ADR-07 (`threshold 0.2`, `maxDiffPixelRatio 0.002`) deixou uma baseline obsoleta passar (mudança de fundo surface-card sutil no tema escuro); apertada para `threshold: 0.02`, `maxDiffPixelRatio: 0.0005` (render determinístico no Docker) e confirmada: a baseline antiga passou a falhar (54924 px diferentes). Story corrigida (`bg-neutral-900` não existe com a paleta zerada → `bg-surface-card`).
- **L1 `lib/cn`** — RED reexecutado: 6 falhas `expected '' to be '…'`; o `test-writer` mediu que a `tailwind-merge` padrão trata `text-body-14-bold-lh-16` como cor (descarta cor ou tamanho junto de `text-ink`) → teste extra adicionado. GREEN: `cn = twMerge(clsx())` via `extendTailwindMerge` (grupo `font-size` com validador para os prefixos TEXT do Figma: body, body-large, tiny, display, caption, heading, title); `cn` interno (fora do entry público). `clsx`/`tailwind-merge`/`cva` adicionados ao `optimizeDeps.include` (evita reload a frio). DS 17 arquivos/154 testes, typecheck/lint limpos (reexecutados). Esqueletos de Badge/Skeleton/Button já criados.
- [x] A1 `pnpm install --frozen-lockfile && pnpm verify` verde (Docker)

## Execução paralela (decisão do usuário, 2026-10-22)
- Até **5 workers em paralelo**, cada um um agente Sonnet em **worktree próprio**, fazendo TDD (RED → GREEN) no seu componente e **comitando em cada fase** (`test(red)`, `feat(green)`, stories, golden) no próprio branch; eu faço os merges em `feat/design-system` e reverifico a suíte.
- **Portão antes de paralelizar:** (1) GATE-TOKENS — todos os tokens atômicos (59 estilos TEXT, todos os raios, todas as sombras, breakpoints) e semânticos (surface, text, accent, hover/active, disabled, overlay) mapeados com testes derivados do `file.json`; (2) GATE-INFRA — esqueletos de TODOS os componentes + `src/index.ts` final + golden por tags (sem arquivo compartilhado a editar). Evidências em `.AI/plans/executions/gate-*.md`; cada worker escreve as suas em `.AI/plans/executions/<componente>.md`.
- Nota: worktrees nascem de `main`; os workers devem rodar `git merge --ff-only feat/design-system` antes de começar.
- **A1 (2026-10-22, revisado):** num clone limpo do branch (`git clone` em caminho curto, `pnpm install --frozen-lockfile`, caches apagados) `pnpm verify` saiu 0: 10 tarefas ok em 11 min; DS 70 arquivos/800 testes, web 4 arquivos/7 testes; `test:visual` (delegado ao Docker fora do Linux por `tools/visual.mjs`) 296 passed, 7 skipped. Três execuções anteriores no clone falharam por cold start (conexão do browser, timeout de teste, timeout de 5 s do golden com Docker lento) e foram tratadas com `connectTimeout` 180 s, `testTimeout` 30 s nos projetos browser e `expect.timeout` 20 s no golden (a tolerância das capturas não mudou). Detalhes e desvios em `ARCHITECTURE.md`.
