# Plano: design-system-i18n (F0a)

Autor do plano: `architect` (Opus), gravado por `/plan-create`. Escopo: somente `packages/design-system`. Nenhuma biblioteca é instalada nem muda de camada. Muda o **contrato público** do design system (registrado em ADR-14).

## Decisões do usuário (respondidas em /plan-create)

O usuário delegou as decisões de rotina e autorizou a sequência de trabalho (mensagem de 2026-10-22: "Autorizo essa sequência e as decisões rotineiras"). As lacunas do `architect` foram resolvidas com a recomendação dele, **assumidas com aprovação por essa delegação**; reverter qualquer uma exige novo plano:

- **Q1** Breadcrumb e Pagination usam a prop `label` (padrão de `QuantityStepper`/`Rating`), não `aria-label` nativo obrigatório.
- **Q2** `Alert` recebe `toneLabel: string` obrigatório por instância (e não um mapa `labels` por tom).
- **Q3** RED de obrigatoriedade por **teste de tipo** (`tests/ui-text-props.typetest.tsx`, `@ts-expect-error` checado só pelo `tsc`; RED = TS2578), sem ativar `test.typecheck` do Vitest.
- **Q4** Links de página da Pagination continuam com nome numérico; `getPageLabel` fica fora do escopo.
- **Q5** Fixtures de testes e stories do DS em pt-BR (cópia do Figma); testes de repasse (T4.r–T6.r e os de Dialog/PasswordInput) usam inglês.

## 1. Requisitos cobertos

| § | Trecho | Como esta feature atende |
|---|---|---|
| prompt.md:15 | "i18n desde o momento zero, para evitar textos hardcoded e permitir variação entre inglês e pt-BR" | O DS deixa de ter texto de interface embutido; todo rótulo vira prop obrigatória |
| prompt.md:14 | "melhores práticas de código e de componentização" | Padrão único de nome das props de rótulo, tipos exatos, guarda automática |
| `.AI/standards/i18n-quality.md` | "o design system não tem texto de interface embutido" | Contratos do item 3, guarda G1 e testes T1–T6 |
| `design.md` §5.1 | rótulos como props, guarda por teste | Toda a feature |
| `ARCHITECTURE.md` (pendência "i18n do design system") | — | Fecha a pendência (ADR-14) |

## 2. Slice FSD / estrutura

Pacote `@jg/design-system`, camadas `styles < lib < primitives < patterns`.

### Inventário de texto de interface a corrigir (só `src/`, fora de testes/stories/`src/test/`)

| # | Arquivo:linha | Texto | Tipo |
|---|---|---|---|
| V1 | `primitives/alert/Alert.tsx:19-21` (renderizado em `:74`) | `'Erro'`, `'Informação'`, `'Sucesso'` | rótulo sr-only sem prop |
| V2 | `primitives/breadcrumb/Breadcrumb.tsx:8` | `aria-label="Trilha"` | `aria-label` fixo |
| V3 | `primitives/pagination/Pagination.tsx:19` | `aria-label="Paginação"` | `aria-label` fixo |
| V4 | `primitives/pagination/Pagination.tsx:30,34` | `aria-label="Próxima"` | `aria-label` fixo |
| V5 | `primitives/dialog/DialogClose.tsx:11` (vale também para `SheetClose`, `sheet/SheetParts.tsx:10`) | default `closeLabel = 'Fechar'` | default de prop |
| V6 | `primitives/password-input/PasswordInput.tsx:35-36` | defaults `'Mostrar senha'`/`'Ocultar senha'` | default de prop |
| V7 | `primitives/quantity-stepper/QuantityStepper.tsx:32-33` | defaults `'Diminuir'`/`'Aumentar'` | default de prop |

Já conformes (não mudam): `QuantityStepper.label`, `Rating.label`, `RangeSlider.thumbLabels`, `FormField.label`, `Avatar.alt`, `NftCard.title`/`image.alt`, `Button` icon com `aria-label` obrigatório. Exceções justificadas (glifos sem letra, `aria-hidden`): `*` do `Label` e `/` do `BreadcrumbItem`. Números renderizados (`QuantityStepper` valor, `Pagination` página) são dígitos, não texto de interface. Em `Badge.tsx:21`, `label:` é chave de variante `cva` (falso positivo a evitar na guarda). **Não verificado:** se algum Radix (dialog, select, slider) injeta texto ou `aria-label` próprio (R1).

### Peças alteradas (nenhum export novo; `src/index.ts` não muda)

