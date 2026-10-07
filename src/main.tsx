import React, { Suspense, Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { LanguageProvider } from './i18n';
import UserApp from './App.tsx';

const hostname = typeof window !== 'undefined'
  ? window.location.hostname.toLowerCase()
  : '';

import AdminApp from './admin/AdminApp.tsx';

// Airdrop runs on its own custom domain. Keep this module in the main bundle
// so a stale/missing dynamic chunk can never blank the Airdrop host.
import AirdropApp from './airdrop/AirdropApp.tsx';

class RootErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('[SYS STREAM] Application bundle failed to load:', error);
  }

  private reloadWithFreshBundle = async () => {
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      }
    } catch {}

    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-slate-900 p-6 text-center">
          <div className="text-xs font-black tracking-[0.2em] text-red-400">SYS STREAM</div>
          <h1 className="mt-3 text-xl font-black">Aplikasi gagal dimuat</h1>
          <p className="mt-2 text-sm text-slate-400">
            Muat ulang halaman untuk mengambil bundle produksi terbaru.
          </p>
          <pre className="mt-4 max-h-40 overflow-auto rounded-lg bg-black/40 p-3 text-left text-[10px] text-red-300 whitespace-pre-wrap">{this.state.error.message}</pre>
          <button
            type="button"
            onClick={() => void this.reloadWithFreshBundle()}
            className="mt-5 rounded-xl bg-amber-400 px-5 py-3 text-sm font-black text-slate-950"
          >
            MUAT ULANG
          </button>
        </div>
      </div>
    );
  }
}

const Loading = () => (
  <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
    <div className="text-sm text-slate-400">Loading...</div>
  </div>
);

const HostApp = () => {
  if (hostname === 'admin.sysstreamer.asia') return <AdminApp />;
  if (hostname === 'airdrop.sysstreamer.asia') return <AirdropApp />;
  return <UserApp />;
};

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <Suspense fallback={<Loading />}>
        <LanguageProvider>
          <HostApp />
        </LanguageProvider>
      </Suspense>
    </RootErrorBoundary>
  </React.StrictMode>
);
