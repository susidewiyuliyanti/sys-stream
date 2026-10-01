import React, { useEffect, useMemo, useState } from 'react';
import { SysLogo } from '../components/SysLogo';
import {
  Activity, CircleDollarSign, Gift, LayoutDashboard, LogOut, RefreshCw,
  Search, ShieldCheck, UserPlus, Users, WalletCards
} from 'lucide-react';

const API = '/api/admin';

type AdminUser = { id:string; username:string; email:string; balance:number; lockedBalance:number; role:string; createdAt:string };
type AdminDeposit = { id:string; depositCode:string; userId:string; username:string; amount:number; durationDays:number; status:string; createdAt:string };
type AdminAccount = { id:string; email:string; displayName:string; role:string; active:number; createdAt:number };
type JackpotGrant = { id:string; userId:string; username:string; email:string; amount:number; currency:string; note:string; adminName:string; createdAt:number };
type Tab = 'overview'|'users'|'transactions'|'jackpot'|'admins';

export default function AdminApp() {
  const [authenticated,setAuthenticated]=useState(false);
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [admin,setAdmin]=useState<any>(null);
  const [error,setError]=useState('');
  const [users,setUsers]=useState<AdminUser[]>([]);
  const [deposits,setDeposits]=useState<AdminDeposit[]>([]);
  const [admins,setAdmins]=useState<AdminAccount[]>([]);
  const [grants,setGrants]=useState<JackpotGrant[]>([]);
  const [loading,setLoading]=useState(false);
  const [checkingSession,setCheckingSession]=useState(true);
  const [tab,setTab]=useState<Tab>('overview');
  const [query,setQuery]=useState('');

  const request=async(path:string,options:RequestInit={})=>{
    const response=await fetch(API+path,{...options,credentials:'same-origin',headers:{'Content-Type':'application/json',...(options.headers||{})}});
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
      const [u,d,b,a]=await Promise.all([request('/users'),request('/deposits'),request('/bonuses'),request('/admins')]);
      setUsers(u.users||[]);setDeposits(d.deposits||[]);setGrants(b.grants||[]);setAdmins(a.admins||[]);
      setAdmin(a.currentAdmin||admin);
    }catch(e:any){
      if(/session|unauthorized/i.test(e?.message||''))setAuthenticated(false);
      setError(e?.message||'Gagal memuat dashboard.');
    }finally{setLoading(false);}
  };

  useEffect(()=>{void checkSession();},[]);
  useEffect(()=>{if(authenticated)void loadDashboard();},[authenticated]);

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
    setAuthenticated(false);setAdmin(null);setUsers([]);setDeposits([]);setAdmins([]);setGrants([]);setTab('overview');
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

  const totalBalance=users.reduce((s,u)=>s+Number(u.balance||0),0);
  const totalLocked=users.reduce((s,u)=>s+Number(u.lockedBalance||0),0);

  return(
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="max-w-[1500px] mx-auto h-16 px-4 lg:px-6 flex items-center justify-between">
          <SysLogo size="md" showText/>
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right"><div className="text-xs font-bold">{admin?.displayName||'Owner'}</div><div className="text-[10px] text-amber-400">{admin?.role||'OWNER'}</div></div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-400 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>Production</div>
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
              <NavButton active={tab==='transactions'} onClick={()=>setTab('transactions')} icon={<WalletCards/>} label="Transactions"/>
              <NavButton active={tab==='jackpot'} onClick={()=>setTab('jackpot')} icon={<Gift/>} label="Jackpot Grants"/>
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
                <div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400"><Activity className="w-4 h-4"/> SYS STREAM ADMIN</div><h1 className="text-2xl lg:text-3xl font-black mt-2">{tab==='overview'?'Control Center':tab==='users'?'Users':tab==='transactions'?'Transactions':tab==='jackpot'?'Jackpot Grants':'Admin Accounts'}</h1><p className="text-sm text-slate-500 mt-1">Production data only. Promotional grants are separately audited and do not alter random game results.</p></div>
                {(tab==='users'||tab==='transactions')&&<div className="relative w-full md:w-80"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={tab==='users'?'Search user, email...':'Search transaction...'} className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-slate-600"/></div>}
              </div>
            </div>

            {tab==='overview'&&<Overview users={users} deposits={deposits} totalBalance={totalBalance} totalLocked={totalLocked}/>}
            {tab==='users'&&<UsersTable users={filteredUsers}/>}
            {tab==='transactions'&&<TransactionsTable deposits={deposits}/>}
            {tab==='jackpot'&&<JackpotPanel users={users} grants={grants} onRefresh={()=>void loadDashboard()}/>}
            {tab==='admins'&&admin?.role==='OWNER'&&<AdminsPanel admins={admins} onRefresh={()=>void loadDashboard()}/>}
          </main>
        </div>
      </div>
    </div>
  );
}

