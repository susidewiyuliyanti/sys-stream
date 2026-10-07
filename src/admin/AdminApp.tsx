import React, { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../i18n';
import { SysLogo } from '../components/SysLogo';
import AIAgentPanel from './AIAgentPanel';
import SocialMediaPanel from './SocialMediaPanel';
import EmailSendersPanel from './EmailSendersPanel';
import EmailInboxPanel from './EmailInboxPanel';
import EmailCampaignPanel from './EmailCampaignPanel';
import {
  Activity, Bot, CircleDollarSign, Gift, LayoutDashboard, LogOut, RefreshCw,
  Search, ShieldCheck, UserPlus, Users, WalletCards, ListChecks, Pencil, Trash2, Link2, Mail, Inbox, Send as SendIcon, Bell, CheckCheck
} from 'lucide-react';

const API = '/api/admin';

type AdminUser = { id:string; username:string; email:string; availableBalance:number; lockedBalance:number; role:string; createdAt:string; walletAddress?:string };
type AdminDeposit = { id:string; depositCode:string; userId:string; username:string; amount:number; durationDays:number; status:string; createdAt:string };
type AdminAccount = { id:string; email:string; displayName:string; role:string; active:number; createdAt:number };
type JackpotGrant = { id:string; userId:string; username:string; email:string; amount:number; currency:string; note:string; adminName:string; createdAt:number };
type AirdropTask = { id:number; title:string; description:string; category:string; rewardPoints:number; active:number; createdAt:string };
type AirdropSubmission = { id:number; walletAddress:string; taskId:number; taskTitle:string; category:string; evidenceLink:string; status:string; rewardPoints:number; createdAt:string };
type Streamer = { id:string; username:string; email:string; walletAddress:string; role:string; createdAt?:string };
type Tab = 'overview'|'users'|'streamers'|'transactions'|'jackpot'|'airdrop'|'admins'|'ai-agent'|'social'|'email'|'email-inbox'|'email-campaign';

export default function AdminApp() {
  const { t } = useLanguage();
  const [authenticated,setAuthenticated]=useState(false);
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [admin,setAdmin]=useState<any>(null);
  const [error,setError]=useState('');
  const [users,setUsers]=useState<AdminUser[]>([]);
  const [deposits,setDeposits]=useState<AdminDeposit[]>([]);
  const [admins,setAdmins]=useState<AdminAccount[]>([]);
  const [streamers,setStreamers]=useState<Streamer[]>([]);
  const [grants,setGrants]=useState<JackpotGrant[]>([]);
  const [airdropTasks,setAirdropTasks]=useState<AirdropTask[]>([]);
  const [airdropSubmissions,setAirdropSubmissions]=useState<AirdropSubmission[]>([]);
  const [analytics,setAnalytics]=useState<any>(null);
  const [loading,setLoading]=useState(false);
  const [checkingSession,setCheckingSession]=useState(true);
  const [tab,setTab]=useState<Tab>(()=>{
    const wanted=new URLSearchParams(window.location.search).get('tab');
    return wanted==='social'?'social':'overview';
  });
  const [query,setQuery]=useState('');

  const request=async(path:string,options:RequestInit={})=>{
    const response=await fetch(API+path,{...options,cache:'no-store',credentials:'same-origin',headers:{'Content-Type':'application/json',...(options.headers||{})}});
    const data=await response.json().catch(()=>({}));
    if(!response.ok||!data.success) throw new Error(data.error||'Request gagal.');
    return data;
  };

  const checkSession=async()=>{
    setCheckingSession(true);
    try { const data=await request('/me'); setAdmin(data.admin); setAuthenticated(true); }
    catch { setAuthenticated(false); }
    finally { setCheckingSession(false); }
  };

  const loadDashboard=async()=>{
    if(!authenticated)return;
    setLoading(true);setError('');
    try{
      // Do not let one optional admin endpoint hide valid Users data.
      // Each panel loads independently so a schema/API issue in deposits,
      // bonuses, tasks, streamers, or named-admins cannot blank the Users tab.
      const results=await Promise.allSettled([
        request('/users'),
        request('/deposits'),
        request('/bonuses'),
        request('/admins'),
        request('/airdrop-tasks'),
        request('/airdrop-submissions'),
        request('/streamers'),
        request('/analytics')
      ]);

      const [u,d,b,a,t,sub,s,an]=results;
      const failures:string[]=[];

      if(u.status!=='fulfilled') failures.push('users');
      else setUsers(Array.isArray(u.value.users) ? u.value.users : []);
      if(d.status==='fulfilled') setDeposits(d.value.deposits||[]);
      else failures.push('deposits');
      if(b.status==='fulfilled') setGrants(b.value.grants||[]);
      else failures.push('bonuses');
      if(a.status==='fulfilled'){
        setAdmins(a.value.admins||[]);
        setAdmin(a.value.currentAdmin||admin);
      }else failures.push('admins');
      if(t.status==='fulfilled') setAirdropTasks(t.value.tasks||[]);
      else failures.push('airdrop-tasks');
      if(sub.status==='fulfilled') setAirdropSubmissions(sub.value.submissions||[]);
      else failures.push('airdrop-submissions');
      if(s.status==='fulfilled') setStreamers(s.value.streamers||[]);
      else failures.push('streamers');
      if(an.status==='fulfilled'){
        setAnalytics(an.value);
        // Analytics is the single authoritative snapshot for the Admin Users
        // table and overview. The dedicated /users endpoint is only a fallback
        // when analytics itself is unavailable.
        if(Array.isArray(an.value.users) && an.value.users.length) {
          // Analytics enriches the dashboard summary, but the dedicated Users
          // endpoint remains the authoritative user snapshot. Never replace a
          // valid user snapshot with an empty analytics payload.
          if(u.status!=='fulfilled') setUsers(an.value.users);
        }
      } else {
        failures.push('analytics');
        if(u.status==='fulfilled') setUsers(u.value.users||[]);
      }

      const unauthorized=results.some(r=>r.status==='rejected' && /session|unauthorized/i.test(String(r.reason?.message||r.reason||'')));
      if(unauthorized){
        setAuthenticated(false);
        setError('Sesi admin berakhir. Silakan login kembali.');
      }else if(failures.length){
        setError('Sebagian data admin gagal dimuat: '+failures.join(', ')+'. Data Users tetap ditampilkan jika tersedia.');
      }
    }catch(e:any){
      if(/session|unauthorized/i.test(e?.message||''))setAuthenticated(false);
      setError(e?.message||'Gagal memuat dashboard.');
    }finally{setLoading(false);}
  };

  useEffect(()=>{void checkSession();},[]);
  useEffect(()=>{
    if(!authenticated)return;
    void loadDashboard();
    const timer=window.setInterval(()=>void loadDashboard(),15000);
    return()=>window.clearInterval(timer);
  },[authenticated]);

  const login=async(e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();setError('');setLoading(true);
    try{
      // Read the actual DOM controls at submit time. This deliberately does
      // not depend on React onChange firing, which some password managers and
      // browser autofill implementations do not trigger.
      const form=e.currentTarget;
      const emailInput=form.elements.namedItem('email') as HTMLInputElement | null;
      const passwordInput=form.elements.namedItem('password') as HTMLInputElement | null;
      const loginEmail=String(emailInput?.value || '').trim().toLowerCase();
      const loginPassword=String(passwordInput?.value || '');
      if(!loginPassword) throw new Error('Password / Owner Key wajib diisi.');
      const data=await request('/login',{method:'POST',body:JSON.stringify({email:loginEmail,password:loginPassword})});
      setAdmin(data.admin);setEmail('');setPassword('');setAuthenticated(true);
    }catch(e:any){setError(e?.message||'Login admin gagal.');}
    finally{setLoading(false);}
  };

  const logout=async()=>{
    try{await request('/logout',{method:'POST'});}catch{}
    setAuthenticated(false);setAdmin(null);setUsers([]);setDeposits([]);setAdmins([]);setGrants([]);setAirdropTasks([]);setAirdropSubmissions([]);setStreamers([]);setTab('overview');
  };

  const filteredUsers=useMemo(()=>{
    const q=query.trim().toLowerCase(); if(!q)return users;
    return users.filter(u=>[u.username,u.email,u.id].some(v=>String(v||'').toLowerCase().includes(q)));
  },[users,query]);

  if(checkingSession)return <Loading/>;

  if(!authenticated)return(
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-7"><SysLogo size="md" showText/></div>
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-center gap-2 text-amber-400 text-sm font-black mb-2"><ShieldCheck className="w-4 h-4"/> ADMIN PANEL</div>
          <h1 className="text-center text-xl font-black">Secure administrator access</h1>
          <p className="text-center text-xs text-slate-500 mt-2 mb-7">Separate production control panel for SYS STREAM.</p>
          <form onSubmit={login} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Admin Email <span className="text-slate-600">(leave blank for owner key)</span></label>
              <input name="email" type="email" defaultValue="" onChange={e=>setEmail(e.target.value)} placeholder="admin@sysstreamer.asia" className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm outline-none focus:border-amber-500" autoComplete="username"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Password / Owner Key</label>
              <input name="password" type="password" defaultValue="" onChange={e=>setPassword(e.target.value)} placeholder="Enter secure credential" className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm outline-none focus:border-amber-500" autoComplete="current-password" autoFocus/>
            </div>
            {error&&<div className="rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 text-xs p-3">{error}</div>}
            <button disabled={loading} className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-extrabold py-3">{loading?'Signing in...':'Sign in'}</button>
          </form>
        </div>
      </div>
    </div>
  );

  const displayUsers=users.length ? users : (Array.isArray(analytics?.users) ? analytics.users : []);
  const totalUsers=Number(analytics?.summary?.totalUsers ?? displayUsers.length);
  const totalBalance=Number(analytics?.summary?.totalAvailableBalance ?? displayUsers.reduce((sum,u)=>sum+Number(u.availableBalance||0),0));
  const totalLocked=Number(analytics?.summary?.totalLockedBalance ?? displayUsers.reduce((sum,u)=>sum+Number(u.lockedBalance||0),0));
  const totalSys=Number(analytics?.summary?.totalSysBalance ?? displayUsers.reduce((sum,u)=>sum+Number((u as any).sysBalance||0),0));

  return(
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="max-w-[1500px] mx-auto h-16 px-4 lg:px-6 flex items-center justify-between">
          <SysLogo size="md" showText/>
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right"><div className="text-xs font-bold">{admin?.displayName||'Owner'}</div><div className="text-[10px] text-amber-400">{admin?.role||'OWNER'}</div></div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-400 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>Production</div>
            <AdminNotificationBell/>
            <button onClick={()=>void loadDashboard()} className="p-2 rounded-lg border border-slate-800 hover:border-slate-600"><RefreshCw className={`w-4 h-4 ${loading?'animate-spin':''}`}/></button>
            <button onClick={()=>void logout()} className="p-2 rounded-lg border border-slate-800 hover:border-red-500/50 text-slate-400"><LogOut className="w-4 h-4"/></button>
          </div>
        </div>
      </header>

      <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-6 lg:py-8">
        <div className="grid lg:grid-cols-[220px_minmax(0,1fr)] gap-6">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav className="bg-slate-900 border border-slate-800 rounded-2xl p-2 space-y-1">
              <NavButton active={tab==='overview'} onClick={()=>setTab('overview')} icon={<LayoutDashboard/>} label="Overview"/>
              <NavButton active={tab==='users'} onClick={()=>setTab('users')} icon={<Users/>} label="Users"/>
              <NavButton active={tab==='streamers'} onClick={()=>setTab('streamers')} icon={<Activity/>} label="Streamers"/>
              <NavButton active={tab==='transactions'} onClick={()=>setTab('transactions')} icon={<WalletCards/>} label="Transactions"/>
              <NavButton active={tab==='jackpot'} onClick={()=>setTab('jackpot')} icon={<Gift/>} label="Jackpot Grants"/>
              <NavButton active={tab==='airdrop'} onClick={()=>setTab('airdrop')} icon={<ListChecks/>} label="User Tasks / Airdrop Task"/>
              <NavButton active={tab==='ai-agent'} onClick={()=>setTab('ai-agent')} icon={<Bot/>} label="AI Agent"/>
              <NavButton active={tab==='social'} onClick={()=>setTab('social')} icon={<Link2/>} label="Social Media"/>
              <NavButton active={tab==='email'} onClick={()=>setTab('email')} icon={<Mail/>} label="Email Senders"/>
              <NavButton active={tab==='email-campaign'} onClick={()=>setTab('email-campaign')} icon={<SendIcon/>} label="Email Campaign"/>
              <NavButton active={tab==='email-inbox'} onClick={()=>setTab('email-inbox')} icon={<Inbox/>} label="Customer Email Inbox"/>
              {admin?.role==='OWNER'&&<NavButton active={tab==='admins'} onClick={()=>setTab('admins')} icon={<UserPlus/>} label="Admin Accounts"/>}
            </nav>
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300"><ShieldCheck className="w-4 h-4 text-amber-400"/> Admin isolation</div>
              <p className="text-[11px] leading-5 text-slate-500 mt-2">User app and administrator functions remain separated by hostname.</p>
            </div>
          </aside>

          <main className="min-w-0">
            {error&&<div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm p-4">{error}</div>}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400"><Activity className="w-4 h-4"/> SYS STREAM ADMIN</div><h1 className="text-2xl lg:text-3xl font-black mt-2">{tab==='overview'?'Control Center':tab==='users'?'Users':tab==='streamers'?'Streamer Management':tab==='transactions'?'Transactions':tab==='jackpot'?'Jackpot Grants':tab==='airdrop'?'User Tasks / Airdrop Task':tab==='ai-agent'?'AI Agent' :tab==='social'?'Social Media':tab==='email'?'Email Senders':tab==='email-inbox'?'Customer Email Inbox':tab==='email-campaign'?'Email Campaign':'Admin Accounts'}</h1><p className="text-sm text-slate-500 mt-1">Production data only. Promotional grants are separately audited and do not alter random game results.</p></div>
                {(tab==='users'||tab==='transactions')&&<div className="relative w-full md:w-80"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={tab==='users'?'Search user, email...':'Search transaction...'} className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-slate-600"/></div>}
              </div>
            </div>

            {tab==='overview'&&<Overview users={displayUsers} deposits={deposits} totalUsers={totalUsers} totalBalance={totalBalance} totalLocked={totalLocked} analytics={analytics}/>} 
            {tab==='users'&&<UsersTable users={filteredUsers} canEditBalance={admin?.role==='OWNER'} onRefresh={()=>void loadDashboard()}/>}
            {tab==='streamers'&&<StreamersPanel users={users} streamers={streamers} onRefresh={()=>void loadDashboard()}/>}
            {tab==='transactions'&&<TransactionsTable deposits={deposits}/>}
            {tab==='jackpot'&&<JackpotPanel users={users} grants={grants} onRefresh={()=>void loadDashboard()}/>}
            {tab==='airdrop'&&<AirdropTaskPanel tasks={airdropTasks} onRefresh={()=>void loadDashboard()}/>}
            {tab==='ai-agent'&&<AIAgentPanel/>}
            {tab==='social'&&<SocialMediaPanel adminRole={admin?.role}/>} 
            {tab==='email'&&<EmailSendersPanel/>}
            {tab==='email-inbox'&&<EmailInboxPanel/>}
            {tab==='email-campaign'&&<EmailCampaignPanel/>}
            {tab==='admins'&&admin?.role==='OWNER'&&<AdminsPanel admins={admins} onRefresh={()=>void loadDashboard()}/>}
          </main>
        </div>
      </div>
    </div>
  );
}

function Overview({users,deposits,totalUsers,totalBalance,totalLocked,analytics}:{users:AdminUser[];deposits:AdminDeposit[];totalUsers:number;totalBalance:number;totalLocked:number;analytics:any}){
 const summary=analytics?.summary||{};
 return <div className="space-y-6">
  <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
   <Stat icon={<Users/>} label="Total Users" value={Number(totalUsers).toLocaleString()}/>
   <Stat icon={<CircleDollarSign/>} label="Available Balance — All Users (USDT)" value={formatNumber(totalBalance)}/>
   <Stat icon={<WalletCards/>} label="Locked Balance — All Users (USDT)" value={formatNumber(totalLocked)}/>
   <Stat icon={<Gift/>} label="SYS Balance — All Users" value={formatNumber(Number(summary.totalSysBalance||0))}/>
   <Stat icon={<Users/>} label="Users with Wallet" value={Number(summary.walletUsers||0).toLocaleString()}/>
   <Stat icon={<ShieldCheck/>} label="Verified Users" value={Number(summary.verifiedUsers||0).toLocaleString()}/>
  </div>
  <div className="grid xl:grid-cols-2 gap-6">
   <Panel title="Users" meta={`${totalUsers} records`}>
    {users.slice(0,8).map(u=><div key={u.id} className="flex justify-between gap-4 py-2 border-b border-slate-800 last:border-0"><div className="min-w-0"><div className="font-semibold truncate">{u.username||u.id}</div><div className="text-xs text-slate-500 truncate">{u.email||'-'}</div></div><div className="text-right text-sm">{formatNumber(Number(u.availableBalance||0))} USDT<div className="text-[11px] text-slate-500">available</div></div></div>)}{!users.length&&<EmptyState text="No production users yet."/>}
   </Panel>
   <Panel title="Recent Transactions" meta={`${deposits.length} records`}>
    {deposits.slice(0,8).map(d=><div key={d.id} className="flex justify-between gap-4 py-2 border-b border-slate-800 last:border-0"><div><div className="font-mono text-xs">{d.depositCode||d.id}</div><div className="text-xs text-slate-500">{d.username||d.userId}</div></div><div className="text-right text-sm">{formatNumber(Number(d.amount||0))} USDT<div className="text-[11px] text-slate-500">{d.status||'-'}</div></div></div>)}{!deposits.length&&<EmptyState text="No production transactions yet."/>}
   </Panel>
  </div>
 </div>;
}

function UsersTable({users,canEditBalance,onRefresh}:{users:AdminUser[];canEditBalance:boolean;onRefresh:()=>void}){
 const [editing,setEditing]=useState<AdminUser|null>(null);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const [newBalance,setNewBalance]=useState('');
 const [note,setNote]=useState('');
 const openEditor=(u:AdminUser)=>{setEditing(u);setNewBalance(String(Number(u.availableBalance||0)));setNote('');setMessage('');};
 const closeEditor=()=>{if(!busy){setEditing(null);setMessage('');}};
 const save=async(e:React.FormEvent)=>{
  e.preventDefault();
  if(!editing)return;
  const value=Number(newBalance);
  if(!Number.isFinite(value)||value<0){setMessage('Saldo harus berupa angka 0 atau lebih.');return;}
  if(!note.trim()){setMessage('Catatan perubahan saldo wajib diisi.');return;}
  setBusy(true);setMessage('');
  try{
   const r=await fetch(API+'/balance',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId:editing.id,availableBalance:value,note:note.trim()})});
   const d=await r.json().catch(()=>({}));
   if(!r.ok||!d.success)throw new Error(d.error||'Gagal mengubah saldo.');
   setMessage(`Saldo ${editing.username||editing.email||editing.id} berhasil diubah.`);
   setEditing(null);setNewBalance('');setNote('');
   await onRefresh();
  }catch(e:any){setMessage(e?.message||'Gagal mengubah saldo.');}finally{setBusy(false);}
 };
 return <div className="space-y-6">
  <Panel title="All Users" meta={`${users.length} matching records`}>
   <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-800"><tr><th className="text-left py-3 pr-4">User</th><th className="text-left py-3 pr-4">Email</th><th className="text-right py-3 pr-4">Available</th><th className="text-right py-3 pr-4">Locked</th><th className="text-left py-3 pr-4">Role</th><th className="text-right py-3">Action</th></tr></thead><tbody className="divide-y divide-slate-800">{users.map(u=><tr key={u.id}><td className="py-3 pr-4 font-semibold">{u.username||u.id}</td><td className="py-3 pr-4 text-slate-400">{u.email||'-'}</td><td className="py-3 pr-4 text-right font-semibold">{formatNumber(Number(u.availableBalance||0))} USDT</td><td className="py-3 pr-4 text-right">{formatNumber(Number(u.lockedBalance||0))} USDT</td><td className="py-3 pr-4"><span className="text-xs rounded-full px-2 py-1 bg-slate-800">{u.role||'USER'}</span></td><td className="py-3 text-right">{canEditBalance&&<button type="button" onClick={()=>openEditor(u)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 text-xs font-bold"><Pencil className="w-3.5 h-3.5"/> Edit Balance</button>}</td></tr>)}</tbody></table>{!users.length&&<EmptyState text="No users found."/>}</div>
  </Panel>
  {editing&&<div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onMouseDown={e=>{if(e.target===e.currentTarget)closeEditor();}}>
   <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-5">
    <div className="flex items-start justify-between gap-4 mb-5"><div><div className="text-xs uppercase tracking-wider text-amber-400 font-bold">OWNER ONLY • USDT</div><h3 className="text-xl font-black mt-1">Edit User Balance</h3><p className="text-xs text-slate-500 mt-1">{editing.username||editing.email||editing.id} • Current Available: {formatNumber(Number(editing.availableBalance||0))} USDT</p></div><button type="button" onClick={closeEditor} className="text-slate-500 hover:text-slate-200 text-xl">×</button></div>
    <form onSubmit={save} className="space-y-4">
     <div><label className="block text-xs font-semibold text-slate-400 mb-2">New Available Balance (USDT)</label><input autoFocus type="number" min="0" step="0.01" value={newBalance} onChange={e=>setNewBalance(e.target.value)} className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm outline-none focus:border-amber-500"/></div>
     <div><label className="block text-xs font-semibold text-slate-400 mb-2">Audit Note (USDT)</label><textarea required maxLength={500} value={note} onChange={e=>setNote(e.target.value)} rows={3} placeholder="Contoh: koreksi saldo deposit / kompensasi / manual adjustment" className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm outline-none focus:border-amber-500"/></div>
     {message&&<div className="rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 text-xs p-3">{message}</div>}
     <div className="flex justify-end gap-2"><button type="button" disabled={busy} onClick={closeEditor} className="px-4 py-2.5 rounded-xl border border-slate-700 text-sm">Cancel</button><button disabled={busy||!note.trim()} className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-extrabold">{busy?'Saving...':'Save Balance'}</button></div>
    </form>
   </div>
  </div>}
 </div>;
}

