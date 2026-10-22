import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './app/styles.css';
import { App } from './app/App';
import { enableMocks } from './app/bootstrap/enable-mocks';

const root = document.getElementById('root');
if (!root) throw new Error('Elemento #root ausente em index.html');

void enableMocks();

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