function Overview({users,deposits,totalBalance,totalLocked}:{users:AdminUser[];deposits:AdminDeposit[];totalBalance:number;totalLocked:number}){
 return <div className="space-y-6"><div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4"><Stat icon={<Users/>} label="Total Users" value={users.length.toLocaleString()}/><Stat icon={<CircleDollarSign/>} label="Available Balance" value={formatNumber(totalBalance)}/><Stat icon={<WalletCards/>} label="Locked Balance" value={formatNumber(totalLocked)}/><Stat icon={<Gift/>} label="Jackpot Grants" value={deposits.length? 'Configured & Audited':'Ready'}/></div><div className="grid xl:grid-cols-2 gap-6"><Panel title="Users" meta={`${users.length} records`}>{users.slice(0,8).map(u=><div key={u.id} className="flex justify-between gap-4 py-2 border-b border-slate-800 last:border-0"><div className="min-w-0"><div className="font-semibold truncate">{u.username||u.id}</div><div className="text-xs text-slate-500 truncate">{u.email||'-'}</div></div><div className="text-right text-sm">{formatNumber(Number(u.balance||0))}<div className="text-[11px] text-slate-500">available</div></div></div>)}{!users.length&&<EmptyState text="No production users yet."/>}</Panel><Panel title="Recent Transactions" meta={`${deposits.length} records`}>{deposits.slice(0,8).map(d=><div key={d.id} className="flex justify-between gap-4 py-2 border-b border-slate-800 last:border-0"><div><div className="font-mono text-xs">{d.depositCode||d.id}</div><div className="text-xs text-slate-500">{d.username||d.userId}</div></div><div className="text-right text-sm">{formatNumber(Number(d.amount||0))}<div className="text-[11px] text-slate-500">{d.status||'-'}</div></div></div>)}{!deposits.length&&<EmptyState text="No production transactions yet."/>}</Panel></div></div>;
}

function UsersTable({users}:{users:AdminUser[]}){
 return <Panel title="All Users" meta={`${users.length} matching records`}><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-800"><tr><th className="text-left py-3 pr-4">User</th><th className="text-left py-3 pr-4">Email</th><th className="text-right py-3 pr-4">Available</th><th className="text-right py-3 pr-4">Locked</th><th className="text-left py-3">Role</th></tr></thead><tbody className="divide-y divide-slate-800">{users.map(u=><tr key={u.id}><td className="py-3 pr-4 font-semibold">{u.username||u.id}</td><td className="py-3 pr-4 text-slate-400">{u.email||'-'}</td><td className="py-3 pr-4 text-right">{formatNumber(Number(u.balance||0))}</td><td className="py-3 pr-4 text-right">{formatNumber(Number(u.lockedBalance||0))}</td><td className="py-3"><span className="text-xs rounded-full px-2 py-1 bg-slate-800">{u.role||'USER'}</span></td></tr>)}</tbody></table>{!users.length&&<EmptyState text="No users found."/>}</div></Panel>;
}

