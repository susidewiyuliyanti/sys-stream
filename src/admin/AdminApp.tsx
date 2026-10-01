import React, { useEffect, useMemo, useState } from 'react';
import { SysLogo } from '../components/SysLogo';
import {
  Activity,
  CircleDollarSign,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  WalletCards,
} from 'lucide-react';

const API = '/api/admin';

type AdminUser = {
  id: string;
  username: string;
  email: string;
  balance: number;
  lockedBalance: number;
  role: string;
  createdAt: string;
};

type AdminDeposit = {
  id: string;
  depositCode: string;
  userId: string;
  username: string;
  amount: number;
  durationDays: number;
  status: string;
  createdAt: string;
};

type Tab = 'overview' | 'users' | 'transactions';

export default function AdminApp() {
  const [authenticated, setAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [deposits, setDeposits] = useState<AdminDeposit[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');
  const [query, setQuery] = useState('');

  const request = async (path: string, options: RequestInit = {}) => {
    const response = await fetch(API + path, {
      ...options,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Request gagal.');
    }
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
      const [usersResponse, depositsResponse] = await Promise.all([
        request('/users'),
        request('/deposits'),
      ]);
      setUsers(usersResponse.users || []);
      setDeposits(depositsResponse.deposits || []);
    } catch (e: any) {
      if (/session|unauthorized/i.test(e?.message || '')) {
        setAuthenticated(false);
      }
      setError(e?.message || 'Gagal memuat dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void checkSession();
  }, []);

  useEffect(() => {
    if (authenticated) void loadDashboard();
  }, [authenticated]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await request('/login', {
        method: 'POST',
        body: JSON.stringify({ password: adminKey }),
      });
      setAdminKey('');
      setAuthenticated(true);
    } catch (e: any) {
      setError(e?.message || 'Login admin gagal.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await request('/logout', { method: 'POST' });
    } catch {}
    setAuthenticated(false);
    setUsers([]);
    setDeposits([]);
    setTab('overview');
  };

  const filteredUsers = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return users;
    return users.filter((user) =>
      [user.username, user.email, user.id].some((field) =>
        String(field || '').toLowerCase().includes(value)
      )
    );
  }, [users, query]);

  const filteredDeposits = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return deposits;
    return deposits.filter((deposit) =>
      [deposit.depositCode, deposit.username, deposit.userId, deposit.status].some((field) =>
        String(field || '').toLowerCase().includes(value)
      )
    );
  }, [deposits, query]);

  if (checkingSession) return <Loading />;

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-7">
            <SysLogo size="md" showText />
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-center gap-2 text-amber-400 text-sm font-black mb-2">
              <ShieldCheck className="w-4 h-4" />
              ADMIN PANEL
            </div>
            <h1 className="text-center text-xl font-black">Secure administrator access</h1>
            <p className="text-center text-xs text-slate-500 mt-2 mb-7">
              This panel is served separately from the public SYS STREAM application.
            </p>

            <form onSubmit={login} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  Admin API Key
                </label>
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter admin access key"
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm outline-none focus:border-amber-500"
                  autoComplete="current-password"
                  autoFocus
                />
              </div>
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 text-xs p-3">
                  {error}
                </div>
              )}
              <button
                disabled={loading || !adminKey}
                className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-extrabold py-3 transition"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const totalBalance = users.reduce((sum, user) => sum + Number(user.balance || 0), 0);
  const totalLocked = users.reduce((sum, user) => sum + Number(user.lockedBalance || 0), 0);
  const activeUsers = users.filter((user) => user.role?.toUpperCase() === 'USER').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="max-w-[1500px] mx-auto h-16 px-4 lg:px-6 flex items-center justify-between">
          <SysLogo size="md" showText />
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-400 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Production
            </div>
            <button
              aria-label="Refresh dashboard"
              onClick={() => void loadDashboard()}
              className="p-2 rounded-lg border border-slate-800 hover:border-slate-600 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              aria-label="Logout"
              onClick={() => void logout()}
              className="p-2 rounded-lg border border-slate-800 hover:border-red-500/50 text-slate-400 hover:text-red-300 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-6 lg:py-8">
        <div className="grid lg:grid-cols-[220px_minmax(0,1fr)] gap-6">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav className="bg-slate-900 border border-slate-800 rounded-2xl p-2 space-y-1">
              <NavButton active={tab === 'overview'} onClick={() => setTab('overview')} icon={<LayoutDashboard />} label="Overview" />
              <NavButton active={tab === 'users'} onClick={() => setTab('users')} icon={<Users />} label="Users" />
              <NavButton active={tab === 'transactions'} onClick={() => setTab('transactions')} icon={<WalletCards />} label="Transactions" />
            </nav>
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Admin isolation
              </div>
              <p className="text-[11px] leading-5 text-slate-500 mt-2">
                Public users and administrator functions are separated by hostname.
              </p>
            </div>
          </aside>

          <main className="min-w-0">
            {error && (
              <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm p-4">
                {error}
              </div>
            )}

            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                    <Activity className="w-4 h-4" />
                    SYS STREAM ADMIN
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-black mt-2">
                    {tab === 'overview' ? 'Control Center' : tab === 'users' ? 'Users' : 'Transactions'}
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Production data only. No simulated balances or demo deposits.
                  </p>
                </div>

                {tab !== 'overview' && (
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={tab === 'users' ? 'Search user, email...' : 'Search transaction...'}
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-slate-600"
                    />
                  </div>
                )}
              </div>
            </div>

            {tab === 'overview' && (
              <Overview
                users={users}
                deposits={deposits}
                totalBalance={totalBalance}
                totalLocked={totalLocked}
                activeUsers={activeUsers}
                onUsers={() => setTab('users')}
                onTransactions={() => setTab('transactions')}
              />
            )}

            {tab === 'users' && <UsersTable users={filteredUsers} />}
            {tab === 'transactions' && <TransactionsTable deposits={filteredDeposits} />}
          </main>
        </div>
      </div>
    </div>
  );
}

