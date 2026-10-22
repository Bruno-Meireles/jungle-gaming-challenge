# Arquitetura: Clean Architecture + Feature-Sliced Design

## Camadas FSD (imports só para baixo)
`app > pages > widgets > features > entities > shared`

- Cada slice expõe uma API pública em `index.ts`; imports de fora passam só por ela.
- Slices da mesma camada não se importam. Composição acontece na camada acima.
- Segmentos dentro do slice: `ui`, `model` (estado, hooks, use cases), `api` (adaptadores REST/Socket), `lib`, `config`.
- `app`: providers, router, bootstrap do MSW. `shared`: cliente Axios, UI base, utilitários sem regra de negócio.

## Clean Architecture sobre o FSD
- **Domínio** (regras, tipos, cálculo de carrinho/cotação/pedido) em TypeScript puro: sem React, Axios, TanStack, MSW ou Socket.IO. Testável sem DOM.
- **Casos de uso** dependem de **portas** (interfaces); Axios e Socket.IO são **adaptadores** que as implementam, na borda (`api`).
- Dependências apontam para dentro: UI → model → domínio. O domínio não conhece quem o chama.
- Contratos de transporte (DTO) são convertidos para tipos de domínio no adaptador; a UI não vê DTO.
- Validação de dados externos na borda (resposta da API, evento de socket, formulário); tipos internos são confiáveis depois disso.

## Design system (pacote separado)
Componentes visuais reutilizáveis e tokens (cores, tipografia, espaçamento, raios, de `docs/figma/`) vivem no pacote do design system, adaptando shadcn/ui. O app importa do pacote; o pacote nunca importa do app. Componente com regra de negócio fica no app.

## Qualidade de código e i18n
Ver `i18n-quality.md`: componentização, limites de lint e internacionalização (pt-BR e inglês) valem em todo código do app.

## Estado e dados
- TanStack Query: `queryKey` produzidas por fábrica por recurso, incluindo usuário e parâmetros; invalidação após mutation; `signal` repassado ao Axios para cancelar respostas obsoletas.
- Parâmetros de busca/filtro/ordenação/paginação ficam na URL (TanStack Router com validação do search schema).
- Socket.IO: eventos têm id, recurso e versão; o handler ignora duplicata e versão antiga e reconcilia via REST após reconexão; listeners liberados no cleanup.
- ETH como string decimal em todo o transporte; aritmética em tipo decimal/inteiro (nunca `number`). A escolha da biblioteca é decisão do `architect` com aprovação do usuário.
- Mocks apenas na camada MSW (REST e Socket.IO). Componentes, hooks e cliente Axios não têm resposta fictícia nem caminho alternativo.

## Decisão registrada
Toda decisão duradoura vai para `ARCHITECTURE.md` com: contexto, decisão, alternativa descartada, consequência.
