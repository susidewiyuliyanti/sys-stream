import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, BlindboxItem, GameHistoryEntry, CryptoInvoice, LockRecord, CryptoCardConfig } from '../types';
import { sound } from '../lib/sound';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'error' | 'jackpot';
  title: string;
  message: string;
}

interface GameContextType {
  user: UserProfile;
  inventory: BlindboxItem[];
  history: GameHistoryEntry[];
  locks: LockRecord[];
  cryptoCard: CryptoCardConfig;
  viewerList: string[];
  soundEnabled: boolean;
  toasts: Toast[];
  dailyBoxesClaimed: number;
  isLoggedIn: boolean;
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  login: (customName?: string) => void;
  logout: () => void;
  requireAuth: (action: () => void) => boolean;
  updateAvatar: (avatarUrl: string) => void;
  updateUsername: (username: string) => void;
  updateProfile: (username: string, avatarUrl: string) => Promise<boolean>;
  recordEventParticipation: (eventId: string, eventName: string, status?: string) => Promise<boolean>;
  toggleSound: () => void;
  updateCoins: (delta: number) => boolean;
  updateDiamonds: (delta: number) => boolean;
  addGameHistory: (entry: Omit<GameHistoryEntry, 'id' | 'timestamp'>) => void;
  addToInventory: (item: BlindboxItem) => void;
  sellInventoryItem: (itemId: string) => void;
  createLock: (amount: number, durationDays: 30 | 60 | 90) => Promise<boolean>;
  claimDailyLockYield: (lockId: string) => Promise<boolean>;
  unlockEarly: (lockId: string) => Promise<boolean>;
  claimBlindBox: (boxId: string) => Promise<any>;
  claimRegistrationBonus: () => Promise<boolean>;
  refreshFinancialState: () => Promise<boolean>;
  hasActiveLock: () => boolean;
  getTotalLockedUsdt: () => number;
  getDailyBoxQuota: () => number;
  getRemainingDailyBoxes: () => number;
  consumeDailyBoxClaim: () => boolean;
  updateCryptoCard: (cfg: Partial<CryptoCardConfig>) => void;
  addViewer: (name: string) => void;
  removeViewer: (name: string) => void;
  clearViewers: () => void;
  claimDailyBonus: () => boolean;
  claimReferralRewards: () => { coins: number; diamonds: number };
  createCryptoInvoice: (amountUsd: number, currency: string) => Promise<CryptoInvoice>;
  dismissToast: (id: string) => void;
  showToast: (title: string, message: string, type?: Toast['type']) => void;
}

const DEFAULT_USER: UserProfile = {
  id: '',
  username: '',
  avatar: '',
  coins: 0,
  diamonds: 0,
  vipTier: 0,
  referralCode: '',
  walletAddress: '',
  registrationBonusIdr: 0,
  registrationBonusGranted: false,
  totalWon: 0,
  totalBet: 0,
  winStreak: 0,
  bestWin: 0,
};

