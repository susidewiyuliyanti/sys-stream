import React, { useState, useEffect } from 'react';
import { VIPHostAccount, UserProfile, BannedUserAccount } from '../types';
import { MemberBadge } from './MemberBadge';
import { isOwnerUser } from '../utils/memberBadge';
import {
  OWNER_EMAIL,
  addVipHostAccount,
  removeVipHostAccount,
  subscribeToVipHosts,
  banUserAccount,
  unbanUserAccount,
  deleteUserPermanently,
  subscribeToBannedUsers,
  subscribeToAllUsers
} from '../services/firebase';
import {
  Crown,
  UserPlus,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Mail,
  Users,
  Loader2,
  Ban,
  ShieldAlert,
  UserX,
  Search,
  Lock,
  Unlock,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface VipHostManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserProfile: UserProfile | null;
}

export const VipHostManagerModal: React.FC<VipHostManagerModalProps> = ({
  isOpen,
  onClose,
  currentUserProfile
}) => {
  const [activeTab, setActiveTab] = useState<'vip' | 'banned' | 'users'>('vip');
  
  // Data state
  const [vipList, setVipList] = useState<VIPHostAccount[]>([]);
  const [bannedList, setBannedList] = useState<BannedUserAccount[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  
  // Forms state
  const [newEmail, setNewEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [planTypeInput, setPlanTypeInput] = useState<'1_month' | '3_months' | '1_year' | 'lifetime'>('1_year');
  const [banEmailInput, setBanEmailInput] = useState('');
  const [banReasonInput, setBanReasonInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Status & loading
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Subscribe to realtime VIP host list, Banned list, and All users
  useEffect(() => {
    if (!isOpen) return;

    const unsubVip = subscribeToVipHosts((hosts) => setVipList(hosts));
    const unsubBanned = subscribeToBannedUsers((banned) => setBannedList(banned));
    const unsubUsers = subscribeToAllUsers((users) => setAllUsers(users));

    return () => {
      unsubVip();
      unsubBanned();
      unsubUsers();
    };
  }, [isOpen]);

  // Only susidewiyuliyanti@gmail.com can open and manage this modal
  if (!isOpen || !isOwnerUser(currentUserProfile?.email)) return null;

  // 1. Add VIP Account
  const handleAddVip = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newEmail.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid email address!' });
      return;
    }

    if (cleanEmail === OWNER_EMAIL.toLowerCase()) {
      setStatusMessage({ type: 'error', text: 'That email belongs to Primary Owner (already active permanently).' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      await addVipHostAccount(
        cleanEmail,
        currentUserProfile?.email || OWNER_EMAIL,
        notes.trim() || `Manual VIP Member (${planTypeInput})`,
        planTypeInput
      );

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });

      const tierName =
        planTypeInput === '1_month'
          ? 'VIP (1 Month - Blue)'
          : planTypeInput === '3_months'
          ? 'VIP (3 Months - Silver)'
          : planTypeInput === '1_year'
          ? 'SULTAN (1 Year - Gold)'
          : 'SULTAN VIP Permanent (Gold)';

      setStatusMessage({
        type: 'success',
        text: `Success! Account ${cleanEmail} has been activated as ${tierName}.`
      });
      setNewEmail('');
      setNotes('');
    } catch (err: any) {
      console.error('Failed to add VIP host:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to add VIP account. Please check internet connection.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 1b. Change / Manage Manual VIP Member Tier
  const handleUpdateTier = async (email: string, planType: '1_month' | '3_months' | '1_year' | 'lifetime') => {
    if (isOwnerUser(email)) {
      alert('Primary Owner account is always permanent Sultan status.');
      return;
    }
    setIsLoading(true);
    setStatusMessage(null);
    try {
      await addVipHostAccount(
        email,
        currentUserProfile?.email || OWNER_EMAIL,
        `Updated to ${planType} by Owner`,
        planType
      );
      const tierName =
        planType === '1_month'
          ? 'VIP (1 Month - Blue)'
          : planType === '3_months'
          ? 'VIP (3 Months - Silver)'
          : planType === '1_year'
          ? 'Sultan (1 Year - Gold)'
          : 'Sultan VIP Permanent (Gold)';

      setStatusMessage({
        type: 'success',
        text: `Successfully updated VIP tier for account ${email} to: ${tierName}.`
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to update VIP tier.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Revoke VIP Access
  const handleRemoveVip = async (email: string) => {
    if (email.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
      alert('Primary Owner account cannot be revoked!');
      return;
    }

    const confirmRemove = window.confirm(
      `Are you sure you want to revoke Sultan VIP Host access from "${email}"?`
    );
    if (!confirmRemove) return;

    setIsLoading(true);
    try {
      await removeVipHostAccount(email);
      setStatusMessage({
        type: 'success',
        text: `Sultan VIP Host access for ${email} has been revoked successfully.`
      });
    } catch (err: any) {
      console.error('Failed to remove VIP host:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to revoke account access.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Ban User / Email (Owner susidewiyuliyanti@gmail.com only)
  const handleBanUser = async (e?: React.FormEvent, targetEmail?: string) => {
    if (e) e.preventDefault();
    const emailToBan = (targetEmail || banEmailInput).trim().toLowerCase();

    if (!emailToBan || !emailToBan.includes('@')) {
      setStatusMessage({ type: 'error', text: 'The email address to ban is invalid.' });
      return;
    }

    if (emailToBan === OWNER_EMAIL.toLowerCase()) {
      alert('Primary Owner account cannot be banned!');
      return;
    }

    const reason = banReasonInput.trim() || 'Banned by Primary Owner susidewiyuliyanti@gmail.com';
    const confirmBan = window.confirm(
      `WARNING: Are you sure you want to BAN account:\n"${emailToBan}"?\n\nThe user will not be able to access the application at all.`
    );
    if (!confirmBan) return;

    setIsLoading(true);
    setStatusMessage(null);

    try {
      await banUserAccount(emailToBan, reason, currentUserProfile?.email || OWNER_EMAIL);
      setStatusMessage({
        type: 'success',
        text: `Success! Account ${emailToBan} has been officially banned.`
      });
      setBanEmailInput('');
      setBanReasonInput('');
    } catch (err: any) {
      console.error('Failed to ban user:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to ban user.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Unban User
  const handleUnbanUser = async (email: string) => {
    const confirmUnban = window.confirm(`Unban account "${email}"?`);
    if (!confirmUnban) return;

    setIsLoading(true);
    setStatusMessage(null);

    try {
      await unbanUserAccount(email);
      setStatusMessage({
        type: 'success',
        text: `Account ${email} unbanned successfully. User can now log in again.`
      });
    } catch (err: any) {
      console.error('Failed to unban user:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to unban user.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Delete User Permanently from Firestore (Owner susidewiyuliyanti@gmail.com only)
  const handleDeleteUser = async (email: string) => {
    if (email.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
      alert('Primary Owner account cannot be deleted!');
      return;
    }

    const confirmDelete = window.confirm(
      `PERMANENT DELETION!\n\nAre you sure you want to PERMANENTLY DELETE account:\n"${email}" from the Firestore database?\n\nThis action cannot be undone.`
    );
    if (!confirmDelete) return;

    setIsLoading(true);
    setStatusMessage(null);

    try {
      await deleteUserPermanently(email);
      setStatusMessage({
        type: 'success',
        text: `Account ${email} has been permanently deleted from the system.`
      });
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to delete user.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered users list
  const filteredUsers = allUsers.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.displayName && u.displayName.toLowerCase().includes(q)) ||
      (u.subscriptionPlan && u.subscriptionPlan.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#0e1422] border border-amber-500/40 p-5 sm:p-7 shadow-2xl shadow-amber-500/10 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-black shadow-lg shadow-amber-500/30">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
                  VIP & Streamer Account Management Panel
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase">
                  Owner: {OWNER_EMAIL}
                </span>
              </div>
              <p className="text-xs text-white/60">
                Primary Owner Privileges: Manage Sultan VIP Hosts, Banned Emails, and User Accounts.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-4 pb-2 border-b border-white/10">
          <button
            onClick={() => {
              setActiveTab('vip');
              setStatusMessage(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'vip'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-white/5 hover:bg-white/10 text-white/70'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>Sultan VIP Host ({1 + vipList.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('banned');
              setStatusMessage(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'banned'
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                : 'bg-white/5 hover:bg-white/10 text-white/70'
            }`}
          >
            <Ban className="w-4 h-4" />
            <span>Banned ({bannedList.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('users');
              setStatusMessage(null);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'users'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                : 'bg-white/5 hover:bg-white/10 text-white/70'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>All Users ({allUsers.length})</span>
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto pr-1 py-4 space-y-4 flex-1 custom-scrollbar">
          {/* Status Notification Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl flex items-start gap-2.5 text-xs font-semibold ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* TAB 1: SULTAN VIP HOST */}
          {activeTab === 'vip' && (
            <div className="space-y-4">
              {/* Form Tambah Akun VIP Baru */}
              <form
                onSubmit={handleAddVip}
                className="p-4 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-amber-500/30 space-y-3"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                  <UserPlus className="w-4 h-4" />
                  <span>Add & Manage VIP Member Manually</span>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                    <input
                      type="email"
                      required
                      placeholder="Enter Google Email (e.g., streamer@gmail.com)"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-amber-400 transition-all font-mono"
                    />
                  </div>

                  {/* Pilihan Paket / Tier VIP */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-white/70 block">
                      Select VIP Member Tier & Validity:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setPlanTypeInput('1_month')}
                        className={`p-2 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                          planTypeInput === '1_month'
                            ? 'bg-blue-600/30 border-blue-400 text-white shadow-md shadow-blue-500/20'
                            : 'bg-black/40 border-white/10 text-white/60 hover:border-white/20'
                        }`}
                      >
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-600 text-white text-[9px] font-black w-fit">
                          VIP BLUE
                        </span>
                        <span className="text-[11px] font-bold text-white">1 Month</span>
                        <span className="text-[9px] text-white/50">Active for 30 Days</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPlanTypeInput('3_months')}
                        className={`p-2 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                          planTypeInput === '3_months'
                            ? 'bg-slate-300/20 border-slate-200 text-white shadow-md shadow-slate-300/20'
                            : 'bg-black/40 border-white/10 text-white/60 hover:border-white/20'
                        }`}
                      >
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-gradient-to-r from-slate-200 to-slate-400 text-slate-950 text-[9px] font-black w-fit">
                          VIP SILVER
                        </span>
                        <span className="text-[11px] font-bold text-white">3 Months</span>
                        <span className="text-[9px] text-white/50">Active for 90 Days</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPlanTypeInput('1_year')}
                        className={`p-2 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                          planTypeInput === '1_year'
                            ? 'bg-amber-500/25 border-yellow-300 text-white shadow-md shadow-amber-500/20'
                            : 'bg-black/40 border-white/10 text-white/60 hover:border-white/20'
                        }`}
                      >
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 text-[9px] font-black w-fit">
                          SULTAN GOLD
                        </span>
                        <span className="text-[11px] font-bold text-white">1 Year</span>
                        <span className="text-[9px] text-white/50">Active for 365 Days</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPlanTypeInput('lifetime')}
                        className={`p-2 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                          planTypeInput === 'lifetime'
                            ? 'bg-amber-500/30 border-amber-400 text-white shadow-md shadow-amber-500/20'
                            : 'bg-black/40 border-white/10 text-white/60 hover:border-white/20'
                        }`}
                      >
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 text-[9px] font-black w-fit">
                          SULTAN PERMANENT
                        </span>
                        <span className="text-[11px] font-bold text-white">Lifetime</span>
                        <span className="text-[9px] text-white/50">Unlimited Duration</span>
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Notes / Host Name (Optional, e.g.: Studio TikTok Host 2)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-amber-400 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing VIP Access...</span>
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4" />
                      <span>
                        Save & Activate VIP Member (
                        {planTypeInput === '1_month'
                          ? '1 Month - VIP Blue'
                          : planTypeInput === '3_months'
                          ? '3 Months - VIP Silver'
                          : planTypeInput === '1_year'
                          ? '1 Year - Sultan Gold'
                          : 'Sultan Permanent'}
                        )
                      </span>
                    </>
                  )}
                </button>
              </form>

              {/* List Akun VIP Terdaftar */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-white/80">
                  <div className="flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>Active Sultan & VIP Host List ({1 + vipList.length})</span>
                  </div>
                  <span className="text-[11px] text-white/40">Directly managed by Owner</span>
                </div>

                <div className="space-y-2">
                  {/* Primary Owner Card */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent border border-amber-500/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-black text-sm">
                        👑
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white font-mono">
                            {OWNER_EMAIL}
                          </span>
                          <MemberBadge
                            userProfile={{
                              uid: 'owner',
                              email: OWNER_EMAIL,
                              isSubscribed: true,
                              isLifetime: true,
                              role: 'admin',
                              subscriptionPlan: 'Sultan Emas Permanen'
                            }}
                            size="xs"
                          />
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/30 text-yellow-300 border border-amber-400/50 text-[9px] font-black uppercase">
                            Primary Owner
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-white/50 mt-0.5">
                          <span className="text-emerald-400 font-semibold">● Permanent Lifetime</span>
                          <span>•</span>
                          <span>Super Admin Sultan</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-amber-300">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Permanent</span>
                    </div>
                  </div>

                  {/* Whitelisted VIP Accounts (Manual Added) */}
                  {vipList.map((host) => {
                    const hostProfile: UserProfile = {
                      uid: host.email,
                      email: host.email,
                      displayName: host.email.split('@')[0],
                      photoURL: '',
                      isSubscribed: true,
                      subscriptionPlan: host.plan,
                      subscriptionExpiresAt: host.expiresAt || 'LIFETIME',
                      isLifetime: host.planType === 'lifetime' || (!host.planType && host.plan.includes('Permanen')),
                      role: host.role || 'host',
                      walletBalance: 0,
                      createdAt: host.addedAt || new Date().toISOString()
                    };

                    return (
                      <div
                        key={host.email}
                        className="p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-white flex items-center justify-center font-black text-xs shrink-0">
                            VIP
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-white font-mono">
                                {host.email}
                              </span>
                              <MemberBadge userProfile={hostProfile} size="xs" />
                              <span className="text-[10px] font-semibold text-white/70">
                                ({host.plan})
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-white/50 mt-0.5 flex-wrap">
                              <span className="text-emerald-400 font-semibold">
                                {host.expiresAt === 'LIFETIME' || !host.expiresAt
                                  ? '● Permanent Lifetime'
                                  : `● Until ${new Date(host.expiresAt).toLocaleDateString('en-US')}`}
                              </span>
                              {host.notes && (
                                <>
                                  <span>•</span>
                                  <span className="text-white/60 italic">{host.notes}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          {/* Owner Quick Tier Management */}
                          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                            <span className="text-[9px] text-white/40 px-1 font-bold">CHANGE:</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateTier(host.email, '1_month')}
                              className="px-1.5 py-0.5 rounded bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white text-[9px] font-bold transition-all"
                              title="Change to 1 Month Member (VIP Blue)"
                            >
                              1 Mo
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateTier(host.email, '3_months')}
                              className="px-1.5 py-0.5 rounded bg-slate-300/30 hover:bg-slate-200 text-slate-300 hover:text-slate-900 text-[9px] font-bold transition-all"
                              title="Change to 3 Months Member (VIP Silver)"
                            >
                              3 Mo
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateTier(host.email, '1_year')}
                              className="px-1.5 py-0.5 rounded bg-amber-500/30 hover:bg-amber-400 text-amber-300 hover:text-slate-950 text-[9px] font-bold transition-all"
                              title="Change to 1 Year Member (Sultan Gold)"
                            >
                              1 Yr
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateTier(host.email, 'lifetime')}
                              className="px-1.5 py-0.5 rounded bg-yellow-500/30 hover:bg-yellow-400 text-yellow-300 hover:text-slate-950 text-[9px] font-bold transition-all"
                              title="Change to Sultan Permanent"
                            >
                              Sultan
                            </button>
                          </div>

                          {/* Tombol Banned Akun */}
                          <button
                            onClick={() => handleBanUser(undefined, host.email)}
                            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/25 text-red-300 border border-red-500/30 transition-all"
                            title="Ban this user/email"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                          {/* Tombol Hapus Hak Akses */}
                          <button
                            onClick={() => handleRemoveVip(host.email)}
                            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white/60 hover:text-red-400 transition-all"
                            title="Revoke VIP Host Access"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {vipList.length === 0 && (
                    <div className="p-4 rounded-xl border border-dashed border-white/15 text-center text-xs text-white/40">
                      No manual members registered yet. Enter a Google email in the form above to grant VIP access (1 Month, 3 Months, 1 Year, or Sultan).
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BANNED USERS / EMAILS */}
          {activeTab === 'banned' && (
            <div className="space-y-4">
              {/* Form Tambah Banned Manual */}
              <form
                onSubmit={(e) => handleBanUser(e)}
                className="p-4 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-950/20 border border-red-500/30 space-y-3"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>Block / Ban New User or Email</span>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                    <input
                      type="email"
                      required
                      placeholder="Enter email to ban (e.g., spammer@gmail.com)"
                      value={banEmailInput}
                      onChange={(e) => setBanEmailInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-red-400 transition-all font-mono"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Ban Reason (e.g., Livestream violation / spam)"
                    value={banReasonInput}
                    onChange={(e) => setBanReasonInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-red-400 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Ban className="w-4 h-4" />
                  <span>Ban User / Email Now</span>
                </button>
              </form>

              {/* List Banned Accounts */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-white/80">
                  <div className="flex items-center gap-1.5">
                    <Ban className="w-4 h-4 text-red-400" />
                    <span>Banned Account List ({bannedList.length})</span>
                  </div>
                  <span className="text-[11px] text-red-400 font-mono">Access automatically rejected</span>
                </div>

                <div className="space-y-2">
                  {bannedList.map((ban) => (
                    <div
                      key={ban.email}
                      className="p-3.5 rounded-2xl bg-red-950/20 border border-red-500/30 flex items-center justify-between gap-3 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center font-black text-xs">
                          <Ban className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white font-mono">
                              {ban.email}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-red-500/30 text-red-300 border border-red-500/50 text-[9px] font-black uppercase">
                              Banned
                            </span>
                          </div>
                          <div className="text-[11px] text-red-300/70 mt-0.5">
                            <span>Reason: {ban.reason || 'Banned by Owner susidewiyuliyanti@gmail.com'}</span>
                            <span className="text-white/40 ml-2">
                              ({new Date(ban.bannedAt).toLocaleDateString('en-US')})
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUnbanUser(ban.email)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1 transition-all"
                          title="Unban account"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Unban</span>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(ban.email)}
                          className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30 transition-all"
                          title="Delete account permanently from Firestore"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {bannedList.length === 0 && (
                    <div className="p-5 rounded-xl border border-dashed border-white/15 text-center text-xs text-white/40">
                      No accounts are currently banned. All users have clean status.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ALL REGISTERED USERS (HAPUS & BANNED DENGAN CEPAT) */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Search Box */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search user by email, name, or plan status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-cyan-400 transition-all"
                />
              </div>

              {/* Users List */}
              <div className="space-y-2">
                {filteredUsers.map((user) => {
                  const isUserOwner = user.email.toLowerCase() === OWNER_EMAIL.toLowerCase();
                  const isUserBanned = bannedList.some((b) => b.email.toLowerCase() === user.email.toLowerCase()) || user.isBanned;

                  return (
                    <div
                      key={user.uid || user.email}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                        isUserOwner
                          ? 'bg-amber-500/10 border-amber-500/30'
                          : isUserBanned
                          ? 'bg-red-950/20 border-red-500/30'
                          : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover border border-white/20 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold text-xs shrink-0">
                            {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-white truncate max-w-[200px]">
                              {user.displayName || 'User'}
                            </span>
                            <span className="text-xs font-mono text-white/60 truncate max-w-[200px]">
                              {user.email}
                            </span>
                            <MemberBadge userProfile={user} size="xs" />
                            {isUserOwner && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[9px] font-black uppercase">
                                OWNER
                              </span>
                            )}
                            {isUserBanned && (
                              <span className="px-1.5 py-0.5 rounded bg-red-500/30 text-red-300 border border-red-500/40 text-[9px] font-black uppercase">
                                BANNED
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-white/50 mt-0.5">
                            <span className={user.isSubscribed ? 'text-emerald-400 font-semibold' : 'text-white/50'}>
                              {user.isSubscribed ? `● Active: ${user.subscriptionPlan}` : '○ Free Member'}
                            </span>
                            {user.isLifetime && (
                              <span className="text-amber-300 font-bold">• Permanent</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons for Super Owner */}
                      {!isUserOwner && (
                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                          {/* Owner quick grant VIP tier */}
                          <div className="hidden lg:flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                            <button
                              type="button"
                              onClick={() => handleUpdateTier(user.email, '1_month')}
                              className="px-1.5 py-0.5 rounded bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white text-[9px] font-bold transition-all"
                              title="Make VIP 1 Month (Blue)"
                            >
                              +1 Mo
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateTier(user.email, '3_months')}
                              className="px-1.5 py-0.5 rounded bg-slate-300/30 hover:bg-slate-200 text-slate-300 hover:text-slate-900 text-[9px] font-bold transition-all"
                              title="Make VIP 3 Months (Silver)"
                            >
                              +3 Mo
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateTier(user.email, '1_year')}
                              className="px-1.5 py-0.5 rounded bg-amber-500/30 hover:bg-amber-400 text-amber-300 hover:text-slate-950 text-[9px] font-bold transition-all"
                              title="Make Sultan 1 Year (Gold)"
                            >
                              +1 Yr
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateTier(user.email, 'lifetime')}
                              className="px-1.5 py-0.5 rounded bg-yellow-500/30 hover:bg-yellow-400 text-yellow-300 hover:text-slate-950 text-[9px] font-bold transition-all"
                              title="Make Sultan Permanent"
                            >
                              +Sultan
                            </button>
                          </div>

                          {isUserBanned ? (
                            <button
                              onClick={() => handleUnbanUser(user.email)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1"
                              title="Unban user"
                            >
                              <Unlock className="w-3 h-3" />
                              <span>Unban</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBanUser(undefined, user.email)}
                              className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-[11px] font-bold flex items-center gap-1"
                              title="Ban this account"
                            >
                              <Ban className="w-3 h-3" />
                              <span>Banned</span>
                            </button>
                          )}

                          {/* Tombol Hapus Permanen */}
                          <button
                            onClick={() => handleDeleteUser(user.email)}
                            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-600 text-white/50 hover:text-white transition-all"
                            title="Delete account permanently from Firestore"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <div className="p-4 rounded-xl border border-dashed border-white/15 text-center text-xs text-white/40">
                    No users matching search "{searchQuery}".
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
          <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Full Authority: susidewiyuliyanti@gmail.com</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
