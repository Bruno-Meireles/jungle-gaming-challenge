# Plano: auth (F2, /login e /signup)

Origem: decisão do `architect` em 2026-10-22; aprovação delegada pelo usuário ("faça como achar melhor"). Divisão com o Copilot em `docs/agent-communication.md`.

## Requisitos cobertos
`docs/routes.md` §2-§4 (rotas `/login`, `/signup`, `redirect`, guards); Figma 9:115 e 9:1022 (modais desktop), 16:1022 e 16:1228 (páginas mobile); i18n pt-BR/en sem texto fixo.

## Slice FSD
- Claude (apresentação): `shared/lib/navigation/safe-redirect.ts`, `features/auth/ui/{LoginForm,SignupForm}.tsx` + locales `auth.*`, `pages/login`, `pages/signup`, `app/router` (rotas e `beforeLoad`).
- Copilot (negócio): `entities/session`, `features/auth/model` (`useLogin`, `useRegister`, `AuthFailure`, schemas), mocks.

## Contratos
Ver mensagens de 23:20 e 23:40 em `docs/agent-communication.md` (`useSession`, `useLogin`, `useRegister`, `AuthFailure`). O hook não navega; a UI só vê `AuthFailure`.

## Aceite
- Desktop (>=768): `Dialog` do design system sobre a Home (`inert`, foco preso, Esc fecha); mobile: página com `h1`.
- Estados: ocioso, validação (submit e blur), enviando (sem duplo submit), `invalid_credentials` (genérico), `account_conflict` (campo), `network` (alerta com nova tentativa, valores mantidos), sucesso (navega).
- A11y: label por campo, `aria-invalid`/`aria-describedby`, `role="alert"`, `autocomplete`, toggle de senha com `aria-pressed`; axe sem violações em 1440 e 390.
- Redirect: só caminho interno de mesma origem; senão `/`. Logado em `/login`/`/signup` é redirecionado com `replace`. Links entre telas preservam `redirect`.
- Login social: `aria-disabled` com texto, ou `/unavailable?feature=social-login`.

## Testes RED
1. `shared/lib/navigation/safe-redirect.node.test.ts` (unit): aceita `/x?y=1`; rejeita `//evil`, `/\evil`, `https://evil`, `javascript:`, vazio, não string; fallback `/`.
2. `features/auth/ui/LoginForm.test.tsx` (integração): validação, enviando, cada `AuthFailure`.
3. `features/auth/ui/SignupForm.test.tsx` (integração): idem, conflito por campo.
4. `e2e/auth.spec.ts` (Playwright 1440 e 390): login com redirect, credencial inválida, falha de rede, cadastro com conflito, redirect externo descartado, refresh mantém sessão. Depende dos cenários do Copilot.

## Fora do escopo
Login social funcional, recuperação de senha, logout e telas de conta (F8).

## Decisões (ARCHITECTURE.md)
Fundo do modal = Home `inert` (alternativa descartada: background location; consequência: fundo não reflete a origem).

## Progresso
- [ ] 1 safe-redirect
- [ ] 2 LoginForm
- [ ] 3 SignupForm
- [ ] 4 E2E auth
