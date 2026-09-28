import React, {
  useState,
  useEffect
} from 'react';

import {
  GameTab,
  BackgroundMode,
  PlayerScore,
  UserProfile
} from './types';

import { Navbar } from './components/Navbar';
import { TebakNomorSeri } from './components/TebakNomorSeri';
import { LuckyWheel } from './components/LuckyWheel';
import { LeaderboardModal } from './components/LeaderboardModal';
import { BroadcastTicker } from './components/BroadcastTicker';
import LoginScreen from './components/LoginScreen';
import { VipHostManagerModal } from './components/VipHostManagerModal';
import { UserProfileModal } from './components/UserProfileModal';
import { LeaderboardPage } from './components/LeaderboardPage';
import { ReferralAffiliateModal } from './components/ReferralAffiliateModal';
import { SysLogo } from './components/SysLogo';
import { BlindBoxDashboard } from './components/blindbox/BlindBoxDashboard';
import { OwnerAdminDashboard } from './components/OwnerAdminDashboard';
import { StreamMasterDashboard } from './components/StreamMasterDashboard';

import {
  getCurrentUser,
  logoutUser,
  updateUserProfile,

  type AuthUser
} from './lib/auth';

import { sound } from './services/sound';

import {
  Banknote,
  X,
  ArrowLeft
} from 'lucide-react';

import { isOwnerUser } from './utils/memberBadge';

const INITIAL_PLAYERS: PlayerScore[] = [];