| Peça | Arquivo | Mudança |
|---|---|---|
| Alert | `primitives/alert/Alert.tsx` | prop `toneLabel: string` obrigatória; `TONES` perde `label` |
| Breadcrumb | `primitives/breadcrumb/Breadcrumb.tsx` | prop `label: string` obrigatória → `aria-label` |
| Pagination | `primitives/pagination/Pagination.tsx` | props `label` e `nextLabel` obrigatórias |
| DialogClose / SheetClose | `primitives/dialog/DialogClose.tsx` | `closeLabel` obrigatória, sem default |
| PasswordInput | `primitives/password-input/PasswordInput.tsx` | `showLabel` e `hideLabel` obrigatórias, sem default |
| QuantityStepper | `primitives/quantity-stepper/QuantityStepper.tsx` | `decrementLabel` e `incrementLabel` obrigatórias, sem default |
| Guarda | `tests/ui-text-literals.node.test.ts` (novo) | teste node com AST do TypeScript |
| Testes de tipo | `tests/ui-text-props.typetest.tsx` (novo) | só o `tsc` o executa |

Dependências: as mesmas do plano `design-system.md` §2.2; a guarda usa `typescript` já presente na raiz.

## 3. Contratos (substituem `design-system.md` §3, linhas 131, 134, 137, 139, 140)

REST, MSW e Socket.IO: não se aplicam.

- **Obrigatória no tipo, sem default.** Com opcional o código compilaria e entregaria controle sem nome acessível (só o axe pegaria, e só onde houver teste); obrigatória, o `tsc` falha em todo consumidor, inclusive na F0b.
- **Padrão de nome:** `label` = nome acessível da raiz de um contêiner (nav, group, img); `<ação>Label` = nome de controle de ação (`closeLabel`, `showLabel`/`hideLabel`, `decrementLabel`/`incrementLabel`, `nextLabel`); `<qualificador>Label` = rótulo sr-only auxiliar (`toneLabel`); plural para tupla (`thumbLabels`); atributo nativo onde o componente é o próprio elemento nativo (`Button` icon `aria-label`, `Avatar.alt`, `image.alt`).
- **Alert:** `{ tone; toneLabel: string; title?; children; action? }`.
- **Breadcrumb:** `Omit<ComponentProps<'nav'>, 'aria-label'> & { label: string }`.
- **Pagination:** `Omit<ComponentProps<'nav'>, 'aria-label'> & { page; pageCount; getItemProps?; label: string; nextLabel: string }`; `nextLabel` continua prevalecendo sobre `getItemProps(page + 1)`.
- **DialogClose:** `Omit<ComponentProps<typeof DialogPrimitive.Close>, 'children'> & { closeLabel: string }` (`SheetCloseProps` herda).
- **PasswordInput:** `Omit<ComponentProps<'input'>, 'type'> & { showLabel: string; hideLabel: string }`.
- **QuantityStepper:** `{ value; min; max; onValueChange; label: string; decrementLabel: string; incrementLabel: string }`.
- **Ergonomia no app:** a F0b cria wrappers em `shared/ui` que injetam `t()`; o DS não conhece i18n.

Registro da mudança: `.AI/plans/design-system.md` §3 (linhas acima) marcadas "(alterado por design-system-i18n, ADR-14)" e ajuste dos textos de C16.1, C18.1/2, C23.4, C9.2, C14.1; evidências históricas `executions/C*.md` ficam como estão; `README.md` do DS ganha a seção "Textos e i18n"; `ARCHITECTURE.md` ganha ADR-14 e perde a pendência; `design.md` corrige "baselines regeneradas" para "baselines inalteradas".

## 4. Aceite

