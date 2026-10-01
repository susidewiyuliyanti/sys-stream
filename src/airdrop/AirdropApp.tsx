import React from 'react';
import { SysLogo } from '../components/SysLogo';
import { Gift, ShieldCheck } from 'lucide-react';

export default function AirdropApp() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800"><div className="max-w-6xl mx-auto h-16 px-4 flex items-center"><SysLogo size="md" showText /></div></header>
      <main className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6"><Gift className="w-8 h-8 text-amber-400"/></div>
        <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 mb-4"><ShieldCheck className="w-4 h-4"/> OFFICIAL SYS STREAM AIRDROP</div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight">SYS STREAM Airdrop</h1>
        <p className="max-w-2xl mx-auto mt-4 text-slate-400">Halaman resmi untuk program airdrop SYS STREAM. Program, syarat, periode, dan distribusi akan dikelola dari sistem produksi.</p>
        <div className="mt-10 bg-slate-900 border border-slate-800 rounded-3xl p-8 text-left">
          <h2 className="text-lg font-bold">Airdrop Program</h2>
          <p className="text-sm text-slate-400 mt-2">Dashboard dan mekanisme claim akan ditempatkan di subdomain ini tanpa mencampurkan halaman airdrop dengan aplikasi game utama.</p>
        </div>
      </main>
    </div>
  );
}
