# C9 PasswordInput - evidencias

Commits: RED (teste), GREEN (componente), stories + golden + evidencias.

## Sub-itens
1. `type=password` default: teste "renderiza type=password por padrao".
2. Botao "Mostrar senha"/"Ocultar senha" (props `showLabel`/`hideLabel`) com `aria-pressed` alterna `password`/`text`.
3. Foco permanece no botao apos alternar (`document.activeElement`).
4. Medida: caixa 340x40, raio 5, borda 1px (herdada do Input, Password Input 70381:243); icone 20x20 `aria-hidden`.
5. axe: oculto e visivel, sem violacoes.
6. Stories: Hidden, Visible (play clica), Invalid (golden) + Toggle (play com asserções, sem golden).
7. Golden: 9 baselines linux (3 viewports x Hidden/Visible/Invalid), revisadas visualmente (borda secondary, erro vermelho, icone olho cortado em oculto e olho aberto em visivel).

## RED (provado por asserção)
`pnpm exec vitest run src/primitives/password-input` com o esqueleto (`return null`): 8/8 falham com
`VitestBrowserElementError: Cannot find element with locator: getByRole('button', { name: 'Mostrar senha' })` (componente nao renderiza o comportamento), nao por erro de import/setup.

## GREEN
Primeira execucao: `TypeError: Cannot read properties of null (reading 'useState')` (re-otimizacao de deps do Vite na primeira vez que o arquivo foi importado; transitorio). Segunda execucao:
`Test Files 1 passed (1) / Tests 8 passed (8)`.

## Verificacoes finais (reexecutadas)
- `pnpm -r typecheck`: limpo. `pnpm -r lint`: limpo.
- `pnpm --filter @jg/design-system test`: `Test Files 30 passed (30), Tests 483 passed (483)`.
- `pnpm --filter @jg/design-system storybook:build` + `pnpm test:visual:docker --update-snapshots=changed -g password`: 9 passed (baselines novas).

## Decisoes e lacunas
- Lacuna: tamanho do icone (instancia 9:963) nao verificavel no JSON (vetores relativos); adotado 20x20. Icones SVG inline aproximando Iconly Hide 9:964 / 9:1592 (assets Iconly nao disponiveis em `docs/figma/`).
- Nome acessivel muda entre Mostrar/Ocultar e tambem ha `aria-pressed` (conforme plano C9); sinalizacao dupla aceita por seguir o plano.
- `type` removido de `PasswordInputProps` (controlado pelo componente).
