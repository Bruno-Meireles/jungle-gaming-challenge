# Internacionalização e qualidade de código (app web)

Requisitos do usuário para o app (`apps/web`), válidos desde a primeira feature. Complementam `architecture.md` e `testing.md`.

## Internacionalização desde o momento zero
- Idiomas: **pt-BR** e **inglês (en)**. O Figma está em pt-BR; o texto em pt-BR é a fonte de cópia, o inglês é obrigatório.
- **Nenhum texto visível ou acessível hardcoded** em componente do app: rótulos, placeholders, mensagens de erro e de validação, `aria-label`, `alt` que seja cópia, títulos de página (`<title>`), textos de estados vazio/erro/loading e anúncios de `LiveRegion`. Todo texto vem de chave de mensagem.
- Chaves tipadas (o TypeScript falha em chave inexistente) e paridade entre idiomas verificada por teste (mesmo conjunto de chaves, mesmos placeholders de interpolação).
- Cada slice FSD é dono das suas mensagens (`config/locales/<idioma>`); mensagens compartilhadas ficam em `shared`. A camada `app` registra os recursos e o idioma ativo.
- Plurais, datas, números e moeda via `Intl`/API do i18n, nunca concatenação de strings. **ETH continua string decimal**: formatação por idioma só troca separadores por manipulação de string testada, nunca passa por `Number`.
- A API devolve **códigos** de erro e de validação; a UI os traduz (o mock não contém texto de interface). Conteúdo editorial do catálogo (título, descrição) é dado, não mensagem de interface.
- Idioma ativo: preferência `jg:locale` já persistida, depois `navigator.languages`, depois pt-BR; atualiza `<html lang>`. Não há seletor manual de idioma na interface.
- O **design system não tem texto de interface embutido**: todo rótulo é prop (sem default em idioma específico). O app passa o texto traduzido e os valores já formatados; o DS não usa `Intl` nem lib de i18n (ADR-14).
- Lint no app contra literais de texto em JSX (ex.: `eslint-plugin-i18next`/`react/jsx-no-literals`), com exceções explícitas e justificadas.
- Testes: unitários e E2E cobrem os dois idiomas nos fluxos principais (troca de idioma, validação, recibo); Playwright define o `locale` do contexto.

## Boas práticas de código e componentização
- **Componentes pequenos e compostos**: `pages` só compõem; `widgets`/`features` orquestram; componentes de `ui` são apresentacionais. Sem regra de negócio nem chamada de API no JSX; lógica em hooks/casos de uso no `model`, regras puras no domínio.
- **Composição sobre configuração**: prefira `children`/slots e componentes compostos a listas longas de props booleanas; use variantes (`cva`) e `asChild` onde o design system já oferece.
- Um componente por arquivo, nome do arquivo igual ao do componente; props tipadas e exportadas como `<Nome>Props`; sem `any`, sem `as` para silenciar o compilador; uniões discriminadas para estados (`loading | error | success`) com verificação de exaustividade.
- **Reuso antes de criar**: procure no design system e nos slices antes de escrever componente novo; duplicação de UI ou de constante vira componente/módulo compartilhado na camada correta.
- Limites mensuráveis no lint (complexidade ciclomática, linhas por função/arquivo, profundidade de aninhamento) com valores definidos no plano da feature; efeitos com limpeza; `memo`/`useMemo` só com medição.
- Fronteiras de erro e de carregamento por rota/região; acessibilidade por padrão (labels, foco, teclado) e testada.
- Nomes em inglês no código; textos de interface só via i18n; comentários explicam o porquê, não o quê.
- Formatação automática (Prettier) e lint sem avisos no `verify`; nenhuma dependência nova sem decisão registrada em `ARCHITECTURE.md`.