function Overview({
  users,
  deposits,
  totalBalance,
  totalLocked,
  activeUsers,
  onUsers,
  onTransactions,
}: {
  users: AdminUser[];
  deposits: AdminDeposit[];
  totalBalance: number;
  totalLocked: number;
  activeUsers: number;
  onUsers: () => void;
  onTransactions: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat icon={<Users />} label="Total Users" value={users.length.toLocaleString()} />
        <Stat icon={<Activity />} label="Active User Roles" value={activeUsers.toLocaleString()} />
        <Stat icon={<CircleDollarSign />} label="Available Balance" value={formatNumber(totalBalance)} />
        <Stat icon={<WalletCards />} label="Locked Balance" value={formatNumber(totalLocked)} />
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <Panel title="Users" meta={`${users.length} records`} action="View users" onAction={onUsers}>
          <div className="space-y-3">
            {users.slice(0, 6).map((user) => (
              <div key={user.id} className="flex items-center justify-between gap-4 py-2 border-b border-slate-800 last:border-0">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{user.username || user.id}</div>
                  <div className="text-xs text-slate-500 truncate">{user.email || '-'}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm">{formatNumber(Number(user.balance || 0))}</div>
                  <div className="text-[11px] text-slate-500">available</div>
                </div>
              </div>
            ))}
            {!users.length && <EmptyState text="No production users yet." />}
          </div>
        </Panel>

        <Panel title="Recent Transactions" meta={`${deposits.length} records`} action="View transactions" onAction={onTransactions}>
          <div className="space-y-3">
            {deposits.slice(0, 6).map((deposit) => (
              <div key={deposit.id} className="flex items-center justify-between gap-4 py-2 border-b border-slate-800 last:border-0">
                <div className="min-w-0">
                  <div className="font-mono text-xs text-slate-300 truncate">{deposit.depositCode || deposit.id}</div>
                  <div className="text-xs text-slate-500 truncate">{deposit.username || deposit.userId}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm">{formatNumber(Number(deposit.amount || 0))}</div>
                  <div className="text-[11px] text-slate-500">{deposit.status || '-'}</div>
                </div>
              </div>
            ))}
            {!deposits.length && <EmptyState text="No production transactions yet." />}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function UsersTable({ users }: { users: AdminUser[] }) {
  return (
    <Panel title="All Users" meta={`${users.length} matching records`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-800">
            <tr>
              <th className="text-left py-3 pr-4">User</th>
              <th className="text-left py-3 pr-4">Email</th>
              <th className="text-right py-3 pr-4">Available</th>
              <th className="text-right py-3 pr-4">Locked</th>
              <th className="text-left py-3">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-950/50">
                <td className="py-3 pr-4 font-semibold">{user.username || user.id}</td>
                <td className="py-3 pr-4 text-slate-400">{user.email || '-'}</td>
                <td className="py-3 pr-4 text-right">{formatNumber(Number(user.balance || 0))}</td>
                <td className="py-3 pr-4 text-right">{formatNumber(Number(user.lockedBalance || 0))}</td>
                <td className="py-3"><span className="text-xs rounded-full px-2 py-1 bg-slate-800 text-slate-300">{user.role || 'USER'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.length && <EmptyState text="No users found." />}
      </div>
    </Panel>
  );
}

function TransactionsTable({ deposits }: { deposits: AdminDeposit[] }) {
  return (
    <Panel title="Deposits & Locks" meta={`${deposits.length} matching records`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-800">
            <tr>
              <th className="text-left py-3 pr-4">Code</th>
              <th className="text-left py-3 pr-4">User</th>
              <th className="text-right py-3 pr-4">Amount</th>
              <th className="text-left py-3 pr-4">Duration</th>
              <th className="text-left py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {deposits.map((deposit) => (
              <tr key={deposit.id} className="hover:bg-slate-950/50">
                <td className="py-3 pr-4 font-mono text-xs text-slate-300">{deposit.depositCode || deposit.id}</td>
                <td className="py-3 pr-4">{deposit.username || deposit.userId}</td>
                <td className="py-3 pr-4 text-right">{formatNumber(Number(deposit.amount || 0))}</td>
                <td className="py-3 pr-4">{deposit.durationDays ? `${deposit.durationDays} days` : '-'}</td>
                <td className="py-3"><span className="text-xs rounded-full px-2 py-1 bg-slate-800 text-slate-300">{deposit.status || '-'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!deposits.length && <EmptyState text="No transactions found." />}
      </div>
    </Panel>
  );
}

function Panel({
  title,
  meta,
  action,
  onAction,
  children,
}: {
  title: string;
  meta: string;
  action?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-bold">{title}</h2>
          <div className="text-[11px] text-slate-500 mt-1">{meta}</div>
        </div>
        {action && onAction && (
          <button onClick={onAction} className="text-xs font-bold text-amber-400 hover:text-amber-300">
            {action}
          </button>
        )}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function NavButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}
    >
      {React.cloneElement(icon as React.ReactElement, { className: 'w-4 h-4' })}
      {label}
    </button>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <div className="text-amber-400 mb-3">
        {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
      </div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-xl font-black mt-1">{value}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="py-10 text-center text-sm text-slate-500">{text}</div>;
}

function formatNumber(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="text-sm text-slate-400">Checking admin session...</div>
    </div>
  );
}
