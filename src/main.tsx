import './polyfill';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

import App from './App.tsx';
import { LanguageProvider } from './services/LanguageContext.tsx';
import './index.css';

window.addEventListener('error', (event) => {
  console.error("DIAGNOSTIC ERROR INTERCEPTED:", {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
    stack: event.error?.stack
  });
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
);