function TransactionsTable({deposits}:{deposits:AdminDeposit[]}){
 return <Panel title="Deposits & Locks" meta={`${deposits.length} records`}><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-800"><tr><th className="text-left py-3 pr-4">Code</th><th className="text-left py-3 pr-4">User</th><th className="text-right py-3 pr-4">Amount</th><th className="text-left py-3 pr-4">Duration</th><th className="text-left py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-800">{deposits.map(d=><tr key={d.id}><td className="py-3 pr-4 font-mono text-xs">{d.depositCode||d.id}</td><td className="py-3 pr-4">{d.username||d.userId}</td><td className="py-3 pr-4 text-right">{formatNumber(Number(d.amount||0))}</td><td className="py-3 pr-4">{d.durationDays?`${d.durationDays} days`:'-'}</td><td className="py-3"><span className="text-xs rounded-full px-2 py-1 bg-slate-800">{d.status||'-'}</span></td></tr>)}</tbody></table>{!deposits.length&&<EmptyState text="No transactions found."/>}</div></Panel>;
}

function JackpotPanel({users,grants,onRefresh}:{users:AdminUser[];grants:JackpotGrant[];onRefresh:()=>void}){
 const [userId,setUserId]=useState('');const [amount,setAmount]=useState('');const [note,setNote]=useState('');const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
 const submit=async(e:React.FormEvent)=>{e.preventDefault();setMessage('');setBusy(true);try{const r=await fetch(API+'/bonuses',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId,amount:Number(amount),note})});const d=await r.json();if(!r.ok||!d.success)throw new Error(d.error||'Grant gagal.');setMessage(`Promotional jackpot ${Number(amount).toFixed(2)} USDT diberikan ke ${d.grant.username||d.grant.email}.`);setAmount('');setNote('');onRefresh();}catch(e:any){setMessage(e?.message||'Grant gagal.')}finally{setBusy(false)}};
 return <div className="space-y-6"><Panel title="Promotional Jackpot Grant" meta="Manual reward credit with audit trail"><div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 mb-5 text-xs text-slate-400">Gunakan fitur ini untuk <strong className="text-slate-200">bonus/promotional jackpot</strong> yang diberikan secara eksplisit kepada user. Grant ini tidak mengubah hasil random Blind Box.</div><form onSubmit={submit} className="grid md:grid-cols-2 gap-4"><div><label className="block text-xs font-semibold text-slate-400 mb-2">Select User</label><select value={userId} onChange={e=>setUserId(e.target.value)} className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm"><option value="">Choose user...</option>{users.map(u=><option key={u.id} value={u.id}>{u.username} — {u.email}</option>)}</select></div><div><label className="block text-xs font-semibold text-slate-400 mb-2">Jackpot Value (USDT)</label><input type="number" min="0.01" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="e.g. 100" className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm"/></div><div className="md:col-span-2"><label className="block text-xs font-semibold text-slate-400 mb-2">Reason / Audit Note</label><input value={note} onChange={e=>setNote(e.target.value)} placeholder="Campaign, promotion, correction, etc." className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm"/></div><div className="md:col-span-2 flex items-center gap-3"><button disabled={busy||!userId||!amount} className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-extrabold flex items-center gap-2"><Gift className="w-4 h-4"/>{busy?'Processing...':'Grant Jackpot'}</button>{message&&<span className="text-xs text-slate-300">{message}</span>}</div></form></Panel><Panel title="Grant History" meta={`${grants.length} audited records`}><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-[11px] uppercase text-slate-500 border-b border-slate-800"><tr><th className="text-left py-3 pr-4">User</th><th className="text-right py-3 pr-4">Amount</th><th className="text-left py-3 pr-4">Note</th><th className="text-left py-3 pr-4">Admin</th><th className="text-left py-3">Date</th></tr></thead><tbody className="divide-y divide-slate-800">{grants.map(g=><tr key={g.id}><td className="py-3 pr-4">{g.username||g.email||g.userId}</td><td className="py-3 pr-4 text-right font-semibold">{formatNumber(Number(g.amount))} {g.currency}</td><td className="py-3 pr-4 text-slate-400">{g.note||'-'}</td><td className="py-3 pr-4 text-slate-400">{g.adminName}</td><td className="py-3 text-slate-500">{new Date(Number(g.createdAt)*1000).toLocaleString()}</td></tr>)}</tbody></table>{!grants.length&&<EmptyState text="No jackpot grants yet."/>}</div></Panel></div>;
}

