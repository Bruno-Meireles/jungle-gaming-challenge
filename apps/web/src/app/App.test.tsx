import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import './styles.css';
import { App } from './App';

describe('App', () => {
  it('renderiza a landmark principal', async () => {
    await render(<App />);
    await expect.element(page.getByRole('main')).toBeInTheDocument();
  });
});
