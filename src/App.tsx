import React, { Component, useState, useEffect } from 'react';
import { useLanguage } from './i18n';
import { GameProvider } from './context/GameContext';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/ToastContainer';
import { MobileAuthModal } from './components/MobileAuthModal';
import { BottomMobileNav } from './components/BottomMobileNav';
import StreamerModule from './components/streamer/StreamerModule';
import AIChat from './components/AIChat';

// Page components
import LoginPage from './app/login/page';
import VerifyEmailPage from './app/auth/verify-email/page';
import TermsPage from './app/terms/page';
import PrivacyPage from './app/privacy/page';
import BlindboxGamePage from './app/game/blindbox/page';
import MiningPage from './app/game/mining/page';
import SpinnerGamePage from './app/game/spinner/page';
import TebakGamePage from './app/game/tebak/page';
import ProfilePage from './app/profile/page';
import DashboardPage from './app/dashboard/page';
import RoomPage from './app/room/[id]/page';
import ReferralPage from './app/referral/page';

function AirdropRedirect() {
  const { t } = useLanguage();
  useEffect(() => {
    window.location.replace('https://airdrop.sysstreamer.asia');
  }, []);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="text-sm text-slate-400">{t('Membuka SYS STREAM Airdrop...')}</div>
    </div>
  );
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
    '/game/mining',
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
      return <AirdropRedirect />;
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
    if (currentPath === '/game/mining') {
      return <MiningPage />;
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

        <footer className="border-t border-slate-800 mt-12">
          <div className="max-w-7xl mx-auto px-4 py-6 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3">
            <span>SYS STREAM</span>
            <a href="mailto:support@sysstreamer.asia" className="text-slate-400 hover:text-amber-400 transition-colors">support@sysstreamer.asia</a>
          </div>
        </footer>

        {/* Global Mobile Auth Modal */}
        <MobileAuthModal />

        {/* Global Bottom Mobile Navigation Bar */}
        <BottomMobileNav currentPath={currentPath} navigate={navigate} />

        {/* Global Toast Alerts */}
        <ToastContainer />

        <AIChat />

        <StreamerModule />
      </div>
    </GameProvider>
  );
}
