import { delay, http, HttpResponse } from 'msw';

import { authenticate, sessionInvalid } from '../auth/guard';
import { readScenario } from '../scenario';

export const walletConnectionHandlers = [
  http.post('*/api/wallet/connect', async ({ request }) => {
    await delay(600);
    if (!authenticate(request)) return sessionInvalid();
    const scenario = readScenario(typeof localStorage === 'undefined' ? { getItem: () => null } : localStorage);
    if (scenario === 'wallet-rejected') return HttpResponse.json({ code: 'forbidden' }, { status: 403 });
    return HttpResponse.json({ connectionId: `conn-${crypto.randomUUID()}`, provider: 'MockWallet' });
  }),
  http.delete('*/api/wallet/connect', async () => new HttpResponse(null, { status: 204 })),
];
