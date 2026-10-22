# C6 Label

Branch `worktree-agent-a72729bb939a2a86b`. Commits: `5c84b9e` RED, `9fc3ec4` GREEN, `bea946c` stories, golden (ver git log).

## Sub-itens
1. `htmlFor` (getByLabelText): Label.test.tsx, verde.
2. `required`: asterisco aria-hidden, text-coral (rgb 240,128,95), nome acessivel inalterado: verde. `required` do campo e responsabilidade do FormField/consumidor (decisao registrada no teste).
3. Medida: 15px/400/lh15, foreground; asterisco 22/29/400; altura 29 (Figma 70321:341, 70323:306, 70321:311): verde.
4. Stories Default e Required (tag `golden`); axe verde.
5. Golden: `primitives-label--default` e `--required` nos 3 viewports, baselines Linux/Docker revisadas visualmente.
   Defeito achado na revisao: `--spacing` = 1px, entao `w-80/p-6/h-10` da story colapsavam (80px/6px/10px). Corrigido para `w-320 p-24 gap-8 h-40 px-12`, baselines regeneradas.

## Comandos reexecutados (packages/design-system)
- `pnpm storybook:build`: ok.
- `pnpm test:visual:docker --update-snapshots=changed`: 15 passed (baselines novas); reexecucao sem update: 15 passed.
- `pnpm typecheck`, `pnpm lint`: limpos.
- `pnpm test`: 417 passed, 6 failed, todas em `badge/Badge.test.tsx` (RED de C3 herdado da base, fora do C6). Label 6/6 verdes.
