import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Prefixos dos estilos TEXT do Figma (Body, Body Large, Tiny, Display, Caption, Heading, Title);
// tokens `--text-<kebab do nome>` geram classes como `text-body-14-bold-lh-16`.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      // Raios numericos da escala do projeto (rounded-5, rounded-10...): sem isto o merge nao resolve conflitos entre eles.
      rounded: [{ rounded: [(value: string) => /^\d+(\.\d+)?$/.test(value)] }],
      'font-size': [
        { text: [(value: string) => /^(body|body-large|tiny|display|caption|heading|title)-\d/.test(value)] },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