export default function App() {
  // Firebase Auth & Member Subscription State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [saldo, setSaldo] = useState<number>(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
  try {
    const saved = localStorage.getItem('sys_stream_auth_user');

    if (saved) {
      const parsed = JSON.parse(saved);

      if (parsed && typeof parsed === 'object') {
        return parsed as UserProfile;
      }
    }
  } catch (error) {
    console.warn('Could not restore saved auth user:', error);
  }

  return null;
});
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [showVipManagerModal, setShowVipManagerModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showReferralModal, setShowReferralModal] = useState<boolean>(false);

  // Navigation & Screen Modes
  const [activeTab, setActiveTab] = useState<GameTab>('tebak-seri');
  const [bgMode, setBgMode] = useState<BackgroundMode>('transparent');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showBlindBoxStandalone, setShowBlindBoxStandalone] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'streammaster' | 'admin-owner' | 'obs-overlay'>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('overlay') === '1') return 'obs-overlay';
    } catch {}
    return 'streammaster';
  });

  // Prize Nominal (Rp 50.000 Default Aktif)
  const [activePrizeNominal, setActivePrizeNominal] = useState<number>(() => {
    const saved = localStorage.getItem('ls_prize_nominal');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (parsed > 0) return parsed;
    }
    return 50000;
  });

  // Leaderboard Players State (Default Kosong, diisi masing-masing user)
  const [players, setPlayers] = useState<PlayerScore[]>(() => {
    const saved = localStorage.getItem('ls_leaderboard_players');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Jika data lama berisi mock template dummy (@budi_live), kosongkan sesuai permintaan user
        if (Array.isArray(parsed) && parsed.some(p => p.id === 'p-1' || p.name === '@budi_live')) {
          localStorage.removeItem('ls_leaderboard_players');
          return [];
        }
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return INITIAL_PLAYERS;
  });

  // Modals
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);

  // Instant login for Host / Owner (allows direct access on Vercel without waiting for Firebase setup)
  const handleHostInstantLogin = (customName?: string, customEmail?: string) => {
    const email = customEmail?.trim() || 'susidewiyuliyanti@gmail.com';
    const isOwner = email.toLowerCase() === 'susidewiyuliyanti@gmail.com';
    const ownerProfile: UserProfile = {
      uid: isOwner ? 'owner-susidewi-vip' : `host-${Date.now().toString(36)}`,
      email: email,
      displayName: customName || (isOwner ? 'Susi Dewi Yuliyanti (Owner)' : 'Streamer Host'),
      photoURL: '',
      referralCode: isOwner ? 'SYS-SUSI99' : `SYS-${Date.now().toString(36).slice(-4).toUpperCase()}`,
      referralCount: 0,
      walletBalance: 15000, // Bonus pendaftaran Rp 15.000
      affiliateEarnings: 0,
      affiliateWithdrawn: 0,
      isSubscribed: isOwner,
      subscriptionPlan: isOwner ? 'Sultan VIP Host (Owner Permanen)' : 'none',
      subscriptionExpiresAt: isOwner ? 'LIFETIME' : '',
      isLifetime: isOwner,
      role: isOwner ? 'admin' : 'member',
      ...(isOwner ? { subscribedAt: new Date().toISOString() } : {}),
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('sys_streamer_emergency_user', JSON.stringify(ownerProfile));
    setUserProfile(ownerProfile);
  };

 // Cloudflare API Authentication & PostgreSQL Profile Sync
useEffect(() => {
  let mounted = true;

  const loadAuthenticatedUser = async () => {
    try {
      setAuthLoading(true);

      const user = await getCurrentUser();

      if (!mounted) return;

      if (!user) {
        setCurrentUser(null);
        setUserProfile(null);
        setSaldo(0);

        try {
          localStorage.removeItem('sys_stream_auth_user');
          localStorage.removeItem('sys_streamer_emergency_user');
        } catch {}

        return;
      }

      // Backend API user
      setCurrentUser(user);

      const profile: UserProfile = {
        ...(user as any),

        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',

        referralCode: user.referralCode || '',
        referralCount: Number(user.referralCount || 0),

        saldo: Number(
          user.saldo ??
          user.walletBalance ??
          0
        ),

        walletBalance: Number(
          user.walletBalance ??
          user.saldo ??
          0
        ),

        lockedSaldo: Number(user.lockedSaldo || 0),

        affiliateEarnings: Number(
          user.affiliateEarnings || 0
        ),

        affiliateWithdrawn: Number(
          user.affiliateWithdrawn || 0
        ),

        isSubscribed: Boolean(user.isSubscribed),

        subscriptionPlan:
          user.subscriptionPlan || 'none',

        subscriptionExpiresAt:
          user.subscriptionExpiresAt || '',

        isLifetime:
          Boolean(user.isLifetime),

        role:
          user.role || 'member',

        isBanned:
          Boolean(user.isBanned),

        createdAt:
          user.createdAt || new Date().toISOString(),

        updatedAt:
          user.updatedAt || new Date().toISOString()
      };

      setUserProfile(profile);

      const currentBalance = Number(
        profile.saldo ??
        profile.walletBalance ??
        0
      );

      setSaldo(currentBalance);

      // Simpan profile terbaru untuk pemulihan UI.
      try {
        localStorage.setItem(
          'sys_stream_auth_user',
          JSON.stringify(profile)
        );
      } catch (storageError) {
        console.warn(
          'Could not save auth user:',
          storageError
        );
      }
    } catch (error) {
      console.error(
        'Cloudflare authentication check failed:',
        error
      );

      if (!mounted) return;

      setCurrentUser(null);
      setUserProfile(null);
      setSaldo(0);

      try {
        localStorage.removeItem('sys_stream_auth_user');
      } catch {}
    } finally {
      if (mounted) {
        setAuthLoading(false);
      }
    }
  };

  loadAuthenticatedUser();

  return () => {
    mounted = false;
  };
}, []);

  // Persist prize nominal & players
  useEffect(() => {
    localStorage.setItem('ls_prize_nominal', activePrizeNominal.toString());
  }, [activePrizeNominal]);

  useEffect(() => {
    localStorage.setItem('ls_leaderboard_players', JSON.stringify(players));
  }, [players]);

  // Listen for deposit approval event to update user balance instantly across all screens/modals
  useEffect(() => {
    const handleBalanceApproved = (e: any) => {
      const detail = e?.detail;
      if (!detail) return;
      setUserProfile((prev) => {
        if (!prev) return prev;
        const matchesUid = prev.uid === detail.userId;
        const matchesEmail = prev.email && detail.userEmail && prev.email.toLowerCase() === detail.userEmail.toLowerCase();
        if (matchesUid || matchesEmail) {
          setSaldo(detail.newBalance);
          return { ...prev, saldo: detail.newBalance, walletBalance: detail.newBalance };
        }
        return prev;
      });
    };

    window.addEventListener('sys_user_balance_approved', handleBalanceApproved);
    return () => {
      window.removeEventListener('sys_user_balance_approved', handleBalanceApproved);
    };
  }, []);

 // Refresh authenticated user from Cloudflare API
useEffect(() => {
  if (!userProfile) return;

  let cancelled = false;

  const refreshSession = async () => {
    try {
      const currentUser = await getCurrentUser();

      if (cancelled || !currentUser) return;

      try {
        localStorage.setItem(
          'sys_stream_auth_user',
          JSON.stringify(currentUser)
        );
      } catch {}

      // Compatibility token untuk kode lama.
      const token = localStorage.getItem('sys_stream_auth_token');

      if (token) {
        localStorage.setItem('blindbox_jwt_token', token);
      }
    } catch (error) {
      console.warn(
        'Cloudflare session refresh failed:',
        error
      );
    }
  };

  refreshSession();

  return () => {
    cancelled = true;
  };
}, [userProfile?.uid]);

  // Update Prize Nominal
  const handleUpdatePrizeNominal = (nominal: number) => {
    setActivePrizeNominal(nominal);
  };

  // Toggle Sound Mute
  const handleToggleMute = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  };

  // Score Update (from Tebak No Seri)
  const handleScoreUpdate = (points: number, rupiah: number, playerName?: string) => {
    const targetName = playerName?.trim() || (players.length > 0 ? players[0].name : '@penonton_live');

    setPlayers((prev) => {
      const existingIdx = prev.findIndex((p) => p.name.toLowerCase() === targetName.toLowerCase());
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          score: Math.max(0, updated[existingIdx].score + points),
          rupiah: Math.max(0, updated[existingIdx].rupiah + rupiah),
          lastWin: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        };
        return updated;
      } else {
        const newPlayer: PlayerScore = {
          id: `p-${Date.now()}`,
          name: targetName,
          score: Math.max(0, points),
          rupiah: Math.max(0, rupiah),
          lastWin: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        };
        return [newPlayer, ...prev];
      }
    });

    // If winner matches the current user or host, credit the unified wallet
    if (userProfile && rupiah > 0) {
      const cleanName = targetName.toLowerCase().replace('@', '');
      const userDisplay = (userProfile.displayName || '').toLowerCase().replace('@', '');
      const userEmail = (userProfile.email || '').toLowerCase();
      if (cleanName === userDisplay || cleanName === userEmail || cleanName.includes('host') || cleanName.includes('susi')) {
        const newBal = (userProfile.walletBalance ?? 15000) + rupiah;
        setUserProfile((prev) => prev ? { ...prev, walletBalance: newBal } : prev);
        updateUserProfile(userProfile.uid, {
  walletBalance: newBal,
  saldo: newBal
}).catch((error) => {
  console.warn(
    'Failed to update wallet through API:',
    error
   );
  });
}
}
};

  // Award prize from Lucky Wheel
