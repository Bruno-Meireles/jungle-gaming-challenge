import { userEvent } from 'vitest/browser';

/* O Radix (radio-group) so marca o item ao receber foco se a seta ainda estiver pressionada no proximo frame. */
export async function pressArrow(key: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight') {
  await userEvent.keyboard(`{${key}>}`);
  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  await userEvent.keyboard(`{/${key}}`);
}