function StreamersPanel({users,streamers,onRefresh}:{users:AdminUser[];streamers:Streamer[];onRefresh:()=>void}){
 const [userId,setUserId]=useState(''); const [busy,setBusy]=useState(false); const [message,setMessage]=useState('');
 const availableUsers=users.filter(u=>String(u.role||'user').toLowerCase()!=='streamer');
 const promote=async(e:React.FormEvent)=>{e.preventDefault();if(!userId)return;setBusy(true);setMessage('');try{const r=await fetch(API+'/streamers',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId,action:'promote'})});const d=await r.json().catch(()=>({}));if(!r.ok||!d.success)throw new Error(d.error||'Gagal menambahkan streamer.');setMessage('User berhasil ditetapkan sebagai Official Streamer Partner.');setUserId('');onRefresh();}catch(e:any){setMessage(e?.message||'Gagal menambahkan streamer.')}finally{setBusy(false)}};
 const remove=async(id:string)=>{if(!confirm(t('Hapus status Official Streamer dari user ini?')))return;setBusy(true);setMessage('');try{const r=await fetch(API+'/streamers',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId:id,action:'remove'})});const d=await r.json().catch(()=>({}));if(!r.ok||!d.success)throw new Error(d.error||'Gagal mencabut status streamer.');setMessage('Status streamer dicabut.');onRefresh();}catch(e:any){setMessage(e?.message||'Gagal mencabut status streamer.')}finally{setBusy(false)}};
 return <div className="space-y-6">
 <Panel title="Official Streamer Partner" meta="Admin/Owner dapat menunjuk user production sebagai streamer resmi SYS STREAM">
  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 mb-5 text-xs leading-5 text-slate-400">Streamer resmi tetap menggunakan akun dan wallet user yang sama. Status ini memberikan identitas <strong className="text-slate-200">Official Streamer Partner</strong>; hak streaming pada room tetap divalidasi oleh backend berdasarkan kepemilikan room.</div>
  <form onSubmit={promote} className="flex flex-col md:flex-row gap-3">
   <select value={userId} onChange={e=>setUserId(e.target.value)} className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm"><option value="">Pilih user untuk dijadikan streamer...</option>{availableUsers.map(u=><option key={u.id} value={u.id}>{u.username||u.id} â€” {u.email||u.walletAddress||'wallet belum tersedia'}</option>)}</select>
   <button disabled={busy||!userId} className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-extrabold">{busy?'Processing...':'+ Tambah Streamer'}</button>
  </form>
  {message&&<div className="mt-3 text-xs text-slate-300">{message}</div>}
 </Panel>
 <Panel title="Daftar Official Streamer" meta={streamers.length+' streamer production'}>
  <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-800"><tr><th className="text-left py-3 pr-4">Streamer</th><th className="text-left py-3 pr-4">Wallet</th><th className="text-left py-3 pr-4">Status</th><th className="text-right py-3">Action</th></tr></thead><tbody className="divide-y divide-slate-800">{streamers.map(s=><tr key={s.id}><td className="py-3 pr-4"><div className="font-semibold">{s.username||s.id}</div><div className="text-xs text-slate-500">{s.email||'-'}</div></td><td className="py-3 pr-4 font-mono text-xs text-slate-400">{s.walletAddress||'-'}</td><td className="py-3"><span className="text-xs rounded-full px-2 py-1 bg-emerald-500/10 text-emerald-400">OFFICIAL STREAMER</span></td><td className="py-3 text-right"><button disabled={busy} onClick={()=>void remove(s.id)} className="px-3 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold">Cabut Status</button></td></tr>)}</tbody></table>{!streamers.length&&<EmptyState text="Belum ada Official Streamer Partner."/>}</div>
 </Panel>
 </div>;
}

