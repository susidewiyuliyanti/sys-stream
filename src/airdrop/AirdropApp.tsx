import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2, CircleDollarSign, Clock3, ExternalLink, FileVideo, Gift,
  Link2, ListChecks, Menu, ShieldCheck, Trophy, Upload, WalletCards, X, Youtube
} from 'lucide-react';
import { SysLogo } from '../components/SysLogo';

type TaskType = 'youtube' | 'tiktok' | 'instagram' | 'shorts' | 'social' | 'upload' | 'deposit' | 'withdrawal' | 'profile' | 'checkin';
type Task = {
  id: string; type: TaskType; title: string; description: string;
  reward: string; estimated: string; daily?: boolean; priority?: boolean; action: string;
};

type Leader = { rank:number; username:string; referrals:number };

const TASKS: Task[] = [
  { id:'daily-checkin', type:'checkin', title:'Daily Check-in', description:'Open the Airdrop Center once each day and complete your daily check-in. Keep your streak active for campaign rewards.', reward:'Configured by program', estimated:'30 seconds', daily:true, action:'Check In' },
  { id:'tiktok-upload', type:'tiktok', title:'Upload to TikTok', description:'Create and upload an original SYS STREAM video to your TikTok account, then submit the public video URL as proof.', reward:'Configured by program', estimated:'10–20 minutes', daily:true, action:'Start TikTok Task' },
  { id:'instagram-reel', type:'instagram', title:'Post an Instagram Reel', description:'Create an original SYS STREAM Reel and publish it on Instagram. Submit the public Reel URL as proof.', reward:'Configured by program', estimated:'10–20 minutes', daily:true, action:'Start Instagram Task' },
  { id:'youtube-shorts', type:'shorts', title:'Upload a YouTube Short', description:'Create an original vertical video about SYS STREAM and publish it as a YouTube Short. Submit the public URL as proof.', reward:'Configured by program', estimated:'10–20 minutes', daily:true, action:'Start Shorts Task' },
  { id:'youtube-upload', type:'youtube', title:'Upload Video ke YouTube', description:'Buat video original tentang SYS STREAM, upload ke channel YouTube kamu, lalu kirim URL video sebagai bukti.', reward:'Configured by program', estimated:'15–30 menit', daily:true, priority:true, action:'Start YouTube Task' },
  { id:'youtube-review', type:'youtube', title:'Watch & Honest Review', description:'Tonton konten campaign dan berikan feedback yang jujur. Tidak ada kewajiban memberikan rating positif.', reward:'Configured by program', estimated:'5–10 menit', daily:true, action:'Open Review Task' },
  { id:'social-daily', type:'social', title:'Daily Social Task', description:'Selesaikan aktivitas sosial yang tercantum pada brief campaign. Jangan gunakan akun palsu atau otomatisasi.', reward:'Configured by program', estimated:'2–5 menit', daily:true, action:'View Task' },
  { id:'deposit', type:'deposit', title:'Complete a Deposit', description:'Lakukan deposit nyata melalui halaman resmi SYS STREAM. Reward hanya diproses jika transaksi memenuhi aturan campaign.', reward:'Configured by program', estimated:'5 menit', action:'Open Deposit' },
  { id:'withdrawal', type:'withdrawal', title:'Complete a Withdrawal', description:'Ajukan withdrawal sesuai saldo dan aturan. Periksa alamat wallet dan network sebelum konfirmasi.', reward:'Configured by program', estimated:'5 menit', action:'Open Withdrawal' },
  { id:'profile', type:'profile', title:'Complete Your Profile', description:'Lengkapi informasi profil dasar agar akun siap mengikuti campaign dan proses reward.', reward:'Configured by program', estimated:'2 menit', action:'Open Profile' },
];

