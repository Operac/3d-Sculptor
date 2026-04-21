import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Pre-load Trajan Pro so it is in the browser font cache before the first coin
// generation. Without this, document.fonts.load() in coinGenerator may still
// race against the first-paint font fetch.
document.fonts.load('700 16px "Trajan Pro"');
document.fonts.load('600 16px "Trajan Pro"');
document.fonts.load('400 16px "Great Vibes"');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
