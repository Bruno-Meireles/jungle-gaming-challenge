import { afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';

/* O ponteiro fica onde o ultimo hover terminou e contamina a medida do teste seguinte (flake sob carga). */
afterEach(async () => {
  await userEvent.unhover(document.body);
});
