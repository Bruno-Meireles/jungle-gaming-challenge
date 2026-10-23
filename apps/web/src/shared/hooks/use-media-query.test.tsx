import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import { useMediaQuery } from './use-media-query';

function Probe() {
  const wide = useMediaQuery('(min-width: 768px)');
  return <p data-testid="probe">{wide ? 'wide' : 'narrow'}</p>;
}

describe('useMediaQuery', () => {
  it('reflete a consulta no viewport atual e reage a mudanca de tamanho', async () => {
    await page.viewport(1440, 900);
    await render(<Probe />);
    await expect.element(page.getByTestId('probe')).toHaveTextContent('wide');

    await page.viewport(390, 844);
    await expect.element(page.getByTestId('probe')).toHaveTextContent('narrow');

    await page.viewport(1440, 900);
    await expect.element(page.getByTestId('probe')).toHaveTextContent('wide');
  });
});
