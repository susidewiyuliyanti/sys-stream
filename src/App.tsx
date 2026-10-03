import React, { Component, useState, useEffect } from 'react';
import { GameProvider } from './context/GameContext';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/ToastContainer';
import { MobileAuthModal } from './components/MobileAuthModal';
import { BottomMobileNav } from './components/BottomMobileNav';

// Page components
import LoginPage from './app/login/page';
import VerifyEmailPage from './app/auth/verify-email/page';
import TermsPage from './app/terms/page';
import PrivacyPage from './app/privacy/page';
import BlindboxGamePage from './app/game/blindbox/page';
import SpinnerGamePage from './app/game/spinner/page';
import TebakGamePage from './app/game/tebak/page';
import ProfilePage from './app/profile/page';
import DashboardPage from './app/dashboard/page';
import RoomPage from './app/room/[id]/page';
import AirdropApp from './airdrop/AirdropApp';
import ReferralPage from './app/referral/page';

class AirdropErrorBoundary extends Component<React.PropsWithChildren, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Airdrop page runtime error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-slate-900 p-6 text-center">
            <div className="text-lg font-black text-white">Airdrop gagal dimuat</div>
            <p className="mt-2 text-sm text-slate-400">
              Halaman Airdrop mengalami error saat dimuat. Silakan buka kembali Airdrop dari Dashboard.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-black text-slate-950"
            >
              Muat Ulang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash) return hash;
      const pathname = window.location.pathname;
      if (pathname && pathname !== '/') return pathname;
    }
    return '/login';
  });

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setCurrentPath(hash);
      } else {
        setCurrentPath(window.location.pathname || '/login');
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigate = (path: string) => {
    setCurrentPath(path);
    window.location.hash = path;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAuthenticated = Boolean(
    typeof window !== 'undefined' && localStorage.getItem('sys_stream_auth_token')
  );

  const protectedPaths = [
    '/game/blindbox',
    '/game/spinner',
    '/game/tebak',
    '/profile',
    '/dashboard',
    '/airdrop',
    '/referral',
    '/room',
  ];

  useEffect(() => {
    if (protectedPaths.some(path => currentPath === path || currentPath.startsWith(path + '/')) && !isAuthenticated) {
      navigate('/login');
    }
  }, [currentPath, isAuthenticated]);

  const renderCurrentView = () => {
    if (currentPath === '/login') {
      return <LoginPage navigate={navigate} />;
    }
    if (currentPath === '/verify-email' || currentPath.startsWith('/verify-email?')) {
      return <VerifyEmailPage navigate={navigate} />;
    }
    if (currentPath === '/terms') {
      return <TermsPage navigate={navigate} />;
    }
    if (currentPath === '/privacy') {
      return <PrivacyPage navigate={navigate} />;
    }

    if (
      protectedPaths.some(path => currentPath === path || currentPath.startsWith(path + '/')) &&
      !isAuthenticated
    ) {
      return <LoginPage navigate={navigate} />;
    }

    if (currentPath === '/dashboard' || currentPath === '/room') {
      return <DashboardPage navigate={navigate} />;
    }
    if (currentPath === '/airdrop') {
      return <AirdropErrorBoundary><AirdropApp /></AirdropErrorBoundary>;
    }
    if (currentPath === '/referral') {
      return <ReferralPage />;
    }
    if (currentPath.startsWith('/room/')) {
      const roomId = decodeURIComponent(currentPath.slice('/room/'.length)) || 'main';
      return <RoomPage roomId={roomId} navigate={navigate} />;
    }

    if (currentPath === '/game/blindbox') {
      return <BlindboxGamePage />;
    }
    if (currentPath === '/game/spinner') {
      return <SpinnerGamePage />;
    }
    if (currentPath === '/game/tebak') {
      return <TebakGamePage />;
    }
    if (currentPath === '/profile') {
      return <ProfilePage />;
    }
    // Legacy/demo game routes are intentionally disabled in production.
    // Only server-backed production pages are reachable from the user app.
    return <LoginPage navigate={navigate} />;
  };

  return (
    <GameProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
        {/* Navigation Top Bar */}
        <Navbar currentPath={currentPath} navigate={navigate} />

        {/* Primary Page Canvas */}
        <main className="flex-1 w-full pb-16">
          {renderCurrentView()}
        </main>

        {/* Global Mobile Auth Modal */}
        <MobileAuthModal />

        {/* Global Bottom Mobile Navigation Bar */}
        <BottomMobileNav currentPath={currentPath} navigate={navigate} />

        {/* Global Toast Alerts */}
        <ToastContainer />

        {/* Minimal Legal Footer */}
        <footer className="border-t border-slate-900 bg-slate-950 py-5 px-4 text-xs text-slate-500">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-5">
            <a href="#/terms" className="hover:text-cyan-400 transition-colors">
              Terms &amp; Conditions
            </a>
            <span className="text-slate-700">•</span>
            <a href="#/privacy" className="hover:text-cyan-400 transition-colors">
              Privacy Policy
            </a>
          </div>
        </footer>
      </div>
    </GameProvider>
  );
}
