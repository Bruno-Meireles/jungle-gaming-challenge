# C8 FormField - evidencias

Commits: c0242ef test(red), f226b06 feat(green), 8b47cbc test(stories), golden (baselines linux).

- RED (c0242ef): stub retornava null; `vitest run src/patterns/form-field` -> 10 falhas por assercao (elemento nao encontrado), 1 passou trivialmente (sem error nao ha aria-invalid).
- GREEN (f226b06): 11/11 passam. Ajuste de teste justificado: `getByLabelText('E-mail')` exato falha com `required` (asterisco entra no texto do label); trocado por `getByRole('textbox', {name})`.
- Cobertura dos sub-itens: 1 id/htmlFor (+ ids distintos); 2 hint via aria-describedby (preserva describedby do filho); 3 error -> aria-invalid + mensagem ligada, role=alert so quando o erro muda apos a montagem (estado derivado no render, sem useEffect); 4 erro e asterisco em text-coral (rgb 240,128,95); 5 axe com erro+hint+required; 6 stories Default/WithHint/WithError/Required; 7 golden.
- Golden (Docker): `node ../../tools/visual-docker.mjs -g formfield --update-snapshots=changed` 12 passam (4 stories x 3 viewports), baselines revisadas visualmente (label, input com borda de erro vermelha, mensagem coral, asterisco coral).
- `pnpm --filter @jg/design-system typecheck` e `lint`: limpos.
- Suite completa `pnpm --filter @jg/design-system test`: 483 de 486 passam na 1a execucao e 1 falha na 2a (Button "primary lg"); falhas em outros componentes, variam entre execucoes (flaky sob carga), fora do escopo C8.
- Lacunas: gap 8px, hint em secondary 14/16 e tipografia do erro nao tem no Figma um no de FormField; valores escolhidos por coerencia com Label/Input (cor do erro exigida: text-coral).