function typeIcon(type:TaskType) {
  if(type==='youtube'||type==='shorts') return <Youtube className="w-5 h-5"/>;
  if(type==='tiktok') return <span className="text-sm font-black">♪</span>;
  if(type==='instagram') return <span className="text-sm font-black">◎</span>;
  if(type==='checkin') return <Clock3 className="w-5 h-5"/>;
  if(type==='upload') return <Upload className="w-5 h-5"/>;
  if(type==='deposit') return <CircleDollarSign className="w-5 h-5"/>;
  if(type==='withdrawal') return <WalletCards className="w-5 h-5"/>;
  if(type==='profile') return <CheckCircle2 className="w-5 h-5"/>;
  return <Link2 className="w-5 h-5"/>;
}
function typeLabel(type:TaskType) {
  if(type==='youtube') return 'YOUTUBE';
  if(type==='shorts') return 'YOUTUBE SHORTS';
  if(type==='tiktok') return 'TIKTOK';
  if(type==='instagram') return 'INSTAGRAM';
  if(type==='checkin') return 'CHECK-IN';
  if(type==='upload') return 'PROOF';
  if(type==='deposit') return 'DEPOSIT';
  if(type==='withdrawal') return 'WITHDRAWAL';
  if(type==='profile') return 'PROFILE';
  return 'SOCIAL';
}

const COPY = {
  en:{tasks:'Tasks',submissions:'My submissions',login:'Login',hero:'{tx.hero}',intro:'Complete campaign tasks across YouTube, TikTok and Instagram. Submit public proof links and follow the rules for each task.',daily:'TODAY\'S DAILY MISSIONS',dailySub:'Daily tasks may change based on the active campaign.',available:'Available Tasks',empty:'No submissions yet',emptySub:'Your submissions will appear here after your account is connected.',instructions:'Task instructions',live:'LIVE'},
  id:{tasks:'Tugas',submissions:'Pengajuan saya',login:'Masuk',hero:'Tugas harian. Buat konten. Kirim bukti. Dapatkan reward airdrop.',intro:'Selesaikan task campaign di YouTube, TikTok, dan Instagram. Kirim link bukti publik dan ikuti aturan setiap task.',daily:'MISI HARIAN HARI INI',dailySub:'Task harian dapat berubah sesuai campaign aktif.',available:'Task Tersedia',empty:'Belum ada submission',emptySub:'{tx.emptySub}',instructions:'Instruksi task',live:'LANGSUNG'}
} as const;

