# Plano: account (F8) — /account, /account/profile, /account/wallets

Fonte: plano do architect (sessão 2026-10-22). prompt.md §3 (perfil: dados, avatar, senha; carteiras principal/secundária; mobile sem frame; logout limpa cache), §4 (estados, invalidação, signal), §5, §8 (a11y, 390/768/1440), §9.8.

## Slices (apps/web/src)
- pages/account: index.ts exporta AccountLayout, AccountProfilePage, AccountWalletsPage, locales (pageAccountLocales); ui/*; config/locales.
- widgets/account-nav: AccountNav (nav rotulada "Meu perfil", itens Perfil/Carteiras com aria-current, Atividade/Lista de interesse/Ofertas/Arquivos baixados/Suporte -> /unavailable?feature=activity|watchlist|offers|downloads|support, "Sair" via prop onLogout), accountNavLocales.
- features/edit-profile: model/profile-form.ts (puro: validateProfileForm, hasPasswordChange, toRequests), model/use-profile-query, use-update-profile, use-change-password, lib/read-avatar-file.ts, ui/ProfileEditor (container), ProfileForm (apresentacional), ProfileFormSkeleton, editProfileLocales.
- features/manage-wallets: model/wallet-slots.ts (toSlots, isSameAsPrimary), wallet-form.ts (validateWalletForm usa isValidWalletAddress de contracts, toSaveRequest), use-wallets-query, use-save-wallet, ui/WalletsManager, WalletForm, WalletEmptyState, skeleton, manageWalletsLocales.
- shared/lib/form/to-form-failure.ts: ApiError -> FormFailure (validation{fields}|conflict{fields}|session_expired|network|unexpected).
- app/i18n/resources.ts + i18next.d.ts: acrescentar pageAccount, accountNav, editProfile, manageWallets.
- pages/unavailable: aceitar os 5 novos feature ids (+ locales).
- Rota (quem edita router.tsx): /account (beforeLoad requireSession, component AccountLayout), index redirect replace -> /account/profile, profile, wallets.

## Contratos (não editar)
shared/api/contracts/account.ts: Profile, UpdateProfileRequest (displayName 1..60, username ^[a-zA-Z0-9_]{3,20}$, email, avatarUrl|null max 300000), ChangePasswordRequest (new>=8, new!=current), Wallet{kind,network,address}, SaveWalletRequest, WalletsResponse. entities/user/api/account-api.ts: fetchProfile, updateProfile, changePassword, fetchWallets, saveWallet (importar de lá enquanto entities/user/index.ts estiver vazio). MSW: 409 account_conflict{fields}, 400 validation_failed fieldErrors (senha atual errada: fieldErrors.currentPassword), 204 senha, 401 session_invalid. Ana tem carteira primária e nenhuma secundária; Bruno nenhuma.

## Comportamento
- Perfil: um único "Salvar": PUT profile e, se senha preenchida, PUT password. Senha vazia não envia; parcial exige os 3; mismatch 'password_mismatch' só no cliente; same_password; too_short. Códigos de erro (required, invalid_email, invalid_username, too_long, too_short, password_mismatch, same_password) traduzidos via i18n. Avatar: botão Alterar abre file input png/jpeg/webp -> data URL (<=300000, erros avatar_invalid_type/avatar_too_large), aplicado no Salvar; Remover => null.
- Carteiras: primária existente em modo edição; ausente => estado vazio + Adicionar; secundária ausente => "Você ainda não adicionou uma carteira secundária." + Adicionar; checkbox "Igual à carteira principal" (desabilitado sem primária) preenche/trava; sem remoção.
- Estados: skeleton com aria-busy, erro de consulta com Tentar novamente, validação no submit (foco no 1º inválido) com aria-invalid/aria-describedby, enviando sem duplo submit, conflito no campo, rede/5xx alerta mantendo valores, session_expired -> /login?redirect=, sucesso em LiveRegion. mutations retry:0, query repassa signal.
- Layout: >=1024 sidebar 310 + form 2 colunas (417 gap 28; linhas gap 24; input h40 raio 3); <1024 nav horizontal rolável; <768 1 coluna.
- Logout: logoutSession(queryClient) de features/auth (Copilot) e navegar para "/".

## Decisões / desvios (para ARCHITECTURE.md)
1. Um único Salvar (Figma). 2. Avatar data URL no PUT profile. 3. "Igual à principal" derivado. 4. Nav mobile horizontal sem frame. 5. Campos do Figma sem contrato (Nome ENS, Apelido da carteira, etc.) omitidos (opção B).
6. Execução: query keys locais ['account','profile'|'wallets'] enquanto userKeys (Copilot) estiver vazio; E2E, medidas (measure tests), prop className no FormField do DS e BottomNav ficam para o mapeamento final/adicional.

## Lista de testes
unit: to-form-failure; profile-form; wallet-slots; wallet-form; features.node (unavailable). browser/integração (MSW real): read-avatar-file; use-profile-query/update/change-password; use-wallets-query/save; ProfileForm (labels pt-BR/en, aria, foco, busy, conflito, senha atual, rede+retry, sucesso, avatar); ProfileFormSkeleton; WalletsManager (Ana, Bruno vazio, secundária vazia, Adicionar foca rede, checkbox, endereço inválido, sucesso); AccountNav (nav, aria-current, links /unavailable, Sair chama onLogout, tab order); páginas (title, h1). Paridade de locales já coberta.
