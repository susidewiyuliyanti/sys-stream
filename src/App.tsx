import React, { Component, lazy, Suspense, useState, useEffect } from 'react';
import { useLanguage } from './i18n';
import { GameProvider } from './context/GameContext';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/ToastContainer';
import { MobileAuthModal } from './components/MobileAuthModal';
import { BottomMobileNav } from './components/BottomMobileNav';
import StreamerModule from './components/streamer/StreamerModule';
import AIChat from './components/AIChat';

// Keep the initial mobile bundle small. Route-specific pages are loaded only
// when the user opens that route instead of shipping every game/dashboard
// module to the phone on first load.
const LoginPage = lazy(() => import('./app/login/page'));
const VerifyEmailPage = lazy(() => import('./app/auth/verify-email/page'));
const TermsPage = lazy(() => import('./app/terms/page'));
const PrivacyPage = lazy(() => import('./app/privacy/page'));
const BlindboxGamePage = lazy(() => import('./app/game/blindbox/page'));
const MiningPage = lazy(() => import('./app/game/mining/page'));
const SpinnerGamePage = lazy(() => import('./app/game/spinner/page'));
const TebakGamePage = lazy(() => import('./app/game/tebak/page'));
const ProfilePage = lazy(() => import('./app/profile/page'));
const DashboardPage = lazy(() => import('./app/dashboard/page'));
const RoomPage = lazy(() => import('./app/room/[id]/page'));
const ReferralPage = lazy(() => import('./app/referral/page'));

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

function RouteLoading() {
  return (
    <div className="min-h-[40vh] w-full flex items-center justify-center px-4">
      <div className="text-sm text-slate-400">Loading...</div>
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
      if (hash) setCurrentPath(hash);
      else setCurrentPath(window.location.pathname || '/login');
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
    '/game/blindbox', '/game/mining', '/game/spinner', '/game/tebak',
    '/profile', '/dashboard', '/airdrop', '/referral', '/room',
  ];

  useEffect(() => {
    if (
      protectedPaths.some(path => currentPath === path || currentPath.startsWith(path + '/')) &&
      !isAuthenticated
    ) {
      navigate('/login');
    }
  }, [currentPath, isAuthenticated]);

  const renderCurrentView = () => {
    if (currentPath === '/login') return <LoginPage navigate={navigate} />;
    if (currentPath === '/verify-email' || currentPath.startsWith('/verify-email?')) {
      return <VerifyEmailPage navigate={navigate} />;
    }
    if (currentPath === '/terms') return <TermsPage navigate={navigate} />;
    if (currentPath === '/privacy') return <PrivacyPage navigate={navigate} />;

    if (
      protectedPaths.some(path => currentPath === path || currentPath.startsWith(path + '/')) &&
      !isAuthenticated
    ) {
      return <LoginPage navigate={navigate} />;
    }

    if (currentPath === '/dashboard' || currentPath === '/room') {
      return <DashboardPage navigate={navigate} />;
    }
    if (currentPath === '/airdrop') return <AirdropRedirect />;
    if (currentPath === '/referral') return <ReferralPage />;
    if (currentPath.startsWith('/room/')) {
      const roomId = decodeURIComponent(currentPath.slice('/room/'.length)) || 'main';
      return <RoomPage roomId={roomId} navigate={navigate} />;
    }
    if (currentPath === '/game/blindbox') return <BlindboxGamePage />;
    if (currentPath === '/game/mining') return <MiningPage />;
    if (currentPath === '/game/spinner') return <SpinnerGamePage />;
    if (currentPath === '/game/tebak') return <TebakGamePage />;
    if (currentPath === '/profile') return <ProfilePage />;

    return <LoginPage navigate={navigate} />;
  };

  return (
    <GameProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
        <Navbar currentPath={currentPath} navigate={navigate} />
        <main className="flex-1 w-full pb-16">
          <Suspense fallback={<RouteLoading />}>
            {renderCurrentView()}
          </Suspense>
        </main>
        <footer className="border-t border-slate-800 mt-12">
          <div className="max-w-7xl mx-auto px-4 py-6 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3">
            <span>SYS STREAM</span>
            <a href="mailto:support@sysstreamer.asia" className="text-slate-400 hover:text-amber-400 transition-colors">support@sysstreamer.asia</a>
          </div>
        </footer>
        <MobileAuthModal />
        <BottomMobileNav currentPath={currentPath} navigate={navigate} />
        <ToastContainer />
        <AIChat />
        <StreamerModule />
      </div>
    </GameProvider>
  );
}
