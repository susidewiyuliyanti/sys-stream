import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Wallet,
  Clock,
  Trophy,
  Crown,
  AlertCircle,
  Calendar,
  Lock,
  ArrowDownToLine,
  LogIn,
  LogOut,
  ShieldCheck,
  PlusCircle,
  MinusCircle,
  Coins,
  CheckCircle2,
  Gift,
  Flame,
  HelpCircle,
  Timer,
  Unlock,
  AlertTriangle,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import {
  BlindBoxUser,
  BlindBoxDeposit,
  BlindBoxClaimItem,
  BlindBoxGameSettings,
  UserProfile,
  DepositTierInfo,
  BoxTierType,
  OpenedBoxItem,
} from '../../types';
import { updateUserProfile, createTransactionOrder } from '../../services/firebase';
import { useAppConfig } from '../../context/AppConfigContext';
import { BlindBox3DScene } from './BlindBox3DScene';
import { BlindBoxOpenModal } from './BlindBoxOpenModal';
import { BlindBoxWithdrawModal } from './BlindBoxWithdrawModal';
import { BlindBoxUnlockModal } from './BlindBoxUnlockModal';
import { BlindBoxAdminPanel } from './BlindBoxAdminPanel';

export const getClientTierDetails = (amount: number): DepositTierInfo => {
  if (amount >= 50000000) {
    return {
      tier: 'SULTAN',
      tierName: 'Sultan VIP',
      boxCount: 25,
      boxType: 'Box Sultan VIP',
      badgeColor: 'rose',
    };
  }
  if (amount >= 20000000) {
    return {
      tier: 'DIAMOND',
      tierName: 'Diamond',
      boxCount: 15,
      boxType: 'Box Diamond',
      badgeColor: 'cyan',
    };
  }
  if (amount >= 5000000) {
    return {
      tier: 'GOLD',
      tierName: 'Emas (Gold)',
      boxCount: 10,
      boxType: 'Box Emas',
      badgeColor: 'amber',
    };
  }
  if (amount >= 2500000) {
    return {
      tier: 'PLATINUM',
      tierName: 'Platinum',
      boxCount: 5,
      boxType: 'Box Platinum',
      badgeColor: 'purple',
    };
  }
  if (amount >= 1000000) {
    return {
      tier: 'SILVER',
      tierName: 'Silver',
      boxCount: 3,
      boxType: 'Box Silver',
      badgeColor: 'slate',
    };
  }
  return {
    tier: 'BRONZE',
    tierName: 'Bronze (Regular)',
    boxCount: 1,
    boxType: 'Box Regular',
    badgeColor: 'orange',
  };
};

export const getEstimatedRewardPercent = (amount: number): { min: number; max: number; label: string } => {
  if (amount >= 50000000) return { min: 2.5, max: 3.5, label: 'Sultan VIP: 2.5% - 3.5% / hari' };
  if (amount >= 20000000) return { min: 2.0, max: 3.0, label: 'Diamond: 2.0% - 3.0% / hari' };
  if (amount >= 5000000) return { min: 1.5, max: 2.5, label: 'Gold: 1.5% - 2.5% / hari' };
  if (amount >= 2500000) return { min: 1.2, max: 2.0, label: 'Platinum: 1.2% - 2.0% / hari' };
  if (amount >= 1000000) return { min: 0.8, max: 1.5, label: 'Silver: 0.8% - 1.5% / hari' };
  return { min: 0.5, max: 1.0, label: 'Bronze: 0.5% - 1.0% / hari' };
};

interface BlindBoxDashboardProps {
  userProfile?: UserProfile | null;
  onUpdateWalletBalance?: (newBalance: number) => void;
  onOpenAppProfile?: () => void;
  onOpenAppAuth?: () => void;
  onLogoutApp?: () => void;
}

