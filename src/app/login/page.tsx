import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../lib/sound';
import { TERMS_VERSION } from '../terms/page';
import { useLanguage } from '../../i18n';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Wallet,
  Shield,
  Fingerprint,
  CheckCircle,
} from 'lucide-react';

import { BrowserProvider, HDNodeWallet } from 'ethers';

declare global {
  interface Window {
    ethereum?: {
      request(args: { method: string; params?: unknown[] }): Promise<unknown>;
    };
  }
}

interface Props {
  navigate?: (path: string) => void;
}

export default function LoginPage({ navigate }: Props) {
  const { user } = useGame();
  const { t } = useLanguage();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationNotice, setVerificationNotice] = useState('');
  const [registerWallet, setRegisterWallet] = useState('');
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [generatedWallet, setGeneratedWallet] = useState<{ address: string; phrase: string } | null>(null);
  const [walletBackupConfirmed, setWalletBackupConfirmed] = useState(false);
  const [pendingRegistrationAuth, setPendingRegistrationAuth] = useState<{ token: string; user: any } | null>(null);
  const referralParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('ref') || '' : '';
  const returnParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('return') || '' : '';
  const postLoginPath = returnParam.startsWith('/') ? returnParam : '/dashboard';

  const generateRegistrationWallet = async () => {
    if (isSubmitting || !termsAccepted) return;
    setIsSubmitting(true);
    try {
      const newWallet = HDNodeWallet.createRandom();
      const registrationPassword = crypto.randomUUID() + crypto.randomUUID();
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: '',
          password: registrationPassword,
          termsAccepted: true,
          termsVersion: TERMS_VERSION,
          walletAddress: newWallet.address,
          ...(referralParam ? { referralCode: referralParam } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.token || !data?.user) {
        throw new Error(data?.error || t('Gagal membuat wallet baru.'));
      }
      setGeneratedWallet({
        address: newWallet.address,
        phrase: newWallet.mnemonic?.phrase || '',
      });
      setWalletBackupConfirmed(false);
      setPendingRegistrationAuth({ token: String(data.token), user: data.user });
      setVerificationNotice(t('Wallet baru berhasil dibuat. Simpan recovery phrase sebelum melanjutkan.'));
    } catch (error) {
      console.error('New wallet registration error:', error);
      window.alert(error instanceof Error ? error.message : t('Gagal membuat wallet baru.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeRegistration = () => {
    if (!pendingRegistrationAuth || !walletBackupConfirmed) return;
    localStorage.setItem('sys_stream_auth_token', pendingRegistrationAuth.token);
    localStorage.setItem('sys_stream_auth_user', JSON.stringify(pendingRegistrationAuth.user));
    localStorage.setItem('sys_stream_profile_cache', JSON.stringify({
      id: pendingRegistrationAuth.user.id,
      username: pendingRegistrationAuth.user.username || '',
      avatar: pendingRegistrationAuth.user.avatarUrl || '',
      referralCode: pendingRegistrationAuth.user.referralCode || '',
      walletAddress: pendingRegistrationAuth.user.walletAddress || generatedWallet?.address || '',
      registrationBonusIdr: Number(pendingRegistrationAuth.user.registrationBonusIdr || 0),
      registrationBonusGranted: Boolean(pendingRegistrationAuth.user.registrationBonusGranted),
    }));
    localStorage.setItem('sys_is_logged_in', 'true');
    if (postLoginPath === '/airdrop') {
      window.location.replace('https://airdrop.sysstreamer.asia/');
    } else {
      window.location.replace('/#' + postLoginPath);
    }
  };


  
const handleWalletAuth = async () => {
  if (isSubmitting) return;

  if (!window.ethereum) {
    window.alert(t('Install MetaMask atau wallet Web3 terlebih dahulu.'));
    return;
  }

  setIsSubmitting(true);

  try {
    const accounts = (await window.ethereum.request({
      method: "eth_requestAccounts",
    })) as string[];

    const wallet = String(accounts?.[0] || "").toLowerCase();
    if (!wallet) {
      throw new Error(t('Wallet address tidak ditemukan.'));
    }

    const nonceRes = await fetch("/api/auth/wallet/nonce", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet }),
    });

    const nonceData = await nonceRes.json().catch(() => ({}));
    if (!nonceRes.ok || !nonceData?.nonce) {
      throw new Error(nonceData?.error || t('Gagal membuat nonce wallet.'));
    }

    const message = "SYS STREAMER LOGIN\n\nNonce:" + String(nonceData.nonce);

    const signature = await window.ethereum.request({
      method: "personal_sign",
      params: [message, wallet],
    });

    const verifyRes = await fetch("/api/auth/wallet/verify", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet,
        signature,
        message,
      }),
    });

    const verifyData = await verifyRes.json().catch(() => ({}));

    if (!verifyRes.ok || !verifyData?.token || !verifyData?.user) {
      throw new Error(verifyData?.error || t('Verifikasi tanda tangan wallet gagal.'));
    }

    const token = String(verifyData.token);
    const serverUser = verifyData.user;

    // Persist the account identity BEFORE any navigation.
    // The wallet address is the canonical user identity for wallet-authenticated users.
    localStorage.setItem("sys_stream_auth_token", token);
    localStorage.setItem("sys_stream_auth_user", JSON.stringify(serverUser));
    localStorage.setItem("sys_stream_profile_cache", JSON.stringify({
      id: serverUser.id,
      username: serverUser.username || serverUser.displayName || serverUser.display_name || "",
      avatar: serverUser.avatarUrl || serverUser.avatar_url || "",
      referralCode: serverUser.referralCode || serverUser.referral_code || "",
      walletAddress: serverUser.walletAddress || serverUser.wallet_address || wallet,
      registrationBonusIdr: Number(serverUser.registrationBonusIdr ?? serverUser.registration_bonus_idr ?? 0),
      registrationBonusGranted: Boolean(serverUser.registrationBonusGranted ?? serverUser.registration_bonus_granted),
    }));
    localStorage.setItem("sys_is_logged_in", "true");

    // wallet/verify already creates the auth_sessions row and returns the
    // authenticated user. Do not perform a second session-sync request here.
    // That extra request can reject an otherwise valid wallet login and was the
    // source of the "session wallet belum berhasil disinkronkan" error.

    // Wallet login is already authenticated. Do not call the legacy login()
    // helper here because it performs another asynchronous auth refresh and can
    // race with navigation. Reload the authenticated dashboard directly.
    if (postLoginPath === "/airdrop") {
      window.location.replace("https://airdrop.sysstreamer.asia/");
    } else {
      window.location.replace(`/#${postLoginPath}`);
    }
  } catch (error) {
    console.error("Wallet login error:", error);
    window.alert(error instanceof Error ? error.message : t('Wallet login gagal.'));
  } finally {
    setIsSubmitting(false);
  }
};
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setIsSubmitting(true);
    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = authMode === 'login'
        ? { identifier: usernameInput.trim(), password: passwordInput }
        : { password: passwordInput, termsAccepted, termsVersion: TERMS_VERSION, walletAddress: registerWallet, ...(referralParam ? { referralCode: referralParam } : {}) };
      const res = await fetch(endpoint, { method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || t('Autentikasi gagal.'));
      }
      if (!data?.token || !data?.user) {
        throw new Error(t('Sesi autentikasi tidak diterima dari server.'));
      }

      // The login endpoint already creates the server auth session and shared
      // cookie. Persist the same server-authoritative identity before navigation.
      localStorage.setItem('sys_stream_auth_token', String(data.token));
      localStorage.setItem('sys_stream_auth_user', JSON.stringify(data.user));
      localStorage.setItem('sys_stream_profile_cache', JSON.stringify({
        id: data.user.id,
        username: data.user.username || data.user.displayName || data.user.display_name || usernameInput.trim(),
        avatar: data.user.avatarUrl || data.user.avatar_url || '',
        referralCode: data.user.referralCode || data.user.referral_code || '',
        walletAddress: data.user.walletAddress || data.user.wallet_address || '',
        registrationBonusIdr: Number(data.user.registrationBonusIdr ?? data.user.registration_bonus_idr ?? 0),
        registrationBonusGranted: Boolean(data.user.registrationBonusGranted ?? data.user.registration_bonus_granted),
      }));
      localStorage.setItem('sys_is_logged_in', 'true');

      // Force a fresh app bootstrap so the dashboard reads the authenticated
      // server session instead of racing the previous in-memory auth state.
      if (postLoginPath === '/airdrop') {
        window.location.replace('https://airdrop.sysstreamer.asia/');
      } else {
        window.location.replace(`/#${postLoginPath}`);
      }
    } catch (error) {
      console.error(error);
      window.alert(error instanceof Error ? error.message : t('Autentikasi gagal.'));
    } finally { setIsSubmitting(false); }
  };


 return (
    <div className="min-h-screen bg-[#060a14] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-cyan-500 selection:text-black">
      {/* Background Cyber Matrix Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Cyberpunk Glass Card matching Screenshot 1 */}
      <div className="relative w-full max-w-sm sm:max-w-md bg-[#080d1a]/90 backdrop-blur-2xl border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.25)] text-white">
        {/* Login / Register Pill Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-cyan-500/30 mb-6">
          <button
            type="button"
            onClick={() => { sound.playClick(); setAuthMode('login'); setTermsAccepted(false); }}
            className={`py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              authMode === 'login'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { sound.playClick(); setAuthMode('register'); setTermsAccepted(false); }}
            className={`py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              authMode === 'register'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Heading & Subtitle */}
        <div className="text-center mb-5">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {authMode === 'login' ? t('Welcome Back') : t('Create SYS Account')}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {t('Sign in to continue streaming and gaming')}
          </p>
        </div>

        {/* Wallet-native authentication */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authMode === 'login' ? (
            <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/5 p-4 text-center">
              <Wallet className="w-8 h-8 mx-auto text-cyan-300 mb-2" />
              <div className="text-sm font-black text-white">{t('Login dengan Wallet')}</div>
              <p className="mt-1 text-[11px] leading-5 text-slate-400">
                {t('Hubungkan MetaMask atau wallet EVM lain. Anda akan diminta menandatangani pesan untuk masuk.')}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-purple-500/25 bg-purple-500/5 p-4 text-center">
                <Wallet className="w-8 h-8 mx-auto text-purple-300 mb-2" />
                <div className="text-sm font-black text-white">{t('Buat Wallet Baru')}</div>
                <p className="mt-1 text-[11px] leading-5 text-slate-400">
                  {t('SYS STREAM akan membuat wallet baru langsung di perangkat ini. Tidak perlu email, username, atau password.')}
                </p>
              </div>

              <label className="flex items-start gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-3.5 cursor-pointer select-none">
                <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-0.5 w-4 h-4 rounded bg-slate-950 border-cyan-500 text-cyan-500" required />
                <span className="text-[11px] leading-5 text-slate-400">
                  {t('Saya menyetujui Terms & Conditions dan pembuatan wallet baru.')}
                </span>
              </label>

              {generatedWallet && (
                <div className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-4 space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-amber-300">{t('Simpan Recovery Phrase')}</div>
                  <p className="text-[10px] leading-4 text-amber-100/80">
                    {t('Recovery phrase hanya dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan phrase ini.')}
                  </p>
                  <div className="rounded-xl bg-slate-950 border border-amber-500/20 p-3">
                    <div className="text-[10px] text-slate-500 mb-1">Wallet Address</div>
                    <div className="font-mono text-[10px] text-cyan-300 break-all">{generatedWallet.address}</div>
                  </div>
                  <div className="rounded-xl bg-slate-950 border border-amber-500/20 p-3">
                    <div className="text-[10px] text-slate-500 mb-1">Recovery Phrase</div>
                    <div className="font-mono text-xs leading-5 text-white break-words select-all">{generatedWallet.phrase}</div>
                  </div>
                  <label className="flex items-start gap-2 text-[10px] text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={walletBackupConfirmed} onChange={(e) => setWalletBackupConfirmed(e.target.checked)} className="mt-0.5 w-4 h-4 rounded bg-slate-950 border-amber-500 text-amber-500" />
                    <span>{t('Saya sudah menyimpan recovery phrase dan memahami bahwa SYS STREAM tidak dapat memulihkannya.')}</span>
                  </label>
                </div>
              )}
              {verificationNotice && (
                <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-3 text-[11px] leading-5 text-cyan-200">{verificationNotice}</div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting || (authMode === 'register' && (!termsAccepted || Boolean(pendingRegistrationAuth && !walletBackupConfirmed)))}
            className="w-full py-3.5 mt-2 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> :
              authMode === 'login' ? t('LOGIN WITH WALLET') :
              pendingRegistrationAuth ? t('SAYA SUDAH MENYIMPAN — MASUK') : t('GENERATE NEW WALLET')}
          </button>
        </form>
        {authMode === 'register' && pendingRegistrationAuth && walletBackupConfirmed && (
          <button type="button" onClick={completeRegistration} className="w-full mt-3 py-3 rounded-2xl border border-cyan-500/40 text-cyan-300 text-xs font-black">
            {t('Lanjut ke Dashboard')}
          </button>
        )}

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-500">
            <span className="bg-[#080d1a] px-3">{t('or Connect with Crypto Wallet')}</span>
          </div>
        </div>

        {/* Production wallet authentication uses the server nonce/signature flow above. */}
        <button
          onClick={handleWalletAuth}
          type="button"
          className="w-full py-3 bg-slate-950/90 hover:bg-slate-900 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 font-bold text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <Wallet className="w-4 h-4 text-cyan-400" />
          <span>{t('Connect Wallet')}</span>
        </button>

        {/* Register Prompt */}
        <div className="text-center mt-4 text-xs text-slate-400">
          <span>Don't have an account? </span>
          <button
            type="button"
            onClick={() => { sound.playClick(); setAuthMode('register'); setTermsAccepted(false); }}
            className="text-purple-400 hover:text-purple-300 font-bold underline"
          >
            {t('Register Now')}
          </button>
        </div>

        {/* Security Footer Badges */}
        <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-slate-900 text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-cyan-400" /> Secured with Web3
          </span>
          <span className="flex items-center gap-1">
            <Fingerprint className="w-3.5 h-3.5 text-purple-400" /> Biometric Login Available
          </span>
        </div>
      </div>
    </div>
  );
}







  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    if (authMode === 'login') {
      await handleWalletAuth();
      return;
    }
    if (!generatedWallet) {
      await generateRegistrationWallet();
    }
  };


 return (
    <div className="min-h-screen bg-[#060a14] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-cyan-500 selection:text-black">
      {/* Background Cyber Matrix Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Cyberpunk Glass Card matching Screenshot 1 */}
      <div className="relative w-full max-w-sm sm:max-w-md bg-[#080d1a]/90 backdrop-blur-2xl border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.25)] text-white">
        {/* Login / Register Pill Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-cyan-500/30 mb-6">
          <button
            type="button"
            onClick={() => { sound.playClick(); setAuthMode('login'); setTermsAccepted(false); }}
            className={`py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              authMode === 'login'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { sound.playClick(); setAuthMode('register'); setTermsAccepted(false); }}
            className={`py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              authMode === 'register'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Heading & Subtitle */}
        <div className="text-center mb-5">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {authMode === 'login' ? t('Welcome Back') : t('Create SYS Account')}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {t('Sign in to continue streaming and gaming')}
          </p>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Username / Email */}
          {authMode === 'login' && (
          <div className="relative">
            <span className="absolute left-3.5 top-3.5 text-cyan-400">
              <User className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder={authMode === 'login' ? t('Username or Wallet') : t('Wallet is required for registration')}
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-cyan-500/30 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>
          )}

          {/* Password */}
          <div className="relative">
            <span className="absolute left-3.5 top-3.5 text-purple-400">
              <Lock className="w-4 h-4" />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={t('Password')}
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-slate-950/80 border border-purple-500/30 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-colors font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {authMode === 'register' && (
            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-3.5">
              <div className="text-[11px] font-bold text-purple-300 mb-2">{t('Wallet Identity')}</div>
              <button type="button" onClick={() => void connectRegistrationWallet()} disabled={walletConnecting}
                className="w-full rounded-xl border border-cyan-500/30 bg-slate-950/80 py-2.5 text-[11px] font-bold text-cyan-300 hover:text-white disabled:opacity-50">
                {walletConnecting ? t('CONNECTING WALLET...') : registerWallet ? `${t('Wallet Connected')}: ${registerWallet}` : t('Connect Wallet for Registration')}
              </button>
              <p className="mt-2 text-[10px] leading-5 text-slate-500">{t('Wallet ini akan menjadi identitas User ID dan referral link akun Anda.')}</p>
            </div>
          )}

          {/* Terms acceptance — required for new accounts */}
          {authMode === 'register' && (
            <label className="flex items-start gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-3.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded bg-slate-950 border-cyan-500 text-cyan-500 focus:ring-0 cursor-pointer shrink-0"
                required
              />
              <span className="text-[11px] leading-5 text-slate-400">
                I have read and agree to the{' '}
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); navigate?.('/terms'); }}
                  className="text-cyan-300 hover:text-cyan-200 underline font-bold"
                >
                  Terms &amp; Conditions
                </button>
                {' '}and understand that my acceptance will be recorded with the current Terms version.
              </span>
            </label>
          )}

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-slate-950 border-cyan-500 text-cyan-500 focus:ring-0 cursor-pointer"
              />
              <span className="text-[11px]">{t('Remember me')}</span>
            </label>
            <button
              type="button"
              onClick={() => sound.playClick()}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              {t('Forgot Password?')}
            </button>
          </div>

          {/* Glowing Neon Login Button */}
          <button
            type="submit"
            disabled={isSubmitting || (authMode === 'register' && (!termsAccepted || !registerWallet))}
            className="w-full py-3.5 mt-2 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{authMode === 'login' ? t('LOGIN') : t('CREATE ACCOUNT')}</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-500">
            <span className="bg-[#080d1a] px-3">{t('or Connect with Crypto Wallet')}</span>
          </div>
        </div>

        {/* Production wallet authentication uses the server nonce/signature flow above. */}
        <button
          onClick={handleWalletAuth}
          type="button"
          className="w-full py-3 bg-slate-950/90 hover:bg-slate-900 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 font-bold text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <Wallet className="w-4 h-4 text-cyan-400" />
          <span>{t('Connect Wallet')}</span>
        </button>

        {/* Register Prompt */}
        <div className="text-center mt-4 text-xs text-slate-400">
          <span>Don't have an account? </span>
          <button
            type="button"
            onClick={() => { sound.playClick(); setAuthMode('register'); setTermsAccepted(false); }}
            className="text-purple-400 hover:text-purple-300 font-bold underline"
          >
            {t('Register Now')}
          </button>
        </div>

        {/* Security Footer Badges */}
        <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-slate-900 text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-cyan-400" /> Secured with Web3
          </span>
          <span className="flex items-center gap-1">
            <Fingerprint className="w-3.5 h-3.5 text-purple-400" /> Biometric Login Available
          </span>
        </div>
      </div>
    </div>
  );
}








