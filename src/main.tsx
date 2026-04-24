import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Pre-load all Trajan Pro weights so they are in the browser font cache before
// the first coin generation. The @font-face in index.css serves the files from
// /public/fonts/ — these calls just trigger the fetch immediately on app start.
document.fonts.load('400 16px "Trajan Pro"');
document.fonts.load('600 16px "Trajan Pro"');
document.fonts.load('700 16px "Trajan Pro"');
document.fonts.load('400 16px "Great Vibes"');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
