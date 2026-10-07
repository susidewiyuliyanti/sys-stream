import React, { useState } from 'react';
import { sound } from '../../lib/sound';
import { TERMS_VERSION } from '../terms/page';
import { useLanguage } from '../../i18n';
import { useGame } from '../../context/GameContext';
import { Wallet, Shield, Fingerprint, Coins } from 'lucide-react';
import { HDNodeWallet } from 'ethers';

declare global {
  interface Window {
    solana?: any;
    phantom?: { solana?: any };
    solflare?: any;
    okxwallet?: { solana?: any };
  }

  interface Window {
    ethereum?: {
      request(args: { method: string; params?: unknown[] }): Promise<unknown>;
    };
  }
}

interface Props {
  navigate?: (path: string) => void;
}

type AuthUser = Record<string, any>;

export default function LoginPage({ navigate }: Props) {
  const { t } = useLanguage();
  const { login } = useGame();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedWallet, setGeneratedWallet] = useState<{ address: string; phrase: string } | null>(null);
  const [walletBackupConfirmed, setWalletBackupConfirmed] = useState(false);
  const [pendingRegistrationAuth, setPendingRegistrationAuth] = useState<{ password: string } | null>(null);
  const [notice, setNotice] = useState('');

  const referralParam =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('ref') || ''
      : '';
  const returnParam =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('return') || ''
      : '';
  const postLoginPath = returnParam.startsWith('/') ? returnParam : '/dashboard';

  const finishAuth = (token: string, user: AuthUser) => {
    localStorage.setItem('sys_stream_auth_token', token);
    localStorage.setItem('sys_stream_auth_user', JSON.stringify(user));
    localStorage.setItem(
      'sys_stream_profile_cache',
      JSON.stringify({
        id: user.id,
        username: user.username || user.displayName || user.display_name || '',
        avatar: user.avatarUrl || user.avatar_url || '',
        referralCode: user.referralCode || user.referral_code || '',
        walletAddress: user.walletAddress || user.wallet_address || '',
        registrationBonusIdr: Number(user.registrationBonusIdr ?? user.registration_bonus_idr ?? 0),
        registrationBonusGranted: Boolean(user.registrationBonusGranted ?? user.registration_bonus_granted),
      }),
    );
    localStorage.setItem('sys_is_logged_in', 'true');

    // Synchronize the shared GameProvider immediately. Without this, the
    // provider still has isLoggedIn=false until a full browser refresh.
    login(user.walletAddress || user.username || user.displayName || 'User');

    if (postLoginPath === '/airdrop') {
      window.location.replace('https://airdrop.sysstreamer.asia/');
    } else {
      navigate?.(postLoginPath);
    }
  };

  const handleSolanaLogin = async () => {
    if (isSubmitting) return;
    const provider = window.phantom?.solana || window.okxwallet?.solana || window.solflare || window.solana;
    if (!provider) {
      window.alert(t('Install a Solana-compatible wallet such as OKX Wallet or Phantom.'));
      return;
    }
    setIsSubmitting(true);
    setNotice('');
    try {
      const connected = await provider.connect();
      const walletAddress = String(connected?.publicKey?.toString?.() || provider.publicKey?.toString?.() || '').trim();
      if (!walletAddress) throw new Error(t('Solana wallet address tidak ditemukan.'));
      const challengeRes = await fetch('/api/auth/solana/challenge',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({walletAddress})});
      const challengeData = await challengeRes.json().catch(()=>({}));
      if(!challengeRes.ok || !challengeData?.success) throw new Error(challengeData?.error || t('Gagal membuat challenge Solana wallet.'));
      const encoded = new TextEncoder().encode(String(challengeData.message));
      const signed = await provider.signMessage(encoded,'utf8');
      const signatureBytes = signed?.signature || signed;
      if(!signatureBytes) throw new Error(t('Signature Solana tidak ditemukan.'));
      const alphabet='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
      let n=0n;
      for(const byte of new Uint8Array(signatureBytes)){ n=(n<<8n)+BigInt(byte); }
      let signature='';
      while(n>0n){ const rem=Number(n%58n); signature=alphabet[rem]+signature; n/=58n; }
      for(const byte of new Uint8Array(signatureBytes)){ if(byte===0) signature='1'+signature; else break; }
      const loginRes=await fetch('/api/auth/solana/login',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({challengeId:challengeData.challengeId,walletAddress,message:challengeData.message,signature})});
      const loginData=await loginRes.json().catch(()=>({}));
      if(!loginRes.ok || !loginData?.success || !loginData?.token || !loginData?.user) throw new Error(loginData?.error || t('Verifikasi tanda tangan Solana gagal.'));
      finishAuth(String(loginData.token),loginData.user);
    } catch(error) {
      console.error('Solana login error:',error);
      window.alert(error instanceof Error ? error.message : t('Solana wallet login gagal.'));
    } finally { setIsSubmitting(false); }
  };

  const handleWalletLogin = async () => {
    if (isSubmitting) return;
    if (!window.ethereum) {
      window.alert(t('Install MetaMask atau wallet Web3 terlebih dahulu.'));
      return;
    }
    setIsSubmitting(true);
    setNotice('');
    try {
      const ethereum = window.ethereum;
      const accounts = (await ethereum.request({ method: 'eth_requestAccounts' })) as string[];
      const walletAddress = String(accounts?.[0] || '').trim();
      if (!walletAddress) throw new Error(t('Wallet address tidak ditemukan.'));

      // Always obtain a fresh server challenge for the exact wallet currently connected.
      const challengeRes = await fetch('/api/auth/web3/challenge', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      });
      const challengeData = await challengeRes.json().catch(() => ({}));
      if (!challengeRes.ok || !challengeData?.success || !challengeData?.challengeId || !challengeData?.message) {
        throw new Error(challengeData?.error || t('Gagal membuat challenge wallet.'));
      }

      const challengeWallet = String(challengeData.walletAddress || walletAddress).trim();
      const signature = await ethereum.request({
        method: 'personal_sign',
        params: [String(challengeData.message), challengeWallet],
      });

      const loginRes = await fetch('/api/auth/web3/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: String(challengeData.challengeId),
          walletAddress: challengeWallet,
          message: String(challengeData.message),
          signature: String(signature),
        }),
      });
      const loginData = await loginRes.json().catch(() => ({}));
      if (!loginRes.ok || !loginData?.success || !loginData?.token || !loginData?.user) {
        throw new Error(loginData?.error || t('Verifikasi tanda tangan wallet gagal.'));
      }

      finishAuth(String(loginData.token), loginData.user);
    } catch (error) {
      console.error('Wallet login error:', error);
      window.alert(error instanceof Error ? error.message : t('Wallet login gagal.'));
    } finally {
      setIsSubmitting(false);
    }
  };
  const generateRegistrationWallet = () => {
    if (isSubmitting || !termsAccepted || generatedWallet) return;

    setNotice('');
    try {
      // Wallet generation is completely local. No registration API call is
      // made until the user has seen and confirmed the recovery phrase.
      const newWallet = HDNodeWallet.createRandom();
      const phrase = newWallet.mnemonic?.phrase || '';
      if (!phrase) throw new Error(t('Recovery phrase gagal dibuat.'));
      
      setGeneratedWallet({
        address: newWallet.address,
        phrase,
      });
      setWalletBackupConfirmed(false);
      setPendingRegistrationAuth({
        password: crypto.randomUUID() + crypto.randomUUID(),
      });
      setNotice(t('Wallet berhasil dibuat di perangkat ini. Simpan recovery phrase sebelum membuat akun.'));
    } catch (error) {
      console.error('Local wallet generation error:', error);
      window.alert(error instanceof Error ? error.message : t('Gagal membuat wallet baru.'));
    }
  };

  const completeRegistration = async () => {
    if (!pendingRegistrationAuth || !generatedWallet || !walletBackupConfirmed || isSubmitting) return;

    setIsSubmitting(true);
    setNotice('');

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
          ...(referralParam ? { referralCode: referralParam } : {}),
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

      finishAuth(String(data.token), data.user);
    } catch (error) {
      console.error('Wallet registration error:', error);
      window.alert(error instanceof Error ? error.message : t('Registrasi gagal diproses di server.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    sound.playClick();

    if (authMode === 'login') {
      await handleWalletLogin();
      return;
    }

    if (pendingRegistrationAuth) {
      await completeRegistration();
      return;
    }

    generateRegistrationWallet();
  };

  const switchMode = (mode: 'login' | 'register') => {
    sound.playClick();
    setAuthMode(mode);
    setTermsAccepted(false);
    setGeneratedWallet(null);
    setWalletBackupConfirmed(false);
    setPendingRegistrationAuth(null);
    setNotice('');
  };

  return (
    <div className="min-h-screen bg-[#060a14] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-cyan-500 selection:text-black">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-sm sm:max-w-md bg-[#080d1a]/90 backdrop-blur-2xl border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.25)] text-white">
        <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-cyan-500/30 mb-6">
          <button type="button" onClick={() => switchMode('login')}
            className={`py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${authMode === 'login' ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            Login
          </button>
          <button type="button" onClick={() => switchMode('register')}
            className={`py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${authMode === 'register' ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {t('Generate Wallet')}
          </button>
        </div>

        <div className="text-center mb-5">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {authMode === 'login' ? t('Welcome Back') : t('Create SYS Account')}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {authMode === 'login'
              ? t('Login menggunakan wallet Anda.')
              : t('Buat wallet baru langsung dari perangkat Anda.')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authMode === 'login' ? (
            <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/5 p-5 text-center">
              <Wallet className="w-9 h-9 mx-auto text-cyan-300 mb-2" />
              <div className="text-sm font-black text-white">{t('Login dengan Wallet')}</div>
              <p className="mt-1 text-[11px] leading-5 text-slate-400">
                {t('Hubungkan MetaMask atau wallet EVM lain, lalu tanda tangani pesan login.')}
              </p>
              <button type="button" onClick={handleSolanaLogin} disabled={isSubmitting}
                className="mt-4 w-full py-3 rounded-xl border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                <Coins className="w-4 h-4 text-purple-300" /> {t('LOGIN WITH SOLANA')}
              </button>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-purple-500/25 bg-purple-500/5 p-5 text-center">
                <Wallet className="w-9 h-9 mx-auto text-purple-300 mb-2" />
                <div className="text-sm font-black text-white">{t('Buat Wallet Baru')}</div>
                <p className="mt-1 text-[11px] leading-5 text-slate-400">
                  {t('Tidak perlu email, username, atau password. Wallet dibuat langsung di perangkat Anda.')}
                </p>
              </div>

              <label className="flex items-start gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-3.5 cursor-pointer select-none">
                <input type="checkbox" checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  required className="mt-0.5 w-4 h-4 rounded bg-slate-950 border-cyan-500 text-cyan-500 shrink-0" />
                <span className="text-[11px] leading-5 text-slate-400">
                  {t('Saya menyetujui Terms & Conditions dan pembuatan wallet baru.')}
                </span>
              </label>

              {generatedWallet && (
                <div className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-4 space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-amber-300">{t('Simpan Recovery Phrase')}</div>
                  <p className="text-[10px] leading-4 text-amber-100/80">
                    {t('Recovery phrase dibuat di perangkat Anda. SYS STREAM tidak menerima atau menyimpan phrase ini.')}
                  </p>
                  <div className="rounded-xl bg-slate-950 border border-amber-500/20 p-3">
                    <div className="text-[10px] text-slate-500 mb-1">{t('Wallet Address')}</div>
                    <div className="font-mono text-[10px] text-cyan-300 break-all">{generatedWallet.address}</div>
                  </div>
                  <div className="rounded-xl bg-slate-950 border border-amber-500/20 p-3">
                    <div className="text-[10px] text-slate-500 mb-1">{t('Recovery Phrase')}</div>
                    <div className="font-mono text-xs leading-5 text-white break-words select-all">{generatedWallet.phrase}</div>
                  </div>
                  <label className="flex items-start gap-2 text-[10px] text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={walletBackupConfirmed}
                      onChange={(e) => setWalletBackupConfirmed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded bg-slate-950 border-amber-500 text-amber-500" />
                    <span>{t('Saya sudah menyimpan recovery phrase dan memahami bahwa SYS STREAM tidak dapat memulihkannya.')}</span>
                  </label>
                </div>
              )}

              {notice && (
                <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-3 text-[11px] leading-5 text-cyan-200">
                  {notice}
                </div>
              )}
            </>
          )}

          <button type="submit"
            disabled={isSubmitting || (authMode === 'register' && (!termsAccepted || Boolean(pendingRegistrationAuth && !walletBackupConfirmed)))}
            className="w-full py-3.5 mt-2 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2">
            {isSubmitting
              ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : authMode === 'login'
                ? t('LOGIN WITH WALLET')
                : pendingRegistrationAuth
                  ? t('BUAT AKUN DENGAN WALLET INI')
                  : t('GENERATE WALLET')}
          </button>
        </form>

        <div className="text-center mt-4 text-xs text-slate-400">
          {authMode === 'login' ? (
            <>
              <span>{t("Don't have an account?")} </span>
              <button type="button" onClick={() => switchMode('register')} className="text-purple-400 hover:text-purple-300 font-bold underline">
                {t('Register Now')}
              </button>
            </>
          ) : (
            <>
              <span>{t('Already have a wallet?')} </span>
              <button type="button" onClick={() => switchMode('login')} className="text-cyan-400 hover:text-cyan-300 font-bold underline">
                {t('Login with Wallet')}
              </button>
            </>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-slate-900 text-[10px] text-slate-500">
          <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-cyan-400" /> {t('Secured with Web3')}</span>
          <span className="flex items-center gap-1"><Fingerprint className="w-3.5 h-3.5 text-purple-400" /> {t('Wallet Authentication')}</span>
        </div>
      </div>
    </div>
  );
}
