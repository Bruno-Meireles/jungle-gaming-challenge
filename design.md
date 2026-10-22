# design.md — Planejamento técnico do app (Kurio, Marketplace de NFTs)

Status: **proposta para aprovação**. Nenhuma tela foi implementada. Fontes: `prompt.md` (enunciado, fonte da verdade), `docs/figma/` (`frames.json`, `screens/*.png`, `file.json`), `docs/design-tokens.md`, `.AI/standards/`, `.AI/plans/design-system.md` e o pacote `@jg/design-system` já entregue.

**Fica para a próxima etapa (de propósito):** o fluxograma de navegação/fluxos e o mapeamento detalhado de rotas (paths, search params, guards, loaders, por tela). A seção 9 só lista o que essa etapa deve produzir.

Convenção: itens marcados **[decidir]** exigem aprovação do usuário antes de entrar em plano; **[lacuna]** é informação ausente no Figma/enunciado, não presumida.

---

## 1. Objetivo e restrições herdadas

Entregar o marketplace descrito no enunciado (descoberta, compra e conta do colecionador; desktop e mobile) com a stack obrigatória: React, TypeScript, TanStack Router, TanStack Query, Axios, Socket.IO, Tailwind, shadcn/ui, MSW, Playwright e Lighthouse. As regras de processo do projeto valem para cada etapa: TDD (RED antes de GREEN), Clean Architecture + FSD, fluxo `architect → test-writer → code-writer`, telas validadas com Playwright CLI.

Requisitos adicionais do usuário para o app web (valem desde a primeira feature; padrão em `.AI/standards/i18n-quality.md`): **(a) melhores práticas de código e componentização** e **(b) internacionalização (pt-BR e inglês) desde o momento zero, sem textos hardcoded**. Ver §5.1.

Restrições que cruzam módulos (enunciado §3–§7): ETH como string decimal, quantidades inteiras; mocks só na camada MSW; eventos Socket.IO passam pelo `socket.io-client` e são idempotentes e versionados; pedidos com chave de idempotência; logout limpa cache e subscriptions; deploy público com mocks ativos no build.

## 2. Inventário de telas (o que o Figma realmente mostra)

Arquivo de referência: `docs/figma/frames.json` (15 frames: 9 desktop 1440 px, 6 mobile 414 px). O enunciado pede validar em **390, 768 e 1440**; não há frame de tablet nem de 390 (**[lacuna]**: 414 → 390 e o tablet são derivados, como já registrado na ADR-12 do design system).

| Tela | Desktop | Mobile | Observações lidas dos PNGs |
|---|---|---|---|
| Início | `2:2` | `14:5226` | Desktop: hero com CTA "Explorar", sidebar (Coleções com contagem, Faixa de preço com slider + Aplicar, Rede), abas "Todos os NFTs / Novos lançamentos / Em alta", "Ordenar por", grade 3 colunas, paginação, banners, "Diário da Cunhagem", rodapé. Mobile: busca + botão de filtros, hero compacto, abas, grade em duas colunas deslocadas, selo "RARO", botão de favoritar no card, barra de navegação inferior |
| Detalhes do NFT | `10:244` | `15:5536` | Desktop: breadcrumb, galeria (4 miniaturas + imagem), título, preço, avaliação, "Edição" (chips), quantidade, COMPRAR/Favoritar, metadados, abas "Detalhes / Avaliações (19)", "Mais desta coleção". Mobile: topo com voltar e favorito, imagem, avaliação 4,8 (19), chips de edição, rodapé fixo com quantidade, preço, "Comprar NFT" e botão de carrinho |
| Carrinho | `11:1278` | `16:360` | Tabela NFT/Preço/Edições/Total com remover, "Resumo da carteira" (código promocional, subtotal, desconto, taxa de rede, total), "Conectar e finalizar", "Continuar explorando", "Colecionadores também viram" |
| Pagamento | `11:2862` | `16:748` | Desktop: formulário (nome de exibição, usuário, rede, endereço da carteira, tipo, e-mail, ENS, indicação, observação) + resumo "Seus NFTs" + "Carteira e rede" (rádios) + "Confirmar compra". Mobile: "Pagamento com carteira", carteiras cadastradas (Reserva/Principal) com rádio, "Carteira e rede" (WalletConnect/MetaMask/Coinbase), total, "Confirmar compra" |
| Confirmação | `11:4385` (modal) | **sem frame** | Modal central: ID da transação, data, total, carteira, itens com (x quantidade), taxa, total, "Ver no Etherscan" |
| Login | `9:115` (modal sobre o Início, abas Entrar / Criar conta) | `16:1022` (página) | E-mail, senha com olho, "Esqueceu a senha?", Google e Facebook |
| Cadastro | `9:1022` (modal) | `16:1228` (página) | Mobile: nome de usuário, e-mail, senha, confirmar senha, "Criar perfil", Google/Facebook, "Já tem uma conta? Entre". Mesmo padrão do login |
| Perfil | `9:1238` | **sem frame** | Sidebar "Meu perfil", formulário, avatar (Alterar/Remover), "Alterar senha" (3 campos), Salvar |
| Carteiras | `9:1670` | **sem frame** | Mesma sidebar; "Carteira principal" (+ Adicionar) e "Carteira secundária" ("Igual à carteira principal") |

