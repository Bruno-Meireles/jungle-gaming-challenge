# Lacunas de negócio das telas Mobile do Figma

Fonte: textos extraídos de `docs/figma/file.json` dos 6 frames "Mobile / …" (Início `14:5226`, Detalhes `15:5536`, Carrinho `16:360`, Pagamento `16:748`, Login `16:1022`, Cadastro `16:1228`), comparados com os contratos (`shared/api/contracts/*`), os mocks (`apps/web/src/mocks/*`) e os textos i18n do app (leitura em 2026-10-23, base `feat/visual-review` `4cf7a48`). Só dados e textos de negócio; tipografia, tamanhos e botões são da apresentação.

Legenda: **Tem** = contrato e mock já trazem o dado; **Parcial** = existe, mas com valor/forma diferente do Figma; **Falta** = não existe no contrato ou no mock.

## Início (`14:5226`)

| Figma | Situação | Observação |
| --- | --- | --- |
| "Explorar coleções", "Bem-vindo à Kurio", "SEJA DONO DA CULTURA DIGITAL", "Descubra NFTs selecionados…", "EXPLORAR" | Tem (texto i18n) | Texto de interface, não depende de contrato. |
| Abas "Todos os NFTs / Novos lançamentos / Em alta" | Tem | Critério corrigido em `406c4ad` (abas ordenam, não filtram). |
| Cards: "Emerald Ape #042 – 1.19 ETH", "Sage Nomad #009 – 1.69 ETH", selo "RARO" | Tem | `title`, `priceEth`, `rarity` em `NftSummaryDto`; o fixture do Emerald Ape usa 1.19 ETH (edição 1/50) e o do Sage Nomad, 1.69. Conferir se a ordem mostrada no Figma (Emerald, Sage…) bate com o padrão `recent`: hoje o 1º item é o mais recente do fixture. |

## Detalhes do NFT (`15:5536`)

| Figma | Situação | Observação |
| --- | --- | --- |
| Reviews "(19)" e nota "4.8" | **Parcial** | `rating { average, count }` existe, mas o mock gera valores pseudo-aleatórios por hash (`3.5 + hash%15/10`, `20 + hash%400`). Para o Emerald Ape o Figma exige **4.8 e 19**: falta override no mock. |
| Descrição "Um colecionável digital 1/50 finalizado à mão da coleção Kurio Editions, verificado na Ethereum." | **Parcial** | `description` é localizado (`pt-BR`/`en`), mas o mock gera um texto genérico ("… é uma obra digital exclusiva da coleção …"). Falta texto editorial por NFT (ao menos para o Emerald Ape) em pt-BR e en. |
| Edição: "1/10", "1/10", "1/50", "ABERTA" | **Parcial** | Edições `1-1`, `1-10`, `1-50`, `open` existem só para o Emerald Ape; as outras NFTs têm só `1-50` e `open`. O Figma mostra duas vezes "1/10" (provável duplicata de design; não há duas edições iguais no contrato) e não mostra "1/1". Decisão de produto: manter as 4 edições do mock ou alinhar o conjunto ao Figma (1/10, 1/50, aberta). O rótulo "ABERTA" vem do tipo `open`. |
| "ID do token: #0042" | Tem | `tokenId`; o mock deriva de `#042` → `#0042`. |
| "Coleção: Kurio Apes" | **Falta** | Contrato só tem `collectionId` (enum de 9 categorias, ex.: `digital-art` → "Arte digital"). "Kurio Apes" é um nome de coleção/série, não uma categoria: falta um campo de nome de coleção (ex.: `collectionName` localizado) ou uma lista `collections` com nome e slug. |
| "Atributos: Óculos, Esmeralda, Raro" | **Falta** | `attributes` existe (`name`/`value` localizados), mas o mock devolve Coleção, Rede e Raridade (metadados do catálogo), não traços como Óculos/Esmeralda. Faltam traços por NFT (pelo menos para o Emerald Ape); "Raro" já é derivável de `rarity`. |
| "Qtd. 1", "1.19 ETH", "Comprar NFT" | Tem | Preço por edição (`editions[].priceEth`), quantidade e `maxPerOrder` no contrato. |

## Carrinho (`16:360`)

