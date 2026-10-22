# Socket.IO simulado com MSW (`ws.link` + `@mswjs/socket.io-binding`)

Pesquisa de 2026-10-22 (somente leitura de documentação/código publicado; nada foi instalado nem executado). Requisitos: `prompt.md` §6-7 (linhas 170-187).

Legenda: **[FATO]** = afirmado pela fonte citada. **[INFERÊNCIA]** = dedução minha, precisa ser comprovada pelo teste da seção 3. **[NÃO VERIFICADO]** = conhecimento geral, não confirmado nesta sessão.

## 0. Achado mais importante: API do binding depende da versão

- **[FATO]** O README da branch `main` do repo usa `ws.link(url, { protocol: new SocketIo() })` e `import { SocketIo } from '@mswjs/socket.io-binding'`. Seu `package.json` declara peers `@mswjs/interceptors ^0.43.2` e `msw ^2.10.2`. Fonte: https://github.com/mswjs/socket.io-binding (README) e https://raw.githubusercontent.com/mswjs/socket.io-binding/main/package.json
- **[FATO]** `msw@2.15.0` NÃO tem essa opção: `createWebSocketLinkHandler(url)` recebe só `url`; a string "protocol" não aparece em `lib/core/ws.js`; o tipo é `link(url: Path)`. Fontes: https://unpkg.com/msw@2.15.0/lib/core/ws.js e https://unpkg.com/msw@2.15.0/lib/core/ws.d.ts
- **[FATO]** O que está **publicado** no npm como `0.2.0` (2025-06-13, `latest`, peer `msw ^2.10.2`, dep `@mswjs/interceptors ^0.39.2`) usa outra API: `toSocketIo(connection)`. Fontes: https://registry.npmjs.org/@mswjs/socket.io-binding, https://unpkg.com/@mswjs/socket.io-binding@0.2.0/package.json, https://unpkg.com/@mswjs/socket.io-binding@0.2.0/README.md e a página oficial do MSW https://mswjs.io/docs/websocket/bindings
- **[INFERÊNCIA]** A `main` é código não publicado, voltado ao MSW 3 / interceptors 0.43 (MSW 3.0.0 é `latest` no npm, https://registry.npmjs.org/msw; release notes em https://github.com/mswjs/msw/releases). **Com msw 2.15.0 + binding 0.2.0, use `toSocketIo`, nunca `protocol: new SocketIo()`.** Não copie o README da `main`.
- **[FATO]** MSW 3 renomeia o evento de ciclo de vida `connection` para `websocket:connection` e exige Node 22 (release notes acima). Isto não afeta `link.addEventListener('connection')`, mas é motivo para ficar em 2.x neste projeto. (O efeito exato no link é **[NÃO VERIFICADO]**.)

## 1. Receita mínima (msw 2.15.0 + binding 0.2.0)

### 1.1 Handler (camada de mocks)

```ts
// apps/web/src/mocks/realtime/socket-handler.ts
import { ws } from 'msw'            // README publicado 0.2.0 importa de 'msw'; 'msw/ws' também existe nos docs
import { toSocketIo } from '@mswjs/socket.io-binding'

// URL fake e dedicada (não use wildcard amplo: ver 2.6 sobre HMR do Vite)
export const realtime = ws.link('ws://realtime.mock.local/socket.io/')

const sessions = new Set<ReturnType<typeof toSocketIo>>()

export const realtimeHandlers = [
  realtime.addEventListener('connection', (connection) => {
    const io = toSocketIo(connection)
    sessions.add(io)
    connection.client.addEventListener('close', () => sessions.delete(io))

    io.client.on('hello', (_event, username) => {   // listener: (MessageEvent, ...args)
      io.client.emit('greeting', `hi ${username}`)  // servidor -> cliente
    })
  }),
]

// Emissão a partir do domínio de mocks (ex.: quando o estado simulado muda):
export function emitToClients(event: string, payload: unknown) {
  for (const io of sessions) io.client.emit(event, payload)
}
```

Fatos que sustentam o código:
- `ws.link(url)` aceita URL absoluta, relativa, wildcard `wss://*`, params e regex; `addEventListener('connection', ({client, server, params, info}) => ...)`; o listener roda **antes** do `open` do cliente. Fontes: https://mswjs.io/docs/api/ws, https://mswjs.io/docs/basics/handling-websocket-events, https://mswjs.io/docs/websocket/client-events/
- `toSocketIo(connection)` retorna objeto com `client` e `server`; `client.emit(event, ...data)` empacota um EVENT Socket.IO (`nsp: '/'`) dentro de um pacote Engine.IO `message` e envia ao cliente; `client.on(event, listener)` decodifica o que o cliente enviou e chama `listener(messageEvent, ...args)` só para o evento de mesmo nome; `send(...)` é atalho de `emit('message', ...)`. Fonte: https://unpkg.com/@mswjs/socket.io-binding@0.2.0/src/index.ts (resumo do código) e exemplo em https://mswjs.io/docs/websocket/bindings
- `toSocketIo` não inspeciona URL; a detecção é feita pelo `ws.link`. Mesma fonte.
- **[FATO]** Se não houver conexão real (`server.connect()` não chamado), o binding faz o handshake sozinho no construtor, dentro de `queueMicrotask`: envia `0{"sid":"test","upgrades":[],"pingInterval":25000,"pingTimeout":5000}` (Engine.IO open) e `40{"sid":"test"}` (Socket.IO CONNECT no namespace `/`). Fonte: unpkg `src/index.ts` acima.
- **[FATO]** Em conexões mockadas o MSW não abre servidor real: "By default, the intercepted WebSocket connections are not open"; só `server.connect()` abre o real. https://mswjs.io/docs/basics/handling-websocket-events

### 1.2 Registro no worker

```ts
// apps/web/src/mocks/browser.ts
import { setupWorker } from 'msw/browser'
import { httpHandlers } from './http-handlers'
import { realtimeHandlers } from './realtime/socket-handler'

export const worker = setupWorker(...httpHandlers, ...realtimeHandlers)
// bootstrap: await worker.start({ onUnhandledRequest: 'bypass' })
```

- **[FATO]** `ws.link().addEventListener()` devolve um `WebSocketHandler`, por isso entra no array de `handlers` como no exemplo oficial (`export const handlers = [chat.addEventListener('connection', ...)]`). https://mswjs.io/docs/websocket/ e https://unpkg.com/msw@2.15.0/lib/core/ws.d.ts
- **[INFERÊNCIA]** Ordem relativa HTTP × WS é irrelevante (tipos de handler distintos); o que importa é registrar o handler WS **antes** de qualquer `io()` abrir conexão, ou seja, `await worker.start()` antes de montar o provider do socket. Em Node/Vitest, `server.listen()` em `beforeAll`.
- **[INFERÊNCIA]** No navegador a interceptação de WebSocket é feita pelo patch do `globalThis.WebSocket` (via `@mswjs/interceptors`), não pelo Service Worker; ainda assim o `worker.start()` é o que ativa os handlers. A nota de kettanaito em https://github.com/mswjs/msw/pull/396 diz que Service Workers não capturam WebSocket (thread antigo, anterior ao `ws.link`).

### 1.3 Configuração do `socket.io-client`

```ts
import { io } from 'socket.io-client'

const socket = io('ws://realtime.mock.local', {   // origem fake; path default = /socket.io/
  path: '/socket.io/',
  transports: ['websocket'],      // OBRIGATÓRIO para o mock (ver abaixo)
  autoConnect: false,             // conectar só após login / dentro do provider
  reconnection: true,
})
```

- **[FATO]** `transports` default é `["polling","websocket","webtransport"]`: começa em HTTP long-polling e depois faz upgrade; `["websocket"]` desliga o polling. `path` default `/socket.io/` e deve casar com o servidor. `autoConnect` default `true`. Reconexão: `reconnectionDelay` 1000 ms, `reconnectionDelayMax` 5000, `randomizationFactor` 0.5, `reconnectionAttempts` Infinity, `timeout` 20000. Fonte: https://socket.io/docs/v4/client-options/
- **[FATO]** MSW declara que não suportará protocolos com HTTP polling ("MSW can't handle them reliably without shipping vendor-specific logic"). https://mswjs.io/docs/websocket/ . O próprio teste do binding cria o cliente com `io(uri, { transports: ['websocket'] })`. https://raw.githubusercontent.com/mswjs/socket.io-binding/main/tests/socket.io-client.ts
- **[FATO]** A URL gerada pelo cliente contém query `EIO=4&transport=websocket` (a `main` do binding casa por `client.url.searchParams.has('EIO')`). **[INFERÊNCIA]** MSW ignora a query ao casar o path do `ws.link`, como nos handlers HTTP; confirmar no teste (3).
- **[INFERÊNCIA]** `io('ws://…')` é aceito (o parse de URL do client trata `ws`/`wss`); alternativa segura: `io('http://realtime.mock.local', …)` e `ws.link('ws://realtime.mock.local/socket.io/')`. O Socket.IO converte http→ws no transporte. Validar.

### 1.4 Servidor -> cliente

`io.client.emit('nft.updated', envelope)` (acima). Envelope sugerido (requisito §7: identidade estável, recurso, versão): `{ eventId, resource: { type: 'nft', id }, version, occurredAt, data: {...} }`.
- **[FATO]** só eventos de texto, namespace `/` (limitações abaixo).

### 1.5 Desconexão e reconexão

- **[FATO]** `client.close(code?, reason?)` encerra a conexão do lado "servidor" e aceita códigos restritos (ex.: 1003) e customizados (4000). https://mswjs.io/docs/api/ws
- Receita: `connection.client.close(1011, 'mock-drop')` (ou pelo controle de cenário). **[INFERÊNCIA]** o `socket.io-client` emite `disconnect` ("transport close") e tenta reconectar com o backoff acima; a cada nova tentativa o `connection` do link dispara de novo, com novo `toSocketIo` e novo handshake. Para testes use `reconnectionDelay: 50`, `reconnectionDelayMax: 100`, `randomizationFactor: 0`.
- Indisponibilidade prolongada: o handler pode recusar nova conexão chamando `connection.client.close(1013)` (try again later) enquanto o cenário "offline" estiver ativo (**[INFERÊNCIA]**: o cliente vê `connect_error`/`disconnect` e segue tentando). Ao religar, reconectar e o app deve reconciliar via REST (§7).
- **[FATO]** `link.clients` (Set), `link.broadcast(data)` e `broadcastExcept` existem, mas operam em frames brutos. Para Socket.IO guarde os `toSocketIo(connection)` como no código acima.

### 1.6 Eventos duplicados e fora de ordem

Não há suporte do binding: é decisão do mock (**[INFERÊNCIA]**, trivial com `emit`):
- duplicado: `emitToClients('nft.updated', env); emitToClients('nft.updated', env)` com o mesmo `eventId`/`version`;
- fora de ordem: emitir `version: 5` e depois `version: 4` (ou `setTimeout` com atrasos invertidos);
- sessão anterior: incluir `sessionId`/`userId` no envelope e emitir um evento de outro usuário. O cliente deve descartá-los.

### 1.7 Cuidados específicos (derivados dos fatos)

- **Pings (risco real)**. **[FATO]** O 0.2.0 anuncia `pingInterval: 25000, pingTimeout: 5000` e **nunca envia ping** (nenhum tratamento de pacotes `2`/`3`). **[INFERÊNCIA, alta probabilidade]** Pelo protocolo Engine.IO v4, o cliente fecha com "ping timeout" se não receber ping do servidor dentro de `pingInterval + pingTimeout` (~30 s): a sessão cairia e reconectaria a cada ~30 s, sem aviso. Mitigação: o handler envia o frame bruto de ping `'2'` a cada ~20 s por `connection.client.send('2')` (limpar o intervalo no `close`). **[NÃO VERIFICADO]** formato do ping `2` e do pong `3`: https://socket.io/docs/v4/engine-io-protocol/ . A `main` do binding resolve isso anunciando intervalos enormes (https://raw.githubusercontent.com/mswjs/socket.io-binding/main/src/index.ts, resumo), o que confirma que o problema existe. Em teste, provar com `vi.useFakeTimers`/espera de 35 s ou diminuindo nada (os valores são fixos no binding).
- **Handshake em microtask**. **[FATO]** ocorre em `queueMicrotask` no construtor. **[INFERÊNCIA]** se o `open` do WebSocket falso for despachado depois da microtask, o `message` `0{...}` chega antes do `open`; o engine.io-client pode ignorar/descartar. É a hipótese mais provável para o "handshake não conectou no navegador" do protótipo (CLAUDE.md). Mitigação: criar o `toSocketIo` dentro de `setTimeout(0)`/depois do `open`? Isso muda a ordem do construtor; alternativa é o caminho 4 (handshake manual). Decidir pelo resultado do teste.
- **HMR do Vite**. **[INFERÊNCIA]** Wildcards como `ws://*` ou `*/socket.io/` podem engolir o WebSocket do HMR do Vite (`ws://localhost:5173/?token=…`). Use host fake dedicado (acima).
- **Node (Vitest)**. **[FATO]** Em Node o `socket.io-client` carrega o build Node, que usa o pacote `ws` e **ignora** o `WebSocket` global (comentário no arquivo de teste do binding). Por isso o binding importa `socket.io-client/dist/socket.io.js` (build de browser) só em teste. https://raw.githubusercontent.com/mswjs/socket.io-binding/main/tests/socket.io-client.ts . Opções: (a) em Vitest Node/jsdom importar `socket.io-client/dist/socket.io.js` no teste; (b) Vitest browser mode (WebSocket real do Chromium, mais fiel); (c) o `engine.io-client` 6.6+ permite passar implementação de transporte: `import { WebSocket as WS } from 'engine.io-client'` e `transports: [WS]` (https://socket.io/docs/v4/client-options/ , seção de transportes, v4.8.0), mas o exemplo oficial usa o `WebSocket` do engine.io, e não confirma que ele delegue ao `globalThis.WebSocket` em Node: **[NÃO VERIFICADO]**.

## 2. Limitações conhecidas (copiar para ARCHITECTURE.md)

1. **[FATO]** Somente namespace padrão `/`; sem namespaces customizados (issue aberta #17). Fontes: README e https://github.com/mswjs/socket.io-binding/issues
2. **[FATO]** Somente eventos de texto; sem anexos binários (issue #3 aberta: "Test binary messages").
3. **[FATO]** Sem acknowledgements (callbacks de `emit`). Evitar `emit(..., cb)` no app; usar eventos de resposta. Sem rooms/broadcast (README 0.2.0).
4. **[FATO]** O binding "não pretende ter paridade total" com a API do Socket.IO (README 0.2.0; https://mswjs.io/docs/websocket/bindings).
5. **[FATO]** Sem HTTP long-polling (MSW não suporta). Transporte documentado: **WebSocket puro** (`transports: ['websocket']`), sem upgrade (`upgrades: []`).
6. **[FATO]** `sid` fixo `"test"`, sem ping/pong real (0.2.0) e handshake sempre aprovado (sem autenticação do handshake). Auth no `auth` do `io()` não é validada pelo binding; o handler pode ler `connection.client.url`/mensagens, mas isso é decisão do mock **[INFERÊNCIA]**.
7. **[FATO]** MSW não suporta protocolos customizados com polling nem planeja protocolos customizados (https://mswjs.io/docs/websocket/).
8. Não é um servidor real: não há persistência nem entrega entre abas/instâncias; cada `connection` é uma sessão independente **[INFERÊNCIA]**; o estado compartilhado entre REST e eventos precisa viver no store de mocks do projeto (requisito: "mudanças nos dados simulados refletidas tanto em REST quanto em eventos").
9. Pacote `0.x`, pouco mantido (issues: 2 abertas, última release 2025-06-13) e atrelado a `msw ^2.10.2`; MSW 3 muda eventos do ciclo de vida. Fixar versões.

## 3. Plano de verificação mínimo (com `socket.io-client` real)

Pré-requisito: `msw@2.15.0`, `@mswjs/socket.io-binding@0.2.0` (verificar compatibilidade de `@mswjs/interceptors ^0.39.2` com o que o `msw` instala; duas cópias do interceptors podem gerar conflito de patch do WebSocket **[INFERÊNCIA]**), `socket.io-client` (qualquer 4.8.x).

### 3.1 Playwright (decisivo para o navegador)

1. Subir o app com mocks ativos (`pnpm dev` com a flag de mocks) e expor o socket para o teste por um hook do app real, ou abrir uma página `/dev/socket-probe` fora do bundle de produção que cria `io('ws://realtime.mock.local', { transports: ['websocket'] })`. Não substituir o cliente por stubs.
2. `page.goto('/')`; `await page.waitForFunction(() => window.__socket?.connected === true, null, { timeout: 5000 })`. Falha aqui = handshake não funciona (ver 4).
3. Registrar `page.on('websocket', ...)` não vai ver nada (conexão interceptada); em vez disso, ler `socket.io.engine.transport.name === 'websocket'` e `socket.id`.
4. Emitir do mock: expor `window.__mock.emit('nft.updated', env)` (somente em modo mock/E2E) que chama `emitToClients`. Verificar que a UI do catálogo mudou o preço sem reload.
5. Duplicado: emitir o mesmo envelope 2x; asserir que o efeito (ex.: toast/contador de aplicações) ocorre 1x. Fora de ordem: emitir `version 5` e `4`; UI mantém o 5.
6. Desconexão: `window.__mock.dropConnections()` (`client.close(1011)`); asserir `connected === false` e depois `true` (com backoff curto configurado por env de teste) e que o app chamou o REST para reconciliar (interceptar com `page.waitForResponse`).
7. Ping: manter a página aberta 40 s (ou usar `page.clock.install()`/`fastForward`, Playwright 1.45+ **[NÃO VERIFICADO]** para WebSocket real) e asserir que `connected` permanece `true` (comprova a mitigação de 1.7).
8. Logout: asserir `socket.connected === false` e `socket.listeners('nft.updated').length === 0`.

### 3.2 Vitest (unidade/integração em Node)

1. `setupServer(...realtimeHandlers)` do `msw/node`; `beforeAll(() => server.listen())`, `afterEach(() => server.resetHandlers())`, `afterAll(() => server.close())`.
2. No teste, `import { io } from 'socket.io-client/dist/socket.io.js'` (build de browser, ver 1.7) com `transports: ['websocket']`.
3. `await new Promise(r => socket.on('connect', r))`; emitir `hello`, esperar `greeting`.
4. Repetir os casos de duplicado/ordem/desconexão com `reconnectionDelay: 10`.
5. Se (2) não interceptar, trocar para Vitest browser mode com provider Playwright (WebSocket real do navegador).

Critério de aceite da pesquisa: 3.1 passos 2, 4 e 6 verdes no Chromium. Só então o realtime conta como funcional (regra do CLAUDE.md).

## 4. Alternativa se o binding falhar: `ws.link` do MSW falando Engine.IO/Socket.IO na mão

Dentro do enunciado: continua MSW + `socket.io-client` real. Não há exemplo oficial de handshake manual; o código abaixo é **[INFERÊNCIA]** montada a partir do protocolo e dos pacotes que o binding envia (`0{…}` e `40{…}`, **[FATO]** pelo código do 0.2.0) e do formato Engine.IO v4 (https://socket.io/docs/v4/engine-io-protocol/ e https://socket.io/docs/v4/socket-io-protocol/ , **[NÃO VERIFICADOS]** nesta sessão): Engine.IO `0` open, `2` ping, `3` pong, `4` message; Socket.IO `0` connect, `2` event, `4` connect_error; frame de evento = `42["evento",payload]`.

```ts
import { ws } from 'msw'

const link = ws.link('ws://realtime.mock.local/socket.io/')
const live = new Set<{ send: (d: string) => void }>()

export const manualRealtime = link.addEventListener('connection', ({ client }) => {
  // microtask/timeout para garantir que o 'open' já foi despachado
  setTimeout(() => {
    client.send('0' + JSON.stringify({
      sid: crypto.randomUUID(), upgrades: [], pingInterval: 10000, pingTimeout: 5000, maxPayload: 1000000,
    }))
  }, 0)

  const ping = setInterval(() => client.send('2'), 10000)   // servidor -> cliente
  client.addEventListener('close', () => { clearInterval(ping); live.delete(client) })

  client.addEventListener('message', ({ data }) => {
    if (typeof data !== 'string') return
    if (data === '3') return                                  // pong
    if (data.startsWith('40')) {                              // CONNECT no namespace '/'
      client.send('40' + JSON.stringify({ sid: crypto.randomUUID() }))
      live.add(client)
      return
    }
    if (data.startsWith('42')) {                              // EVENT do cliente
      const [event, ...args] = JSON.parse(data.slice(2))
      // tratar 'subscribe', etc.
    }
  })
})

export const emit = (event: string, payload: unknown) =>
  live.forEach((c) => c.send('42' + JSON.stringify([event, payload])))
```

Notas **[INFERÊNCIA]**: (a) em Socket.IO v4 o cliente envia `40` (com `auth` opcional: `40{"token":"…"}`) depois de receber o open, e o servidor responde `40{"sid":…}`; o binding 0.2.0 em vez disso envia o `40` por conta própria, logo ambos os fluxos devem ser tolerados pelo cliente, mas a variante acima segue o protocolo e permite validar `auth` (sessão/usuário). (b) Ack: eventos com id (`42<id>[…]`) exigem responder `43<id>[…]`; opcional. (c) Esta variante permite controlar pings, `sid`, validação de `auth` e simular `44{"message":"…"}` (connect_error) para sessão expirada.

Alternativa de fonte confiável para o encoding: usar `engine.io-parser` e `socket.io-parser` (dependências do próprio binding, https://raw.githubusercontent.com/mswjs/socket.io-binding/main/package.json) em vez de montar strings.

## 5. Lacunas e riscos para decidir antes de implementar

- Não encontrei issue/PR oficial sobre handshake no navegador, sobre polling ou sobre ping (apenas as duas issues abertas #17 e #3); as conclusões de ping/microtask vêm de leitura de código + protocolo (inferência).
- Não consegui ler `tests/socket-io.test.ts` da tag 0.2.0 (404); o teste da `main` usa `wss://example.com` (mock) e `transports: ['websocket']`, ambiente Node com build de browser do cliente.
- Confirmar no teste 3.1: casamento do `ws.link` com query `?EIO=4&transport=websocket`, aceitação de `io('ws://…')`, o handshake em microtask no Chromium e o ping timeout.
