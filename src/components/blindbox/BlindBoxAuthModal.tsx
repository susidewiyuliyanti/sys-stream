import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, User, Mail, ShieldAlert, Gift, LogIn, UserPlus } from 'lucide-react';
import { BlindBoxUser } from '../../types';

interface BlindBoxAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (token: string, user: BlindBoxUser) => void;
}

export const BlindBoxAuthModal: React.FC<BlindBoxAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload =
        tab === 'login'
          ? { login: username || email, password }
          : { username, email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication error occurred.');
      }

      localStorage.setItem('blindbox_jwt_token', data.token);
      onAuthSuccess(data.token, data.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Player helper
  const handleQuickDemo = async (role: 'player' | 'admin') => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      if (role === 'admin') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ login: 'admin', password: 'admin123' }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Admin login failed');
        localStorage.setItem('blindbox_jwt_token', data.token);
        onAuthSuccess(data.token, data.user);
        onClose();
      } else {
        // Create or login with a demo player
        const demoUser = 'player_' + Math.floor(Math.random() * 899 + 100);
        const demoEmail = `${demoUser}@game.io`;
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: demoUser,
            email: demoEmail,
            password: 'player12345',
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Register player failed');
        localStorage.setItem('blindbox_jwt_token', data.token);
        onAuthSuccess(data.token, data.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md rounded-2xl bg-neutral-900 border border-amber-500/40 p-6 shadow-2xl shadow-amber-500/10 text-white"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 mb-3 shadow-lg shadow-amber-500/20">
              <Gift className="w-6 h-6 text-slate-950" />
            </div>
            <h3 className="text-xl font-black text-amber-300">
              Blind Box Deposit 3D
            </h3>
            <p className="text-xs text-white/60 mt-1">
              {tab === 'login' ? 'Sign in to your account' : 'Create an account & receive Rp 100,000 demo balance'}
            </p>
          </div>

          {/* Tabs switch */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-black/40 rounded-xl border border-white/10 mb-5">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMsg(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                tab === 'login'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setErrorMsg(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                tab === 'register'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>

          {/* Error notification */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-white/70 mb-1">
                {tab === 'login' ? 'Username or Email' : 'Username'}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={tab === 'login' ? 'e.g.: player1 or player@game.io' : 'Enter unique username'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/15 focus:border-amber-400 focus:outline-none text-sm text-white placeholder:text-white/30"
                />
              </div>
            </div>

            {tab === 'register' && (
              <div>
                <label className="block text-[11px] font-bold text-white/70 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/15 focus:border-amber-400 focus:outline-none text-sm text-white placeholder:text-white/30"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-white/70 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 5 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/15 focus:border-amber-400 focus:outline-none text-sm text-white placeholder:text-white/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 mt-2"
            >
              {isLoading
                ? 'Processing...'
                : tab === 'login'
                ? 'Sign In to Game'
                : 'Register & Claim Demo Balance'}
            </button>
          </form>

          {/* Quick Demo Shortcuts */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-[11px] font-bold text-white/50 text-center mb-2.5">
              ⚡ Quick 1-Click Demo Testing:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickDemo('player')}
                className="px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-all text-center"
              >
                🎮 Demo Player
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickDemo('admin')}
                className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all text-center"
              >
                👑 Owner / Admin
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