function TransactionsTable({deposits}:{deposits:AdminDeposit[]}){
 return <Panel title="Deposits & Locks" meta={`${deposits.length} records`}><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-800"><tr><th className="text-left py-3 pr-4">Code</th><th className="text-left py-3 pr-4">User</th><th className="text-right py-3 pr-4">Amount</th><th className="text-left py-3 pr-4">Duration</th><th className="text-left py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-800">{deposits.map(d=><tr key={d.id}><td className="py-3 pr-4 font-mono text-xs">{d.depositCode||d.id}</td><td className="py-3 pr-4">{d.username||d.userId}</td><td className="py-3 pr-4 text-right">{formatNumber(Number(d.amount||0))}</td><td className="py-3 pr-4">{d.durationDays?`${d.durationDays} days`:'-'}</td><td className="py-3"><span className="text-xs rounded-full px-2 py-1 bg-slate-800">{d.status||'-'}</span></td></tr>)}</tbody></table>{!deposits.length&&<EmptyState text="No transactions found."/>}</div></Panel>;
}

function JackpotPanel({users,grants,onRefresh}:{users:AdminUser[];grants:JackpotGrant[];onRefresh:()=>void}){
 const [userId,setUserId]=useState('');const [amount,setAmount]=useState('');const [note,setNote]=useState('');const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
 const submit=async(e:React.FormEvent)=>{e.preventDefault();setMessage('');setBusy(true);try{const r=await fetch(API+'/bonuses',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId,amount:Number(amount),note})});const d=await r.json();if(!r.ok||!d.success)throw new Error(d.error||'Grant gagal.');setMessage(`Promotional jackpot ${Number(amount).toFixed(2)} USDT diberikan ke ${d.grant.username||d.grant.email}.`);setAmount('');setNote('');onRefresh();}catch(e:any){setMessage(e?.message||'Grant gagal.')}finally{setBusy(false)}};
 return <div className="space-y-6"><Panel title="Promotional Jackpot Grant" meta="Manual reward credit with audit trail"><div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 mb-5 text-xs text-slate-400">Gunakan fitur ini untuk <strong className="text-slate-200">bonus/promotional jackpot</strong> yang diberikan secara eksplisit kepada user. Grant ini tidak mengubah hasil random Blind Box.</div><form onSubmit={submit} className="grid md:grid-cols-2 gap-4"><div><label className="block text-xs font-semibold text-slate-400 mb-2">Select User</label><select value={userId} onChange={e=>setUserId(e.target.value)} className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm"><option value="">Choose user...</option>{users.map(u=><option key={u.id} value={u.id}>{u.username} â€” {u.email}</option>)}</select></div><div><label className="block text-xs font-semibold text-slate-400 mb-2">Jackpot Value (USDT)</label><input type="number" min="0.01" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="e.g. 100" className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm"/></div><div className="md:col-span-2"><label className="block text-xs font-semibold text-slate-400 mb-2">Reason / Audit Note</label><input value={note} onChange={e=>setNote(e.target.value)} placeholder="Campaign, promotion, correction, etc." className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm"/></div><div className="md:col-span-2 flex items-center gap-3"><button disabled={busy||!userId||!amount} className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-extrabold flex items-center gap-2"><Gift className="w-4 h-4"/>{busy?'Processing...':'Grant Jackpot'}</button>{message&&<span className="text-xs text-slate-300">{message}</span>}</div></form></Panel><Panel title="Grant History" meta={`${grants.length} audited records`}><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-[11px] uppercase text-slate-500 border-b border-slate-800"><tr><th className="text-left py-3 pr-4">User</th><th className="text-right py-3 pr-4">Amount</th><th className="text-left py-3 pr-4">Note</th><th className="text-left py-3 pr-4">Admin</th><th className="text-left py-3">Date</th></tr></thead><tbody className="divide-y divide-slate-800">{grants.map(g=><tr key={g.id}><td className="py-3 pr-4">{g.username||g.email||g.userId}</td><td className="py-3 pr-4 text-right font-semibold">{formatNumber(Number(g.amount))} {g.currency}</td><td className="py-3 pr-4 text-slate-400">{g.note||'-'}</td><td className="py-3 pr-4 text-slate-400">{g.adminName}</td><td className="py-3 text-slate-500">{new Date(Number(g.createdAt)*1000).toLocaleString()}</td></tr>)}</tbody></table>{!grants.length&&<EmptyState text="No jackpot grants yet."/>}</div></Panel></div>;
}

