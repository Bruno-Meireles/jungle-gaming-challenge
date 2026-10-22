import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { VisuallyHidden } from '../visually-hidden';
import { LiveRegion } from './LiveRegion';

describe('LiveRegion', () => {
  it('por padrao e uma regiao polite com role=status e aria-atomic', async () => {
    await render(<LiveRegion>Item adicionado</LiveRegion>);
    const region = page.getByRole('status');
    await expect.element(region).toBeInTheDocument();
    await expect.element(region).toHaveAttribute('aria-live', 'polite');
    await expect.element(region).toHaveAttribute('aria-atomic', 'true');
  });

  it('politeness="assertive" vira role=alert com aria-live=assertive', async () => {
    await render(<LiveRegion politeness="assertive">Falha no pagamento</LiveRegion>);
    const region = page.getByRole('alert');
    await expect.element(region).toBeInTheDocument();
    await expect.element(region).toHaveAttribute('aria-live', 'assertive');
    await expect.element(region).toHaveAttribute('aria-atomic', 'true');
  });

  it('exibe os children visivelmente (nao oculta por conta propria)', async () => {
    await render(<LiveRegion>Item adicionado</LiveRegion>);
    await expect.element(page.getByRole('status')).toBeVisible();
    await expect.element(page.getByText('Item adicionado')).toBeVisible();
  });

  it('composta com VisuallyHidden anuncia a mensagem via role=status', async () => {
    await render(
      <LiveRegion>
        <VisuallyHidden>msg</VisuallyHidden>
      </LiveRegion>,
    );
    await expect.element(page.getByRole('status')).toHaveTextContent('msg');
    await expect.element(page.getByText('msg')).toBeInTheDocument();
  });
});
