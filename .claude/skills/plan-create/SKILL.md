---
name: plan-create
description: Planeja uma feature com o agente architect e grava .AI/plans/<feature>.md. Uso manual — /plan-create <feature>.
disable-model-invocation: true
---

# Plan create

Entrada: nome ou descrição da feature. Saída: `.AI/plans/<feature>.md` aprovado pelo usuário. Padrões compartilhados: `.AI/standards/` (grounding, architecture, testing).

1. **Escopo.** Leia `CLAUDE.md`, `.AI/standards/grounding.md` e a seção relevante de `prompt.md`; para telas, `docs/figma/frames.json` e o PNG do frame em `docs/figma/screens/`. Verifique `.AI/plans/` por plano existente da feature (continue-o em vez de duplicar). Feito quando você lista os requisitos do enunciado (§ e trecho) que a feature cobre e os frames do Figma envolvidos.
2. **Arquitetura.** Despache `architect` em modo PLANO (Agent com `subagent_type: architect`). O prompt contém: feature, requisitos citados, caminhos do Figma, dependências já planejadas e o pedido "devolva as sete seções do modo PLANO". O plano é decisão do `architect`: você grava, não redesenha. Feito quando o retorno tem as sete seções.
3. **Lacunas.** Cada item de **Riscos e Lacunas** vira pergunta ao usuário (AskUserQuestion) antes de gravar. Feito quando nenhuma lacuna fica sem resposta ou sem registro explícito como "assumido com aprovação".
4. **Checagem de cobertura.** Confira o plano contra esta lista; cada item recebe teste ou "não se aplica" com motivo:
   - estados de loading (skeleton com shimmer), vazio, erro, sucesso e atualização em segundo plano;
   - desktop 1440, tablet 768 e mobile 390;
   - teclado, foco e labels;
   - cenários MSW do §6 pertinentes e, se houver tempo real, eventos duplicados/antigos e reconexão;
   - ETH como string decimal; isolamento de dados por usuário.

   Feito quando a lista está resolvida; itens sem resposta voltam ao `architect`.
5. **Gravação.** Escreva `.AI/plans/<feature>.md` com: Requisitos cobertos, Slice FSD, Contratos, Aceite, Testes (RED opcional; numerados, com arquivo, tipo e viewport; cada tela/fluxo com E2E Playwright em 1440 e 390), Fora do escopo, Decisões (para `ARCHITECTURE.md`) e uma seção **Progresso** com uma caixa de marcação por teste.
6. **Aprovação.** Mostre o plano e pare. Ajustes pedidos voltam ao `architect` antes de regravar. Feito quando o usuário aprova explicitamente; sem aprovação, `/plan-execute` não inicia.
