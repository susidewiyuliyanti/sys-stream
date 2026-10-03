import React, { useState } from 'react';
import { HDNodeWallet } from 'ethers';
import { TERMS_VERSION } from '../app/terms/page';
import { useGame } from '../context/GameContext';
import { sound } from '../lib/sound';
import { SysLogo } from './SysLogo';
import { useLanguage } from '../i18n';
import {
  Wallet,
  Shield,
  Fingerprint,
  X,
} from 'lucide-react';

export const MobileAuthModal: React.FC = () => {
  const { loginModalOpen, setLoginModalOpen, login } = useGame();
  const { t } = useLanguage();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [verificationNotice, setVerificationNotice] = useState('');
  const [generatedWallet, setGeneratedWallet] = useState<{ address: string; phrase: string } | null>(null);
  const [walletBackupConfirmed, setWalletBackupConfirmed] = useState(false);
  const [pendingRegistrationAuth, setPendingRegistrationAuth] = useState<{ password: string } | null>(null);

  if (!loginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();

    if (authMode === 'login') {
      await handleWalletAuth();
      return;
    }

    if (!termsAccepted) return;

    if (pendingRegistrationAuth && walletBackupConfirmed) {
      await completeRegistration();
      return;
    }

    if (generatedWallet) return;

    try {
      // Generate the wallet locally first. The server is only contacted after
      // the user confirms that the recovery phrase has been backed up.
      const newWallet = HDNodeWallet.createRandom();
      const phrase = newWallet.mnemonic?.phrase || '';
      if (!phrase) throw new Error('Recovery phrase gagal dibuat.');

      setGeneratedWallet({
        address: newWallet.address,
        phrase,
      });
      setWalletBackupConfirmed(false);
      setPendingRegistrationAuth({
        password: crypto.randomUUID() + crypto.randomUUID(),
      });
      setVerificationNotice('Wallet berhasil dibuat di perangkat ini. Simpan recovery phrase sebelum membuat akun.');
    } catch (error) {
      console.error('Local wallet generation failed', error);
      setVerificationNotice(error instanceof Error ? error.message : 'Gagal membuat wallet baru.');
    }
  };

  const completeRegistration = async () => {
    if (!pendingRegistrationAuth || !generatedWallet || !walletBackupConfirmed || isSubmitting) return;

    setIsSubmitting(true);
    setVerificationNotice('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: '',
          password: pendingRegistrationAuth.password,
          termsAccepted: true,
          termsVersion: TERMS_VERSION,
          walletAddress: generatedWallet.address,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.token || !data?.user) {
        throw new Error(
          data?.error
            ? String(data.error) + ([data?.code, data?.stage, data?.requestId].filter(Boolean).length ? ` [${[data?.code, data?.stage, data?.requestId].filter(Boolean).join(' / ')}]` : '')
            : t('Registrasi gagal diproses di server.')
        );
      }

      localStorage.setItem('sys_stream_auth_token', String(data.token));
      localStorage.setItem('sys_stream_auth_user', JSON.stringify(data.user));
      login(data.user?.username || data.user?.walletAddress || 'User');
    } catch (error) {
      console.error('Wallet registration failed', error);
      setVerificationNotice(error instanceof Error ? error.message : t('Registrasi gagal diproses di server.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWalletAuth = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setVerificationNotice('');

    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        throw new Error('EVM wallet tidak ditemukan. Install MetaMask atau wallet EVM yang kompatibel.');
      }

      const accounts = (await ethereum.request({ method: 'eth_requestAccounts' })) as string[];
      const wallet = String(accounts?.[0] || '').toLowerCase();
      if (!wallet) throw new Error('Wallet address tidak ditemukan.');

      const nonceRes = await fetch('/api/auth/wallet/nonce', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet }),
      });
      const nonceData = await nonceRes.json().catch(() => ({}));
      if (!nonceRes.ok || !nonceData?.nonce) {
        throw new Error(nonceData?.error || 'Gagal membuat nonce wallet.');
      }

      const message = 'SYS STREAMER LOGIN\\n\\nNonce:' + String(nonceData.nonce);
      const signature = await ethereum.request({
        method: 'personal_sign',
        params: [message, wallet],
      });

      const verifyRes = await fetch('/api/auth/wallet/verify', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet, signature, message }),
      });
      const verifyData = await verifyRes.json().catch(() => ({}));

      if (!verifyRes.ok || !verifyData?.token || !verifyData?.user) {
        throw new Error(verifyData?.error || 'Verifikasi tanda tangan wallet gagal.');
      }

      localStorage.setItem('sys_stream_auth_token', String(verifyData.token));
      localStorage.setItem('sys_stream_auth_user', JSON.stringify(verifyData.user));
      login(verifyData.user?.username || `WEB3_${wallet.slice(2, 8).toUpperCase()}`);
    } catch (error) {
      console.error('EVM wallet authentication failed', error);
      setVerificationNotice(error instanceof Error ? error.message : 'Login wallet gagal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      {/* Translucent Cyberpunk Glass Card matching Screenshot 1 */}
      <div className="relative w-full max-w-sm sm:max-w-md bg-[#080d1a]/95 border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.25)] text-white overflow-hidden">
        {/* Subtle Neon Circuit Ambient Backgrounds */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => { sound.playClick(); setLoginModalOpen(false); }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900/60 border border-slate-800 transition-colors z-20 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <SysLogo size="lg" showText={true} />
        </div>

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
            {authMode === 'login' ? t('Login menggunakan wallet Anda.') : t('Buat wallet baru langsung dari perangkat Anda.')}
          </p>
        </div>

        {/* Wallet-native authentication */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authMode === 'login' ? (
            <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/5 p-4 text-center">
              <Wallet className="w-8 h-8 mx-auto text-cyan-300 mb-2" />
              <div className="text-sm font-black text-white">{t('Login dengan Wallet')}</div>
              <p className="mt-1 text-[11px] leading-5 text-slate-400">
                {t('Hubungkan MetaMask atau wallet EVM lain, lalu tanda tangani pesan login.')}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-purple-500/25 bg-purple-500/5 p-4 text-center">
                <Wallet className="w-8 h-8 mx-auto text-purple-300 mb-2" />
                <div className="text-sm font-black text-white">{t('Buat Wallet Baru')}</div>
                <p className="mt-1 text-[11px] leading-5 text-slate-400">
                  {t('Tidak perlu email, username, atau password. Wallet dibuat langsung di perangkat Anda.')}
                </p>
              </div>
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-3.5">
                <label className="flex items-start gap-3 text-[11px] leading-5 text-slate-300 cursor-pointer">
                  <input id="mobile-terms-accepted" type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} required className="mt-0.5 w-4 h-4 rounded bg-slate-950 border-cyan-500 text-cyan-500" />
                  <span>{t('Saya menyetujui Terms & Conditions dan pembuatan wallet baru.')}</span>
                </label>
              </div>
              {verificationNotice && (
                <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-3 text-[11px] leading-5 text-cyan-200">{verificationNotice}</div>
              )}
              {generatedWallet && (
                <div className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-4 space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-amber-300" >{t('Simpan Recovery Phrase')}</div>
                  <p className="text-[10px] leading-4 text-amber-100/80">{t('Recovery phrase dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan phrase ini.')}</p>
                  <div className="rounded-xl bg-slate-950 border border-amber-500/20 p-3">
                    <div className="text-[10px] text-slate-500 mb-1">{t('Wallet Address')}</div>
                    <div className="font-mono text-[10px] text-cyan-300 break-all">{generatedWallet.address}</div>
                  </div>
                  <div className="rounded-xl bg-slate-950 border border-amber-500/20 p-3">
                    <div className="text-[10px] text-slate-500 mb-1">{t('Recovery Phrase')}</div>
                    <div className="font-mono text-xs leading-5 text-white break-words select-all">{generatedWallet.phrase}</div>
                  </div>
                  <label className="flex items-start gap-2 text-[10px] text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={walletBackupConfirmed} onChange={(e) => setWalletBackupConfirmed(e.target.checked)} className="mt-0.5 w-4 h-4 rounded bg-slate-950 border-amber-500 text-amber-500" />
                    <span>{t('Saya sudah menyimpan recovery phrase dan memahami bahwa SYS STREAM tidak dapat memulihkannya.')}</span>
                  </label>
                </div>
              )}
            </>
          )}
          <button
            type="submit"
            disabled={isSubmitting || (authMode === 'register' && (!termsAccepted || Boolean(pendingRegistrationAuth && !walletBackupConfirmed)))}
            className="w-full py-3.5 mt-2 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 disabled:opacity-40 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all"
          >
            {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" /> :
              authMode === 'login' ? t('LOGIN WITH WALLET') :
              pendingRegistrationAuth ? t('BUAT AKUN DENGAN WALLET INI') : t('GENERATE WALLET')}
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

        {/* Connect Crypto Wallet Button */}
        <button
          onClick={handleWalletAuth}
          type="button"
          className="w-full py-3 bg-slate-950/90 hover:bg-slate-900 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 font-bold text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <Wallet className="w-4 h-4 text-cyan-400" />
          <span>{t('Login with Wallet')}</span>
        </button>

        {/* Register Prompt */}
        <div className="text-center mt-4 text-xs text-slate-400">
          <span>{t("Don't have an account?")} </span>
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
            <Shield className="w-3.5 h-3.5 text-cyan-400" /> {t('Secured with Web3')}
          </span>
          <span className="flex items-center gap-1">
            <Fingerprint className="w-3.5 h-3.5 text-purple-400" /> {t('Biometric Login Available')}
          </span>
        </div>
      </div>
    </div>
  );
};
export default MobileAuthModal;
