import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AppConfigProvider } from './context/AppConfigContext';
import { initializeLocale } from './lib/i18n';
import './index.css';

initializeLocale();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppConfigProvider>
      <App />
    </AppConfigProvider>
  </StrictMode>,
);