const handleAwardPrize = (playerName: string, rupiah: number) => {
  setPlayers((prev) => {
    const existingIdx = prev.findIndex(
      (p) => p.name.toLowerCase() === playerName.toLowerCase()
    );

    if (existingIdx !== -1) {
      const updated = [...prev];

      updated[existingIdx] = {
        ...updated[existingIdx],
        score: updated[existingIdx].score + 10,
        rupiah: updated[existingIdx].rupiah + rupiah,
        lastWin: 'Lucky Wheel'
      };

      return updated;
    }

    return [
      {
        id: `p-${Date.now()}`,
        name: playerName,
        score: 10,
        rupiah,
        lastWin: 'Lucky Wheel'
      },
      ...prev
    ];
  });

  // Credit unified wallet
  if (userProfile && rupiah > 0) {
    const cleanName = playerName
      .toLowerCase()
      .replace('@', '');

    const userDisplay = (userProfile.displayName || '')
      .toLowerCase()
      .replace('@', '');

    const userEmail = (userProfile.email || '')
      .toLowerCase();

    if (
      cleanName === userDisplay ||
      cleanName === userEmail ||
      cleanName.includes('host') ||
      cleanName.includes('susi')
    ) {
      const currentBalance = Number(
        userProfile.walletBalance ??
        userProfile.saldo ??
        0
      );

      const newBal = currentBalance + rupiah;

      setUserProfile((prev) =>
        prev
          ? {
              ...prev,
              walletBalance: newBal,
              saldo: newBal
            }
          : prev
      );

      setSaldo(newBal);

      updateUserProfile(userProfile.uid, {
        walletBalance: newBal,
        saldo: newBal
      }).catch((error) => {
        console.warn(
          'Failed to synchronize wallet:',
          error
        );
      });
    }
  }
};

  // Leaderboard management
  const handleAddPlayer = (name: string) => {
    setPlayers((prev) => [
      {
        id: `p-${Date.now()}`,
        name,
        score: 0,
        rupiah: 0
      },
      ...prev
    ]);
  };

  const handleDeletePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAdjustScore = (id: string, pointDelta: number, rupiahDelta: number) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              score: Math.max(0, p.score + pointDelta),
              rupiah: Math.max(0, p.rupiah + rupiahDelta)
            }
          : p
      )
    );
  };

  const handleResetAllScores = () => {
    setPlayers([]);
    localStorage.removeItem('ls_leaderboard_players');
  };

  // Logout handler