function AirdropTaskPanel({tasks,submissions,onRefresh}:{tasks:AirdropTask[];submissions:AirdropSubmission[];onRefresh:()=>void}){
 const blank={title:'',description:'',category:'social',rewardPoints:'0',active:true};
 const [form,setForm]=useState(blank); const [editing,setEditing]=useState<number|null>(null); const [busy,setBusy]=useState(false); const [message,setMessage]=useState('');
 const save=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setMessage('');try{const method=editing?'PATCH':'POST';const body={...form,rewardPoints:Number(form.rewardPoints),...(editing?{id:editing}:{})};const r=await fetch(API+'/airdrop-tasks',{method,credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json().catch(()=>({}));if(!r.ok||!d.success)throw new Error(d.error||'Gagal menyimpan task.');setMessage(editing?'Task diperbarui.':'Task berhasil dibuat.');setForm(blank);setEditing(null);onRefresh();}catch(e:any){setMessage(e?.message||'Gagal menyimpan task.')}finally{setBusy(false)}};
 const edit=(t:AirdropTask)=>{setEditing(t.id);setForm({title:t.title,description:t.description,category:t.category,rewardPoints:String(t.rewardPoints),active:Boolean(t.active)})};
 const toggle=async(t:AirdropTask)=>{try{const r=await fetch(API+'/airdrop-tasks',{method:'PATCH',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:t.id,title:t.title,description:t.description,category:t.category,rewardPoints:t.rewardPoints,active:!t.active})});const d=await r.json();if(!r.ok||!d.success)throw new Error(d.error||'Gagal mengubah status.');onRefresh();}catch(e:any){setMessage(e?.message||'Gagal mengubah status.')}}
 const remove=async(t:AirdropTask)=>{if(!confirm(t('Hapus task ini? Jika sudah memiliki submission, task akan ditolak untuk menjaga riwayat produksi.')))return;try{const r=await fetch(API+'/airdrop-tasks?id='+t.id,{method:'DELETE',credentials:'same-origin'});const d=await r.json();if(!r.ok||!d.success)throw new Error(d.error||'Gagal menghapus task.');onRefresh();}catch(e:any){setMessage(e?.message||'Gagal menghapus task.')}}
 return <div className="space-y-6">
 <Panel title={editing?'Edit Airdrop Task':'Tambah Airdrop Task'} meta="Task yang aktif langsung tersedia di halaman Airdrop user">
 <form onSubmit={save} className="grid md:grid-cols-2 gap-4">
 <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Nama task" className="rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm"/>
 <input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} placeholder="Kategori: social, deposit, profile..." className="rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm"/>
 <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Instruksi task untuk user" rows={4} className="md:col-span-2 rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm"/>
 <input type="number" min="0" step="1" value={form.rewardPoints} onChange={e=>setForm({...form,rewardPoints:e.target.value})} placeholder="Reward points" className="rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm"/>
 <label className="flex items-center gap-3 rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})}/><span>Task aktif dan tampil ke user</span></label>
 <div className="md:col-span-2 flex items-center gap-3"><button disabled={busy||!form.title.trim()} className="px-5 py-3 rounded-xl bg-amber-500 text-slate-950 font-extrabold">{busy?'Saving...':editing?'Update Task':'Create Task'}</button>{editing&&<button type="button" onClick={()=>{setEditing(null);setForm(blank)}} className="px-4 py-3 rounded-xl border border-slate-700 text-sm">Cancel</button>}{message&&<span className="text-xs text-slate-300">{message}</span>}</div>
 </form></Panel>
 <Panel title="Airdrop Tasks" meta={tasks.length+' task records'}>
 <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-[11px] uppercase text-slate-500 border-b border-slate-800"><tr><th className="text-left py-3 pr-4">Task</th><th className="text-left py-3 pr-4">Category</th><th className="text-right py-3 pr-4">Reward</th><th className="text-left py-3 pr-4">Status</th><th className="text-right py-3">Action</th></tr></thead><tbody className="divide-y divide-slate-800">{tasks.map(t=><tr key={t.id}><td className="py-3 pr-4"><div className="font-semibold">{t.title}</div><div className="text-xs text-slate-500 max-w-xl">{t.description}</div></td><td className="py-3 pr-4">{t.category}</td><td className="py-3 pr-4 text-right text-amber-400 font-bold">{Number(t.rewardPoints||0).toLocaleString()} pts</td><td className="py-3 pr-4"><button onClick={()=>void toggle(t)} className={`text-xs rounded-full px-2 py-1 ${t.active?'bg-emerald-500/10 text-emerald-400':'bg-slate-800 text-slate-500'}`}>{t.active?'Active':'Inactive'}</button></td><td className="py-3 text-right"><div className="flex justify-end gap-2"><button onClick={()=>edit(t)} className="p-2 rounded-lg border border-slate-700 hover:border-amber-500"><Pencil className="w-4 h-4"/></button><button onClick={()=>void remove(t)} className="p-2 rounded-lg border border-slate-700 hover:border-red-500 text-red-400"><Trash2 className="w-4 h-4"/></button></div></td></tr>)}</tbody></table>{!tasks.length&&<EmptyState text="Belum ada Airdrop Task production."/>}</div></Panel>
 <Panel title="Review Airdrop Submissions" meta={submissions.filter(s=>String(s.status).toUpperCase()==='PENDING').length+' pending submissions'}>
 <div className="space-y-3">
 {submissions.length===0&&<EmptyState text="Belum ada submission Airdrop."/>}
 {submissions.map(s=>{
   const pending=String(s.status).toUpperCase()==='PENDING';
   return <div key={s.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
     <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
       <div className="min-w-0 flex-1">
         <div className="flex items-center gap-2 flex-wrap">
           <span className="font-bold">{s.taskTitle||('Task #'+s.taskId)}</span>
           <span className="text-[10px] rounded-full px-2 py-1 bg-slate-800 text-slate-400">{s.category||'social'}</span>
           <span className={`text-[10px] rounded-full px-2 py-1 ${pending?'bg-amber-500/10 text-amber-300':String(s.status).toUpperCase()==='APPROVED'?'bg-emerald-500/10 text-emerald-400':'bg-red-500/10 text-red-400'}`}>{s.status}</span>
         </div>
         <div className="mt-2 text-xs text-slate-500 break-all">Wallet: {s.walletAddress}</div>
         <div className="mt-1 text-xs text-amber-400 font-bold">Reward: {Number(s.rewardPoints||0).toLocaleString()} pts</div>
         {s.evidenceLink&&<a href={s.evidenceLink} target="_blank" rel="noreferrer" className="mt-3 inline-flex max-w-full text-xs text-slate-300 hover:text-amber-300 break-all underline">Buka bukti: {s.evidenceLink}</a>}
         <div className="mt-1 text-[10px] text-slate-600">{s.createdAt}</div>
       </div>
       {pending&&<div className="flex shrink-0 gap-2">
         <button onClick={async()=>{try{const r=await fetch(API+'/airdrop-submissions',{method:'PATCH',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:s.id,action:'APPROVED'})});const d=await r.json();if(!r.ok||!d.success)throw new Error(d.error||'Approval gagal.');onRefresh();}catch(e:any){window.alert(e?.message||'Approval gagal.');}}} className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black">Approve + Reward</button>
         <button onClick={async()=>{const note=window.prompt('Alasan reject (opsional):')||'';try{const r=await fetch(API+'/airdrop-submissions',{method:'PATCH',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:s.id,action:'REJECTED',note})});const d=await r.json();if(!r.ok||!d.success)throw new Error(d.error||'Reject gagal.');onRefresh();}catch(e:any){window.alert(e?.message||'Reject gagal.');}}} className="px-4 py-2 rounded-xl border border-red-500/30 text-red-400 text-xs font-black hover:bg-red-500/10">Reject</button>
       </div>}
     </div>
   </div>;
 })}
 </div>
 </Panel>
 </div>;
}

