---
name: plan-execute
description: Executa um plano aprovado com TDD (RED, GREEN) e validação E2E com Playwright. Uso manual — /plan-execute <feature>.
disable-model-invocation: true
---

# Plan execute

Entrada: `.AI/plans/<feature>.md` aprovado, com lista **Testes RED** que contém ao menos um E2E Playwright por tela ou fluxo. Sem plano aprovado ou sem E2E na lista, pare e indique `/plan-create`. Padrões: `.AI/standards/` (grounding, architecture, testing). Playwright roda pelo **CLI** (`pnpm exec playwright test|codegen|show-trace`), nunca pelo MCP.

Seja o **verificador**: relatos de subagentes são alegações; você reexecuta os comandos e só registra o que a sua execução mostrou.

## Ciclo por teste (ordem da lista, um completo antes do próximo)
1. **RED.** Despache `test-writer` (Agent com `subagent_type: test-writer`) com: caminho do plano, **apenas este item**, caminhos de `.AI/standards/`, do Figma quando for tela. Reexecute o teste você mesmo. Feito quando ele falha **por ausência do comportamento** (não por import, typo ou setup); cole a falha. Falha pelo motivo errado ou teste verde de primeira volta ao `test-writer`.
2. **GREEN.** Despache `code-writer` (Agent com `subagent_type: code-writer`) com: plano, item, caminho do teste e a saída vermelha. Reexecute: teste alvo, testes anteriores da feature, typecheck e lint. Feito quando tudo passa; cole comandos e saídas. Confira o diff: nenhum teste alterado, nada fora do slice do plano, sem dependência nova.
3. **Refactor** (opcional, só no verde), repetindo as verificações do passo 2.
4. **Progresso.** Marque o item em **Progresso** do plano com as evidências (RED e GREEN) antes de seguir.

## Validação Playwright (após todos os itens verdes)
5. Rode os E2E com mocks MSW ativos em desktop 1440 e mobile 390 (tablet 768 quando houver layout próprio): estado isolado por teste, relógio/latência/eventos controlados, realtime pelo `socket.io-client` real e REST pelos handlers MSW. Telas com regressão visual têm baseline conferida contra `docs/figma/screens/`. Feito quando todos passam nos viewports e o relatório HTML está sem falhas. Em falha: abra o trace, ache a causa e volte ao ciclo RED/GREEN do teste afetado; aumentar timeout ou relaxar asserção não conta como correção.
6. Fluxo sem E2E verde não está concluído: fluxo só visual é eliminatório no enunciado.

## Paradas
Pare e reporte, sem improvisar, quando: o código exigir mudar contrato, camada ou escopo (volte ao `architect` por `/plan-create`); faltar dependência ou dado do Figma; o mesmo teste falhar três vezes pelo mesmo motivo. Não faça commit, push nem instale dependências sem autorização do usuário.

Feito quando os passos 1 a 6 têm evidência. Grave no plano a seção **Execução** com, por teste, saída RED, saída GREEN e resultado E2E por viewport, mais os desvios do plano. Encerre indicando `/plan-execution-review`.
