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
  createLock: (amount: number, durationDays: 30 | 60 | 90) => boolean;
  claimDailyLockYield: (lockId: string) => void;
  unlockEarly: (lockId: string) => boolean;
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
  simulatePaymentCompletion: (orderId: string) => void;
  switchUser: (type: 'regular' | 'whale' | 'pro') => void;
  dismissToast: (id: string) => void;
  showToast: (title: string, message: string, type?: Toast['type']) => void;
}

const DEFAULT_USER: UserProfile = {
  id: 'usr_neo_922',
  username: 'neo_user_922',
  avatar: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80',
  coins: 50000,
  diamonds: 120,
  vipTier: 3,
  referralCode: 'CYBER-9X7QK2',
  totalWon: 124080,
  totalBet: 88500,
  winStreak: 5,
  bestWin: 15000,
};

const INITIAL_INVENTORY: BlindboxItem[] = [
  {
    id: 'item_1',
    name: 'Cyberpunk Katana 2099',
    category: 'Weapon',
    rarity: 'rare',
    powerStat: 68,
    coinValue: 450,
    usdtReward: 4.5,
    iconName: 'Sword',
    obtainedAt: '2026-09-28',
  },
  {
    id: 'item_2',
    name: 'Holo-Chameleon Drone',
    category: 'Companion',
    rarity: 'epic',
    powerStat: 84,
    coinValue: 1200,
    usdtReward: 12.0,
    iconName: 'Bot',
    obtainedAt: '2026-09-29',
  },
];

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('nexus_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
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
    return [
      {
        id: 'hist_1',
        gameType: 'spinner',
        gameName: 'Lucky Wheel',
        betAmount: 100,
        payoutAmount: 300,
        multiplier: 3.0,
        isWin: true,
        timestamp: Date.now() - 3600000,
        details: 'Landed on 3.0x Emerald Segment',
      },
      {
        id: 'hist_2',
        gameType: 'tebak',
        gameName: 'Tebak Angka',
        betAmount: 50,
        payoutAmount: 100,
        multiplier: 2.0,
        isWin: true,
        timestamp: Date.now() - 7200000,
        details: 'High Guess (Target > 50, Rolled 74)',
      },
    ];
  });

  const [locks, setLocks] = useState<LockRecord[]>(() => {
    const saved = localStorage.getItem('nexus_locks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'lock_demo_1',
        userId: 'usr_neo_88',
        amount: 10.0,
        durationDays: 30,
        multiplier: 1.15,
        startDate: Date.now() - 86400000 * 5,
        endDate: Date.now() + 86400000 * 25,
        status: 'locked',
        dailyClaims: 5,
        accumulatedYieldCoins: 125,
      },
    ];
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
    return [
      'CyberWhale_88',
      'ValkyrieStrike',
      'NeonMatrix',
      'ShadowBlade',
      'CryptoGhost_7',
      'PulseRider',
      'HyperionAce',
      'SatoshiLord',
    ];
  });

  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pendingInvoices, setPendingInvoices] = useState<CryptoInvoice[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('sys_is_logged_in') !== 'false';
  });
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);

  const login = (customName?: string) => {
    setIsLoggedIn(true);
    localStorage.setItem('sys_is_logged_in', 'true');
    if (customName && customName.trim()) {
      setUser(prev => ({ ...prev, username: customName.trim() }));
    }
    setLoginModalOpen(false);
    sound.playWin();
    showToast('Logged In Successfully', `Welcome back, ${customName || user.username}!`, 'success');
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('sys_is_logged_in', 'false');
    sound.playClick();
    showToast('Logged Out', 'Viewing games as Guest. Login is required to place bets.', 'info');
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
    localStorage.setItem('nexus_locks', JSON.stringify(locks));
  }, [locks]);

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

  const createLock = (amount: number, durationDays: 30 | 60 | 90): boolean => {
    const coinsNeeded = Math.floor(amount * 100);
    if (amount < 4) {
      showToast('Minimum Lock Amount', 'Minimum lock amount is $4.00 USDT (400 Coins)', 'error');
      return false;
    }
    if (user.coins < coinsNeeded) {
      showToast('Insufficient Balance', `You need ${coinsNeeded.toLocaleString()} Coins to lock $${amount}.00 USDT`, 'error');
      return false;
    }

    const deducted = updateCoins(-coinsNeeded);
    if (!deducted) return false;

    // Yield: 30d -> 10% (1.10x), 60d -> 15% (1.15x), 90d -> 20% (1.20x)
    const multiplier = durationDays === 30 ? 1.10 : durationDays === 60 ? 1.15 : 1.20;
    const yieldPercentage = durationDays === 30 ? '10%' : durationDays === 60 ? '15%' : '20%';

    const newLock: LockRecord = {
      id: 'lock_' + Date.now(),
      userId: user.id,
      amount,
      durationDays,
      multiplier,
      startDate: Date.now(),
      endDate: Date.now() + durationDays * 86400000,
      status: 'locked',
      dailyClaims: 0,
      accumulatedYieldCoins: 0,
    };

    setLocks(prev => [newLock, ...prev]);
    sound.playWin();
    showToast(
      'Funds Staked & Locked',
      `Locked $${amount}.00 USDT for ${durationDays} days (${yieldPercentage} estimated return)! Daily box quota activated.`,
      'success'
    );
    return true;
  };

  const claimDailyLockYield = (lockId: string) => {
    const targetLock = locks.find(l => l.id === lockId);
    if (!targetLock || targetLock.status !== 'locked') return;

    // Daily claim yield in coins based on committed duration
    const totalYieldUsd = targetLock.amount * (targetLock.multiplier - 1);
    const dailyProfitUsd = totalYieldUsd / targetLock.durationDays;
    const coinsEarned = Math.max(1, Math.round(dailyProfitUsd * 100));

    updateCoins(coinsEarned);
    setLocks(prev =>
      prev.map(l =>
        l.id === lockId
          ? {
              ...l,
              dailyClaims: l.dailyClaims + 1,
              accumulatedYieldCoins: l.accumulatedYieldCoins + coinsEarned,
            }
          : l
      )
    );

    sound.playWin();
    showToast(
      'Daily Yield Claimed',
      `Collected +${coinsEarned} Coins daily reward from ${targetLock.durationDays}d Staking Vault!`,
      'success'
    );
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

  const unlockEarly = (lockId: string): boolean => {
    const targetLock = locks.find(l => l.id === lockId);
    if (!targetLock || targetLock.status !== 'locked') return false;

    const isFullyMatured = Date.now() >= targetLock.endDate;
    const principalCoins = Math.floor(targetLock.amount * 100);

    if (isFullyMatured) {
      const totalPayout = Math.floor(principalCoins * targetLock.multiplier);
      updateCoins(totalPayout);
      sound.playJackpot();
      showToast(
        'Staking Term Completed!',
        `Full ${targetLock.durationDays}d duration reached! Principal + bonus unlocked: +${totalPayout.toLocaleString()} Coins`,
        'success'
      );
    } else {
      // Early unlock: daily rewards forfeited! User ONLY gets initial locked principal back.
      updateCoins(principalCoins);
      sound.playClick();
      showToast(
        'Early Unlock Executed',
        `Unlocked before ${targetLock.durationDays} days. Daily rewards forfeited. Initial principal of $${targetLock.amount.toFixed(2)} USDT (+${principalCoins} Coins) returned to wallet.`,
        'info'
      );
    }

    setLocks(prev =>
      prev.map(l => (l.id === lockId ? { ...l, status: 'unlocked' } : l))
    );
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
    const cryptoRates: Record<string, number> = {
      btc: 0.000015,
      eth: 0.00038,
      usdt: 1.0,
      sol: 0.0068,
      trx: 7.2,
    };
    const rate = cryptoRates[currency.toLowerCase()] || 1.0;
    const coinsToCredit = Math.floor(amountUsd * 100);
    const payAmount = Number((amountUsd * rate).toFixed(6));
    const orderId = `INV_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const invoice: CryptoInvoice = {
      orderId,
      paymentId: 'np_' + Date.now(),
      payAddress: `0x71C84B9A${currency.toUpperCase()}90E3F5724589`,
      priceAmountUsd: amountUsd,
      payAmount,
      payCurrency: currency.toUpperCase(),
      coinsToCredit,
      status: 'waiting',
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=crypto:${currency.toUpperCase()}:${orderId}`,
      expiresAt: Date.now() + 1800000,
    };

    setPendingInvoices(prev => [invoice, ...prev]);
    return invoice;
  };

  const simulatePaymentCompletion = (orderId: string) => {
    const inv = pendingInvoices.find(i => i.orderId === orderId);
    const credit = inv ? inv.coinsToCredit : 1000;
    updateCoins(credit);
    sound.playJackpot();
    showToast('Payment Confirmed', `NOWPayments confirmed order ${orderId}. +${credit} coins credited to wallet!`, 'jackpot');
  };

  const switchUser = (type: 'regular' | 'whale' | 'pro') => {
    if (type === 'whale') {
      setUser({
        id: 'usr_whale_99',
        username: 'ApexWhale',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ApexWhale',
        coins: 150000,
        diamonds: 500,
        vipTier: 5,
        referralCode: 'WHALEVIP',
        totalWon: 890000,
        totalBet: 740000,
        winStreak: 12,
        bestWin: 50000,
      });
      showToast('Switched Profile', 'Logged in as VIP ApexWhale ($150,000 balance)', 'info');
    } else if (type === 'pro') {
      setUser({
        id: 'usr_pro_01',
        username: 'ValkyriePro',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ValkyriePro',
        coins: 12400,
        diamonds: 85,
        vipTier: 3,
        referralCode: 'VALK99',
        totalWon: 45000,
        totalBet: 32000,
        winStreak: 5,
        bestWin: 12000,
      });
      showToast('Switched Profile', 'Logged in as ValkyriePro', 'info');
    } else {
      setUser(DEFAULT_USER);
      showToast('Switched Profile', 'Logged in as NeoRider', 'info');
    }
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
        simulatePaymentCompletion,
        switchUser,
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