function AdminsPanel({admins,onRefresh}:{admins:AdminAccount[];onRefresh:()=>void}){
 const [email,setEmail]=useState('');const [name,setName]=useState('');const [password,setPassword]=useState('');const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
 const submit=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setMessage('');try{const r=await fetch(API+'/admins',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,displayName:name,password,role:'ADMIN'})});const d=await r.json();if(!r.ok||!d.success)throw new Error(d.error||'Gagal.');setMessage('Admin account berhasil dibuat.');setEmail('');setName('');setPassword('');onRefresh();}catch(e:any){setMessage(e?.message||'Gagal membuat admin.')}finally{setBusy(false)}};
 return <div className="space-y-6"><Panel title="Add Admin Account" meta="Only OWNER can create additional admins"><form onSubmit={submit} className="grid md:grid-cols-3 gap-4"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Display name" className="rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm"/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@sysstreamer.asia" className="rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm"/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min. 8 characters" className="rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm"/><div className="md:col-span-3 flex items-center gap-3"><button disabled={busy||!name||!email||password.length<8} className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-extrabold flex items-center gap-2"><UserPlus className="w-4 h-4"/>{busy?'Creating...':'Create Admin'}</button>{message&&<span className="text-xs text-slate-300">{message}</span>}</div></form></Panel><Panel title="Admin Accounts" meta={`${admins.length} accounts`}><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-[11px] uppercase text-slate-500 border-b border-slate-800"><tr><th className="text-left py-3 pr-4">Name</th><th className="text-left py-3 pr-4">Email</th><th className="text-left py-3 pr-4">Role</th><th className="text-left py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-800">{admins.map(a=><tr key={a.id}><td className="py-3 pr-4 font-semibold">{a.displayName}</td><td className="py-3 pr-4 text-slate-400">{a.email}</td><td className="py-3 pr-4">{a.role}</td><td className="py-3"><span className={a.active?'text-emerald-400':'text-red-400'}>{a.active?'Active':'Disabled'}</span></td></tr>)}</tbody></table>{!admins.length&&<EmptyState text="No named admin accounts yet. Owner bootstrap key remains available."/>}</div></Panel></div>;
}

