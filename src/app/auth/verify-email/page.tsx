import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../../i18n';
import { CheckCircle2, XCircle, Loader2, MailCheck } from 'lucide-react';

interface Props { navigate?: (path: string) => void; }

export default function VerifyEmailPage({ navigate }: Props) {
  const { t } = useLanguage();
  const [state, setState] = useState<'loading'|'success'|'error'>('loading');
  const [message, setMessage] = useState('Memverifikasi email Anda...');

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : '';
    const queryIndex = hash.indexOf('?');
    const query = queryIndex >= 0 ? hash.slice(queryIndex + 1) : '';
    const token = new URLSearchParams(query).get('token') || '';

    if (!token) {
      setState('error');
      setMessage('Token verifikasi tidak ditemukan.');
      return;
    }

    fetch('/api/auth/verify-email?token=' + encodeURIComponent(token), { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.success) throw new Error(data?.error || 'Verifikasi email gagal.');
        setState('success');
        setMessage(data.message || 'Email berhasil diverifikasi. Silakan login.');
      })
      .catch((error) => {
        setState('error');
        setMessage(error instanceof Error ? error.message : 'Verifikasi email gagal.');
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#060a14] flex items-center justify-center p-4 text-white">
      <div className="w-full max-w-md rounded-3xl border-2 border-cyan-500/30 bg-[#080d1a]/95 p-7 text-center shadow-[0_0_50px_rgba(6,182,212,0.18)]">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 border border-cyan-500/20">
          {state === 'loading' && <Loader2 className="h-7 w-7 animate-spin text-cyan-400" />}
          {state === 'success' && <CheckCircle2 className="h-8 w-8 text-emerald-400" />}
          {state === 'error' && <XCircle className="h-8 w-8 text-rose-400" />}
        </div>
        <MailCheck className="mx-auto mb-3 h-5 w-5 text-cyan-400" />
        <h1 className="text-xl font-black">
          {state === 'loading' ? t('Verifying Email') : state === 'success' ? t('Email Verified') : t('Verification Failed')}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">{message}</p>
        <button
          type="button"
          onClick={() => navigate?.('/login')}
          className="mt-7 w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 py-3.5 text-sm font-black uppercase tracking-wider"
        >
          {state === 'success' ? t('GO TO LOGIN') : t('BACK TO LOGIN')}
        </button>
      </div>
    </div>
  );
}
