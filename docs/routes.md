# Mapa de rotas

Complementa `design.md` e `docs/discovery.md`. Roteamento: TanStack Router, árvore de código (decisão de rotina, `docs/discovery.md` §4), search params validados por schema, guards em `beforeLoad`, `notFoundComponent` e `errorComponent` na raiz. Idioma ativo fica em estado, não na URL. Todos os ids de filtro são **slugs estáveis**; rótulos vêm do i18n.

Legenda de acesso: **P** público; **V** visitante permitido, com ação privada protegida; **A** autenticado (sem sessão: redireciona para `/login?redirect=<destino>`).

## 1. Árvore

```
root  (Layout: header, outlet, footer; bottom-nav no mobile; LiveRegion global)
├─ /                         Início
├─ /nfts/$nftId              Detalhes do NFT
├─ /cart                     Carrinho
├─ /checkout                 Pagamento                 (A)
├─ /orders/$orderId          Confirmação / recibo      (A)
├─ /login                    Login
├─ /signup                   Cadastro
├─ /account                  layout da conta           (A)  → redireciona para /account/profile
│  ├─ /account/profile       Perfil do colecionador
│  └─ /account/wallets       Carteiras
├─ /unavailable              Ação fora do escopo
└─ *                         404
```

## 2. Tabela de rotas

| Rota | Tela (Figma desktop / mobile) | Acesso | Search params (default omitido da URL) | Dados no `beforeLoad`/loader | Estados | Feature |
|---|---|---|---|---|---|---|
| `/` | Início `2:2` / `14:5226` | P | `q`, `tab` (`all`\|`new`\|`trending`, def. `all`), `sort` (`recent`\|`price-asc`\|`price-desc`\|`popular`, def. `recent`), `collections[]`, `networks[]`, `min`, `max` (strings decimais ETH), `page` (inteiro ≥ 1, def. 1) | prefetch do catálogo e das facetas pela chave derivada dos params | loading (skeleton), vazio, erro com nova tentativa, atualização em segundo plano | **Home** |
| `/nfts/$nftId` | Detalhes `10:244` / `15:5536` | P (favoritar e comprar: A na ação) | `edition` (id da edição), `tab` (`details`\|`reviews`) | detalhe por id; id inexistente → `notFound` | loading, 404 do recurso, edição indisponível, limite de quantidade | F4 |
| `/cart` | Carrinho `11:1278` / `16:360` | V (carrinho do visitante persistido; "Conectar e finalizar" exige A) | — | carrinho e cotação | loading, vazio, erro, preço/disponibilidade alterados | F5 |
| `/checkout` | Pagamento `11:2862` / `16:748` | A | — | carrinho, cotação, carteiras do usuário; sem itens → `/cart` | revisão, cotação desatualizada (exige reconfirmar), enviando, recusado | F6 |
| `/orders/$orderId` | Confirmação `11:4385` (modal) / sem frame | A (pedido de outro usuário → 404) | — | pedido por id (recuperável após refresh) | pendente, confirmado, recusado, não encontrado | F6 |
| `/login` | Login `9:115` (modal) / `16:1022` | P (logado → `redirect` ou `/`) | `redirect` (caminho interno validado) | — | validação, credencial inválida, falha de rede | F2 |
| `/signup` | Cadastro `9:1022` (modal) / `16:1228` | P (logado → `/`) | `redirect` | — | validação, conflito de e-mail/usuário | F2 |
| `/account/profile` | Perfil `9:1238` / sem frame | A | — | perfil | loading, validação, erro de senha | F8 |
| `/account/wallets` | Carteiras `9:1670` / sem frame | A | — | carteiras | loading, vazio da secundária, validação | F8 |
| `/unavailable` | — (derivado) | P | `feature` (id da ação) | — | informativo, com link de volta | Home |
| `*` | — (derivado) | P | — | — | 404 com link para `/` | Home |

Regras de URL: params com valor default não aparecem; arrays ordenados para chave de cache estável; params inválidos são descartados (normalização com `replace`, sem quebrar a página); mudança em `q`, `tab`, `collections`, `networks`, `min`, `max` ou `sort` **reinicia** `page` para 1; `page` acima do total vira a última página.

## 3. Modais de autenticação e do recibo

No desktop, login, cadastro e recibo são **modais sobre a página anterior** (Figma `9:115`, `9:1022`, `11:4385`); no mobile, login e cadastro são páginas. A rota existe sempre (acesso direto, refresh e link funcionam). Proposta: no desktop (≥ 768) a rota renderiza o `Dialog` do design system sobre o conteúdo de fundo (Início quando não há histórico); no mobile renderiza a página inteira. O fundo é decorativo (`inert`) e o foco fica preso no diálogo. Fechar volta ao histórico anterior ou a `/`. **[decidir]** na feature F2 se o fundo reaproveita o `location` anterior ou renderiza sempre a Home.

## 4. Guards, retorno e sessão

- `beforeLoad` das rotas **A**: sem sessão → `/login?redirect=<caminho+search>` (somente caminhos internos; valor externo é descartado). Após login, volta ao `redirect`, preservando o contexto.
- Sessão expirada em navegação ou no checkout: a mesma regra, guardando o estado necessário para retomar (carrinho e passo do checkout).
- Logout e troca de usuário: limpa o cache privado do Query e as subscriptions, e volta para `/`.
- 403 do servidor em recurso de outro usuário se comporta como 404.

## 5. Navegação e ações fora do escopo

- Itens do cabeçalho: **Início** e **Mercado** apontam para `/` (o Figma só varia o item ativo); **Criadores** e **Aprenda** são páginas editoriais fora do escopo: levam a `/unavailable?feature=creators|learn`, com mensagem traduzida e link de volta (não simulam sucesso).
- Rodapé, "Diário da Cunhagem/Ler mais", redes sociais, "Atividade/Ofertas/Arquivos baixados/Suporte" e login social: levam a `/unavailable?feature=<id>` ou ficam desabilitados com `aria-disabled` e texto explicativo; nunca parecem funcionais.
- Botão "Entrar" na Home: leva a `/login` (a rota existe desde a Home como destino; até F2 renderiza `/unavailable?feature=auth`).
- Título do card na Home → `/nfts/$nftId`; até F4 mostra `/unavailable?feature=nft-detail` mantendo a rota coerente.

## 6. Home: contrato de URL e API

| Param da URL | Param da API (`GET /api/nfts`) | Observação |
|---|---|---|
| `q` | `search` | busca por nome/coleção |
| `tab` | `view=all\|new\|trending` | `new` = por data de lançamento; `trending` = popularidade |
| `sort` | `sort` | `recent`, `price-asc`, `price-desc`, `popular` |
| `collections[]` | `collections[]` | slugs |
| `networks[]` | `networks[]` | slugs (`ethereum`, `polygon`, `solana`) |
| `min`, `max` | `minPriceEth`, `maxPriceEth` | strings decimais; comparação em inteiro de 18 casas, nunca `number` |
| `page` | `page` (+ `pageSize` fixo) | pageSize fixo mantém a chave de cache estável |

A resposta traz itens, total, total de páginas e **facetas** (contagem por coleção e rede); a contagem do Figma (33, 12, 65…) é dado do mock, não do front. Os contratos completos entram no plano `home`.

## 7. Pendências para as próximas features

- Detalhe, carrinho, checkout, recibo, conta: schemas de search e loaders fecham nos planos de F4–F8.
- Estratégia final de fundo dos modais (§3) e política de `redirect` em F2.
