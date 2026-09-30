import React, { useState, useEffect, useMemo } from 'react';
import {
  UserProfile,
  AdminAccount,
  JackpotSettings,
  JackpotWinnerRecord,
  UserActivityLog,
  TransactionOrder,
  BannedUserAccount
} from '../types';
import {
  OWNER_EMAIL,
  isOwnerUser,
  getMemberBadge
} from '../utils/memberBadge';
import {
    subscribeToAllUsers,
  subscribeToAdmins,
  addAdminAccount,
  removeAdminAccount,
  updateUserSaldoByAdmin,
  subscribeToAllSubscriptionOrders,
  approvePendingDeposit,
  rejectPendingDeposit,
  subscribeToJackpotSettings,
  updateJackpotSettings,
  distributeManualJackpot,
  subscribeToJackpotHistory,
  approvePendingWithdrawal,
  rejectPendingWithdrawal,
  subscribeToAllUserActivities,
  banUserAccount,
  unbanUserAccount,
  subscribeToBannedUsers
} from '../services/firebase';
import { sound } from '../services/sound';
import { useAppConfig } from '../context/AppConfigContext';
import { SysLogo } from './SysLogo';
import confetti from 'canvas-confetti';
import {
  Users,
  Trophy,
  ArrowDownLeft,
  ArrowUpRight,
  Activity,
  Shield,
  ShieldCheck,
  Crown,
  Search,
  Plus,
  Trash2,
  Edit3,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  Copy,
  DollarSign,
  AlertTriangle,
  LogOut,
  Flame,
  Zap,
  UserCheck,
  UserX,
  Send,
  Eye,
  Settings,
  Filter,
  Bell,
  Volume2,
  VolumeX,
  ChevronRight,
  Coins,
  Check,
  Inbox,
  Lock,
  Unlock,
  ArrowRightLeft
} from 'lucide-react';

export interface OwnerAdminDashboardProps {
  currentUserProfile: UserProfile | null;
  onLogout: () => void;
  onSwitchToStreamMaster?: () => void;
}

export interface AdminActivityNotification {
  id: string;
  orderId?: string;
  type: 'deposit' | 'withdrawal';
  action: 'pending' | 'success' | 'failed' | 'rejected';
  title: string;
  userEmail: string;
  userName: string;
  amount: number;
  paymentMethod: string;
  details: string;
  timestamp: Date;
  read?: boolean;
}

type DashboardTab = 'accounts' | 'jackpot' | 'deposits' | 'withdrawals' | 'activities';