function AdminNotificationBell(){
 const [open,setOpen]=useState(false);
 const [items,setItems]=useState<any[]>([]);
 const [unread,setUnread]=useState(0);
 const [loading,setLoading]=useState(false);

 const load=async()=>{
  try{
   const r=await fetch('/api/admin/notifications?limit=50',{credentials:'same-origin',cache:'no-store'});
   const d=await r.json().catch(()=>({}));
   if(r.ok&&d.success){setItems(d.notifications||[]);setUnread(Number(d.unreadCount||0));}
  }catch{}
 };

 useEffect(()=>{
  void load();
  const timer=window.setInterval(()=>void load(),15000);
  return()=>window.clearInterval(timer);
 },[]);

 const markRead=async(id:string)=>{
  try{await fetch('/api/admin/notifications',{method:'PATCH',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'read',id})});}catch{}
  await load();
 };

 const markAll=async()=>{
  try{await fetch('/api/admin/notifications',{method:'PATCH',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'read_all'})});}catch{}
  await load();
 };

 const severityClass=(severity:string)=>{
  if(severity==='danger')return 'border-red-500/20 bg-red-500/5';
  if(severity==='warning')return 'border-amber-500/20 bg-amber-500/5';
  if(severity==='success')return 'border-emerald-500/20 bg-emerald-500/5';
  return 'border-slate-700 bg-slate-950';
 };

 return <div className="relative">
  <button onClick={()=>{setOpen(v=>!v);void load();}} className="relative p-2 rounded-lg border border-slate-800 hover:border-slate-600" aria-label="Admin notifications">
   <Bell className="w-4 h-4"/>
   {unread>0&&<span className="absolute -right-1 -top-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">{unread>99?'99+':unread}</span>}
  </button>
  {open&&<div className="absolute right-0 top-12 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
   <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-3">
    <div><div className="font-bold text-sm">Notifications</div><div className="text-[10px] text-slate-500">{unread} unread</div></div>
    <button onClick={()=>void markAll()} className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"><CheckCheck className="w-3.5 h-3.5"/> Mark all read</button>
   </div>
   <div className="max-h-[420px] overflow-y-auto p-2 space-y-2">
    {items.length===0&&<div className="py-10 text-center text-xs text-slate-500">No notifications yet.</div>}
    {items.map((n:any)=><button key={n.id} onClick={()=>void markRead(String(n.id))} className={`w-full text-left rounded-xl border p-3 transition ${severityClass(String(n.severity||'info'))} ${Number(n.isRead)===1?'opacity-60':'hover:border-slate-600'}`}>
      <div className="flex items-start justify-between gap-3"><div className="font-semibold text-xs text-slate-100">{n.title}</div>{Number(n.isRead)!==1&&<span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"/>}</div>
      <div className="text-[11px] text-slate-400 mt-1 leading-5">{n.message}</div>
      <div className="text-[9px] text-slate-600 mt-2">{n.createdAt?new Date(Number(n.createdAt)*1000).toLocaleString():'-'}</div>
    </button>)}
   </div>
   <div className="px-4 py-2 border-t border-slate-800 text-[9px] text-slate-600">Auto-refresh setiap 15 detik • Customer Email Inbox dihitung sebagai unread alert.</div>
  </div>}
 </div>;
}

