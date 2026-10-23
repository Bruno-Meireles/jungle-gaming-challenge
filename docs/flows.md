# Fluxogramas

Diagramas em Mermaid. Rotas e params: `docs/routes.md`. Contratos e eventos finais entram em `ARCHITECTURE.md` conforme cada feature.

## 1. Navegação geral

```mermaid
flowchart TD
  H["/ Início"] -->|título do card| D["/nfts/$nftId Detalhe"]
  H -->|ícone do carrinho| C["/cart Carrinho"]
  H -->|Entrar| L["/login"]
  D -->|Comprar / adicionar| C
  D -->|Favoritar sem sessão| L
  C -->|Continuar explorando| H
  C -->|Conectar e finalizar| G{"Sessão ativa?"}
  G -->|sim| P["/checkout Pagamento"]
  G -->|não| L
  L -->|sucesso| R{"redirect?"}
  R -->|sim| T["destino original"]
  R -->|não| H
  L -->|Criar conta| S["/signup"]
  S -->|sucesso| R
  P -->|Confirmar compra| O["/orders/$orderId Recibo"]
  O -->|fechar| H
  H -->|menu Conta| A["/account/profile · /account/wallets"]
  H -.->|Criadores, Aprenda, rodapé| U["/unavailable"]
  H -.->|rota inexistente| N["404"]
```

## 2. Home: da URL à tela

```mermaid
flowchart TD
  U["URL com search params"] --> V["validateSearch: normaliza, descarta inválidos, aplica defaults"]
  V --> K["queryKey = idioma? + params normalizados"]
  K --> Q{"cache?"}
  Q -->|fresco| R["renderiza"]
  Q -->|ausente| S["skeleton com shimmer"]
  Q -->|stale| B["renderiza + atualização em segundo plano (aria-busy)"]
  S --> F["GET /api/nfts (Axios, signal)"]
  B --> F
  F -->|200 com itens| R
  F -->|200 sem itens| E["estado vazio (limpar filtros)"]
  F -->|4xx/5xx/rede| X["erro com Tentar novamente"]
  X -->|retry| F
  R --> I["usuário muda filtro/ordem/aba/busca"]
  E --> I
  I --> W["navigate(search) e page = 1"]
  W --> V
  F -. "resposta obsoleta cancelada ou descartada" .-> K
```

## 3. Sessão e expiração

```mermaid
sequenceDiagram
  participant U as Usuário
  participant UI as App
  participant API as API (MSW)
  U->>UI: Acessa rota privada
  UI->>API: GET /session
  alt sessão válida
    API-->>UI: 200 sessão
    UI-->>U: renderiza a rota
  else sem sessão ou expirada
    API-->>UI: 401 session_invalid
    UI->>UI: guarda contexto (rota, carrinho, passo)
    UI-->>U: /login?redirect=...
    U->>UI: credenciais
    UI->>API: POST /auth/login
    API-->>UI: 200 sessão
    UI-->>U: volta ao destino e retoma o contexto
  end
  U->>UI: Logout
  UI->>UI: limpa cache privado e subscriptions
  UI->>API: POST /auth/logout
```

## 4. Pedido: máquina de estados e idempotência

```mermaid
stateDiagram-v2
  [*] --> Revisao
  Revisao --> Revalidando: Confirmar compra
  Revalidando --> Revisao: cotação mudou (exige nova confirmação)
  Revalidando --> Enviando: cotação igual
  Enviando --> Pendente: pedido criado (chave de idempotência)
  Enviando --> Pendente: timeout (recupera o MESMO pedido pela chave)
  Pendente --> Confirmado: order.updated confirmado / REST
  Pendente --> Recusado: order.updated recusado / REST
  Confirmado --> [*]: recibo = snapshot; remove do carrinho só o comprado
  Recusado --> Revisao: itens preservados
```

Clique repetido reutiliza a mesma chave (não cria outro pedido); a mesma chave com conteúdo diferente devolve conflito. Estados `Confirmado` e `Recusado` são terminais.

## 5. Tempo real e reconciliação

```mermaid
sequenceDiagram
  participant S as Socket (socket.io-client)
  participant H as Handler
  participant Q as Cache (Query)
  participant API as REST
  S->>H: nft.updated {id, recurso, versão}
  H->>H: versão <= conhecida? ignora (duplicata/antigo)
  H->>Q: aplica e invalida o recurso
  Q-->>H: carrinho/checkout informam a mudança (LiveRegion)
  Note over S,API: queda de conexão
  S->>H: reconexão
  H->>API: refetch dos recursos ativos
  API-->>Q: estado atual (vence eventos antigos)
  Note over H: logout/troca de usuário descarta eventos e libera listeners
```

## 6. i18n no bootstrap

```mermaid
flowchart LR
  A["start do app"] --> B{"jg:locale salvo?"}
  B -->|sim| D["usa o salvo"]
  B -->|não| C{"navigator.languages suportado?"}
  C -->|sim| D
  C -->|não| E["pt-BR"]
  D --> F["carrega recursos do idioma"]
  E --> F
  F --> G["define html lang e title"]
  G --> H["renderiza no idioma resolvido"]
```