export const OwnerAdminDashboard: React.FC<OwnerAdminDashboardProps> = ({
  currentUserProfile,
  onLogout,
  onSwitchToStreamMaster
}) => {
  const { formatCurrency } = useAppConfig();
  const isSuperOwner = isOwnerUser(currentUserProfile?.email);
  const userRole = isSuperOwner ? 'OWNER' : 'ADMIN';

  // Active tab state
  const [activeTab, setActiveTab] = useState<DashboardTab>('accounts');

  // Admin Realtime Notifications & Alerts for Deposits & Withdrawals
  const [adminNotifications, setAdminNotifications] = useState<AdminActivityNotification[]>([]);
  const [liveToasts, setLiveToasts] = useState<Array<AdminActivityNotification & { toastId: string }>>([]);
  const [soundNotificationEnabled, setSoundNotificationEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sys_admin_sound_notif') !== 'false';
    } catch {
      return true;
    }
  });
  const [showNotificationCenter, setShowNotificationCenter] = useState<boolean>(false);
  const [notificationTab, setNotificationTab] = useState<'all' | 'deposit' | 'withdrawal'>('all');
  const [notificationStatusFilter, setNotificationStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const prevOrdersRef = React.useRef<Map<string, string>>(new Map());
  const isFirstOrdersLoadRef = React.useRef<boolean>(true);

  // Realtime Data States
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BannedUserAccount[]>([]);
  const [orders, setOrders] = useState<TransactionOrder[]>([]);
  const [jackpotSettings, setJackpotSettings] = useState<JackpotSettings>({
    poolAmount: 50000000,
    winChance: 100,
    minBet: 10000,
    forceNextUser: '',
    forceNextNominal: 0
  });
  const [jackpotHistory, setJackpotHistory] = useState<JackpotWinnerRecord[]>([]);
  const [activities, setActivities] = useState<UserActivityLog[]>([]);

  // Modals & form states
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'member' | 'banned'>('all');
  
  // Add Admin modal/inputs (Owner only)
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminNotes, setNewAdminNotes] = useState('');
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false);

  // Edit Saldo modal
  const [selectedUserForSaldo, setSelectedUserForSaldo] = useState<UserProfile | null>(null);
  const [newSaldoInput, setNewSaldoInput] = useState<number>(0);
  const [newLockedSaldoInput, setNewLockedSaldoInput] = useState<number>(0);
  const [saldoChangeReason, setSaldoChangeReason] = useState<string>('');
  const [isSubmittingSaldo, setIsSubmittingSaldo] = useState(false);

  // Ban user modal
  const [selectedUserForBan, setSelectedUserForBan] = useState<UserProfile | null>(null);
  const [banReasonInput, setBanReasonInput] = useState('');

  // Jackpot settings edit modal
  const [showJackpotModal, setShowJackpotModal] = useState(false);
  const [poolInput, setPoolInput] = useState<number>(50000000);
  const [chanceInput, setChanceInput] = useState<number>(100);
  const [minBetInput, setMinBetInput] = useState<number>(10000);
  const [targetUserUid, setTargetUserUid] = useState<string>('');
  const [targetJackpotNominal, setTargetJackpotNominal] = useState<number>(50000000);
  const [isSavingJackpot, setIsSavingJackpot] = useState(false);

  // Manual Jackpot Payout modal
  const [showManualJackpotModal, setShowManualJackpotModal] = useState(false);
  const [manualJackpotUserId, setManualJackpotUserId] = useState<string>('');
  const [manualJackpotNominal, setManualJackpotNominal] = useState<number>(10000000);
  const [manualJackpotNotes, setManualJackpotNotes] = useState<string>('Hadiah Sultan Jackpot Langsung');
  const [isDisbursingJackpot, setIsDisbursingJackpot] = useState(false);

  // Deposit filters & actions
  const [depositFilter, setDepositFilter] = useState<'all' | 'pending' | 'success' | 'failed'>('pending');
  const [rejectDepositModal, setRejectDepositModal] = useState<TransactionOrder | null>(null);
  const [rejectDepositReason, setRejectDepositReason] = useState('');
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

  // Withdrawal filters & actions
  const [withdrawalFilter, setWithdrawalFilter] = useState<'all' | 'pending' | 'success' | 'failed'>('pending');
  const [approveWdModal, setApproveWdModal] = useState<TransactionOrder | null>(null);
  const [payoutTxHashInput, setPayoutTxHashInput] = useState('');
  const [rejectWdModal, setRejectWdModal] = useState<TransactionOrder | null>(null);
  const [rejectWdReason, setRejectWdReason] = useState('');

  // Activity filter
  const [activityCategory, setActivityCategory] = useState<'all' | 'deposit' | 'withdrawal' | 'jackpot' | 'admin_action'>('all');

  // Success / Notification feedback banner
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    if (type === 'success') {
      sound.playDing();
    } else {
      sound.playWrong();
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  // Subscriptions to Firestore realtime data
  useEffect(() => {
    const unsubUsers = subscribeToAllUsers(setUsers);
    const unsubAdmins = subscribeToAdmins(setAdmins);
    const unsubBanned = subscribeToBannedUsers(setBannedUsers);
    const unsubOrders = subscribeToAllSubscriptionOrders(setOrders);
    const unsubJackpot = subscribeToJackpotSettings((settings) => {
      setJackpotSettings(settings);
      setPoolInput(settings.poolAmount || 50000000);
      setChanceInput(settings.winChance || 100);
      setMinBetInput(settings.minBet || 10000);
      setTargetUserUid(settings.forceNextUser || '');
      setTargetJackpotNominal(settings.forceNextNominal || 50000000);
    });
    const unsubHistory = subscribeToJackpotHistory(setJackpotHistory);
    const unsubActivities = subscribeToAllUserActivities(setActivities);

    return () => {
      unsubUsers();
      unsubAdmins();
      unsubBanned();
      unsubOrders();
      unsubJackpot();
      unsubHistory();
      unsubActivities();
    };
  }, []);

  // Realtime Deposit & Withdrawal Activity Notification Listener
  useEffect(() => {
    if (!orders || orders.length === 0) return;

    if (isFirstOrdersLoadRef.current) {
      // Build initial state without triggering popup toasts
      const map = new Map<string, string>();
      const initialNotifs: AdminActivityNotification[] = [];

      orders.forEach((ord) => {
        const key = ord.orderId || ord.id || '';
        if (key) map.set(key, ord.status);

        const isDeposit = ord.type === 'deposit' || ord.planName?.toLowerCase().includes('deposit');
        const isWd = ord.type === 'withdrawal' || ord.planName?.toLowerCase().includes('withdrawal') || ord.planName?.toLowerCase().includes('penarikan');

        if (isDeposit || isWd) {
          const type = isDeposit ? 'deposit' : 'withdrawal';
          initialNotifs.push({
            id: `notif-${key || Math.random().toString(36)}`,
            orderId: key,
            type,
            action: (ord.status as any) || 'pending',
            title: isDeposit
              ? `Deposit ${ord.status === 'pending' ? 'Menunggu Konfirmasi' : ord.status === 'success' ? 'Disetujui' : 'Ditolak'}: Rp ${(ord.price || 0).toLocaleString('id-ID')}`
              : `Penarikan Crypto ${ord.status === 'pending' ? 'Menunggu Payout' : ord.status === 'success' ? 'Disetujui' : 'Ditolak'}: Rp ${(ord.price || 0).toLocaleString('id-ID')}`,
            userEmail: ord.userEmail || '',
            userName: ord.userName || 'Member',
            amount: ord.price || 0,
            paymentMethod: ord.paymentMethod || ord.planName || 'Crypto',
            details: ord.notes || ord.bankDetails?.bankName || '-',
            timestamp: ord.createdAt ? new Date(ord.createdAt) : new Date(),
            read: ord.status !== 'pending'
          });
        }
      });

      prevOrdersRef.current = map;
      initialNotifs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setAdminNotifications(initialNotifs.slice(0, 100));
      isFirstOrdersLoadRef.current = false;
      return;
    }

    // Detect new orders or status transitions
    const newNotifs: AdminActivityNotification[] = [];
    const newToasts: Array<AdminActivityNotification & { toastId: string }> = [];

    orders.forEach((ord) => {
      const key = ord.orderId || ord.id || '';
      if (!key) return;

      const prevStatus = prevOrdersRef.current.get(key);
      const isDeposit = ord.type === 'deposit' || ord.planName?.toLowerCase().includes('deposit');
      const isWd = ord.type === 'withdrawal' || ord.planName?.toLowerCase().includes('withdrawal') || ord.planName?.toLowerCase().includes('penarikan');

      if (!isDeposit && !isWd) return;
      const type = isDeposit ? 'deposit' : 'withdrawal';

      // 1. New Order created
      if (prevStatus === undefined) {
        prevOrdersRef.current.set(key, ord.status);
        const item: AdminActivityNotification = {
          id: `notif-${Date.now()}-${key}`,
          orderId: key,
          type,
          action: (ord.status as any) || 'pending',
          title: isDeposit
            ? `📥 Deposit Baru Masuk: Rp ${(ord.price || 0).toLocaleString('id-ID')}`
            : `📤 Pengajuan Penarikan Crypto: Rp ${(ord.price || 0).toLocaleString('id-ID')}`,
          userEmail: ord.userEmail || '',
          userName: ord.userName || 'Member',
          amount: ord.price || 0,
          paymentMethod: ord.paymentMethod || ord.planName || 'Crypto',
          details: ord.notes || ord.bankDetails?.bankName || '-',
          timestamp: new Date(),
          read: false
        };
        newNotifs.push(item);
        newToasts.push({ ...item, toastId: `toast-${Date.now()}-${Math.random()}` });
      }
      // 2. Existing order status updated
      else if (prevStatus !== ord.status) {
        prevOrdersRef.current.set(key, ord.status);
        const statusLabel = ord.status === 'success' ? 'Disetujui' : ord.status === 'failed' ? 'Ditolak' : ord.status;
        const item: AdminActivityNotification = {
          id: `notif-${Date.now()}-${key}`,
          orderId: key,
          type,
          action: (ord.status as any) || 'pending',
          title: `${isDeposit ? '📥 Deposit' : '📤 Penarikan'} #${key.slice(-6)}: ${statusLabel}`,
          userEmail: ord.userEmail || '',
          userName: ord.userName || 'Member',
          amount: ord.price || 0,
          paymentMethod: ord.paymentMethod || ord.planName || 'Crypto',
          details: `Status diperbarui menjadi ${statusLabel}`,
          timestamp: new Date(),
          read: false
        };
        newNotifs.push(item);
        newToasts.push({ ...item, toastId: `toast-${Date.now()}-${Math.random()}` });
      }
    });

    if (newNotifs.length > 0) {
      setAdminNotifications((prev) => [...newNotifs, ...prev].slice(0, 100));

      if (newToasts.length > 0) {
        if (soundNotificationEnabled) {
          sound.playDing();
        }
        setLiveToasts((prev) => [...newToasts, ...prev].slice(0, 5));

        newToasts.forEach((t) => {
          setTimeout(() => {
            setLiveToasts((curr) => curr.filter((item) => item.toastId !== t.toastId));
          }, 8000);
        });
      }
    }
  }, [orders, soundNotificationEnabled]);

  // Filtered deposits
  const depositOrders = useMemo(() => {
    return orders.filter((o) => {
      const isDeposit = o.type === 'deposit' || o.planName?.toLowerCase().includes('deposit');
      if (!isDeposit) return false;
      if (depositFilter === 'all') return true;
      return o.status === depositFilter;
    });
  }, [orders, depositFilter]);

  // Filtered withdrawals
  const withdrawalOrders = useMemo(() => {
    return orders.filter((o) => {
      const isWd = o.type === 'withdrawal' || o.planName?.toLowerCase().includes('withdrawal') || o.planName?.toLowerCase().includes('penarikan');
      if (!isWd) return false;
      if (withdrawalFilter === 'all') return true;
      return o.status === withdrawalFilter;
    });
  }, [orders, withdrawalFilter]);

  // Filtered Notifications for Center Modal
  const filteredNotifications = useMemo(() => {
    return adminNotifications.filter((n) => {
      if (notificationTab === 'deposit' && n.type !== 'deposit') return false;
      if (notificationTab === 'withdrawal' && n.type !== 'withdrawal') return false;
      if (notificationStatusFilter === 'pending' && n.action !== 'pending') return false;
      if (notificationStatusFilter === 'resolved' && n.action === 'pending') return false;
      return true;
    });
  }, [adminNotifications, notificationTab, notificationStatusFilter]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalUsers = users.length;
    // Saldo Terbuka Keseluruhan (Open Balance) across all users
    const totalSaldoTerbuka = users.reduce((acc, u) => {
      const s = typeof u.saldo === 'number' ? u.saldo : (u.walletBalance ?? 0);
      return acc + s;
    }, 0);

    const pendingDepositsCount = orders.filter(
      (o) => (o.type === 'deposit' || o.planName?.toLowerCase().includes('deposit')) && o.status === 'pending'
    ).length;

    const pendingWithdrawalsOrders = orders.filter(
      (o) =>
        (o.type === 'withdrawal' ||
          o.planName?.toLowerCase().includes('withdrawal') ||
          o.planName?.toLowerCase().includes('penarikan')) &&
        o.status === 'pending'
    );
    const pendingWithdrawalsCount = pendingWithdrawalsOrders.length;
    const pendingWithdrawalsTotalAmount = pendingWithdrawalsOrders.reduce(
      (sum, o) => sum + (o.price || 0),
      0
    );

    const usersLockedSaldoSum = users.reduce((acc, u) => {
      const l = typeof u.lockedSaldo === 'number' ? u.lockedSaldo : 0;
      return acc + l;
    }, 0);

    // Saldo Terkunci Keseluruhan (Locked Balance)
    const totalSaldoTerkunci = Math.max(usersLockedSaldoSum, pendingWithdrawalsTotalAmount);

    // Saldo Keseluruhan System (Total Balance)
    const totalSaldoKeseluruhan = totalSaldoTerbuka + totalSaldoTerkunci;
    const totalAdminsCount = admins.length;

    return {
      totalUsers,
      totalSaldo: totalSaldoKeseluruhan,
      totalSaldoTerbuka,
      totalSaldoTerkunci,
      totalSaldoKeseluruhan,
      pendingDepositsCount,
      pendingWithdrawalsCount,
      pendingWithdrawalsTotalAmount,
      totalAdminsCount
    };
  }, [users, orders, admins]);

  // Users filtered list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchUserQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (u.displayName || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.uid || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      const isBanned = Boolean(u.isBanned) || bannedUsers.some((b) => b.email.toLowerCase() === (u.email || '').toLowerCase());
      const isAdmin = u.role === 'admin' || admins.some((a) => a.email.toLowerCase() === (u.email || '').toLowerCase());

      if (roleFilter === 'admin') return isAdmin;
      if (roleFilter === 'banned') return isBanned;
      if (roleFilter === 'member') return !isAdmin && !isBanned;
      return true;
    });
  }, [users, searchUserQuery, roleFilter, admins, bannedUsers]);

  // Handler: Add Admin (Owner only)
  const handleAddAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperOwner) {
      showNotification('error', 'Hanya Owner yang dapat menambahkan admin.');
      return;
    }
    const cleanEmail = newAdminEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showNotification('error', 'Masukkan alamat email yang valid.');
      return;
    }

    setIsSubmittingAdmin(true);
    try {
      await addAdminAccount(
        cleanEmail,
        newAdminName.trim() || cleanEmail.split('@')[0],
        newAdminNotes.trim(),
        currentUserProfile?.email || OWNER_EMAIL
      );
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      showNotification('success', `Berhasil menambahkan ${cleanEmail} sebagai Admin! Tampilan dashboard-nya kini sama persis dan berlog "ADMIN".`);
      setNewAdminEmail('');
      setNewAdminName('');
      setNewAdminNotes('');
      setShowAddAdminModal(false);
    } catch (err: any) {
      showNotification('error', err.message || 'Gagal menambahkan admin.');
    } finally {
      setIsSubmittingAdmin(false);
    }
  };

  // Handler: Remove Admin (Owner only)
  const handleRemoveAdmin = async (email: string) => {
    if (!isSuperOwner) return;
    if (!window.confirm(`Yakin ingin mencabut hak Admin untuk ${email}?`)) return;

    try {
      await removeAdminAccount(email, currentUserProfile?.email || OWNER_EMAIL);
      showNotification('success', `Hak Admin untuk ${email} berhasil dicabut.`);
    } catch (err: any) {
      showNotification('error', err.message || 'Gagal mencabut hak admin.');
    }
  };

  // Handler: Update Saldo Direct
  const handleUpdateSaldoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForSaldo) return;

    if (newSaldoInput < 0) {
      showNotification('error', 'Saldo tidak boleh bernilai negatif.');
      return;
    }

    setIsSubmittingSaldo(true);
    try {
      await updateUserSaldoByAdmin(
        selectedUserForSaldo.uid,
        newSaldoInput,
        saldoChangeReason.trim() || 'Penyesuaian saldo langsung oleh Admin',
        currentUserProfile?.email || 'admin@sys.app',
        newLockedSaldoInput
      );
      confetti({ particleCount: 40, spread: 60 });
      showNotification(
        'success',
        `Saldo ${selectedUserForSaldo.displayName || selectedUserForSaldo.email} berhasil diupdate (Terbuka: ${formatCurrency(newSaldoInput)}, Terkunci: ${formatCurrency(newLockedSaldoInput)})!`
      );
      setSelectedUserForSaldo(null);
      setNewSaldoInput(0);
      setNewLockedSaldoInput(0);
      setSaldoChangeReason('');
    } catch (err: any) {
      showNotification('error', err.message || 'Gagal mengupdate saldo.');
    } finally {
      setIsSubmittingSaldo(false);
    }
  };

  // Handler: Ban / Unban user
  const handleToggleBan = async (user: UserProfile) => {
    const isCurrentlyBanned = Boolean(user.isBanned) || bannedUsers.some((b) => b.email.toLowerCase() === (user.email || '').toLowerCase());

    if (isCurrentlyBanned) {
      if (!window.confirm(`Aktifkan kembali akun ${user.email}?`)) return;
      try {
        await unbanUserAccount(user.email || '');
        showNotification('success', `Akun ${user.email} berhasil diaktifkan kembali.`);
      } catch (err: any) {
        showNotification('error', err.message || 'Gagal membuka blokir.');
      }
    } else {
      setSelectedUserForBan(user);
    }
  };

  const handleConfirmBan = async () => {
    if (!selectedUserForBan?.email) return;
    try {
      await banUserAccount(
        selectedUserForBan.email,
        banReasonInput.trim() || 'Pelanggaran aturan live stream',
        currentUserProfile?.email || OWNER_EMAIL
      );
      showNotification('success', `Akun ${selectedUserForBan.email} berhasil diblokir.`);
      setSelectedUserForBan(null);
      setBanReasonInput('');
    } catch (err: any) {
      showNotification('error', err.message || 'Gagal memblokir akun.');
    }
  };

  // Handler: Approve Deposit
  const handleApproveDeposit = async (order: TransactionOrder) => {
    const orderIdToApprove = order.orderId || order.id;
    if (!orderIdToApprove) return;

    setProcessingOrderId(orderIdToApprove);
    try {
      const res = await approvePendingDeposit(orderIdToApprove, currentUserProfile?.email || 'admin@sys.app');
      confetti({ particleCount: 70, spread: 80 });
      showNotification(
        'success',
        `Deposit ${formatCurrency(order.jumlah || order.price)} untuk ${order.userName || order.userEmail} BERHASIL DISETUJUI & saldo telah masuk!`
      );
    } catch (err: any) {
      showNotification('error', err.message || 'Gagal menyetujui deposit.');
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Handler: Reject Deposit
  const handleRejectDeposit = async () => {
    if (!rejectDepositModal) return;
    const orderId = rejectDepositModal.orderId || rejectDepositModal.id;
    if (!orderId) return;

    setProcessingOrderId(orderId);
    try {
      await rejectPendingDeposit(
        orderId,
        currentUserProfile?.email || 'admin@sys.app',
        rejectDepositReason.trim() || 'Bukti TxHash tidak valid atau transfer belum diterima'
      );
      showNotification('success', `Deposit ${rejectDepositModal.orderId} telah ditolak.`);
      setRejectDepositModal(null);
      setRejectDepositReason('');
    } catch (err: any) {
      showNotification('error', err.message || 'Gagal menolak deposit.');
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Handler: Approve Withdrawal
  const handleApproveWithdrawalSubmit = async () => {
    if (!approveWdModal) return;
    const orderId = approveWdModal.orderId || approveWdModal.id;
    if (!orderId) return;

    setProcessingOrderId(orderId);
    try {
      await approvePendingWithdrawal(orderId, currentUserProfile?.email || 'admin@sys.app', payoutTxHashInput.trim());
      confetti({ particleCount: 60, spread: 70 });
      showNotification('success', `Penarikan ${formatCurrency(approveWdModal.price)} berhasil diproses & diselesaikan!`);
      setApproveWdModal(null);
      setPayoutTxHashInput('');
    } catch (err: any) {
      showNotification('error', err.message || 'Gagal memproses penarikan.');
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Handler: Reject Withdrawal (Auto-refund to saldo)
  const handleRejectWithdrawalSubmit = async () => {
    if (!rejectWdModal) return;
    const orderId = rejectWdModal.orderId || rejectWdModal.id;
    if (!orderId) return;

    setProcessingOrderId(orderId);
    try {
      await rejectPendingWithdrawal(
        orderId,
        currentUserProfile?.email || 'admin@sys.app',
        rejectWdReason.trim() || 'Alamat wallet tidak sesuai atau permintaan dibatalkan'
      );
      showNotification('success', `Penarikan ditolak. Saldo sebesar ${formatCurrency(rejectWdModal.price)} telah dikembalikan otomatis ke user!`);
      setRejectWdModal(null);
      setRejectWdReason('');
    } catch (err: any) {
      showNotification('error', err.message || 'Gagal menolak penarikan.');
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Handler: Save Jackpot Settings
  const handleSaveJackpotSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingJackpot(true);
    try {
      await updateJackpotSettings(
        {
          poolAmount: poolInput,
          winChance: chanceInput,
          minBet: minBetInput,
          forceNextUser: targetUserUid,
          forceNextNominal: targetJackpotNominal
        },
        currentUserProfile?.email || 'admin@sys.app'
      );
      showNotification('success', 'Pengaturan Jackpot berhasil diperbarui secara realtime!');
      setShowJackpotModal(false);
    } catch (err: any) {
      showNotification('error', err.message || 'Gagal menyimpan pengaturan jackpot.');
    } finally {
      setIsSavingJackpot(false);
    }
  };

  // Handler: Manual Jackpot Payout
  const handleManualJackpotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualJackpotUserId) {
      showNotification('error', 'Pilih akun pengguna penerima Jackpot.');
      return;
    }
    const targetUser = users.find((u) => u.uid === manualJackpotUserId);
    if (!targetUser) {
      showNotification('error', 'User target tidak ditemukan.');
      return;
    }

    setIsDisbursingJackpot(true);
    try {
      await distributeManualJackpot(
        targetUser.uid,
        targetUser.displayName || 'Winner Host',
        targetUser.email || '',
        manualJackpotNominal,
        currentUserProfile?.email || 'admin@sys.app',
        manualJackpotNotes.trim()
      );
      confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 } });
      showNotification(
        'success',
        `🔥 GRAND JACKPOT ${formatCurrency(manualJackpotNominal)} berhasil dikirim langsung ke ${targetUser.displayName || targetUser.email}!`
      );
      setShowManualJackpotModal(false);
      setManualJackpotUserId('');
      setManualJackpotNominal(10000000);
    } catch (err: any) {
      showNotification('error', err.message || 'Gagal membagikan jackpot.');
    } finally {
      setIsDisbursingJackpot(false);
    }
  };

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showNotification('success', `${label} berhasil disalin ke clipboard!`);
  };

  return (
    <div className="min-h-screen w-full bg-[#080c14] text-white flex flex-col font-['Poppins'] selection:bg-amber-500 selection:text-black">
      {/* TOP COMMAND HEADER */}
      <header className="sticky top-0 z-40 bg-[#0d1424]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 w-full sm:w-auto justify-between sm:justify-start">
            <SysLogo size="sm" showText={false} />
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm ${
                    isSuperOwner
                      ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black border border-yellow-200'
                      : 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 text-white border border-rose-300/40'
                  }`}
                >
                  {isSuperOwner ? <Crown className="w-3.5 h-3.5 fill-black" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>{userRole}</span>
                </span>
                <span className="text-xs text-white/50 font-mono hidden md:inline">
                  {currentUserProfile?.email}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5 flex items-center gap-2 flex-wrap">
                <span>SYS CONTROL CENTER</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  REALTIME DB
                </span>
                {onSwitchToStreamMaster && (
                  <button
                    onClick={onSwitchToStreamMaster}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-[#FE2C55] to-rose-600 hover:brightness-110 text-white font-extrabold text-xs shadow-md shadow-[#FE2C55]/30 cursor-pointer transition-all ml-1"
                    title="Buka StreamMaster Live Dashboard"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>StreamMaster Live</span>
                  </button>
                )}
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:hidden">
              <button
                onClick={() => setShowNotificationCenter(true)}
                className="relative p-2 rounded-xl bg-amber-500/20 border border-amber-500/35 text-amber-300 text-xs font-bold flex items-center justify-center cursor-pointer"
                title="Notifikasi Transaksi"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                {(metrics.pendingDepositsCount + metrics.pendingWithdrawalsCount) > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-[16px] text-[9px] font-black rounded-full bg-red-500 text-white flex items-center justify-center animate-pulse">
                    {metrics.pendingDepositsCount + metrics.pendingWithdrawalsCount}
                  </span>
                )}
              </button>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar & Logout */}
          <div className="flex items-center gap-2.5 sm:gap-4 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 shrink-0">
              <Users className="w-4 h-4 text-cyan-400" />
              <div className="text-left">
                <div className="text-[10px] text-white/50 uppercase font-bold">Total User</div>
                <div className="text-xs font-black text-white font-mono">{metrics.totalUsers}</div>
              </div>
            </div>

            {/* Saldo Terbuka */}
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 shrink-0">
              <Unlock className="w-4 h-4 text-emerald-400" />
              <div className="text-left">
                <div className="text-[10px] text-emerald-300/70 uppercase font-bold">Saldo Terbuka</div>
                <div className="text-xs font-black text-emerald-400 font-mono">{formatCurrency(metrics.totalSaldoTerbuka)}</div>
              </div>
            </div>

            {/* Saldo Terkunci */}
            <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 shrink-0 transition-all ${
              metrics.totalSaldoTerkunci > 0
                ? 'bg-amber-500/15 border-amber-500/30'
                : 'bg-white/5 border-white/10'
            }`}>
              <Lock className={`w-4 h-4 ${metrics.totalSaldoTerkunci > 0 ? 'text-amber-400 animate-pulse' : 'text-white/40'}`} />
              <div className="text-left">
                <div className="text-[10px] text-amber-300/70 uppercase font-bold">Saldo Terkunci</div>
                <div className={`text-xs font-black font-mono ${metrics.totalSaldoTerkunci > 0 ? 'text-amber-400' : 'text-white/60'}`}>
                  {formatCurrency(metrics.totalSaldoTerkunci)}
                </div>
              </div>
            </div>

            {/* Total Saldo System */}
            <div className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-2 shrink-0">
              <DollarSign className="w-4 h-4 text-cyan-400" />
              <div className="text-left">
                <div className="text-[10px] text-cyan-300/70 uppercase font-bold">Total Saldo System</div>
                <div className="text-xs font-black text-cyan-300 font-mono">{formatCurrency(metrics.totalSaldoKeseluruhan)}</div>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 shrink-0">
              <Trophy className="w-4 h-4 text-amber-400" />
              <div className="text-left">
                <div className="text-[10px] text-amber-300/70 uppercase font-bold">Jackpot Pool</div>
                <div className="text-xs font-black text-amber-400 font-mono">{formatCurrency(jackpotSettings.poolAmount || 50000000)}</div>
              </div>
            </div>

            {/* Suara Alert Toggle */}
            <button
              onClick={() => {
                const next = !soundNotificationEnabled;
                setSoundNotificationEnabled(next);
                try {
                  localStorage.setItem('sys_admin_sound_notif', String(next));
                } catch {}
                if (next) sound.playDing();
              }}
              className={`p-2 rounded-xl border text-xs font-bold transition-all shrink-0 cursor-pointer ${
                soundNotificationEnabled
                  ? 'bg-white/5 border-white/10 text-emerald-400 hover:bg-white/10'
                  : 'bg-red-500/15 border-red-500/30 text-red-300'
              }`}
              title={soundNotificationEnabled ? 'Suara Notifikasi: AKTIF' : 'Suara Notifikasi: MATI'}
            >
              {soundNotificationEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Notification Center Trigger */}
            <button
              onClick={() => setShowNotificationCenter(true)}
              className="relative px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-2 transition-all shrink-0 cursor-pointer shadow-lg shadow-amber-500/10 active:scale-95"
              title="Pusat Notifikasi Aktifitas Transaksi"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Notifikasi</span>
              {(metrics.pendingDepositsCount + metrics.pendingWithdrawalsCount) > 0 ? (
                <span className="px-1.5 py-0.5 min-w-[20px] text-[10px] font-black rounded-full bg-red-500 text-white flex items-center justify-center animate-pulse shadow-sm">
                  {metrics.pendingDepositsCount + metrics.pendingWithdrawalsCount}
                </span>
              ) : (
                <span className="px-1.5 py-0.5 min-w-[18px] text-[10px] font-bold rounded-full bg-white/10 text-white/60">
                  {adminNotifications.length}
                </span>
              )}
            </button>

            <button
              onClick={onLogout}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 hover:text-red-200 text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS (5 Mandatory Modules) */}
        <div className="max-w-7xl mx-auto mt-3.5 flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'accounts'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
                : 'bg-white/5 hover:bg-white/10 text-white/80'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Pengelolaan Akun & Admin</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono font-bold">
              {users.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('jackpot')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'jackpot'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
                : 'bg-white/5 hover:bg-white/10 text-white/80'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>Jackpot</span>
            {jackpotSettings.forceNextUser && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('deposits')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'deposits'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
                : 'bg-white/5 hover:bg-white/10 text-white/80'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
            <span>Deposit User</span>
            {metrics.pendingDepositsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500 text-black font-black animate-pulse">
                {metrics.pendingDepositsCount} PENDING
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'withdrawals'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
                : 'bg-white/5 hover:bg-white/10 text-white/80'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-blue-400" />
            <span>Penarikan (WD)</span>
            {metrics.pendingWithdrawalsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-black animate-pulse">
                {metrics.pendingWithdrawalsCount} PENDING
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('activities')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'activities'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
                : 'bg-white/5 hover:bg-white/10 text-white/80'
            }`}
          >
            <Activity className="w-4 h-4 text-purple-400" />
            <span>Semua Aktifitas User</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono font-bold">
              {activities.length}
            </span>
          </button>
        </div>
      </header>

      {/* REALTIME FLOATING TOASTS (TOP-RIGHT CORNER) */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-2 sm:px-0">
        {liveToasts.map((toast) => (
          <div
            key={toast.toastId}
            className="pointer-events-auto p-4 rounded-2xl bg-[#0b101d]/95 border-2 border-amber-500/50 shadow-2xl backdrop-blur-xl animate-in slide-in-from-right duration-300 flex items-start gap-3 ring-1 ring-black/50"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                toast.type === 'deposit'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}
            >
              {toast.type === 'deposit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-black text-white truncate flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${toast.type === 'deposit' ? 'bg-emerald-400' : 'bg-blue-400'} animate-ping`} />
                  {toast.title}
                </span>
                <button
                  onClick={() => setLiveToasts((curr) => curr.filter((t) => t.toastId !== toast.toastId))}
                  className="text-white/40 hover:text-white text-xs p-1 rounded transition-colors"
                >
                  ✕
                </button>
              </div>

              <p className="text-[11px] text-white/80 mt-1 truncate">
                <strong className="text-amber-300">{toast.userName}</strong> ({toast.userEmail || 'Member'})
              </p>
              <p className="text-[10px] text-white/50 mt-0.5 truncate font-mono">
                {toast.paymentMethod} • Rp {toast.amount.toLocaleString('id-ID')}
              </p>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                <span className="text-[10px] text-white/40">Baru saja</span>
                <button
                  onClick={() => {
                    if (toast.type === 'deposit') {
                      setActiveTab('deposits');
                      setDepositFilter('pending');
                    } else {
                      setActiveTab('withdrawals');
                      setWithdrawalFilter('pending');
                    }
                    setLiveToasts((curr) => curr.filter((t) => t.toastId !== toast.toastId));
                    sound.playClick();
                  }}
                  className="text-[11px] font-black text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/30 transition-all"
                >
                  <span>Tinjau Sekarang</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NOTIFICATION CENTER MODAL */}
      {showNotificationCenter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0b101d] border border-amber-500/40 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden ring-1 ring-white/10">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-start justify-between gap-3 bg-gradient-to-r from-amber-500/10 via-black/40 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white">Pusat Notifikasi Transaksi</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Sync
                    </span>
                  </div>
                  <p className="text-xs text-white/60">
                    Memantau seluruh aktifitas transaksi deposit dan penarikan crypto secara realtime
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const next = !soundNotificationEnabled;
                    setSoundNotificationEnabled(next);
                    try {
                      localStorage.setItem('sys_admin_sound_notif', String(next));
                    } catch {}
                    if (next) sound.playDing();
                  }}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    soundNotificationEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-white/5 text-white/40 border-white/10'
                  }`}
                  title={soundNotificationEnabled ? 'Suara Aktif' : 'Suara Bisu'}
                >
                  {soundNotificationEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setShowNotificationCenter(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Action Pending Summary Cards */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-black/40 border-b border-white/10">
              <div
                onClick={() => {
                  setActiveTab('deposits');
                  setDepositFilter('pending');
                  setShowNotificationCenter(false);
                  sound.playClick();
                }}
                className="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <ArrowDownLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-white/60 uppercase font-bold">Deposit Pending</div>
                    <div className="text-xs font-black text-emerald-400">
                      {metrics.pendingDepositsCount} Menunggu Konfirmasi
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-400" />
              </div>

              <div
                onClick={() => {
                  setActiveTab('withdrawals');
                  setWithdrawalFilter('pending');
                  setShowNotificationCenter(false);
                  sound.playClick();
                }}
                className="p-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-white/60 uppercase font-bold">Penarikan Pending</div>
                    <div className="text-xs font-black text-blue-400">
                      {metrics.pendingWithdrawalsCount} Menunggu Payout
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-blue-400" />
              </div>
            </div>

            {/* Filter Navigation */}
            <div className="p-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 bg-black/20">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                {[
                  { id: 'all', label: `Semua (${adminNotifications.length})` },
                  {
                    id: 'deposit',
                    label: `Deposit (${adminNotifications.filter((n) => n.type === 'deposit').length})`
                  },
                  {
                    id: 'withdrawal',
                    label: `Penarikan (${adminNotifications.filter((n) => n.type === 'withdrawal').length})`
                  }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setNotificationTab(tab.id as any);
                      sound.playClick();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      notificationTab === tab.id
                        ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                        : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                {[
                  { id: 'all', label: 'Semua Status' },
                  { id: 'pending', label: 'Pending Saja' },
                  { id: 'resolved', label: 'Selesai' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setNotificationStatusFilter(s.id as any);
                      sound.playClick();
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      notificationStatusFilter === s.id
                        ? 'bg-white/20 text-white'
                        : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar min-h-[250px] max-h-[450px]">
              {filteredNotifications.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-2xl">
                  <Inbox className="w-10 h-10 text-white/20 mb-2" />
                  <p className="text-xs font-bold text-white/60">Tidak Ada Notifikasi</p>
                  <p className="text-[11px] text-white/40 mt-0.5">
                    Belum ada aktifitas transaksi yang cocok dengan filter yang dipilih saat ini.
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notif) => {
                  const isDeposit = notif.type === 'deposit';
                  const isPending = notif.action === 'pending';
                  const isSuccess = notif.action === 'success';

                  return (
                    <div
                      key={notif.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isPending
                          ? 'bg-gradient-to-r from-amber-500/10 via-black/40 to-transparent border-amber-500/40 shadow-sm'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isDeposit
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {isDeposit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-black text-white truncate">{notif.title}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                isPending
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                                  : isSuccess
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-red-500/20 text-red-300 border border-red-500/40'
                              }`}
                            >
                              {isPending ? 'Pending' : isSuccess ? 'Disetujui' : 'Ditolak'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-white/70">
                            <span className="font-semibold text-white">{notif.userName}</span>
                            <span className="text-white/40">•</span>
                            <span className="text-white/50 font-mono">{notif.userEmail}</span>
                            <span className="text-white/40">•</span>
                            <span className="text-amber-300 font-medium">{notif.paymentMethod}</span>
                          </div>

                          {notif.details && (
                            <p className="text-[10px] text-white/50 truncate font-mono max-w-md">
                              {notif.details}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                        <div className="text-left sm:text-right">
                          <div className="text-xs font-mono font-bold text-white">
                            Rp {notif.amount.toLocaleString('id-ID')}
                          </div>
                          <div className="text-[10px] text-white/40">
                            {notif.timestamp ? new Date(notif.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </div>
                        </div>

                        {isPending && (
                          <button
                            onClick={() => {
                              if (isDeposit) {
                                setActiveTab('deposits');
                                setDepositFilter('pending');
                              } else {
                                setActiveTab('withdrawals');
                                setWithdrawalFilter('pending');
                              }
                              setShowNotificationCenter(false);
                              sound.playClick();
                            }}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1"
                          >
                            <span>Tinjau</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 flex items-center justify-between gap-3 bg-black/40">
              <button
                onClick={() => {
                  setAdminNotifications([]);
                  setLiveToasts([]);
                  sound.playClick();
                }}
                className="text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                Bersihkan Riwayat
              </button>

              <button
                onClick={() => setShowNotificationCenter(false)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FEEDBACK NOTIFICATION BANNER */}
      {feedback && (
        <div
          className={`max-w-7xl mx-auto mt-4 px-4 py-3 rounded-xl border flex items-center justify-between gap-3 text-xs font-bold transition-all shadow-lg animate-in slide-in-from-top-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-red-500/20 text-red-300 border-red-500/40'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-white/60 hover:text-white">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-8 pb-28 md:pb-8">
        {/* ======================================================== */}
        {/* TAB 1: PENGELOLAAN AKUN & ADMIN                        */}
        {/* ======================================================== */}
        {activeTab === 'accounts' && (
          <div className="space-y-6">
            {/* Top Section: Admin Accounts Management (Owner Privilege) */}
            <div className="bg-[#0f172a] rounded-2xl border border-white/10 p-5 sm:p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    <h2 className="text-lg font-black text-white">Daftar Akun Administrator</h2>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                      {admins.length} Admin Aktif
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mt-1">
                    {isSuperOwner
                      ? 'Sebagai Owner, Anda dapat menambahkan akun untuk admin. Siapapun yang ditambahkan menjadi admin, tampilannya sama dengan Owner dan berlog "ADMIN".'
                      : 'Anda masuk sebagai Administrator resmi dengan hak akses penuh kelola akun, jackpot, deposit, penarikan & aktifitas user.'}
                  </p>
                </div>

                {isSuperOwner && (
                  <button
                    onClick={() => setShowAddAdminModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Tambah Akun Admin Baru</span>
                  </button>
                )}
              </div>

              {/* Admin Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
                {/* Primary Owner Card */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-black">
                      <Crown className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-white">Susi Dewi Yuliyanti</span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-400 text-black text-[9px] font-black uppercase">
                          OWNER
                        </span>
                      </div>
                      <div className="text-[11px] text-amber-300 font-mono">{OWNER_EMAIL}</div>
                      <div className="text-[10px] text-white/40 mt-0.5">Primary Super Administrator</div>
                    </div>
                  </div>
                </div>

                {/* Added Admins */}
                {admins.map((admin) => (
                  <div
                    key={admin.email}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 font-black">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">{admin.displayName || 'Admin'}</span>
                          <span className="px-1.5 py-0.2 rounded bg-rose-500 text-white text-[9px] font-black uppercase">
                            ADMIN
                          </span>
                        </div>
                        <div className="text-[11px] text-white/70 font-mono">{admin.email}</div>
                        <div className="text-[10px] text-white/40 mt-0.5">
                          Ditambahkan: {new Date(admin.addedAt).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                    </div>

                    {isSuperOwner && (
                      <button
                        onClick={() => handleRemoveAdmin(admin.email)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs transition-all cursor-pointer"
                        title="Cabut hak admin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* STATISTIK KESELURUHAN SALDO SISTEM: TERKUNCI VS TERBUKA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Saldo Terbuka Keseluruhan */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-[#0f172a] border border-emerald-500/30 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1.5">
                    <Unlock className="w-4 h-4" />
                    <span>Total Saldo Terbuka</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    Siap Pakai
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                  {formatCurrency(metrics.totalSaldoTerbuka)}
                </div>
                <p className="text-[11px] text-white/60 leading-relaxed">
                  Total akumulasi dana member yang aktif dan siap digunakan untuk siaran game, blind box, maupun penarikan crypto baru.
                </p>
              </div>

              {/* Card 2: Saldo Terkunci Keseluruhan */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-[#0f172a] border border-amber-500/40 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                    <Lock className="w-4 h-4" />
                    <span>Total Saldo Terkunci</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40 animate-pulse">
                    {metrics.pendingWithdrawalsCount} Penarikan Pending
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
                  {formatCurrency(metrics.totalSaldoTerkunci)}
                </div>
                <p className="text-[11px] text-white/60 leading-relaxed">
                  Total dana yang sedang terkunci sementara pada permohonan penarikan (menunggu approval payout) atau deposit proteksi blind box.
                </p>
              </div>

              {/* Card 3: Saldo Keseluruhan System */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-950/60 via-slate-900 to-[#0f172a] border border-blue-500/30 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-cyan-400 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" />
                    <span>Total Saldo Keseluruhan</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                    Grand Total
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-white">
                  {formatCurrency(metrics.totalSaldoKeseluruhan)}
                </div>
                <p className="text-[11px] text-white/60 leading-relaxed">
                  Total keseluruhan modal saldo dalam ekosistem platform (Saldo Terbuka + Saldo Terkunci).
                </p>
              </div>
            </div>

            {/* Bottom Section: All User Accounts Table & Saldo Controls */}
            <div className="bg-[#0f172a] rounded-2xl border border-white/10 p-5 sm:p-6 shadow-xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span>Daftar Seluruh Pengguna & Pengaturan Saldo</span>
                    <span className="text-xs font-mono text-white/50">({filteredUsers.length} user)</span>
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Kelola saldo langsung dari database Firestore, periksa role, atau blokir akun yang melanggar.
                  </p>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari nama, email, UID..."
                      value={searchUserQuery}
                      onChange={(e) => setSearchUserQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <select
                    value={roleFilter}
                    onChange={(e: any) => setRoleFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white font-bold focus:outline-none"
                  >
                    <option value="all" className="bg-[#0f172a]">Semua Role</option>
                    <option value="admin" className="bg-[#0f172a]">Admin Sahaja</option>
                    <option value="member" className="bg-[#0f172a]">Member Reguler</option>
                    <option value="banned" className="bg-[#0f172a]">Akun Diblokir</option>
                  </select>
                </div>
              </div>

              {/* Users Table (Desktop) */}
              <div className="hidden md:block overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-wider text-white/50">
                      <th className="py-3 px-3">Pengguna</th>
                      <th className="py-3 px-3">Role & Status</th>
                      <th className="py-3 px-3 text-right">Saldo Terbuka</th>
                      <th className="py-3 px-3 text-right">Saldo Terkunci</th>
                      <th className="py-3 px-3 text-right">Total Saldo</th>
                      <th className="py-3 px-3">Tanggal Daftar</th>
                      <th className="py-3 px-3 text-center">Aksi Pengelolaan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-white/40 text-xs">
                          Tidak ada akun yang sesuai dengan pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => {
                        const userSaldo = typeof user.saldo === 'number' ? user.saldo : (user.walletBalance ?? 0);
                        const userLocked = typeof user.lockedSaldo === 'number' ? user.lockedSaldo : 0;
                        const userTotal = userSaldo + userLocked;
                        const isUserAdmin = user.role === 'admin' || admins.some((a) => a.email.toLowerCase() === (user.email || '').toLowerCase());
                        const isUserOwner = isOwnerUser(user.email);
                        const isBanned = Boolean(user.isBanned) || bannedUsers.some((b) => b.email.toLowerCase() === (user.email || '').toLowerCase());

                        return (
                          <tr key={user.uid} className="hover:bg-white/5 transition-colors">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-3">
                                {user.photoURL ? (
                                  <img
                                    src={user.photoURL}
                                    alt=""
                                    className="w-9 h-9 rounded-full object-cover border border-white/10"
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-bold text-white/70">
                                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <div className="font-bold text-white flex items-center gap-1.5">
                                    <span>{user.displayName || 'Host Streamer'}</span>
                                    {isUserOwner && (
                                      <span className="px-1 py-0.2 rounded bg-amber-400 text-black text-[9px] font-black">
                                        OWNER
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-white/50 font-mono">{user.email || 'Tanpa Email'}</div>
                                  <div className="text-[10px] text-white/30 font-mono">UID: {user.uid.slice(0, 10)}...</div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-3">
                              <div className="flex flex-col gap-1 items-start">
                                {isUserOwner ? (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/40">
                                    👑 Super Owner
                                  </span>
                                ) : isUserAdmin ? (
                                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/40">
                                    🛡️ Administrator
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/40">
                                    🎮 Live Streamer
                                  </span>
                                )}

                                {isBanned ? (
                                  <span className="px-2 py-0.5 rounded-full bg-red-600/30 text-red-300 text-[9px] font-bold">
                                    🚫 Banned
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                                    ✓ Aktif
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Saldo Terbuka */}
                            <td className="py-3 px-3 text-right">
                              <div className="font-mono font-black text-sm text-emerald-400">
                                {formatCurrency(userSaldo)}
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedUserForSaldo(user);
                                  setNewSaldoInput(userSaldo);
                                  setNewLockedSaldoInput(userLocked);
                                  setSaldoChangeReason('');
                                }}
                                className="text-[10px] text-amber-300 hover:text-amber-200 underline font-bold inline-flex items-center gap-1 mt-0.5 cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Ubah</span>
                              </button>
                            </td>

                            {/* Saldo Terkunci */}
                            <td className="py-3 px-3 text-right">
                              <div className={`font-mono font-bold text-xs ${userLocked > 0 ? 'text-amber-400 font-black' : 'text-white/40'}`}>
                                {userLocked > 0 ? (
                                  <span className="inline-flex items-center gap-1">
                                    <Lock className="w-3 h-3 text-amber-400" />
                                    {formatCurrency(userLocked)}
                                  </span>
                                ) : (
                                  'Rp 0'
                                )}
                              </div>
                              {userLocked > 0 && (
                                <span className="text-[9px] text-amber-300/80 block mt-0.5 font-semibold">
                                  Terkunci / Pending
                                </span>
                              )}
                            </td>

                            {/* Total Saldo */}
                            <td className="py-3 px-3 text-right">
                              <div className="font-mono font-black text-sm text-white">
                                {formatCurrency(userTotal)}
                              </div>
                              <span className="text-[9px] text-white/40 block mt-0.5">
                                Terbuka + Terkunci
                              </span>
                            </td>

                            <td className="py-3 px-3 text-white/50 text-xs">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID') : '-'}
                            </td>

                            <td className="py-3 px-3">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedUserForSaldo(user);
                                    setNewSaldoInput(userSaldo);
                                    setSaldoChangeReason('');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold transition-all cursor-pointer"
                                  title="Edit Saldo Langsung"
                                >
                                  Edit Saldo
                                </button>

                                {isSuperOwner && !isUserOwner && !isUserAdmin && (
                                  <button
                                    onClick={async () => {
                                      if (user.email) {
                                        await addAdminAccount(user.email, user.displayName || 'Admin', 'Promoted from User Table', currentUserProfile?.email || OWNER_EMAIL);
                                        showNotification('success', `${user.email} berhasil dijadikan Admin!`);
                                      }
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition-all cursor-pointer"
                                    title="Jadikan Admin"
                                  >
                                    + Jadikan Admin
                                  </button>
                                )}

                                {!isUserOwner && (
                                  <button
                                    onClick={() => handleToggleBan(user)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                      isBanned
                                        ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                                        : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                                    }`}
                                  >
                                    {isBanned ? 'Buka Blokir' : 'Blokir'}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Users Card List (Mobile Friendly for Phone Mode) */}
              <div className="md:hidden space-y-3 mt-4">
                {filteredUsers.length === 0 ? (
                  <div className="py-8 text-center text-white/40 text-xs">
                    Tidak ada akun yang sesuai dengan pencarian.
                  </div>
                ) : (
                  filteredUsers.map((user) => {
                    const userSaldo = typeof user.saldo === 'number' ? user.saldo : (user.walletBalance ?? 0);
                    const isUserAdmin = user.role === 'admin' || admins.some((a) => a.email.toLowerCase() === (user.email || '').toLowerCase());
                    const isUserOwner = isOwnerUser(user.email);
                    const isBanned = Boolean(user.isBanned) || bannedUsers.some((b) => b.email.toLowerCase() === (user.email || '').toLowerCase());

                    return (
                      <div key={user.uid} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 shadow-md">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            {user.photoURL ? (
                              <img
                                src={user.photoURL}
                                alt=""
                                className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white/70 text-sm shrink-0">
                                {(user.displayName || user.email || 'U')[0].toUpperCase()}
                              </div>
                            )}
                            <div className="overflow-hidden">
                              <div className="font-bold text-white text-sm flex items-center gap-1.5 flex-wrap">
                                <span className="truncate">{user.displayName || 'Host Streamer'}</span>
                                {isUserOwner && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-400 text-black text-[9px] font-black">
                                    OWNER
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-white/60 font-mono break-all">{user.email || 'Tanpa Email'}</div>
                              <div className="text-[10px] text-white/30 font-mono truncate">UID: {user.uid}</div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            {isUserOwner ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[9px] font-bold border border-amber-400/40">
                                👑 Super Owner
                              </span>
                            ) : isUserAdmin ? (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[9px] font-bold border border-rose-500/40">
                                🛡️ Admin
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[9px] font-bold border border-blue-500/40">
                                🎮 Member
                              </span>
                            )}
                            {isBanned ? (
                              <span className="px-2 py-0.5 rounded-full bg-red-600/30 text-red-300 text-[9px] font-bold">
                                🚫 Banned
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                                ✓ Aktif
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Saldo Highlight Box (Terbuka, Terkunci, Total) */}
                        <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                              <span className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                                <Unlock className="w-3 h-3" />
                                <span>Saldo Terbuka</span>
                              </span>
                              <div className="font-mono font-black text-sm text-emerald-300 mt-0.5">
                                {formatCurrency(userSaldo)}
                              </div>
                            </div>

                            <div className={`p-2 rounded-lg border ${
                              (user.lockedSaldo || 0) > 0
                                ? 'bg-amber-500/15 border-amber-500/30'
                                : 'bg-white/5 border-white/10'
                            }`}>
                              <span className="text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                <span>Saldo Terkunci</span>
                              </span>
                              <div className={`font-mono font-black text-sm mt-0.5 ${
                                (user.lockedSaldo || 0) > 0 ? 'text-amber-300' : 'text-white/40'
                              }`}>
                                {formatCurrency(user.lockedSaldo || 0)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-white/5">
                            <div>
                              <span className="text-[10px] text-white/40 uppercase font-bold block">Total Saldo</span>
                              <span className="text-sm font-black font-mono text-white">
                                {formatCurrency(userSaldo + (user.lockedSaldo || 0))}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedUserForSaldo(user);
                                setNewSaldoInput(userSaldo);
                                setNewLockedSaldoInput(user.lockedSaldo || 0);
                                setSaldoChangeReason('');
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Ubah Saldo</span>
                            </button>
                          </div>
                        </div>

                        {/* Action buttons footer */}
                        <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                          {isSuperOwner && !isUserOwner && !isUserAdmin && (
                            <button
                              onClick={async () => {
                                if (user.email) {
                                  await addAdminAccount(user.email, user.displayName || 'Admin', 'Promoted from Mobile User Card', currentUserProfile?.email || OWNER_EMAIL);
                                  showNotification('success', `${user.email} berhasil dijadikan Admin!`);
                                }
                              }}
                              className="flex-1 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold text-center transition-all cursor-pointer"
                            >
                              + Jadikan Admin
                            </button>
                          )}
                          {!isUserOwner && (
                            <button
                              onClick={() => handleToggleBan(user)}
                              className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                                isBanned
                                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                                  : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                              }`}
                            >
                              {isBanned ? '✓ Buka Blokir' : '🚫 Blokir Akun'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: PENGELOLAAN JACKPOT                              */}
        {/* ======================================================== */}
        {activeTab === 'jackpot' && (
          <div className="space-y-6">
            {/* Jackpot Live Pool Card & Quick Controls */}
            <div className="bg-gradient-to-br from-[#131c31] via-[#0f172a] to-[#090e1a] rounded-2xl border border-amber-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Trophy className="w-48 h-48 text-amber-400" />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-300" />
                      <span>GRAND JACKPOT SYSTEM</span>
                    </span>
                    <span className="text-xs text-white/50">Diatur oleh Owner / Admin</span>
                  </div>

                  <div className="mt-3">
                    <div className="text-xs text-white/60 font-medium">Total Pool Jackpot Saat Ini:</div>
                    <div className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 font-mono tracking-tight mt-1">
                      {formatCurrency(jackpotSettings.poolAmount || 50000000)}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-white/70">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white/40">Peluang Alami:</span>
                      <span className="font-mono font-bold text-amber-300">
                        1 banding {jackpotSettings.winChance || 100}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-white/40">Min Bet:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {formatCurrency(jackpotSettings.minBet || 10000)}
                      </span>
                    </div>
                    {jackpotSettings.forceNextUser && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 font-bold">
                        <Zap className="w-3.5 h-3.5 fill-red-300" />
                        <span>Target Jackpot Terpasang ke 1 User</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <button
                    onClick={() => setShowJackpotModal(true)}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs transition-all shadow-lg active:scale-95 cursor-pointer"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Ubah Pool & Target Jackpot</span>
                  </button>

                  <button
                    onClick={() => setShowManualJackpotModal(true)}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs transition-all shadow-lg active:scale-95 cursor-pointer"
                  >
                    <Trophy className="w-4 h-4 text-yellow-300" />
                    <span>Bagi Jackpot Langsung</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Jackpot Winners Log Table */}
            <div className="bg-[#0f172a] rounded-2xl border border-white/10 p-5 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Riwayat Pemenang Grand Jackpot</span>
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Daftar seluruh pengguna yang memenangkan atau menerima hadiah jackpot.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-white font-mono text-xs font-bold">
                  {jackpotHistory.length} Pemenang
                </span>
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-wider text-white/50">
                      <th className="py-3 px-3">Pemenang</th>
                      <th className="py-3 px-3">Tipe Game / Mode</th>
                      <th className="py-3 px-3 text-right">Nominal Jackpot</th>
                      <th className="py-3 px-3">Waktu Menang</th>
                      <th className="py-3 px-3">Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {jackpotHistory.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-white/40 text-xs">
                          Belum ada riwayat pemenang jackpot.
                        </td>
                      </tr>
                    ) : (
                      jackpotHistory.map((rec, idx) => (
                        <tr key={rec.id || idx} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-bold text-white">{rec.userName}</div>
                            <div className="text-[11px] text-white/50 font-mono">{rec.userEmail}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                              {rec.gameType}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-black text-amber-400 text-sm">
                            {formatCurrency(rec.amount)}
                          </td>
                          <td className="py-3 px-3 text-white/50 text-xs">
                            {new Date(rec.wonAt).toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-3 text-white/60 text-xs">{rec.notes || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List */}
              <div className="md:hidden space-y-2.5 mt-4">
                {jackpotHistory.length === 0 ? (
                  <div className="py-8 text-center text-white/40 text-xs">
                    Belum ada riwayat pemenang jackpot.
                  </div>
                ) : (
                  jackpotHistory.map((rec, idx) => (
                    <div key={rec.id || idx} className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{rec.userName}</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                          {rec.gameType}
                        </span>
                      </div>
                      <div className="text-[11px] text-white/50 font-mono break-all">{rec.userEmail}</div>
                      <div className="flex items-center justify-between pt-1 border-t border-white/5">
                        <span className="text-[10px] text-white/40">{new Date(rec.wonAt).toLocaleString('id-ID')}</span>
                        <span className="font-mono font-black text-amber-400 text-sm">{formatCurrency(rec.amount)}</span>
                      </div>
                      {rec.notes && <div className="text-[11px] text-white/60 italic">{rec.notes}</div>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: PENGELOLAAN DEPOSIT USER                         */}
        {/* ======================================================== */}
        {activeTab === 'deposits' && (
          <div className="space-y-6">
            <div className="bg-[#0f172a] rounded-2xl border border-white/10 p-5 sm:p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                    <span>Daftar Pengajuan Deposit Pengguna</span>
                  </h2>
                  <p className="text-xs text-white/60 mt-0.5">
                    Verifikasi TxHash / bukti pembayaran. Sekali klik "Setujui", saldo pengguna langsung bertambah di Firestore.
                  </p>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => setDepositFilter('pending')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      depositFilter === 'pending'
                        ? 'bg-amber-500 text-black font-black'
                        : 'bg-white/5 hover:bg-white/10 text-white/70'
                    }`}
                  >
                    Pending ({orders.filter((o) => (o.type === 'deposit' || o.planName?.toLowerCase().includes('deposit')) && o.status === 'pending').length})
                  </button>
                  <button
                    onClick={() => setDepositFilter('success')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      depositFilter === 'success'
                        ? 'bg-emerald-500 text-black font-black'
                        : 'bg-white/5 hover:bg-white/10 text-white/70'
                    }`}
                  >
                    Sukses
                  </button>
                  <button
                    onClick={() => setDepositFilter('failed')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      depositFilter === 'failed'
                        ? 'bg-red-500 text-white font-black'
                        : 'bg-white/5 hover:bg-white/10 text-white/70'
                    }`}
                  >
                    Ditolak
                  </button>
                  <button
                    onClick={() => setDepositFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      depositFilter === 'all'
                        ? 'bg-white/20 text-white font-black'
                        : 'bg-white/5 hover:bg-white/10 text-white/70'
                    }`}
                  >
                    Semua
                  </button>
                </div>
              </div>

              {/* Deposit List (Desktop Table) */}
              <div className="hidden md:block overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-wider text-white/50">
                      <th className="py-3 px-3">Order ID & User</th>
                      <th className="py-3 px-3">Metode & TxHash</th>
                      <th className="py-3 px-3 text-right">Nominal Deposit</th>
                      <th className="py-3 px-3">Waktu</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-center">Tindakan Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {depositOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-white/40 text-xs">
                          Tidak ada data deposit dengan filter "{depositFilter}".
                        </td>
                      </tr>
                    ) : (
                      depositOrders.map((order) => {
                        const amount = order.jumlah || order.price || 0;
                        const isPending = order.status === 'pending';

                        return (
                          <tr key={order.orderId || order.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3 px-3">
                              <div className="font-mono font-bold text-amber-300 text-xs">
                                {order.orderId || order.id}
                              </div>
                              <div className="text-white font-semibold mt-0.5">{order.nama || order.userName || 'User'}</div>
                              <div className="text-white/40 font-mono text-[10px]">{order.userEmail}</div>
                            </td>

                            <td className="py-3 px-3">
                              <div className="font-bold text-white/80">{order.paymentMethod || 'Crypto'}</div>
                              {order.txHash ? (
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="font-mono text-[10px] text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                                    {order.txHash.slice(0, 10)}...{order.txHash.slice(-8)}
                                  </span>
                                  <button
                                    onClick={() => handleCopy(order.txHash || '', 'TxHash')}
                                    className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white"
                                    title="Salin TxHash"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-white/40">-</span>
                              )}
                            </td>

                            <td className="py-3 px-3 text-right font-mono font-black text-emerald-400 text-sm">
                              {formatCurrency(amount)}
                            </td>

                            <td className="py-3 px-3 text-white/50 text-xs">
                              {order.createdAt ? new Date(order.createdAt).toLocaleString('id-ID') : '-'}
                            </td>

                            <td className="py-3 px-3">
                              {order.status === 'pending' && (
                                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[10px] animate-pulse">
                                  ⏳ Menunggu Persetujuan
                                </span>
                              )}
                              {order.status === 'success' && (
                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[10px]">
                                  ✓ Disetujui
                                </span>
                              )}
                              {order.status === 'failed' && (
                                <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-bold text-[10px]">
                                  ✕ Ditolak
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-3">
                              {isPending ? (
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    disabled={processingOrderId === (order.orderId || order.id)}
                                    onClick={() => handleApproveDeposit(order)}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                                  >
                                    ✓ Setujui
                                  </button>
                                  <button
                                    disabled={processingOrderId === (order.orderId || order.id)}
                                    onClick={() => setRejectDepositModal(order)}
                                    className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                                  >
                                    ✕ Tolak
                                  </button>
                                </div>
                              ) : (
                                <div className="text-center text-[10px] text-white/40">
                                  {order.approvedBy ? `Oleh: ${order.approvedBy.split('@')[0]}` : '-'}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Deposit List (Mobile Friendly Cards for Phone Mode) */}
              <div className="md:hidden space-y-3 mt-4">
                {depositOrders.length === 0 ? (
                  <div className="py-8 text-center text-white/40 text-xs">
                    Tidak ada data deposit dengan filter "{depositFilter}".
                  </div>
                ) : (
                  depositOrders.map((order) => {
                    const amount = order.jumlah || order.price || 0;
                    const isPending = order.status === 'pending';

                    return (
                      <div key={order.orderId || order.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 shadow-md">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-amber-300 text-xs">
                            {order.orderId || order.id}
                          </span>
                          {order.status === 'pending' && (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[10px] animate-pulse">
                              ⏳ Pending
                            </span>
                          )}
                          {order.status === 'success' && (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[10px]">
                              ✓ Disetujui
                            </span>
                          )}
                          {order.status === 'failed' && (
                            <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-bold text-[10px]">
                              ✕ Ditolak
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="text-white font-bold text-sm">{order.nama || order.userName || 'User'}</div>
                          <div className="text-white/50 font-mono text-xs break-all">{order.userEmail}</div>
                        </div>

                        <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-white/50 uppercase font-bold block">Nominal Deposit</span>
                            <span className="text-lg font-black font-mono text-emerald-400">
                              {formatCurrency(amount)}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-white/50 uppercase font-bold block">Metode</span>
                            <span className="text-xs font-bold text-white">{order.paymentMethod || 'Crypto'}</span>
                          </div>
                        </div>

                        {order.txHash && (
                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/30 text-xs">
                            <div className="flex items-center gap-1.5 overflow-hidden">
                              <span className="text-[10px] text-cyan-400 font-bold uppercase shrink-0">TxHash:</span>
                              <span className="font-mono text-[10px] text-cyan-200 truncate">
                                {order.txHash}
                              </span>
                            </div>
                            <button
                              onClick={() => handleCopy(order.txHash || '', 'TxHash')}
                              className="p-1 rounded hover:bg-white/10 text-cyan-300 shrink-0 ml-2"
                              title="Salin TxHash"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-white/40 pt-1">
                          <span>Waktu: {order.createdAt ? new Date(order.createdAt).toLocaleString('id-ID') : '-'}</span>
                          {order.approvedBy && <span>Oleh: {order.approvedBy.split('@')[0]}</span>}
                        </div>

                        {isPending && (
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                            <button
                              disabled={processingOrderId === (order.orderId || order.id)}
                              onClick={() => handleApproveDeposit(order)}
                              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 text-center"
                            >
                              ✓ Setujui
                            </button>
                            <button
                              disabled={processingOrderId === (order.orderId || order.id)}
                              onClick={() => setRejectDepositModal(order)}
                              className="w-full py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-xs transition-all cursor-pointer disabled:opacity-50 text-center"
                            >
                              ✕ Tolak
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: PENGELOLAAN PENARIKAN (WITHDRAWALS)               */}
        {/* ======================================================== */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-6">
            <div className="bg-[#0f172a] rounded-2xl border border-white/10 p-5 sm:p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <ArrowUpRight className="w-5 h-5 text-blue-400" />
                    <span>Daftar Permintaan Penarikan (WD) Pengguna</span>
                  </h2>
                  <p className="text-xs text-white/60 mt-0.5">
                    Proses transfer crypto ke alamat wallet pemohon. Jika ditolak, saldo otomatis dikembalikan ke akun pengguna.
                  </p>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => setWithdrawalFilter('pending')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      withdrawalFilter === 'pending'
                        ? 'bg-amber-500 text-black font-black'
                        : 'bg-white/5 hover:bg-white/10 text-white/70'
                    }`}
                  >
                    Pending ({orders.filter((o) => (o.type === 'withdrawal' || o.planName?.toLowerCase().includes('withdrawal')) && o.status === 'pending').length})
                  </button>
                  <button
                    onClick={() => setWithdrawalFilter('success')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      withdrawalFilter === 'success'
                        ? 'bg-emerald-500 text-black font-black'
                        : 'bg-white/5 hover:bg-white/10 text-white/70'
                    }`}
                  >
                    Selesai
                  </button>
                  <button
                    onClick={() => setWithdrawalFilter('failed')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      withdrawalFilter === 'failed'
                        ? 'bg-red-500 text-white font-black'
                        : 'bg-white/5 hover:bg-white/10 text-white/70'
                    }`}
                  >
                    Ditolak
                  </button>
                  <button
                    onClick={() => setWithdrawalFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      withdrawalFilter === 'all'
                        ? 'bg-white/20 text-white font-black'
                        : 'bg-white/5 hover:bg-white/10 text-white/70'
                    }`}
                  >
                    Semua
                  </button>
                </div>
              </div>

              {/* Withdrawals List (Desktop Table) */}
              <div className="hidden md:block overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-wider text-white/50">
                      <th className="py-3 px-3">Order WD & User</th>
                      <th className="py-3 px-3">Alamat Wallet Tujuan</th>
                      <th className="py-3 px-3 text-right">Gross (Kotor)</th>
                      <th className="py-3 px-3 text-right">Net Payout (97%)</th>
                      <th className="py-3 px-3">Waktu</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-center">Tindakan Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {withdrawalOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-white/40 text-xs">
                          Tidak ada data penarikan dengan filter "{withdrawalFilter}".
                        </td>
                      </tr>
                    ) : (
                      withdrawalOrders.map((order) => {
                        const amount = order.price || 0;
                        const fee = order.feeAmount || Math.round(amount * 0.03);
                        const net = order.netPayoutAmount || (amount - fee);
                        const isPending = order.status === 'pending';
                        const address = order.bankDetails?.accountNumber || order.notes?.split('Address: ')[1]?.split(' |')[0] || '-';
                        const network = order.bankDetails?.bankName || order.paymentMethod || 'Crypto';

                        return (
                          <tr key={order.orderId || order.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3 px-3">
                              <div className="font-mono font-bold text-blue-300 text-xs">
                                {order.orderId || order.id}
                              </div>
                              <div className="text-white font-semibold mt-0.5">{order.userName || 'Streamer'}</div>
                              <div className="text-white/40 font-mono text-[10px]">{order.userEmail}</div>
                            </td>

                            <td className="py-3 px-3">
                              <div className="font-bold text-white/80">{network}</div>
                              <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px] text-cyan-300">
                                <span>{address.slice(0, 10)}...{address.slice(-6)}</span>
                                <button
                                  onClick={() => handleCopy(address, 'Alamat Wallet')}
                                  className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white"
                                  title="Salin Alamat"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </td>

                            <td className="py-3 px-3 text-right font-mono text-white/70">
                              {formatCurrency(amount)}
                            </td>

                            <td className="py-3 px-3 text-right font-mono font-black text-emerald-400 text-sm">
                              {formatCurrency(net)}
                            </td>

                            <td className="py-3 px-3 text-white/50 text-xs">
                              {order.createdAt ? new Date(order.createdAt).toLocaleString('id-ID') : '-'}
                            </td>

                            <td className="py-3 px-3">
                              {order.status === 'pending' && (
                                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[10px] animate-pulse">
                                  ⏳ Menunggu Transfer
                                </span>
                              )}
                              {order.status === 'success' && (
                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[10px]">
                                  ✓ Selesai & Terbayar
                                </span>
                              )}
                              {order.status === 'failed' && (
                                <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-bold text-[10px]">
                                  ✕ Ditolak & Refund
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-3">
                              {isPending ? (
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    disabled={processingOrderId === (order.orderId || order.id)}
                                    onClick={() => setApproveWdModal(order)}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                                  >
                                    ✓ Selesai
                                  </button>
                                  <button
                                    disabled={processingOrderId === (order.orderId || order.id)}
                                    onClick={() => setRejectWdModal(order)}
                                    className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                                  >
                                    ✕ Tolak
                                  </button>
                                </div>
                              ) : (
                                <div className="text-center text-[10px] text-white/40">
                                  {order.approvedBy ? `Diproses: ${order.approvedBy.split('@')[0]}` : '-'}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Withdrawals List (Mobile Friendly Cards for Phone Mode) */}
              <div className="md:hidden space-y-3 mt-4">
                {withdrawalOrders.length === 0 ? (
                  <div className="py-8 text-center text-white/40 text-xs">
                    Tidak ada data penarikan dengan filter "{withdrawalFilter}".
                  </div>
                ) : (
                  withdrawalOrders.map((order) => {
                    const amount = order.price || 0;
                    const fee = order.feeAmount || Math.round(amount * 0.03);
                    const net = order.netPayoutAmount || (amount - fee);
                    const isPending = order.status === 'pending';
                    const address = order.bankDetails?.accountNumber || order.notes?.split('Address: ')[1]?.split(' |')[0] || '-';
                    const network = order.bankDetails?.bankName || order.paymentMethod || 'Crypto';

                    return (
                      <div key={order.orderId || order.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 shadow-md">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-blue-300 text-xs">
                            {order.orderId || order.id}
                          </span>
                          {order.status === 'pending' && (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[10px] animate-pulse">
                              ⏳ Pending
                            </span>
                          )}
                          {order.status === 'success' && (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[10px]">
                              ✓ Selesai
                            </span>
                          )}
                          {order.status === 'failed' && (
                            <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-bold text-[10px]">
                              ✕ Ditolak
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="text-white font-bold text-sm">{order.userName || 'Streamer'}</div>
                          <div className="text-white/50 font-mono text-xs break-all">{order.userEmail}</div>
                        </div>

                        <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white/50">Gross (Kotor):</span>
                            <span className="font-mono text-white/80">{formatCurrency(amount)}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white/50">Fee Transaksi (3% + Gas Fee):</span>
                            <span className="font-mono text-rose-400">-{formatCurrency(fee)}</span>
                          </div>
                          <div className="flex items-center justify-between pt-1.5 border-t border-white/10">
                            <span className="text-xs font-bold text-emerald-400">Net Payout:</span>
                            <span className="text-base font-black font-mono text-emerald-400">{formatCurrency(net)}</span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-800/30 space-y-1">
                          <div className="text-[10px] text-blue-300 font-bold uppercase">{network}</div>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[11px] text-white/80 truncate mr-2">{address}</span>
                            <button
                              onClick={() => handleCopy(address, 'Alamat Wallet')}
                              className="p-1 rounded hover:bg-white/10 text-cyan-300 shrink-0"
                              title="Salin Alamat"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-white/40 pt-1">
                          <span>Waktu: {order.createdAt ? new Date(order.createdAt).toLocaleString('id-ID') : '-'}</span>
                          {order.approvedBy && <span>Oleh: {order.approvedBy.split('@')[0]}</span>}
                        </div>

                        {isPending && (
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                            <button
                              disabled={processingOrderId === (order.orderId || order.id)}
                              onClick={() => setApproveWdModal(order)}
                              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 text-center"
                            >
                              ✓ Selesaikan WD
                            </button>
                            <button
                              disabled={processingOrderId === (order.orderId || order.id)}
                              onClick={() => setRejectWdModal(order)}
                              className="w-full py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-xs transition-all cursor-pointer disabled:opacity-50 text-center"
                            >
                              ✕ Tolak & Refund
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: SEMUA AKTIFITAS USER (ACTIVITY FEED)             */}
        {/* ======================================================== */}
        {activeTab === 'activities' && (
          <div className="space-y-6">
            <div className="bg-[#0f172a] rounded-2xl border border-white/10 p-5 sm:p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-400" />
                    <span>Realtime Log Semua Aktifitas Pengguna</span>
                  </h2>
                  <p className="text-xs text-white/60 mt-0.5">
                    Pemantauan langsung segala transaksi, penarikan, jackpot, transfer, dan tindakan administratif.
                  </p>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => setActivityCategory('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      activityCategory === 'all'
                        ? 'bg-purple-600 text-white font-black'
                        : 'bg-white/5 hover:bg-white/10 text-white/70'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setActivityCategory('deposit')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      activityCategory === 'deposit'
                        ? 'bg-emerald-500 text-black font-black'
                        : 'bg-white/5 hover:bg-white/10 text-white/70'
                    }`}
                  >
                    Deposit
                  </button>
                  <button
                    onClick={() => setActivityCategory('withdrawal')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      activityCategory === 'withdrawal'
                        ? 'bg-blue-500 text-white font-black'
                        : 'bg-white/5 hover:bg-white/10 text-white/70'
                    }`}
                  >
                    WD
                  </button>
                  <button
                    onClick={() => setActivityCategory('jackpot')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      activityCategory === 'jackpot'
                        ? 'bg-amber-500 text-black font-black'
                        : 'bg-white/5 hover:bg-white/10 text-white/70'
                    }`}
                  >
                    Jackpot
                  </button>
                  <button
                    onClick={() => setActivityCategory('admin_action')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      activityCategory === 'admin_action'
                        ? 'bg-rose-500 text-white font-black'
                        : 'bg-white/5 hover:bg-white/10 text-white/70'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              {/* Activities Stream */}
              <div className="space-y-2.5 mt-4">
                {activities
                  .filter((a) => activityCategory === 'all' || a.type === activityCategory)
                  .map((act) => (
                    <div
                      key={act.id}
                      className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            act.type === 'deposit'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : act.type === 'withdrawal'
                              ? 'bg-blue-500/20 text-blue-400'
                              : act.type === 'jackpot'
                              ? 'bg-amber-500/20 text-amber-400'
                              : act.type === 'admin_action'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-purple-500/20 text-purple-400'
                          }`}
                        >
                          {act.type === 'deposit' && <ArrowDownLeft className="w-5 h-5" />}
                          {act.type === 'withdrawal' && <ArrowUpRight className="w-5 h-5" />}
                          {act.type === 'jackpot' && <Trophy className="w-5 h-5" />}
                          {act.type === 'admin_action' && <ShieldCheck className="w-5 h-5" />}
                          {act.type === 'transfer' && <Send className="w-5 h-5" />}
                          {act.type === 'game_play' && <Zap className="w-5 h-5" />}
                        </div>

                        <div className="overflow-hidden">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-white">{act.title}</span>
                            <span
                              className={`px-2 py-0.2 rounded text-[9px] font-black uppercase ${
                                act.type === 'deposit'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : act.type === 'withdrawal'
                                  ? 'bg-blue-500/20 text-blue-300'
                                  : act.type === 'jackpot'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : act.type === 'admin_action'
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : 'bg-white/10 text-white/70'
                              }`}
                            >
                              {act.type}
                            </span>
                          </div>

                          <div className="text-xs text-white/70 mt-0.5 break-words">{act.details || '-'}</div>

                          <div className="text-[10px] text-white/40 mt-1 flex items-center gap-2 flex-wrap">
                            <span className="truncate max-w-[200px]">User: {act.userName || act.userEmail}</span>
                            <span>•</span>
                            <span>{new Date(act.createdAt).toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      </div>

                      {typeof act.amount === 'number' && act.amount > 0 && (
                        <div className="font-mono font-black text-sm text-emerald-400 shrink-0 self-end sm:self-center pl-12 sm:pl-0">
                          {formatCurrency(act.amount)}
                        </div>
                      )}
                    </div>
                  ))}

                {activities.length === 0 && (
                  <div className="py-12 text-center text-white/40 text-xs">
                    Belum ada rekaman aktifitas tercatat.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* MODAL: TAMBAH AKUN ADMIN (Owner Only)                    */}
      {/* ======================================================== */}
      {showAddAdminModal && isSuperOwner && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f172a] rounded-2xl border border-amber-500/30 p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">Tambah Akun Admin Baru</h3>
              </div>
              <button
                onClick={() => setShowAddAdminModal(false)}
                className="p-1.5 rounded-lg text-white/60 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAdminSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-white/80 block mb-1">
                  Alamat Email Admin <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@gmail.com"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/40 focus:outline-none focus:border-amber-400"
                />
                <span className="text-[10px] text-white/50 mt-1 block">
                  User yang login dengan email ini akan otomatis masuk ke tampilan Control Center yang sama dengan Owner berlog "ADMIN".
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-white/80 block mb-1">
                  Nama Tampilan Admin
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Admin Finance 1"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/40 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/80 block mb-1">
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan penugasan admin..."
                  value={newAdminNotes}
                  onChange={(e) => setNewAdminNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/40 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white/70 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdmin}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isSubmittingAdmin ? 'Menyimpan...' : 'Simpan Akun Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT SALDO LANGSUNG                              */}
      {/* ======================================================== */}
      {selectedUserForSaldo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f172a] rounded-2xl border border-emerald-500/30 p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-black text-white">Ubah Saldo User Langsung</h3>
              </div>
              <button
                onClick={() => setSelectedUserForSaldo(null)}
                className="p-1.5 rounded-lg text-white/60 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSaldoSubmit} className="mt-4 space-y-4">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
                <div className="font-bold text-white">{selectedUserForSaldo.displayName || 'User'}</div>
                <div className="text-[11px] text-white/50 font-mono">{selectedUserForSaldo.email}</div>
                
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[9px] uppercase font-bold text-emerald-400 block">Saldo Terbuka Saat Ini</span>
                    <span className="text-xs font-black font-mono text-emerald-300">
                      {formatCurrency(selectedUserForSaldo.saldo ?? selectedUserForSaldo.walletBalance ?? 0)}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <span className="text-[9px] uppercase font-bold text-amber-400 block">Saldo Terkunci Saat Ini</span>
                    <span className="text-xs font-black font-mono text-amber-300">
                      {formatCurrency(selectedUserForSaldo.lockedSaldo ?? 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Saldo Terbuka Input */}
              <div>
                <label className="text-xs font-bold text-white/80 block mb-1">
                  Nominal Saldo Terbuka Baru (Rp) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step={1000}
                  value={newSaldoInput}
                  onChange={(e) => setNewSaldoInput(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-emerald-400 font-mono font-bold text-sm focus:outline-none focus:border-emerald-400"
                />
                <span className="text-[10px] text-white/40 mt-1 block">
                  Saldo bebas yang dapat langsung dipakai atau ditarik oleh user.
                </span>
              </div>

              {/* Saldo Terkunci Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-white/80">
                    Nominal Saldo Terkunci (Rp)
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewLockedSaldoInput(0)}
                    className="text-[10px] text-amber-300 hover:text-amber-200 underline font-bold cursor-pointer"
                  >
                    Buka Kunci (Reset ke Rp 0)
                  </button>
                </div>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={newLockedSaldoInput}
                  onChange={(e) => setNewLockedSaldoInput(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-amber-300 font-mono font-bold text-sm focus:outline-none focus:border-amber-400"
                />
                <span className="text-[10px] text-white/40 mt-1 block">
                  Saldo yang terkunci karena penarikan pending atau jaminan. Isi 0 untuk melepas semua kuncian.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-white/80 block mb-1">
                  Alasan Penyesuaian Saldo <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bonus Sultan Live, Koreksi Deposit, Pelepasan Lock Saldo, dll"
                  value={saldoChangeReason}
                  onChange={(e) => setSaldoChangeReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/40 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedUserForSaldo(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white/70 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSaldo}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isSubmittingSaldo ? 'Menyimpan...' : 'Perbarui Saldo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: PENGATURAN JACKPOT & TARGET                       */}
      {/* ======================================================== */}
      {showJackpotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0f172a] rounded-2xl border border-amber-500/30 p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">Pengaturan Sistem Jackpot</h3>
              </div>
              <button
                onClick={() => setShowJackpotModal(false)}
                className="p-1.5 rounded-lg text-white/60 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJackpotSettings} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-white/80 block mb-1">
                  Nominal Pool Jackpot (Rp)
                </label>
                <input
                  type="number"
                  min={1000000}
                  step={1000000}
                  value={poolInput}
                  onChange={(e) => setPoolInput(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-amber-300 font-mono font-bold text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-white/80 block mb-1">
                    Peluang Alami (1 banding X)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={chanceInput}
                    onChange={(e) => setChanceInput(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-[10px] text-white/40 mt-1 block">Contoh: 100 = 1 dari 100 putaran</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-white/80 block mb-1">
                    Minimal Bet / Tiket (Rp)
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    value={minBetInput}
                    onChange={(e) => setMinBetInput(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Force Jackpot targeting */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-300 uppercase">
                  <Zap className="w-4 h-4 fill-amber-300" />
                  <span>Kunci / Target Jackpot ke User Tertentu</span>
                </div>
                <p className="text-[11px] text-white/60">
                  User yang dipilih akan PASTI memenangkan Jackpot pada spin/unbox putaran berikutnya.
                </p>

                <div>
                  <label className="text-[11px] font-bold text-white/80 block mb-1">
                    Pilih Target Pengguna:
                  </label>
                  <select
                    value={targetUserUid}
                    onChange={(e) => setTargetUserUid(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none"
                  >
                    <option value="">-- Tidak Ada Target (Peluang Alami) --</option>
                    {users.map((u) => (
                      <option key={u.uid} value={u.uid}>
                        {u.displayName || 'Host'} ({u.email || u.uid})
                      </option>
                    ))}
                  </select>
                </div>

                {targetUserUid && (
                  <div>
                    <label className="text-[11px] font-bold text-white/80 block mb-1">
                      Nominal Khusus yang Akan Dimenangkan:
                    </label>
                    <input
                      type="number"
                      step={1000000}
                      value={targetJackpotNominal}
                      onChange={(e) => setTargetJackpotNominal(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-amber-300 font-mono text-xs focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowJackpotModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white/70 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingJackpot}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isSavingJackpot ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: BAGI JACKPOT MANUAL                              */}
      {/* ======================================================== */}
      {showManualJackpotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f172a] rounded-2xl border border-purple-500/40 p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-300" />
                <h3 className="text-base font-black text-white">Bagi Hadiah Jackpot Manual</h3>
              </div>
              <button
                onClick={() => setShowManualJackpotModal(false)}
                className="p-1.5 rounded-lg text-white/60 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualJackpotSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-white/80 block mb-1">
                  Pilih User Penerima Jackpot <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={manualJackpotUserId}
                  onChange={(e) => setManualJackpotUserId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
                >
                  <option value="">-- Pilih User --</option>
                  {users.map((u) => (
                    <option key={u.uid} value={u.uid} className="bg-[#0f172a]">
                      {u.displayName || 'Host'} - {u.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-white/80 block mb-1">
                  Nominal Hadiah Jackpot (Rp) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={100000}
                  step={500000}
                  value={manualJackpotNominal}
                  onChange={(e) => setManualJackpotNominal(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-yellow-300 font-mono font-bold text-sm focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/80 block mb-1">
                  Catatan / Keterangan Hadiah
                </label>
                <input
                  type="text"
                  placeholder="Hadiah Sultan Grand Jackpot Spesial"
                  value={manualJackpotNotes}
                  onChange={(e) => setManualJackpotNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/40 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowManualJackpotModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white/70 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isDisbursingJackpot}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isDisbursingJackpot ? 'Mengirimkan...' : 'Kirim Jackpot Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: TOLAK DEPOSIT                                    */}
      {/* ======================================================== */}
      {rejectDepositModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f172a] rounded-2xl border border-red-500/30 p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span>Konfirmasi Penolakan Deposit</span>
            </h3>
            <p className="text-xs text-white/60 mt-1">
              Deposit {rejectDepositModal.orderId} senilai {formatCurrency(rejectDepositModal.jumlah || rejectDepositModal.price)} akan ditandai ditolak.
            </p>

            <div className="mt-4">
              <label className="text-xs font-bold text-white/80 block mb-1">
                Alasan Penolakan:
              </label>
              <input
                type="text"
                placeholder="Contoh: Bukti TxHash tidak valid atau dana belum masuk"
                value={rejectDepositReason}
                onChange={(e) => setRejectDepositReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/40 focus:outline-none focus:border-red-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setRejectDepositModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white/70 hover:text-white"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleRejectDeposit}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs transition-all shadow-md active:scale-95"
              >
                Tolak Deposit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: SELESAIKAN WITHDRAWAL (SETUJUI)                  */}
      {/* ======================================================== */}
      {approveWdModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f172a] rounded-2xl border border-emerald-500/30 p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>Selesaikan Penarikan (WD)</span>
            </h3>
            <p className="text-xs text-white/60 mt-1">
              Konfirmasi bahwa transfer telah berhasil dikirimkan ke alamat crypto pengguna.
            </p>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs mt-3 space-y-1">
              <div>User: <span className="font-bold text-white">{approveWdModal.userName || approveWdModal.userEmail}</span></div>
              <div>Nominal Bersih: <span className="font-bold text-emerald-400 font-mono">{formatCurrency(approveWdModal.netPayoutAmount || approveWdModal.price)}</span></div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-bold text-white/80 block mb-1">
                Hash Transaksi Pengiriman (TxID Payout - Opsional):
              </label>
              <input
                type="text"
                placeholder="Masukkan TxHash bukti transfer crypto..."
                value={payoutTxHashInput}
                onChange={(e) => setPayoutTxHashInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/40 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setApproveWdModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white/70 hover:text-white"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApproveWithdrawalSubmit}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-all shadow-md active:scale-95"
              >
                Selesaikan Penarikan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: TOLAK WITHDRAWAL & AUTO REFUND                    */}
      {/* ======================================================== */}
      {rejectWdModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f172a] rounded-2xl border border-red-500/30 p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span>Tolak Penarikan & Kembalikan Saldo</span>
            </h3>
            <p className="text-xs text-white/60 mt-1">
              Dana sebesar <span className="font-bold text-emerald-400">{formatCurrency(rejectWdModal.price)}</span> akan secara otomatis dikembalikan ke saldo Firestore user.
            </p>

            <div className="mt-4">
              <label className="text-xs font-bold text-white/80 block mb-1">
                Alasan Penolakan:
              </label>
              <input
                type="text"
                placeholder="Contoh: Alamat wallet tidak valid, jaringan salah, dll"
                value={rejectWdReason}
                onChange={(e) => setRejectWdReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/40 focus:outline-none focus:border-red-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setRejectWdModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white/70 hover:text-white"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleRejectWithdrawalSubmit}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs transition-all shadow-md active:scale-95"
              >
                Tolak & Refund Saldo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: KONFIRMASI BLOKIR USER                            */}
      {/* ======================================================== */}
      {selectedUserForBan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f172a] rounded-2xl border border-red-500/40 p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <UserX className="w-5 h-5 text-red-400" />
              <span>Blokir Akun Pengguna</span>
            </h3>
            <p className="text-xs text-white/60 mt-1">
              Akun <span className="font-bold text-white">{selectedUserForBan.email}</span> tidak akan dapat mengakses aplikasi.
            </p>

            <div className="mt-4">
              <label className="text-xs font-bold text-white/80 block mb-1">
                Alasan Pemblokiran:
              </label>
              <input
                type="text"
                placeholder="Contoh: Spam, penipuan, transaksi palsu"
                value={banReasonInput}
                onChange={(e) => setBanReasonInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-white/40 focus:outline-none focus:border-red-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedUserForBan(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white/70 hover:text-white"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmBan}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs transition-all shadow-md active:scale-95"
              >
                Konfirmasi Blokir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MOBILE BOTTOM NAVIGATION BAR (Ergonomic Phone Controls)   */}
      {/* ======================================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d1424]/98 backdrop-blur-xl border-t border-white/10 px-1 py-1.5 flex items-center justify-around shadow-2xl select-none">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'accounts' ? 'text-amber-400 font-black' : 'text-white/50 hover:text-white/80'
          }`}
        >
          <div className="relative">
            <Users className="w-5 h-5" />
            <span className="absolute -top-1 -right-2 px-1 rounded-full text-[8px] bg-amber-500 text-black font-black">
              {users.length}
            </span>
          </div>
          <span className="text-[10px] mt-0.5 font-bold">Akun</span>
        </button>

        <button
          onClick={() => setActiveTab('jackpot')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'jackpot' ? 'text-amber-400 font-black' : 'text-white/50 hover:text-white/80'
          }`}
        >
          <div className="relative">
            <Trophy className="w-5 h-5" />
            {jackpotSettings.forceNextUser && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 font-bold">Jackpot</span>
        </button>

        <button
          onClick={() => setActiveTab('deposits')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'deposits' ? 'text-emerald-400 font-black' : 'text-white/50 hover:text-white/80'
          }`}
        >
          <div className="relative">
            <ArrowDownLeft className="w-5 h-5" />
            {metrics.pendingDepositsCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 px-1 py-0.2 rounded-full text-[9px] bg-emerald-500 text-black font-black animate-pulse">
                {metrics.pendingDepositsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 font-bold">Deposit</span>
        </button>

        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'withdrawals' ? 'text-blue-400 font-black' : 'text-white/50 hover:text-white/80'
          }`}
        >
          <div className="relative">
            <ArrowUpRight className="w-5 h-5" />
            {metrics.pendingWithdrawalsCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 px-1 py-0.2 rounded-full text-[9px] bg-rose-500 text-white font-black animate-pulse">
                {metrics.pendingWithdrawalsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 font-bold">WD</span>
        </button>

        <button
          onClick={() => setActiveTab('activities')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'activities' ? 'text-purple-400 font-black' : 'text-white/50 hover:text-white/80'
          }`}
        >
          <div className="relative">
            <Activity className="w-5 h-5" />
            <span className="absolute -top-1 -right-2 px-1 rounded-full text-[8px] bg-white/20 text-white font-bold">
              {activities.length}
            </span>
          </div>
          <span className="text-[10px] mt-0.5 font-bold">Aktifitas</span>
        </button>
      </nav>
    </div>
  );
};
