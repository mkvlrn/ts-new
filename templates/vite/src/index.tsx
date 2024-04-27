import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '#/app/main';
import '#/index.css';

const root = createRoot(document.querySelector('#root') as HTMLElement);
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
