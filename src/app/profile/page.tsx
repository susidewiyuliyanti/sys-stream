import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { CryptoDepositModal } from '../../components/CryptoDepositModal';
import { sound } from '../../lib/sound';
import { useLanguage } from '../../i18n';
import {
  Settings,
  Bell,
  CheckCircle,
  Flame,
  Lock,
  Info,
  TrendingUp,
  Diamond,
  Clock,
  Camera,
  Edit2,
  X,
  Upload,
  Check,
  Shield,
  Coins,
  LogOut,
  Sparkles,
  Copy,
  ExternalLink,
  CalendarDays,
} from 'lucide-react';


export default function ProfilePage() {
  const {
    user,
    locks,
    getTotalLockedUsdt,
    updateAvatar,
    updateUsername,
    updateProfile,
    logout,
    isLoggedIn,
    setLoginModalOpen,
    showToast,
    claimRegistrationBonus,
  } = useGame();

  const [eventStatuses, setEventStatuses] = useState<any[]>([]);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const { t } = useLanguage();

  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [selectedDurationFilter, setSelectedDurationFilter] = useState<30 | 60 | 90>(30);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [claimingBonus, setClaimingBonus] = useState(false);
  const [newAvatarInput, setNewAvatarInput] = useState(user.avatar || '');
  const [newUsernameInput, setNewUsernameInput] = useState(user.username);

  const totalLocked = Number(user.lockedBalance || getTotalLockedUsdt() || 0);
  const availableBalance = Number(user.coins || 0) / 100;
  const referralLink = user.referralCode
    ? `https://sysstreamer.asia/register?ref=${encodeURIComponent(user.referralCode)}`
    : '';

  useEffect(() => {
    const token = localStorage.getItem('sys_stream_auth_token');
    if (!token) { setEventStatuses([]); return; }
    fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (data?.success) setEventStatuses(Array.isArray(data.events) ? data.events : []); })
      .catch(() => {});
  }, [isLoggedIn, user.id]);

  const copyReferralLink = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopiedReferral(true);
      showToast('Referral Link', 'Referral link berhasil disalin.', 'success');
      setTimeout(() => setCopiedReferral(false), 1800);
    } catch {
      showToast('Referral Link', referralLink, 'info');
    }
  };

  // Production lock history comes only from authenticated server state.
  const lockHistoryItems = locks
    .filter((item) => item.durationDays === selectedDurationFilter)
    .map((item) => ({
      id: item.id,
      badge: `${item.durationDays}D LOCK`,
      amountUsdt: item.amount,
      yieldRate: `+${Math.max(0, (item.multiplier - 1) * 100).toFixed(2)}%`,
      startedDate: new Date(item.startDate).toLocaleDateString(),
      statusText: item.status === 'locked'
        ? `LOCKED • ${Math.max(0, Math.ceil((item.endDate - Date.now()) / 86400000))}D REMAINING`
        : 'UNLOCKED',
      statusColor: item.status === 'locked' ? 'text-amber-400' : 'text-slate-500',
    }));

  const loadTransactions = async () => {
    const token = localStorage.getItem('sys_stream_auth_token');
    if (!token) return;
    setLoadingTransactions(true);
    try {
      const r = await fetch('/api/transactions', { headers: { Authorization: `Bearer ${token}` } });
      const data = await r.json().catch(() => ({}));
      if (data?.success) setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) void loadTransactions();
  }, [isLoggedIn, user.id]);

  const handleClaimBonus = async () => {
    setClaimingBonus(true);
    try {
      await claimRegistrationBonus();
      await loadTransactions();
    } finally {
      setClaimingBonus(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      showToast('Withdrawal', 'Masukkan nominal penarikan yang valid.', 'error');
      return;
    }
    if (!withdrawAddress.trim()) {
      showToast('Withdrawal', 'Masukkan alamat wallet tujuan.', 'error');
      return;
    }
    if (amount > availableBalance) {
      showToast('Withdrawal', 'Saldo tersedia tidak mencukupi.', 'error');
      return;
    }
    const token = localStorage.getItem('sys_stream_auth_token');
    try {
      const r = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` },
        body: JSON.stringify({ amount, walletAddress: withdrawAddress.trim(), currency: 'USDT' }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data?.success) throw new Error(data?.error || 'Penarikan gagal.');
      showToast('Withdrawal', 'Permintaan penarikan berhasil dibuat dan menunggu proses.', 'success');
      setWithdrawOpen(false);
      setWithdrawAmount('');
      setWithdrawAddress('');
      await loadTransactions();
    } catch (e: any) {
      showToast('Withdrawal', e?.message || 'Penarikan gagal.', 'error');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const username = newUsernameInput.trim();
    const avatar = newAvatarInput.trim();

    if (!username) return;

    const saved = await updateProfile(username, avatar);
    if (saved) {
      setNewUsernameInput(username);
      setNewAvatarInput(avatar);
      setIsEditProfileModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060a14] text-white font-sans pb-24 selection:bg-cyan-500 selection:text-black">
      <div className="max-w-md mx-auto px-4 py-4 sm:py-6 space-y-6">
        {/* Top Header Bar matching Screenshot 2 */}
        <div className="flex items-center justify-between pt-2">
          {/* Settings Gear */}
          <button
            onClick={() => {
              sound.playClick();
              setIsEditProfileModalOpen(true);
            }}
            className="p-2.5 rounded-2xl bg-slate-900/80 border border-cyan-500/20 text-cyan-400 hover:text-white hover:border-cyan-400 transition-all cursor-pointer"
            title={t('Edit Profile & Avatar')}
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Futuristic Glowing Neon Title "Profile" */}
          <h1
            className="text-2xl font-black tracking-wider text-cyan-400 uppercase drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Profile
          </h1>

          {/* Notification Bell with Pink Dot */}
          <button
            onClick={() => {
              sound.playClick();
              showToast(t('Notifications'), t('No unread notifications at this time.'), 'info');
            }}
            className="relative p-2.5 rounded-2xl bg-slate-900/80 border border-cyan-500/20 text-cyan-400 hover:text-white transition-all cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-pink-500 rounded-full shadow-[0_0_6px_rgba(236,72,153,0.9)] animate-pulse" />
          </button>
        </div>

        {/* User Hero Section: Dual Neon Glowing Circular Avatar */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          {/* Avatar Container with Dual Neon Purple/Magenta Ring */}
          <div className="relative group cursor-pointer" onClick={() => setIsEditProfileModalOpen(true)}>
            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-purple-600 via-pink-500 to-cyan-400 shadow-[0_0_30px_rgba(168,85,247,0.5)]">
              <div className="w-full h-full rounded-full bg-slate-950 p-1 border-2 border-purple-500/80 overflow-hidden">
                <img
                  src={user.avatar || '/default-avatar.svg'}
                  alt={user.username}
                  className="w-full h-full rounded-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Camera / Edit Icon Badge */}
            <div className="absolute bottom-1 right-1 p-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg border border-slate-950 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
          </div>

          {/* Username & Verified Badge */}
          <div className="flex items-center gap-1.5 mt-1">
            <h2 className="text-xl sm:text-2xl font-black text-cyan-400 tracking-tight">
              {user.username || t('Guest')}
            </h2>
            <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>

          {/* Guest / Logged in indicator */}
          {!isLoggedIn ? (
            <button
              onClick={() => setLoginModalOpen(true)}
              className="mt-1 px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl text-xs font-bold text-white shadow"
            >
              Log In to Save Progress
            </button>
          ) : (
            <button
              onClick={logout}
              className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <LogOut className="w-3 h-3" /> Log Out
            </button>
          )}
        </div>

        {isLoggedIn && user.registrationBonusGranted && (
          <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-slate-950 to-cyan-500/10 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-emerald-400 font-black">Registration Bonus</div>
              <div className="text-2xl font-black text-white mt-1">Rp15.000</div>
              <div className="text-xs text-slate-400 mt-1">Bonus tersedia dan belum diklaim.</div>
            </div>
            <button disabled={claimingBonus} onClick={() => void handleClaimBonus()} className="px-5 py-3 rounded-2xl bg-emerald-400 text-slate-950 font-black hover:bg-emerald-300 disabled:opacity-50">
              {claimingBonus ? 'Processing...' : 'Claim Bonus'}
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-cyan-500/20 bg-slate-950 p-4">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Available Balance</div>
            <div className="text-xl font-black text-cyan-300 mt-1">{availableBalance.toFixed(2)} USDT</div>
          </div>
          <button onClick={() => setWithdrawOpen(true)} className="rounded-2xl border border-amber-500/30 bg-slate-950 p-4 text-left hover:border-amber-400">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Wallet</div>
            <div className="text-xl font-black text-amber-300 mt-1">Withdraw</div>
            <div className="text-[10px] text-slate-500 mt-1">Ajukan penarikan USDT</div>
          </button>
        </div>

        {/* REFERRAL + EVENT STATUS */}
        {isLoggedIn && (
          <div className="space-y-3">
            <div className="relative overflow-hidden bg-slate-950/90 border border-purple-500/30 rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-purple-400">Referral Link</div>
                  <div className="text-[11px] text-slate-500 mt-1">Bagikan link ini untuk mengundang user baru.</div>
                </div>
                <span className="text-[10px] font-mono text-cyan-400">{user.referralCode || 'GENERATING...'}</span>
              </div>
              <div className="flex gap-2">
                <input readOnly value={referralLink} className="min-w-0 flex-1 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono" />
                <button onClick={copyReferralLink} disabled={!referralLink} className="px-3 rounded-xl bg-purple-600 text-white font-bold disabled:opacity-40" title="Copy referral link">
                  {copiedReferral ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                {referralLink && <a href={referralLink} target="_blank" rel="noreferrer" className="px-3 rounded-xl border border-slate-700 flex items-center justify-center text-cyan-400"><ExternalLink className="w-4 h-4" /></a>}
              </div>
            </div>

            <div className="bg-slate-950/90 border border-cyan-500/20 rounded-3xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm"><CalendarDays className="w-4 h-4" /> Event Participation Status</div>
              {eventStatuses.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-500">Belum ada event yang diikuti.</div>
              ) : (
                <div className="space-y-2">
                  {eventStatuses.map((event) => (
                    <div key={String(event.eventId)} className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                      <div className="min-w-0"><div className="text-sm font-bold text-white truncate">{event.eventName}</div><div className="text-[10px] text-slate-500 mt-1">{event.joinedAt ? new Date(Number(event.joinedAt)).toLocaleString() : ''}</div></div>
                      <span className="shrink-0 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-black text-cyan-400">{String(event.status || 'JOINED').replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-black text-white">Transaction History</div>
              <div className="text-[10px] text-slate-500">Deposit, withdrawal, lock, reward & bonus</div>
            </div>
            <button onClick={() => void loadTransactions()} className="text-xs text-cyan-400 hover:text-white">Refresh</button>
          </div>
          {loadingTransactions ? <div className="text-xs text-slate-500 py-5 text-center">Loading...</div> :
            transactions.length === 0 ? <div className="text-xs text-slate-500 py-5 text-center">Belum ada transaksi.</div> :
            <div className="space-y-2">{transactions.slice(0,20).map((tx:any) => (
              <div key={String(tx.id)} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-900 border border-slate-800 p-3">
                <div className="min-w-0"><div className="text-xs font-bold text-white">{String(tx.type || 'TRANSACTION').replace(/_/g,' ')}</div><div className="text-[10px] text-slate-500">{tx.createdAt ? new Date(tx.createdAt).toLocaleString() : ''}</div></div>
                <div className={Number(tx.amount) >= 0 ? 'text-emerald-400 font-black text-xs' : 'text-rose-400 font-black text-xs'}>{Number(tx.amount) >= 0 ? '+' : ''}{Number(tx.amount).toFixed(4)} USDT</div>
              </div>
            ))}</div>}
        </div>

        {/* LOCKED BALANCE CARD matching Screenshot 2 */
        <div className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-[#060e1d] to-[#040813] border-2 border-cyan-500/40 rounded-3xl p-6 shadow-[0_0_30px_rgba(6,182,212,0.15)] space-y-4">
          {/* Header Row */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <Lock className="w-4 h-4" />
              <span>{t('Locked Balance')}</span>
            </div>
            <button
              onClick={() =>
                showToast(
                  'Locked Balance Policy',
                  'Locked USDT earns passive daily yield (10% 30d, 15% 60d, 20% 90d) and unlocks daily blind box claims.',
                  'info'
                )
              }
              className="text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          {/* Huge Glowing Cyan Amount */}
          <div>
            <div className="text-4xl sm:text-5xl font-black font-mono text-cyan-400 tracking-tight drop-shadow-[0_0_16px_rgba(6,182,212,0.6)]">
              {totalLocked.toFixed(2)} USDT
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Locked • Earns passive yield
            </div>
          </div>

          {/* Bright Cyan "Deposit Crypto" Button */}
          <button
            onClick={() => {
              sound.playClick();
              setDepositModalOpen(true);
            }}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-black text-base rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Diamond className="w-5 h-5 fill-slate-950" />
            <span>{t('Deposit Crypto')}</span>
          </button>
        </div>

        {/* LOCK HISTORY SECTION matching Screenshot 2 */}
        <div className="space-y-3 pt-2">
          {/* Header */}
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <Clock className="w-4 h-4" />
            <span>{t('Lock History')}</span>
          </div>

          {/* Filter Tabs: 30 DAYS, 60 DAYS, 90 DAYS */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
            {[30, 60, 90].map((days) => (
              <button
                key={days}
                onClick={() => {
                  sound.playClick();
                  setSelectedDurationFilter(days as 30 | 60 | 90);
                }}
                className={`py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                  selectedDurationFilter === days
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {days} DAYS
              </button>
            ))}
          </div>

          {/* Lock History Cards */}
          <div className="space-y-2.5">
            {lockHistoryItems.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-slate-950/80 border border-slate-800 hover:border-cyan-500/30 rounded-2xl transition-all space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono">
                      {item.badge}
                    </span>
                    <span className="font-mono font-black text-white text-base">
                      {item.amountUsdt.toFixed(2)} USDT
                    </span>
                  </div>

                  <span className={`text-[10px] font-mono font-bold ${item.statusColor}`}>
                    {item.statusText}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400">
                  Yield: <span className="text-slate-300 font-bold">{item.yieldRate}</span> • Started {item.startedDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {withdrawOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-[#080d1a] border border-amber-500/30 p-6 space-y-4">
            <div className="flex justify-between"><h3 className="font-black text-lg">Withdraw USDT</h3><button onClick={() => setWithdrawOpen(false)}><X className="w-5 h-5"/></button></div>
            <div className="text-xs text-slate-500">Available: <span className="text-cyan-300 font-bold">{availableBalance.toFixed(4)} USDT</span></div>
            <input type="number" min="0" step="0.0001" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="Amount USDT" className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-sm outline-none focus:border-amber-400"/>
            <input value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} placeholder="USDT wallet address" className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-sm outline-none focus:border-amber-400"/>
            <button onClick={() => void handleWithdraw()} className="w-full py-3 rounded-xl bg-amber-400 text-slate-950 font-black">Submit Withdrawal</button>
          </div>
        </div>
      )}

      {/* EDIT PROFILE & AVATAR PICKER MODAL */
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#080d1a] border-2 border-purple-500/40 rounded-3xl p-6 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">{t('Edit Profile & Avatar')}</h3>
              </div>
              <button
                onClick={() => setIsEditProfileModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              {/* Username Input */}
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">
                  {t('Display Username')}
                </label>
                <input
                  type="text"
                  value={newUsernameInput}
                  onChange={(e) => setNewUsernameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              {/* User Storage Upload Only */}
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-2">
                  {t('Profile Photo')}
                </label>
                <label className="w-full min-h-32 rounded-2xl border-2 border-dashed border-slate-700 hover:border-cyan-400 bg-slate-950 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors overflow-hidden">
                  {newAvatarInput ? (
                    <img src={newAvatarInput} alt="Profile preview" className="w-24 h-24 rounded-full object-cover border-2 border-cyan-400" />
                  ) : (
                    <Upload className="w-8 h-8 text-slate-500" />
                  )}
                  <span className="text-xs font-bold text-slate-300">{newAvatarInput ? t('Change photo from device') : t('Upload photo from device')}</span>
                  <span className="text-[10px] text-slate-500">JPG, PNG, WEBP • photo stays from your device storage</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) {
                        showToast('Photo too large', 'Maximum profile photo size is 5 MB.', 'error');
                        e.currentTarget.value = '';
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => setNewAvatarInput(String(reader.result || ''));
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-extrabold rounded-xl shadow-md"
                >
                  {t('Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      <CryptoDepositModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
      />
    </div>
  );
}