Elementos compartilhados: cabeçalho (logo KURIO, navegação Início/Mercado/Criadores/Aprenda, busca, carrinho com contador, "Entrar"), rodapé (3 pilares, newsletter, contatos, links) e, no mobile, barra inferior.

### Inconsistências do Figma a registrar como desvios (não replicar)
- Desktop e mobile usam conjuntos de dados diferentes (desktop: 3 itens, subtotal 26,83 e total 26,846 ETH; mobile: 4 itens, subtotal 8,92 e total 8,936 ETH), cada um coerente em si: dados ilustrativos, o app sempre calcula do carrinho.
- No carrinho mobile (`16:360`) o botão de remover aparece sobreposto ao "+" do terceiro item e não existe nos demais: defeito do Figma; o app dá a cada item uma ação de remover própria e acessível.
- IDs de token divergentes entre telas (`#0009` vs `#0314` para o mesmo item); chips "1/10" repetidos no mobile; nav "Mercado" ativa em detalhe/carrinho/pagamento e "Início" em perfil.
- Login/Cadastro desktop são modais com a página Início ao fundo; no mobile são páginas. A rota precisa funcionar nos dois casos (**[decidir]** na etapa de rotas: rota própria renderizada como modal sobre o Início no desktop vs. modal sem rota).
- O frame de confirmação desktop é só o modal; recibo mobile e página dedicada (acesso direto/refresh) são derivados.
- Itens do menu fora do escopo (Atividade, Ofertas, Arquivos baixados, Suporte, "Criadores", "Aprenda", rodapé, redes sociais, "Esqueceu a senha?", Google/Facebook): devem ter comportamento coerente e **não aparentar sucesso** (enunciado §3).
- Estados não desenhados (loading, vazio, erro, disabled, hover): seguem o padrão visual do design system (ADR-12).

## 3. Arquitetura (Clean Architecture + FSD)

Monorepo já criado: `apps/web` (`@jg/web`) e `packages/design-system` (`@jg/design-system`), pnpm + Turborepo. O app só importa o entry público do design system.

Camadas FSD (imports só para baixo; acesso a slices via `index.ts`; slices da mesma camada não se importam):

```
apps/web/src
  app/        providers (Query, Router, Socket), bootstrap do MSW, estilos, tratamento de erro global
  pages/      composição por rota (sem regra de negócio)
  widgets/    header, footer, bottom-nav, catalog (grade+toolbar), filter-panel, cart-summary, order-summary, order-receipt, profile-sidebar
  features/   auth, catalog-search, favorites, cart-edit, coupon, checkout, wallet-manage, profile-edit, realtime-sync
  entities/   nft, cart, order, wallet, user/session   (tipos de domínio, cálculo, queryKey factories, adaptadores)
  shared/     api (Axios), realtime (socket.io-client), lib (decimal ETH, idempotência, datas), config, ui (apenas o que não é do DS)
```

Segmentos por slice: `ui`, `model` (hooks, casos de uso, estado), `api` (adaptadores REST/Socket), `lib`, `config`.

Regras de Clean Architecture aplicadas:
- **Domínio** (cálculo de subtotal/desconto/taxa/total, regras de quantidade e disponibilidade, máquina de estados do pedido, comparação de versão de evento) em TypeScript puro, sem React/Axios/TanStack/MSW/Socket.IO; testável sem DOM.
- **Casos de uso** dependem de portas; Axios e Socket.IO são adaptadores na borda (`api`). DTO é convertido para tipo de domínio no adaptador; a UI não vê DTO.
- Validação na borda (resposta da API, evento de socket, formulário) com schema; depois dela os tipos internos são confiáveis.
- **Guardas por lint**: já existem regras no ESLint raiz para o DS (sem libs de dados, primitives não importam patterns) e para o app (sem deep import em `@jg/design-system/src|dist`); a etapa de implementação adiciona as regras de camada FSD do app (`boundaries` ou `no-restricted-imports`) antes do primeiro slice.

