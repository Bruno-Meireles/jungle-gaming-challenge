---
name: plan-execution-review
description: Revisa uma feature executada contra o plano, o enunciado, a arquitetura e o Figma. Uso manual — /plan-execution-review <feature>.
disable-model-invocation: true
---

# Plan execution review

Entrada: feature executada, com `.AI/plans/<feature>.md` contendo a seção Execução. Revisão somente leitura (rode comandos, não edite código); correções voltam por `/plan-execute`. Padrões: `.AI/standards/`.

Evidência do plano é alegação: **reexecute** e compare. Todo achado cita `arquivo:linha` ou saída de comando.

1. **Verificações automáticas.** Rode typecheck, lint, a suíte da feature e, para telas, Playwright em 1440, 768 e 390 mais regressão visual. Feito quando cada comando tem saída real colada e a seção Execução bate com ela.
2. **Aceite.** Para cada critério de **Aceite**, aponte o teste que o prova e execute-o. Critério sem teste ou teste que passa por asserção vazia é falha.
3. **TDD.** Cada teste tem RED anterior ao GREEN na seção Execução e nenhum teste foi enfraquecido. Procure `.only`, `.skip`, `test.fixme`, `waitForTimeout` e snapshots atualizados sem justificativa. Ausência de evidência é falha.
4. **Arquitetura (architect, Opus).** Despache `architect` em modo REVISÃO (Agent com `subagent_type: architect`) com plano, diff e resultados dos passos 1 a 3. Feito quando ele devolve **APROVADO** ou **VIOLAÇÕES** com `arquivo:linha`; sem veredito a revisão não termina. Reporte-o sem reescrever.
5. **Enunciado.** Confira os pontos aplicáveis de `prompt.md`: ETH como string decimal, respostas simuladas só em MSW, eventos via `socket.io-client`, chave de idempotência, limpeza de cache e subscriptions no logout, estados loading/vazio/erro, skeleton com shimmer e `prefers-reduced-motion`, acessibilidade (teclado, foco, labels), ausência de overflow horizontal.
6. **Figma.** Para telas, confira as medidas de `docs/figma/file.json` contra o CSS computado (testes de medida e resultados das verificações); **não abra PNGs** (`docs/figma/screens` nem capturas) salvo pedido do usuário, ver `.AI/standards/testing.md`; liste cada desvio (elemento, esperado, observado). Medida sem fonte no Figma é lacuna, não aprovação.

Relate por severidade (bloqueante, importante, menor), cada achado com o passo que o gerou. Feito quando os seis passos têm veredito explícito (ok ou achado) e os achados de arquitetura vêm do `architect`. Sem bloqueantes, a feature está pronta para o usuário aprovar; com bloqueantes, indique `/plan-execute`.
