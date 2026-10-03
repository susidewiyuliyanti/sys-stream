import { createRoot } from 'react-dom/client';
import React from 'react';
import App from './App.tsx';
import { lazy, Suspense } from 'react';
import './index.css';
import { LanguageProvider } from './i18n';

const hostname = typeof window !== 'undefined'
  ? window.location.hostname.toLowerCase()
  : '';

const AdminApp = lazy(() => import('./admin/AdminApp.tsx'));
const AirdropApp = lazy(() => import('./airdrop/AirdropApp.tsx'));

const Loading = () => (
  <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
    <div className="text-sm text-slate-400">Loading...</div>
  </div>
);

const HostApp = () => {
  if (hostname === 'admin.sysstreamer.asia') {
    return <AdminApp />;
  }

  if (hostname === 'airdrop.sysstreamer.asia') {
    return <AirdropApp />;
  }

  // sysstreamer.asia and every non-admin/non-airdrop hostname
  // render the user application only.
  return <App />;
};

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={<Loading />}>
      <LanguageProvider>
        <HostApp />
      </LanguageProvider>
    </Suspense>
  </React.StrictMode>
);
