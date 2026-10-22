# C7 Input - evidencias

Commits: c890b35 (RED comportamento), 83f9c63 (GREEN), a8e2874 (RED medidas), 9707c2f (GREEN medidas), stories, golden.

- Causa do GREEN pendente: classes de medida com escala errada (--spacing = 1px) e falta de espaco em "placeholder:leading-[16px]placeholder:". Corrigido com h-40/px-16/py-12/gap-8.
- Ajuste de teste (justificado): Chrome mantem `line-height: normal` em `::placeholder` de input (verificado com regra `!important`); a altura 16 e medida no input.
- `pnpm exec vitest run src/primitives/input`: 10/10 passam (comportamento, medidas, foco, aria-invalid, startSlot, endSlot, disabled, axe).
- `pnpm typecheck` e `pnpm lint`: limpos.
- Stories: Default, Placeholder, Filled, Invalid, Disabled, WithIcon (golden) + Focus (golden-focus).
- Golden (Docker, linux, 3 viewports): `node ../../tools/visual-docker.mjs -g input` 21 passam; baselines revisadas visualmente (borda secondary, foco primary + outline, erro vermelho, disabled com fundo, icone de busca).
- Suite completa: 426 passam; 6 falhas apenas em Badge.test.tsx (outro componente, RED aguardando GREEN).
- Lacunas: variantes perfil/pagamento (417px) sao Select, fora do Input; placeholder line-height nao verificavel em Chrome.
