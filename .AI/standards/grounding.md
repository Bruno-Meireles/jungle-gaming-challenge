# Grounding (anti-alucinação)

Regras de evidência para qualquer agente ou skill deste projeto. Fonte única; os agentes apontam para cá.

## Fontes de verdade, em ordem
1. `prompt.md` (requisitos do projeto e enunciado do desafio).
2. `.AI/plans/<feature>.md` aprovado.
3. `docs/figma/` (medidas, cores, tipografia e PNGs). Valor que não está lá é **lacuna**, não palpite.
4. O código e a saída real de comandos neste repositório.
5. Documentação oficial da versão **instalada** (tipos em `node_modules`, `--help`). Versões e APIs nunca vêm da memória.

## Regras
- Toda afirmação sobre o repositório cita `arquivo:linha` ou o comando que a provou. Sem citação, escreva "não verificado".
- Antes de usar uma API de biblioteca (TanStack Router/Query, MSW, socket.io, Playwright, shadcn/ui), confirme a assinatura nos tipos instalados ou na documentação oficial da versão em uso.
- Lacuna (medida do Figma ausente, requisito ambíguo, contrato indefinido): pare, registre como **Lacuna** com a pergunta exata e devolva ao chamador. Sem preenchimento por suposição.
- Dependência nova, mudança de contrato, de camada ou de escopo: só com aprovação explícita do usuário.
- Resultados são colados da execução real (comando + saída). "Deve passar" não é resultado.
- Três tentativas seguidas falhando pelo mesmo motivo: pare e reporte o que foi tentado e observado.
- Protótipo (`Frontend-Marketplace-de-NFTs-1`) é inspiração: cada item reaproveitado é relido e revalidado aqui, nunca copiado por confiança.
