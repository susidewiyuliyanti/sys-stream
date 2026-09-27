import React, { useState, useEffect, useRef, useMemo } from 'react';
import { doc, onSnapshot, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { UserProfile, TransactionOrder, StreamingSessionLog } from '../types';
import {
  updateUserProfile,
  subscribeToUserOrders,
  subscribeToUserStreamingSessions,
  createTransactionOrder,
  createStreamingSessionLog,
  depositUserWallet,
  withdrawUserWallet,
  transferUserWallet,
  approvePendingDeposit,
  rejectPendingDeposit,
  subscribeToPendingDeposits
} from '../services/firebase';
import { sound } from '../services/sound';
import { useAppConfig } from '../context/AppConfigContext';
import { SysLogo } from './SysLogo';
import { QrCodeView } from './QrCodeView';
import { MemberBadge } from './MemberBadge';
import { isOwnerUser, isMemberActive } from '../utils/memberBadge';
import {
  CRYPTO_WITHDRAW_OPTIONS,
  calculateCryptoEstimate,
  getCryptoGasFee,
  CryptoWithdrawOption
} from '../constants/cryptoOptions';
import {
  createNowPaymentOrder,
  checkNowPaymentStatus,
  finalizeCompletedNowPayment,
  NOWPAYMENTS_CURRENCIES,
  getCurrencyMinDeposit,
  CreatedPaymentData,
  PaymentStatusData
} from '../services/nowpayments';
import confetti from 'canvas-confetti';
import {
  Zap,
  User,
  Camera,
  Upload,
  CreditCard,
  Radio,
  Clock,
  CheckCircle2,
  Calendar,
  Shield,
  Crown,
  Copy,
  Check,
  Award,
  DollarSign,
  TrendingUp,
  Flame,
  X,
  Loader2,
  Save,
  Plus,
  FileText,
  ExternalLink,
  ChevronRight,
  Hash,
  AlertCircle,
  Tv,
  Gift,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  PlusCircle,
  Building2,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Send,
  ArrowRightLeft,
  LogOut,
  Lock,
  Unlock,
  Coins,
  ShieldCheck,
  Percent,
  Trash2,
  Globe,
} from 'lucide-react';
import { BlindBoxDeposit } from '../types';
import { BlindBoxUnlockModal } from './blindbox/BlindBoxUnlockModal';
import { CountryLanguageSelectorModal } from './CountryLanguageSelectorModal';

export const CRYPTO_DEPOSIT_WALLETS = [
  {
    network: 'USDT (TRC-20)',
    name: 'Tether USD',
    address: 'TWMXfK8b5UKej3jGkSStYgW8cT8x9x3q7Z',
    badge: 'Recommended (TRON)',
    qrValue: 'TWMXfK8b5UKej3jGkSStYgW8cT8x9x3q7Z',
    minDeposit: '5 USDT (~Rp 80.000)',
    confirmations: '1 Network Confirmation (Instant)',
  },
  {
    network: 'USDT (BEP-20)',
    name: 'Tether USD BSC',
    address: '0x37bE268B0B5EBe34eA1738d6D5d457005008C2fe',
    badge: 'BNB Smart Chain',
    qrValue: '0x37bE268B0B5EBe34eA1738d6D5d457005008C2fe',
    minDeposit: '5 USDT (~Rp 80.000)',
    confirmations: '15 Block Confirmations',
  },
  {
    network: 'USDT (Polygon)',
    name: 'Tether USD Polygon',
    address: '0x37bE268B0B5EBe34eA1738d6D5d457005008C2fe',
    badge: 'Polygon PoS',
    qrValue: '0x37bE268B0B5EBe34eA1738d6D5d457005008C2fe',
    minDeposit: '5 USDT (~Rp 80.000)',
    confirmations: '30 Block Confirmations',
  },
  {
    network: 'BTC',
    name: 'Bitcoin Native',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    badge: 'Bitcoin Mainnet',
    qrValue: 'bitcoin:bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    minDeposit: '0.0005 BTC',
    confirmations: '2 Network Confirmations',
  },
  {
    network: 'ETH',
    name: 'Ethereum',
    address: '0x37bE268B0B5EBe34eA1738d6D5d457005008C2fe',
    badge: 'Ethereum ERC-20',
    qrValue: '0x37bE268B0B5EBe34eA1738d6D5d457005008C2fe',
    minDeposit: '0.01 ETH',
    confirmations: '12 Block Confirmations',
  },
  {
    network: 'SOL',
    name: 'Solana SPL',
    address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    badge: 'Solana High-Speed',
    qrValue: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    minDeposit: '0.1 SOL',
    confirmations: '32 Slot Confirmations',
  },
];

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  saldo?: number;
  onOpenUpgrade?: () => void;
  onOpenReferral?: () => void;
  onLogout?: () => void | Promise<void>;
}

