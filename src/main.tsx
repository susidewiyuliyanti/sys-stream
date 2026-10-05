import React, { lazy, Suspense, Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { LanguageProvider } from './i18n';
import UserApp from './App.tsx';

const hostname = typeof window !== 'undefined'
  ? window.location.hostname.toLowerCase()
  : '';

const RECOVERY_KEY = '__sysstream_bundle_recovery';

function lazyWithBundleRecovery<T extends React.ComponentType<any>>(loader: () => Promise<{ default: T }>) {
  return lazy(async () => {
    try {
      return await loader();
    } catch (error) {
      // Recover once from a stale admin/airdrop chunk after a production deployment.
      if (!sessionStorage.getItem(RECOVERY_KEY)) {
        sessionStorage.setItem(RECOVERY_KEY, '1');
        const url = new URL(window.location.href);
        url.searchParams.set('__sysstream_reload', String(Date.now()));
        window.location.replace(url.toString());
      }
      throw error;
    }
  });
}

const AdminApp = lazyWithBundleRecovery(() => import('./admin/AdminApp.tsx'));
const AirdropApp = lazyWithBundleRecovery(() => import('./airdrop/AirdropApp.tsx'));

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
      sessionStorage.removeItem(RECOVERY_KEY);
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      }
    } catch {}

    const url = new URL(window.location.href);
    url.searchParams.set('__sysstream_reload', String(Date.now()));
    window.location.replace(url.toString());
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
