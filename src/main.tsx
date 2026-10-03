import React, { lazy, Suspense, Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { LanguageProvider } from './i18n';
import UserApp from './App.tsx';

const hostname = typeof window !== 'undefined'
  ? window.location.hostname.toLowerCase()
  : '';

const AdminApp = lazy(() => import('./admin/AdminApp.tsx'));
const AirdropApp = lazy(() => import('./airdrop/AirdropApp.tsx'));

class RootErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  private reloadWithFreshBundle = () => {
    // A deployment can briefly leave an older HTML document pointing at chunks
    // that no longer exist. A cache-busted reload fetches the newest index/bundles.
    const url = new URL(window.location.href);
    url.searchParams.set('__sysstream_reload', String(Date.now()));
    window.location.replace(url.toString());
  };

  componentDidCatch(error: Error) {
    const key = 'sysstream:bundle-recovery';
    const alreadyRetried = sessionStorage.getItem(key) === '1';

    if (!alreadyRetried) {
      sessionStorage.setItem(key, '1');
      window.setTimeout(() => this.reloadWithFreshBundle(), 50);
    } else {
      sessionStorage.removeItem(key);
    }

    console.error('[SYS STREAM] Application bundle failed to load:', error);
  }

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
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-xs font-bold text-red-300">Detail error</summary>
            <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-black/40 p-3 text-[10px] leading-4 text-red-200">
{this.state.error?.stack || this.state.error?.message || 'Unknown runtime error'}
            </pre>
          </details>
          <button
            type="button"
            onClick={this.reloadWithFreshBundle}
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
