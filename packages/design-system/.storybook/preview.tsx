import type { Preview } from '@storybook/react-vite';
import './storybook.css';

const preview: Preview = {
  tags: ['autodocs'],
  initialGlobals: { viewport: { value: 'desktop1440', isRotated: false } },
  parameters: {
    layout: 'padded',
    a11y: { test: 'error' },
    backgrounds: { disable: true },
    viewport: {
      options: {
        mobile390: { name: 'Mobile 390', type: 'mobile', styles: { width: '390px', height: '844px' } },
        tablet768: { name: 'Tablet 768', type: 'tablet', styles: { width: '768px', height: '1024px' } },
        desktop1440: { name: 'Desktop 1440', type: 'desktop', styles: { width: '1440px', height: '900px' } },
      },
    },
  },
};

export default preview;
