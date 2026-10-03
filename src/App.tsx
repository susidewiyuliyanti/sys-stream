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
import MiningPage from './app/game/mining/page';
import SpinnerGamePage from './app/game/spinner/page';
import TebakGamePage from './app/game/tebak/page';
import ProfilePage from './app/profile/page';
import DashboardPage from './app/dashboard/page';
import RoomPage from './app/room/[id]/page';
import ReferralPage from './app/referral/page';

function AirdropRedirect() {
  useEffect(() => {
    window.location.replace('https://airdrop.sysstreamer.asia');
  }, []);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="text-sm text-slate-400">Membuka SYS STREAM Airdrop...</div>
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

        {/* Global Mobile Auth Modal */}
        <MobileAuthModal />

        {/* Global Bottom Mobile Navigation Bar */}
        <BottomMobileNav currentPath={currentPath} navigate={navigate} />

        {/* Global Toast Alerts */}
        <ToastContainer />

        {/* About Us + Legal Footer */}
        <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 text-xs text-slate-500">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 mb-7">
              <div>
                <div className="text-sm font-black text-slate-200 mb-2">About Us</div>
                <p className="leading-5">SYS STREAM adalah platform live, social interaction, dan game/event yang menghubungkan streamer dengan komunitas secara real-time.</p>
              </div>
              <div>
                <div className="text-sm font-black text-slate-200 mb-2">Official Streamer Partner</div>
                <p className="leading-5">SYS STREAM bekerja sama dengan streamer terpilih. Official Streamer Partner menggunakan akun platform mereka untuk membuat dan mengelola room sesuai hak akses yang diberikan.</p>
              </div>
              <div>
                <div className="text-sm font-black text-slate-200 mb-2">Untuk Streamer</div>
                <p className="leading-5">Streamer yang ingin bekerja sama dengan SYS STREAM dapat menghubungi tim platform untuk proses seleksi dan kerja sama.</p>
              </div>
            </div>
            <div className="border-t border-slate-900 pt-5 flex flex-wrap items-center justify-center gap-5">
              <span>© {new Date().getFullYear()} SYS STREAM</span>
              <span className="text-slate-700">•</span>
              <a href="#/terms" className="hover:text-cyan-400 transition-colors">Terms &amp; Conditions</a>
              <span className="text-slate-700">•</span>
              <a href="#/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
            </div>
          </div>
        </footer>
      </div>
    </GameProvider>
  );
}