const handleLogout = async () => {
  try {
    await logoutUser();
  } catch (error) {
    console.warn(
      'Backend logout request failed:',
      error
    );
  } finally {
    try {
      localStorage.removeItem(
        'sys_stream_auth_token'
      );

      localStorage.removeItem(
        'sys_stream_auth_user'
      );

      localStorage.removeItem(
        'sys_streamer_emergency_user'
      );

      localStorage.removeItem(
        'blindbox_jwt_token'
      );

      sessionStorage.clear();
    } catch {}

    setShowProfileModal(false);
    setShowVipManagerModal(false);
    setShowReferralModal(false);
    setIsLeaderboardOpen(false);

    setCurrentUser(null);
    setUserProfile(null);
    setSaldo(0);
  }
};

  // Get active tab display title
  const getTabTitle = () => {
    switch (activeTab) {
      case 'tebak-seri':
        return 'Guess Banknote Serial (3D)';
      case 'spinner-roda':
        return 'Lucky Prize Wheel';
      case 'blind-box-deposit':
        return '🎁 "Blind Box Game" Win BIG';
      case 'leaderboard':
        return 'Streamer Leaderboard & Prizes';
      default:
        return 'Live Broadcast Game';
    }
  };

  // Background styling classes
  const getBackgroundClass = () => {
    switch (bgMode) {
      case 'chroma-green':
        return 'bg-[#00FF00]';
      case 'studio-dark':
        return 'bg-[#090d16]';
      case 'transparent':
      default:
        return 'bg-black/75'; // rgba(0, 0, 0, 0.75) transparent overlay for OBS camera
    }
  };

  // Standalone Blind Box 3D Game view (accessible directly)
  if (showBlindBoxStandalone) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <div className="max-w-5xl mx-auto px-4 pt-4 flex justify-between items-center">
          <button
            onClick={() => setShowBlindBoxStandalone(false)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all shadow-md cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to SYS Live Stream Suite</span>
          </button>
        </div>
        <BlindBoxDashboard
          userProfile={userProfile}
          onUpdateWalletBalance={(newBal) => {
            setSaldo(newBal);
            setUserProfile((prev) => (prev ? { ...prev, saldo: newBal, walletBalance: newBal } : prev));
          }}
          onOpenAppProfile={() => setShowProfileModal(true)}
          onOpenAppAuth={() => {
            setShowBlindBoxStandalone(false);
          }}
          onLogoutApp={handleLogout}
        />
      </div>
    );
  }

  // 1. Loading screen while Cloudflare API checks session
  if (authLoading && !userProfile) {
    return (
      <div className="min-h-screen w-full bg-[#090d16] text-white flex flex-col items-center justify-center p-4 font-['Poppins']">
        <div className="mb-4">
          <SysLogo size="lg" showText={true} />
        </div>
        <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-white/60 font-semibold tracking-wide">
          Verifying SYS Streamer Authentication & Session...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated: Show Login Screen
  if (!userProfile) {
    return (
      <LoginScreen
        onViewPricing={() => {}}
        onHostInstantLogin={handleHostInstantLogin}
        onOpenBlindBoxGame={() => setShowBlindBoxStandalone(true)}
        onLoginSuccess={(profile) => {
          if (profile) {
            setUserProfile(profile);
          }
        }}
      />
    );
  }

  // 2.5 Authenticated but BANNED by Owner susidewiyuliyanti@gmail.com
  if (userProfile?.isBanned) {
    return (
      <div className="min-h-screen w-full bg-[#090d16] text-white flex flex-col items-center justify-center p-6 text-center font-['Poppins']">
        <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center text-2xl shadow-xl shadow-red-500/20 mb-4 animate-pulse">
          🚫
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-red-400 tracking-wide mb-2">
          ACCOUNT SUSPENDED / BANNED
        </h2>
        <p className="text-sm text-white/70 max-w-md mb-2">
          Google Account (<span className="text-white font-mono">{userProfile.email}</span>) has been banned by the Administrator (<span className="text-amber-300 font-mono">susidewiyuliyanti@gmail.com</span>).
        </p>
        {userProfile.bannedReason && (
          <div className="px-4 py-2 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 font-medium mb-5 max-w-md">
            Reason: {userProfile.bannedReason}
          </div>
        )}
        <button
          onClick={handleLogout}
          className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Log Out & Use Another Account</span>
        </button>
      </div>
    );
  }

  // 3. Khusus untuk tampilan dashboard Owner ("susidewiyuliyanti@gmail.com") & Admin jika memilih viewMode === 'admin-owner':
  if ((isOwnerUser(userProfile.email) || userProfile.role === 'admin') && viewMode === 'admin-owner') {
    return (
      <OwnerAdminDashboard
        currentUserProfile={userProfile}
        onLogout={handleLogout}
        onSwitchToStreamMaster={() => setViewMode('streammaster')}
      />
    );
  }

  // 3.5 Mode OBS Studio Browser Source Overlay (?overlay=1)
  if (viewMode === 'obs-overlay') {
    return (
      <div
        className={`min-h-screen flex flex-col justify-between text-white transition-colors duration-300 font-['Inter',sans-serif] ${getBackgroundClass()}`}
        style={{
          backgroundColor:
            bgMode === 'transparent'
              ? 'rgba(0, 0, 0, 0.75)'
              : bgMode === 'chroma-green'
              ? '#00FF00'
              : '#090d16'
        }}
      >
        <div className="p-3 bg-black/80 flex items-center justify-between text-xs border-b border-white/10">
          <span className="font-bold text-amber-300">OBS Overlay Mode Active</span>
          <button
            onClick={() => setViewMode('streammaster')}
            className="px-3 py-1 rounded bg-[#FE2C55] text-white font-bold cursor-pointer"
          >
            Buka Dashboard Seller
          </button>
        </div>
        <Navbar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          bgMode={bgMode}
          onChangeBgMode={setBgMode}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          activePrizeNominal={activePrizeNominal}
          players={players}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          userProfile={userProfile}
          saldo={saldo}
          onLogout={handleLogout}
          onOpenVipManager={() => setShowVipManagerModal(true)}
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenReferral={() => setShowReferralModal(true)}
        />
        <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 overflow-x-hidden">
          {activeTab === 'tebak-seri' && (
            <TebakNomorSeri
              onScoreUpdate={handleScoreUpdate}
              activePrizeNominal={activePrizeNominal}
              players={players}
              onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
              userProfile={userProfile}
              onUpdateWalletBalance={(newBal) => {
                setSaldo(newBal);
                setUserProfile((prev) => (prev ? { ...prev, saldo: newBal, walletBalance: newBal } : prev));
              }}
              onOpenProfile={() => setShowProfileModal(true)}
            />
          )}
          {activeTab === 'spinner-roda' && (
            <LuckyWheel
              onAwardPrize={handleAwardPrize}
              activePrizeNominal={activePrizeNominal}
              onUpdatePrizeNominal={handleUpdatePrizeNominal}
              players={players}
              userProfile={userProfile}
              onUpdateWalletBalance={(newBal) => {
                setSaldo(newBal);
                setUserProfile((prev) => (prev ? { ...prev, saldo: newBal, walletBalance: newBal } : prev));
              }}
              onOpenProfile={() => setShowProfileModal(true)}
            />
          )}
          {activeTab === 'blind-box-deposit' && (
            <div className="w-full">
              <BlindBoxDashboard
                userProfile={userProfile}
                onUpdateWalletBalance={(newBal) => {
                  setSaldo(newBal);
                  setUserProfile((prev) => (prev ? { ...prev, saldo: newBal, walletBalance: newBal } : prev));
                }}
                onOpenAppProfile={() => setShowProfileModal(true)}
                onOpenAppAuth={() => setShowProfileModal(true)}
                onLogoutApp={handleLogout}
              />
            </div>
          )}
        </main>
        <BroadcastTicker
          players={players}
          activePrizeNominal={activePrizeNominal}
          activeGameTitle={getTabTitle()}
        />
      </div>
    );
  }

  // 4. Modern StreamMaster Interactive Games SaaS Dashboard for TikTok/Shopee Live sellers
  return (
    <>
      <StreamMasterDashboard
        userProfile={userProfile}
        saldo={saldo}
        players={players}
        onScoreUpdate={handleScoreUpdate}
        onAwardPrize={handleAwardPrize}
        onUpdatePrizeNominal={handleUpdatePrizeNominal}
        activePrizeNominal={activePrizeNominal}
        onUpdateWalletBalance={(newBal) => {
          setSaldo(newBal);
          setUserProfile((prev) => (prev ? { ...prev, saldo: newBal, walletBalance: newBal } : prev));
        }}
        onLogout={handleLogout}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenReferral={() => setShowReferralModal(true)}
        onOpenVipManager={() => setShowVipManagerModal(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onSwitchToOwnerDashboard={() => setViewMode('admin-owner')}
      />

      {/* Papan Skor Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        players={players}
        onAddPlayer={handleAddPlayer}
        onDeletePlayer={handleDeletePlayer}
        onAdjustScore={handleAdjustScore}
        onResetAllScores={handleResetAllScores}
      />

      {/* Modal Profil Streamer, Ganti Foto, Riwayat Transaksi & Streaming */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userProfile={userProfile}
        saldo={saldo}
        onLogout={handleLogout}
        onOpenReferral={() => {
          setShowProfileModal(false);
          setShowReferralModal(true);
        }}
      />

      {/* Modal Program Hadiah Referral & Affiliate */}
      <ReferralAffiliateModal
        isOpen={showReferralModal}
        onClose={() => setShowReferralModal(false)}
        userProfile={userProfile}
      />

      {/* Modal Kelola Akun Sultan VIP Host (Owner & VIPs) */}
      <VipHostManagerModal
        isOpen={showVipManagerModal}
        onClose={() => setShowVipManagerModal(false)}
        currentUserProfile={userProfile}
      />
    </>
  );
}