| # | Critério observável | Prova |
|---|---|---|
| A1 | Nenhum arquivo de `src/` (fora de `*.test.*`, `*.stories.*`, `src/test/**`) contém texto de interface literal: JSX text com letra, string literal com letra em `aria-label`/`aria-description`/`aria-roledescription`/`aria-valuetext`/`aria-placeholder`/`alt`/`title`/`placeholder`, default de parâmetro `*label*`/`*Label(s)`/`*text`/`*title`/`placeholder`/`alt`, ou propriedade `label`/`*Label`/`title` com literal fora de `cva()`/`cn()` | G1 |
| A2 | A guarda detecta cada forma proibida e aceita as exceções | autotestes G1.a–h + mutação G1.m |
| A3 | Omitir qualquer prop de rótulo do item 3 faz o `tsc` falhar | T1–T6 (`pnpm --filter @jg/design-system typecheck`) |
| A4 | O texto passado por prop é o nome acessível ou o rótulo sr-only (inglês prova ausência de pt-BR fixo) | T4.r, T5.r, T6.r e testes de Dialog, PasswordInput, QuantityStepper |
| A5 | Testes, stories (inclusive `play`) e axe do DS continuam verdes com os textos explícitos | `pnpm --filter @jg/design-system test` |
| A6 | Regressão visual verde **sem baseline alterada**: `git diff --stat -- packages/design-system/golden/__screenshots__` vazio | `pnpm test:visual:docker` sem `--update-snapshots` |
| A7 | `apps/web` continua verde (typecheck, test, build; smoke I1) | `pnpm verify` |
| A8 | README, contrato §3 e ADR-14 atualizados | `/plan-execution-review` |

## 5. Testes RED

Método: os testes unitários browser do DS rodam em 1440×900. Esta feature não tem tela nem fluxo, então não há E2E 390/1440 novo; os 3 viewports ficam cobertos pelo golden existente (A6). RED sem import inexistente: (a) teste de tipo com `@ts-expect-error` → `tsc` falha com **TS2578** (diretiva não usada, porque a prop hoje é opcional); (b) para Alert, Breadcrumb e Pagination há RED de runtime por asserção (a prop é ignorada e o nome continua em pt-BR); (c) a guarda G1 falha hoje listando os 6 arquivos. Editar testes e stories existentes para passar a prop é correção de contrato e exige justificativa no log.

| # | Teste | Arquivo | Tipo | VP |
|---|---|---|---|---|
| G1 | Guarda "src do DS sem texto de interface literal". Autotestes sobre fontes sintéticas: a `<p>Olá</p>` reprovado; b `aria-label="Fechar"` reprovado; c `aria-label={'Next'}` reprovado; d `({ closeLabel = 'Fechar' })` reprovado; e `{ label: 'Erro' }` reprovado; f `cva({variants:{label:'h-32 px-8'}})` aceito; g `<span aria-hidden="true">/</span>` e `*` aceitos; h glifo sem letra **sem** `aria-hidden` reprovado; comentários ignorados. Varredura `it.each` por arquivo de `src/**/*.{ts,tsx}`. AST com `ts.createSourceFile`. RED esperado: falham Alert, Breadcrumb, Pagination, DialogClose, PasswordInput e QuantityStepper com `arquivo:linha:texto` | `packages/design-system/tests/ui-text-literals.node.test.ts` | unitário node | – |
| T1 | `DialogClose` e `SheetClose` sem `closeLabel` não compilam. RED: TS2578 ×2. GREEN: remover default (`DialogClose.tsx:11`), tipo obrigatório; passar `closeLabel="Fechar"` em Dialog.test, Dialog.stories, Sheet.test, Sheet.stories | `tests/ui-text-props.typetest.tsx` | tipo (tsc) | – |
| T2 | `PasswordInput` sem `showLabel` e, separadamente, sem `hideLabel` não compila. RED: TS2578 ×2. GREEN: `PasswordInput.tsx`; passar as props em PasswordInput.test e nos `args` das stories | idem | tipo (tsc) | – |
| T3 | `QuantityStepper` sem `decrementLabel` / sem `incrementLabel` não compila. RED: TS2578 ×2. GREEN: `QuantityStepper.tsx`; passar nas renderizações de teste e nos `args` das stories | idem | tipo (tsc) | – |
| T4.r | `Alert toneLabel="Error"` expõe "Error" (sr-only) e não "Erro". RED de runtime | `src/primitives/alert/Alert.test.tsx` | unitário browser | 1440 |
| T4 | `Alert` sem `toneLabel` não compila (TS2578). GREEN: `Alert.tsx`; passar `toneLabel` em testes e stories | `tests/ui-text-props.typetest.tsx` | tipo (tsc) | – |
| T5.r | `Breadcrumb label="Breadcrumb"` → `getByRole('navigation', { name: 'Breadcrumb' })`. RED: hoje "Trilha" | `src/primitives/breadcrumb/Breadcrumb.test.tsx` | unitário browser | 1440 |
| T5 | `Breadcrumb` sem `label` não compila (TS2578). GREEN: `Breadcrumb.tsx`; passar `label="Trilha"` em testes e story | `tests/ui-text-props.typetest.tsx` | tipo (tsc) | – |
| T6.r | `Pagination label="Pagination" nextLabel="Next"` → navigation "Pagination" e link "Next" (habilitado e, na última página, `aria-disabled`). RED: hoje "Paginação"/"Próxima" | `src/primitives/pagination/Pagination.test.tsx` | unitário browser | 1440 |
| T6 | `Pagination` sem `label` / sem `nextLabel` não compila (TS2578 ×2). GREEN: `Pagination.tsx`; passar `label="Paginação" nextLabel="Próxima"` em testes e stories | `tests/ui-text-props.typetest.tsx` | tipo (tsc) | – |
| G1.m | Mutação: depois do verde, inserir temporariamente `aria-label="Fechar"` num primitive; G1 falha com `arquivo:linha`; reverter e reexecutar verde | (evidência) | – | – |
| V | `pnpm verify` completo + `git diff --stat` vazio em `golden/__screenshots__` | – | verificação | 1440/768/390 (golden) |

