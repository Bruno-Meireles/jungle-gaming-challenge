# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado atual

Greenfield: o repositório contém apenas `prompt.md` (requisitos + enunciado completo do desafio, fonte da verdade), `figma.md`, `.claude/agents/` e este arquivo. Não há código, `package.json` nem git ainda. O enunciado em `prompt.md` (seção `challenge`) define telas, contratos, MSW, Socket.IO, testes e metas de Lighthouse.

**`prompt.md` é lei (regra do usuário, 2026-10-22):** tudo o que o desafio exige precisa estar presente; nenhuma decisão do desenvolvimento (planos, ADRs, docs) pode remover uma exigência dele. Detalhe não definido no enunciado: complemente conforme necessário para cumprir o requisito e registre a decisão. O que o enunciado não pede é adicional (deve ser marcado como tal e nunca competir com o exigido).

**Dependências:** estão pré-autorizadas as necessárias para atender aos requisitos (versão fixa, compatibilidade verificada com as já instaladas e com o ESLint/TypeScript/Vite do repositório, registro em `ARCHITECTURE.md`); não é preciso pedir aprovação para cada uma.

## Regras obrigatórias (de `prompt.md`)

- **TDD não é mais obrigatório (decisão do usuário, 2026-10-22):** implemente e depois valide os comportamentos essenciais; commits RED/GREEN separados deixam de ser exigidos. Nunca apague, enfraqueça ou ignore testes existentes; os requisitos de testes e entrega do enunciado continuam.
- **Clean Architecture + Feature-Sliced Design**: camadas FSD `app > pages > widgets > features > entities > shared`, imports só para camadas inferiores, acesso a slices via `index.ts`. Domínio/use cases sem dependência de React, Axios, TanStack ou MSW.
- **Sem exigência de modelos nem de três agentes (2026-10-22).** Limite: no máximo **duas frentes de implementação simultâneas** no total (Claude: apresentação, composição de telas, navegação; Copilot: negócio, contratos, mocks MSW, sessão, persistência, tempo real). Antes de iniciar uma frente, registre responsável, tarefa e arquivos em `docs/agent-communication.md`; um único dono por arquivo (router, providers, i18n, exports). `git add` só dos próprios caminhos. Não crie agentes extras por etapa (`.claude/agents/` é opcional).
- **Telas** são desenvolvidas e validadas com **Playwright**, usando o **Playwright CLI** (não o MCP) para economizar tokens; além disso há E2E determinísticos.
- **Monorepo** com dois pacotes: o app e o **design system**. Ferramenta: pnpm workspaces + Turborepo (já criada: `apps/web` e `packages/design-system`).
- **App web** (requisitos adicionais do usuário, valem desde a primeira feature): **i18n desde o momento zero** (pt-BR e inglês, nenhum texto hardcoded; o design system não embute texto de interface) e **melhores práticas de código e componentização**. Detalhes em `.AI/standards/i18n-quality.md`.
- **Proibido Docker (regra do usuário, 2026-10-22):** não use Docker em desenvolvimento, testes ou validações, nem sugira ou solicite seu uso, nem o ponha em scripts automáticos, planos ou docs como caminho recomendado. Docker só pode ser usado quando o usuário mandar explicitamente. Toda execução é local (Node pelo `.nvmrc`, Playwright e Vitest nativos). Não precisa desinstalar o Docker da máquina.
- Código que o usuário disser estar "em desenvolvimento" no protótipo ou neste arquivo deve ser ignorado.
- Copilot descumpriu regras no protótipo: na inicialização, siga estas regras à risca e não crie scaffolding além do pedido.

## Fluxo por feature

Skills manuais em `.claude/skills/`: `/plan-create <feature>` (architect, grava `.AI/plans/<feature>.md` e espera aprovação) → `/plan-execute <feature>` (implementa, valida com typecheck/lint/testes relevantes e E2E Playwright; TDD opcional) → `/plan-execution-review <feature>` (verificações, aceite, TDD, arquitetura, enunciado, Figma). Referências visuais: `docs/figma/` (gerado por `node --env-file=.env tools/figma-extract.mjs`).

## Protótipo de referência

`C:\Users\opera\OneDrive\Documentos\Frontend -Marketplace-de-NFTs\Frontend-Marketplace-de-NFTs-1\` (Vite + React 19 + TanStack Router/Query + Axios + MSW + `@mswjs/socket.io-binding` + Tailwind 4 + Playwright). Use-o como base **com parcimônia, validando cada item** antes de reaproveitar. Pontos úteis: `src/mocks/` (handlers MSW), `src/shared/api/`, `e2e/`, fontes Roboto Mono em `public/fonts/`, `docs/agents/LEARNINGS.md`. Aviso do próprio protótipo: o handshake do `@mswjs/socket.io-binding` não conectou no navegador num teste inicial — tempo real só conta como funcional após teste com `socket.io-client` real.

## Entregáveis exigidos (resumo do enunciado)

`README.md` (setup, envs, credenciais fictícias, cenários/reset, comandos), `ARCHITECTURE.md` (contratos REST/eventos, sessão, carrinho, cache, reconciliação REST×Socket.IO, desvios do Figma), deploy público obrigatório (Vercel/Netlify/Cloudflare Pages) com mocks ativos no build, scripts para: dev com mocks, build, preview, typecheck, lint, Playwright e Lighthouse (3 medições, mediana; metas Perf ≥90, A11y ≥95, BP ≥95, SEO ≥90).

Restrições que cruzam módulos: valores ETH como strings decimais (nunca float); mocks só na camada MSW (nenhuma resposta fictícia em componentes/hooks/Axios); eventos Socket.IO devem passar pelo `socket.io-client` e ser idempotentes/versionados; pedidos com chave de idempotência; logout limpa cache e subscriptions.

## Comandos

Ainda não existem. Quando o monorepo for criado, documente aqui os comandos reais (dev, build, typecheck, lint, teste único `playwright test <arquivo> -g "<nome>"`, Lighthouse) em vez de supô-los.

## Padrões compartilhados

`.AI/standards/` é a fonte única dos padrões usados por agentes e skills: `grounding.md` (evidência, lacunas, limites), `architecture.md` (Clean Architecture + FSD, estado, mocks), `testing.md` (testes e Playwright; TDD opcional) e `i18n-quality.md` (i18n e qualidade de código do app). Leia o que a tarefa tocar antes de agir.