function AdminsPanel({admins,onRefresh}:{admins:AdminAccount[];onRefresh:()=>void}){
 const [email,setEmail]=useState('');const [name,setName]=useState('');const [password,setPassword]=useState('');const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
 const submit=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setMessage('');try{const r=await fetch(API+'/admins',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,displayName:name,password,role:'ADMIN'})});const d=await r.json();if(!r.ok||!d.success)throw new Error(d.error||'Gagal.');setMessage('Admin account berhasil dibuat.');setEmail('');setName('');setPassword('');onRefresh();}catch(e:any){setMessage(e?.message||'Gagal membuat admin.')}finally{setBusy(false)}};
 return <div className="space-y-6"><Panel title="Add Admin Account" meta="Only OWNER can create additional admins"><form onSubmit={submit} className="grid md:grid-cols-3 gap-4"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Display name" className="rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm"/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@sysstreamer.asia" className="rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm"/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min. 8 characters" className="rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm"/><div className="md:col-span-3 flex items-center gap-3"><button disabled={busy||!name||!email||password.length<8} className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-extrabold flex items-center gap-2"><UserPlus className="w-4 h-4"/>{busy?'Creating...':'Create Admin'}</button>{message&&<span className="text-xs text-slate-300">{message}</span>}</div></form></Panel><Panel title="Admin Accounts" meta={`${admins.length} accounts`}><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-[11px] uppercase text-slate-500 border-b border-slate-800"><tr><th className="text-left py-3 pr-4">Name</th><th className="text-left py-3 pr-4">Email</th><th className="text-left py-3 pr-4">Role</th><th className="text-left py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-800">{admins.map(a=><tr key={a.id}><td className="py-3 pr-4 font-semibold">{a.displayName}</td><td className="py-3 pr-4 text-slate-400">{a.email}</td><td className="py-3 pr-4">{a.role}</td><td className="py-3"><span className={a.active?'text-emerald-400':'text-red-400'}>{a.active?'Active':'Disabled'}</span></td></tr>)}</tbody></table>{!admins.length&&<EmptyState text="No named admin accounts yet. Owner bootstrap key remains available."/>}</div></Panel></div>;
}

function Panel({title,meta,children}:{title:string;meta:string;children:React.ReactNode}){return <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"><div className="p-5 border-b border-slate-800 flex items-center justify-between gap-4"><div><h2 className="font-bold">{title}</h2><div className="text-[11px] text-slate-500 mt-1">{meta}</div></div></div><div className="p-5">{children}</div></section>}
function NavButton({active,icon,label,onClick}:{active:boolean;icon:React.ReactNode;label:string;onClick:()=>void}){return <button onClick={onClick} className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active?'bg-amber-500 text-slate-950':'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}>{React.cloneElement(icon as React.ReactElement,{className:'w-4 h-4'})}{label}</button>}
function Stat({icon,label,value}:{icon:React.ReactNode;label:string;value:string}){return <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5"><div className="text-amber-400 mb-3">{React.cloneElement(icon as React.ReactElement,{className:'w-5 h-5'})}</div><div className="text-xs text-slate-500">{label}</div><div className="text-xl font-black mt-1">{value}</div></div>}
function EmptyState({text}:{text:string}){return <div className="py-10 text-center text-sm text-slate-500">{text}</div>}
function formatNumber(value:number){return value.toLocaleString(undefined,{maximumFractionDigits:2})}
function Loading(){return <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center"><div className="text-sm text-slate-400">Checking admin session...</div></div>}