Ordem: G1 primeiro (fica vermelho até T6); depois T1–T3 (só mudam tipo, do menor para o maior); por fim T4–T6 (comportamento: RED de runtime antes do de tipo). Golden: **baselines inalteradas** (todos os textos afetados são invisíveis: `aria-label` ou sr-only); qualquer PNG alterado é bug e vira novo RED, nunca `--update-snapshots`. Impacto em `apps/web`: nenhum (o único consumidor é o smoke I1 com `Button`, que não muda).

## 6. Riscos e lacunas remanescentes

- **R1 (não verificado):** Radix (dialog 1.3.1, select 2.4.1, slider 1.6.1) não injeta texto ou `aria-label` próprio. Na execução, `grep` em `node_modules/@radix-ui/react-{dialog,select,slider}/dist` colado no log; se houver texto, vira Lacuna.
- **R2 (não verificado):** `typescript-eslint` recommended permite `@ts-expect-error` com descrição (`ban-ts-comment`). Cada diretiva leva descrição; se o lint reprovar, desligar a regra só em `tests/**/*.typetest.tsx` (registrar).
- **R3:** a guarda é heurística: texto montado em variável fora das formas listadas escapa (ex.: `const x = 'Fechar'; <b>{x}</b>`). Mitigação: revisão do `architect` e lint de literais do app (F0b).
- **R4 (pré-existente, não tratado):** a story golden `PasswordInput/Visible` tem `play`, em desacordo com o ADR-10.

## 7. Fora do escopo

Biblioteca de i18n, providers, chaves e locales, seletor de idioma, `<html lang>` e lint `jsx-no-literals` do app (F0b); formatação de números e datas no DS; rótulos de página da Pagination e botão "Anterior"; alvos de toque menores que 24×24; textos do app (smoke I1); reescrever evidências históricas; baselines por idioma (telas do app).

## 8. Decisões para ARCHITECTURE.md

**ADR-14 Design system sem texto de interface.** Contexto: requisito de i18n desde o momento zero; o DS tinha rótulos e defaults em pt-BR. Decisão: todo texto de interface entra por prop **obrigatória no tipo**, sem default; padrão de nome (`label`, `<ação>Label`, `toneLabel`, plural em tupla, atributos nativos onde o componente é o elemento nativo); guarda node por AST reprova literal em `src`; testes de tipo provam a obrigatoriedade; exceções: glifos sem letra com `aria-hidden`. Descartado: props opcionais sem default (só o axe pegaria), defaults em inglês (troca um idioma fixo por outro), `jsx-no-literals` no DS (dependência nova e não cobre defaults/mapas), biblioteca de i18n no DS (o DS é agnóstico). Consequência: mudança de contrato em relação a `design-system.md` §3; todo consumidor passa o texto traduzido e o compilador acusa a falta; fixtures do DS em pt-BR com repasse em inglês; baselines inalteradas; fecha a pendência de i18n do DS.

## Progresso

- [ ] G1 guarda de literais (RED: falha nos 6 arquivos)
- [ ] T1 DialogClose/SheetClose
- [ ] T2 PasswordInput
- [ ] T3 QuantityStepper
- [ ] T4.r + T4 Alert
- [ ] T5.r + T5 Breadcrumb
- [ ] T6.r + T6 Pagination
- [ ] G1 verde + mutação G1.m
- [ ] Docs: README (seção Textos e i18n), design-system.md §3, ADR-14 e design.md
- [ ] V `pnpm verify` e diff de baselines vazio
