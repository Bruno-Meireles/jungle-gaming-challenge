# @jg/design-system

Design system do desafio (React 19, Tailwind 4 CSS-first, Radix UI). Tokens e medidas vêm de `docs/figma/file.json`; a lista completa de tokens está em `docs/design-tokens.md`. Plano e decisões (ADR-01 a ADR-12): `.AI/plans/design-system.md`. Evidências por componente: `.AI/plans/executions/`.

## Instalação e uso

Pacote do workspace (pnpm + Turborepo). No app:

```json
{ "dependencies": { "@jg/design-system": "workspace:*" } }
```

```css
/* CSS de entrada do app (Tailwind 4) */
@import 'tailwindcss';
@import '@jg/design-system/styles.css';
```

```tsx
import { Button } from '@jg/design-system';
```

Só estes caminhos são públicos (`exports`): `.`, `./styles.css`, `./tokens.css`, `./fonts/*`. Importar `@jg/design-system/src/*` ou `/dist/*` falha no lint do app. O `styles.css` já traz `@source` do `dist`, tokens, fontes locais (Roboto Mono 400/500/700, sem rede) e a base (foco visível, cores do `body`). `react` e `react-dom` são peers.

## Comandos

Rodar da raiz (`turbo`) ou em `packages/design-system`.

| Comando | O que faz |
|---|---|
| `pnpm build` | `tsc` para `dist/` e cópia de CSS e fontes (o app depende de `^build`) |
| `pnpm typecheck` / `pnpm lint` | `tsc --noEmit` / ESLint |
| `pnpm test` | Vitest: projetos `node` (guardas e tokens), `unit` (Chromium real) e `storybook` (cada story, com axe em modo erro) |
| `pnpm storybook` / `pnpm storybook:build` | Storybook 10 em :6006 / estático em `storybook-static` |
| `pnpm test:visual` | Gate de regressão visual (Playwright local); roda na validação final, não no `verify` |
| `pnpm test:visual:update` | Atualiza baselines; só com revisão visual (veja a política abaixo) |
| `pnpm verify` (raiz) | `lint typecheck test build` (cotidiano, sem golden) |

Observação: o golden precisa de `pnpm storybook:build` antes e de baselines da própria plataforma; as versionadas hoje são `linux/`. Sem baseline da plataforma, `test:visual` falha (decisão sobre baselines locais pendente, ADR-15). Docker não é usado neste projeto.

## Política de baseline visual

- As baselines ficam em `golden/__screenshots__/linux/{desktop-1440,tablet-768,mobile-390}/` e só valem no Linux; nunca são atualizadas nem apagadas automaticamente.
- O Playwright usa `updateSnapshots: 'none'`: uma baseline ausente ou diferente falha. Tolerância: `threshold 0.02`, `maxDiffPixelRatio 0.0005`.
- Para atualizar: `pnpm storybook:build && pnpm test:visual:update`, **abrir cada PNG alterado**, confirmar contra a intenção do Figma e commitar com justificativa.
- Stories entram no golden por tag: `golden`, `golden-hover`, `golden-focus`, `golden-page` (overlays em página inteira). Stories com `play` não são golden.
- Fidelidade ao Figma é provada por **medidas** (testes com `getComputedStyle`/`getBoundingClientRect` citando `file.json:linha`), não por comparação de pixels com o PNG do Figma.

## Origem dos componentes (shadcn/ui)

Não usamos a CLI do shadcn nem `components.json`. Quando um componente parte do shadcn/ui, é **cópia manual** sobre o pacote `@radix-ui/react-<x>` individual, reestilizada com os tokens do projeto (`cva`, `tailwind-merge`, `clsx`, `data-slot`); o cabeçalho do arquivo registra a origem e a data (exemplo: `Separator`). Classes padrão do Tailwind (`h-9`) não existem: a paleta, os raios, as sombras e os tamanhos de texto padrão foram zerados em `tokens.css`, e `--spacing` vale `1px` (use `h-40`, não `h-10`).

## Regras de dependência

- Sem `axios`, `msw`, `socket.io-client`, `@tanstack/*` nem `@jg/web` (falha no lint); nenhum componente faz rede.
- `primitives` não importam `patterns`. Valores em ETH chegam como string pronta (`priceLabel`), nunca como número.
- Estados, textos e dados vêm por props; o design system não conhece rotas nem cache.

## Textos e i18n

O design system é **agnóstico de idioma**: só recebe por props os textos e valores a exibir, inclusive os rótulos acessíveis. Toda a internacionalização fica no app.

| O DS recebe por props | Fica só no app |
|---|---|
| Textos visíveis (`title`, `children`, rótulos de campo) | Biblioteca de i18n, providers e dicionários |
| Rótulos acessíveis, **obrigatórios e sem default**: `label`, `<ação>Label` (`closeLabel`, `showLabel`/`hideLabel`, `decrementLabel`/`incrementLabel`, `nextLabel`), `toneLabel`, `thumbLabels`; `aria-label` e `alt` nativos | Seleção e persistência de idioma, `<html lang>` |
| Valores já formatados como `string` (ETH, moeda, datas, plurais), ex.: `NftCard.priceLabel="1,19 ETH"` | Formatação com `Intl`, tradução de códigos de erro, wrappers `shared/ui` com `t()` |

`number` só entra como valor de controle (`value`, `min`, `max`, `page`, `pageCount`). Inteiros de controle são renderizados crus (exceção registrada no ADR-14).

Guardas automáticas: o `src` não pode ter texto de interface literal (`tests/ui-text-literals.node.test.ts`) nem usar `Intl`, `toLocale*`, `localeCompare`, `navigator.language` ou `documentElement.lang` (`tests/locale-apis.node.test.ts`); o `package.json` não declara lib de i18n (`tests/package-boundary.node.test.ts`) e o ESLint barra o import dessas libs; omitir uma prop de rótulo falha no `tsc` (`tests/ui-text-props.typetest.tsx`).

## Lacunas conhecidas

Medidas sem fonte no Figma (Alert, Textarea, Sheet, estados disabled e hover, overlay do Dialog) são derivadas do design system e estão marcadas como Lacuna no arquivo de evidência de cada componente.
