import { HttpResponse, http } from 'msw';

import {
  changePasswordRequestSchema,
  saveWalletRequestSchema,
  updateProfileRequestSchema,
} from '../../shared/api/contracts/account';
import { authenticate, sessionInvalid, simulateLatency, toSessionUser } from '../auth/guard';
import { hashPassword, newSalt, verifyPassword } from '../auth/password';
import { readState, updateState } from '../state';

function fieldErrorsOf(error: { issues: { path: PropertyKey[] }[] }): Record<string, 'invalid'> {
  const fields: Record<string, 'invalid'> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string') fields[key] = 'invalid';
  }
  return fields;
}

const invalid = (fieldErrors: Record<string, 'invalid'>) =>
  HttpResponse.json({ code: 'validation_failed', fieldErrors }, { status: 400 });

export const accountHandlers = [
  http.get('*/api/account/profile', async ({ request }) => {
    await simulateLatency();
    const auth = authenticate(request);
    return auth ? HttpResponse.json(toSessionUser(auth.user)) : sessionInvalid();
  }),

  http.put('*/api/account/profile', async ({ request }) => {
    await simulateLatency();
    const auth = authenticate(request);
    if (!auth) return sessionInvalid();
    const body = updateProfileRequestSchema.safeParse(await request.json().catch(() => null));
    if (!body.success) return invalid(fieldErrorsOf(body.error));
    const { email, username, displayName, avatarUrl } = body.data;
    const others = readState().users.filter((u) => u.id !== auth.user.id);
    const fields: ('email' | 'username')[] = [];
    if (others.some((u) => u.email.toLowerCase() === email.toLowerCase())) fields.push('email');
    if (others.some((u) => u.username.toLowerCase() === username.toLowerCase())) fields.push('username');
    if (fields.length > 0) return HttpResponse.json({ code: 'account_conflict', fields }, { status: 409 });
    const updated = updateState((s) => {
      const user = s.users.find((u) => u.id === auth.user.id);
      if (!user) return null;
      Object.assign(user, { email, username, displayName, avatarUrl });
      return user;
    });
    return updated ? HttpResponse.json(toSessionUser(updated)) : sessionInvalid();
  }),

  http.put('*/api/account/password', async ({ request }) => {
    await simulateLatency();
    const auth = authenticate(request);
    if (!auth) return sessionInvalid();
    const body = changePasswordRequestSchema.safeParse(await request.json().catch(() => null));
    if (!body.success) return invalid(fieldErrorsOf(body.error));
    const { currentPassword, newPassword } = body.data;
    if (!(await verifyPassword(auth.user.salt, auth.user.passwordHash, currentPassword))) {
      return invalid({ currentPassword: 'invalid' });
    }
    const salt = newSalt();
    const passwordHash = await hashPassword(salt, newPassword);
    updateState((s) => {
      const user = s.users.find((u) => u.id === auth.user.id);
      if (user) Object.assign(user, { salt, passwordHash });
    });
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('*/api/account/wallets', async ({ request }) => {
    await simulateLatency();
    const auth = authenticate(request);
    if (!auth) return sessionInvalid();
    const wallets = readState()
      .wallets.filter((w) => w.userId === auth.user.id)
      .map((w) => w.wallet)
      .sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'primary' ? -1 : 1));
    return HttpResponse.json({ wallets });
  }),

  http.put('*/api/account/wallets', async ({ request }) => {
    await simulateLatency();
    const auth = authenticate(request);
    if (!auth) return sessionInvalid();
    const body = saveWalletRequestSchema.safeParse(await request.json().catch(() => null));
    if (!body.success) return invalid(fieldErrorsOf(body.error));
    const { kind, network, address } = body.data;
    const wallet = updateState((s) => {
      const existing = s.wallets.find((w) => w.userId === auth.user.id && w.wallet.kind === kind);
      if (existing) {
        existing.wallet = { ...existing.wallet, network, address };
        return existing.wallet;
      }
      const created = { id: `wallet-${crypto.randomUUID()}`, kind, network, address };
      s.wallets.push({ userId: auth.user.id, wallet: created });
      return created;
    });
    return HttpResponse.json(wallet);
  }),
];