type TabType = 'profile' | 'deposit' | 'withdrawal' | 'transfer' | 'transactions' | 'streaming' | 'approval';

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  saldo: propSaldo,
  onOpenUpgrade,
  onOpenReferral,
  onLogout
}) => {
  const { formatCurrency, country, t } = useAppConfig();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isProfileLangModalOpen, setIsProfileLangModalOpen] = useState<boolean>(false);

  // Realtime Firestore Saldo State via onSnapshot (Dashboard saldo WAJIB pakai onSnapshot realtime)
  const [realtimeSaldo, setRealtimeSaldo] = useState<number | null>(null);
  const [realtimeLockedSaldo, setRealtimeLockedSaldo] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const targetUid = auth.currentUser?.uid || userProfile?.uid;
    if (!targetUid) return;

    const unsub = onSnapshot(
      doc(db, "users", targetUid),
      (d) => {
        if (d.exists()) {
          const data = d.data();
          const liveSaldo = typeof data?.saldo === 'number'
            ? data.saldo
            : (typeof data?.walletBalance === 'number' ? data.walletBalance : 0);
          setRealtimeSaldo(liveSaldo);

          const liveLocked = typeof data?.lockedSaldo === 'number' ? data.lockedSaldo : 0;
          setRealtimeLockedSaldo(liveLocked);
        }
      },
      (err) => {
        console.warn('Realtime onSnapshot error in UserProfileModal:', err);
      }
    );

    return () => unsub();
  }, [isOpen, userProfile?.uid]);

  // Profile Form States
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [streamerHandle, setStreamerHandle] = useState(userProfile?.streamerHandle || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [photoURL, setPhotoURL] = useState(userProfile?.photoURL || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Transactions State
  const [transactions, setTransactions] = useState<TransactionOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<TransactionOrder | null>(null);
  const [txFilter, setTxFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'transfer' | 'bonus' | 'subscription'>('all');

  // Saldo Terbuka (Dapat Digunakan & Ditarik)
  const currentBalance = realtimeSaldo !== null
    ? realtimeSaldo
    : (propSaldo !== undefined
        ? propSaldo
        : (typeof userProfile?.saldo === 'number'
            ? userProfile.saldo
            : (typeof userProfile?.walletBalance === 'number' ? userProfile.walletBalance : 0)));

  // Pending withdrawals list (Status: PENDING - Saldo Terkunci)
  const pendingWithdrawalsList = useMemo(() => {
    return transactions.filter(
      (t) =>
        (t.type === 'withdrawal' ||
          t.planName?.toLowerCase().includes('withdrawal') ||
          t.planName?.toLowerCase().includes('penarikan')) &&
        t.status === 'pending'
    );
  }, [transactions]);

  const pendingWithdrawalsSum = useMemo(() => {
    return pendingWithdrawalsList.reduce((acc, t) => acc + (t.price || 0), 0);
  }, [pendingWithdrawalsList]);

  // Blind Box Locked Deposit State & Unlock Modal
  const [activeLockedDeposit, setActiveLockedDeposit] = useState<BlindBoxDeposit | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState<boolean>(false);
  const [jwtTokenBB, setJwtTokenBB] = useState<string | null>(null);

  // Saldo Terkunci (Lock Saldo)
  const currentLockedBalance = useMemo(() => {
    const firestoreLocked = realtimeLockedSaldo !== null
      ? realtimeLockedSaldo
      : (typeof userProfile?.lockedSaldo === 'number' ? userProfile.lockedSaldo : 0);
    const baseLocked = Math.max(firestoreLocked, pendingWithdrawalsSum);
    const blindboxLocked = activeLockedDeposit && activeLockedDeposit.status === 'ACTIVE'
      ? (activeLockedDeposit.amount || 0)
      : 0;
    return baseLocked + blindboxLocked;
  }, [realtimeLockedSaldo, userProfile?.lockedSaldo, pendingWithdrawalsSum, activeLockedDeposit]);

  // Total Saldo Keseluruhan (Saldo Terbuka + Saldo Terkunci)
  const totalUserSaldo = useMemo(() => {
    return currentBalance + currentLockedBalance;
  }, [currentBalance, currentLockedBalance]);

  // Deposit Form State (NOWPayments Produksi Otomatis)
  const [depositAmount, setDepositAmount] = useState<number>(50000);
  const [nowpaymentsCurrency, setNowpaymentsCurrency] = useState<string>('usdtbsc');
  const [activeNowPayment, setActiveNowPayment] = useState<CreatedPaymentData | null>(null);
  const [isCreatingNowPayment, setIsCreatingNowPayment] = useState<boolean>(false);
  const [isPollingNowPayment, setIsPollingNowPayment] = useState<boolean>(false);
  const [nowPaymentError, setNowPaymentError] = useState<string | null>(null);
  const [nowPaymentSuccess, setNowPaymentSuccess] = useState<{
    newBalance: number;
    nominalIdr: number;
    cryptoAmount: number;
    currency: string;
    orderId: string;
  } | null>(null);
  const nowPaymentPollIntervalRef = useRef<any>(null);

  // Selected coin metadata & minimum deposit validation
  const selectedNowpaymentCoin = useMemo(() => {
    return NOWPAYMENTS_CURRENCIES.find((c) => c.id === nowpaymentsCurrency) || NOWPAYMENTS_CURRENCIES[0];
  }, [nowpaymentsCurrency]);

  const currentCoinMinDeposit = useMemo(() => {
    return selectedNowpaymentCoin.minDepositIdr || getCurrencyMinDeposit(nowpaymentsCurrency);
  }, [selectedNowpaymentCoin, nowpaymentsCurrency]);

  const isDepositBelowMin = depositAmount < currentCoinMinDeposit;

  // Withdrawal Form State (Crypto Only, Min 100.000)
  const [withdrawAmount, setWithdrawAmount] = useState<number>(100000);
  const [selectedCryptoId, setSelectedCryptoId] = useState<string>('USDT-TRC20');
  const [cryptoCategoryFilter, setCryptoCategoryFilter] = useState<'all' | 'stablecoin' | 'major' | 'altcoin'>('all');
  const [withdrawCryptoAddress, setWithdrawCryptoAddress] = useState<string>('');
  const [withdrawCryptoMemo, setWithdrawCryptoMemo] = useState<string>('');
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState<boolean>(false);
  const [withdrawErrorMessage, setWithdrawErrorMessage] = useState<string | null>(null);
  const [withdrawSuccessMessage, setWithdrawSuccessMessage] = useState<string | null>(null);

  const selectedCrypto = useMemo(() => {
    return CRYPTO_WITHDRAW_OPTIONS.find((c) => c.id === selectedCryptoId) || CRYPTO_WITHDRAW_OPTIONS[0];
  }, [selectedCryptoId]);

  // Transfer Form State (Min 100.000)
  const [transferRecipient, setTransferRecipient] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<number>(100000);
  const [transferNotes, setTransferNotes] = useState<string>('');
  const [isProcessingTransfer, setIsProcessingTransfer] = useState<boolean>(false);
  const [transferErrorMessage, setTransferErrorMessage] = useState<string | null>(null);
  const [transferSuccessData, setTransferSuccessData] = useState<{
    recipientName: string;
    recipientEmail: string;
    amount: number;
    orderId: string;
  } | null>(null);

  // Streaming State
  const [streamingSessions, setStreamingSessions] = useState<StreamingSessionLog[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [showAddSessionForm, setShowAddSessionForm] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newSessionGame, setNewSessionGame] = useState<'Tebak Nomor Seri Uang' | 'Lucky Spinner 3D' | 'Multi-Game Stream'>('Tebak Nomor Seri Uang');
  const [newSessionRounds, setNewSessionRounds] = useState(15);
  const [newSessionPrize, setNewSessionPrize] = useState(150000);
  const [newSessionTopWinner, setNewSessionTopWinner] = useState('');
  const [newSessionDuration, setNewSessionDuration] = useState(60);
  const [isSubmittingSession, setIsSubmittingSession] = useState(false);

  // Copy helper
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Owner & Appointed Admin Controls for Pending Deposits
  const isOwnerOrAdmin = isOwnerUser(userProfile?.email) || userProfile?.role === 'admin';
  const [pendingDeposits, setPendingDeposits] = useState<TransactionOrder[]>([]);
  const [isProcessingApproval, setIsProcessingApproval] = useState<string | null>(null);
  const [approvalFeedback, setApprovalFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isOpen || !isOwnerOrAdmin) return;
    const unsub = subscribeToPendingDeposits((orders) => {
      setPendingDeposits(orders);
    });
    return () => unsub();
  }, [isOpen, isOwnerOrAdmin]);

  const handleApproveDeposit = async (order: TransactionOrder) => {
    if (!userProfile?.email) return;
    const orderDocId = order.id || order.orderId;
    setIsProcessingApproval(orderDocId);
    setApprovalFeedback(null);
    try {
      const res = await approvePendingDeposit(orderDocId, userProfile.email);
      sound.playWinnerFanfare();
      confetti({ particleCount: 60, spread: 60 });
      setApprovalFeedback({
        type: 'success',
        text: `✅ Deposit of ${formatCurrency(order.price)} from ${order.userEmail} was approved! Account balance has been credited to ${formatCurrency(res.newTargetBalance)}.`
      });
    } catch (err: any) {
      sound.playWrong();
      setApprovalFeedback({
        type: 'error',
        text: err?.message || 'Failed to approve deposit transaction.'
      });
    } finally {
      setIsProcessingApproval(null);
    }
  };

  const handleRejectDeposit = async (order: TransactionOrder) => {
    if (!userProfile?.email) return;
    const orderDocId = order.id || order.orderId;
    setIsProcessingApproval(orderDocId);
    setApprovalFeedback(null);
    try {
      await rejectPendingDeposit(orderDocId, userProfile.email, 'Invalid transaction hash / link or funds not received');
      sound.playClick();
      setApprovalFeedback({
        type: 'success',
        text: `Deposit ${order.orderId} has been rejected.`
      });
    } catch (err: any) {
      sound.playWrong();
      setApprovalFeedback({
        type: 'error',
        text: err?.message || 'Failed to reject deposit transaction.'
      });
    } finally {
      setIsProcessingApproval(null);
    }
  };

  // Check for active locked deposit whenever modal opens
  useEffect(() => {
    if (!isOpen) return;
    const token = localStorage.getItem('blindbox_jwt_token');
    if (!token) return;
    setJwtTokenBB(token);

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.activeDeposit && data.activeDeposit.status === 'ACTIVE') {
          setActiveLockedDeposit(data.activeDeposit);
        } else {
          setActiveLockedDeposit(null);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  const handleUnlockSuccess = async (refundedAmount: number, forfeitedReward: number, newBalance: number) => {
    setActiveLockedDeposit(null);
    setSaveSuccessMessage(
      `Deposit unlocked successfully! Principal Rp ${refundedAmount.toLocaleString('id-ID')} has been returned to your wallet. Blind Box reward of Rp ${forfeitedReward.toLocaleString('id-ID')} was forfeited.`
    );
    if (userProfile?.uid) {
      try {
        await updateUserProfile(userProfile.uid, { walletBalance: newBalance });
        await createTransactionOrder({
          orderId: `UNLOCK-${Date.now().toString(36).toUpperCase()}`,
          userId: userProfile.uid,
          userEmail: userProfile.email,
          planName: `Unlock Deposit Balance (+Rp ${refundedAmount.toLocaleString('id-ID')})`,
          price: refundedAmount,
          currency: 'IDR',
          status: 'success',
          paymentMethod: 'Unlock (Principal Refund)',
          type: 'deposit',
          notes: `Early deposit unlock. Principal Rp ${refundedAmount.toLocaleString('id-ID')} returned to wallet. Reward Rp ${forfeitedReward.toLocaleString('id-ID')} forfeited.`,
          createdAt: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Error syncing unlocked balance to firebase:', e);
      }
    }
  };

  // Sync profile props to state when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setStreamerHandle(userProfile.streamerHandle || '');
      setBio(userProfile.bio || '');
      setPhotoURL(userProfile.photoURL || '');
    }
  }, [userProfile]);

  // Subscribe to real-time user orders
  useEffect(() => {
    if (!isOpen || !userProfile?.uid) return;
    setIsLoadingOrders(true);
    const unsubscribe = subscribeToUserOrders(userProfile.uid, (orders) => {
      setTransactions(orders);
      setIsLoadingOrders(false);
    });
    return () => unsubscribe();
  }, [isOpen, userProfile?.uid]);

  // Subscribe to real-time streaming sessions
  useEffect(() => {
    if (!isOpen || !userProfile?.uid) return;
    setIsLoadingSessions(true);
    const unsubscribe = subscribeToUserStreamingSessions(userProfile.uid, (sessions) => {
      setStreamingSessions(sessions);
      setIsLoadingSessions(false);
    });
    return () => unsubscribe();
  }, [isOpen, userProfile?.uid]);

  // Polling effect when activeNowPayment is present
  useEffect(() => {
    if (!isOpen || !activeNowPayment || nowPaymentSuccess) {
      if (nowPaymentPollIntervalRef.current) {
        clearInterval(nowPaymentPollIntervalRef.current);
        nowPaymentPollIntervalRef.current = null;
      }
      return;
    }

    const currentUid = auth.currentUser?.uid || userProfile?.uid;
    const currentEmail = auth.currentUser?.email || userProfile?.email || '';
    const currentName = auth.currentUser?.displayName || userProfile?.displayName || 'Host Streamer';

    const checkStatus = async () => {
      try {
        setIsPollingNowPayment(true);
        const statusData = await checkNowPaymentStatus(activeNowPayment.payment_id);
        
        if (statusData.is_completed || statusData.payment_status === 'finished' || statusData.payment_status === 'confirmed') {
          if (nowPaymentPollIntervalRef.current) {
            clearInterval(nowPaymentPollIntervalRef.current);
            nowPaymentPollIntervalRef.current = null;
          }

          if (currentUid) {
            const finalRes = await finalizeCompletedNowPayment({
              userId: currentUid,
              userEmail: currentEmail,
              userName: currentName,
              nominalIdr: activeNowPayment.price_amount,
              payment: statusData
            });

            try {
              confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
              sound.playWinnerFanfare();
            } catch {}

            setNowPaymentSuccess({
              newBalance: finalRes.newBalance,
              nominalIdr: activeNowPayment.price_amount,
              cryptoAmount: statusData.pay_amount,
              currency: statusData.pay_currency,
              orderId: finalRes.orderId
            });
            setActiveNowPayment(null);
          }
        }
      } catch (pollErr) {
        console.warn('Status poll warning:', pollErr);
      } finally {
        setIsPollingNowPayment(false);
      }
    };

    checkStatus();
    nowPaymentPollIntervalRef.current = setInterval(checkStatus, 4000);

    return () => {
      if (nowPaymentPollIntervalRef.current) {
        clearInterval(nowPaymentPollIntervalRef.current);
        nowPaymentPollIntervalRef.current = null;
      }
    };
  }, [isOpen, activeNowPayment, nowPaymentSuccess, userProfile?.uid, userProfile?.email, userProfile?.displayName]);

  // Handle local image file upload and compress to base64 data-URL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSaveErrorMessage('File harus berupa gambar (JPG, PNG, WebP).');
      return;
    }

    // Limit size to 4MB before compression
    if (file.size > 4 * 1024 * 1024) {
      setSaveErrorMessage('Ukuran file maksimal 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress & scale to max 360x360 for high-res fast base64 storage
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 360;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setPhotoURL(compressedDataUrl);
          sound.playDing();
          setSaveSuccessMessage('New photo selected! Click "Save Changes" to apply.');
          setTimeout(() => setSaveSuccessMessage(null), 4000);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Save profile updates to Firestore & Auth
  const handleSaveProfile = async () => {
    if (!userProfile?.uid) return;
    setIsSavingProfile(true);
    setSaveSuccessMessage(null);
    setSaveErrorMessage(null);

    try {
      await updateUserProfile(userProfile.uid, {
        displayName: displayName.trim() || userProfile.displayName,
        streamerHandle: streamerHandle.trim(),
        bio: bio.trim(),
        photoURL: photoURL.trim()
      });

      sound.playDing();
      setSaveSuccessMessage('Profile & photo updated successfully!');
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setSaveErrorMessage(err?.message || 'Failed to save profile changes.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // NOWPayments Handlers
  const handleCreateNowPayment = async () => {
    const currentAuthUser = auth.currentUser || (userProfile?.uid ? { uid: userProfile.uid, email: userProfile.email, displayName: userProfile.displayName } : null);
    if (!currentAuthUser) {
      setNowPaymentError('Silakan login terlebih dahulu untuk melakukan deposit.');
      sound.playWrong();
      return;
    }

    if (depositAmount < 10000) {
      setNowPaymentError('Nominal deposit minimal adalah Rp 10.000.');
      sound.playWrong();
      return;
    }

    if (depositAmount < currentCoinMinDeposit) {
      setNowPaymentError(
        `Nominal deposit (Rp ${depositAmount.toLocaleString('id-ID')}) berada di bawah batas minimal jaringan ${selectedNowpaymentCoin.network} (Minimal Rp ${currentCoinMinDeposit.toLocaleString('id-ID')}). Silakan naikkan nominal atau pilih koin USDT (BEP-20) / TRX.`
      );
      sound.playWrong();
      return;
    }

    setIsCreatingNowPayment(true);
    setNowPaymentError(null);
    setNowPaymentSuccess(null);

    try {
      sound.playClick();
      const payment = await createNowPaymentOrder({
        nominalIdr: depositAmount,
        payCurrency: nowpaymentsCurrency,
        userId: currentAuthUser.uid,
        userEmail: currentAuthUser.email || '',
        userName: currentAuthUser.displayName || 'Host Streamer'
      });

      setActiveNowPayment(payment);
      sound.playDing();
    } catch (err: any) {
      console.error('Failed to create NOWPayments order:', err);
      setNowPaymentError(err.message || 'Gagal membuat tagihan pembayaran otomatis NOWPayments.');
      sound.playWrong();
    } finally {
      setIsCreatingNowPayment(false);
    }
  };

  // Check Live Blockchain Status on Demand (NOWPayments Produksi)
  const handleManualCheckStatus = async () => {
    if (!activeNowPayment) return;
    setIsPollingNowPayment(true);
    try {
      sound.playClick();
      const statusData = await checkNowPaymentStatus(activeNowPayment.payment_id);
      if (statusData) {
        setActiveNowPayment((prev) => prev ? { ...prev, payment_status: statusData.payment_status } : null);
        if (statusData.payment_status === 'finished' || statusData.payment_status === 'confirmed' || statusData.payment_status === 'sending') {
          const currentUid = auth.currentUser?.uid || userProfile?.uid;
          const currentEmail = auth.currentUser?.email || userProfile?.email || '';
          const currentName = auth.currentUser?.displayName || userProfile?.displayName || 'Host Streamer';
          if (currentUid) {
            const finalRes = await finalizeCompletedNowPayment({
              userId: currentUid,
              userEmail: currentEmail,
              userName: currentName,
              nominalIdr: activeNowPayment.price_amount,
              payment: statusData
            });

            try {
              confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
              sound.playWinnerFanfare();
            } catch {}

            setNowPaymentSuccess({
              newBalance: finalRes.newBalance,
              nominalIdr: activeNowPayment.price_amount,
              cryptoAmount: statusData.pay_amount,
              currency: statusData.pay_currency,
              orderId: finalRes.orderId
            });
            setActiveNowPayment(null);
          }
        }
      }
    } catch (err: any) {
      console.warn('Manual check status error:', err);
    } finally {
      setIsPollingNowPayment(false);
    }
  };

  // Handle Withdrawal Submission (Crypto Only, Minimum 100.000, 3% Fee deduction)
  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.uid) return;

    if (withdrawAmount < 100000) {
      setWithdrawErrorMessage(`Minimum crypto withdrawal is ${formatCurrency(100000)}.`);
      sound.playWrong();
      return;
    }

    if (withdrawAmount > currentBalance) {
      setWithdrawErrorMessage(`Insufficient balance. Your current wallet balance: ${formatCurrency(currentBalance)}`);
      sound.playWrong();
      return;
    }

    if (!withdrawCryptoAddress.trim()) {
      setWithdrawErrorMessage('Please enter the recipient crypto wallet address.');
      sound.playWrong();
      return;
    }

    if (withdrawCryptoAddress.trim().length < 15) {
      setWithdrawErrorMessage('Invalid crypto wallet address format or too short.');
      sound.playWrong();
      return;
    }

    const systemFee = Math.round(withdrawAmount * 0.03);
    const networkGasFee = getCryptoGasFee(selectedCrypto);
    const feeAmount = systemFee + networkGasFee;
    const netPayout = Math.max(0, withdrawAmount - feeAmount);
    const netCryptoEst = calculateCryptoEstimate(netPayout, selectedCrypto);
    const grossCryptoEst = calculateCryptoEstimate(withdrawAmount, selectedCrypto);

    setIsProcessingWithdraw(true);
    setWithdrawErrorMessage(null);
    setWithdrawSuccessMessage(null);

    try {
      const formattedNetworkName = `${selectedCrypto.coin} (${selectedCrypto.network})`;
      const res = await withdrawUserWallet(
        userProfile.uid,
        withdrawAmount,
        {
          bankName: formattedNetworkName,
          accountNumber: withdrawCryptoAddress.trim(),
          accountName: `${selectedCrypto.coin} Wallet${withdrawCryptoMemo.trim() ? ' [Tag/Memo: ' + withdrawCryptoMemo.trim() + ']' : ''}`
        },
        networkGasFee
      );

      sound.playDing();
      setWithdrawSuccessMessage(
        `Pengajuan penarikan dana ${formatCurrency(withdrawAmount)} (Potongan: ${formatCurrency(feeAmount)} [3% + Gas Fee ${selectedCrypto.network}] | Bersih Diterima: ${formatCurrency(netPayout)} ≈ ${netCryptoEst} ${selectedCrypto.symbol}) berhasil diajukan! Permintaan berstatus PENDING dan segera diproses oleh Admin/Owner ke alamat dompet Anda.`
      );
      setWithdrawCryptoAddress('');
      setWithdrawCryptoMemo('');

      setTimeout(() => {
        setWithdrawSuccessMessage(null);
        setActiveTab('transactions');
      }, 3500);
    } catch (err: any) {
      console.error('Withdrawal error:', err);
      setWithdrawErrorMessage(err?.message || 'Gagal mengajukan penarikan crypto.');
      sound.playWrong();
    } finally {
      setIsProcessingWithdraw(false);
    }
  };

  // Handle Transfer Saldo Antar Pengguna (Min. Rp 100.000)
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    setTransferErrorMessage(null);

    if (transferAmount < 100000) {
      sound.playWrong();
      setTransferErrorMessage('Minimum balance transfer between users is Rp 100,000.');
      return;
    }

    if (transferAmount > currentBalance) {
      sound.playWrong();
      setTransferErrorMessage(`Your balance is insufficient. Current balance: Rp ${currentBalance.toLocaleString('id-ID')}.`);
      return;
    }

    if (!transferRecipient.trim()) {
      sound.playWrong();
      setTransferErrorMessage('Please enter the recipient username or email.');
      return;
    }

    setIsProcessingTransfer(true);
    try {
      const res = await transferUserWallet(
        userProfile.uid,
        transferRecipient.trim(),
        transferAmount,
        transferNotes.trim() || undefined
      );

      sound.playDing();
      sound.playWinnerFanfare();
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}

      setTransferSuccessData({
        recipientName: res.recipientName,
        recipientEmail: res.recipientEmail,
        amount: transferAmount,
        orderId: res.orderId
      });
      setTransferRecipient('');
      setTransferNotes('');
    } catch (err: any) {
      console.error('Transfer error:', err);
      sound.playWrong();
      setTransferErrorMessage(err?.message || 'Failed to transfer balance.');
    } finally {
      setIsProcessingTransfer(false);
    }
  };

  // Quick sync current plan to transactions history if empty
  const handleSyncCurrentPlanToHistory = async () => {
    if (!userProfile) return;
    try {
      sound.playDing();
      await createTransactionOrder({
        orderId: `SYS-${Date.now().toString(36).toUpperCase()}`,
        userId: userProfile.uid,
        userEmail: userProfile.email,
        planId: userProfile.isLifetime ? 'sultan-vip' : 'active-plan',
        planName: userProfile.subscriptionPlan || 'Sultan VIP Host',
        price: userProfile.isLifetime ? 0 : 49000,
        currency: 'IDR',
        status: 'success',
        paymentMethod: userProfile.isLifetime ? 'Sultan VIP Pass' : 'Static QRIS',
        durationDays: userProfile.isLifetime ? 9999 : 30,
        notes: 'Automatic Streamer Account Activation',
        createdAt: userProfile.subscribedAt || new Date().toISOString()
      });
      setSaveSuccessMessage('Active plan transaction successfully recorded to history!');
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to sync transaction:', err);
    }
  };

  // Handle manual or automatic session logging
  const handleAddStreamingSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionTitle.trim()) return;

    setIsSubmittingSession(true);
    try {
      await createStreamingSessionLog({
        sessionId: `LIVE-${Date.now().toString(36).toUpperCase()}`,
        userId: userProfile.uid,
        userEmail: userProfile.email,
        streamTitle: newSessionTitle.trim(),
        gameType: newSessionGame,
        totalRounds: Number(newSessionRounds) || 1,
        totalPrizeDistributed: Number(newSessionPrize) || 0,
        topWinner: newSessionTopWinner.trim() || 'TikTok Viewer',
        durationMinutes: Number(newSessionDuration) || 30,
        startedAt: new Date(Date.now() - (Number(newSessionDuration) || 30) * 60000).toISOString(),
        endedAt: new Date().toISOString()
      });

      sound.playDing();
      setShowAddSessionForm(false);
      setNewSessionTitle('');
      setNewSessionTopWinner('');
      setSaveSuccessMessage('Broadcast session recorded to streaming history!');
      setTimeout(() => setSaveSuccessMessage(null), 3500);
    } catch (err: any) {
      console.error('Failed to add session log:', err);
    } finally {
      setIsSubmittingSession(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    sound.playDing();
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Calculate streaming statistics
  const totalRoundsPlayed = streamingSessions.reduce((sum, s) => sum + (s.totalRounds || 0), 0);
  const totalPrizesAwarded = streamingSessions.reduce((sum, s) => sum + (s.totalPrizeDistributed || 0), 0);
  const totalMinutesStreamed = streamingSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

  if (!isOpen || !userProfile) return null;

  return (
    <div className="fixed inset-0 z-50 w-full h-full bg-[#090d16] text-white flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* Sticky Fullscreen Top Navigation Bar */}
      <header className="w-full bg-[#0d131f]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 shrink-0 z-30 shadow-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <SysLogo size="sm" showText={false} />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider">
                  {t('profile_badge')}
                </span>
                <MemberBadge userProfile={userProfile} size="sm" />
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white mt-0.5 tracking-tight">
                {userProfile.displayName || 'Host Live Streamer'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsProfileLangModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
              title={t('language_selector_title')}
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="text-sm">{country.flag}</span>
              <span className="hidden sm:inline font-mono uppercase">{country.languageCode}</span>
            </button>

            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 hover:text-red-200 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                title="Log out of this account and switch accounts"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs font-bold">{t('logout')}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 hover:text-amber-200 font-black text-xs transition-all active:scale-95 cursor-pointer shadow-sm"
              title="Tutup Profil / Kembali ke Layar Siaran"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">{t('close_back')}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-6xl mx-auto mt-3.5 flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <button
            onClick={() => {
              setActiveTab('profile');
              sound.playClick();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'profile'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{t('profile_and_balance')}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('deposit');
              sound.playClick();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'deposit'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{t('tab_deposit')}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('withdrawal');
              sound.playClick();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'withdrawal'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{t('tab_withdrawal')}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('transactions');
              sound.playClick();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'transactions'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{t('tab_transactions')}</span>
            {transactions.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${activeTab === 'transactions' ? 'bg-black/20 text-black' : 'bg-amber-500/20 text-amber-300'}`}>
                {transactions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('streaming');
              sound.playClick();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'streaming'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
            <span>{t('tab_live_history')}</span>
            {streamingSessions.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${activeTab === 'streaming' ? 'bg-black/20 text-black' : 'bg-red-500/20 text-red-300'}`}>
                {streamingSessions.length}
              </span>
            )}
          </button>

          {isOwnerOrAdmin && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('approval');
                sound.playClick();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                activeTab === 'approval'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25 ring-1 ring-rose-400'
                  : 'bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{t('tab_approval')}</span>
              {pendingDeposits.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                  {pendingDeposits.length}
                </span>
              )}
            </button>
          )}
        </div>
      </header>

      {/* Main Full-Screen Scrollable Body */}
      <main className="flex-1 w-full overflow-y-auto custom-scrollbar px-4 sm:px-8 py-6">
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
          {/* Success / Error notification */}
          {(saveSuccessMessage || withdrawSuccessMessage) && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{saveSuccessMessage || withdrawSuccessMessage}</span>
            </div>
          )}
          {(saveErrorMessage || withdrawErrorMessage) && (
            <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{saveErrorMessage || withdrawErrorMessage}</span>
            </div>
          )}

        {/* TAB 1: PROFIL & GANTI FOTO */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Saldo Dompet & Tombol Deposit, Withdrawal, Histori Transaksi */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-amber-950/40 border-2 border-emerald-500/40 shadow-xl shadow-emerald-500/10 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Wallet className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                      Ringkasan Saldo Akun User
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black">
                      Live Sync
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-xs text-white/50 font-bold uppercase">Total Saldo:</span>
                    <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-['Poppins']">
                      {formatCurrency(totalUserSaldo)}
                    </h3>
                    <span className="text-xs text-white/50 font-bold font-mono">
                      {country.currency}
                    </span>
                  </div>
                </div>

                {/* Action Buttons: Deposit, Withdrawal, Kirim Saldo, & Histori Transaksi */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('deposit');
                      sound.playClick();
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    title="Deposit crypto balance"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>{t('deposit_balance_btn')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('withdrawal');
                      sound.playClick();
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    title="Withdraw funds to crypto wallet"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>{t('withdraw_funds_btn')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('transactions');
                      sound.playClick();
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    title="View transaction history"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Riwayat</span>
                  </button>
                </div>
              </div>

              {/* DUAL COMPARISON CARDS: SALDO TERBUKA VS SALDO TERKUNCI */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* 1. Saldo Terbuka Card */}
                <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/30 space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                        <Unlock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                          Saldo Terbuka (Open Saldo)
                        </div>
                        <div className="text-[10px] text-white/50">Siap Ditarik / Ditransaksikan</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Aktif Bebas
                    </span>
                  </div>

                  <div className="pt-1">
                    <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                      {formatCurrency(currentBalance)}
                    </div>
                    <p className="text-[11px] text-white/60 mt-1 leading-relaxed">
                      Saldo aktif yang dapat Anda gunakan untuk siaran game, blind box, kirim saldo, atau diajukan untuk penarikan crypto.
                    </p>
                  </div>
                </div>

                {/* 2. Saldo Terkunci (Lock Saldo) Card */}
                <div className={`p-4 rounded-2xl border space-y-2 relative overflow-hidden transition-all ${
                  currentLockedBalance > 0
                    ? 'bg-amber-950/30 border-amber-500/50 shadow-lg shadow-amber-500/10'
                    : 'bg-black/30 border-white/10 opacity-75'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                        currentLockedBalance > 0
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-white/10 text-white/40 border-white/10'
                      }`}>
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className={`text-[11px] font-black uppercase tracking-wider ${
                          currentLockedBalance > 0 ? 'text-amber-400' : 'text-white/60'
                        }`}>
                          Saldo Terkunci (Lock Saldo)
                        </div>
                        <div className="text-[10px] text-white/50">Pending Approval Admin / Locked</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      currentLockedBalance > 0
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                        : 'bg-white/10 text-white/40 border-white/10'
                    }`}>
                      {currentLockedBalance > 0 ? 'Terkunci Sementara' : 'Rp 0'}
                    </span>
                  </div>

                  <div className="pt-1">
                    <div className={`text-2xl sm:text-3xl font-black font-mono ${
                      currentLockedBalance > 0 ? 'text-amber-400' : 'text-white/50'
                    }`}>
                      {formatCurrency(currentLockedBalance)}
                    </div>
                    <p className="text-[11px] text-white/60 mt-1 leading-relaxed">
                      Dana yang sedang dalam proses penarikan (<strong className="text-amber-300">Pending Approval Admin</strong>) atau deposit blind box aktif.
                    </p>
                  </div>
                </div>
              </div>

              {/* Saldo Terkunci Banner with Tombol Buka Kunci (For Blind Box deposit) */}
              {activeLockedDeposit && activeLockedDeposit.status === 'ACTIVE' && (
                <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex flex-wrap items-center justify-between gap-2.5 shadow-md">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                        {t('locked_balance_title')}
                      </div>
                      <div className="text-sm font-black font-mono text-white">
                        Rp {activeLockedDeposit.amount.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-red-300 hidden sm:inline">
                      Note: Reward Rp {activeLockedDeposit.totalClaimed.toLocaleString('id-ID')} will be forfeited
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowUnlockModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-md shadow-red-600/30 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                      title="Unlock Balance (Note: Blind box rewards will be forfeited)"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>{t('unlock_btn')}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* LIST OF PENDING WITHDRAWALS CURRENTLY LOCKING SALDO */}
              {pendingWithdrawalsList.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                      <span>Penarikan Menunggu Approval Admin ({pendingWithdrawalsList.length} Transaksi)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('withdrawal')}
                      className="text-[11px] text-amber-300 hover:text-white underline font-bold cursor-pointer"
                    >
                      Buka Tab Penarikan →
                    </button>
                  </div>

                  <div className="space-y-2">
                    {pendingWithdrawalsList.map((ord) => (
                      <div
                        key={ord.orderId || ord.id}
                        className="p-3 rounded-xl bg-black/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white">{ord.orderId}</span>
                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              PENDING APPROVAL
                            </span>
                          </div>
                          <div className="text-[11px] text-white/60">
                            {ord.paymentMethod || 'Crypto Withdrawal'} • {ord.bankDetails?.accountNumber ? `Alamat: ${ord.bankDetails.accountNumber.slice(0, 16)}...` : ''}
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <div className="font-mono font-black text-amber-300">
                            Rp {(ord.price || 0).toLocaleString('id-ID')}
                          </div>
                          <div className="text-[10px] text-white/40">
                            {ord.createdAt ? new Date(ord.createdAt).toLocaleString('id-ID') : '-'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar Section */}
            <div className="p-5 sm:p-6 rounded-3xl bg-neutral-900/70 border border-white/10 flex flex-col sm:flex-row items-center gap-6">
              {/* Current Avatar with change button */}
              <div className="relative group shrink-0">
                <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-2 shadow-xl bg-neutral-950 flex items-center justify-center ${
                  isMemberActive(userProfile)
                    ? 'border-amber-400/60 shadow-amber-500/20'
                    : 'border-white/20'
                }`}>
                  {photoURL ? (
                    <img
                      src={photoURL}
                      alt={displayName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="w-14 h-14 text-white/30" />
                  )}
                </div>

                {/* Upload overlay button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 rounded-3xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-all text-xs font-bold gap-1.5 cursor-pointer"
                  title="Klik untuk ganti foto"
                >
                  <Camera className="w-6 h-6 text-amber-300" />
                  <span>{t('upload_device_btn')}</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Upload actions (Direct Device Upload only) */}
              <div className="flex-1 w-full space-y-2 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h4 className="text-base font-black text-white">{t('avatar_section_title')}</h4>
                  {photoURL && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      {t('photo_saved_badge')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/60 max-w-md leading-relaxed">
                  {t('avatar_section_desc')}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{t('upload_device_btn')}</span>
                  </button>

                  {photoURL && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoURL('');
                        sound.playDing();
                        setSaveSuccessMessage('Foto profil dihapus. Klik "Save Changes" di bawah untuk menerapkan.');
                        setTimeout(() => setSaveSuccessMessage(null), 3500);
                      }}
                      className="px-3.5 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 hover:text-red-200 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      title="Hapus foto profil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t('delete_photo_btn')}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Input Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Display Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('full_name_label')}</span>
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nama Lengkap atau Panggilan Anda"
                  className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>

              {/* Streamer Handle / TikTok Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{t('handle_label')}</span>
                </label>
                <input
                  type="text"
                  value={streamerHandle}
                  onChange={(e) => setStreamerHandle(e.target.value)}
                  placeholder="Contoh: @susidewi_live atau @streamer_pro"
                  className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 font-mono text-cyan-300"
                />
              </div>

              {/* Host Bio */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('bio_label')}</span>
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  placeholder="Host Live Interaktif Tebak Nomor Seri Uang 3D & Lucky Spinner TikTok..."
                  className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>
            </div>

            {/* Account Details Readonly Badges */}
            <div className="p-4 rounded-2xl bg-neutral-950/60 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-white/40 block text-[10px] uppercase font-bold">{t('registered_email')}</span>
                <span className="font-mono text-white/90 font-medium">{userProfile.email}</span>
              </div>

              <div className="space-y-1">
                <span className="text-white/40 block text-[10px] uppercase font-bold">{t('membership_status')}</span>
                <span className={isMemberActive(userProfile) ? "text-amber-300 font-bold" : "text-white/50 font-medium"}>
                  {isMemberActive(userProfile)
                    ? (userProfile.subscriptionPlan || 'Member Aktif')
                    : 'Belum Member (Free)'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-white/40 block text-[10px] uppercase font-bold">{t('streamer_uid')}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(userProfile.uid, 'uid')}
                  className="font-mono text-[11px] text-white/60 hover:text-white flex items-center gap-1 transition-all"
                >
                  <span>{userProfile.uid.slice(0, 12)}...</span>
                  {copiedId === 'uid' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Referral & Affiliate Quick Info Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Gift className="w-4 h-4" />
                  <span>Host Referral & Reward Program</span>
                </div>
                <div className="text-white/70">
                  Your Code:{' '}
                  <button
                    type="button"
                    onClick={() => copyToClipboard(userProfile.referralCode || 'SYS-HOSTVIP', 'refCode')}
                    className="font-mono font-bold text-amber-300 hover:underline inline-flex items-center gap-1"
                  >
                    {userProfile.referralCode || 'SYS-HOSTVIP'}
                    {copiedId === 'refCode' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <span className="mx-2">•</span>
                  <span>Commission Balance: <strong className="text-emerald-400">Rp {((userProfile.affiliateEarnings || 0) - (userProfile.affiliateWithdrawn || 0)).toLocaleString('id-ID')}</strong></span>
                </div>
              </div>

              {onOpenReferral && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenReferral();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold transition-all self-start sm:self-auto whitespace-nowrap"
                >
                  Manage Commissions & Rewards
                </button>
              )}
            </div>

            {/* Actions: Logout & Save Button */}
            <div className="flex items-center justify-between pt-2 gap-3 flex-wrap">
              {onLogout ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 hover:text-red-200 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all active:scale-95"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              ) : <div />}

              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 transition-all ml-auto"
              >
                {isSavingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('saving_profile')}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{t('save_profile_changes')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB: DEPOSIT SALDO (NOWPAYMENTS PRODUKSI) */}
        {activeTab === 'deposit' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Header Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-yellow-950/40 border-2 border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Zap className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>Deposit Saldo Otomatis (Crypto)</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      NOWPayments Blockchain
                    </span>
                  </h3>
                  <p className="text-xs text-white/60">
                    Isi ulang saldo otomatis instan menggunakan gateway cryptocurrency. Transfer biasa/manual ditiadakan demi kecepatan dan keamanan verifikasi otomatis.
                  </p>
                </div>
              </div>

              <div className="bg-black/40 px-4 py-2.5 rounded-2xl border border-white/10 text-right sm:text-right w-full sm:w-auto">
                <span className="text-[10px] text-white/40 uppercase font-bold block">Current Balance</span>
                <span className="text-lg font-black text-emerald-300 font-['Poppins']">
                  Rp {currentBalance.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* ===================== NOWPAYMENTS PRODUKSI ===================== */}
            <div className="space-y-4">
                {/* 1.1 Success Screen (Status: PENDING Menunggu Verifikasi Administrator) */}
                {nowPaymentSuccess && (
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/80 via-neutral-900 to-amber-950/40 border-2 border-amber-500/50 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                        <Clock className="w-7 h-7 animate-pulse" />
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-[10px] font-black text-amber-300 uppercase tracking-wide mb-1">
                          Status: PENDING
                        </div>
                        <h4 className="text-base sm:text-lg font-black text-white">
                          Pembayaran Terkonfirmasi di Blockchain!
                        </h4>
                        <p className="text-xs text-amber-300/90">
                          Sesuai kebijakan sistem, seluruh transaksi deposit berstatus PENDING hingga diverifikasi & disetujui oleh Administrator.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-black/60 border border-white/10 text-xs">
                      <div>
                        <span className="text-white/40 block text-[10px] uppercase font-bold">Nominal Pengajuan</span>
                        <span className="text-base font-black text-amber-300 font-mono">
                          Rp {nowPaymentSuccess.nominalIdr.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/40 block text-[10px] uppercase font-bold">Aset Crypto Dibayar</span>
                        <span className="text-sm font-bold text-white font-mono">
                          {nowPaymentSuccess.cryptoAmount} {nowPaymentSuccess.currency.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/40 block text-[10px] uppercase font-bold">Status Persetujuan</span>
                        <span className="text-xs font-black text-amber-400 font-mono flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                          Menunggu Verifikasi Admin
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-white/80 space-y-1">
                      <p className="font-semibold text-amber-200">
                        💡 Pemberitahuan Verifikasi:
                      </p>
                      <p className="text-[11px] text-white/70">
                        Order deposit ini telah diteruskan ke Admin Panel dengan status <strong>PENDING</strong>. Begitu Administrator menyetujui, saldo dompet Anda akan otomatis bertambah secara realtime.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                      <span className="text-[11px] text-white/50 font-mono">
                        Order ID: {nowPaymentSuccess.orderId}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setNowPaymentSuccess(null);
                            setActiveNowPayment(null);
                            setActiveTab('transactions');
                            sound.playClick();
                          }}
                          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all cursor-pointer"
                        >
                          Lihat Riwayat Transaksi
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNowPaymentSuccess(null);
                            setActiveNowPayment(null);
                            sound.playClick();
                          }}
                          className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all cursor-pointer active:scale-95"
                        >
                          Lakukan Deposit Lainnya
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 1.2 Active Payment Waiting Screen */}
                {activeNowPayment && !nowPaymentSuccess && (
                  <div className="p-5 sm:p-6 rounded-3xl bg-neutral-900/90 border-2 border-amber-500/40 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
                    {/* Status Beacon Bar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30">
                      <div className="flex items-center gap-2.5">
                        <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping shrink-0" />
                        <span className="text-xs font-black text-amber-200">
                          Menunggu Transfer Crypto di Jaringan ({activeNowPayment.network || activeNowPayment.pay_currency})...
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-white/60">
                        {isPollingNowPayment ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        ) : (
                          <RefreshCw className="w-3.5 h-3.5 text-white/40" />
                        )}
                        <span>Auto-check status aktif</span>
                      </div>
                    </div>

                    {/* QR Code & Transfer Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                      {/* Left: QR Code Box */}
                      <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-black/60 border border-white/10">
                        {activeNowPayment.qrCodeUrl ? (
                          <img
                            src={activeNowPayment.qrCodeUrl}
                            alt="NOWPayments QR Code"
                            className="w-44 h-44 rounded-xl bg-white p-2 shadow-lg"
                          />
                        ) : (
                          <div className="w-44 h-44 rounded-xl bg-white p-2 flex items-center justify-center shadow-lg">
                            <QrCodeView value={activeNowPayment.pay_address} size={160} />
                          </div>
                        )}
                        <span className="text-[11px] text-white/60 mt-2 font-medium">
                          Pindai menggunakan aplikasi crypto wallet Anda
                        </span>
                      </div>

                      {/* Right: Payment Instructions & Copy Fields */}
                      <div className="md:col-span-7 space-y-3.5 text-xs">
                        {/* Exact Crypto Amount */}
                        <div className="p-3.5 rounded-2xl bg-black/50 border border-amber-500/30 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-amber-400">
                              Nominal Transfer Tepat (Exact Amount):
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(String(activeNowPayment.pay_amount), 'np-amt')}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              {copiedId === 'np-amt' ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Tersalin!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Salin Nominal</span>
                                </>
                              )}
                            </button>
                          </div>
                          <div className="text-lg sm:text-xl font-black text-white font-mono flex items-baseline gap-2">
                            <span>{activeNowPayment.pay_amount}</span>
                            <span className="text-amber-400 text-sm font-bold uppercase">
                              {activeNowPayment.pay_currency}
                            </span>
                          </div>
                          <span className="text-[10px] text-white/50 block">
                            Setara dengan Rp {activeNowPayment.price_amount.toLocaleString('id-ID')}
                          </span>
                        </div>

                        {/* Pay Address */}
                        <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-white/50">
                              Alamat Deposit Unik (Pay Address):
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(activeNowPayment.pay_address, 'np-addr')}
                              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              {copiedId === 'np-addr' ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Tersalin!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Salin Alamat</span>
                                </>
                              )}
                            </button>
                          </div>
                          <div className="p-2.5 rounded-xl bg-black/80 font-mono text-[11px] sm:text-xs text-amber-300 break-all select-all border border-white/10">
                            {activeNowPayment.pay_address}
                          </div>
                          <span className="text-[10px] text-white/50 block">
                            Jaringan: <strong>{activeNowPayment.network || activeNowPayment.pay_currency}</strong>
                          </span>
                        </div>

                        {/* Order ID & Security Notice */}
                        <div className="text-[11px] text-white/60 space-y-1">
                          <p>• Transaksi diverifikasi secara otomatis oleh gateway blockchain NOWPayments (Produksi).</p>
                          <p>• Demi kepatuhan dan keamanan akun, status deposit adalah PENDING hingga diverifikasi Administrator.</p>
                          <p className="font-mono text-[10px] text-white/40">Payment ID: {activeNowPayment.payment_id}</p>
                        </div>
                      </div>
                    </div>

                    {/* Live Blockchain Verification & Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={handleManualCheckStatus}
                        disabled={isPollingNowPayment}
                        className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                        title="Periksa konfirmasi transaksi di blockchain sekarang"
                      >
                        {isPollingNowPayment ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Memeriksa Blockchain...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Cek Status Pembayaran (Blockchain)</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveNowPayment(null);
                          sound.playClick();
                        }}
                        className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 font-bold text-xs transition-all cursor-pointer"
                      >
                        Batal / Ganti Nominal
                      </button>
                    </div>
                  </div>
                )}

                {/* 1.3 Create Payment Form (When no active payment) */}
                {!activeNowPayment && !nowPaymentSuccess && (
                  <div className="p-5 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-4">
                    {/* Error Alert */}
                    {nowPaymentError && (
                      <div className="p-3.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-2.5">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{nowPaymentError}</span>
                      </div>
                    )}

                    {/* Nominal Quick Buttons */}
                    <div>
                      <label className="block text-xs font-bold text-white/80 mb-2 flex items-center justify-between">
                        <span>Pilih Nominal Cepat (IDR):</span>
                        <span className="text-[10px] text-amber-300/80 font-normal">
                          Min. Jaringan Ini: Rp {currentCoinMinDeposit.toLocaleString('id-ID')}
                        </span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                        {(currentCoinMinDeposit > 100000
                          ? [250000, 500000, 1000000, 2500000, 5000000]
                          : [50000, 100000, 250000, 500000, 1000000]
                        ).map((amt) => {
                          return (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => {
                                setDepositAmount(amt);
                                sound.playDing();
                              }}
                              className={`p-3 rounded-xl border text-xs font-black transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                                depositAmount === amt
                                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/40'
                                  : 'bg-black/40 border-white/10 text-white/80 hover:border-amber-500/40 hover:text-white'
                              }`}
                            >
                              <span>Rp {amt.toLocaleString('id-ID')}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white/80 flex items-center justify-between">
                        <span>Nominal Kustom (Min. Rp {currentCoinMinDeposit.toLocaleString('id-ID')})</span>
                        <span className="text-amber-400 font-mono text-xs font-black">
                          Rp {depositAmount.toLocaleString('id-ID')}
                        </span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm font-bold">
                          Rp
                        </span>
                        <input
                          type="number"
                          min={currentCoinMinDeposit}
                          step={10000}
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full bg-black/50 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                          placeholder="Contoh: 100000"
                        />
                      </div>
                    </div>

                    {/* Below Minimum Advisory Banner */}
                    {isDepositBelowMin && (
                      <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-xs text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
                        <div className="flex items-center gap-2.5">
                          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                          <div>
                            <p className="font-bold text-white">
                              Batas Minimal Jaringan {selectedNowpaymentCoin.symbol} ({selectedNowpaymentCoin.network}): Rp {currentCoinMinDeposit.toLocaleString('id-ID')}
                            </p>
                            <p className="text-[11px] text-white/70">
                              Nominal Rp {depositAmount.toLocaleString('id-ID')} berada di bawah threshold gas fee jaringan ini.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setDepositAmount(currentCoinMinDeposit);
                              sound.playDing();
                            }}
                            className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] transition-all cursor-pointer shadow-md"
                          >
                            Atur ke Rp {currentCoinMinDeposit.toLocaleString('id-ID')}
                          </button>
                          {nowpaymentsCurrency !== 'usdtbsc' && (
                            <button
                              type="button"
                              onClick={() => {
                                setNowpaymentsCurrency('usdtbsc');
                                sound.playClick();
                              }}
                              className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] transition-all cursor-pointer"
                            >
                              Pilih USDT (BEP-20)
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* NOWPayments Crypto Selector */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-white/80">
                        Pilih Koin Crypto Pembayaran (NOWPayments Produksi):
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {NOWPAYMENTS_CURRENCIES.map((coin) => {
                          const estVal = (depositAmount / coin.approxRateIdr).toFixed(coin.decimals);
                          const isSelected = nowpaymentsCurrency === coin.id;

                          return (
                            <button
                              key={coin.id}
                              type="button"
                              onClick={() => {
                                setNowpaymentsCurrency(coin.id);
                                sound.playClick();
                              }}
                              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-500/20 border-amber-400 text-white ring-1 ring-amber-400/40 shadow-sm'
                                  : 'bg-black/30 border-white/10 text-white/70 hover:border-white/25'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-black text-white">{coin.symbol}</span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-amber-300 font-bold">
                                  {coin.badge}
                                </span>
                              </div>
                              <span className="text-[10px] text-white/50">{coin.network}</span>
                              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                                <span className="text-[10px] text-white/40">Min: Rp {(coin.minDepositIdr / 1000).toFixed(0)}rb</span>
                                <span className="text-[11px] font-mono font-bold text-amber-300">
                                  ≈ {estVal} {coin.symbol}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleCreateNowPayment}
                        disabled={isCreatingNowPayment || isDepositBelowMin}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        {isCreatingNowPayment ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Menghubungkan ke NOWPayments...</span>
                          </>
                        ) : isDepositBelowMin ? (
                          <>
                            <AlertTriangle className="w-4 h-4 text-slate-950" />
                            <span>Nominal di Bawah Minimal (Min. Rp {currentCoinMinDeposit.toLocaleString('id-ID')})</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 fill-slate-950" />
                            <span>⚡ Buat Pembayaran Otomatis via NOWPayments</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
        )}

        {/* TAB: WITHDRAWAL / TARIK DANA (CRYPTO-ONLY) */}
        {activeTab === 'withdrawal' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Header Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-yellow-950/40 border-2 border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>Crypto Withdrawal (Crypto-Only)</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase">
                      Min. Rp 100.000
                    </span>
                  </h3>
                  <p className="text-xs text-white/60">
                    Withdraw your wallet balance directly to your crypto wallet address (USDT, BTC, ETH, SOL)
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <div className="bg-black/50 px-3.5 py-2 rounded-2xl border border-emerald-500/30 text-right">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold flex items-center gap-1 justify-end">
                    <Unlock className="w-3 h-3" />
                    <span>Saldo Terbuka</span>
                  </span>
                  <span className="text-base sm:text-lg font-black text-emerald-300 font-['Poppins']">
                    Rp {currentBalance.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="bg-black/50 px-3.5 py-2 rounded-2xl border border-amber-500/30 text-right">
                  <span className="text-[10px] text-amber-400 uppercase font-bold flex items-center gap-1 justify-end">
                    <Lock className="w-3 h-3" />
                    <span>Saldo Terkunci</span>
                  </span>
                  <span className="text-base sm:text-lg font-black text-amber-300 font-['Poppins']">
                    Rp {currentLockedBalance.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Informational Callout regarding Saldo Terbuka vs Saldo Terkunci & Admin Approval */}
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-start gap-3 text-xs text-blue-200">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-white text-xs">Mekanisme Penarikan Dana & Status Pending</div>
                <p className="text-[11px] text-white/70 leading-relaxed">
                  Pada saat Anda mengajukan penarikan dana, nominal penarikan akan otomatis dipindahkan dari <strong className="text-emerald-300">Saldo Terbuka</strong> ke <strong className="text-amber-300">Saldo Terkunci (Lock Saldo)</strong> dengan status <strong className="text-amber-300">PENDING</strong>. Admin akan mereview dan meng-approve permohonan Anda. Setelah disetujui, dana dikirim ke alamat crypto Anda dan saldo terkunci selesai dicairkan. Jika permohonan ditolak, saldo otomatis dikembalikan utuh ke Saldo Terbuka.
                </p>
              </div>
            </div>

            {/* Withdrawal Success Alert */}
            {withdrawSuccessMessage && (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{withdrawSuccessMessage}</span>
              </div>
            )}

            {/* Withdrawal Error Alert */}
            {withdrawErrorMessage && (
              <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{withdrawErrorMessage}</span>
              </div>
            )}

            {/* If balance is less than minimum Rp 100.000 */}
            {currentBalance < 100000 ? (
              <div className="p-6 rounded-3xl bg-neutral-900/80 border border-amber-500/30 space-y-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h4 className="text-base font-black text-white">
                    Balance Below Minimum Withdrawal Threshold
                  </h4>
                  <p className="text-xs text-white/70 leading-relaxed">
                    Your current wallet balance is <strong className="text-amber-300">Rp {currentBalance.toLocaleString('id-ID')}</strong> (including Rp 15,000 registration bonus). Per policy, <strong>minimum withdrawal is Rp 100,000</strong> (≈6.25 USDT).
                  </p>
                  <p className="text-xs text-emerald-400 font-bold pt-1">
                    You need Rp {(100000 - currentBalance).toLocaleString('id-ID')} more to be eligible for withdrawal.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-left text-xs max-w-md mx-auto space-y-2">
                  <p className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Quick Ways to Increase Balance:</span>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-white/70 text-[11px]">
                    <li>Deposit crypto funds to start hosting prize-winning interactive streams.</li>
                    <li>Open Blind Boxes with gold rewards and jackpot prizes.</li>
                    <li>Invite fellow streamers using your referral code (Earn up to 35% commission).</li>
                  </ul>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('deposit');
                      sound.playClick();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-105 cursor-pointer"
                  >
                    Deposit Crypto Sekarang
                  </button>

                  {onOpenReferral && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenReferral();
                      }}
                      className="px-5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-black text-xs transition-all hover:scale-105 cursor-pointer"
                    >
                      Ajak Teman (Program Referral)
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* If balance >= 100.000, show full multi-crypto withdrawal form */
              <form onSubmit={handleWithdrawalSubmit} className="p-5 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-5">
                {/* Nominal Input & Presets */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-white/80 flex items-center justify-between">
                    <span>Nominal Penarikan Dana (IDR) - Minimal Rp 100.000</span>
                    <span className="text-amber-400 font-mono text-xs font-bold">
                      ≈ {calculateCryptoEstimate(withdrawAmount, selectedCrypto)} {selectedCrypto.symbol}
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm font-bold">
                      Rp
                    </span>
                    <input
                      type="number"
                      min={100000}
                      max={currentBalance}
                      step={10000}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-black/50 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {[100000, 250000, 500000, 1000000, 2500000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setWithdrawAmount(amt);
                          sound.playDing();
                        }}
                        disabled={amt > currentBalance}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          withdrawAmount === amt
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30'
                        }`}
                      >
                        Rp {amt.toLocaleString('id-ID')}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setWithdrawAmount(currentBalance);
                        sound.playDing();
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all cursor-pointer"
                    >
                      Tarik Semua (Rp {currentBalance.toLocaleString('id-ID')})
                    </button>
                  </div>
                </div>

                {/* Cryptocurrency Selection Section */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-bold text-white/90 flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span>Pilih Mata Uang Crypto & Jaringan Penarikan</span>
                    </label>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                      {[
                        { id: 'all', label: 'Semua Crypto' },
                        { id: 'stablecoin', label: 'Stablecoin' },
                        { id: 'major', label: 'Major Coins' },
                        { id: 'altcoin', label: 'Altcoins' }
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setCryptoCategoryFilter(cat.id as any);
                            sound.playClick();
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                            cryptoCategoryFilter === cat.id
                              ? 'bg-amber-500 text-slate-950 font-black'
                              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Crypto Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                    {CRYPTO_WITHDRAW_OPTIONS
                      .filter((c) => cryptoCategoryFilter === 'all' || c.category === cryptoCategoryFilter)
                      .map((opt) => {
                        const isSelected = selectedCryptoId === opt.id;
                        const netEst = calculateCryptoEstimate(withdrawAmount * 0.97, opt);

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setSelectedCryptoId(opt.id);
                              sound.playClick();
                            }}
                            className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-amber-500/15 border-amber-400 text-white ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/10'
                                : 'bg-black/40 border-white/10 text-white/70 hover:border-white/20 hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1 w-full">
                              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${opt.iconBg} flex items-center justify-center text-white text-xs font-black shadow-md shrink-0`}>
                                {opt.symbol.slice(0, 3)}
                              </div>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${opt.badgeColor}`}>
                                {opt.symbol}
                              </span>
                            </div>

                            <div className="mt-2 space-y-0.5">
                              <p className="text-xs font-black text-white leading-tight">{opt.name}</p>
                              <p className="text-[10px] text-amber-300 font-semibold truncate">{opt.network}</p>
                              <div className="pt-1 border-t border-white/5 flex items-center justify-between text-[10px]">
                                <span className="text-white/40">Est. Net:</span>
                                <span className="font-mono font-bold text-emerald-400 truncate ml-1">{netEst} {opt.symbol}</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Selected Crypto Details Banner */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-neutral-900 to-black/60 border border-amber-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${selectedCrypto.iconBg} flex items-center justify-center text-white font-black text-xs shadow-md shrink-0`}>
                      {selectedCrypto.symbol}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">{selectedCrypto.name} ({selectedCrypto.symbol})</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {selectedCrypto.network}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/60 mt-0.5">
                        {selectedCrypto.tagline}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 hidden sm:block">
                    <div className="text-[10px] text-white/40">Estimasi Kurs Referensi</div>
                    <div className="text-xs font-mono font-bold text-amber-300">
                      1 {selectedCrypto.symbol} ≈ Rp {selectedCrypto.approxRateIdr.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>

                {/* Crypto Wallet Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/80 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Alamat Dompet Crypto ({selectedCrypto.network})</span>
                    </span>
                    <span className="text-[10px] text-amber-300 font-semibold">Wajib Diisi</span>
                  </label>
                  <input
                    type="text"
                    value={withdrawCryptoAddress}
                    onChange={(e) => setWithdrawCryptoAddress(e.target.value)}
                    placeholder={selectedCrypto.placeholderAddress}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400"
                    required
                  />
                  <div className="flex items-center justify-between text-[10px] text-white/40">
                    <span>Petunjuk: {selectedCrypto.addressRegexHint}</span>
                    <span>Pastikan jaringan sesuai <strong>{selectedCrypto.network}</strong></span>
                  </div>
                </div>

                {/* Memo / Tag Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/80 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span>{selectedCrypto.memoLabel || 'Wallet Memo / Tag / Label'}</span>
                      {!selectedCrypto.requiresMemo && <span className="text-white/40 font-normal">(Opsional)</span>}
                    </span>
                    {selectedCrypto.requiresMemo && (
                      <span className="text-[10px] text-yellow-400 font-bold bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/30">
                        Wajib jika ke Exchange
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={withdrawCryptoMemo}
                    onChange={(e) => setWithdrawCryptoMemo(e.target.value)}
                    placeholder={
                      selectedCrypto.requiresMemo
                        ? 'Contoh: 104928374 (Wajib untuk wallet Indodax / Binance / Telegram)'
                        : 'Contoh: Personal Wallet / Binance Tag (Opsional)'
                    }
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Rincian Biaya Penarikan (Fee 3% + Tambahan Gas Fee Blockchain) */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-black/40 to-amber-500/5 border border-amber-500/35 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between font-medium text-white/70">
                    <span>Nominal Penarikan Kotor (Gross):</span>
                    <span className="font-mono font-bold text-white">
                      {formatCurrency(withdrawAmount)} (≈{calculateCryptoEstimate(withdrawAmount, selectedCrypto)} {selectedCrypto.symbol})
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-amber-300 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-amber-400" />
                      Biaya Penarikan Sistem (Fee 3%):
                    </span>
                    <span className="font-mono font-bold text-rose-400">
                      - {formatCurrency(Math.round(withdrawAmount * 0.03))}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-cyan-300 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      Gas Fee Blockchain Jaringan ({selectedCrypto.network}):
                    </span>
                    <span className="font-mono font-bold text-rose-400">
                      - {formatCurrency(getCryptoGasFee(selectedCrypto))} (≈{calculateCryptoEstimate(getCryptoGasFee(selectedCrypto), selectedCrypto)} {selectedCrypto.symbol})
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-white/80 font-bold pt-1 border-t border-white/10">
                    <span>Total Potongan Biaya (3% + Gas Fee):</span>
                    <span className="font-mono font-bold text-rose-400">
                      - {formatCurrency(Math.round(withdrawAmount * 0.03) + getCryptoGasFee(selectedCrypto))}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-amber-500/25 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-emerald-300">Estimasi Bersih Diterima di Wallet:</span>
                      <div className="text-[10px] text-white/50">Akan ditransfer ke alamat dompet crypto Anda</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm sm:text-base font-black text-emerald-400">
                        {formatCurrency(Math.max(0, withdrawAmount - Math.round(withdrawAmount * 0.03) - getCryptoGasFee(selectedCrypto)))}
                      </div>
                      <div className="text-xs font-mono font-bold text-amber-300">
                        ≈ {calculateCryptoEstimate(Math.max(0, withdrawAmount - Math.round(withdrawAmount * 0.03) - getCryptoGasFee(selectedCrypto)), selectedCrypto)} {selectedCrypto.symbol}
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/50 italic pt-0.5">
                    * Penarikan diproses secara aman ke blockchain explorer. Biaya gas fee menyesuaikan beban jaringan blockchain saat transaksi dikirim.
                  </p>
                </div>

                {/* Submit button */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isProcessingWithdraw || withdrawAmount < 100000 || withdrawAmount > currentBalance}
                    className="w-full sm:flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isProcessingWithdraw ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mengajukan Penarikan Crypto...</span>
                      </>
                    ) : (
                      <>
                        <ArrowUpRight className="w-4 h-4" />
                        <span>
                          Ajukan Penarikan {formatCurrency(withdrawAmount)} (Net: {calculateCryptoEstimate(withdrawAmount * 0.97, selectedCrypto)} {selectedCrypto.symbol})
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white/80 font-bold text-xs transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </form>
            )}

            {/* Pending Withdrawals List (Status: PENDING - Saldo Terkunci) */}
            {pendingWithdrawalsList.length > 0 && (
              <div className="p-5 rounded-3xl bg-neutral-900/90 border border-amber-500/40 space-y-3.5 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-400 animate-spin" />
                    <div>
                      <h4 className="text-sm font-black text-white">
                        Daftar Penarikan Menunggu Approval Admin
                      </h4>
                      <p className="text-[10px] text-amber-300">
                        Status: PENDING • Total Saldo Terkunci: Rp {pendingWithdrawalsSum.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black">
                    {pendingWithdrawalsList.length} Menunggu Approval
                  </span>
                </div>

                <div className="space-y-2.5">
                  {pendingWithdrawalsList.map((ord) => (
                    <div
                      key={ord.orderId || ord.id}
                      className="p-3.5 rounded-2xl bg-black/60 border border-amber-500/30 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-white text-sm">{ord.orderId}</span>
                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              <span>PENDING APPROVAL</span>
                            </span>
                          </div>
                          <div className="text-[11px] text-white/70 mt-1">
                            Metode: <strong className="text-amber-300">{ord.paymentMethod || 'Crypto Withdrawal'}</strong>
                          </div>
                          {ord.bankDetails?.accountNumber && (
                            <div className="text-[10px] font-mono text-cyan-300 break-all mt-0.5">
                              Tujuan: {ord.bankDetails.accountNumber}
                            </div>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-white/50 block">Nominal Terkunci</span>
                          <span className="font-mono font-black text-base text-amber-400">
                            Rp {(ord.price || 0).toLocaleString('id-ID')}
                          </span>
                          {ord.netPayoutAmount && (
                            <span className="text-[10px] font-mono text-emerald-400 block font-bold">
                              Net: Rp {ord.netPayoutAmount.toLocaleString('id-ID')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/50">
                        <span>Waktu Pengajuan: {ord.createdAt ? new Date(ord.createdAt).toLocaleString('id-ID') : '-'}</span>
                        <span className="text-amber-300 font-semibold">Terkunci di saldo pengguna</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: KIRIM SALDO ANTAR USER (MIN. RP 100.000) */}
        {activeTab === 'transfer' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Header Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/40 border-2 border-blue-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                  <Send className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>Transfer Balance Between Users</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase">
                      Min. Rp 100.000
                    </span>
                  </h3>
                  <p className="text-xs text-white/60">
                    Send wallet balance to fellow streamers or users using just their username or email
                  </p>
                </div>
              </div>

              <div className="bg-black/40 px-4 py-2.5 rounded-2xl border border-white/10 text-right sm:text-right w-full sm:w-auto">
                <span className="text-[10px] text-white/40 uppercase font-bold block">Available Balance</span>
                <span className="text-lg font-black text-blue-300 font-['Poppins']">
                  Rp {currentBalance.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* If transfer was successful, show Receipt */}
            {transferSuccessData ? (
              <div className="p-6 rounded-3xl bg-neutral-900/90 border-2 border-emerald-500/40 shadow-2xl space-y-5 text-center animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider">
                    TRANSFER SUCCESSFUL
                  </span>
                  <h4 className="text-2xl font-black text-white pt-1">
                    Rp {transferSuccessData.amount.toLocaleString('id-ID')}
                  </h4>
                  <p className="text-xs text-white/60">
                    Balance sent to recipient successfully
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-black/50 border border-white/10 text-left text-xs max-w-md mx-auto space-y-2.5">
                  <div className="flex justify-between items-center py-1 border-b border-white/10">
                    <span className="text-white/50">Transaction ID:</span>
                    <span className="font-mono font-bold text-white">{transferSuccessData.orderId}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/10">
                    <span className="text-white/50">Recipient:</span>
                    <span className="font-bold text-amber-300">{transferSuccessData.recipientName}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/10">
                    <span className="text-white/50">Recipient Email:</span>
                    <span className="font-mono text-cyan-300">{transferSuccessData.recipientEmail}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/10">
                    <span className="text-white/50">Amount Sent:</span>
                    <span className="font-black text-emerald-400">Rp {transferSuccessData.amount.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-white/50">Admin Fee:</span>
                    <span className="font-black text-emerald-400">FREE (Rp 0)</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTransferSuccessData(null);
                      setTransferAmount(100000);
                      sound.playClick();
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20"
                  >
                    Send Another Transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTransferSuccessData(null);
                      setActiveTab('transactions');
                      sound.playClick();
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all"
                  >
                    View Transaction History
                  </button>
                </div>
              </div>
            ) : currentBalance < 100000 ? (
              <div className="p-6 rounded-3xl bg-neutral-900/80 border border-blue-500/30 space-y-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h4 className="text-base font-black text-white">
                    Insufficient Balance for Transfer
                  </h4>
                  <p className="text-xs text-white/70 leading-relaxed">
                    Your current wallet balance is <strong className="text-blue-300">Rp {currentBalance.toLocaleString('id-ID')}</strong>. Per policy, <strong>minimum balance transfer between users is Rp 100,000</strong>.
                  </p>
                  <p className="text-xs text-cyan-400 font-bold pt-1">
                    You need Rp {(100000 - currentBalance).toLocaleString('id-ID')} more to transfer balance.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('deposit');
                    sound.playClick();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-500/25 transition-all"
                >
                  Deposit Balance Now
                </button>
              </div>
            ) : (
              <form onSubmit={handleTransferSubmit} className="p-5 sm:p-6 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-5">
                {transferErrorMessage && (
                  <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-3 animate-in fade-in">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                    <span>{transferErrorMessage}</span>
                  </div>
                )}

                {/* Input Penerima: Nama Pengguna atau Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/80 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-400" />
                      <span>Recipient Username or Email</span>
                      <span className="text-red-400">*</span>
                    </span>
                    <span className="text-[10px] text-white/40">Username or email required</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={transferRecipient}
                      onChange={(e) => setTransferRecipient(e.target.value)}
                      placeholder="Example: host_streamer or user@gmail.com"
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-400 font-medium"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-white/50">
                    The system will automatically search and match the recipient account based on registered username or email address.
                  </p>
                </div>

                {/* Input Nominal Transfer */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-blue-400" />
                      <span>Transfer Amount (Min. Rp 100,000)</span>
                      <span className="text-red-400">*</span>
                    </label>
                    <span className="text-[11px] text-blue-300 font-bold">
                      Balance: Rp {currentBalance.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-white/50">
                      Rp
                    </span>
                    <input
                      type="number"
                      min={100000}
                      max={currentBalance}
                      step={10000}
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-black/50 border border-white/15 rounded-xl pl-12 pr-4 py-3 text-base sm:text-lg font-black text-white focus:outline-none focus:border-blue-400 font-['Poppins']"
                      required
                    />
                  </div>

                  {/* Preset Nominal Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {[100000, 200000, 500000, 1000000, 2000000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setTransferAmount(amt);
                          sound.playClick();
                        }}
                        disabled={amt > currentBalance}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          transferAmount === amt
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                            : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30'
                        }`}
                      >
                        Rp {amt.toLocaleString('id-ID')}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setTransferAmount(currentBalance);
                        sound.playDing();
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 hover:bg-blue-500/30 transition-all"
                    >
                      Send All (Rp {currentBalance.toLocaleString('id-ID')})
                    </button>
                  </div>
                </div>

                {/* Input Pesan / Catatan (Opsional) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>Note / Message for Recipient (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={transferNotes}
                    onChange={(e) => setTransferNotes(e.target.value)}
                    placeholder="Example: Stream revenue share, banknote guess reward, etc."
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-400"
                  />
                </div>

                {/* Ringkasan Potongan Saldo */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-white/60">
                    <span>Current Balance:</span>
                    <span className="font-semibold text-white">Rp {currentBalance.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center text-white/60">
                    <span>Service Fee:</span>
                    <span className="font-bold text-emerald-400">FREE (Rp 0)</span>
                  </div>
                  <div className="flex justify-between items-center text-white/60">
                    <span>Transfer Amount:</span>
                    <span className="font-bold text-blue-300">- Rp {transferAmount.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                    <span className="font-bold text-white">Estimated Remaining Balance:</span>
                    <span className="font-black text-amber-300 font-['Poppins']">
                      Rp {Math.max(0, currentBalance - transferAmount).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isProcessingTransfer || transferAmount < 100000 || transferAmount > currentBalance || !transferRecipient.trim()}
                    className="w-full sm:flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isProcessingTransfer ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing Balance Transfer...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Balance Rp {transferAmount.toLocaleString('id-ID')}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white/80 font-bold text-xs transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: RIWAYAT TRANSAKSI */}
        {activeTab === 'transactions' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Wallet Quick Balance Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-amber-950/30 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    Host Wallet Balance
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    Active Wallet
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white font-['Poppins']">
                  Rp {currentBalance.toLocaleString('id-ID')}
                </h3>
                <p className="text-[11px] text-white/60">
                  Min. Withdrawal / Transfer: <strong>Rp 100.000</strong>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('deposit');
                    sound.playClick();
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs transition-all shadow-md shadow-emerald-500/20"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>Deposit</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('withdrawal');
                    sound.playClick();
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition-all shadow-md shadow-amber-500/20"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Withdraw</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('transfer');
                    sound.playClick();
                  }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition-all shadow-md shadow-blue-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Balance</span>
                </button>
              </div>
            </div>

            {/* Transaction Records List with Filter */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                <span className="text-xs text-white/70 font-bold uppercase">
                  Histori Transaksi ({transactions.length})
                </span>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {[
                    { id: 'all', label: 'Semua', count: transactions.length },
                    { id: 'deposit', label: 'Deposit', count: transactions.filter(t => t.type === 'deposit').length },
                    { id: 'withdrawal', label: 'Penarikan', count: transactions.filter(t => t.type === 'withdrawal').length },
                    { id: 'transfer', label: 'Transfer', count: transactions.filter(t => t.type === 'transfer_out' || t.type === 'transfer_in').length },
                    { id: 'bonus', label: 'Bonus', count: transactions.filter(t => t.type === 'bonus').length },
                    { id: 'subscription', label: 'Paket', count: transactions.filter(t => t.type === 'subscription' || !t.type).length }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setTxFilter(filter.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
                        txFilter === filter.id
                          ? 'bg-amber-500 text-black shadow-sm'
                          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span>{filter.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${txFilter === filter.id ? 'bg-black/20 text-black font-black' : 'bg-white/10 text-white/60'}`}>
                        {filter.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {isLoadingOrders ? (
                <div className="p-8 text-center text-white/50 text-xs flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
                  <span>Loading transaction history...</span>
                </div>
              ) : transactions.length === 0 ? (
                <div className="p-8 rounded-2xl bg-neutral-900/50 border border-white/5 text-center space-y-3">
                  <CreditCard className="w-10 h-10 text-white/20 mx-auto" />
                  <p className="text-xs text-white/60">
                    No transaction history recorded for this account yet.
                  </p>
                  <button
                    type="button"
                    onClick={handleSyncCurrentPlanToHistory}
                    className="px-4 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs hover:bg-amber-500/30 transition-all"
                  >
                    Sync Active Plan to History
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
                  {transactions
                    .filter((order) => {
                      if (txFilter === 'all') return true;
                      if (txFilter === 'deposit') return order.type === 'deposit';
                      if (txFilter === 'withdrawal') return order.type === 'withdrawal';
                      if (txFilter === 'transfer') return order.type === 'transfer_out' || order.type === 'transfer_in';
                      if (txFilter === 'bonus') return order.type === 'bonus';
                      if (txFilter === 'subscription') return order.type === 'subscription' || !order.type;
                      return true;
                    })
                    .map((order) => {
                      const isDeposit = order.type === 'deposit';
                      const isWithdrawal = order.type === 'withdrawal';
                      const isBonus = order.type === 'bonus';
                      const isTransferOut = order.type === 'transfer_out';
                      const isTransferIn = order.type === 'transfer_in';

                      return (
                        <div
                          key={order.id || order.orderId}
                          className="p-3.5 rounded-2xl bg-neutral-900/70 border border-white/10 hover:border-amber-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
                              isDeposit
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                : isWithdrawal
                                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                                : isTransferOut
                                ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                                : isTransferIn
                                ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                                : isBonus
                                ? 'bg-teal-500/15 border-teal-500/30 text-teal-300'
                                : 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                            }`}>
                              {isDeposit ? (
                                <ArrowDownLeft className="w-4 h-4" />
                              ) : isWithdrawal ? (
                                <ArrowUpRight className="w-4 h-4" />
                              ) : isTransferOut ? (
                                <Send className="w-4 h-4" />
                              ) : isTransferIn ? (
                                <ArrowDownLeft className="w-4 h-4" />
                              ) : isBonus ? (
                                <Gift className="w-4 h-4" />
                              ) : (
                                <CreditCard className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-white">
                                  {order.orderId}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                                  order.status === 'success'
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                    : order.status === 'pending'
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                                    : order.status === 'rejected'
                                    ? 'bg-red-500/20 text-red-300 border-red-500/40'
                                    : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                }`}>
                                  {order.status === 'success'
                                    ? 'BERHASIL'
                                    : order.status === 'pending'
                                    ? 'PENDING (MENUNGGU KONFIRMASI)'
                                    : order.status === 'rejected'
                                    ? 'DITOLAK'
                                    : order.status.toUpperCase()}
                                </span>
                                {isTransferOut && (
                                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-bold">
                                    TRANSFER KELUAR
                                  </span>
                                )}
                                {isTransferIn && (
                                  <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-bold">
                                    TRANSFER MASUK
                                  </span>
                                )}
                                {isBonus && (
                                  <span className="px-1.5 py-0.2 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[9px] font-bold">
                                    BONUS
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-bold text-amber-200 mt-0.5">
                                {order.planName}
                              </p>
                              <p className="text-[10px] text-white/50 flex items-center gap-2 mt-0.5 flex-wrap">
                                <span>{new Date(order.createdAt).toLocaleString('id-ID')}</span>
                                <span>•</span>
                                <span className="text-cyan-300 font-medium">{order.paymentMethod}</span>
                                {isWithdrawal && order.feeAmount && (
                                  <>
                                    <span>•</span>
                                    <span className="text-amber-400 font-medium">Fee (3%): {formatCurrency(order.feeAmount)}</span>
                                  </>
                                )}
                              </p>

                              {order.txHash && (
                                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-amber-300/80 font-mono flex-wrap">
                                  <span className="text-white/40">Hash:</span>
                                  {order.txHash.startsWith('http') ? (
                                    <a
                                      href={order.txHash}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="underline hover:text-amber-200 flex items-center gap-0.5 truncate max-w-[220px]"
                                    >
                                      <span>Buka Explorer Blockchain</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  ) : (
                                    <span className="truncate max-w-[180px] text-amber-200">{order.txHash}</span>
                                  )}
                                </div>
                              )}

                              {order.status === 'pending' && isOwnerOrAdmin && (
                                <div className="flex items-center gap-1.5 mt-2">
                                  <button
                                    type="button"
                                    onClick={() => handleApproveDeposit(order)}
                                    disabled={isProcessingApproval === (order.id || order.orderId)}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[10px] flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Setujui (+{formatCurrency(order.price)})</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRejectDeposit(order)}
                                    disabled={isProcessingApproval === (order.id || order.orderId)}
                                    className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all"
                                  >
                                    <X className="w-3 h-3" />
                                    <span>Tolak</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                            <div className="text-right">
                              <span className={`text-xs sm:text-sm font-black font-mono ${
                                isDeposit || isBonus || isTransferIn
                                  ? 'text-emerald-400'
                                  : isWithdrawal || isTransferOut
                                  ? 'text-amber-300'
                                  : 'text-white'
                              }`}>
                                {isDeposit || isBonus || isTransferIn ? '+' : isWithdrawal || isTransferOut ? '-' : ''}{formatCurrency(order.price)}
                              </span>
                              {order.txHash && (
                                <p className="text-[9px] text-white/40 font-mono truncate max-w-[120px]">
                                  Tx: {order.txHash.slice(0, 8)}...
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => setSelectedReceipt(order)}
                              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[11px] font-bold transition-all flex items-center gap-1 shrink-0"
                              title="Lihat Struk"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Struk</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Receipt Modal View */}
            {selectedReceipt && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
                <div className="w-full max-w-md rounded-3xl bg-[#0e1422] border-2 border-amber-500/40 p-5 shadow-2xl text-white space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <SysLogo size="sm" showText={false} />
                      <div>
                        <h4 className="font-black text-sm text-white">STRUK BUKTI PEMBAYARAN</h4>
                        <p className="text-[10px] text-amber-300/80">SYS Streamer • @SYS Agency</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedReceipt(null)}
                      className="text-white/50 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 text-xs bg-black/40 p-4 rounded-2xl border border-white/5 font-mono">
                    <div className="flex justify-between py-1 border-b border-white/10">
                      <span className="text-white/50">No. Invoice</span>
                      <span className="text-white font-bold">{selectedReceipt.orderId}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/10">
                      <span className="text-white/50">Tanggal</span>
                      <span className="text-white">
                        {new Date(selectedReceipt.createdAt).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/10">
                      <span className="text-white/50">Paket Layanan</span>
                      <span className="text-amber-300 font-bold">{selectedReceipt.planName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/10">
                      <span className="text-white/50">Metode Bayar</span>
                      <span className="text-cyan-300">{selectedReceipt.paymentMethod}</span>
                    </div>
                    {selectedReceipt.txHash && (
                      <div className="flex justify-between py-1 border-b border-white/10 flex-wrap gap-1">
                        <span className="text-white/50">Tx Hash</span>
                        {selectedReceipt.txHash.startsWith('http') ? (
                          <a
                            href={selectedReceipt.txHash}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-300 underline text-[10px] flex items-center gap-0.5 truncate max-w-[200px]"
                          >
                            <span>Buka di Explorer</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span className="text-amber-200 text-[10px] truncate max-w-[180px]">
                            {selectedReceipt.txHash}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex justify-between py-1 border-b border-white/10">
                      <span className="text-white/50">Status</span>
                      <span className={`font-bold uppercase ${
                        selectedReceipt.status === 'success'
                          ? 'text-emerald-400'
                          : selectedReceipt.status === 'pending'
                          ? 'text-amber-300 animate-pulse'
                          : selectedReceipt.status === 'rejected'
                          ? 'text-red-400'
                          : 'text-yellow-400'
                      }`}>
                        {selectedReceipt.status === 'success'
                          ? 'LUNAS / BERHASIL'
                          : selectedReceipt.status === 'pending'
                          ? 'PENDING (MENUNGGU KONFIRMASI OWNER/ADMIN)'
                          : selectedReceipt.status === 'rejected'
                          ? 'DITOLAK'
                          : selectedReceipt.status}
                      </span>
                    </div>

                    {selectedReceipt.type === 'withdrawal' && (
                      <>
                        <div className="flex justify-between py-1 border-b border-white/10">
                          <span className="text-white/50">Biaya Penarikan (3%)</span>
                          <span className="text-rose-400 font-bold">
                            - {formatCurrency(selectedReceipt.feeAmount || Math.round(selectedReceipt.price * 0.03))}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-white/10">
                          <span className="text-white/50">Penerimaan Bersih</span>
                          <span className="text-emerald-400 font-bold">
                            {formatCurrency(selectedReceipt.netPayoutAmount || (selectedReceipt.price - (selectedReceipt.feeAmount || Math.round(selectedReceipt.price * 0.03))))}
                          </span>
                        </div>
                      </>
                    )}

                    <div className="flex justify-between pt-2 text-sm font-black">
                      <span>Total Value</span>
                      <span className="text-amber-300">{formatCurrency(selectedReceipt.price)}</span>
                    </div>
                  </div>

                  <div className="text-center text-[10px] text-white/40">
                    Official digital receipt issued automatically by the SYS Streamer system.
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedReceipt(null)}
                    className="w-full py-2.5 rounded-xl bg-amber-500 text-black font-black text-xs hover:bg-amber-400 transition-all"
                  >
                    Close Receipt
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: RIWAYAT STREAMING */}
        {activeTab === 'streaming' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Stream Statistics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-2xl bg-neutral-900/80 border border-white/10 flex flex-col">
                <span className="text-[10px] text-white/50 font-bold uppercase flex items-center gap-1">
                  <Tv className="w-3 h-3 text-red-400" /> Broadcast Sessions
                </span>
                <span className="text-lg font-black text-white mt-1">
                  {streamingSessions.length} Sessions
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-900/80 border border-white/10 flex flex-col">
                <span className="text-[10px] text-white/50 font-bold uppercase flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-cyan-400" /> Rounds Played
                </span>
                <span className="text-lg font-black text-cyan-300 mt-1">
                  {totalRoundsPlayed} Rounds
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-900/80 border border-white/10 flex flex-col">
                <span className="text-[10px] text-white/50 font-bold uppercase flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-amber-400" /> Total Rewards
                </span>
                <span className="text-lg font-black text-amber-300 mt-1 font-mono">
                  {formatCurrency(totalPrizesAwarded)}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-900/80 border border-white/10 flex flex-col">
                <span className="text-[10px] text-white/50 font-bold uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" /> Total Duration
                </span>
                <span className="text-lg font-black text-emerald-300 mt-1">
                  {Math.round(totalMinutesStreamed / 60)} Hours
                </span>
              </div>
            </div>

            {/* Header with Add Session button */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-white/60 uppercase">
                Live Broadcast Session History ({streamingSessions.length})
              </span>
              <button
                type="button"
                onClick={() => setShowAddSessionForm(!showAddSessionForm)}
                className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddSessionForm ? 'Close Form' : 'Log New Live Session'}</span>
              </button>
            </div>

            {/* Form to log stream session */}
            {showAddSessionForm && (
              <form
                onSubmit={handleAddStreamingSession}
                className="p-4 rounded-2xl bg-neutral-900/90 border border-red-500/30 space-y-3 animate-in fade-in"
              >
                <h4 className="text-xs font-black text-red-400 uppercase flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5" />
                  <span>Log New Live Broadcast Session</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-white/70 font-semibold">TikTok Live Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g.: 100K 3D Banknote Serial Guessing Live Stream Tonight"
                      value={newSessionTitle}
                      onChange={(e) => setNewSessionTitle(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-white/70 font-semibold">Game Type</label>
                    <select
                      value={newSessionGame}
                      onChange={(e: any) => setNewSessionGame(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-400"
                    >
                      <option value="Tebak Nomor Seri Uang">Banknote Serial Number Guessing</option>
                      <option value="Lucky Spinner 3D">Lucky Spinner 3D</option>
                      <option value="Multi-Game Stream">Multi-Game Stream</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-white/70 font-semibold">Total Rounds</label>
                    <input
                      type="number"
                      min={1}
                      value={newSessionRounds}
                      onChange={(e) => setNewSessionRounds(Number(e.target.value))}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-white/70 font-semibold">Total Cash Prize Distributed (Rp)</label>
                    <input
                      type="number"
                      min={0}
                      step={10000}
                      value={newSessionPrize}
                      onChange={(e) => setNewSessionPrize(Number(e.target.value))}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-400 font-mono text-amber-300"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-white/70 font-semibold">Top Winner</label>
                    <input
                      type="text"
                      placeholder="Winning viewer account name"
                      value={newSessionTopWinner}
                      onChange={(e) => setNewSessionTopWinner(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-white/70 font-semibold">Broadcast Duration (Minutes)</label>
                    <input
                      type="number"
                      min={5}
                      value={newSessionDuration}
                      onChange={(e) => setNewSessionDuration(Number(e.target.value))}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddSessionForm(false)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white/70"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingSession}
                    className="px-4 py-1.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-red-500/20"
                  >
                    {isSubmittingSession ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Save Live Session</span>
                  </button>
                </div>
              </form>
            )}

            {/* Sessions List */}
            {isLoadingSessions ? (
              <div className="p-8 text-center text-white/50 text-xs flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-red-400" />
                <span>Loading live stream history...</span>
              </div>
            ) : streamingSessions.length === 0 ? (
              <div className="p-8 rounded-2xl bg-neutral-900/50 border border-white/5 text-center space-y-3">
                <Radio className="w-10 h-10 text-white/20 mx-auto" />
                <p className="text-xs text-white/60">
                  No stream sessions recorded yet. Click <strong>"Log New Live Session"</strong> to save your TikTok stream results.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[340px] overflow-y-auto custom-scrollbar pr-1">
                {streamingSessions.map((session) => (
                  <div
                    key={session.id || session.sessionId}
                    className="p-3.5 rounded-2xl bg-neutral-900/70 border border-white/10 hover:border-red-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
                        <Tv className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{session.streamTitle}</span>
                          <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/70 text-[9px] font-bold">
                            {session.gameType}
                          </span>
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-white/50 mt-1">
                          <span>{new Date(session.startedAt).toLocaleString('id-ID')}</span>
                          <span>•</span>
                          <span>Duration: {session.durationMinutes} Minutes</span>
                          <span>•</span>
                          <span>{session.totalRounds} Rounds</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                      <div className="text-right">
                        <span className="text-xs font-black text-amber-300 font-mono">
                          {formatCurrency(session.totalPrizeDistributed)}
                        </span>
                        {session.topWinner && (
                          <p className="text-[10px] text-white/60 flex items-center justify-end gap-1">
                            <Award className="w-3 h-3 text-yellow-400" />
                            <span className="truncate max-w-[120px]">{session.topWinner}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PERSETUJUAN / KONFIRMASI DEPOSIT (OWNER & ADMIN) */}
        {activeTab === 'approval' && isOwnerOrAdmin && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Header Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/60 via-slate-900 to-amber-950/40 border border-rose-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-rose-400" />
                  <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                    Owner & Admin Authority Panel
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black">
                    {pendingDeposits.length} Awaiting Confirmation
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Confirm Crypto Deposit Transactions
                </h3>
                <p className="text-xs text-white/65 max-w-xl">
                  Each deposit with <strong className="text-amber-300">Pending</strong> status must provide a transaction hash link. Please verify the transfer validity on the blockchain explorer, then click <strong>Approve</strong> to instantly credit the user's wallet.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setApprovalFeedback({ type: 'success', text: 'Refreshing pending transaction data...' });
                  setTimeout(() => setApprovalFeedback(null), 1500);
                }}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Data</span>
              </button>
            </div>

            {/* Status Feedback Banner */}
            {approvalFeedback && (
              <div className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 animate-in fade-in ${
                approvalFeedback.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
              }`}>
                {approvalFeedback.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{approvalFeedback.text}</span>
              </div>
            )}

            {/* List of Pending Deposits */}
            {pendingDeposits.length === 0 ? (
              <div className="p-10 rounded-2xl bg-neutral-900/50 border border-white/10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">No Pending Deposit Transactions</h4>
                <p className="text-xs text-white/60 max-w-md mx-auto">
                  All crypto deposit transactions from members have been confirmed and processed. New transactions submitted by users will appear here in real time.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-white/70 uppercase">
                    Pending Submissions ({pendingDeposits.length})
                  </span>
                  <span className="text-[11px] text-amber-300 font-mono font-bold">
                    Total: {formatCurrency(pendingDeposits.reduce((acc, curr) => acc + (curr.price || 0), 0))}
                  </span>
                </div>

                <div className="space-y-3 max-h-[460px] overflow-y-auto custom-scrollbar pr-1">
                  {pendingDeposits.map((order) => {
                    const isApprovingThis = isProcessingApproval === (order.id || order.orderId);
                    const txHashUrl = order.txHash && order.txHash.startsWith('http') 
                      ? order.txHash 
                      : order.txHash 
                      ? (order.paymentMethod?.includes('TRC-20') 
                          ? `https://tronscan.org/#/transaction/${order.txHash}` 
                          : order.paymentMethod?.includes('BEP-20')
                          ? `https://bscscan.com/tx/${order.txHash}`
                          : order.paymentMethod?.includes('ETH')
                          ? `https://etherscan.io/tx/${order.txHash}`
                          : order.paymentMethod?.includes('SOL')
                          ? `https://solscan.io/tx/${order.txHash}`
                          : `https://tronscan.org/#/transaction/${order.txHash}`)
                      : null;

                    return (
                      <div
                        key={order.id || order.orderId}
                        className="p-4 rounded-2xl bg-neutral-900/90 border-2 border-amber-500/30 hover:border-amber-400/60 transition-all space-y-3 shadow-lg"
                      >
                        {/* Top: User info and nominal */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                              <Coins className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-white">
                                  {order.userName || order.userEmail || 'Member SYS'}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black uppercase animate-pulse">
                                  PENDING
                                </span>
                              </div>
                              <p className="text-[11px] text-white/50 font-mono mt-0.5">
                                User: <strong className="text-white/80">{order.userEmail}</strong> • Order: {order.orderId}
                              </p>
                              <p className="text-[10px] text-white/40 flex items-center gap-2 mt-0.5">
                                <span>{new Date(order.createdAt).toLocaleString('id-ID')}</span>
                                <span>•</span>
                                <span className="text-cyan-300 font-semibold">{order.paymentMethod}</span>
                              </p>
                            </div>
                          </div>

                          <div className="sm:text-right">
                            <div className="text-base sm:text-lg font-black text-amber-400 font-mono">
                              +{formatCurrency(order.price)}
                            </div>
                            <span className="text-[11px] text-white/60 font-semibold">
                              ≈ {(order.price / 16000).toFixed(2)} USDT
                            </span>
                          </div>
                        </div>

                        {/* Mid: Link Hash Transaksi (TxID) */}
                        <div className="p-3 rounded-xl bg-black/60 border border-white/10 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                              <Hash className="w-3.5 h-3.5" />
                              Transaction Hash Link (TxID):
                            </span>
                            {order.txHash && (
                              <button
                                type="button"
                                onClick={() => copyToClipboard(order.txHash || '', `tx-${order.orderId}`)}
                                className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/15 text-white/80 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                {copiedId === `tx-${order.orderId}` ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy Hash</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          {order.txHash ? (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
                              <span className="font-mono text-xs text-amber-200 break-all select-all">
                                {order.txHash}
                              </span>
                              {txHashUrl && (
                                <a
                                  href={txHashUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold shrink-0 transition-colors"
                                >
                                  <span>Open Explorer</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-rose-400 font-semibold italic">
                              No transaction hash link provided
                            </span>
                          )}
                        </div>

                        {/* Bottom: Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleRejectDeposit(order)}
                            disabled={isApprovingThis}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject Deposit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleApproveDeposit(order)}
                            disabled={isApprovingThis}
                            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/25 cursor-pointer disabled:opacity-50"
                          >
                            {isApprovingThis ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Verifying & Crediting Balance...</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4 stroke-[3]" />
                                <span>Approve & Credit Balance (+{formatCurrency(order.price)})</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

          {/* Footer */}
          <footer className="pt-6 mt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
            <span>All Reserve @SYS Agency • SYS Streamer Suite</span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer"
            >
              {t('back_to_broadcast')}
            </button>
          </footer>
        </div>
      </main>

      {/* Buka Kunci Modal */}
      <BlindBoxUnlockModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        deposit={activeLockedDeposit}
        jwtToken={jwtTokenBB || ''}
        onSuccess={handleUnlockSuccess}
      />

      {/* Selector Modal Bahasa & Mata Uang */}
      <CountryLanguageSelectorModal
        isOpen={isProfileLangModalOpen}
        onClose={() => setIsProfileLangModalOpen(false)}
      />
    </div>
  );
};
