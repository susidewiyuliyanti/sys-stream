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
  totalWon: 0,
  totalBet: 0,
  winStreak: 0,
  bestWin: 0,
};

const INITIAL_INVENTORY: BlindboxItem[] = [];

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => DEFAULT_USER);

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

  const [locks, setLocks] = useState<LockRecord[]>(() => {
    const saved = localStorage.getItem('nexus_locks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

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
      const response = await fetch('/api/locks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) throw new Error(data?.error || 'Gagal mengambil saldo.');
      const remote = data.user;
      setUser(prev => ({
        ...prev,
        id: String(remote.id),
        username: remote.username || prev.username,
        coins: Math.round(Number(remote.balance || 0) * 100),
      }));
      const remoteLocks: LockRecord[] = (data.locks || []).map((l: any) => ({
        id: String(l.id),
        userId: String(l.user_id),
        amount: Number(l.amount),
        durationDays: Number(l.duration_days),
        multiplier: Number(l.multiplier),
        startDate: Number(l.start_date),
        endDate: Number(l.end_date),
        status: l.status,
        dailyClaims: Number(l.daily_claims || 0),
        accumulatedYieldCoins: 0,
      }));
      setLocks(remoteLocks);
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('sys_stream_auth_token');
    if (!token) {
      setIsLoggedIn(false);
      setUser(DEFAULT_USER);
      setLocks([]);
      return;
    }
    let cancelled = false;
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.success || !data?.user) throw new Error(data?.error || 'Session tidak valid.');
        if (cancelled) return;
        const remote = data.user;
        setUser(prev => ({
          ...prev,
          id: String(remote.id),
          username: remote.username || prev.username,
          coins: Math.round(Number(remote.balance || 0) * 100),
        }));
        setIsLoggedIn(true);
        localStorage.setItem('sys_is_logged_in', 'true');
        await refreshFinancialState();
      })
      .catch(() => {
        if (cancelled) return;
        localStorage.removeItem('sys_stream_auth_token');
        localStorage.removeItem('sys_stream_auth_user');
        localStorage.setItem('sys_is_logged_in', 'false');
        setIsLoggedIn(false);
        setUser(DEFAULT_USER);
        setLocks([]);
      });
    return () => { cancelled = true; };
  }, []);

  const login = (customName?: string) => {
    setIsLoggedIn(true);
    localStorage.setItem('sys_is_logged_in', 'true');
    if (customName && customName.trim()) {
      setUser(prev => ({ ...prev, username: customName.trim() }));
    }
    setLoginModalOpen(false);
    void refreshFinancialState();
    sound.playWin();
    showToast('Logged In Successfully', `Welcome back, ${customName || user.username}!`, 'success');
  };

  const logout = () => {
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
      showToast('Login Required', 'You must log in to play games or place bets.', 'info');
      return false;
    }
    action();
    return true;
  };

  const updateAvatar = (avatarUrl: string) => {
    setUser(prev => ({ ...prev, avatar: avatarUrl }));
    sound.playClick();
    showToast('Profile Updated', 'Profile picture updated successfully!', 'success');
  };

  const updateUsername = (newUsername: string) => {
    const trimmed = newUsername.trim();
    if (!trimmed) return;
    setUser(prev => ({ ...prev, username: trimmed }));
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

  const [dailyBoxesClaimed, setDailyBoxesClaimed] = useState<number>(() => {
    const key = 'nexus_claimed_boxes_' + new Date().toDateString();
    return parseInt(localStorage.getItem(key) || '0', 10);
  });

  const createLock = async (amount: number, durationDays: 30 | 60 | 90): Promise<boolean> => {
    if (!isLoggedIn) return false;
    const token = localStorage.getItem('sys_stream_auth_token');
    if (!token) return false;
    try {
      const response = await fetch('/api/locks/create', {
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
      showToast('Funds Staked & Locked', `Locked $${amount.toFixed(2)} USDT for ${durationDays} days.`, 'success');
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
      const response = await fetch('/api/locks/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ lockId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) {
        showToast('Daily Yield', data?.error || 'Claim gagal.', 'error');
        return false;
      }
      await refreshFinancialState();
      sound.playWin();
      showToast('Daily Yield Claimed', `+${Number(data.claimedAmount || 0).toFixed(4)} USDT added to your balance.`, 'success');
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
      const response = await fetch('/api/locks/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ lockId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) {
        showToast('Unlock Failed', data?.error || 'Unlock gagal.', 'error');
        return false;
      }
      await refreshFinancialState();
      sound.playJackpot();
      showToast('Funds Unlocked', `+${Number(data.payout || 0).toFixed(4)} USDT returned to available balance.`, 'success');
      return true;
    } catch {
      showToast('Unlock Failed', 'Server tidak dapat memproses unlock.', 'error');
      return false;
    }
  };

  const claimBlindBox = async (boxId: string): Promise<any> => {
    const token = localStorage.getItem('sys_stream_auth_token');
    if (!token) throw new Error('Silakan login terlebih dahulu.');
    const response = await fetch('/api/blindbox/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ boxId }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.success) throw new Error(data?.error || 'Blind Box claim gagal.');
    await refreshFinancialState();
    return data;
  };


  const getTotalLockedUsdt = (): number => {
    return locks
      .filter((l) => l.status === 'locked')
      .reduce((sum, l) => sum + l.amount, 0);
  };

  // Quota rule: $4 = 1 box, $50 = 2 boxes, $100 = 3 boxes, $250 = 5 boxes, $500+ = 10 boxes
  const getDailyBoxQuota = (): number => {
    const total = getTotalLockedUsdt();
    if (total < 4) return 0;
    if (total < 50) return 1;
    if (total < 100) return 2;
    if (total < 250) return 3;
    if (total < 500) return 5;
    return 10;
  };

  const getRemainingDailyBoxes = (): number => {
    const quota = getDailyBoxQuota();
    return Math.max(0, quota - dailyBoxesClaimed);
  };

  const consumeDailyBoxClaim = (): boolean => {
    const remaining = getRemainingDailyBoxes();
    if (remaining <= 0) return false;

    const next = dailyBoxesClaimed + 1;
    setDailyBoxesClaimed(next);
    const key = 'nexus_claimed_boxes_' + new Date().toDateString();
    localStorage.setItem(key, String(next));
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
