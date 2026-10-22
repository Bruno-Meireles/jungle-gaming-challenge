# C22 Alert: evidencias

Branch `worktree-agent-a4e06a1429c3964e4`. Commits: `0e505d2` test(red), `b8888fb` feat(green), stories, golden (ver `git log`).

## Sub-itens (reexecutado: `pnpm exec vitest run --project unit src/primitives/alert`, 8 passed)
1. error -> `role=alert`; info/success -> `role=status`.
2. slot `action` focavel (Tab foca o botao, Enter dispara).
3. tom nao so por cor: rotulo sr-only (Erro/Informacao/Sucesso) + icone `aria-hidden` de forma propria por tom (3 SVG distintos); contorno 1px em `--color-error` (error), `--color-success`, `--color-primary`.
4. axe nos 3 tons (com title e action).
5. Stories Info/Success/Failure/WithAction (`vitest run --project storybook alert`: 4 passed, a11y `error`).
6. Golden: 4 stories x 3 viewports = 12 PNG.

## Fases
- RED `0e505d2`: 8 falhas por ausencia do comportamento (`Cannot find element with locator: getByRole('alert')`, `getByText('Falha na rede')`, `getByText('Erro')`; contorno: elemento ausente); o esqueleto retornava null.
- GREEN `b8888fb`: 8 passed. Ajuste de teste nesta fase (justificado): `toHaveTextContent('...')`/regex falhou porque o texto recebido e `ErroPagamento recusado` (rotulo sr-only + mensagem) e o matcher do vitest-browser nao aceitou substring/regex; trocado por `getByRole(..).getByText(..).toBeVisible()`, mesma intencao.
- Golden: RED `A snapshot doesn't exist at .../primitives-alert--info.png`; `pnpm test:visual:docker --update-snapshots=changed -g primitives-alert` (12 passed) e reexecucao sem update: 12 passed. Revisao visual de `mobile-390/with-action` (icone de alerta vermelho, texto em 3 linhas ao lado do botao outline) e `desktop-1440/success` (contorno verde, titulo bold, icone check): ok.
- Nota: `-g` usa o id com hifen (`primitives-alert`), nao sem hifen.

## Verificacao final
- `pnpm -r typecheck`, `pnpm -r lint`: limpos.
- `pnpm --filter @jg/design-system test`: 52 arquivos, 630 passed.
- `pnpm storybook:build`: ok.

## Lacunas
- Alert nao existe no Figma (derivado, Q10/Q18): sem medidas testadas; padding 12, gap 12, raio 8, contorno 1px sao decisoes do code-writer.
- Rotulos sem acento ("Informacao") seguindo o estilo ASCII dos testes; acentuar exige ajuste do teste.
