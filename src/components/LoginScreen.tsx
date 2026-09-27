import React, { useState, useEffect } from 'react';
import {
  auth,
  loginWithGooglePopup,
  loginWithGoogleRedirect,
  getLoginResult,
  loginWithEmail,
  registerWithEmail,
  sendPasswordReset
} from '../lib/firebase';
import { SysLogo } from './SysLogo';
import { LoginLeaderboardModal } from './LoginLeaderboardModal';
import { TermsAndConditionsModal } from './TermsAndConditionsModal';

import {
  Crown,
  Trophy,
  ChevronRight,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  Gift,
  FileText,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';

interface LoginScreenProps {
  onViewPricing: () => void;
  onHostInstantLogin?: (customName?: string, customEmail?: string) => void;
  onLoginSuccess?: (profile?: any) => void;
  onOpenBlindBoxGame?: () => void;
}

interface LoginErrorInfo {
  code?: string;
  message: string;
  isUnauthorizedDomain?: boolean;
  domain?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onViewPricing,
  onLoginSuccess,
  onOpenBlindBoxGame,
}) => {
  // Auth Form State
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Mandatory Terms & Conditions Checkbox
  const [isTermsAccepted, setIsTermsAccepted] = useState<boolean>(false);
  const [termsError, setTermsError] = useState<string | null>(null);

  // Status & Error Messages
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loginMode, setLoginMode] = useState<'popup' | 'redirect' | 'email'>('popup');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorInfo, setErrorInfo] = useState<LoginErrorInfo | null>(null);
  const [copiedDomain, setCopiedDomain] = useState<boolean>(false);

  // Modals
  const [isTermsOpen, setIsTermsOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isForgotPassOpen, setIsForgotPassOpen] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotStatus, setForgotStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isForgotLoading, setIsForgotLoading] = useState<boolean>(false);

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';

  // 1. Handle getRedirectResult saat kembali dari Google Login redirect
  useEffect(() => {
    let isMounted = true;

    getLoginResult()
      .then((result) => {
        if (!isMounted) return;
        if (result && result.user) {
          setIsLoading(false);
          if (onLoginSuccess) {
            onLoginSuccess();
          } else {
            try {
              window.history.pushState(null, '', '/dashboard');
            } catch {}
          }
        }
      })
      .catch((err: any) => {
        if (!isMounted) return;
        console.error('Error handling redirect login result:', err);
        const errCode = err?.code || '';
        const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
        if (
          errCode === 'auth/unauthorized-domain' ||
          (err?.message && err.message.toLowerCase().includes('unauthorized domain'))
        ) {
          const msg = `Domain '${currentDomain}' is not authorized in Firebase Authentication. Please add this domain in Firebase Console > Authentication > Settings > Authorized domains.`;
          setLoginError(msg);
          setErrorInfo({
            code: 'auth/unauthorized-domain',
            isUnauthorizedDomain: true,
            domain: currentDomain,
            message: msg
          });
        } else {
          const msg = err?.message || 'Failed to process Google redirect authentication.';
          setLoginError(msg);
          setErrorInfo({
            code: errCode,
            message: msg,
            domain: currentDomain
          });
        }
      });

    // Pop up leaderboard tampilkan 5 detik setelah user berada di halaman log in
    const timer = setTimeout(() => {
      if (isMounted) setIsLeaderboardOpen(true);
    }, 5000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [onLoginSuccess]);

  // Validasi wajib ceklis Terms & Conditions
  const validateTerms = (): boolean => {
    if (!isTermsAccepted) {
      setTermsError('Harap centang ceklis Term & condition terlebih dahulu. Gagal log in atau daftar jika belum disetujui.');
      return false;
    }
    setTermsError(null);
    return true;
  };

  // Handler: Log In dengan Email & Password
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsAlreadyRegistered(false);
    setSuccessMessage(null);
    setErrorInfo(null);

    // Wajib ceklis Term & condition
    if (!validateTerms()) {
      return;
    }

    if (!email.trim() || !password) {
      setLoginError('Harap masukkan alamat email dan kata sandi.');
      return;
    }

    setIsLoading(true);
    setLoginMode('email');

    try {
      const cleanEmail = email.trim().toLowerCase();
      const credential = await loginWithEmail(cleanEmail, password);
      if (credential && credential.user) {
        setSuccessMessage('Log in berhasil! Mengalihkan ke dashboard...');
        if (onLoginSuccess) {
          onLoginSuccess(credential.user);
        }
      }
    } catch (err: any) {
      console.error('Email login error:', err);
      const errCode = err?.code || '';
      const errMsg = err?.message || '';

      if (
        errCode === 'auth/user-not-found' ||
        errCode === 'auth/invalid-credential' ||
        errMsg.includes('invalid-credential')
      ) {
        setLoginError('Email atau kata sandi tidak cocok. Jika belum punya akun, silakan klik tab Daftar.');
      } else if (errCode === 'auth/wrong-password') {
        setLoginError('Kata sandi yang Anda masukkan salah. Silakan coba lagi.');
      } else if (errCode === 'auth/invalid-email') {
        setLoginError('Format email tidak valid.');
      } else if (errCode === 'auth/too-many-requests') {
        setLoginError('Terlalu banyak percobaan gagal. Silakan coba kembali beberapa saat lagi.');
      } else {
        setLoginError(errMsg || 'Gagal log in. Silakan periksa kembali koneksi atau data akun Anda.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Daftar Akun Baru dengan Email & Password
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsAlreadyRegistered(false);
    setSuccessMessage(null);
    setErrorInfo(null);

    // Wajib ceklis Term & condition
    if (!validateTerms()) {
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setLoginError('Harap masukkan alamat email yang valid.');
      return;
    }

    if (!password) {
      setLoginError('Harap tentukan kata sandi akun Anda.');
      return;
    }

    if (password.length < 6) {
      setLoginError('Kata sandi terlalu pendek. Gunakan minimal 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setLoginError('Konfirmasi kata sandi tidak cocok. Harap periksa kembali.');
      return;
    }

    setIsLoading(true);
    setLoginMode('email');

    try {
      const { credential } = await registerWithEmail(cleanEmail, password, displayName.trim() || undefined);
      if (credential && credential.user) {
        setSuccessMessage('Pendaftaran berhasil! Akun Anda aktif dengan bonus saldo selamat datang.');
        if (onLoginSuccess) {
          onLoginSuccess(credential.user);
        }
      }
    } catch (err: any) {
      console.error('Email registration error:', err);
      const errCode = err?.code || '';
      const errMsg = err?.message || '';

      // Tampilan khusus jika email sudah terdaftar
      if (
        errCode === 'auth/email-already-in-use' ||
        errMsg.toLowerCase().includes('email-already-in-use') ||
        errMsg.toLowerCase().includes('already in use')
      ) {
        setIsAlreadyRegistered(true);
        setLoginError('email sudah terdaftar,silahkan log in');
      } else if (errCode === 'auth/invalid-email') {
        setLoginError('Format alamat email tidak valid.');
      } else if (errCode === 'auth/weak-password') {
        setLoginError('Kata sandi terlalu lemah. Gunakan minimal 6 karakter.');
      } else {
        setLoginError(errMsg || 'Gagal mendaftar akun baru. Silakan coba beberapa saat lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Google Sign-in
  const handleGoogleLogin = async (forceRedirect: boolean = false) => {
    // Wajib ceklis Term & condition
    if (!validateTerms()) {
      return;
    }

    setIsLoading(true);
    setLoginError(null);
    setIsAlreadyRegistered(false);
    setErrorInfo(null);
    const activeDomain = typeof window !== 'undefined' ? window.location.hostname : '';

    try {
      if (forceRedirect) {
        setLoginMode('redirect');
        await loginWithGoogleRedirect();
      } else {
        setLoginMode('popup');
        const result = await loginWithGooglePopup();
        if (result && result.user) {
          setIsLoading(false);
          if (onLoginSuccess) {
            onLoginSuccess();
          }
        }
      }
    } catch (err: any) {
      console.error('Login error details:', err);
      const errCode = err?.code || '';
      const errMsg = err?.message || '';

      if (errCode === 'auth/popup-blocked') {
        const msg = 'Login popup was blocked by your browser or extension. Please allow popups or open the app in a new tab.';
        setLoginError(msg);
        setErrorInfo({
          code: 'auth/popup-blocked',
          message: msg,
          domain: activeDomain
        });
      } else if (errCode === 'auth/popup-closed-by-user') {
        const msg = 'Google login window was closed before completion. Please click the Sign In button again.';
        setLoginError(msg);
        setErrorInfo({
          code: 'auth/popup-closed-by-user',
          message: msg,
          domain: activeDomain
        });
      } else if (errCode === 'auth/unauthorized-domain' || errMsg.toLowerCase().includes('unauthorized domain')) {
        const fullMsg = `Domain '${activeDomain}' is not registered in Firebase Authorized Domains. Add '${activeDomain}' in Firebase Console > Authentication > Settings > Authorized domains.`;
        setLoginError(fullMsg);
        setErrorInfo({
          code: 'auth/unauthorized-domain',
          isUnauthorizedDomain: true,
          domain: activeDomain,
          message: fullMsg
        });
      } else if (errCode === 'auth/operation-not-allowed') {
        const msg = 'Google provider is not enabled in Firebase Console. Please go to Firebase Console > Authentication > Sign-in method > Enable Google provider.';
        setLoginError(msg);
        setErrorInfo({
          code: 'auth/operation-not-allowed',
          message: msg,
          domain: activeDomain
        });
      } else {
        const fullMsg = errMsg || 'Failed to sign in with Google. Please check your internet connection.';
        setLoginError(fullMsg);
        setErrorInfo({
          code: errCode || 'auth/unknown',
          message: fullMsg,
          domain: activeDomain
        });
      }
      setIsLoading(false);
    }
  };

  // Handler: Lupa Kata Sandi (Password Reset)
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotStatus({ type: 'error', message: 'Harap masukkan alamat email Anda.' });
      return;
    }

    setIsForgotLoading(true);
    setForgotStatus(null);
    try {
      await sendPasswordReset(forgotEmail.trim().toLowerCase());
      setForgotStatus({
        type: 'success',
        message: 'Tautan pemulihan kata sandi telah dikirim ke email Anda. Silakan cek kotak masuk atau spam.'
      });
    } catch (err: any) {
      const errCode = err?.code || '';
      if (errCode === 'auth/user-not-found') {
        setForgotStatus({
          type: 'error',
          message: 'Akun dengan email ini belum terdaftar di sistem.'
        });
      } else {
        setForgotStatus({
          type: 'error',
          message: err?.message || 'Gagal mengirim tautan reset kata sandi.'
        });
      }
    } finally {
      setIsForgotLoading(false);
    }
  };

  const copyDomainToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 3000);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0a0e17] via-[#05070c] to-[#020408] text-white flex flex-col items-center justify-between p-4 sm:p-8 font-['Poppins'] select-none">
      {/* Top Brand Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between py-2">
        <SysLogo size="md" showText={true} />

        <div className="flex items-center gap-2">
          <button
            id="view-leaderboard-top-btn"
            type="button"
            onClick={() => setIsLeaderboardOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-xs font-bold text-amber-300 border border-amber-500/40 transition-all hover:scale-105 shadow-sm shadow-amber-500/10 cursor-pointer"
            title="View Leaderboard & Rewards"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Prize Leaderboard</span>
            <span className="sm:hidden">Leaderboard</span>
          </button>
        </div>
      </div>

      {/* Main Card - AUTH CARD (LOGIN & DAFTAR) */}
      <div className="w-full max-w-md my-auto flex flex-col items-center text-center py-4">
        {/* Brand Emblem */}
        <div className="mb-4">
          <SysLogo size="xl" showText={false} />
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
          {authTab === 'login' ? 'SYS Streamer Log In' : 'Daftar Akun SYS Streamer'}
        </h2>
        <p className="text-xs sm:text-sm text-white/60 mt-1 max-w-sm">
          {authTab === 'login'
            ? 'Masuk ke studio siaran interaktif & kelola games streaming Anda.'
            : 'Daftar akun gratis sekarang & nikmati bonus saldo selamat datang!'}
        </p>

        {/* TAMPILAN KHUSUS: EMAIL SUDAH TERDAFTAR */}
        {isAlreadyRegistered && (
          <div
            id="email-already-registered-box"
            className="mt-4 w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-amber-500/20 border-2 border-amber-400 text-amber-100 text-xs flex flex-col gap-2.5 text-left shadow-xl shadow-amber-500/15 animate-in fade-in"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <div className="text-sm font-black text-amber-300 tracking-wide">
                  email sudah terdaftar,silahkan log in
                </div>
                <p className="text-[11px] text-white/85 leading-relaxed">
                  Email <span className="font-mono text-amber-200 font-bold underline">{email}</span> sudah terdaftar dalam sistem SYS Streamer. Silakan klik tombol di bawah untuk langsung log in.
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-amber-400/30 flex items-center justify-end">
              <button
                type="button"
                id="switch-to-login-from-warning-btn"
                onClick={() => {
                  setAuthTab('login');
                  setIsAlreadyRegistered(false);
                  setLoginError(null);
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Beralih ke Log In Sekarang</span>
              </button>
            </div>
          </div>
        )}

        {/* SUCCESS NOTIFICATION */}
        {successMessage && (
          <div className="mt-4 w-full text-left rounded-2xl bg-emerald-950/70 border border-emerald-500/40 p-3.5 shadow-xl text-xs space-y-1 text-emerald-200 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Berhasil!</span>
            </div>
            <p className="text-[11px] text-emerald-100">{successMessage}</p>
          </div>
        )}

        {/* GENERAL ERROR NOTIFICATION */}
        {loginError && !isAlreadyRegistered && (
          <div className="mt-4 w-full text-left rounded-2xl bg-gradient-to-b from-red-950/70 to-red-900/40 border border-red-500/40 p-4 shadow-xl text-xs space-y-2.5 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <div className="font-bold text-red-200 text-sm flex items-center gap-2 flex-wrap">
                  <span>
                    {errorInfo?.isUnauthorizedDomain
                      ? 'Domain Not Authorized in Firebase'
                      : 'Pemberitahuan Akun'}
                  </span>
                  {errorInfo?.code && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-red-500/30 text-red-300 border border-red-500/40">
                      {errorInfo.code}
                    </span>
                  )}
                </div>
                <p className="text-red-100/90 leading-relaxed">{loginError}</p>
              </div>
            </div>

            {/* Special Interactive Guide for Firebase Authorized Domains */}
            {errorInfo?.isUnauthorizedDomain && (
              <div className="pt-2 border-t border-red-500/30 space-y-2">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="text-[10px] text-white/50 block">Your current active domain:</span>
                    <span className="font-mono font-bold text-amber-300 text-xs truncate select-all">
                      {errorInfo.domain || currentHost || 'your domain'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyDomainToClipboard(errorInfo.domain || currentHost || '')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[11px] border border-amber-500/40 transition-all shrink-0 active:scale-95 cursor-pointer"
                  >
                    {copiedDomain ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Domain</span>
                      </>
                    )}
                  </button>
                </div>

                <a
                  href="https://console.firebase.google.com/project/spherical-reporter-qgmzr/authentication/settings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95"
                >
                  <span>Open Firebase Authorized Domains</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* AUTH BOX */}
        <div className="w-full mt-5 p-5 sm:p-6 rounded-3xl bg-neutral-900/90 border border-white/15 shadow-2xl space-y-4">
          {/* TAB TOGGLE: LOG IN VS DAFTAR */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/50 border border-white/10">
            <button
              id="tab-login-btn"
              type="button"
              onClick={() => {
                setAuthTab('login');
                setLoginError(null);
                setTermsError(null);
                setIsAlreadyRegistered(false);
              }}
              className={`py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                authTab === 'login'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/20 scale-[1.01]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Log In</span>
            </button>

            <button
              id="tab-register-btn"
              type="button"
              onClick={() => {
                setAuthTab('register');
                setLoginError(null);
                setTermsError(null);
                setIsAlreadyRegistered(false);
              }}
              className={`py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                authTab === 'register'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/20 scale-[1.01]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftar</span>
            </button>
          </div>

          {/* FORM: LOG IN ATAU DAFTAR */}
          <form
            onSubmit={authTab === 'login' ? handleEmailLogin : handleEmailRegister}
            className="space-y-3.5 text-left"
          >
            {/* Input Display Name (Khusus Form Daftar) */}
            {authTab === 'register' && (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-white/70 block">
                  Nama Streamer / Panggilan (Opsional)
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="register-name-input"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Contoh: Alex Streamer"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-xs text-white placeholder-white/30 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Input Email */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-white/70 block">
                Alamat Email <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (isAlreadyRegistered) setIsAlreadyRegistered(false);
                    if (loginError) setLoginError(null);
                  }}
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-xs text-white placeholder-white/30 outline-none transition-all"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-white/70 block">
                  Kata Sandi <span className="text-amber-400">*</span>
                </label>
                {authTab === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setIsForgotPassOpen(true);
                      setForgotStatus(null);
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    Lupa kata sandi?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={authTab === 'register' ? 'Minimal 6 karakter' : 'Masukkan kata sandi'}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-xs text-white placeholder-white/30 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Input Konfirmasi Password (Khusus Form Daftar) */}
            {authTab === 'register' && (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-white/70 block">
                  Konfirmasi Kata Sandi <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="register-confirm-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi Anda"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-xs text-white placeholder-white/30 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* CEK BOX PADA SAMPING TERM & CONDITION (WAJIB DICEKLIS) */}
            <div
              id="terms-checkbox-container"
              className={`p-3 rounded-2xl border transition-all ${
                termsError
                  ? 'bg-red-950/40 border-red-500/70 ring-2 ring-red-500/40'
                  : 'bg-black/40 border-white/10 hover:border-white/20'
              }`}
            >
              <label htmlFor="terms-agree-checkbox" className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="terms-agree-checkbox"
                  checked={isTermsAccepted}
                  onChange={(e) => {
                    setIsTermsAccepted(e.target.checked);
                    if (e.target.checked) {
                      setTermsError(null);
                    }
                  }}
                  className="mt-0.5 w-4 h-4 rounded border-white/30 text-amber-500 focus:ring-amber-400 bg-neutral-900 cursor-pointer accent-amber-500 shrink-0"
                />
                <span className="text-xs text-white/90 leading-snug">
                  Saya telah membaca dan menyetujui{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsTermsOpen(true);
                    }}
                    className="text-amber-400 hover:text-amber-300 font-bold underline underline-offset-2 cursor-pointer inline-flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5 inline text-amber-400" />
                    <span>Term & condition</span>
                  </button>
                  <span className="text-red-400 font-bold ml-1">*</span>
                </span>
              </label>

              {/* Tampilkan pesan peringatan jika cek box tidak diceklis */}
              {termsError && (
                <div className="mt-2 flex items-start gap-1.5 text-[11px] font-semibold text-red-300 pl-6 animate-in fade-in">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-400 mt-0.5" />
                  <span>{termsError}</span>
                </div>
              )}
            </div>

            {/* SUBMIT BUTTON: LOG IN ATAU DAFTAR */}
            <button
              id={authTab === 'login' ? 'email-login-btn' : 'email-register-btn'}
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 active:scale-[0.98] text-slate-950 font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all disabled:opacity-60 cursor-pointer"
            >
              {isLoading && loginMode === 'email' ? (
                <div className="flex items-center gap-2 text-slate-950 font-bold">
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>{authTab === 'login' ? 'Memproses Log In...' : 'Mendaftarkan Akun...'}</span>
                </div>
              ) : (
                <>
                  {authTab === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  <span>{authTab === 'login' ? 'Log In Sekarang' : 'Daftar Akun Baru'}</span>
                </>
              )}
            </button>
          </form>

          {/* DIVIDER: ATAU MASUK DENGAN GOOGLE */}
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-white/40 tracking-wider">
              <span className="bg-neutral-900 px-3">atau lanjutkan dengan</span>
            </div>
          </div>

          {/* GOOGLE SIGN IN BUTTON */}
          <button
            id="google-signin-btn"
            type="button"
            onClick={() => handleGoogleLogin(false)}
            disabled={isLoading}
            className="w-full py-3 px-5 rounded-2xl bg-white hover:bg-neutral-100 active:bg-neutral-200 text-neutral-900 font-extrabold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-3 shadow-md hover:shadow-amber-500/10 transition-all hover:scale-[1.01] active:scale-[0.99] border border-neutral-200 disabled:opacity-60 cursor-pointer"
          >
            {isLoading && loginMode === 'popup' ? (
              <div className="flex items-center gap-2 text-neutral-800">
                <span className="w-4 h-4 border-2 border-neutral-800 border-t-transparent rounded-full animate-spin" />
                <span>Membuka Jendela Google...</span>
              </div>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Masuk Cepat dengan Google</span>
              </>
            )}
          </button>

          {/* TOGGLE BOTTOM LINK */}
          <div className="pt-2 text-center text-xs text-white/60">
            {authTab === 'login' ? (
              <p>
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('register');
                    setLoginError(null);
                    setTermsError(null);
                    setIsAlreadyRegistered(false);
                  }}
                  className="font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2 cursor-pointer"
                >
                  Daftar sekarang
                </button>
              </p>
            ) : (
              <p>
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('login');
                    setLoginError(null);
                    setTermsError(null);
                    setIsAlreadyRegistered(false);
                  }}
                  className="font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2 cursor-pointer"
                >
                  Log In di sini
                </button>
              </p>
            )}
          </div>

          {/* BLIND BOX GAME SHORTCUT BUTTON */}
          {onOpenBlindBoxGame && (
            <div className="pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={onOpenBlindBoxGame}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-yellow-500/25 to-amber-500/15 hover:from-amber-500/25 hover:to-yellow-500/35 border border-amber-400/50 text-amber-300 font-bold text-xs tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <Gift className="w-3.5 h-3.5 text-yellow-300 animate-bounce" />
                <span>🎁 Main "Blind Box Game" Win BIG</span>
              </button>
            </div>
          )}
        </div>

        {/* FOOTER TERMS & CONDITIONS LINK */}
        <div className="w-full mt-3 pt-3 flex flex-col items-center justify-center text-center">
          <button
            type="button"
            onClick={() => setIsTermsOpen(true)}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-amber-400/40 text-amber-300 hover:text-amber-200 text-xs font-semibold transition-all cursor-pointer shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="underline underline-offset-4">Buka Halaman Term & condition</span>
          </button>
          <span className="text-[10px] text-white/40 mt-1">
            Klik untuk membaca ketentuan layanan, integritas fair play, dan kebijakan saldo streamer
          </span>
        </div>
      </div>

      {/* Footer info */}
      <div className="w-full max-w-5xl py-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/40 gap-2">
        <p>© 2026 SYS Streamer. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Broadcast Server Online
          </span>
          <span>Version 3.8.0</span>
        </div>
      </div>

      {/* Modal Lupa Kata Sandi */}
      {isForgotPassOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-neutral-900 border border-white/15 p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">Reset Kata Sandi</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotPassOpen(false)}
                className="text-white/40 hover:text-white text-sm p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              Masukkan alamat email Anda untuk menerima tautan pemulihan kata sandi resmi dari Firebase.
            </p>

            {forgotStatus && (
              <div
                className={`p-3 rounded-xl text-xs ${
                  forgotStatus.type === 'success'
                    ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
                    : 'bg-red-950/60 border border-red-500/40 text-red-200'
                }`}
              >
                {forgotStatus.message}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-white/70 block mb-1">
                  Email Akun Anda
                </label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-xs text-white placeholder-white/30 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotPassOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isForgotLoading}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md disabled:opacity-60 cursor-pointer"
                >
                  {isForgotLoading ? 'Mengirim...' : 'Kirim Tautan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Terms & Conditions Modal */}
      <TermsAndConditionsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />

      {/* Leaderboard Modal */}
      <LoginLeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        onLoginClick={() => {
          if (!isTermsAccepted) {
            setTermsError('Harap centang ceklis Term & condition terlebih dahulu. Gagal log in atau daftar jika belum disetujui.');
            setIsLeaderboardOpen(false);
            return;
          }
          handleGoogleLogin(false);
        }}
      />
    </div>
  );
};

