import { describe, expect, it } from 'vitest';
import './fonts.css';

describe('Roboto Mono self-hosted', () => {
  it.each(['400', '500', '700'])(
    'carrega a face Roboto Mono no peso %s no browser',
    async (weight) => {
      const spec = `${weight} 16px "Roboto Mono"`;
      const faces = await document.fonts.load(spec);

      expect(faces.length).toBeGreaterThanOrEqual(1);
      expect(faces.every((face) => face.status === 'loaded')).toBe(true);
      expect(document.fonts.check(spec)).toBe(true);
    },
  );
});