export const BlindBoxDashboard: React.FC<BlindBoxDashboardProps> = ({
  userProfile,
  onUpdateWalletBalance,
  onOpenAppProfile,
  onOpenAppAuth,
  onLogoutApp,
}) => {
  // Synchronous token initialization from existing unified session
  const [jwtToken, setJwtToken] = useState<string | null>(() => {
    try {
      return (
        localStorage.getItem('sys_stream_auth_token') ||
        null
      );
    } catch {
      return null;
    }
  });

  // Synchronous user initialization from userProfile or cached session
  const [currentUser, setCurrentUser] = useState<BlindBoxUser | null>(() => {
    if (userProfile) {
      const isOwner =
        userProfile.email?.toLowerCase() === 'susidewiyuliyanti@gmail.com' ||
        userProfile.role === 'admin' ||
        (userProfile as any).role === 'OWNER';
      const isAdmin =
        userProfile.email?.toLowerCase() === 'dadifirmansyah8572@gmail.com' ||
        (userProfile as any).role === 'ADMIN';
      return {
        id: typeof (userProfile as any).id === 'number' ? (userProfile as any).id : 1,
        cuid: userProfile.uid,
        uid: userProfile.uid,
        username: userProfile.streamerHandle || userProfile.displayName || userProfile.email?.split('@')[0] || 'streamer',
        email: userProfile.email || '',
        displayName: userProfile.displayName || 'Streamer Host',
        photoURL: userProfile.photoURL || '',
        balance: userProfile.walletBalance ?? userProfile.saldo ?? 15000,
        lockedBalance: (userProfile as any).lockedSaldo ?? 0,
        role: isOwner ? 'OWNER' : isAdmin ? 'ADMIN' : 'USER',
        isBlacklisted: false,
        isBanned: false,
        subscriptionPlan: userProfile.subscriptionPlan || 'Akses Bebas Gratis',
        isSubscribed: true,
      };
    }
    try {
      const cached = localStorage.getItem('sys_stream_auth_user');
      if (cached) {
        const u = JSON.parse(cached);
        return {
          id: u.id || 1,
          cuid: u.cuid || u.uid,
          uid: u.uid || u.cuid,
          username: u.username || u.displayName || u.email?.split('@')[0] || 'streamer',
          email: u.email || '',
          displayName: u.displayName || 'Streamer Host',
          photoURL: u.photoURL || '',
          balance: u.balance ?? u.walletBalance ?? u.saldo ?? 15000,
          lockedBalance: u.lockedBalance ?? u.lockedSaldo ?? 0,
          role: u.role || 'USER',
          isBlacklisted: false,
          isBanned: false,
          subscriptionPlan: u.subscriptionPlan || 'Akses Bebas Gratis',
          isSubscribed: true,
        };
      }
    } catch {}
    return null;
  });

  // Helper: check if user is already authenticated
  const isUserLoggedIn = Boolean(
    userProfile ||
    currentUser ||
    jwtToken ||
    (typeof window !== 'undefined' && (
      localStorage.getItem('sys_stream_auth_token') ||
      localStorage.getItem('sys_stream_auth_user')
    ))
  );

  const getActiveToken = () => {
    try {
      return (
        localStorage.getItem('sys_stream_auth_token') ||
        jwtToken ||
        null
      );
    } catch {
      return jwtToken;
    }
  };

  // Game data state
  const [activeDeposit, setActiveDeposit] = useState<BlindBoxDeposit | null>(null);
  const [depositTier, setDepositTier] = useState<DepositTierInfo | null>(null);
  const [allDeposits, setAllDeposits] = useState<BlindBoxDeposit[]>([]);
  const [hasClaimedToday, setHasClaimedToday] = useState(false);
  const [todayClaimData, setTodayClaimData] = useState<BlindBoxClaimItem | null>(null);
  const [recentClaims, setRecentClaims] = useState<BlindBoxClaimItem[]>([]);
  const [settings, setSettings] = useState<BlindBoxGameSettings | null>(null);
  const [countdownText, setCountdownText] = useState('00:00:00');
  const [wibDateStr, setWibDateStr] = useState('');

  // Selected duration for new deposit: 30, 60, or 90
  const [selectedDuration, setSelectedDuration] = useState<30 | 60 | 90>(30);
  // Custom deposit amount: multiple of 50.000, min 50.000, max 5.000.000
  const [customDepositAmount, setCustomDepositAmount] = useState<number>(50000);
  const [showTopUpOptions, setShowTopUpOptions] = useState<boolean>(false);
  const [isDepositing, setIsDepositing] = useState(false);

  // Claim & Modals state
  const [isClaiming, setIsClaiming] = useState(false);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [claimResult, setClaimResult] = useState<{
    prizeAmount: number;
    isJackpot: boolean;
    totalClaimed: number;
    tier?: BoxTierType;
    tierName?: string;
    boxType?: string;
    boxCount?: number;
    boxes?: OpenedBoxItem[];
  } | null>(null);

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Config & Currency
  const { formatCurrency, t } = useAppConfig();

  // Saldo utama = saldo game.
  // Prioritaskan saldo user terbaru dari backend/session agar tidak tertahan
  // pada userProfile lama yang mungkin belum tersinkron.
  const unifiedWalletBalance =
    currentUser?.balance !== undefined
      ? Number(currentUser.balance)
      : Number(userProfile?.walletBalance ?? userProfile?.saldo ?? 0);

  // 1. Synchronize user profile & session automatically with backend whenever userProfile changes
  useEffect(() => {
    if (!userProfile) return;

    let isCancelled = false;
    const syncUnifiedSession = async () => {
      try {
        const res = await fetch('/api/auth/sync-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: userProfile.uid,
            email: userProfile.email,
            displayName: userProfile.displayName,
            role: userProfile.role,
            walletBalance: userProfile.walletBalance ?? 15000,
          }),
        });

        if (res.ok && !isCancelled) {
          const data = await res.json();
          localStorage.setItem('sys_stream_auth_token', data.token);
          localStorage.removeItem('blindbox_jwt_token');
          setJwtToken(data.token);
          setCurrentUser(data.user);
          fetchUserData(data.token);
        }
      } catch (err) {
        console.error('Failed to sync unified session:', err);
      }
    };

    syncUnifiedSession();

    return () => {
      isCancelled = true;
    };
  }, [userProfile?.uid, userProfile?.email, userProfile?.displayName, userProfile?.role, userProfile?.walletBalance]);

  // Load token on mount if no userProfile yet
  useEffect(() => {
    if (!userProfile) {
      const savedToken = localStorage.getItem('sys_stream_auth_token');
      if (savedToken) {
        setJwtToken(savedToken);
        fetchUserData(savedToken);
      }
    }
  }, [userProfile]);

  // Fetch current user & active deposit data
  const fetchUserData = async (token = jwtToken) => {
    let activeTok = token || getActiveToken();
    if (!activeTok) {
      if (userProfile || currentUser) {
        try {
          const u = userProfile || currentUser;
          const syncRes = await fetch('/api/auth/sync-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: u?.uid || (u as any)?.cuid,
              email: u?.email,
              displayName: (u as any)?.displayName || (u as any)?.username,
              role: (u as any)?.role,
              walletBalance: (u as any)?.walletBalance ?? (u as any)?.saldo ?? 15000,
            }),
          });
          if (syncRes.ok) {
            const syncData = await syncRes.json();
            activeTok = syncData.token;
            if (syncData.token) {
              setJwtToken(syncData.token);
              localStorage.setItem('sys_stream_auth_token', syncData.token);
              localStorage.removeItem('blindbox_jwt_token');
            }
          }
        } catch {}
      }
    }
    if (!activeTok) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${activeTok}` },
      });
      if (!res.ok) {
        if ((res.status === 401 || res.status === 403) && !userProfile && !currentUser) {
          handleLogout();
        }
        return;
      }
      const data = await res.json();
      setCurrentUser(data.user);

      const latestBalance = Number(
        data.user?.balance ??
        data.user?.walletBalance ??
        data.user?.saldo ??
        0
      );

      if (Number.isFinite(latestBalance)) {
        onUpdateWalletBalance?.(latestBalance);
      }

      const depositsRes = await fetch('/api/deposits', {
        headers: { Authorization: `Bearer ${activeTok}` },
      });

      if (!depositsRes.ok) {
        throw new Error('Gagal mengambil data Blind Box.');
      }

      const depositData = await depositsRes.json();

      const normalizeDeposit = (deposit: any) => {
        if (!deposit) return null;
        return {
          ...deposit,
          depositCode: deposit.depositCode ?? deposit.deposit_code,
          durationDays: Number(deposit.durationDays ?? deposit.duration_days ?? 0),
          startDate: deposit.startDate ?? deposit.start_date,
          endDate: deposit.endDate ?? deposit.end_date,
          totalClaimed: Number(deposit.totalClaimed ?? deposit.total_claimed ?? 0),
          forceJackpot: Boolean(deposit.forceJackpot ?? deposit.force_jackpot),
          createdAt: deposit.createdAt ?? deposit.created_at,
          amount: Number(deposit.amount ?? 0),
        };
      };

      const normalizedActiveDeposit = normalizeDeposit(depositData.activeDeposit);
      const normalizedAllDeposits = (depositData.deposits || []).map(normalizeDeposit);

      setActiveDeposit(normalizedActiveDeposit);
      setDepositTier(
        normalizedActiveDeposit
          ? getClientTierDetails(normalizedActiveDeposit.amount)
          : null
      );
      setAllDeposits(normalizedAllDeposits);
      setHasClaimedToday(Boolean(depositData.hasClaimedToday));
      setTodayClaimData(depositData.todayClaimData);
      setRecentClaims(depositData.recentClaims || []);
      setSettings(depositData.settings);

      if (depositData.wibTime) {
        setCountdownText(depositData.wibTime.countdownFormatted);
        setWibDateStr(depositData.wibTime.dateStr);
      }

    } catch (err) {
      console.error('Failed to fetch user data:', err);
    }
  };

  // Local ticker for countdown to 00:00 WIB
  useEffect(() => {
    const interval = setInterval(() => {
      // Calculate local countdown to next 00:00 WIB
      const now = new Date();
      const utcMillis = now.getTime();
      const wibOffsetMillis = 7 * 60 * 60 * 1000;
      const wibDate = new Date(utcMillis + wibOffsetMillis);

      const nextResetWib = new Date(
        Date.UTC(wibDate.getUTCFullYear(), wibDate.getUTCMonth(), wibDate.getUTCDate() + 1, 0, 0, 0)
      );
      const nextResetUtc = nextResetWib.getTime() - wibOffsetMillis;
      const diff = Math.max(0, nextResetUtc - utcMillis);

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdownText(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Automatic settlement: when a Blind Box lock reaches maturity,
  // return the principal to the same unified balance used by the game.
  useEffect(() => {
    const depositId = activeDeposit?.id;
    const endDate = activeDeposit?.endDate;

    if (!depositId || !endDate || activeDeposit?.status !== 'ACTIVE') {
      return;
    }

    const end = new Date(endDate).getTime();
    if (!Number.isFinite(end) || Date.now() < end) {
      return;
    }

    const token = getActiveToken();
    if (!token) return;

    let cancelled = false;

    const settleMaturedDeposit = async () => {
      try {
        const res = await fetch(`/api/deposits/${depositId}/settle`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          console.warn('Blind Box automatic settlement failed:', data);
          return;
        }

        if (cancelled) return;

        const newBalance = Number(data.balance);
        if (Number.isFinite(newBalance)) {
          setCurrentUser((prev) =>
            prev
              ? {
                  ...prev,
                  balance: newBalance,
                  lockedBalance: Number(data.lockedBalance ?? prev.lockedBalance ?? 0),
                }
              : prev
          );
          onUpdateWalletBalance?.(newBalance);
        }

        showToast(
          'success',
          `Lock Blind Box selesai. Principal Rp ${Number(data.amountReturned ?? activeDeposit.amount).toLocaleString('id-ID')} telah kembali ke saldo.`
        );

        await fetchUserData(token);
      } catch (error) {
        console.warn('Blind Box automatic settlement error:', error);
      }
    };

    void settleMaturedDeposit();

    return () => {
      cancelled = true;
    };
  }, [activeDeposit?.id, activeDeposit?.endDate, activeDeposit?.status]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('sys_stream_auth_token');
      localStorage.removeItem('sys_stream_auth_user');
      localStorage.removeItem('blindbox_jwt_token');
      localStorage.removeItem('sys_streamer_emergency_user');
    } catch {}
    setJwtToken(null);
    setCurrentUser(null);
    setActiveDeposit(null);
    setDepositTier(null);
    setShowAdminPanel(false);
    if (onLogoutApp) {
      onLogoutApp();
    }
  };

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Owner check
  const isOwner = Boolean(
    currentUser?.role === 'ADMIN' ||
    userProfile?.role === 'admin' ||
    userProfile?.email?.toLowerCase() === 'susidewiyuliyanti@gmail.com' ||
    currentUser?.email?.toLowerCase() === 'susidewiyuliyanti@gmail.com'
  );

  // Top-up instant balance (khusus Owner)
  const handleTopUpDemo = async (amount = 500000, targetUserId?: number) => {
    let activeTok = getActiveToken();
    if (!activeTok && (userProfile || currentUser)) {
      await fetchUserData();
      activeTok = getActiveToken();
    }
    if (!activeTok) {
      if (!isUserLoggedIn && onOpenAppAuth) {
        onOpenAppAuth();
      }
      return;
    }
    try {
      const res = await fetch('/api/auth/topup-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeTok}`,
        },
        body: JSON.stringify({ amount, targetUserId }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('success', `Saldo dompet +Rp ${amount.toLocaleString('id-ID')} berhasil ditambahkan!`);
        setShowTopUpOptions(false);
        if (!targetUserId || targetUserId === currentUser?.id) {
          if (userProfile?.uid && data.newBalance !== undefined) {
            try {
              await updateUserProfile(userProfile.uid, { walletBalance: data.newBalance });
              await createTransactionOrder({
                orderId: `TOPUP-${Date.now().toString(36).toUpperCase()}`,
                userId: userProfile.uid,
                userEmail: userProfile.email,
                planName: `Top Up Saldo Dompet (+Rp ${amount.toLocaleString('id-ID')})`,
                price: amount,
                currency: 'IDR',
                status: 'success',
                paymentMethod: 'Instant Top Up (Owner)',
                type: 'deposit',
                notes: 'Top up saldo dompet game oleh Owner',
                createdAt: new Date().toISOString(),
              });
            } catch (e) {
              console.warn('Error updating Firestore wallet:', e);
            }
            onUpdateWalletBalance?.(data.newBalance);
          }
        }
        fetchUserData();
        return data;
      } else {
        showToast('error', data.error || 'Gagal menambah saldo.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Gagal terhubung ke server.');
    }
  };

  // Action: Make Deposit (Tanpa batasan nominal, minimal Rp 50.000)
  const handleMakeDeposit = async () => {
    let token = getActiveToken();
    if (!token && (userProfile || currentUser)) {
      try {
        const u = userProfile || currentUser;
        const syncRes = await fetch('/api/auth/sync-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: u?.uid || (u as any)?.cuid,
            email: u?.email,
            displayName: (u as any)?.displayName || (u as any)?.username,
            role: (u as any)?.role,
            walletBalance: (u as any)?.walletBalance ?? (u as any)?.saldo ?? 15000,
          }),
        });
        if (syncRes.ok) {
          const syncData = await syncRes.json();
          token = syncData.token;
          setJwtToken(syncData.token);
          if (syncData.token) {
            localStorage.setItem('sys_stream_auth_token', syncData.token);
            localStorage.removeItem('blindbox_jwt_token');
          }
        }
      } catch {}
    }

    if (!token) {
      if (!isUserLoggedIn && onOpenAppAuth) {
        onOpenAppAuth();
      }
      return;
    }

    if (
      isNaN(customDepositAmount) ||
      customDepositAmount < 50000 ||
      customDepositAmount % 10000 !== 0
    ) {
      showToast(
        'error',
        'Nominal deposit minimal Rp 50.000 (bebas tanpa batas maksimal)!'
      );
      return;
    }

    if (unifiedWalletBalance < customDepositAmount) {
      showToast('error', `Saldo dompet terpadu tidak mencukupi. Silakan isi saldo minimal Rp ${customDepositAmount.toLocaleString('id-ID')}.`);
      return;
    }

    setIsDepositing(true);
    try {
      const res = await fetch('/api/deposits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: customDepositAmount,
          durationDays: selectedDuration,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal membuat deposit.');
      }

      // Synchronize the unified wallet immediately after a successful lock.
      const syncedRemainingBalance = Number(data.remainingBalance ?? data.remainingSaldo ?? 0);
      const syncedLockedBalance = Number(data.lockedBalance ?? currentUser?.lockedBalance ?? 0);

      if (userProfile?.uid && Number.isFinite(syncedRemainingBalance)) {
        try {
          await updateUserProfile(userProfile.uid, {
            walletBalance: syncedRemainingBalance,
            saldo: syncedRemainingBalance,
          });
          await createTransactionOrder({
            orderId: `DEP-LOCK-${Date.now().toString(36).toUpperCase()}`,
            userId: userProfile.uid,
            userEmail: userProfile.email,
            planName: `Penguncian Deposit Blind Box 3D (${selectedDuration} Hari)`,
            price: customDepositAmount,
            currency: 'IDR',
            status: 'success',
            paymentMethod: 'Dompet Terpadu SYS',
            type: 'deposit',
            durationDays: selectedDuration,
            notes: `Penguncian saldo deposit game Blind Box 3D senilai Rp ${customDepositAmount.toLocaleString('id-ID')} selama ${selectedDuration} hari`,
            createdAt: new Date().toISOString(),
          });
        } catch (e) {
          console.warn('Error updating Firestore wallet on deposit:', e);
        }
      }

      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              balance: syncedRemainingBalance,
              lockedBalance: syncedLockedBalance,
            }
          : prev
      );
      onUpdateWalletBalance?.(syncedRemainingBalance);

      showToast(
        'success',
        `Deposit Rp ${customDepositAmount.toLocaleString('id-ID')} (${selectedDuration} Hari) aktif! Saldo dompet terpadu Anda terpotong otomatis.`
      );
      fetchUserData();
    } catch (err: any) {
      showToast('error', err.message);
    } finally {
      setIsDepositing(false);
    }
  };

  // Action: Claim Blind Box
  const handleClaimBlindBox = async () => {
    let token = getActiveToken();
    if (!token && (userProfile || currentUser)) {
      try {
        const u = userProfile || currentUser;
        const syncRes = await fetch('/api/auth/sync-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: u?.uid || (u as any)?.cuid,
            email: u?.email,
            displayName: (u as any)?.displayName || (u as any)?.username,
            role: (u as any)?.role,
            walletBalance: (u as any)?.walletBalance ?? (u as any)?.saldo ?? 15000,
          }),
        });
        if (syncRes.ok) {
          const syncData = await syncRes.json();
          token = syncData.token;
          setJwtToken(syncData.token);
          if (syncData.token) {
            localStorage.setItem('sys_stream_auth_token', syncData.token);
            localStorage.removeItem('blindbox_jwt_token');
          }
        }
      } catch {}
    }

    if (!token) {
      if (!isUserLoggedIn && onOpenAppAuth) {
        onOpenAppAuth();
      }
      return;
    }
    if (!activeDeposit) {
      showToast('error', 'Silakan lakukan deposit minimal Rp 50.000 terlebih dahulu.');
      return;
    }
    if (hasClaimedToday) {
      showToast('error', 'Anda sudah mengklaim Blind Box hari ini. Reset pukul 00:00 WIB!');
      return;
    }

    setIsClaiming(true);
    try {
      const res = await fetch(`/api/deposits/${activeDeposit.id}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengklaim Blind Box.');
      }

      setClaimResult({
        prizeAmount: data.prizeAmount,
        isJackpot: data.isJackpot,
        totalClaimed: data.totalClaimed,
        tier: data.tier,
        tierName: data.tierName,
        boxType: data.boxType,
        boxCount: data.boxCount,
        boxes: data.boxes,
      });
      setShowOpenModal(true);
      setHasClaimedToday(true);

      // Synchronize prize reward with Firestore and App unified wallet
      if (userProfile?.uid && data.userBalance !== undefined) {
        try {
          await updateUserProfile(userProfile.uid, { walletBalance: data.userBalance });
          await createTransactionOrder({
            orderId: `PRIZE-${Date.now().toString(36).toUpperCase()}`,
            userId: userProfile.uid,
            userEmail: userProfile.email,
            planName: data.isJackpot
              ? `🎉 JACKPOT SULTAN!`
              : `🎁 Hadiah Hari Ini`,
            price: data.prizeAmount,
            currency: 'IDR',
            status: 'success',
            paymentMethod: 'Reward Game Blind Box',
            type: 'bonus',
            notes: `Klaim harian Blind Box 3D pada tanggal ${wibDateStr}`,
            createdAt: new Date().toISOString(),
          });
        } catch (e) {
          console.warn('Error updating Firestore wallet on claim:', e);
        }
        onUpdateWalletBalance?.(data.userBalance);
      }

      fetchUserData();
    } catch (err: any) {
      showToast('error', err.message);
    } finally {
      setIsClaiming(false);
    }
  };

  // Withdraw success handler
  const handleWithdrawSuccess = async (payout: number, newBalance: number) => {
    showToast('success', `Penarikan modal + hadiah Rp ${payout.toLocaleString('id-ID')} berhasil dicairkan!`);
    if (userProfile?.uid) {
      try {
        await updateUserProfile(userProfile.uid, { walletBalance: newBalance });
        await createTransactionOrder({
          orderId: `WD-BOX-${Date.now().toString(36).toUpperCase()}`,
          userId: userProfile.uid,
          userEmail: userProfile.email,
          planName: `Pencairan Modal + Hadiah Blind Box 3D`,
          price: payout,
          currency: 'IDR',
          status: 'success',
          paymentMethod: 'Pencairan Blind Box',
          type: 'withdrawal',
          notes: `Pencairan deposit modal dan hasil hadiah game Blind Box`,
          createdAt: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Error updating Firestore wallet on withdraw:', e);
      }
      onUpdateWalletBalance?.(newBalance);
    }
    fetchUserData();
  };

  // Unlock deposit success handler (early refund, reward forfeited)
  const handleUnlockSuccess = async (refundedAmount: number, forfeitedReward: number, newBalance: number) => {
    showToast(
      'success',
      `Kunci berhasil dibuka! Modal Rp ${refundedAmount.toLocaleString('id-ID')} kembali ke dompet. Reward Rp ${forfeitedReward.toLocaleString('id-ID')} telah hangus.`
    );
    if (userProfile?.uid) {
      try {
        await updateUserProfile(userProfile.uid, { walletBalance: newBalance });
        await createTransactionOrder({
          orderId: `UNLOCK-BOX-${Date.now().toString(36).toUpperCase()}`,
          userId: userProfile.uid,
          userEmail: userProfile.email,
          planName: `Unlock Blind Box Deposit Principal (+Rp ${refundedAmount.toLocaleString('id-ID')})`,
          price: refundedAmount,
          currency: 'IDR',
          status: 'success',
          paymentMethod: 'Unlock (Principal Refund)',
          type: 'deposit',
          notes: `Early unlock of deposit balance. Principal Rp ${refundedAmount.toLocaleString('id-ID')} returned to wallet. Accumulated reward Rp ${forfeitedReward.toLocaleString('id-ID')} forfeited.`,
          createdAt: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Error updating Firestore wallet on unlock:', e);
      }
      onUpdateWalletBalance?.(newBalance);
    }
    fetchUserData();
  };

  // Render Admin View if toggled
  if (showAdminPanel && jwtToken && isOwner) {
    return (
      <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-slate-950 to-black text-white p-2 sm:p-6">
        <BlindBoxAdminPanel
          jwtToken={jwtToken}
          onBack={() => setShowAdminPanel(false)}
          onRefreshUser={() => fetchUserData()}
          currentUserBalance={unifiedWalletBalance}
          currentUserId={currentUser?.id}
          currentUserEmail={userProfile?.email || currentUser?.email}
          onTopUp={(amount, targetUserId) => handleTopUpDemo(amount, targetUserId)}
        />
      </div>
    );
  }

  // Calculate days remaining for active deposit
  let daysRemaining = 0;
  let depositProgressPct = 0;
  if (activeDeposit) {
    const start = new Date(activeDeposit.startDate).getTime();
    const end = new Date(activeDeposit.endDate).getTime();
    const now = Date.now();
    const totalMs = end - start;
    const elapsedMs = Math.max(0, now - start);
    depositProgressPct = Math.min(100, Math.round((elapsedMs / totalMs) * 100));
    daysRemaining = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  }

  return (
    <div className="min-h-screen bg-slate-950 bg-neutral-950 text-white p-3 sm:p-6 select-none font-sans">
      {/* Toast message */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed top-4 right-4 z-50 p-4 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2 max-w-sm border backdrop-blur-md ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : 'bg-red-950/90 border-red-500/50 text-red-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </motion.div>
      )}

      {/* Main Container */}
      <div className="max-w-5xl mx-auto space-y-6">
        {/* TOP BAR / USER PROFILE */}
        <header className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-2xl bg-neutral-900/90 border border-amber-500/30 backdrop-blur-md shadow-lg shadow-amber-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500">
                  "Blind Box Game" Win BIG
                </h1>
              </div>
              <p className="text-[11px] text-white/60">
                Kunci Deposit Kelipatan 50.000 (Max 5 Juta) • Klaim Box Tiap Hari Jam 00:00 WIB • Jackpot Rp 100 - Rp 50.000.000
              </p>
            </div>
          </div>

          {/* User Status / 1 Master Menu Button ("Rapihkan menu dalam 1 button") */}
          <div className="flex items-center gap-2">
            {isUserLoggedIn ? (
              <div className="flex items-center gap-2">
                {/* Quick Saldo Pill */}
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenAppProfile) onOpenAppProfile();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-black shadow-inner transition-all hover:brightness-110 cursor-pointer"
                  title="Klik untuk Buka Dompet Terpadu & Deposit Crypto"
                >
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{formatCurrency(unifiedWalletBalance)}</span>
                </button>
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 border border-amber-500/40 text-amber-300 text-xs font-mono font-black shadow-inner"
                  title="Saldo yang sedang terkunci di Blind Box"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{formatCurrency(Number(currentUser?.lockedBalance ?? 0))}</span>
                </div>

                {/* THE 1 MASTER MENU BUTTON */}
                <button
                  type="button"
                  id="btn-blindbox-master-menu"
                  onClick={() => setIsMenuOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-400 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-xs shadow-sm transition-all hover:brightness-110 active:scale-95 cursor-pointer group"
                  title="Buka Menu Lengkap Blind Box & Akun"
                >
                  <Menu className="w-4 h-4 text-slate-950 group-hover:rotate-90 transition-transform" />
                  <span>Menu</span>
                  {(currentUser?.role === 'ADMIN' || userProfile?.role === 'admin' || userProfile?.email?.toLowerCase() === 'susidewiyuliyanti@gmail.com') && (
                    <Crown className="w-3.5 h-3.5 text-slate-950" />
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (onOpenAppAuth) {
                    onOpenAppAuth();
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 text-xs font-black shadow-sm transition-all hover:brightness-110 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Akun SYS Utama</span>
              </button>
            )}
          </div>
        </header>

        {/* CONSOLIDATED MASTER MENU DRAWER (1 BUTTON MENU) */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/75 backdrop-blur-sm animate-fadeIn">
            <div className="absolute inset-0 cursor-pointer" onClick={() => setIsMenuOpen(false)} />
            <div className="relative w-full sm:max-w-md h-full bg-neutral-950 border-l border-amber-500/30 shadow-2xl flex flex-col justify-between overflow-y-auto z-10 font-sans">
              <div className="space-y-4">
                {/* Header Menu */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-neutral-900">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-amber-300">Menu Blind Box 3D</h3>
                      <p className="text-[10px] text-white/50">Pengaturan Akun & Dompet Game</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Profile Card */}
                <div className="p-4 mx-4 rounded-2xl bg-neutral-900/90 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold flex items-center justify-center text-sm">
                        {userProfile?.displayName?.charAt(0) || currentUser?.username?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{userProfile?.displayName || (currentUser?.username ? `@${currentUser.username}` : 'Host Streamer')}</span>
                        </div>
                        <div className="text-[10px] text-white/50 font-mono">
                          {userProfile?.email || currentUser?.email || 'Akun Terpadu'}
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase">
                      {currentUser?.role === 'ADMIN' || userProfile?.role === 'admin' || userProfile?.email?.toLowerCase() === 'susidewiyuliyanti@gmail.com'
                        ? 'Owner'
                        : 'Player'}
                    </span>
                  </div>
                </div>

                {/* Saldo Dompet Terpadu & Crypto */}
                <div className="p-4 mx-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/60 flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-emerald-400" />
                      <span>Dompet Terpadu:</span>
                    </span>
                    <span className="text-sm font-black font-mono text-emerald-300">
                      {formatCurrency(unifiedWalletBalance)}
                    </span>
                  </div>

                  {onOpenAppProfile && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenAppProfile();
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-emerald-400" />
                        <span>Isi Saldo & Penarikan Crypto (USDT)</span>
                      </span>
                      <ChevronRight className="w-4 h-4 opacity-70" />
                    </button>
                  )}
                </div>

                {/* Status Saldo Terkunci */}
                <div className="p-4 mx-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
                  <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
                    Status Saldo Terkunci:
                  </div>

                  {activeDeposit && activeDeposit.status === 'ACTIVE' ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-amber-300/80">Nominal Terkunci:</span>
                        <span className="font-mono font-black text-white">
                          Rp {activeDeposit.amount.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/50">Masa Waktu:</span>
                        <span className="font-bold text-cyan-300">
                          {activeDeposit.durationDays} Hari ({activeDeposit.durationDays === 90 ? 'Emas 10 Box' : activeDeposit.durationDays === 60 ? 'Platinum 5 Box' : 'Silver 3 Box'})
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setShowUnlockModal(true);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Unlock Balance (Forfeit Rewards)</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-white/50 py-1">
                      No locked deposit balance yet. Lock deposits starting from Rp 1,000,000 to receive daily Blind Boxes.
                    </div>
                  )}
                </div>

                {/* Khusus Owner: Panel Owner */}
                {(currentUser?.role === 'ADMIN' || userProfile?.role === 'admin' || userProfile?.email?.toLowerCase() === 'susidewiyuliyanti@gmail.com') && (
                  <div className="px-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setShowAdminPanel(true);
                      }}
                      className="w-full p-3 rounded-2xl bg-neutral-900 hover:from-red-600/40 hover:to-amber-600/40 border border-amber-500/40 flex items-center justify-between text-xs font-black text-amber-300 shadow-md transition-all cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-400" />
                        <span>Panel Owner: Otorisasi Jackpot & Group Lock</span>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                        Owner
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Logout */}
              <div className="p-4 border-t border-white/10 bg-black/40">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>Keluar Akun</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TIME & COUNTDOWN BANNER (00:00 WIB RESET NOTICE) */}
        <div className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-2xl bg-neutral-900 border border-amber-500/30">
          <div className="flex items-center gap-2.5">
            <Timer className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-extrabold text-amber-200">
                Reset Harian Pukul 00:00 WIB
              </div>
              <div className="text-[11px] text-amber-300/70">
                ⚠️ Peraturan Game: Klaim sebelum jam 23:59 WIB setiap hari, atau kesempatan hari tersebut akan <strong>hangus</strong>!
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-black/60 px-3.5 py-1.5 rounded-xl border border-amber-500/40">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] text-white/70 font-bold">Sisa Waktu Klaim Hari Ini:</span>
            <span className="font-mono text-sm font-black text-amber-300">
              {countdownText}
            </span>
          </div>
        </div>

        {/* MAIN GAMEPLAY GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: 3D BOX SCENE & ACTION BUTTON */}
          <div className="lg:col-span-7 flex flex-col justify-between p-6 rounded-3xl bg-neutral-900/80 border border-amber-500/30 shadow-xl relative overflow-hidden">
            {/* Background cyber radial */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-amber-400" />
                  <span>3D Interactive Blind Box</span>
                </span>

                <div className="text-right">
                  <span className="text-[10px] text-white/50 block font-bold">Peluang Hadiah:</span>
                  <span className="text-xs font-black text-amber-300">
                    Rp 100 - Rp 1.000 Rp 100 - Rp 50.000.000
                  </span>
                </div>
              </div>

              {/* 3D Box interactive stage */}
              <div className="my-4">
                <BlindBox3DScene
                  isOpened={hasClaimedToday}
                  prizeAmount={todayClaimData?.amount ?? null}
                  isJackpot={todayClaimData?.isJackpot ?? false}
                  onBoxClick={handleClaimBlindBox}
                  canClick={Boolean(activeDeposit && activeDeposit.status === 'ACTIVE' && !hasClaimedToday)}
                  tier={depositTier?.tier || (activeDeposit ? getClientTierDetails(activeDeposit.amount).tier : getClientTierDetails(customDepositAmount).tier)}
                  boxCount={depositTier?.boxCount || (activeDeposit ? getClientTierDetails(activeDeposit.amount).boxCount : getClientTierDetails(customDepositAmount).boxCount)}
                  boxLabel={depositTier ? `${depositTier.boxCount} ${depositTier.boxType}` : `${getClientTierDetails(activeDeposit?.amount || customDepositAmount).boxCount} ${getClientTierDetails(activeDeposit?.amount || customDepositAmount).boxType}`}
                />
              </div>
            </div>

            {/* ACTION CTA BUTTON */}
            <div className="mt-4 space-y-2">
              {!isUserLoggedIn ? (
                <button
                  onClick={() => {
                    if (onOpenAppAuth) onOpenAppAuth();
                  }}
                  className="w-full py-4 rounded-2xl bg-amber-400 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-base shadow-lg transition-all hover:brightness-110 active:brightness-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Masuk untuk Mulai Main Blind Box</span>
                </button>
              ) : !activeDeposit ? (
                <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 text-center">
                  <p className="text-xs text-white/70">
                    Anda belum memiliki Deposit Aktif. Pilih paket durasi di sebelah kanan untuk mengaktifkan deposit (Mulai Rp 50.000 s/d Rp 5.000.000)!
                  </p>
                </div>
              ) : activeDeposit.status === 'EXPIRED' ? (
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="w-full py-4 rounded-2xl bg-emerald-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/25 transition-all hover:brightness-110 active:brightness-95 flex items-center justify-center gap-2 animate-bounce"
                >
                  <ArrowDownToLine className="w-5 h-5" />
                  <span>Masa Kunci Selesai! Tarik Modal + Hadiah (Withdraw)</span>
                </button>
              ) : hasClaimedToday ? (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-1">
                  <div className="flex items-center justify-center gap-2 text-emerald-300 font-extrabold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Anda Sudah Mengklaim Blind Box Hari Ini!</span>
                  </div>
                  <p className="text-[11px] text-emerald-200/70">
                    Hadiah hari ini: <strong className="text-white">Rp {todayClaimData?.amount.toLocaleString('id-ID')}</strong> ({depositTier ? `${depositTier.boxCount} ${depositTier.boxType}` : 'Blind Box'}). Kesempatan berikutnya dibuka pukul 00:00 WIB (Sisa {countdownText}).
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleClaimBlindBox}
                  disabled={isClaiming}
                  className="w-full py-4 rounded-2xl bg-amber-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-base shadow-lg transition-all hover:brightness-110 active:brightness-95 flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Gift className="w-5 h-5 text-slate-950 group-hover:rotate-12 transition-transform" />
                  <span>
                    {isClaiming
                      ? 'Membuka Box...'
                      : `🎁 Buka ${depositTier ? `${depositTier.boxCount} ${depositTier.boxType}` : 'Blind Box'} Hari Ini Sekarang!`}
                  </span>
                </button>
              )}

              {/* Quick early unlock link if deposit is locked */}
              {activeDeposit && activeDeposit.status === 'ACTIVE' && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setShowUnlockModal(true)}
                    className="inline-flex items-center gap-1.5 text-[11px] text-red-300/80 hover:text-red-200 transition-colors underline cursor-pointer"
                    title="Buka Kunci Saldo (Catatan: Reward blind box akan hangus/hilang)"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Buka Kunci Modal (Rp {activeDeposit.amount.toLocaleString('id-ID')}) • Catatan: Reward akan hangus</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: DEPOSIT ACTIVE CARD OR CHOOSE DURATION PACKAGE */}
          <div className="lg:col-span-5 space-y-6">
            {/* CURRENT ACTIVE DEPOSIT CARD */}
            {activeDeposit ? (
              <div className="p-5 rounded-3xl bg-neutral-900/80 border border-amber-500/40 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-black text-amber-300">Status Deposit Aktif</h3>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      activeDeposit.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                    }`}
                  >
                    {activeDeposit.status}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">Modal Dikunci:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">
                        Rp {activeDeposit.amount.toLocaleString('id-ID')}
                      </span>
                      {activeDeposit.status === 'ACTIVE' && (
                        <button
                          type="button"
                          onClick={() => setShowUnlockModal(true)}
                          className="px-2 py-0.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-white border border-red-500/40 text-[10px] font-extrabold transition-all flex items-center gap-1 cursor-pointer hover:brightness-110 active:scale-95"
                          title="Buka Kunci Saldo (Catatan: Reward blind box akan hangus/hilang)"
                        >
                          <Unlock className="w-3 h-3" />
                          <span>Buka Kunci</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Durasi Paket:</span>
                    <span className="font-bold text-amber-300">
                      {activeDeposit.durationDays} Hari
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Sisa Masa Kunci:</span>
                    <span className="font-bold text-white font-mono">
                      {daysRemaining} Hari Lagi
                    </span>
                  </div>
                  <div className="flex justify-between text-xs pt-1 border-t border-white/10">
                    <span className="text-white/80 font-bold">Total Hadiah Terkumpul:</span>
                    <span className="font-mono font-black text-emerald-400 text-sm">
                      Rp {activeDeposit.totalClaimed.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Tier status badge */}
                  <div className="flex justify-between items-center text-xs py-1.5 px-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <span className="text-amber-200/90 font-bold">Tier Reward Blind Box:</span>
                    <span className="font-black text-amber-300 flex items-center gap-1.5">
                      <span>
                        {(depositTier?.tier || getClientTierDetails(activeDeposit.amount).tier) === 'GOLD'
                            ? '🥇'
                          : (depositTier?.tier || getClientTierDetails(activeDeposit.amount).tier) === 'PLATINUM'
                            ? '💎'
                          : (depositTier?.tier || getClientTierDetails(activeDeposit.amount).tier) === 'SILVER'
                            ? '🥈'
                            : '🥉'}
                      </span>
                      <span>
                        {depositTier
                          ? `${depositTier.boxCount} ${depositTier.boxType}`
                          : `${getClientTierDetails(activeDeposit.amount).boxCount} ${getClientTierDetails(activeDeposit.amount).boxType}`}{' '}
                        / Hari
                      </span>
                    </span>
                  </div>
                </div>

                {/* Progress bar of lock period */}
                <div>
                  <div className="flex justify-between text-[11px] text-white/60 mb-1 font-bold">
                    <span>Masa Kunci Berjalan</span>
                    <span>{depositProgressPct}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-500"
                      style={{ width: `${depositProgressPct}%` }}
                    />
                  </div>
                </div>

                {/* Early Unlock Action Card with Explicit Warning Note */}
                {activeDeposit.status === 'ACTIVE' && (
                  <div className="p-3.5 rounded-2xl bg-red-950/20 border border-red-500/40 space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-[11px] text-white/80 leading-relaxed">
                        <strong className="text-red-400">Opsi Buka Kunci Saldo:</strong> Ingin mencairkan modal sebelum masa kunci selesai? Modal Rp {activeDeposit.amount.toLocaleString('id-ID')} akan dikembalikan, namun seluruh reward Blind Box yang sudah didapat (<span className="text-amber-300 font-bold">Rp {activeDeposit.totalClaimed.toLocaleString('id-ID')}</span>) akan <strong className="text-rose-400 underline">hangus/hilang</strong>.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowUnlockModal(true)}
                      className="w-full py-2.5 rounded-xl bg-red-600 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Buka Kunci Saldo (Reward Akan Hangus)</span>
                    </button>
                  </div>
                )}

                {activeDeposit.status === 'EXPIRED' && (
                  <button
                    onClick={() => setShowWithdrawModal(true)}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowDownToLine className="w-4 h-4" />
                    <span>Withdraw Modal Rp {activeDeposit.amount.toLocaleString('id-ID')} + Hasil Hadiah</span>
                  </button>
                )}
              </div>
            ) : (
              /* CHOOSE PACKAGE FOR NEW DEPOSIT */
              <div className="p-5 rounded-3xl bg-neutral-900/80 border border-amber-500/30 shadow-xl space-y-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-black text-amber-300">
                    Deposit Lock & Lock Duration
                  </h3>
                </div>

                <p className="text-xs text-white/60 leading-relaxed">
                  Select deposit amount (<strong>multiples of Rp 50,000 up to Rp 5,000,000</strong>) and lock duration. During the active period, you can claim 1x Blind Box daily at 00:00 WIB. After the lock period ends, your entire initial capital and accumulated prizes can be withdrawn.
                </p>

                {/* 1. Duration options: 30, 60, 90 */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                    Select Lock Duration:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[30, 60, 90].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setSelectedDuration(days as any)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          selectedDuration === days
                            ? 'bg-amber-500/15 border-amber-400 shadow-md shadow-amber-500/20'
                            : 'bg-black/40 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="text-lg font-black text-white font-mono">{days}</div>
                        <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold">
                          Hari
                        </div>
                        <div className="text-[9px] text-white/40 mt-0.5">
                          {days}x Box
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Custom Deposit Amount (Kelipatan 50.000 Max 5.000.000) */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span>Nominal Kunci Deposit:</span>
                    </label>
                    <span className="text-[10px] text-amber-300/80 font-mono font-bold">
                      Kelipatan 50.000 (Max 5 Juta)
                    </span>
                  </div>

                  {/* Stepper + Big Nominal Display + Custom Direct Input */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={customDepositAmount <= 50000}
                        onClick={() => setCustomDepositAmount((prev) => Math.max(50000, prev - 50000))}
                        className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all cursor-pointer"
                        title="Kurangi Rp 50.000"
                      >
                        <MinusCircle className="w-5 h-5 text-amber-300" />
                      </button>

                      <div className="flex-1 p-2.5 rounded-xl bg-black/70 border border-amber-500/40 text-center relative">
                        <div className="text-[10px] text-white/50 font-bold uppercase">Total Modal Lock Dana</div>
                        <div className="text-lg sm:text-2xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500">
                          Rp {customDepositAmount.toLocaleString('id-ID')}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCustomDepositAmount((prev) => prev + 50000)}
                        className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                        title="Tambah Rp 50.000"
                      >
                        <PlusCircle className="w-5 h-5 text-amber-300" />
                      </button>
                    </div>

                    {/* Manual Custom Input Field for any nominal without limit */}
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50 font-bold text-xs">
                        Rp Manual:
                      </span>
                      <input
                        type="number"
                        min={50000}
                        step={10000}
                        value={customDepositAmount}
                        onChange={(e) => setCustomDepositAmount(Math.max(0, parseInt(e.target.value) || 0))}
                        placeholder="Ketik nominal bebas (Cth: 10000000)..."
                        className="w-full bg-black/60 border border-white/15 rounded-xl pl-24 pr-4 py-2 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Quick preset chips without nominal limit */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider flex items-center justify-between">
                      <span>Pilihan Cepat Nominal (Bebas / Tanpa Batas):</span>
                      <span className="text-emerald-400 font-normal">Min. 50 Ribu</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[50000, 100000, 250000, 500000, 1000000, 2500000, 5000000, 10000000, 20000000, 50000000, 100000000].map((nominal) => (
                        <button
                          key={nominal}
                          type="button"
                          onClick={() => setCustomDepositAmount(nominal)}
                          className={`px-2.5 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all cursor-pointer ${
                            customDepositAmount === nominal
                              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/40 font-black ring-1 ring-amber-300'
                              : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/10'
                          }`}
                        >
                          {nominal >= 1000000
                            ? `${nominal / 1000000} Jt`
                            : `${nominal / 1000} Rb`}
                            {nominal === 100000000 && ' (Sultan++)'}
                            {nominal === 50000000 && ' (Sultan)'}
                            {nominal === 20000000 && ' (Diamond)'}
                            {nominal === 5000000 && ' (Gold)'}
                            {nominal === 2500000 && ' (Platinum)'}
                            {nominal === 1000000 && ' (Silver)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* DYNAMIC REWARD PERCENTAGE GENERATOR DISPLAY */}
                  <div className="p-3.5 rounded-2xl bg-neutral-900 border border-amber-500/35 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        Persentase Reward Tergenerate:
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-extrabold text-[11px] border border-emerald-500/30">
                        {getEstimatedRewardPercent(customDepositAmount).min}% - {getEstimatedRewardPercent(customDepositAmount).max}% / hari
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10 text-[11px]">
                      <div>
                        <span className="text-white/50 block">Estimasi Profit Harian:</span>
                        <span className="font-mono font-bold text-emerald-300">
                          Rp {Math.round(customDepositAmount * (getEstimatedRewardPercent(customDepositAmount).min / 100)).toLocaleString('id-ID')} s/d Rp {Math.round(customDepositAmount * (getEstimatedRewardPercent(customDepositAmount).max / 100)).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/50 block">Estimasi Total ({selectedDuration} Hari):</span>
                        <span className="font-mono font-bold text-amber-300">
                          Rp {Math.round(customDepositAmount * (getEstimatedRewardPercent(customDepositAmount).min / 100) * selectedDuration).toLocaleString('id-ID')} s/d Rp {Math.round(customDepositAmount * (getEstimatedRewardPercent(customDepositAmount).max / 100) * selectedDuration).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* TIER BENEFIT CARDS (Silver, Platinum, Gold, Diamond, Sultan) */}
                  <div className="pt-1">
                    <div className="text-[10px] text-white/60 font-bold uppercase tracking-wider mb-1.5">
                      Pilihan Tier Spesial Blind Box:
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                      {/* Tier Silver */}
                      <button
                        type="button"
                        onClick={() => setCustomDepositAmount(1000000)}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          customDepositAmount === 1000000
                            ? 'bg-slate-800/90 border-slate-300 ring-1 ring-slate-300 shadow-md'
                            : 'bg-black/40 border-slate-500/30 hover:border-slate-400/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs"></span>
                          <span className="text-[9px] font-mono text-slate-300 font-bold">1 Jt</span>
                        </div>
                        <div className="text-[11px] font-black text-white mt-0.5">3 Box Silver</div>
                        <div className="text-[8px] text-slate-400">0.8% - 1.5%/hari</div>
                      </button>

                      {/* Tier Platinum */}
                      <button
                        type="button"
                        onClick={() => setCustomDepositAmount(2500000)}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          customDepositAmount === 2500000
                            ? 'bg-purple-950/80 border-purple-400 ring-1 ring-purple-300 shadow-md shadow-purple-500/20'
                            : 'bg-black/40 border-purple-500/30 hover:border-purple-400/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs"></span>
                          <span className="text-[9px] font-mono text-purple-300 font-bold">2.5 Jt</span>
                        </div>
                        <div className="text-[11px] font-black text-white mt-0.5">5 Box Platinum</div>
                        <div className="text-[8px] text-purple-300/70">1.2% - 2.0%/hari</div>
                      </button>

                      {/* Tier Emas */}
                      <button
                        type="button"
                        onClick={() => setCustomDepositAmount(5000000)}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          customDepositAmount === 5000000
                            ? 'bg-amber-950/80 border-amber-400 ring-1 ring-yellow-300 shadow-md shadow-amber-500/20'
                            : 'bg-black/40 border-amber-500/30 hover:border-amber-400/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs"></span>
                          <span className="text-[9px] font-mono text-amber-300 font-bold">5 Jt</span>
                        </div>
                        <div className="text-[11px] font-black text-amber-300 mt-0.5">10 Box Emas</div>
                        <div className="text-[8px] text-amber-400/70">1.5% - 2.5%/hari</div>
                      </button>

                      {/* Tier Diamond */}
                      <button
                        type="button"
                        onClick={() => setCustomDepositAmount(20000000)}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          customDepositAmount === 20000000
                            ? 'bg-cyan-950/80 border-cyan-400 ring-1 ring-cyan-300 shadow-md shadow-cyan-500/20'
                            : 'bg-black/40 border-cyan-500/30 hover:border-cyan-400/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs"></span>
                          <span className="text-[9px] font-mono text-cyan-300 font-bold">20 Jt</span>
                        </div>
                        <div className="text-[11px] font-black text-cyan-300 mt-0.5">15 Box Diamond</div>
                        <div className="text-[8px] text-cyan-400/70">2.0% - 3.0%/hari</div>
                      </button>

                      {/* Tier Sultan VIP */}
                      <button
                        type="button"
                        onClick={() => setCustomDepositAmount(50000000)}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          customDepositAmount === 50000000
                            ? 'bg-rose-950/80 border-rose-400 ring-1 ring-rose-300 shadow-md shadow-rose-500/20'
                            : 'bg-black/40 border-rose-500/30 hover:border-rose-400/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs"></span>
                          <span className="text-[9px] font-mono text-rose-300 font-bold">50 Jt</span>
                        </div>
                        <div className="text-[11px] font-black text-rose-300 mt-0.5">25 Box Sultan</div>
                        <div className="text-[8px] text-rose-400/70">2.5% - 3.5%/hari</div>
                      </button>
                    </div>
                  </div>

                  {/* Input Validation check */}
                  {customDepositAmount < 50000 && (
                    <div className="p-2 rounded-lg bg-red-950/60 border border-red-500/40 text-[11px] text-red-300 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Nominal minimal deposit adalah Rp 50.000!</span>
                    </div>
                  )}
                </div>

                {/* Package summary */}
                <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-xs space-y-1.5">
                  <div className="flex justify-between text-white/70">
                    <span>Nominal Modal Dikunci:</span>
                    <span className="font-mono text-amber-300 font-bold">
                      Rp {customDepositAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Hadiah Harian Tier:</span>
                    <span className="font-bold text-amber-300">
                      {getClientTierDetails(customDepositAmount).boxCount}{' '}
                      {getClientTierDetails(customDepositAmount).boxType}
                    </span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Total Kesempatan Buka Box:</span>
                    <span className="font-bold text-amber-300">
                      {selectedDuration} Hari ({selectedDuration * getClientTierDetails(customDepositAmount).boxCount} Box Total)
                    </span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Potensi Hadiah + Jackpot:</span>
                    <span className="font-bold text-emerald-400">Rp 100 s/d Rp 50.000.000 (Mengikuti Nominal)</span>
                  </div>
                  <div className="flex justify-between text-white/50 pt-1 border-t border-white/10 text-[11px]">
                    <span>Saldo Dompet Terpadu:</span>
                    <span className={`font-mono font-bold ${unifiedWalletBalance < customDepositAmount ? 'text-red-400' : 'text-emerald-400'}`}>
                      {formatCurrency(unifiedWalletBalance)}
                    </span>
                  </div>
                </div>

                {unifiedWalletBalance < customDepositAmount && (
                  <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs flex items-center justify-between">
                    <span className="text-amber-200 text-[11px]">
                      Saldo kurang {formatCurrency(customDepositAmount - unifiedWalletBalance)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {onOpenAppProfile && (
                        <button
                          type="button"
                          onClick={onOpenAppProfile}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[10px] cursor-pointer transition-all border border-emerald-500/30"
                        >
                          Deposit Crypto
                        </button>
                      )}
                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => handleTopUpDemo(customDepositAmount)}
                          className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[10px] cursor-pointer transition-all"
                          title="Tambah Saldo Instan (Khusus Owner)"
                        >
                          + Saldo Owner
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleMakeDeposit}
                  disabled={
                    isDepositing ||
                    customDepositAmount < 50000
                  }
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all hover:brightness-110 active:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {isDepositing
                      ? 'Memproses Deposit...'
                      : `Aktifkan Deposit Rp ${customDepositAmount.toLocaleString('id-ID')} (${selectedDuration} Hari)`}
                  </span>
                </button>
              </div>
            )}

            {/* 7 DAYS CLAIM HISTORY */}
            <div className="p-5 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-black text-white">Claim History (Last 7 Days)</h4>
                </div>
                <span className="text-[10px] text-white/40">
                  {recentClaims.length} claims
                </span>
              </div>

              {recentClaims.length === 0 ? (
                <div className="p-4 rounded-2xl bg-black/30 text-center text-xs text-white/40">
                  No claim history recorded for this account yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {recentClaims.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-black/50 border border-white/10 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-white/60">
                          {item.claimDate}
                        </span>
                        {item.isJackpot && (
                          <span className="px-1.5 py-0.2 rounded bg-red-600 text-white font-black text-[9px] uppercase">
                            JACKPOT
                          </span>
                        )}
                      </div>
                      <span
                        className={`font-mono font-bold ${
                          item.isJackpot ? 'text-yellow-300 font-black text-sm' : 'text-emerald-400'
                        }`}
                      >
                        +Rp {item.amount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <BlindBoxOpenModal
        isOpen={showOpenModal}
        onClose={() => setShowOpenModal(false)}
        prizeAmount={claimResult?.prizeAmount || 0}
        isJackpot={claimResult?.isJackpot || false}
        totalClaimed={claimResult?.totalClaimed || 0}
        tier={claimResult?.tier || depositTier?.tier || 'BRONZE'}
        tierName={claimResult?.tierName || depositTier?.tierName || 'Bronze'}
        boxType={claimResult?.boxType || depositTier?.boxType || 'Box Regular'}
        boxCount={claimResult?.boxCount || depositTier?.boxCount || 1}
        boxes={claimResult?.boxes || []}
      />

      <BlindBoxWithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        deposit={activeDeposit}
        jwtToken={jwtToken || ''}
        onSuccess={handleWithdrawSuccess}
      />

      <BlindBoxUnlockModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        deposit={activeDeposit}
        jwtToken={jwtToken || ''}
        onSuccess={handleUnlockSuccess}
      />
    </div>
  );
};

