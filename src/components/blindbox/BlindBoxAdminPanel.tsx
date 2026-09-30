import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Sliders,
  Users,
  BarChart3,
  Flame,
  Ban,
  RotateCw,
  Save,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Crown,
  Banknote,
  Gift,
  RefreshCw,
  Wallet,
  PlusCircle,
  Clock,
  X,
  Coins,
  Layers,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  Hash,
} from 'lucide-react';
import { BlindBoxGameSettings, AdminBlindBoxStats, TransactionOrder } from '../../types';
import { useAppConfig } from '../../context/AppConfigContext';
import {
  subscribeToPendingDeposits,
  approvePendingDeposit,
  rejectPendingDeposit,
} from '../../services/firebase';

interface BlindBoxAdminPanelProps {
  jwtToken: string;
  onBack: () => void;
  onRefreshUser: () => void;
  currentUserBalance?: number;
  currentUserId?: number;
  currentUserEmail?: string;
  onTopUp?: (amount: number, targetUserId?: number) => Promise<any>;
}

export const BlindBoxAdminPanel: React.FC<BlindBoxAdminPanelProps> = ({
  jwtToken,
  onBack,
  onRefreshUser,
  currentUserBalance = 0,
  currentUserId,
  currentUserEmail = 'susidewiyuliyanti@gmail.com',
  onTopUp,
}) => {
  const { formatCurrency } = useAppConfig();
  const [activeTab, setActiveTab] = useState<'settings' | 'deposits' | 'stats' | 'topup' | 'approvals'>('settings');
  const [settings, setSettings] = useState<BlindBoxGameSettings>({
    id: 1,
    jackpotAmount: 50000000,
    jackpotChance: 100,
    minBox: 100,
    maxBox: 1000,
  });
  const [stats, setStats] = useState<AdminBlindBoxStats | null>(null);
  const [depositsList, setDepositsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [topUpAmount, setTopUpAmount] = useState<number>(1000000);
  const [customTopUpInput, setCustomTopUpInput] = useState<string>('1000000');
  const [selectedTargetUserId, setSelectedTargetUserId] = useState<number | undefined>(currentUserId);
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);
  const [topUpSuccess, setTopUpSuccess] = useState<string | null>(null);

  // Pending Deposit Approvals State
  const [pendingDeposits, setPendingDeposits] = useState<TransactionOrder[]>([]);
  const [isProcessingApproval, setIsProcessingApproval] = useState<string | null>(null);
  const [approvalMessage, setApprovalMessage] = useState<string | null>(null);
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);

  useEffect(() => {
    const isOwnerOrAdmin =
      currentUserEmail?.trim().toLowerCase() === 'susidewiyuliyanti@gmail.com' ||
      currentUserEmail?.trim().toLowerCase().includes('admin');
    if (!isOwnerOrAdmin) return;

    const unsubPending = subscribeToPendingDeposits((orders) => {
      setPendingDeposits(orders);
    });
    return () => {
      unsubPending();
    };
  }, [currentUserEmail]);

  const handleApproveDeposit = async (order: TransactionOrder) => {
    setIsProcessingApproval(order.id || order.orderId);
    try {
      const res = await approvePendingDeposit(order.id || order.orderId, currentUserEmail);
      if (res?.success) {
        setApprovalMessage(`âœ… Deposit ${order.orderId} of ${formatCurrency(order.price)} successfully approved! User balance updated to ${formatCurrency(res.newTargetBalance)}.`);
        onRefreshUser();
      }
    } catch (err: any) {
      setApprovalMessage(`âŒ Failed: ${err.message || 'An error occurred while approving deposit.'}`);
    } finally {
      setIsProcessingApproval(null);
      setTimeout(() => setApprovalMessage(null), 5000);
    }
  };

  const handleRejectDeposit = async (order: TransactionOrder) => {
    if (!window.confirm(`Reject deposit request ${order.orderId} for ${formatCurrency(order.price)}?`)) return;
    setIsProcessingApproval(order.id || order.orderId);
    try {
      const res = await rejectPendingDeposit(order.id || order.orderId, currentUserEmail);
      if (res?.success) {
        setApprovalMessage(`Deposit ${order.orderId} has been rejected.`);
      }
    } catch (err: any) {
      setApprovalMessage(`âŒ Failed: ${err.message || 'An error occurred while rejecting deposit.'}`);
    } finally {
      setIsProcessingApproval(null);
      setTimeout(() => setApprovalMessage(null), 5000);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTxId(id);
    setTimeout(() => setCopiedTxId(null), 2000);
  };

  // Grouping by Lock Duration (30, 60, 90 Hari)
  const [selectedLockDurationGroup, setSelectedLockDurationGroup] = useState<'ALL' | 30 | 60 | 90>('ALL');

  // Owner Jackpot Custom Authorization State
  const [jackpotModalUser, setJackpotModalUser] = useState<any | null>(null);
  const [jackpotNominalChoice, setJackpotNominalChoice] = useState<number>(10000000);
  const [customJackpotNominal, setCustomJackpotNominal] = useState<string>('10000000');
  const [isJackpotSubmitting, setIsJackpotSubmitting] = useState(false);

  // Load Admin Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Settings
      const setRes = await fetch('/api/admin/settings');
      const setData = await setRes.json();
      if (setData) setSettings(setData);

      // 2. Stats
      const statRes = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      if (statRes.ok) {
        const statData = await statRes.json();
        setStats(statData);
      }

      // 3. Deposits
      const depRes = await fetch('/api/admin/deposits', {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      if (depRes.ok) {
        const depData = await depRes.json();
        setDepositsList(depData);
      }
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [jwtToken]);

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');
      setMessage({ type: 'success', text: data.message || 'Settings updated successfully!' });
      onRefreshUser();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  // Toggle Force Jackpot
  const handleToggleForceJackpot = async (userId: number, depositId: number, currentStatus: boolean, nominal?: number) => {
    try {
      const res = await fetch('/api/admin/force-jackpot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          userId,
          depositId,
          enable: !currentStatus,
          nominal: nominal || 10000000,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ type: 'success', text: data.message });
      loadData();
      onRefreshUser();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  // Open Owner Jackpot Authorization Modal
  const handleOpenJackpotModal = (dep: any) => {
    setJackpotModalUser(dep);
    const existingNominal = dep.targetJackpotNominal || 10000000;
    setJackpotNominalChoice(existingNominal);
    setCustomJackpotNominal(existingNominal.toString());
  };

  // Submit Owner Custom Jackpot Authorization
  const handleApplyCustomJackpot = async () => {
    if (!jackpotModalUser) return;
    setIsJackpotSubmitting(true);
    try {
      const nominal = Number(customJackpotNominal) || jackpotNominalChoice || 10000000;
      const res = await fetch('/api/admin/force-jackpot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          userId: jackpotModalUser.userId,
          depositId: jackpotModalUser.id,
          enable: true,
          nominal,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to set jackpot authorization');
      setMessage({
        type: 'success',
        text: `Jackpot authorization of Rp ${nominal.toLocaleString('id-ID')} successfully set for @${jackpotModalUser.username}!`,
      });
      setJackpotModalUser(null);
      loadData();
      onRefreshUser();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsJackpotSubmitting(false);
    }
  };

  // Cancel / Deactivate Jackpot Authorization
  const handleCancelJackpot = async (userId: number, depositId: number) => {
    try {
      const res = await fetch('/api/admin/force-jackpot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          userId,
          depositId,
          enable: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ type: 'success', text: 'Jackpot authorization successfully deactivated.' });
      setJackpotModalUser(null);
      loadData();
      onRefreshUser();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  // Toggle Blacklist
  const handleToggleBlacklist = async (userId: number, currentBlacklist: boolean) => {
    try {
      const res = await fetch('/api/admin/blacklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          userId,
          isBlacklisted: !currentBlacklist,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ type: 'success', text: data.message });
      loadData();
      onRefreshUser();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  // Trigger Cron Reset Manually
  const handleManualCronReset = async () => {
    try {
      const res = await fetch('/api/cron/reset', { method: 'POST' });
      const data = await res.json();
      setMessage({
        type: 'success',
        text: `Simulation Reset 00:00 WIB Success: ${data.message} (${data.expiredDepositsUpdated} expired deposits updated).`,
      });
      loadData();
      onRefreshUser();
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to execute cron reset.' });
    }
  };

  // Handle Owner Instant Top Up
  const handleExecuteTopUp = async () => {
    setIsTopUpLoading(true);
    setTopUpSuccess(null);
    setMessage(null);
    try {
      const amount = Number(customTopUpInput) || topUpAmount || 50000;
      if (amount <= 0) {
        throw new Error('Top up amount must be greater than 0!');
      }

      if (onTopUp) {
        const result = await onTopUp(amount, selectedTargetUserId);
        if (result && result.message) {
          setTopUpSuccess(result.message);
          setMessage({ type: 'success', text: result.message });
        } else {
          setTopUpSuccess(`Balance of Rp ${amount.toLocaleString('id-ID')} added successfully!`);
        }
      } else {
        const res = await fetch('/api/auth/topup-demo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({
            amount,
            targetUserId: selectedTargetUserId,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add balance');
        setTopUpSuccess(data.message);
        setMessage({ type: 'success', text: data.message });
      }
      loadData();
      onRefreshUser();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsTopUpLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 text-white space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 p-4 rounded-2xl bg-neutral-900 border border-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer"
            title="Kembali ke Dashboard Game"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              <h2 className="text-lg sm:text-xl font-black text-amber-300">
                Owner & Admin Control Center
              </h2>
            </div>
            <p className="text-xs text-white/60">
              Game Settings, Force Jackpot, Instant Top Up, and Database Reports
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualCronReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all"
            title="Simulate 00:00 WIB Cron Call"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Simulate Reset 00:00 WIB</span>
          </button>

          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
            title="Reload Data"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Notification Toast/Banner */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
              : 'bg-red-500/20 border border-red-500/40 text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-white/10 pb-2 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'settings'
              ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-white/70'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Game Settings & Odds</span>
        </button>

        <button
          onClick={() => setActiveTab('deposits')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'deposits'
              ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-white/70'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Data & Force Jackpot ({depositsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'stats'
              ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-white/70'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Financial Reports & Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('topup')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'topup'
              ? 'bg-emerald-400 text-slate-950 font-extrabold shadow-sm'
              : 'bg-white/5 hover:bg-white/10 text-white/70'
          }`}
        >
          <Banknote className="w-4 h-4" />
          <span>Instant Top Up</span>
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'approvals'
              ? 'bg-rose-500 text-white font-extrabold shadow-sm'
              : 'bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Deposit Approvals ({pendingDeposits.length})</span>
          {pendingDeposits.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] animate-pulse">
              {pendingDeposits.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: SETTINGS & ODDS */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form
            onSubmit={handleSaveSettings}
            className="p-6 rounded-2xl bg-neutral-900 border border-white/10 space-y-5"
          >
            <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Jackpot Configuration & Blind Box Rewards</span>
            </h3>

            {/* Jackpot Amount */}
            <div>
              <label className="block text-xs font-bold text-white/80 mb-1.5">
                Maximum Sultan Jackpot Reward (Rp 100 - Rp 50,000,000)
              </label>
              <input
                type="number"
                min="100"
                max="50000000"
                value={settings.jackpotAmount}
                onChange={(e) =>
                  setSettings({ ...settings, jackpotAmount: Number(e.target.value) })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 focus:border-amber-400 text-sm font-mono text-amber-300 font-bold"
              />
              <p className="text-[11px] text-white/50 mt-1">
                Jackpot range: Rp 100 to Rp 50,000,000 (Maximum: Rp {settings.jackpotAmount.toLocaleString('id-ID')}). When winning jackpot, user wins a random reward between Rp 100 up to this limit.
              </p>
            </div>

            {/* Jackpot Chance Slider (1/50 s/d 1/1000) */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-white/10 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-white/80">
                  Natural Jackpot Chance (Slider 1:50 to 1:1000)
                </label>
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-white/10 text-amber-300 font-mono text-xs font-black">
                  1 in {settings.jackpotChance} ({(100 / settings.jackpotChance).toFixed(2)}%)
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="10"
                value={settings.jackpotChance}
                onChange={(e) =>
                  setSettings({ ...settings, jackpotChance: Number(e.target.value) })
                }
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-white/40 font-mono">
                <span>1/50 (Frequent - 2.0%)</span>
                <span>1/100 (Default - 1.0%)</span>
                <span>1/500 (Rare)</span>
                <span>1/1000 (Very Rare)</span>
              </div>
            </div>

            {/* Min & Max Regular Box */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-white/80 mb-1.5">
                  Min Box (Rp)
                </label>
                <input
                  type="number"
                  value={settings.minBox}
                  onChange={(e) =>
                    setSettings({ ...settings, minBox: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-sm font-mono text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/80 mb-1.5">
                  Max Box (Rp)
                </label>
                <input
                  type="number"
                  value={settings.maxBox}
                  onChange={(e) =>
                    setSettings({ ...settings, maxBox: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-sm font-mono text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Game Settings</span>
            </button>
          </form>

          {/* Guidelines info */}
          <div className="p-6 rounded-2xl bg-neutral-900 border border-white/10 space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span>Owner Control Guide</span>
            </h3>
            <ul className="space-y-2.5 text-xs text-white/70 leading-relaxed list-disc list-inside">
              <li>
                <strong className="text-white">Natural Chance:</strong> Every time a user opens a Blind Box, the system rolls 1 to{' '}
                <span className="text-amber-300 font-mono">{settings.jackpotChance}</span>. If 1 is rolled, the user automatically wins a Sultan Jackpot up to Rp{' '}
                {settings.jackpotAmount.toLocaleString('id-ID')}.
              </li>
              <li>
                <strong className="text-white">Force Jackpot:</strong> You can enable this feature for specific users or deposits in the "User Data" tab. On their next claim, that user is 100% guaranteed to receive the Sultan Jackpot (Rp 100 - Rp 50,000,000)!
              </li>
              <li>
                <strong className="text-white">Daily Reset 00:00 WIB:</strong> Daily claim schedules reset automatically at midnight WIB. Missed days are forfeited and cannot be claimed retroactively.
              </li>
              <li>
                <strong className="text-white">Fund Withdrawal:</strong> Once lock duration (30/60/90 days) ends, users can withdraw their full principal Rp 50,000 + accumulated daily rewards.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 2: USER DATA & FORCE JACKPOT (3 GROUPS BERDASARKAN MASA WAKTU LOCK) */}
      {activeTab === 'deposits' && (() => {
        const group30 = depositsList.filter((d) => d.durationDays === 30);
        const group60 = depositsList.filter((d) => d.durationDays === 60);
        const group90 = depositsList.filter((d) => d.durationDays === 90);

        const totalLock30 = group30.reduce((sum, d) => sum + (d.amount || 1000000), 0);
        const totalLock60 = group60.reduce((sum, d) => sum + (d.amount || 2500000), 0);
        const totalLock90 = group90.reduce((sum, d) => sum + (d.amount || 5000000), 0);

        const displayedDeposits =
          selectedLockDurationGroup === 'ALL'
            ? depositsList
            : depositsList.filter((d) => d.durationDays === selectedLockDurationGroup);

        return (
          <div className="space-y-6">
            {/* Header section */}
            <div className="p-5 rounded-2xl bg-neutral-900 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <span>Tabel User Lock & Otorisasi Jackpot Pemenang</span>
                </h3>
                <p className="text-xs text-white/60">
                  Data pengguna terbagi dalam 3 Group masa lock. Owner memiliki otorisasi penuh menentukan pengguna dan nominal jackpot yang akan dimenangkan.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-white/10 text-amber-300 font-mono text-xs font-bold">
                  Total {depositsList.length} User Terkunci
                </span>
                <button
                  type="button"
                  onClick={loadData}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all cursor-pointer"
                  title="Segarkan Data"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 3 GROUP CARDS BERDASARKAN MASA WAKTU LOCK */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Group 1: Lock 30 Hari */}
              <div
                onClick={() => setSelectedLockDurationGroup(selectedLockDurationGroup === 30 ? 'ALL' : 30)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  selectedLockDurationGroup === 30
                    ? 'bg-neutral-800 border-slate-400 ring-1 ring-slate-400/40 shadow-md'
                    : 'bg-neutral-900 border-white/10 hover:border-slate-400/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 text-slate-200 border border-white/10 text-[10px] font-black uppercase flex items-center gap-1">
                    <span>🥈 Group 1</span>
                    <span>•</span>
                    <span>Lock 30 Hari</span>
                  </span>
                  <span className="text-[11px] font-bold text-slate-300 font-mono">
                    3 Box Silver
                  </span>
                </div>
                <div className="text-xl font-black text-white font-['Poppins']">
                  Rp {totalLock30.toLocaleString('id-ID')}
                </div>
                <div className="flex items-center justify-between text-xs text-white/50 pt-2 border-t border-white/5 mt-2">
                  <span>{group30.length} Akun Terdaftar</span>
                  <span className="text-emerald-400 font-semibold">
                    {group30.filter((d) => d.status === 'ACTIVE').length} Aktif
                  </span>
                </div>
                <div className="mt-2 text-[10px] text-slate-400 bg-neutral-950 p-2 rounded-lg border border-white/10">
                  Kriteria: Saldo lock Rp 1.000.000 dapat 3 Box Silver harian.
                </div>
              </div>

              {/* Group 2: Lock 60 Hari */}
              <div
                onClick={() => setSelectedLockDurationGroup(selectedLockDurationGroup === 60 ? 'ALL' : 60)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  selectedLockDurationGroup === 60
                    ? 'bg-neutral-800 border-cyan-400 ring-1 ring-cyan-400/30 shadow-md'
                    : 'bg-neutral-900 border-white/10 hover:border-cyan-400/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-200 border border-cyan-500/20 text-[10px] font-black uppercase flex items-center gap-1">
                    <span>🥇 Group 2</span>
                    <span>•</span>
                    <span>Lock 60 Hari</span>
                  </span>
                  <span className="text-[11px] font-bold text-cyan-300 font-mono">
                    5 Box Platinum
                  </span>
                </div>
                <div className="text-xl font-black text-white font-['Poppins']">
                  Rp {totalLock60.toLocaleString('id-ID')}
                </div>
                <div className="flex items-center justify-between text-xs text-white/50 pt-2 border-t border-white/5 mt-2">
                  <span>{group60.length} Akun Terdaftar</span>
                  <span className="text-cyan-400 font-semibold">
                    {group60.filter((d) => d.status === 'ACTIVE').length} Aktif
                  </span>
                </div>
                <div className="mt-2 text-[10px] text-cyan-300/80 bg-cyan-950/25 p-2 rounded-lg border border-cyan-500/20">
                  Kriteria: Saldo lock Rp 2.500.000 dapat 5 Box Platinum harian.
                </div>
              </div>

              {/* Group 3: Lock 90 Hari */}
              <div
                onClick={() => setSelectedLockDurationGroup(selectedLockDurationGroup === 90 ? 'ALL' : 90)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  selectedLockDurationGroup === 90
                    ? 'bg-neutral-800 border-amber-400 ring-1 ring-amber-400/30 shadow-md'
                    : 'bg-neutral-900 border-white/10 hover:border-amber-400/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-200 border border-amber-500/20 text-[10px] font-black uppercase flex items-center gap-1">
                    <span>🏆 Group 3</span>
                    <span>•</span>
                    <span>Lock 90 Hari</span>
                  </span>
                  <span className="text-[11px] font-bold text-amber-300 font-mono">
                    10 Box Emas
                  </span>
                </div>
                <div className="text-xl font-black text-white font-['Poppins']">
                  Rp {totalLock90.toLocaleString('id-ID')}
                </div>
                <div className="flex items-center justify-between text-xs text-white/50 pt-2 border-t border-white/5 mt-2">
                  <span>{group90.length} Akun Terdaftar</span>
                  <span className="text-amber-400 font-semibold">
                    {group90.filter((d) => d.status === 'ACTIVE').length} Aktif
                  </span>
                </div>
                <div className="mt-2 text-[10px] text-amber-300/80 bg-amber-950/25 p-2 rounded-lg border border-amber-500/20">
                  Kriteria: Saldo lock Rp 5.000.000 dapat 10 Box Emas harian.
                </div>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-white/50 font-bold mr-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Filter Tampilan:</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedLockDurationGroup('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedLockDurationGroup === 'ALL'
                    ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                Semua Group ({depositsList.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedLockDurationGroup(30)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedLockDurationGroup === 30
                    ? 'bg-slate-300 text-slate-950 shadow-md font-black'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                🥈 Group Lock 30 Hari ({group30.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedLockDurationGroup(60)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedLockDurationGroup === 60
                    ? 'bg-cyan-400 text-slate-950 shadow-md font-black'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                🥇 Group Lock 60 Hari ({group60.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedLockDurationGroup(90)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedLockDurationGroup === 90
                    ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                🏆 Group Lock 90 Hari ({group90.length})
              </button>
            </div>

            {/* TABEL PENGGUNA TERKELOMPOK */}
            <div className="p-4 sm:p-6 rounded-2xl bg-neutral-900 border border-white/10 overflow-x-auto">
              {displayedDeposits.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto opacity-60" />
                  <p className="text-xs text-white/60">
                    Tidak ada deposit pada filter group yang dipilih.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/15 text-white/50 text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">Kode Deposit</th>
                      <th className="py-2.5 px-3">Pengguna</th>
                      <th className="py-2.5 px-3">Group Masa Lock</th>
                      <th className="py-2.5 px-3">Nominal Lock</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Hadiah Terkumpul</th>
                      <th className="py-2.5 px-3 text-center">Otorisasi Jackpot Owner</th>
                      <th className="py-2.5 px-3 text-center">Aksi Blacklist</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {displayedDeposits.map((dep) => {
                      const isJackpotActive = dep.forceJackpot || dep.userForceJackpot;
                      const activeJackpotNominal = dep.targetJackpotNominal || 10000000;

                      return (
                        <tr key={dep.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-amber-300">
                            {dep.depositCode}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>@{dep.username}</span>
                              {isJackpotActive && (
                                <span className="px-1.5 py-0.2 rounded bg-red-500/30 text-red-300 border border-red-500/50 text-[9px] font-black uppercase animate-pulse">
                                  Target Jackpot
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-white/50">{dep.email}</div>
                          </td>
                          <td className="py-3 px-3">
                            {dep.durationDays === 90 ? (
                              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-white/10 text-[10px] font-black">
                                🏆 Lock 90 Hari (10 Box Emas)
                              </span>
                            ) : dep.durationDays === 60 ? (
                              <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-black">
                                🥇 Lock 60 Hari (5 Box Platinum)
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-slate-500/20 text-slate-200 border border-slate-500/40 text-[10px] font-black">
                                🥈 Lock 30 Hari (3 Box Silver)
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-white">
                            Rp {(dep.amount || (dep.durationDays === 90 ? 5000000 : dep.durationDays === 60 ? 2500000 : 1000000)).toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                dep.status === 'ACTIVE'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : dep.status === 'EXPIRED'
                                  ? 'bg-amber-500/20 text-amber-300 border border-white/10'
                                  : 'bg-white/10 text-white/60'
                              }`}
                            >
                              {dep.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                            Rp {dep.totalClaimed.toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {isJackpotActive ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenJackpotModal(dep)}
                                  className="px-3 py-1.5 rounded-xl text-[11px] font-black bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg shadow-red-500/30 flex items-center gap-1.5 transition-all hover:brightness-110 cursor-pointer animate-pulse"
                                  title="Klik untuk mengubah nominal atau membatalkan otorisasi jackpot"
                                >
                                  <Flame className="w-3.5 h-3.5 text-yellow-300" />
                                  <span>🎰 Rp {activeJackpotNominal.toLocaleString('id-ID')}</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenJackpotModal(dep)}
                                  className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-white/10 transition-all hover:brightness-110 flex items-center gap-1 cursor-pointer"
                                  title="Otorisasi user ini untuk mendapatkan jackpot"
                                >
                                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Atur Jackpot</span>
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => handleToggleBlacklist(dep.userId, dep.isBlacklisted)}
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 mx-auto cursor-pointer ${
                                dep.isBlacklisted
                                  ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                                  : 'bg-white/10 hover:bg-red-500/20 text-white/70 hover:text-red-300 border border-white/10'
                              }`}
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>{dep.isBlacklisted ? 'Terblokir' : 'Blokir'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* MODAL OTORISASI JACKPOT OWNER (TENTUKAN NOMINAL & USER) */}
            {jackpotModalUser && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border-2 border-white/10 p-6 space-y-5 shadow-md animate-in zoom-in-95 duration-200">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-white/10 flex items-center justify-center text-amber-400">
                        <Crown className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-white flex items-center gap-2">
                          <span>Otorisasi Jackpot Owner</span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                            Khusus Owner
                          </span>
                        </h4>
                        <p className="text-xs text-white/60">
                          Tentukan nominal pasti jackpot yang dimenangkan user ini
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setJackpotModalUser(null)}
                      className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Target User Info */}
                  <div className="p-4 rounded-2xl bg-neutral-950 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/50">Target Pemenang:</span>
                      <span className="font-bold text-white font-mono">@{jackpotModalUser.username}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/50">Email Pengguna:</span>
                      <span className="text-white/80 font-mono text-[11px]">{jackpotModalUser.email}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/50">Kode Deposit:</span>
                      <span className="text-amber-300 font-mono font-bold">{jackpotModalUser.depositCode}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/50">Group Masa Lock:</span>
                      <span className="font-bold text-cyan-300">
                        {jackpotModalUser.durationDays} Hari ({jackpotModalUser.durationDays === 90 ? 'Emas 10 Box' : jackpotModalUser.durationDays === 60 ? 'Platinum 5 Box' : 'Silver 3 Box'})
                      </span>
                    </div>
                  </div>

                  {/* Preset Nominal Buttons */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-white/80">
                      Quick Jackpot Amount Selection:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[1000000, 2500000, 5000000, 10000000, 25000000, 50000000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => {
                            setJackpotNominalChoice(amt);
                            setCustomJackpotNominal(amt.toString());
                          }}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            Number(customJackpotNominal) === amt
                              ? 'bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-amber-400/50'
                              : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/10'
                          }`}
                        >
                          Rp {amt.toLocaleString('id-ID')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Nominal Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 flex items-center justify-between">
                      <span>Nominal Jackpot Kustom (Rp):</span>
                      <span className="text-amber-300 font-mono text-xs font-bold">
                        Rp {Number(customJackpotNominal || 0).toLocaleString('id-ID')}
                      </span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 font-bold text-xs">
                        Rp
                      </span>
                      <input
                        type="number"
                        min={10000}
                        step={100000}
                        value={customJackpotNominal}
                        onChange={(e) => setCustomJackpotNominal(e.target.value)}
                        placeholder="Contoh: 10000000"
                        className="w-full bg-black/50 border border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <p className="text-[10px] text-white/40">
                      When the user opens their next Blind Box, the system 100% guarantees a Jackpot prize equal to the amount above.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                    <button
                      type="button"
                      disabled={isJackpotSubmitting || Number(customJackpotNominal || 0) <= 0}
                      onClick={handleApplyCustomJackpot}
                      className="w-full sm:flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:brightness-95 disabled:opacity-50 cursor-pointer"
                    >
                      <Crown className="w-4 h-4 text-slate-950" />
                      <span>
                        {isJackpotSubmitting
                          ? 'Applying Authorization...'
                          : `Authorize Jackpot Rp ${Number(customJackpotNominal || 0).toLocaleString('id-ID')}`}
                      </span>
                    </button>

                    {(jackpotModalUser.forceJackpot || jackpotModalUser.userForceJackpot) && (
                      <button
                        type="button"
                        onClick={() => handleCancelJackpot(jackpotModalUser.userId, jackpotModalUser.id)}
                        className="w-full sm:w-auto px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-bold text-xs transition-all cursor-pointer"
                      >
                        Remove Jackpot
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setJackpotModalUser(null)}
                      className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/70 font-bold text-xs transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* TAB 3: FINANCIAL REPORT & STATS */}
      {activeTab === 'stats' && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-neutral-900 border border-white/10 space-y-1">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Banknote className="w-4 h-4 text-cyan-400" />
              <span>Total Deposit Inflows</span>
            </div>
            <div className="text-2xl font-black font-mono text-cyan-300">
              Rp {stats.totalDepositAmount.toLocaleString('id-ID')}
            </div>
            <p className="text-[10px] text-white/40">
              From {stats.totalDepositsCount} total deposits ({stats.activeDepositsCount} currently active)
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900 border border-white/10 space-y-1">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Gift className="w-4 h-4 text-emerald-400" />
              <span>Total Blind Box Rewards Distributed</span>
            </div>
            <div className="text-2xl font-black font-mono text-emerald-300">
              Rp {stats.totalPrizeDistributed.toLocaleString('id-ID')}
            </div>
            <p className="text-[10px] text-white/40">
              Includes {stats.totalJackpots} Sultan jackpots (up to Rp 50,000,000) awarded
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900 border border-white/10 space-y-1">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Total Registered Users</span>
            </div>
            <div className="text-2xl font-black font-mono text-amber-300">
              {stats.totalUsers} Users
            </div>
            <p className="text-[10px] text-white/40">
              Total completed withdrawals: {stats.totalWithdrawalsCount} times
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: TAMBAH SALDO INSTAN (KHUSUS OWNER) */}
      {activeTab === 'topup' && (
        <div className="p-6 rounded-2xl bg-neutral-900 border border-emerald-500/30 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Instant Balance Top Up (Owner Only)
                </h3>
              </div>
              <p className="text-xs text-white/60 mt-0.5">
                Exclusive Owner feature to directly credit your wallet or a selected user's wallet.
              </p>
            </div>

            <div className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="text-[11px] text-white/60 font-semibold">Your Current Wallet Balance:</div>
              <div className="text-xl font-black font-mono text-emerald-400">
                Rp {currentUserBalance.toLocaleString('id-ID')}
              </div>
            </div>
          </div>

          {topUpSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-2 font-bold">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{topUpSuccess}</span>
            </div>
          )}

          {/* Target User Selector */}
          <div>
            <label className="block text-xs font-bold text-white/80 mb-2">
              Select Balance Recipient Account:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setSelectedTargetUserId(currentUserId)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedTargetUserId === currentUserId || !selectedTargetUserId
                    ? 'bg-emerald-500/20 border-emerald-400 text-white'
                    : 'bg-neutral-950 border-white/10 text-white/70 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    Owner Account (Self) (ID: #{currentUserId || 1})
                  </span>
                  {(selectedTargetUserId === currentUserId || !selectedTargetUserId) && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black">
                      Selected
                    </span>
                  )}
                </div>
                <div className="text-xs text-white/60 mt-1 font-mono">{currentUserEmail}</div>
              </div>

              {depositsList.length > 0 && (
                <div className="space-y-1">
                  <label className="text-[11px] text-white/60 font-medium">Or select from users with deposit history:</label>
                  <select
                    value={selectedTargetUserId || ''}
                    onChange={(e) => setSelectedTargetUserId(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs font-mono text-white"
                  >
                    <option value={currentUserId}>-- Owner Account ({currentUserEmail}) --</option>
                    {Array.from(new Set(depositsList.map((d) => d.userId))).map((uid) => {
                      const dep = depositsList.find((d) => d.userId === uid);
                      return (
                        <option key={uid} value={uid}>
                          User #{uid} - {dep?.userEmail || 'User'} (Active Deposit: Rp {(dep?.activeDeposit || 0).toLocaleString('id-ID')})
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Quick Amounts */}
          <div>
            <label className="block text-xs font-bold text-white/80 mb-2">
              Quick Amount Selection:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {[100000, 500000, 1000000, 5000000, 10000000, 50000000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setTopUpAmount(amt);
                    setCustomTopUpInput(amt.toString());
                  }}
                  className={`py-2.5 px-2 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer text-center ${
                    Number(customTopUpInput) === amt
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-lg shadow-emerald-500/20'
                      : 'bg-black/50 border-white/10 text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Rp {amt >= 1000000 ? `${amt / 1000000}M` : `${amt / 1000}k`}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Input */}
          <div>
            <label className="block text-xs font-bold text-white/80 mb-1.5">
              Custom Amount (Rp):
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-mono font-bold text-sm">
                Rp
              </span>
              <input
                type="number"
                min="100"
                step="50000"
                value={customTopUpInput}
                onChange={(e) => {
                  setCustomTopUpInput(e.target.value);
                  setTopUpAmount(Number(e.target.value) || 0);
                }}
                placeholder="Example: 1000000"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-black/60 border border-white/15 focus:border-emerald-400 text-base font-mono font-bold text-emerald-400"
              />
            </div>
            <p className="text-[11px] text-white/50 mt-1.5">
              Amount to be added: <span className="text-emerald-400 font-bold font-mono">Rp {(Number(customTopUpInput) || 0).toLocaleString('id-ID')}</span>
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={handleExecuteTopUp}
              disabled={isTopUpLoading || !Number(customTopUpInput)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <PlusCircle className="w-5 h-5 text-slate-950" />
              <span>
                {isTopUpLoading
                  ? 'Processing Balance Addition...'
                  : `Add Balance Rp ${(Number(customTopUpInput) || 0).toLocaleString('id-ID')} Now`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: KONFIRMASI DEPOSIT CRYPTO (PENDING) */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          {/* Header Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/70 via-slate-900 to-amber-950/40 border border-rose-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-rose-400" />
                <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                  Owner & Admin Deposit Verification
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black">
                  {pendingDeposits.length} Awaiting Confirmation
                </span>
              </div>
              <h3 className="text-lg font-black text-white">
                Member Crypto Deposit List (Pending Status)
              </h3>
              <p className="text-xs text-white/60 max-w-xl">
                Each member must provide a Transaction Hash (TxID) when depositing. Verify the transaction hash on the explorer, then click <strong>Approve</strong> to automatically credit the user's balance.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-amber-300 font-bold">
                Total Pending: {formatCurrency(pendingDeposits.reduce((acc, curr) => acc + (curr.price || 0), 0))}
              </span>
            </div>
          </div>

          {/* Feedback banner */}
          {approvalMessage && (
            <div className="p-3.5 rounded-xl bg-amber-500/20 border border-white/10 text-amber-200 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{approvalMessage}</span>
            </div>
          )}

          {/* Pending List */}
          {pendingDeposits.length === 0 ? (
            <div className="p-12 rounded-2xl bg-neutral-900/60 border border-white/10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">All Deposits Cleared</h4>
              <p className="text-xs text-white/50 max-w-md mx-auto">
                No pending crypto deposits at this time. New incoming transactions will appear here in real-time.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
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
                    className="p-4 rounded-2xl bg-neutral-900 border-2 border-white/10 hover:border-amber-400/60 transition-all space-y-3 shadow-lg"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-white/10 flex items-center justify-center text-amber-400 shrink-0">
                          <Coins className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-white">
                              {order.userName || order.userEmail || 'Member SYS'}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-white/10 text-[9px] font-black uppercase animate-pulse">
                              PENDING
                            </span>
                          </div>
                          <p className="text-xs text-white/50 font-mono mt-0.5">
                            User: <strong className="text-white/80">{order.userEmail}</strong> • Order ID: {order.orderId}
                          </p>
                          <p className="text-[10px] text-white/40 flex items-center gap-2 mt-0.5">
                            <span>{new Date(order.createdAt).toLocaleString('en-US')}</span>
                            <span>•</span>
                            <span className="text-cyan-300 font-semibold">{order.paymentMethod}</span>
                          </p>
                        </div>
                      </div>

                      <div className="sm:text-right">
                        <div className="text-lg font-black text-amber-400 font-mono">
                          +{formatCurrency(order.price)}
                        </div>
                        <span className="text-xs text-white/60 font-semibold">
                          ≈ {(order.price / 16000).toFixed(2)} USDT
                        </span>
                      </div>
                    </div>

                    {/* Hash Transaksi */}
                    <div className="p-3 rounded-xl bg-black/60 border border-white/10 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                          <Hash className="w-3.5 h-3.5" />
                          Transaction Hash Link (TxID Proof of Transfer):
                        </span>
                        {order.txHash && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(order.txHash || '', `tx-${order.orderId}`)}
                            className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/15 text-white/80 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            {copiedTxId === `tx-${order.orderId}` ? (
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
                              <span>Open in Explorer</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-rose-400 font-semibold italic">
                          No transaction hash provided
                        </span>
                      )}
                    </div>

                    {/* Actions */}
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
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Processing Approval...</span>
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
          )}
        </div>
      )}
    </div>
  );
};