Regra de ouro de reuso: componente genérico e sem regra de negócio vai para o design system; componente com dados, regra ou acesso a API fica no app (widget/feature).

## 4. Reuso do design system existente

`@jg/design-system` já exporta (68 arquivos de teste, 727 testes, golden em 3 viewports): Alert, Avatar, Badge, Breadcrumb, Button, Checkbox, ChipGroup, Dialog, FormField, Input, Label, LiveRegion, NftCard/NftCardSkeleton, Pagination, PasswordInput, QuantityStepper, RadioGroup, RangeSlider, Rating, Select, Separator, Sheet, Skeleton, Tabs, Textarea, VisuallyHidden, mais tokens, fontes locais e foco global.

| Necessidade do app | Componente do DS | Observação |
|---|---|---|
| Cards do catálogo, "Mais desta coleção", skeleton do catálogo | `NftCard`, `NftCardSkeleton`, `Badge` (RARO), `Rating` | `priceLabel` é string pronta (nunca número); título é link via `asChild` (Router) |
| Filtros (coleções, rede), faixa de preço | `Checkbox`, `RangeSlider`, `Button` | No mobile, filtros dentro de `Sheet` |
| Ordenação | `Select` | |
| Abas "Todos / Novos / Em alta", "Detalhes / Avaliações" | `Tabs` | Variante mobile implementada; desktop sem sublinhado difere (lacuna do DS) |
| Edição do NFT, quantidade | `ChipGroup`, `QuantityStepper` | Disponibilidade por edição desabilita chips |
| Paginação, breadcrumb | `Pagination`, `Breadcrumb` | Sem janela/reticências no DS: o app decide a lista de páginas |
| Login, cadastro, perfil, carteiras, pagamento | `FormField`, `Label`, `Input`, `PasswordInput`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Button` | Erros de API entram como `error` do `FormField` |
| Modais (login/cadastro, recibo), filtros mobile | `Dialog`, `Sheet` | Foco e retorno de foco já cobertos |
| Feedback de mutations e eventos em tempo real | `Alert`, `LiveRegion` | Anúncios acessíveis para "preço mudou", "pedido confirmado" |
| Avatar do perfil | `Avatar` | Fallback quando sem imagem |
| Carregamento | `Skeleton` (shimmer, respeita `prefers-reduced-motion`) | Dimensões iguais ao conteúdo (sem CLS) |

**Lacunas do DS identificadas** (não implementar sem decisão; o enunciado e a regra do projeto vetam ampliar por suposição):
- Cabeçalho, rodapé, hero, carrossel/pontos, barra inferior mobile, linha de item de carrinho/pedido, painel de resumo: são **widgets do app** (compõem primitives do DS), não componentes do DS. **[decidir]** se algum (ex.: linha de item, pontos de carrossel) sobe para o DS por ser reutilizável.
- Ícones: o DS não exporta ícones (ADR-11: SVGs locais). O app precisa de um conjunto (busca, carrinho, usuário, coração, lixeira, olho, filtro, setas, redes sociais) extraído do Figma. **[decidir]** onde mora (`shared/ui/icons` no app vs. DS).
- Toast/snackbar: não existe; `Alert` + `LiveRegion` cobrem o requisito de feedback acessível. **[decidir]** se basta.
- Botão social (Google/Facebook), tabela de itens e divisor "Ou continue com": compor com `Button`/`Separator` no widget.

## 5. Stack e decisões técnicas

| Tema | Proposta | Estado |
|---|---|---|
| Build/dev | Vite 8 + React 19 + TS (já no `apps/web`); `index.html`, `main.tsx` e `App.tsx` mínimos já existem; `build` = `tsc -b && vite build` | confirmado |
| i18n | `i18next` + `react-i18next`: chaves tipadas, namespaces por slice, `Intl` para número/data/plural, detecção + persistência do idioma, `<html lang>` dinâmico. Alternativas: `react-intl` (ICU nativo, mais verboso), Lingui (extração/compilação, mais ferramental). Ver §5.1 | **[decidir]** (nova dependência; recomendação acima) |
| Router | TanStack Router com search params validados por schema, guards em `beforeLoad` para rotas privadas, `notFoundComponent` | confirmado pelo enunciado |
| Dados | TanStack Query + Axios (interceptors: sessão, `signal`, normalização de erro); query keys por fábrica incluindo usuário e parâmetros | confirmado |
| Tempo real | `socket.io-client` real; cliente em `shared/realtime`; handlers em `features/realtime-sync` | confirmado |
| Mocks | MSW (REST) + `@mswjs/socket.io-binding` (eventos). **Risco conhecido:** o protótipo não conectou o handshake no navegador. Primeira entrega da etapa de mocks é um **spike** com `socket.io-client` real; se falhar, documentar a limitação e a alternativa em `ARCHITECTURE.md` (decisão com o usuário) | risco aberto |
| Aritmética ETH | Valores como string decimal no transporte; no domínio, inteiro em unidade mínima (`bigint`, 18 casas) com helpers próprios, **sem `number`**. Alternativa: biblioteca decimal. | **[decidir]** (architect + usuário) |
| Formulários/validação | `zod` para schemas na borda (API, socket, formulários); biblioteca de formulário (ex.: react-hook-form) opcional | **[decidir]** (novas dependências) |
| Senhas | Nunca em claro: o mock guarda hash (Web Crypto) e o cliente não persiste senha | proposta |
| Estilo | Tailwind 4 via `@jg/design-system/styles.css` (tokens, `--spacing: 1px`, sem paleta padrão) | confirmado |
| Deploy | Vercel (ou Netlify/Cloudflare) com fallback de SPA para acesso direto e refresh; `VITE_ENABLE_MOCKS=true` no build de demonstração | proposta |

## 5.1 Requisitos adicionais: i18n desde o momento zero e qualidade de código

Fonte normativa: `.AI/standards/i18n-quality.md` (agentes e skills a leem antes de agir).

### Internacionalização (pt-BR e inglês)
- **Nenhum texto hardcoded no app**: rótulos, placeholders, validação, `aria-label`, `<title>`, estados vazio/erro/loading e anúncios do `LiveRegion` vêm de chaves. O lint do app reprova literais de texto em JSX (`eslint-plugin-i18next` ou equivalente) e o TypeScript reprova chave inexistente.
- **Propriedade das mensagens por slice** (`config/locales/pt-BR` e `en` em cada slice; compartilhadas em `shared`); `app` registra os recursos e o idioma. Teste de paridade garante as mesmas chaves e placeholders nos dois idiomas.
- **API devolve códigos** (erro e `fieldErrors`), a UI traduz; o mock MSW não tem texto de interface. Conteúdo do catálogo (título, descrição) é dado do mock; **[decidir]** se é localizado pelo servidor via `Accept-Language` ou único (pt-BR) por ser conteúdo editorial.
- **Formatação**: `Intl` para datas, plurais e números comuns. **ETH segue string decimal**: a formatação por idioma (`1.19` vs `1,19`) troca só o separador por manipulação de string testada, sem `Number`.
- **Idioma ativo**: escolha persistida, depois `navigator.language`, depois pt-BR (cópia do Figma); atualiza `<html lang>`; seletor de idioma acessível no cabeçalho/rodapé. **[decidir]** na etapa de rotas: idioma só em estado (recomendado, sem duplicar rotas) ou prefixo na URL (`/en/...`).
- **Testes**: unitários e E2E nos dois idiomas nos fluxos principais; Playwright define `locale` do contexto; baselines visuais por idioma onde o texto altera o layout (a regressão visual de início, detalhe, carrinho e pagamento passa a ter variante en).
- **Lighthouse/SEO**: `lang` correto e `<title>` traduzido por rota.

### Design system sem texto embutido
Hoje o DS tem defaults em pt-BR que violam o requisito para quem usa em inglês (levantamento por grep nesta etapa):

| Componente | Texto embutido |
|---|---|
| `Alert` | rótulos "Erro", "Informação", "Sucesso" (sem prop) |
| `Breadcrumb` | `aria-label="Trilha"` |
| `Pagination` | `aria-label="Paginação"` e "Próxima" |
| `DialogClose` | default "Fechar" |
| `PasswordInput` | defaults "Mostrar senha" / "Ocultar senha" |
| `QuantityStepper` | defaults "Diminuir" / "Aumentar" |

Decisão proposta: **todo rótulo vira prop obrigatória (sem default em idioma específico)** e o app passa o texto traduzido; stories e testes do DS passam a fornecer os textos explicitamente. É mudança de contrato do DS (`.AI/plans/design-system.md` §3) e exige novo plano (`/plan-create design-system-i18n`) antes da primeira tela; a guarda automática é um teste que falha se `src/` do DS contiver texto de interface literal fora de stories/testes.

### Boas práticas de código e componentização
- `pages` só compõem; `widgets`/`features` orquestram; `ui` é apresentacional; lógica em `model` (hooks/casos de uso) e regras puras no domínio, sem regra de negócio nem chamada de API no JSX.
- Composição sobre props booleanas (slots, `children`, `asChild`, variantes `cva`), um componente por arquivo, props exportadas como `<Nome>Props`, uniões discriminadas para estados com verificação de exaustividade, sem `any` nem `as` para silenciar o compilador.
- **Reuso antes de criar**: checar o DS e os slices antes de escrever componente; duplicação sobe para a camada correta.
- Limites mensuráveis no lint (complexidade, linhas por função e por arquivo, aninhamento) com valores fixados no plano de F0; fronteiras de erro e de carregamento por rota; `memo` só com medição.
- Prettier e lint sem avisos fazem parte do `verify`; dependência nova só com decisão em `ARCHITECTURE.md`.

## 6. Domínio e contratos (nível de planejamento)

Entidades: `Nft` (id, título, coleção, rede, edições com disponibilidade, `price` string ETH, versão, imagens, avaliação), `Cart` (itens `nftId + editionId + quantity`, cupom, cotação), `Quote` (subtotal, desconto, taxa de rede, total, validade/versão), `Order` (estado `pending | confirmed | rejected`, snapshot imutável, `idempotencyKey`, `txRef` simulada), `Wallet` (principal/secundária, rede, endereço), `User/Session`.

Recursos REST mínimos (enunciado §5): sessão e conta; NFTs (listagem com busca/filtros/ordenação/paginação e detalhe); favoritos; carrinho; cotação (cupom, disponibilidade, descontos, taxas, total); pedidos (criação idempotente e consulta); perfil (dados, avatar, senha); carteiras. Modelo de erro único com `code`, mensagem e `fieldErrors`, cobrindo validação, sessão inválida, permissão, inexistente, conflito de disponibilidade e falha transitória. A tabela de endpoints e payloads é entregável da etapa de contratos e vai para `ARCHITECTURE.md`.

Eventos: `nft.updated` e `order.updated`, com id estável, recurso, versão e escopo de usuário.

## 7. Estado, cache e tempo real (diretrizes)

- **URL como fonte** de busca, filtros, ordenação e página; mudança de filtro reinicia a página; histórico e refresh restauram.
- **Query**: `signal` repassado ao Axios; chaves isoladas por usuário e parâmetros; invalidação após mutation e após evento; política de `staleTime`, `retry` (sem retry em 4xx) e refetch documentada.
- **Atualização otimista** em favoritos (rollback na falha); o carrinho segue o servidor.
- **Carrinho**: persistente após refresh; itens do visitante preservados ao autenticar (merge); mudança de preço/disponibilidade recebida enquanto aberto informa o usuário e atualiza o resumo.
- **Checkout**: revalida cotação antes de confirmar; mudança exige nova confirmação; chave de idempotência por tentativa; duplo clique não duplica; timeout recupera o mesmo pedido; só confirmado mostra recibo; após confirmação remove do carrinho apenas o comprado.
- **Sessão**: recuperável após refresh; expiração durante navegação/checkout preserva o contexto para retomada; logout/troca de usuário limpa cache privado e subscriptions.
- **Realtime**: ignora duplicata e versão antiga; reconcilia via REST após reconexão; não aplica evento de sessão anterior; libera listeners no cleanup.

## 8. Mocks, testes e auditoria

**MSW**: cenários configuráveis e reproduzíveis (sucesso, vazio, latência variável/fora de ordem, falha de conexão, 4xx/5xx, sessão expirada, conflito de cadastro, cupom inválido/expirado, preço alterado/esgotado na compra, timeout após criar pedido, pagamento confirmado/recusado), ao menos dois usuários, fixtures variadas, estado consistente entre recursos, persistência local e **reset** para cenário conhecido, ativação por variável de ambiente e disponível no build de demonstração.

**Testes** (Playwright, Chromium, desktop e mobile): os 12 fluxos do enunciado §9 (busca/filtros/paginação, detalhe e 404, conta e sessão, favoritos com falha, carrinho/cupom, compra completa, falha/duplo clique/timeout, perfil/carteiras, realtime no checkout, eventos duplicados/antigos e retomada, teclado/foco/validação, skeleton e recuperação). Regressão visual de início, detalhe, carrinho e pagamento com baselines versionadas (mesma política Linux/Docker do design system). Cada teste parte de estado isolado e controla relógio, latência e disparo de eventos. Relatório HTML e traces.

**TDD por feature**: `/plan-create <feature>` (architect) → `/plan-execute <feature>` (test-writer RED, code-writer GREEN, E2E Playwright) → `/plan-execution-review <feature>`.

**Lighthouse**: início e detalhe, mobile e desktop, 3 medições (mediana), metas Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90; configuração versionada, LCP/CLS/TBT registrados.

## 9. Próxima etapa

Produzidos depois desta proposta: `docs/discovery.md` (matriz requisito→feature, validação do protótipo, recorte da Home), `docs/flows.md` (fluxogramas) e `docs/routes.md` (mapa de rotas). O texto abaixo permanece como lista do que cada etapa deve cobrir.

1. **Fluxograma** dos fluxos: descoberta → detalhe → carrinho → login/retorno → pagamento → confirmação; recuperação de sessão, pedido pendente/reconexão e cenários de falha.
2. **Mapeamento detalhado de rotas**: path, search params e schema, guard (público/privado), loader/prefetch, tela(s) do Figma, estados (loading/vazio/erro), modal vs. página (login/cadastro/recibo), 404 e redirecionamentos de retorno.
3. Tabela de endpoints e payloads (`ARCHITECTURE.md`).
4. Resolver os itens **[decidir]** desta página, incluindo os de i18n (biblioteca, conteúdo do catálogo localizado ou não, idioma em estado ou na URL).
5. Abrir `/plan-create design-system-i18n` (F0a) antes da primeira tela.

## 10. Roadmap sugerido de features (cada uma passa por plan-create/execute/review)

| # | Feature | Entrega principal | Depende de |
|---|---|---|---|
| F0a | `design-system-i18n` | DS sem texto de interface embutido (rótulos como props), guarda por teste, stories/testes atualizados, baselines regeneradas | DS |
| F0b | `app-shell` | providers (Query, Router, **i18n**), router base, regras FSD **e de qualidade/i18n** no lint, seletor de idioma, deploy preview | F0a |
| F1 | `mock-platform` | MSW REST (erros por código, sem texto de UI), cenários, persistência/reset, **spike do Socket.IO** | F0b |
| F2 | `shared-api` + `session-auth` | Axios, erro padrão, login/cadastro/logout/expiração, guards | F1 |
| F3 | `catalog` | Início: busca, filtros, ordenação, paginação na URL, skeleton | F2 |
| F4 | `nft-detail` + `favorites` | Detalhe, galeria, edição, quantidade, favorito otimista | F3 |
| F5 | `cart` | Carrinho, cupom, resumo, merge de visitante | F4 |
| F6 | `checkout` + `orders` | Pagamento, carteira/rede, idempotência, recibo | F5 |
| F7 | `realtime` | `nft.updated`/`order.updated`, reconciliação, retomada | F1, F5, F6 |
| F8 | `profile` + `wallets` | Perfil, avatar, senha, carteiras (mobile derivado) | F2 |
| F9 | `quality-gates` | E2E restantes, regressão visual, Lighthouse, README e ARCHITECTURE | todas |

## 11. Riscos

- Handshake do `@mswjs/socket.io-binding` no navegador (F1 spike antes de qualquer feature de tempo real).
- Telas sem frame (confirmação mobile, perfil/carteiras mobile, tablet): derivadas do desktop e do DS; revisar com o usuário.
- Precisão decimal: bug de ponto flutuante em total/taxa é eliminatório por qualidade; cobrir o domínio com testes de propriedade/tabela.
- Performance: imagens de NFT e fontes locais precisam de dimensões fixas e `loading` adequado para LCP/CLS.
- i18n tardio: qualquer texto hardcoded no DS ou nos primeiros slices vira retrabalho; por isso F0a precede as telas e o lint de literais entra em F0b.
- Layout e idioma: textos em inglês e pt-BR têm larguras diferentes; testar 390/768/1440 nos dois idiomas e evitar larguras fixas em rótulos.
- Flakiness de testes em Chromium sob carga: já tratada no DS (ponteiro, setas Radix); manter o padrão nos E2E.