function Panel({title,meta,children}:{title:string;meta:string;children:React.ReactNode}){return <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"><div className="p-5 border-b border-slate-800 flex items-center justify-between gap-4"><div><h2 className="font-bold">{title}</h2><div className="text-[11px] text-slate-500 mt-1">{meta}</div></div></div><div className="p-5">{children}</div></section>}
function NavButton({active,icon,label,onClick}:{active:boolean;icon:React.ReactNode;label:string;onClick:()=>void}){return <button onClick={onClick} className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active?'bg-amber-500 text-slate-950':'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}>{React.cloneElement(icon as React.ReactElement<any>,{className:'w-4 h-4'})}{label}</button>}
function Stat({icon,label,value}:{icon:React.ReactNode;label:string;value:string}){return <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5"><div className="text-amber-400 mb-3">{React.cloneElement(icon as React.ReactElement<any>,{className:'w-5 h-5'})}</div><div className="text-xs text-slate-500">{label}</div><div className="text-xl font-black mt-1">{value}</div></div>}
function EmptyState({text}:{text:string}){return <div className="py-10 text-center text-sm text-slate-500">{text}</div>}
function formatNumber(value:number){return value.toLocaleString(undefined,{maximumFractionDigits:2})}
function Loading(){return <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center"><div className="text-sm text-slate-400">Checking admin session...</div></div>}

