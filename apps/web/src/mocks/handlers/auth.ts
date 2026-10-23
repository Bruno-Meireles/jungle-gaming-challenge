import { HttpResponse, http } from 'msw';

import { loginRequestSchema, registerRequestSchema } from '../../shared/api/contracts/auth';
import { newSalt, hashPassword, verifyPassword } from '../auth/password';
import {
  SESSION_TTL_MS,
  authenticate,
  bearerToken,
  sessionInvalid,
  simulateLatency,
  toSessionUser,
} from '../auth/guard';
import { readScenario } from '../scenario';
import { updateState, readState } from '../state';
import type { UserRecord } from '../state/state-schema';

function readLocalScenario() {
  return readScenario(typeof localStorage === 'undefined' ? { getItem: () => null } : localStorage);
}

/** Cenarios de falha de auth: rede (conexao derrubada) e servidor (503). */
function authScenarioFailure(): Response | null {
  const scenario = readLocalScenario();
  if (scenario === 'auth_network_error') return HttpResponse.error();
  if (scenario === 'auth_server_error') {
    return HttpResponse.json({ code: 'service_unavailable' }, { status: 503 });
  }
  return null;
}

function issueSession(userId: string) {
  const token = crypto.randomUUID();
  const expiresAt = Date.now() + SESSION_TTL_MS;
  updateState((s) => {
    s.sessions = s.sessions.filter((x) => x.expiresAt > Date.now());
    s.sessions.push({ token, userId, expiresAt });
  });
  return { token, expiresAt };
}

const invalidCredentials = () => HttpResponse.json({ code: 'invalid_credentials' }, { status: 401 });
const validationFailed = (fieldErrors?: Record<string, 'invalid'>) =>
  HttpResponse.json({ code: 'validation_failed', ...(fieldErrors ? { fieldErrors } : {}) }, { status: 400 });

function invalidFields(error: { issues: { path: PropertyKey[] }[] }): Record<string, 'invalid'> {
  const fields: Record<string, 'invalid'> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string') fields[key] = 'invalid';
  }
  return fields;
}

export const authHandlers = [
  http.post('*/api/auth/login', async ({ request }) => {
    await simulateLatency();
    const failure = authScenarioFailure();
    if (failure) return failure;
    const body = loginRequestSchema.safeParse(await request.json().catch(() => null));
    if (!body.success) return validationFailed(invalidFields(body.error));
    const email = body.data.email.toLowerCase();
    const user = readState().users.find((u) => u.email.toLowerCase() === email);
    const matches = user ? await verifyPassword(user.salt, user.passwordHash, body.data.password) : false;
    if (!user || !matches) return invalidCredentials();
    return HttpResponse.json({ ...issueSession(user.id), user: toSessionUser(user) });
  }),

  http.post('*/api/auth/register', async ({ request }) => {
    await simulateLatency();
    const failure = authScenarioFailure();
    if (failure) return failure;
    const body = registerRequestSchema.safeParse(await request.json().catch(() => null));
    if (!body.success) return validationFailed(invalidFields(body.error));
    const { email, username, displayName, password } = body.data;
    const fields: ('email' | 'username')[] = [];
    const { users } = readState();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) fields.push('email');
    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) fields.push('username');
    if (fields.length > 0) return HttpResponse.json({ code: 'account_conflict', fields }, { status: 409 });

    const salt = newSalt();
    const record: UserRecord = {
      id: `user-${crypto.randomUUID()}`,
      displayName,
      username,
      email,
      avatarUrl: null,
      salt,
      passwordHash: await hashPassword(salt, password),
    };
    updateState((s) => void s.users.push(record));
    return HttpResponse.json({ ...issueSession(record.id), user: toSessionUser(record) }, { status: 201 });
  }),

  http.get('*/api/auth/session', async ({ request }) => {
    await simulateLatency();
    if (!bearerToken(request)) return HttpResponse.json({ user: null });
    const auth = authenticate(request);
    return auth ? HttpResponse.json({ user: toSessionUser(auth.user) }) : sessionInvalid();
  }),

  http.post('*/api/auth/logout', async ({ request }) => {
    await simulateLatency();
    const token = bearerToken(request);
    if (token) updateState((s) => void (s.sessions = s.sessions.filter((x) => x.token !== token)));
    return new HttpResponse(null, { status: 204 });
  }),
];