export default function AirdropApp() {
  const [selectedTask,setSelectedTask]=useState<Task|null>(null);
  const [menuOpen,setMenuOpen]=useState(false);
  const [tab,setTab]=useState<'tasks'|'submissions'>('tasks');
  const [leaders,setLeaders]=useState<Leader[]>([]);
  const [leaderboardUpdated,setLeaderboardUpdated]=useState<number|null>(null);
  const [leaderboardError,setLeaderboardError]=useState('');
  const [lang,setLang]=useState<'en'|'id'>('en');
  const tx=COPY[lang];

  useEffect(()=>{
    let active=true;
    const load=async()=>{
      try{
        const res=await fetch('/api/airdrop/referral-leaderboard',{cache:'no-store'});
        const data=await res.json().catch(()=>({}));
        if(!res.ok || !data.success) throw new Error(data.error || 'Leaderboard unavailable');
        if(active){setLeaders(Array.isArray(data.leaderboard)?data.leaderboard:[]);setLeaderboardUpdated(Number(data.updatedAt||Date.now()/1000));setLeaderboardError('');}
      }catch(e){if(active)setLeaderboardError(e instanceof Error?e.message:'Leaderboard unavailable');}
    };
    load();
    const timer=window.setInterval(load,10000);
    return()=>{active=false;window.clearInterval(timer);};
  },[]);

  const availableTasks=useMemo(()=>TASKS,[]);
  return <div className="min-h-screen bg-slate-950 text-slate-100">
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="max-w-7xl mx-auto h-16 px-4 flex items-center justify-between">
        <a href="https://sysstreamer.asia"><SysLogo size="md" showText/></a>
        <nav className="hidden md:flex items-center gap-2 text-sm"><button onClick={()=>setLang(v=>v==='en'?'id':'en')} className="px-3 py-2 rounded-lg border border-slate-800 text-xs font-bold">{lang.toUpperCase()}</button>
          <button onClick={()=>setTab('tasks')} className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900">{tx.tasks}</button>
          <button onClick={()=>setTab('submissions')} className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900">{tx.submissions}</button>
          <a href="https://sysstreamer.asia/login" className="px-4 py-2 rounded-lg bg-slate-100 text-slate-950 font-bold">{tx.login}</a>
        </nav>
        <button className="md:hidden p-2 rounded-lg" onClick={()=>setMenuOpen(v=>!v)}>{menuOpen?<X className="w-5 h-5"/>:<Menu className="w-5 h-5"/>}</button>
      </div>
      {menuOpen&&<div className="md:hidden border-t border-slate-800 px-4 py-3 space-y-2">
        <button onClick={()=>{setTab('tasks');setMenuOpen(false)}} className="block w-full text-left px-3 py-2">Tasks</button>
        <button onClick={()=>{setTab('submissions');setMenuOpen(false)}} className="block w-full text-left px-3 py-2">My submissions</button>
        <a href="https://sysstreamer.asia/login" className="block px-3 py-2 rounded-lg bg-slate-100 text-slate-950 font-bold">Login</a>
      </div>}
    </header>

    <main className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
      <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-10 overflow-hidden relative">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl"/>
        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-amber-400"><ShieldCheck className="w-4 h-4"/> SYS STREAM TASK CENTER</div>
          <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight">Daily tasks. Create content. Submit proof. Earn airdrop rewards.</h1>
          <p className="mt-4 text-slate-400 max-w-2xl">{tx.intro}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-300">
            <span className="px-3 py-2 rounded-full bg-slate-800 border border-slate-700">✓ Instruksi per task</span>
            <span className="px-3 py-2 rounded-full bg-slate-800 border border-slate-700">✓ Proof submission</span>
            <span className="px-3 py-2 rounded-full bg-slate-800 border border-slate-700">✓ Review sebelum reward</span>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-amber-500/20 bg-amber-500/5 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-black tracking-wider text-amber-400"><Trophy className="w-4 h-4"/> REFERRAL LEADERBOARD</div>
            <h2 className="mt-1 text-xl font-black">Top Referrers — Live</h2>
            <p className="mt-1 text-xs text-slate-500">Ranking diperbarui otomatis setiap 10 detik dari data referral production.</p>
          </div>
          <div className="text-right text-[10px] text-slate-500">{leaderboardUpdated ? 'LIVE' : 'CONNECTING'}</div>
        </div>
        {leaderboardError ? <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-300">Leaderboard belum tersedia. Database referral perlu diaktifkan.</div> :
          <div className="mt-5 grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(leaders.length?leaders:Array.from({length:3},(_,i)=>({rank:i+1,username:'—',referrals:0}))).map((leader,i)=>
              <div key={leader.rank} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black ${i===0?'bg-amber-400 text-slate-950':'bg-slate-800 text-slate-300'}`}>#{leader.rank}</div>
                <div className="min-w-0 flex-1"><div className="font-bold truncate">{leader.username}</div><div className="text-[10px] text-slate-500">Successful referrals</div></div>
                <div className="text-right"><div className="font-black text-amber-400">{leader.referrals}</div><div className="text-[9px] text-slate-500">REFS</div></div>
              </div>
            )}
          </div>}
      </section>

      <section className="mt-8 rounded-3xl border border-amber-500/20 bg-amber-500/5 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div><div className="text-xs font-black tracking-wider text-amber-400">TODAY'S DAILY MISSIONS</div><h2 className="mt-1 text-xl font-black">{tx.daily}</h2><p className="mt-1 text-xs text-slate-500">{tx.dailySub}</p></div>
          <div className="text-xs text-slate-400">3 daily missions</div>
        </div>
        <div className="mt-5 grid md:grid-cols-3 gap-3">
          {TASKS.filter(t=>t.daily).map(t=><button key={t.id} onClick={()=>setSelectedTask(t)} className="text-left rounded-2xl border border-slate-800 bg-slate-950/70 p-4 hover:border-amber-500/40">
            <div className="flex items-center justify-between"><span className="text-amber-400">{typeIcon(t.type)}</span>{t.priority&&<span className="text-[9px] font-black text-amber-300 bg-amber-400/10 px-2 py-1 rounded-full">PRIORITY</span>}</div>
            <div className="mt-3 font-bold text-sm">{t.title}</div><div className="mt-1 text-xs text-slate-500">{t.estimated} · Proof required</div>
          </button>)}
        </div>
      </section>

      <div className="mt-8 flex items-center gap-2 border-b border-slate-800">
        <button onClick={()=>setTab('tasks')} className={`px-4 py-3 text-sm font-bold border-b-2 ${tab==='tasks'?'border-amber-400 text-white':'border-transparent text-slate-500'}`}>{tx.available}</button>
        <button onClick={()=>setTab('submissions')} className={`px-4 py-3 text-sm font-bold border-b-2 ${tab==='submissions'?'border-amber-400 text-white':'border-transparent text-slate-500'}`}>My Submissions</button>
      </div>

      {tab==='tasks'?<section className="mt-6 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {availableTasks.map(t=><article key={t.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 flex flex-col">
          <div className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-xs font-bold text-slate-300">{typeIcon(t.type)} {typeLabel(t.type)}</span><div className="flex gap-1">{t.daily&&<span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">DAILY</span>}{t.priority&&<span className="text-[9px] font-black text-amber-300 bg-amber-400/10 px-2 py-1 rounded-full">PRIORITY</span>}</div></div>
          <h2 className="mt-5 text-lg font-bold">{t.title}</h2><p className="mt-2 text-sm leading-6 text-slate-400 flex-1">{t.description}</p>
          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-3"><div><div className="text-xs text-slate-500">Reward</div><div className="font-bold text-amber-400">{t.reward}</div></div><button onClick={()=>setSelectedTask(t)} className="px-4 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-sm">{t.action}</button></div>
        </article>)}
      </section>:<section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center"><FileVideo className="w-10 h-10 mx-auto text-slate-600"/><h2 className="mt-4 font-bold">{tx.empty}</h2><p className="mt-2 text-sm text-slate-500">Submission yang kamu kirim akan tampil di sini setelah akun terhubung.</p></section>}
    </main>

    <footer className="border-t border-slate-800 mt-12"><div className="max-w-7xl mx-auto px-4 py-6 text-xs text-slate-500 flex flex-wrap gap-3 justify-between"><span>SYS STREAM Airdrop & Task Center</span><span>Task rewards are subject to review and program rules.</span></div></footer>

    {selectedTask&&<div className="fixed inset-0 z-50 bg-black/70 p-4 flex items-center justify-center" onClick={()=>setSelectedTask(null)}>
      <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6" onClick={e=>e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4"><div><div className="text-xs font-bold text-amber-400">{typeLabel(selectedTask.type)}</div><h2 className="mt-1 text-xl font-black">{selectedTask.title}</h2></div><button onClick={()=>setSelectedTask(null)} className="p-2 rounded-lg hover:bg-slate-800"><X className="w-5 h-5"/></button></div>
        <div className="mt-6 rounded-xl bg-slate-950 border border-slate-800 p-4"><div className="text-xs text-slate-500">{tx.instructions}</div><p className="mt-2 text-sm text-slate-300">{selectedTask.description}</p></div>
        <a href="https://sysstreamer.asia/login" className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-amber-400 text-slate-950 font-bold"><ExternalLink className="w-4 h-4"/> Login to continue</a>
      </div>
    </div>}
  </div>;
}
