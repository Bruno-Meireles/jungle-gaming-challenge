# C4 Skeleton - evidencias

- Itens 1-4 (unitario + stories): commits 11bcfde, a2f71bc, 2b6df13.
- Itens 5-6 (motion.spec.ts): RED b850671, reexecutado: reduce -> `Received: "shimmer"` (1440 e 390). GREEN: `@media (prefers-reduced-motion: reduce) { [data-slot='skeleton'] { animation: none } }` em `src/styles/base.css` (fora de @layer para vencer a utility). Reexecutado: 3 passed (no-preference 1440; reduce 1440 e 390), 3 skipped (projetos nao aplicaveis).
- Item 7 (golden Default): RED no Docker `A snapshot doesn't exist` x3; baselines geradas com `--update-snapshots=changed` e revisadas visualmente (barra 240x24 raio 8, surface-card/raised sobre ink; derivado, sem frame Figma); reexecucao seguinte 3 passed.
- Lacuna aceita: duracao/curva do shimmer derivadas (ADR-12).
