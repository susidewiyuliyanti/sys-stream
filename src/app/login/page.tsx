import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../lib/sound';
import { useLanguage } from '../../i18n';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Wallet,
  Shield,
  Fingerprint,
} from 'lucide-react';

interface Props {
  navigate?: (path: string) => void;
}

export default function LoginPage({ navigate }: Props) {
  const { user, login } = useGame();
  const { t } = useLanguage();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [usernameInput, setUsernameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setIsSubmitting(true);
    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = authMode === 'login'
        ? { identifier: usernameInput.trim(), password: passwordInput }
        : { username: usernameInput.trim(), email: emailInput.trim(), password: passwordInput };
      const res = await fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Autentikasi gagal.');
      localStorage.setItem('sys_stream_auth_token', data.token);
      localStorage.setItem('sys_stream_auth_user', JSON.stringify(data.user));
      login(data.user?.username || usernameInput.trim());
      if (navigate) navigate('/room/main');
    } catch (error) {
      console.error(error);
      window.alert(error instanceof Error ? error.message : 'Autentikasi gagal.');
    } finally { setIsSubmitting(false); }
  };

  const handleWalletAuth = () => {
    sound.playClick();
    window.alert('Wallet login belum tersedia. Silakan login atau register dengan akun SYS terlebih dahulu.');
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
            onClick={() => { sound.playClick(); setAuthMode('login'); }}
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
            onClick={() => { sound.playClick(); setAuthMode('register'); }}
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
          <div className="relative">
            <span className="absolute left-3.5 top-3.5 text-cyan-400">
              <User className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder={t('Username or Email')}
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-cyan-500/30 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          {authMode === 'register' && (
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-cyan-400"><User className="w-4 h-4" /></span>
              <input type="email" placeholder={t('Email')} value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-cyan-500/30 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors" />
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

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-slate-950 border-cyan-500 text-cyan-500 focus:ring-0 cursor-pointer"
              />
              <span className="text-[11px]">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => sound.playClick()}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Forgot Password?
            </button>
          </div>

          {/* Glowing Neon Login Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 mt-2 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:opacity-95 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{authMode === 'login' ? 'LOGIN' : 'CREATE ACCOUNT'}</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-500">
            <span className="bg-[#080d1a] px-3">or Connect with Crypto Wallet</span>
          </div>
        </div>

        {/* Wallet authentication is intentionally disabled until a real wallet-signature flow is implemented. */}
        <button
          onClick={handleWalletAuth}
          type="button"
          className="w-full py-3 bg-slate-950/60 border border-slate-700 text-slate-500 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Wallet className="w-4 h-4 text-slate-500" />
          <span>Wallet Login — Coming Soon</span>
        </button>

        {/* Register Prompt */}
        <div className="text-center mt-4 text-xs text-slate-400">
          <span>Don't have an account? </span>
          <button
            type="button"
            onClick={() => { sound.playClick(); setAuthMode('register'); }}
            className="text-purple-400 hover:text-purple-300 font-bold underline"
          >
            Register Now
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