const INITIAL_INVENTORY: BlindboxItem[] = [];

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    // Never hydrate a previous account when there is no authenticated session.
    // The server session is the source of truth for the active account.
    const token = localStorage.getItem('sys_stream_auth_token');
    if (!token) return DEFAULT_USER;

    try {
      const cached = JSON.parse(localStorage.getItem('sys_stream_profile_cache') || 'null');
      if (cached && (cached.id || cached.walletAddress || cached.username)) {
        return { ...DEFAULT_USER, ...cached };
      }
    } catch {}
    return DEFAULT_USER;
  });

  const [inventory, setInventory] = useState<BlindboxItem[]>(() => {
    const saved = localStorage.getItem('nexus_inventory');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_INVENTORY;
  });

  const [history, setHistory] = useState<GameHistoryEntry[]>(() => {
    const saved = localStorage.getItem('nexus_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // Legacy browser-only locks are intentionally not loaded.
  // Production Locked Balance comes only from the authenticated server user.
  const [locks, setLocks] = useState<LockRecord[]>([]);

  const [cryptoCard, setCryptoCard] = useState<CryptoCardConfig>(() => {
    const saved = localStorage.getItem('nexus_cryptocard');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      cardTitle: 'CYBER SOLANA VAULT CARD',
      serialNumber: 'SN-SOL-2026-8941',
      network: 'Solana Virtual Machine L1',
      rarity: 'Legendary',
      digits: [7, 4, 2, 9],
      concealed: [false, true, true, false], // 4 numbers, 2 concealed
      streamerNote: 'Guess the 2 middle hidden digits! High payout on exact match.',
    };
  });

  const [viewerList, setViewerList] = useState<string[]>(() => {
    const saved = localStorage.getItem('nexus_viewers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pendingInvoices, setPendingInvoices] = useState<CryptoInvoice[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('sys_stream_auth_token'));
  });
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);

  const refreshFinancialState = async (): Promise<boolean> => {
    const token = localStorage.getItem('sys_stream_auth_token');
    if (!token) return false;

    try {
      // Production source of truth: authenticated user record.
      // Do not read the legacy /api/locks endpoint or browser-only lock cache.
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.success || !data?.user) {
        throw new Error(data?.error || 'Gagal mengambil saldo.');
      }

      const remote = data.user;
      const balance = Number(remote.balance || 0);
      const lockedBalance = Number(remote.lockedBalance || 0);

      setUser(prev => ({
        ...prev,
        id: String(remote.id || prev.id),
        username: remote.username || remote.displayName || prev.username,
        avatar: remote.avatarUrl || prev.avatar || '',
        referralCode: remote.referralCode || prev.referralCode || '',
        walletAddress: remote.walletAddress || prev.walletAddress || '',
        registrationBonusIdr: Number(remote.registrationBonusIdr ?? prev.registrationBonusIdr ?? 0),
        registrationBonusGranted: Boolean(remote.registrationBonusGranted ?? prev.registrationBonusGranted),
        coins: Math.round(balance * 100),
        lockedBalance,
      }));

      // Production lock source of truth is /api/deposits.
      // Do not call the legacy /api/locks endpoint: it belongs to the old lock schema.
      try {
        const depositsResponse = await fetch('/api/deposits', {
          credentials: 'include',
          headers: { Authorization: `Bearer ${token}` },
        });
        const depositsData = await depositsResponse.json().catch(() => ({}));
        if (depositsResponse.ok && depositsData?.success && Array.isArray(depositsData?.deposits)) {
          setDailyBoxesClaimed(depositsData.hasClaimedToday ? 1 : 0);
          setLocks(depositsData.deposits.map((d: any) => {
            const start = new Date(d.startDate || 0).getTime();
            const end = new Date(d.endDate || 0).getTime();
            const amount = Number(d.amount || 0);
            return {
              id: String(d.id),
              userId: String(remote.id),
              amount,
              durationDays: Number(d.durationDays || 30) as 30 | 60 | 90,
              multiplier: 1,
              startDate: Number.isFinite(start) ? start : 0,
              endDate: Number.isFinite(end) ? end : 0,
              status: String(d.status || 'locked') === 'ACTIVE' ? 'locked' : 'unlocked',
              dailyClaims: Number(d.totalClaimed || 0),
              accumulatedYieldCoins: Number(d.totalClaimed || 0),
            };
          }));
        } else {
          setLocks([]);
        }
      } catch {
        setLocks([]);
      }
      return true;
    } catch (error: any) {
      if (error?.status === 401 || error?.status === 403) {
        localStorage.removeItem('sys_stream_auth_token');
        localStorage.removeItem('sys_stream_auth_user');
        localStorage.setItem('sys_is_logged_in', 'false');
        setIsLoggedIn(false);
        setLocks([]);
      }
      return false;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('sys_stream_auth_token');
    if (!token) {
      setIsLoggedIn(false);
      try {
        const cached = JSON.parse(localStorage.getItem('sys_stream_profile_cache') || 'null');
        if (cached && (cached.id || cached.username || cached.avatar || cached.referralCode)) {
          setUser(prev => ({
            ...DEFAULT_USER,
            ...prev,
            id: String(cached.id || prev.id || ''),
            username: String(cached.username || prev.username || ''),
            avatar: String(cached.avatar || prev.avatar || ''),
            referralCode: String(cached.referralCode || prev.referralCode || ''),
          walletAddress: String(cached.walletAddress || prev.walletAddress || ''),
            lockedBalance: Number(cached.lockedBalance ?? prev.lockedBalance ?? 0),
            vipTier: Number(cached.vipTier ?? prev.vipTier ?? 0),
          }));
        } else {
          setUser(DEFAULT_USER);
        }
      } catch {
        setUser(DEFAULT_USER);
      }
      setLocks([]);
      return;
    }
    let cancelled = false;
    // Promote the existing authenticated token to the shared parent-domain
    // cookie so sysstreamer.asia and airdrop.sysstreamer.asia use one session.
    void fetch('/api/auth/session', {
      method: 'POST',
      credentials: 'include',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});

    fetch('/api/auth/me', {
      credentials: 'include',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.success || !data?.user) { const error: any = new Error(data?.error || 'Session check failed.'); error.status = response.status; throw error; }
        if (cancelled) return;
        const remote = data.user;
        setUser(prev => ({
          ...prev,
          id: String(remote.id),
          username: remote.username || remote.displayName || prev.username,
          avatar: remote.avatarUrl || prev.avatar || '',
          referralCode: remote.referralCode || prev.referralCode || '',
          walletAddress: remote.walletAddress || prev.walletAddress || '',
          registrationBonusIdr: Number(remote.registrationBonusIdr || prev.registrationBonusIdr || 0),
          registrationBonusGranted: Boolean(remote.registrationBonusGranted ?? prev.registrationBonusGranted),
          lockedBalance: Number(remote.lockedBalance || 0),
          coins: Math.round(Number(remote.balance || 0) * 100),
        }));
        setIsLoggedIn(true);
        localStorage.setItem('sys_is_logged_in', 'true');
        await refreshFinancialState();
      })
      .catch((error: any) => {
        if (cancelled) return;
        // Never force logout because of a transient/network/server error.
        // Only an explicit 401/403 means the token is no longer accepted.
        if (error?.status === 401 || error?.status === 403) {
          localStorage.removeItem('sys_stream_auth_token');
          localStorage.removeItem('sys_stream_auth_user');
          localStorage.setItem('sys_is_logged_in', 'false');
          setIsLoggedIn(false);
          setLocks([]);
          return;
        }
        setIsLoggedIn(true);
        localStorage.setItem('sys_is_logged_in', 'true');
        try {
          const cached = JSON.parse(localStorage.getItem('sys_stream_profile_cache') || 'null');
          if (cached && (cached.id || cached.username || cached.avatar || cached.referralCode)) {
            setUser(prev => ({ ...prev, ...cached }));
          }
        } catch {}
      });
    return () => { cancelled = true; };
  }, []);

  const login = (customName?: string) => {
    // A login starts a new authenticated account context.
    // Clear any previous browser profile before loading the server-owned user.
    localStorage.removeItem('sys_stream_profile_cache');
    localStorage.removeItem('nexus_user');
    setUser(DEFAULT_USER);
    setLocks([]);
    setIsLoggedIn(true);
    localStorage.setItem('sys_is_logged_in', 'true');
    setLoginModalOpen(false);

    void refreshFinancialState().then(ok => {
      if (!ok) {
        // Do not leave stale account identity visible if the new session cannot
        // be resolved from the production backend.
        setUser(DEFAULT_USER);
        setLocks([]);
        setIsLoggedIn(false);
        localStorage.removeItem('sys_stream_auth_token');
        localStorage.removeItem('sys_stream_auth_user');
        localStorage.setItem('sys_is_logged_in', 'false');
      }
    });

    sound.playWin();
    showToast('Logged In Successfully', `Welcome back, ${customName || 'User'}!`, 'success');
  };

  const logout = () => {
    // Clear the shared parent-domain session as well as local account state.
    void fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
    }).catch(() => {});

    // Clear the complete account context. A different user must never inherit
    // the previous user's wallet, profile, balance, referrals, or local state.
    localStorage.removeItem('sys_stream_profile_cache');
    localStorage.removeItem('nexus_user');
    localStorage.removeItem('sys_stream_auth_token');
    localStorage.removeItem('sys_stream_auth_user');
    localStorage.setItem('sys_is_logged_in', 'false');
    setIsLoggedIn(false);
    setUser(DEFAULT_USER);
    setLocks([]);
    sound.playClick();
    showToast('Logged Out', 'You must log in again before playing.', 'info');
  };

  const requireAuth = (action: () => void): boolean => {
    if (!isLoggedIn) {
      sound.playClick();
      setLoginModalOpen(true);
      showToast('Login Required', 'You must log in to continue.', 'info');
      return false;
    }
    action();
    return true;
  };

  const saveRemoteProfile = async (patch: { username?: string; avatarUrl?: string }) => {
    const token = localStorage.getItem('sys_stream_auth_token');
    if (!token) return false;
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(patch),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) {
        showToast('Profile Update Failed', data?.error || 'Gagal menyimpan profile.', 'error');
        return false;
      }
      const remote = data.user || {};
      setUser(prev => ({
        ...prev,
        id: String(remote.id || prev.id),
        username: remote.username || prev.username,
        avatar: remote.avatarUrl || prev.avatar,
        referralCode: remote.referralCode || prev.referralCode,
        registrationBonusIdr: Number(remote.registrationBonusIdr || prev.registrationBonusIdr || 0),
        registrationBonusGranted: Boolean(remote.registrationBonusGranted ?? prev.registrationBonusGranted),
      }));
      localStorage.setItem('sys_stream_auth_user', JSON.stringify(remote));
      return true;
    } catch {
      showToast('Profile Update Failed', 'Server tidak dapat menyimpan profile.', 'error');
      return false;
    }
  };

  const recordEventParticipation = async (eventId: string, eventName: string, status = 'JOINED'): Promise<boolean> => {
    const token = localStorage.getItem('sys_stream_auth_token');
    if (!token) return false;
    try {
      const response = await fetch('/api/events/participate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ eventId, eventName, status }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) return false;
      return true;
    } catch {
      return false;
    }
  };

  const updateProfile = async (username: string, avatarUrl: string): Promise<boolean> => {
    const trimmedUsername = username.trim();
    const trimmedAvatar = avatarUrl.trim();
    if (!trimmedUsername) return false;

    const ok = await saveRemoteProfile({
      username: trimmedUsername,
      avatarUrl: trimmedAvatar,
    });
    if (!ok) return false;

    // Apply the complete server response in one state update.
    // This avoids two concurrent profile writes racing with each other.
    sound.playClick();
    showToast('Profile Updated', 'Profile tersimpan ke akun Anda.', 'success');
    return true;
  };

  const updateAvatar = (avatarUrl: string) => {
    setUser(prev => ({ ...prev, avatar: avatarUrl }));
    void saveRemoteProfile({ avatarUrl });
    sound.playClick();
    showToast('Profile Updated', 'Profile picture updated successfully!', 'success');
  };

  const updateUsername = (newUsername: string) => {
    const trimmed = newUsername.trim();
    if (!trimmed) return;
    setUser(prev => ({ ...prev, username: trimmed }));
    void saveRemoteProfile({ username: trimmed });
    sound.playClick();
    showToast('Username Updated', `Display name set to @${trimmed}`, 'success');
  };

  useEffect(() => {
    localStorage.setItem('nexus_cryptocard', JSON.stringify(cryptoCard));
  }, [cryptoCard]);

  useEffect(() => {
    localStorage.setItem('nexus_viewers', JSON.stringify(viewerList));
  }, [viewerList]);

  useEffect(() => {
    localStorage.setItem('nexus_user', JSON.stringify(user));
    if (user.id || user.username || user.avatar || user.referralCode) {
      localStorage.setItem('sys_stream_profile_cache', JSON.stringify({
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        referralCode: user.referralCode,
        walletAddress: user.walletAddress,
        registrationBonusIdr: user.registrationBonusIdr,
        registrationBonusGranted: user.registrationBonusGranted,
        vipTier: user.vipTier,
      }));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('nexus_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('nexus_history', JSON.stringify(history));
  }, [history]);

  const showToast = (title: string, message: string, type: Toast['type'] = 'info') => {
    const id = 't_' + Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev.slice(-3), { id, title, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toggleSound = () => {
    const next = sound.toggle();
    setSoundEnabled(next);
  };

  const updateCoins = (delta: number): boolean => {
    if (delta < 0 && user.coins + delta < 0) {
      showToast('Insufficient Balance', 'You need more gold coins to place this bet.', 'error');
      return false;
    }
    setUser(prev => {
      const newCoins = Math.max(0, prev.coins + delta);
      const totalWon = delta > 0 ? prev.totalWon + delta : prev.totalWon;
      const totalBet = delta < 0 ? prev.totalBet + Math.abs(delta) : prev.totalBet;
      const bestWin = delta > prev.bestWin ? delta : prev.bestWin;
      return {
        ...prev,
        coins: newCoins,
        totalWon,
        totalBet,
        bestWin,
      };
    });
    return true;
  };

  const updateDiamonds = (delta: number): boolean => {
    if (delta < 0 && user.diamonds + delta < 0) {
      showToast('Insufficient Diamonds', 'Not enough diamonds for this premium vault.', 'error');
      return false;
    }
    setUser(prev => ({ ...prev, diamonds: Math.max(0, prev.diamonds + delta) }));
    return true;
  };

  const addGameHistory = (entry: Omit<GameHistoryEntry, 'id' | 'timestamp'>) => {
    const fullEntry: GameHistoryEntry = {
      ...entry,
      id: 'gh_' + Date.now() + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
    };
    setHistory(prev => [fullEntry, ...prev].slice(0, 100));

    // Update win streak
    setUser(prev => ({
      ...prev,
      winStreak: entry.isWin ? prev.winStreak + 1 : 0,
    }));
  };

  const addToInventory = (item: BlindboxItem) => {
    const withDate: BlindboxItem = {
      ...item,
      obtainedAt: new Date().toISOString().split('T')[0],
    };
    setInventory(prev => [withDate, ...prev]);
  };

  const sellInventoryItem = (itemId: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    sound.playWin();
    updateCoins(item.coinValue);
    setInventory(prev => prev.filter(i => i.id !== itemId));
    showToast('Item Sold', `Sold ${item.name} for +${item.coinValue} coins!`, 'success');
  };

  const [dailyBoxesClaimed, setDailyBoxesClaimed] = useState<number>(0);

  const createLock = async (amount: number, durationDays: 30 | 60 | 90): Promise<boolean> => {
    if (!isLoggedIn) return false;
    const token = localStorage.getItem('sys_stream_auth_token');
    if (!token) return false;
    try {
      const response = await fetch('/api/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount, durationDays }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) {
        showToast('Lock Failed', data?.error || 'Gagal mengunci saldo.', 'error');
        return false;
      }
      await refreshFinancialState();
      sound.playWin();
      showToast('Blind Box Lock Aktif', `Saldo Rp ${amount.toLocaleString('id-ID')} dikunci untuk Blind Box selama ${durationDays} hari.`, 'success');
      return true;
    } catch {
      showToast('Lock Failed', 'Server tidak dapat memproses lock.', 'error');
      return false;
    }
  };

  const claimDailyLockYield = async (lockId: string): Promise<boolean> => {
    const token = localStorage.getItem('sys_stream_auth_token');
    if (!token) return false;
    try {
      const response = await fetch(`/api/deposits/${encodeURIComponent(lockId)}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: undefined,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) {
        showToast('Blind Box', data?.error || 'Claim Blind Box gagal.', 'error');
        return false;
      }
      await refreshFinancialState();
      sound.playWin();
      showToast('Blind Box Claimed', `+Rp ${Number(data.reward ?? data.prizeAmount ?? 0).toLocaleString('id-ID')} masuk ke saldo Anda.`, 'success');
      return true;
    } catch {
      showToast('Daily Yield', 'Server tidak dapat memproses claim.', 'error');
      return false;
    }
  };

  const unlockEarly = async (lockId: string): Promise<boolean> => {
    const token = localStorage.getItem('sys_stream_auth_token');
    if (!token) return false;
    try {
      const response = await fetch(`/api/deposits/${encodeURIComponent(lockId)}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: undefined,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) {
        showToast('Unlock Failed', data?.error || 'Unlock gagal.', 'error');
        return false;
      }
      await refreshFinancialState();
      sound.playJackpot();
      showToast('Lock Selesai', `Principal Rp ${Number(data.principalReturned ?? data.balance ?? 0).toLocaleString('id-ID')} telah dikembalikan ke saldo tersedia.`, 'success');
      return true;
    } catch {
      showToast('Unlock Failed', 'Server tidak dapat memproses unlock.', 'error');
      return false;
    }
  };

  const claimRegistrationBonus = async (): Promise<boolean> => {
    const token = localStorage.getItem('sys_stream_auth_token');
    if (!token) { setLoginModalOpen(true); return false; }
    try {
      const response = await fetch('/api/auth/claim-registration-bonus', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) {
        showToast('Registration Bonus', data?.error || 'Bonus registrasi tidak dapat diklaim.', 'error');
        return false;
      }
      const remote = data.user || {};
      setUser(prev => ({
        ...prev,
        id: String(remote.id || prev.id),
        username: remote.username || prev.username,
        avatar: remote.avatar_url || prev.avatar || '',
        referralCode: remote.referral_code || prev.referralCode || '',
        coins: Math.round(Number(remote.available_balance || 0) * 100),
        registrationBonusIdr: Number(remote.registration_bonus_idr || prev.registrationBonusIdr || 0),
        registrationBonusGranted: Boolean(Number(remote.registration_bonus_granted || 0)),
        lockedBalance: Number(remote.locked_balance ?? remote.lockedBalance ?? prev.lockedBalance ?? 0),
      }));
      localStorage.setItem('sys_stream_auth_user', JSON.stringify(remote));
      await refreshFinancialState();
      sound.playWin();
      showToast('Bonus Claimed', 'Bonus registrasi berhasil masuk ke saldo Anda.', 'success');
      return true;
    } catch {
      showToast('Registration Bonus', 'Koneksi ke server gagal. Bonus Anda tetap aman dan dapat dicoba lagi.', 'error');
      return false;
    }
  };

  const claimBlindBox = async (_boxId: string): Promise<any> => {
    const token = localStorage.getItem('sys_stream_auth_token');
    if (!token) throw new Error('Silakan login terlebih dahulu.');

    const activeLock = locks.find((lock) => lock.status === 'locked');
    if (!activeLock) throw new Error('Tidak ada lock Blind Box yang aktif.');

    const response = await fetch(`/api/deposits/${encodeURIComponent(activeLock.id)}/claim`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.success) throw new Error(data?.error || 'Blind Box claim gagal.');

    setDailyBoxesClaimed(1);
    await refreshFinancialState();
    return data;
  };


  const getTotalLockedUsdt = (): number => {
    // Kept for compatibility with existing consumers; the production
    // financial unit is IDR, not USDT.
    return Number(user.lockedBalance || 0);
  };

  // Production deposits currently allow one Blind Box claim per active lock per WIB day.
  // Keep the frontend quota aligned with the server-side claim rule.
  const getDailyBoxQuota = (): number => {
    return getTotalLockedUsdt() >= 71748 ? 1 : 0;
  };

  const getRemainingDailyBoxes = (): number => {
    const quota = getDailyBoxQuota();
    return Math.max(0, quota - dailyBoxesClaimed);
  };

  const consumeDailyBoxClaim = (): boolean => {
    const remaining = getRemainingDailyBoxes();
    if (remaining <= 0) return false;
    setDailyBoxesClaimed(1);
    return true;
  };


  const hasActiveLock = (): boolean => {
    return locks.some(l => l.status === 'locked' && l.amount >= 4);
  };

  const updateCryptoCard = (cfg: Partial<CryptoCardConfig>) => {
    setCryptoCard(prev => ({ ...prev, ...cfg }));
    sound.playClick();
    showToast('Crypto Card Updated', 'Streamer updated the digital card parameters!', 'info');
  };

  const addViewer = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (viewerList.includes(trimmed)) {
      showToast('Already on Wheel', `${trimmed} is already in the spinner list.`, 'info');
      return;
    }
    setViewerList(prev => [...prev, trimmed]);
    sound.playClick();
    showToast('Viewer Added', `Added @${trimmed} to the Spinner wheel!`, 'success');
  };

  const removeViewer = (name: string) => {
    setViewerList(prev => prev.filter(v => v !== name));
    sound.playClick();
  };

  const clearViewers = () => {
    setViewerList([]);
    sound.playClick();
  };

  const claimDailyBonus = (): boolean => {
    const lastClaim = localStorage.getItem('nexus_daily_claim');
    const today = new Date().toDateString();
    if (lastClaim === today) {
      showToast('Already Claimed', 'You already claimed your daily reward today. Return tomorrow!', 'info');
      return false;
    }

    localStorage.setItem('nexus_daily_claim', today);
    const bonusCoins = 250;
    const bonusDiamonds = 5;
    updateCoins(bonusCoins);
    updateDiamonds(bonusDiamonds);
    sound.playWin();
    showToast('Daily Login Reward', `Claimed +${bonusCoins} Coins & +${bonusDiamonds} Diamonds!`, 'success');
    return true;
  };

  const claimReferralRewards = () => {
    const claimedCoins = 380;
    const claimedDiamonds = 12;
    updateCoins(claimedCoins);
    updateDiamonds(claimedDiamonds);
    sound.playWin();
    showToast('Referral Commission Claimed', `Credited +${claimedCoins} Coins and +${claimedDiamonds} Diamonds!`, 'success');
    return { coins: claimedCoins, diamonds: claimedDiamonds };
  };

  const createCryptoInvoice = async (amountUsd: number, currency: string): Promise<CryptoInvoice> => {
    const token = localStorage.getItem('sys_stream_auth_token');
    if (!token || !user.id) {
      throw new Error('Silakan login terlebih dahulu.');
    }

    const normalizedCurrency = currency.toLowerCase() === 'usdt'
      ? 'usdttrc20'
      : currency.toLowerCase();

    const response = await fetch('/api/payments/create-invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: user.id,
        amountUsd,
        currency: normalizedCurrency,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data?.success || !data?.invoice) {
      throw new Error(data?.error || 'Gagal membuat invoice pembayaran crypto.');
    }

    const remote = data.invoice;
    const payAddress = String(remote.pay_address || '');
    const orderId = String(remote.order_id || '');
    const invoice: CryptoInvoice = {
      orderId,
      paymentId: String(remote.payment_id || ''),
      payAddress,
      priceAmountUsd: Number(remote.amount_usd || amountUsd),
      payAmount: Number(remote.pay_amount || 0),
      payCurrency: String(remote.pay_currency || normalizedCurrency).toUpperCase(),
      coinsToCredit: Math.floor(Number(remote.amount_usd || amountUsd) * 100),
      status: 'waiting',
      qrCodeUrl: payAddress
        ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(payAddress)}`
        : '',
      invoiceUrl: String(remote.invoice_url || remote.payment_url || ''),
      expiresAt: Date.now() + 1800000,
    };

    setPendingInvoices(prev => [invoice, ...prev]);
    return invoice;
  };


  return (
    <GameContext.Provider
      value={{
        user,
        inventory,
        history,
        locks,
        cryptoCard,
        viewerList,
        soundEnabled,
        toasts,
        dailyBoxesClaimed,
        isLoggedIn,
        loginModalOpen,
        setLoginModalOpen,
        login,
        logout,
        requireAuth,
        updateAvatar,
        updateUsername,
        updateProfile,
        recordEventParticipation,
        toggleSound,
        updateCoins,
        updateDiamonds,
        addGameHistory,
        addToInventory,
        sellInventoryItem,
        createLock,
        claimDailyLockYield,
        unlockEarly,
        claimBlindBox,
        claimRegistrationBonus,
        refreshFinancialState,
        hasActiveLock,
        getTotalLockedUsdt,
        getDailyBoxQuota,
        getRemainingDailyBoxes,
        consumeDailyBoxClaim,
        updateCryptoCard,
        addViewer,
        removeViewer,
        clearViewers,
        claimDailyBonus,
        claimReferralRewards,
        createCryptoInvoice,
        dismissToast,
        showToast,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};