| Figma | Situação | Observação |
| --- | --- | --- |
| Linhas: Emerald Ape 1/50 1.19 (qtd 1), Violet Nomad 1/1 1.39 (1), Ivory Baron 1/10 3.58 (2), Golden Beat 1/50 1.98 (2) | **Parcial** | O seed do visitante (`SEEDED_GUEST`) tem 3 linhas, todas na edição `1-50`: Emerald Ape ×1, Violet Nomad ×1, Ivory Baron ×2 (1.79 × 2 = 3.58, bate com o Figma). **Faltam** Golden Beat #207 (1/50, ×2) e as edições 1/1 (Violet Nomad) e 1/10 (Ivory Baron): o mock só cria `1-1`/`1-10` para o Emerald Ape. Além disso, os valores do Figma não fecham: 1.19 + 1.39 + 3.58 + 1.98 = 8.14 (ou 10.12 se 1.98 for unitário com qtd 2), não os 8.92 do subtotal; é preciso decidir a regra (preço unitário × quantidade) antes de ajustar o seed. |
| Cupom: placeholder "Digite o código promocional…", "Aplicar" | Tem | `couponCode`, `POST` de cupom (`applyCouponRequestSchema`) e erros `coupon_invalid`/`coupon_expired`. |
| "Subtotal 8.92 ETH" | Parcial | `subtotalEth` existe, mas o valor do Figma não é a soma das linhas exibidas (ver linha acima). |
| "Desconto do lançamento (-) 00.00" | **Parcial** | `discountEth` existe (cupom → `percent`), mas o rótulo no app é "Desconto"; "do lançamento" sugere uma promoção automática sem cupom. Hoje o desconto é sempre 0 sem cupom e o formato é `(-) 0 ETH`, não `(-) 00.00`. Decisão: texto/rótulo (i18n) e se existe desconto de lançamento além do cupom. |
| "Taxa de rede 0.016 ETH" | Tem | `networkFeeEth` = `0.016` nos mocks. |
| "Taxa estimada" (sem valor ao lado) | **Falta** | Aparece como rótulo/nota sem valor próprio; não há campo "estimado" no contrato (a cotação é firme: `quoteHash`, `expiresAt`). Provável legenda de "Taxa de rede". Decisão: usar só como texto i18n da nota, sem campo novo. |
| "Total 8.936 ETH" | Tem | `totalEth` = subtotal − desconto + taxa (8.92 + 0.016 = 8.936 no Figma, consistente com o subtotal dele). |
| "Conectar e finalizar" | Tem (texto) | Ação de UI. |

## Pagamento (`16:748`)

| Figma | Situação | Observação |
| --- | --- | --- |
| "Carteira conectada", "Trocar carteira" | Tem (texto) | `wallet-connect` i18n; conexão via `POST /api/wallet/connect` (`connectionId`, `provider`). |
| "Reserva — nova.kurio.eth / Rede Polygon"; "Principal — 0xA91F…E82C / Rede principal Ethereum" | **Parcial** | `Wallet` tem `kind` (`primary`/`secondary`), `network`, `address`. Faltam: **nome ENS** (`nova.kurio.eth`) como campo da carteira (hoje só em `collector.ensName` do pedido) e os valores do seed: Ana tem só uma carteira principal (`0x71c7…976f`, Ethereum), sem a "reserva" Polygon; o endereço `0xA91F…E82C` do Figma não existe. |
| "Carteira e rede": WalletConnect, MetaMask, Coinbase Wallet | **Falta** | O mock de conexão devolve sempre `provider: 'MockWallet'`; não há lista de provedores. Falta: lista de provedores (id/nome) e, se a escolha deve contar, aceitar `provider` em `POST /api/wallet/connect` (o `walletProvider` já viaja no pedido). |
| "Total: 8.936 ETH", "Confirmar compra" | Tem | `totalEth` e criação de pedido com `Idempotency-Key`. |

## Login (`16:1022`) e Cadastro (`16:1228`)

| Figma | Situação | Observação |
| --- | --- | --- |
| E-mail, senha, "Esqueceu a senha?", "Entrar", "Ou continue com", Google/Facebook, "Novo na Kurio? Crie uma conta" | Tem / fora de escopo | Login/cadastro existem (`auth.ts`); "Esqueceu a senha?" e os logins sociais não têm endpoint e levam a `/unavailable?feature=…` (decisão já registrada). |
| Cadastro: "Nome de usuário", e-mail, "Senha", "Confirmar senha", "Criar perfil", "Já tem uma conta? Entre" | Tem | `usernameSchema`, `emailSchema`, `passwordSchema` no contrato; "Confirmar senha" é validação do cliente. |

## Resumo do que falta no contrato/mocks

1. **Nome da coleção** ("Kurio Apes", "Kurio Editions"): novo campo localizável (ex.: `collectionName`) em `NftDetailDto`; hoje só há o enum de categoria.
2. **Atributos/traços por NFT** (Óculos, Esmeralda, Raro): mock hoje devolve metadados de catálogo, não traços.
3. **Dados exatos do Emerald Ape**: rating 4.8/19 e descrição editorial (pt-BR/en) em vez de valores gerados.
4. **Edições do Figma**: decidir 1/10 + 1/50 + aberta (e 1/1 para Violet Nomad no carrinho) vs. o conjunto atual do mock.
5. **Carteira com ENS e a "reserva" Polygon** no seed da Ana, e endereço `0xA91F…E82C`.
6. **Provedores de carteira** (WalletConnect, MetaMask, Coinbase Wallet) no mock de conexão.
7. **Rótulos de resumo** ("Desconto do lançamento", "Taxa estimada"): decisão de texto/i18n; contrato já tem `discountEth` e `networkFeeEth`.

Nada disso foi alterado no código; ajustes de mocks/contratos dependem da decisão do Claude sobre os itens 1, 2, 4 e 7.
