import React, { useState, useEffect } from 'react';
import { GameProvider } from './context/GameContext';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/ToastContainer';
import { SysLogo } from './components/SysLogo';
import { MobileAuthModal } from './components/MobileAuthModal';
import { BottomMobileNav } from './components/BottomMobileNav';

// Page components
import LoginPage from './app/login/page';
import TebakGamePage from './app/game/tebak/page';
import SpinnerGamePage from './app/game/spinner/page';
import BlindboxGamePage from './app/game/blindbox/page';
import ProfilePage from './app/profile/page';
import LeaderboardPage from './app/leaderboard/page';
import ReferralPage from './app/referral/page';
import RoomArenaPage from './app/room/[id]/page';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash) return hash;
      const pathname = window.location.pathname;
      if (pathname && pathname !== '/') return pathname;
    }
    return '/game/tebak';
  });

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setCurrentPath(hash);
      } else {
        setCurrentPath(window.location.pathname || '/game/tebak');
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
    '/game/tebak',
    '/game/spinner',
    '/game/blindbox',
    '/profile',
    '/leaderboard',
    '/referral',
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

    if (
      protectedPaths.some(path => currentPath === path || currentPath.startsWith(path + '/')) &&
      !isAuthenticated
    ) {
      return <LoginPage navigate={navigate} />;
    }

    if (currentPath === '/game/spinner') {
      return <SpinnerGamePage />;
    }
    if (currentPath === '/game/blindbox') {
      return <BlindboxGamePage />;
    }
    if (currentPath === '/profile') {
      return <ProfilePage />;
    }
    if (currentPath === '/leaderboard') {
      return <LeaderboardPage />;
    }
    if (currentPath === '/referral') {
      return <ReferralPage />;
    }
    if (currentPath.startsWith('/room')) {
      const roomId = currentPath.replace('/room/', '').replace('/room', '');
      return <RoomArenaPage roomId={roomId || 'ROOM-777'} navigate={navigate} />;
    }
    // Default to Tebak
    return <TebakGamePage />;
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

        {/* Quiet Editorial Footer */}
        <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 text-xs text-slate-400">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center">
              <SysLogo size="sm" showText={true} />
            </div>

            <div className="text-slate-400">
              © 2026 SYS STREAM. Provably Fair Protocol.
            </div>
          </div>
        </footer>
      </div>
    </GameProvider>
  );
}
