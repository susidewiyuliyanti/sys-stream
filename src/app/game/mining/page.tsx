'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Pickaxe, LockKeyhole, Coins, Clock3, CheckCircle2, RefreshCw } from 'lucide-react';

interface MiningState {
  success?: boolean;
  miningActive: boolean;
  claimedToday: boolean;
  claimDate?: string;
  dailyReward: number;
  lock?: {
    id: number;
    amountIdr: number;
    amountUsd: number;
    durationDays: number;
    startDate: number;
    endDate: number;
  } | null;
  claim?: {
    id: number;
    rewardSys: number;
    createdAt: number;
  } | null;
  sysBalance: number;
  error?: string;
}

export default function MiningPage() {
  const [state, setState] = useState<MiningState | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState('');

  const loadMining = useCallback(async () => {
    try {
      setLoading(true);
      setMessage('');

      const response = await fetch('/api/mining/claim', {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Gagal mengambil status Mining.');
      }

      setState(data);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Gagal mengambil status Mining.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMining();
  }, [loadMining]);

  const claimMining = async () => {
    if (!state?.miningActive || state.claimedToday || claiming) return;

    try {
      setClaiming(true);
      setMessage('');

      const response = await fetch('/api/mining/claim', {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Mining claim gagal.');
      }

      setMessage(`Berhasil mendapatkan ${Number(data.rewardSys || 0)} SYS.`);
      await loadMining();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Mining claim gagal.'
      );
      await loadMining();
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center">
            <RefreshCw className="mx-auto mb-3 h-7 w-7 animate-spin text-emerald-400" />
            <p className="text-slate-400">Memuat status Mining...</p>
          </div>
        </div>
      </main>
    );
  }

  const miningActive = Boolean(state?.miningActive);
  const claimedToday = Boolean(state?.claimedToday);
  const lockAmountIdr = Number(state?.lock?.amountIdr || 0);
  const lockAmountUsd = Number(state?.lock?.amountUsd || 0);
  const dailyReward = Number(state?.dailyReward || 0);
  const sysBalance = Number(state?.sysBalance || 0);

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-6">

        <section className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 to-slate-950 p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-500/10 p-3">
                  <Pickaxe className="h-7 w-7 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-black">SYS Mining</h1>
                  <p className="text-sm text-slate-400">
                    Mining mengikuti Blind Box Lock aktif.
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
                miningActive
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  miningActive ? 'bg-emerald-400' : 'bg-slate-500'
                }`}
              />
              {miningActive ? 'MINING ON' : 'MINING OFF'}
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-2 flex items-center gap-2 text-slate-400">
              <LockKeyhole className="h-4 w-4" />
              <span className="text-xs font-bold uppercase">Active Lock</span>
            </div>
            <div className="text-2xl font-black">Rp {lockAmountIdr.toLocaleString('id-ID')}</div>
            <div className="mt-1 text-xs text-slate-500">≈ {'$'}{lockAmountUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-2 flex items-center gap-2 text-slate-400">
              <Coins className="h-4 w-4" />
              <span className="text-xs font-bold uppercase">Daily SYS</span>
            </div>
            <div className="text-2xl font-black text-emerald-400">
              {dailyReward.toLocaleString('en-US')} SYS
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-2 flex items-center gap-2 text-slate-400">
              <Coins className="h-4 w-4" />
              <span className="text-xs font-bold uppercase">SYS Balance</span>
            </div>
            <div className="text-2xl font-black">
              {sysBalance.toLocaleString('en-US', {
                maximumFractionDigits: 8,
              })}{' '}
              SYS
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          {!miningActive ? (
            <div className="text-center py-8">
              <LockKeyhole className="mx-auto mb-4 h-10 w-10 text-slate-600" />
              <h2 className="text-xl font-black">Mining belum aktif</h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-400">
                Mining aktif otomatis jika Anda memiliki Blind Box Lock yang masih aktif dengan nilai minimal $10 (≈ Rp 179.370).
              </p>

              <div className="mx-auto mt-5 max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-4 text-left text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">$10 Lock</span>
                  <strong>1 SYS / hari</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">$20 Lock</span>
                  <strong>2 SYS / hari</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">$50 Lock</span>
                  <strong>5 SYS / hari</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">$100 Lock</span>
                  <strong>10 SYS / hari</strong>
                </div>
              </div>
            </div>
          ) : claimedToday ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-400" />
              <h2 className="text-xl font-black">
                Mining hari ini sudah diklaim
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Reward hari ini:{' '}
                <strong className="text-emerald-400">
                  {Number(state?.claim?.rewardSys || dailyReward)} SYS
                </strong>
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Claim berikutnya tersedia pada hari berikutnya.
              </p>
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                <Pickaxe className="h-8 w-8 text-emerald-400" />
              </div>

              <h2 className="text-xl font-black">
                Mining reward tersedia
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Lock aktif Anda memberikan reward:
              </p>

              <div className="my-5 text-4xl font-black text-emerald-400">
                +{dailyReward} SYS
              </div>

              <button
                type="button"
                onClick={claimMining}
                disabled={claiming}
                className="rounded-2xl bg-emerald-500 px-8 py-4 font-black text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {claiming ? 'Processing...' : 'Claim Mining Reward'}
              </button>
            </div>
          )}

          {message && (
            <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-center text-sm text-slate-300">
              {message}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-start gap-3">
            <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
            <div>
              <h3 className="font-bold">Aturan Mining</h3>
              <ul className="mt-2 space-y-1 text-sm text-slate-400">
                <li>• Mining membutuhkan Blind Box Lock aktif minimal $10 (≈ Rp 179.370).</li>
                <li>• Setiap kelipatan $10 lock menghasilkan 1 SYS per hari.</li>
                <li>• Claim dibatasi 1 kali per user per hari oleh server.</li>
                <li>• Reward ditentukan server dan masuk ke saldo SYS user.</li>
                <li>• Mining berhenti otomatis ketika Lock berakhir.</li>
              </ul>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
