import React, { useEffect, useState } from 'react';
import {
  Trophy,
  AlertTriangle,
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

import {
  loginWithGooglePopup,
  loginWithGoogleRedirect,
  getLoginResult,
  loginWithEmail,
  registerWithEmail,
  sendPasswordReset,
} from '../lib/auth';

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void;
  onViewPricing?: () => void;
  currentHost?: string;
}

interface ErrorInfo {
  code?: string;
  message?: string;
  domain?: string;
  isUnauthorizedDomain?: boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onViewPricing,
  currentHost,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);

  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);

  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

  /*
   * ============================================================
   * AUTH REDIRECT RESULT
   * ============================================================
   *
   * Dipakai jika browser kembali dari proses OAuth redirect.
   *
   * Tidak lagi menggunakan Firebase.
   */
  useEffect(() => {
    let isMounted = true;

    getLoginResult()
      .then((result) => {
        if (!isMounted) return;

        if (result) {
          setIsLoading(false);

          if (onLoginSuccess) {
            onLoginSuccess(result);
          }
        }
      })
      .catch((err: any) => {
        if (!isMounted) return;

        console.error(
          'Error handling authentication result:',
          err
        );

        const errCode = err?.code || '';

        const msg =
          err?.message ||
          'Gagal memproses hasil autentikasi.';

        setLoginError(msg);

        setErrorInfo({
          code: errCode || 'auth/unknown',
          message: msg,
          domain: currentHost,
          isUnauthorizedDomain:
            errCode === 'auth/unauthorized-domain',
        });

        setIsLoading(false);
      });

    /*
     * Leaderboard otomatis tampil setelah 5 detik.
     */
    const timer = setTimeout(() => {
      if (isMounted) {
        setIsLeaderboardOpen(true);
      }
    }, 5000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [onLoginSuccess, currentHost]);

  /*
   * ============================================================
   * RESET STATE
   * ============================================================
   */

  const clearMessages = () => {
    setLoginError('');
    setSuccessMessage('');
    setErrorInfo(null);
    setIsAlreadyRegistered(false);
    setResetMessage('');
    setResetError('');
  };

  /*
   * ============================================================
   * EMAIL LOGIN
   * ============================================================
   */

  const handleEmailLogin = async (
    event?: React.FormEvent
  ) => {
    event?.preventDefault();

    clearMessages();

    if (!email.trim()) {
      setLoginError('Silakan masukkan alamat email.');
      return;
    }

    if (!password) {
      setLoginError('Silakan masukkan kata sandi.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginWithEmail(
        email.trim(),
        password
      );

      if (!result) {
        throw new Error(
          'Login gagal. Server tidak mengembalikan data pengguna.'
        );
      }

      /*
       * Simpan hasil melalui parent.
       */
      onLoginSuccess(result);
    } catch (err: any) {
      console.error('Email login error:', err);

      const code =
        err?.code ||
        err?.response?.data?.code ||
        'auth/login-failed';

      const message =
        err?.message ||
        err?.response?.data?.message ||
        'Email atau kata sandi tidak valid.';

      setLoginError(message);

      setErrorInfo({
        code,
        message,
        domain: currentHost,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * ============================================================
   * REGISTER
   * ============================================================
   */

  const handleRegister = async (
    event?: React.FormEvent
  ) => {
    event?.preventDefault();

    clearMessages();

    if (!displayName.trim()) {
      setLoginError('Silakan masukkan nama Anda.');
      return;
    }

    if (!email.trim()) {
      setLoginError('Silakan masukkan alamat email.');
      return;
    }

    if (!password) {
      setLoginError('Silakan masukkan kata sandi.');
      return;
    }

    if (password.length < 6) {
      setLoginError(
        'Kata sandi minimal 6 karakter.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerWithEmail(
        email.trim(),
        password,
        displayName.trim()
      );

      if (!result) {
        throw new Error(
          'Registrasi gagal. Server tidak mengembalikan data pengguna.'
        );
      }

      /*
       * Jika backend langsung membuat session,
       * pengguna dapat langsung masuk.
       */
      if (
        result.user ||
        result.credential ||
        result.token
      ) {
        onLoginSuccess(result);
        return;
      }

      /*
       * Jika backend meminta login setelah register.
       */
      setSuccessMessage(
        'Registrasi berhasil. Silakan login menggunakan akun Anda.'
      );

      setMode('login');
      setPassword('');
    } catch (err: any) {
      console.error('Register error:', err);

      const code =
        err?.code ||
        err?.response?.data?.code ||
        'auth/register-failed';

      const message =
        err?.message ||
        err?.response?.data?.message ||
        'Registrasi gagal. Silakan coba lagi.';

      setLoginError(message);

      setErrorInfo({
        code,
        message,
        domain: currentHost,
      });

      /*
       * Deteksi email sudah digunakan.
       */
      const lowerMessage = String(message).toLowerCase();

      if (
        lowerMessage.includes('already') ||
        lowerMessage.includes('exist') ||
        lowerMessage.includes('terdaftar') ||
        lowerMessage.includes('sudah digunakan')
      ) {
        setIsAlreadyRegistered(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * ============================================================
   * GOOGLE LOGIN
   * ============================================================
   *
   * Fungsi ini sudah tidak menggunakan Firebase secara langsung.
   * Implementasi backend Google OAuth akan dilakukan di tahap berikutnya.
   */

  const handleGoogleLogin = async (
    forceRedirect = false
  ) => {
    clearMessages();

    setIsLoading(true);

    try {
      let result;

      if (forceRedirect) {
        result = await loginWithGoogleRedirect();
      } else {
        result = await loginWithGooglePopup();
      }

      /*
       * Beberapa OAuth flow menggunakan redirect sehingga
       * result bisa kosong.
       */
      if (result) {
        onLoginSuccess(result);
      }
    } catch (err: any) {
      console.error('Google login error:', err);

      const code =
        err?.code ||
        err?.response?.data?.code ||
        'auth/google-login-failed';

      const message =
        err?.message ||
        err?.response?.data?.message ||
        'Login dengan Google belum tersedia atau gagal diproses.';

      setLoginError(message);

      setErrorInfo({
        code,
        message,
        domain: currentHost,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * ============================================================
   * FORGOT PASSWORD
   * ============================================================
   */

  const handleForgotPassword = async (
    event?: React.FormEvent
  ) => {
    event?.preventDefault();

    setResetError('');
    setResetMessage('');

    if (!resetEmail.trim()) {
      setResetError(
        'Silakan masukkan alamat email.'
      );
      return;
    }

    setResetLoading(true);

    try {
      await sendPasswordReset(
        resetEmail.trim()
      );

      setResetMessage(
        'Jika email tersebut terdaftar, tautan pemulihan kata sandi akan dikirim ke email Anda.'
      );
    } catch (err: any) {
      console.error(
        'Forgot password error:',
        err
      );

      setResetError(
        err?.message ||
          'Gagal mengirim tautan pemulihan kata sandi.'
      );
    } finally {
      setResetLoading(false);
    }
  };

  /*
   * ============================================================
   * SWITCH LOGIN / REGISTER
   * ============================================================
   */

  const switchMode = (
    nextMode: 'login' | 'register'
  ) => {
    clearMessages();

    setMode(nextMode);
    setPassword('');
  };

  /*
   * ============================================================
   * FORGOT PASSWORD SCREEN
   * ============================================================
   */

  if (showForgotPassword) {
    return (
      <div className="min-h-screen w-full bg-slate-950 text-white flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">

          <div className="text-center mb-8">
            <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
              <KeyRound className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-2xl font-bold">
              Lupa Kata Sandi?
            </h1>

            <p className="mt-2 text-sm text-white/50">
              Masukkan alamat email Anda untuk menerima
              tautan pemulihan kata sandi.
            </p>
          </div>

          <form
            onSubmit={handleForgotPassword}
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl"
          >
            <label className="block text-sm font-medium text-white/80 mb-2">
              Email
            </label>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />

              <input
                type="email"
                value={resetEmail}
                onChange={(e) =>
                  setResetEmail(e.target.value)
                }
                placeholder="nama@email.com"
                autoComplete="email"
                className="w-full h-12 rounded-xl bg-black/30 border border-white/10 pl-12 pr-4 outline-none focus:border-white/30 transition"
              />
            </div>

            {resetError && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200 flex gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            {resetMessage && (
              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200 flex gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{resetMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={resetLoading}
              className="mt-5 w-full h-12 rounded-xl bg-white text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/90 transition"
            >
              {resetLoading
                ? 'Mengirim...'
                : 'Kirim Tautan Pemulihan'}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setResetError('');
                setResetMessage('');
              }}
              className="mt-3 w-full h-11 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition"
            >
              Kembali ke Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * MAIN LOGIN SCREEN
   * ============================================================
   */

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white overflow-y-auto">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">

        <div className="w-full max-w-md">

          {/* ================================================== */}
          {/* HEADER */}
          {/* ================================================== */}

          <div className="text-center mb-8">

            <div className="mx-auto mb-5 w-20 h-20 rounded-3xl bg-gradient-to-br from-white/15 to-white/5 border border-white/10 shadow-2xl flex items-center justify-center">
              <Trophy className="w-10 h-10 text-yellow-300" />
            </div>

            <h1 className="text-3xl font-black tracking-tight">
              SYS STREAM
            </h1>

            <p className="mt-2 text-white/45 text-sm">
              Streaming • Game • Reward Platform
            </p>

          </div>

          {/* ================================================== */}
          {/* MAIN CARD */}
          {/* ================================================== */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.045] backdrop-blur-xl shadow-2xl overflow-hidden">

            {/* ================================================= */}
            {/* TABS */}
            {/* ================================================= */}

            <div className="grid grid-cols-2 border-b border-white/10">

              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`h-14 font-bold text-sm transition flex items-center justify-center gap-2 ${
                  mode === 'login'
                    ? 'text-white bg-white/[0.06]'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <LogIn className="w-4 h-4" />
                Login
              </button>

              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`h-14 font-bold text-sm transition flex items-center justify-center gap-2 ${
                  mode === 'register'
                    ? 'text-white bg-white/[0.06]'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Daftar
              </button>

            </div>

            <div className="p-6">

              {/* ================================================= */}
              {/* SUCCESS */}
              {/* ================================================= */}

              {successMessage && (
                <div className="mb-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />

                  <p className="text-sm text-emerald-200">
                    {successMessage}
                  </p>
                </div>
              )}

              {/* ================================================= */}
              {/* GENERAL ERROR */}
              {/* ================================================= */}

              {loginError && !isAlreadyRegistered && (
                <div className="mb-5 rounded-2xl bg-gradient-to-b from-red-950/70 to-red-900/40 border border-red-500/40 p-4 shadow-xl text-xs space-y-2.5">

                  <div className="flex items-start gap-2.5">

                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />

                    <div className="space-y-1 flex-1">

                      <div className="font-bold text-red-200 text-sm flex items-center gap-2 flex-wrap">

                        <span>
                          {errorInfo?.isUnauthorizedDomain
                            ? 'Domain Authentication'
                            : 'Pemberitahuan Akun'}
                        </span>

                        {errorInfo?.code && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-red-500/30 text-red-300 border border-red-500/40">
                            {errorInfo.code}
                          </span>
                        )}

                      </div>

                      <p className="text-red-100/90 leading-relaxed">
                        {loginError}
                      </p>

                      {errorInfo?.domain && (
                        <p className="text-[10px] text-white/40 font-mono mt-2">
                          Domain: {errorInfo.domain}
                        </p>
                      )}

                    </div>

                  </div>

                </div>
              )}

              {/* ================================================= */}
              {/* ALREADY REGISTERED */}
              {/* ================================================= */}

              {isAlreadyRegistered && (
                <div className="mb-5 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4">

                  <div className="flex gap-3">

                    <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />

                    <div>

                      <div className="font-bold text-yellow-200">
                        Email sudah terdaftar
                      </div>

                      <p className="mt-1 text-sm text-yellow-100/70">
                        Gunakan email dan kata sandi tersebut
                        untuk login.
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setIsAlreadyRegistered(false);
                          setLoginError('');
                          setMode('login');
                        }}
                        className="mt-3 text-sm font-bold text-yellow-300 hover:text-yellow-200"
                      >
                        Kembali ke Login →
                      </button>

                    </div>

                  </div>

                </div>
              )}

              {/* ================================================= */}
              {/* GOOGLE LOGIN */}
              {/* ================================================= */}

              <button
                type="button"
                onClick={() => handleGoogleLogin(false)}
                disabled={isLoading}
                className="w-full h-12 rounded-xl border border-white/10 bg-white text-black font-bold flex items-center justify-center gap-3 hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >

                <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-black text-sm">
                  G
                </span>

                {isLoading
                  ? 'Memproses...'
                  : 'Lanjutkan dengan Google'}

              </button>

              <div className="flex items-center gap-3 my-6">

                <div className="h-px flex-1 bg-white/10" />

                <span className="text-[11px] uppercase tracking-widest text-white/30">
                  atau
                </span>

                <div className="h-px flex-1 bg-white/10" />

              </div>

              {/* ================================================= */}
              {/* LOGIN FORM */}
              {/* ================================================= */}

              {mode === 'login' ? (

                <form
                  onSubmit={handleEmailLogin}
                  className="space-y-4"
                >

                  {/* Email */}

                  <div>

                    <label className="block text-xs font-bold text-white/60 mb-2">
                      Email
                    </label>

                    <div className="relative">

                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />

                      <input
                        type="email"
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                        placeholder="nama@email.com"
                        autoComplete="email"
                        disabled={isLoading}
                        className="w-full h-12 rounded-xl bg-black/30 border border-white/10 pl-12 pr-4 outline-none focus:border-white/30 transition disabled:opacity-50"
                      />

                    </div>

                  </div>

                  {/* Password */}

                  <div>

                    <label className="block text-xs font-bold text-white/60 mb-2">
                      Kata Sandi
                    </label>

                    <div className="relative">

                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />

                      <input
                        type={
                          showPassword
                            ? 'text'
                            : 'password'
                        }
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                        placeholder="Masukkan kata sandi"
                        autoComplete="current-password"
                        disabled={isLoading}
                        className="w-full h-12 rounded-xl bg-black/30 border border-white/10 pl-12 pr-12 outline-none focus:border-white/30 transition disabled:opacity-50"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/30 hover:text-white/70"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>

                    </div>

                  </div>

                  {/* Forgot password */}

                  <div className="flex justify-end">

                    <button
                      type="button"
                      onClick={() =>
                        setShowForgotPassword(true)
                      }
                      className="text-xs font-semibold text-white/50 hover:text-white transition"
                    >
                      Lupa kata sandi?
                    </button>

                  </div>

                  {/* Login */}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-white to-white/90 text-black font-black flex items-center justify-center gap-2 hover:from-white hover:to-white/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >

                    <LogIn className="w-5 h-5" />

                    {isLoading
                      ? 'Memproses...'
                      : 'Login'}

                  </button>

                </form>

              ) : (

                /* ================================================= */
                /* REGISTER FORM */
                /* ================================================= */

                <form
                  onSubmit={handleRegister}
                  className="space-y-4"
                >

                  {/* Name */}

                  <div>

                    <label className="block text-xs font-bold text-white/60 mb-2">
                      Nama
                    </label>

                    <div className="relative">

                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />

                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) =>
                          setDisplayName(
                            e.target.value
                          )
                        }
                        placeholder="Nama Anda"
                        autoComplete="name"
                        disabled={isLoading}
                        className="w-full h-12 rounded-xl bg-black/30 border border-white/10 pl-12 pr-4 outline-none focus:border-white/30 transition disabled:opacity-50"
                      />

                    </div>

                  </div>

                  {/* Email */}

                  <div>

                    <label className="block text-xs font-bold text-white/60 mb-2">
                      Email
                    </label>

                    <div className="relative">

                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />

                      <input
                        type="email"
                        value={email}
                        onChange={(e) =>
                          setEmail(e.target.value)
                        }
                        placeholder="nama@email.com"
                        autoComplete="email"
                        disabled={isLoading}
                        className="w-full h-12 rounded-xl bg-black/30 border border-white/10 pl-12 pr-4 outline-none focus:border-white/30 transition disabled:opacity-50"
                      />

                    </div>

                  </div>

                  {/* Password */}

                  <div>

                    <label className="block text-xs font-bold text-white/60 mb-2">
                      Kata Sandi
                    </label>

                    <div className="relative">

                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />

                      <input
                        type={
                          showPassword
                            ? 'text'
                            : 'password'
                        }
                        value={password}
                        onChange={(e) =>
                          setPassword(e.target.value)
                        }
                        placeholder="Minimal 6 karakter"
                        autoComplete="new-password"
                        disabled={isLoading}
                        className="w-full h-12 rounded-xl bg-black/30 border border-white/10 pl-12 pr-12 outline-none focus:border-white/30 transition disabled:opacity-50"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/30 hover:text-white/70"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>

                    </div>

                  </div>

                  {/* Register */}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-white to-white/90 text-black font-black flex items-center justify-center gap-2 hover:from-white hover:to-white/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >

                    <UserPlus className="w-5 h-5" />

                    {isLoading
                      ? 'Mendaftarkan...'
                      : 'Buat Akun'}

                  </button>

                </form>

              )}

              {/* ================================================= */}
              {/* BOTTOM INFORMATION */}
              {/* ================================================= */}

              <div className="mt-6 pt-5 border-t border-white/10">

                <div className="grid grid-cols-2 gap-3">

                  <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3">

                    <Gift className="w-5 h-5 text-yellow-300 mb-2" />

                    <p className="text-xs font-bold text-white/70">
                      Reward
                    </p>

                    <p className="text-[10px] text-white/35 mt-1">
                      Nikmati berbagai reward
                      dan event.
                    </p>

                  </div>

                  <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3">

                    <FileText className="w-5 h-5 text-blue-300 mb-2" />

                    <p className="text-xs font-bold text-white/70">
                      Platform
                    </p>

                    <p className="text-[10px] text-white/35 mt-1">
                      Kelola akun dan aktivitas
                      Anda.
                    </p>

                  </div>

                </div>

              </div>

            </div>
          </div>

          {/* ================================================== */}
          {/* FOOTER */}
          {/* ================================================== */}

          <div className="mt-6 text-center">

            <p className="text-[11px] text-white/25">
              Dengan melanjutkan, Anda menyetujui
              ketentuan penggunaan platform.
            </p>

            {currentHost && (
              <p className="mt-2 text-[10px] text-white/15 font-mono">
                {currentHost}
              </p>
            )}

          </div>

        </div>
      </div>

      {/* ==================================================== */}
      {/* LEADERBOARD MODAL */}
      {/* ==================================================== */}

      {isLeaderboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950 shadow-2xl overflow-hidden">

            <div className="p-6">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <div className="flex items-center gap-2">

                    <Trophy className="w-6 h-6 text-yellow-300" />

                    <h2 className="text-xl font-black">
                      Leaderboard
                    </h2>

                  </div>

                  <p className="text-sm text-white/40 mt-2">
                    Lihat peringkat pengguna dan
                    aktivitas platform.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setIsLeaderboardOpen(false)
                  }
                  className="text-white/40 hover:text-white text-xl"
                >
                  ×
                </button>

              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">

                <Trophy className="w-10 h-10 mx-auto text-yellow-300 mb-3" />

                <p className="text-sm text-white/60">
                  Leaderboard akan tersedia
                  setelah Anda login.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setIsLeaderboardOpen(false)
                }
                className="mt-5 w-full h-11 rounded-xl bg-white text-black font-bold hover:bg-white/90 transition"
              >
                Tutup
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
