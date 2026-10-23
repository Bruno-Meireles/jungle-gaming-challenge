import { useRef, useState, type PointerEvent } from 'react';

const SWIPE_THRESHOLD_RATIO = 0.15;

/** Decide o slide de destino de um gesto: arrastar para a esquerda avanca, para a direita volta; limitado aos extremos. */
export function targetIndex({ index, total, dx, width }: { index: number; total: number; dx: number; width: number }): number {
  if (Math.abs(dx) < width * SWIPE_THRESHOLD_RATIO) return index;
  return Math.min(Math.max(index + (dx < 0 ? 1 : -1), 0), total - 1);
}

/** Gesto de deslizar (toque) e arrastar (mouse) via Pointer Events; o slide acompanha o ponteiro e so troca ao soltar. */
export function useHeroSwipe({ index, total, onChange }: { index: number; total: number; onChange: (next: number) => void }) {
  const start = useRef<{ x: number; id: number } | null>(null);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);

  const end = (event: PointerEvent<HTMLElement>) => {
    if (!start.current) return;
    const moved = event.clientX - start.current.x;
    start.current = null;
    setDragging(false);
    setDx(0);
    onChange(targetIndex({ index, total, dx: moved, width: event.currentTarget.clientWidth }));
  };

  return {
    dx,
    dragging,
    handlers: {
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        start.current = { x: event.clientX, id: event.pointerId };
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
      },
      onPointerMove: (event: PointerEvent<HTMLElement>) => {
        if (start.current) setDx(event.clientX - start.current.x);
      },
      onPointerUp: end,
      onPointerCancel: end,
    },
  };
}
