import React, { useEffect, useState } from 'react';
import { SysLogo } from '../components/SysLogo';
import { Users, WalletCards, RefreshCw, LogOut, ShieldCheck } from 'lucide-react';

const API = '/api/admin';

type AdminUser = { id:string; username:string; email:string; balance:number; lockedBalance:number; role:string; createdAt:string };
type AdminDeposit = { id:string; depositCode:string; userId:string; username:string; amount:number; durationDays:number; status:string; createdAt:string };

export default function AdminApp() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [deposits, setDeposits] = useState<AdminDeposit[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const request = async (path:string, options:RequestInit = {}) => {
    const response = await fetch(API + path, {
      ...options,
      credentials: 'same-origin',
      headers: { 'Content-Type':'application/json', ...(options.headers || {}) },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.error || 'Request gagal.');
    return data;
  };

  const checkSession = async () => {
    setCheckingSession(true);
    try {
      await request('/me');
      setAuthenticated(true);
    } catch {
      setAuthenticated(false);
    } finally {
      setCheckingSession(false);
    }
  };

  const loadDashboard = async () => {
    if (!authenticated) return;
    setLoading(true);
    setError('');
    try {
      const [u,d] = await Promise.all([request('/users'), request('/deposits')]);
      setUsers(u.users || []);
      setDeposits(d.deposits || []);
    } catch (e:any) {
      if (e?.message?.toLowerCase().includes('session') || e?.message?.toLowerCase().includes('unauthorized')) {
        setAuthenticated(false);
      }
      setError(e?.message || 'Gagal memuat dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void checkSession(); }, []);
  useEffect(() => { if (authenticated) void loadDashboard(); }, [authenticated]);

  const login = async (e:React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await request('/login', {
        method:'POST',
        body:JSON.stringify({ password })
      });
      setPassword('');
      setAuthenticated(true);
    } catch (e:any) {
      setError(e?.message || 'Login admin gagal.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try { await request('/logout', { method:'POST' }); } catch {}
    setAuthenticated(false);
    setUsers([]);
    setDeposits([]);
  };

  if (checkingSession) return <Loading />;

  if (!authenticated) return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-center mb-8"><SysLogo size="md" showText /></div>
        <div className="flex items-center justify-center gap-2 text-amber-400 text-sm font-bold mb-2"><ShieldCheck className="w-4 h-4"/> ADMIN PANEL</div>
        <p className="text-center text-xs text-slate-400 mb-6">Secure administrator access</p>
        <form onSubmit={login} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">Email</label>
            <input type="email" value="susidewiyuliyanti@gmail.com" readOnly
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm text-slate-300 outline-none"
              autoComplete="username" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="ADMIN API KEY"
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm outline-none focus:border-amber-500"
              autoComplete="current-password" />
          </div>
          {error && <div className="text-xs text-red-400">{error}</div>}
          <button disabled={loading || !password} className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-extrabold py-3">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );

  const totalBalance = users.reduce((s,u)=>s+Number(u.balance||0),0);
  const totalLocked = users.reduce((s,u)=>s+Number(u.lockedBalance||0),0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto h-16 px-4 flex items-center justify-between">
          <SysLogo size="md" showText />
          <div className="flex items-center gap-3">
            <button aria-label="Refresh dashboard" onClick={()=>void loadDashboard()} className="p-2 rounded-lg border border-slate-800 hover:border-slate-600"><RefreshCw className={`w-4 h-4 ${loading?'animate-spin':''}`}/></button>
            <button aria-label="Logout" onClick={()=>void logout()} className="p-2 rounded-lg border border-slate-800 hover:border-red-500/50 text-slate-400"><LogOut className="w-4 h-4"/></button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm p-4">{error}</div>}
        <div>
          <h1 className="text-2xl font-black">Admin Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Production control panel for SYS STREAM.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <Stat icon={<Users/>} label="Users" value={users.length.toLocaleString()} />
          <Stat icon={<WalletCards/>} label="Available Balance" value={`${totalBalance.toLocaleString(undefined,{maximumFractionDigits:2})} USDT`} />
          <Stat icon={<WalletCards/>} label="Locked Balance" value={`${totalLocked.toLocaleString(undefined,{maximumFractionDigits:2})} USDT`} />
        </div>
        <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between"><h2 className="font-bold">Users</h2><span className="text-xs text-slate-500">{users.length} records</span></div>
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-950 text-slate-500 text-xs"><tr><th className="text-left p-3">User</th><th className="text-left p-3">Email</th><th className="text-right p-3">Balance</th><th className="text-right p-3">Locked</th></tr></thead><tbody className="divide-y divide-slate-800">{users.map(u=><tr key={u.id}><td className="p-3 font-semibold">{u.username || u.id}</td><td className="p-3 text-slate-400">{u.email || '-'}</td><td className="p-3 text-right">{Number(u.balance||0).toFixed(2)}</td><td className="p-3 text-right">{Number(u.lockedBalance||0).toFixed(2)}</td></tr>)}</tbody></table></div>
        </section>
        <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between"><h2 className="font-bold">Recent Locks / Deposits</h2><span className="text-xs text-slate-500">{deposits.length} records</span></div>
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-950 text-slate-500 text-xs"><tr><th className="text-left p-3">Code</th><th className="text-left p-3">User</th><th className="text-right p-3">Amount</th><th className="text-left p-3">Duration</th><th className="text-left p-3">Status</th></tr></thead><tbody className="divide-y divide-slate-800">{deposits.map(d=><tr key={d.id}><td className="p-3 font-mono text-xs">{d.depositCode || d.id}</td><td className="p-3">{d.username || d.userId}</td><td className="p-3 text-right">{Number(d.amount||0).toLocaleString()}</td><td className="p-3">{d.durationDays} days</td><td className="p-3">{d.status}</td></tr>)}</tbody></table></div>
        </section>
      </main>
    </div>
  );
}

function Loading() {
  return <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center"><div className="text-sm text-slate-400">Checking admin session...</div></div>;
}

function Stat({icon,label,value}:{icon:React.ReactNode;label:string;value:string}) {
  return <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5"><div className="text-amber-400 mb-3">{React.cloneElement(icon as React.ReactElement,{className:'w-5 h-5'})}</div><div className="text-xs text-slate-500">{label}</div><div className="text-xl font-black mt-1">{value}</div></div>;
}
