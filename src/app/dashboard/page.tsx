import React, { useEffect, useState } from 'react';
import {
  Pickaxe,

  ArrowRight,
  CircleDot,
  Gift,
  LockKeyhole,
  Plus,
  Radio,
  RefreshCw,
  Send,
  Target,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useLanguage, formatRegistrationBonus, formatIdrAsSelectedCurrency } from '../../i18n';

interface Props {
  navigate?: (path: string) => void;
}

type Post = {
  id: number;
  content: string;
  mediaUrl?: string | null;
  postType?: string;
  createdAt: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string | null;
};

export default function DashboardPage({ navigate }: Props) {
  const { user, isLoggedIn, refreshFinancialState, claimRegistrationBonus } = useGame();
  const { language, t } = useLanguage();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState('');

  const available = Number(user.coins || 0) / 100;
  const locked = Number(user.lockedBalance || 0);
  const formatMoney = (idr: number) => formatIdrAsSelectedCurrency(idr, language);

  const loadPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const token = localStorage.getItem('sys_stream_auth_token');
      const response = await fetch('/api/posts', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      const data = await response.json();
      if (response.ok && data.success) setPosts(Array.isArray(data.posts) ? data.posts : []);
      else setPosts([]);
    } catch {
      setPosts([]);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) void loadPosts();
  }, [isLoggedIn]);

  if (!isLoggedIn) return null;

  const createPost = async () => {
    const content = postContent.trim();
    const media = mediaUrl.trim();
    if (!content && !media) {
      setPostError(t('Tulis sesuatu atau masukkan media terlebih dahulu.'));
      return;
    }

    setIsPosting(true);
    setPostError('');
    try {
      const token = localStorage.getItem('sys_stream_auth_token');
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          content,
          mediaUrl: media || undefined,
          postType: media ? 'media' : 'text',
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setPostError(data.error || t('Posting gagal dibuat.'));
        return;
      }
      setPostContent('');
      setMediaUrl('');
      setIsCreateOpen(false);
      setPosts((current) => data.post ? [data.post, ...current] : current);
    } catch {
      setPostError(t('Koneksi gagal. Silakan coba lagi.'));
    } finally {
      setIsPosting(false);
    }
  };

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <section className="min-h-screen bg-[#050814] text-white px-4 py-5 sm:py-8">
      <div className="max-w-7xl mx-auto w-full lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-6">
        <aside className="hidden lg:flex lg:flex-col lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
          <div className="px-3 py-3 mb-2">
            <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-400 font-black">SYS STREAM</div>
            <div className="text-sm font-black mt-1 text-white">{t('Workspace')}</div>
          </div>
          <nav className="space-y-1 text-sm">
            <button onClick={() => navigate?.('/dashboard')} className="w-full text-left px-3 py-2.5 rounded-xl bg-cyan-500/10 text-cyan-300 font-bold">{t('Home')}</button>
            <button onClick={() => navigate?.('/room/main')} className="w-full text-left px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white">{t('Live Now')}</button>
            <button onClick={() => navigate?.('/game/tebak')} className="w-full text-left px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white">{t('Games')}</button>
            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem('sys_stream_auth_token');
                  const language = localStorage.getItem('sys_stream_language_v2') || 'en';

                  if (token) {
                    const response = await fetch('/api/auth/airdrop-handoff', {
                      method: 'POST',
                      credentials: 'include',
                      headers: { Authorization: 'Bearer ' + token },
                      cache: 'no-store',
                    });
                    const data = await response.json().catch(() => ({}));
                    if (response.ok && data?.success && data?.code) {
                      window.location.href =
                        'https://airdrop.sysstreamer.asia/?handoff=' +
                        encodeURIComponent(data.code) + '&lang=' +
                        encodeURIComponent(language);
                      return;
                    }
                  }

                  window.location.href = 'https://sysstreamer.asia/login';
                } catch {
                  window.location.href = 'https://sysstreamer.asia/login';
                }
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white"
            >{t('Airdrop')}</button>
            <button onClick={() => navigate?.('/profile')} className="w-full text-left px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white">{t('Profile')}</button>
          </nav>
          <div className="mt-auto p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-500">{t('Konten dan aktivitas di halaman ini menggunakan data produksi.')}</div>
        </aside>

        <main className="min-w-0 space-y-6">
          <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-cyan-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                SYS STREAM
              </div>
              <h1 className="text-2xl sm:text-3xl font-black mt-2">{t('Halo')}, {user.walletAddress || user.username || t('User')}</h1>
              <p className="text-sm text-slate-400 mt-1">{t('User ID:')} {user.walletAddress || t('Wallet belum terhubung')} · {t('Live, komunitas, dan postingan dari pengguna SYS STREAM.')}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => navigate?.('/room/main')}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-black text-white hover:bg-rose-400 transition-colors"
              >
                <Radio className="w-4 h-4" /> {t('Live Now')}
              </button>
              <button
                onClick={() => { setPostError(''); setIsCreateOpen(true); }}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-black text-slate-950 hover:bg-cyan-300 transition-colors"
              >
                <Plus className="w-4 h-4" /> {t('Upload / Create')}
              </button>
              <button
                onClick={() => void refreshFinancialState()}
                className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:border-cyan-500/50 transition-colors"
                aria-label={t('Refresh balance')}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </header>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-4">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500"><Wallet className="w-4 h-4 text-cyan-400" /> {t('Available')}</div>
              <div className="text-xl font-black mt-2">{formatMoney(available)}</div>
            </div>
            <div className="rounded-2xl border border-amber-500/20 bg-slate-900/80 p-4">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500"><LockKeyhole className="w-4 h-4 text-amber-400" /> {t('Locked')}</div>
              <div className="text-xl font-black mt-2">{formatMoney(locked)}</div>
            </div>
            <div className="rounded-2xl border border-violet-500/20 bg-slate-900/80 p-4">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500"><Wallet className="w-4 h-4 text-violet-400" /> SYS Coin</div>
              <div className="text-xl font-black mt-2">{Number(user.sysBalance || 0).toLocaleString('en-US', { maximumFractionDigits: 8 })} SYS</div>
              <div className="text-[10px] text-slate-500 mt-1">{t('Reward dari Airdrop')}</div>
            </div>
            <div className="rounded-2xl border border-rose-500/20 bg-slate-900/80 p-4">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500"><Radio className="w-4 h-4 text-rose-400" /> {t('Live Now')}</div>
              <div className="text-xl font-black mt-2">{t('Live')}</div>
              <button onClick={() => navigate?.('/room/main')} className="text-[11px] text-rose-300 mt-1 hover:text-rose-200">{t('Buka Live Room →')}</button>
            </div>
          </div>

          {user.registrationBonusGranted && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-emerald-400 font-bold">{t('Registration Bonus')}</div>
                <div className="text-lg font-black mt-1 text-emerald-300">{formatRegistrationBonus(language)}</div>
                <p className="text-xs text-slate-400">{t('Bonus pendaftaran masih tersedia untuk diklaim.')}</p>
              </div>
              <button onClick={() => void claimRegistrationBonus()} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-400 text-slate-950 font-black hover:bg-emerald-300">
                <Gift className="w-4 h-4" /> {t('Claim Bonus')}
              </button>
            </div>
          )}

          <section className="rounded-2xl border border-emerald-500/25 bg-gradient-to-r from-emerald-500/10 via-slate-900/80 to-slate-900/80 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3">
                  <Pickaxe className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-emerald-400 font-black">SYS Mining</div>
                  <h2 className="text-xl font-black mt-1">Mining SYS dari Blind Box Lock</h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">Lock aktif minimal $10 dapat mengaktifkan reward mining harian.</p>
                </div>
              </div>
              <button
                onClick={() => navigate?.('/game/mining')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-emerald-300 transition-colors shrink-0"
              >
                <Pickaxe className="w-4 h-4" /> {t('SYS Mining')} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-cyan-500/15 bg-slate-900/70 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-xl font-black">{t('Community Posts')}</h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">{t('Setiap user dapat membagikan tulisan dan postingan.')}</p>
              </div>
              <button onClick={() => void loadPosts()} className="p-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-white" aria-label={t('Refresh posts')}>
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4">
              {isLoadingPosts ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-center text-sm text-slate-500">{t('Memuat postingan...')}</div>
              ) : posts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950 p-8 text-center">
                  <div className="font-bold text-slate-300">{t('Belum ada postingan')}</div>
                  <p className="text-xs text-slate-500 mt-1">{t('Jadilah pengguna pertama yang membagikan sesuatu.')}</p>
                  <button onClick={() => { setPostError(''); setIsCreateOpen(true); }} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-xs font-black text-slate-950">
                    <Plus className="w-4 h-4" /> Buat Postingan
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {posts.map((post) => (
                    <article key={post.id} className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                      <div className="flex items-center gap-3">
                        {post.avatarUrl ? (
                          <img src={post.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black text-cyan-300">
                            {(post.displayName || post.username || 'U').slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-sm truncate">{post.displayName || post.username || 'User'}</div>
                          <div className="text-[10px] text-slate-500">@{post.username || 'user'} · {formatDate(post.createdAt)}</div>
                        </div>
                      </div>
                      {post.content && <p className="mt-4 text-sm leading-6 whitespace-pre-wrap break-words text-slate-200">{post.content}</p>}
                      {post.mediaUrl && (
                        <a href={post.mediaUrl} target="_blank" rel="noreferrer" className="mt-3 block text-xs text-cyan-300 hover:text-cyan-200 break-all">
                          {t('Buka media terlampir →')}
                        </a>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <Radio className="w-5 h-5 text-rose-400" />
              <h2 className="text-xl font-black">{t('Live Now')}</h2>
            </div>
            <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950 p-8 text-center">
              <Radio className="w-8 h-8 mx-auto text-slate-600" />
              <div className="font-bold text-slate-300 mt-3">{t('Belum ada data live aktif')}</div>
              <p className="text-xs text-slate-500 mt-1">{t('Room live akan tampil di sini setelah tersedia dari backend produksi.')}</p>
              <button onClick={() => navigate?.('/room/main')} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-black text-rose-300">
                {t('Buka Live Room')} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>

          <section className="grid sm:grid-cols-3 gap-4">
            <button onClick={() => navigate?.('/game/tebak')} className="rounded-2xl border border-cyan-500/20 bg-slate-900 p-4 text-left hover:border-cyan-400/60 transition-colors">
              <Target className="w-5 h-5 text-cyan-400 mb-2" /><div className="font-bold">{t('Tebak Nomor')}</div><div className="text-xs text-slate-500 mt-1">{t('Ikuti permainan live.')}</div><ArrowRight className="w-4 h-4 mt-3 text-slate-500" />
            </button>
            <button onClick={() => navigate?.('/game/spinner')} className="rounded-2xl border border-purple-500/20 bg-slate-900 p-4 text-left hover:border-purple-400/60 transition-colors">
              <CircleDot className="w-5 h-5 text-purple-400 mb-2" /><div className="font-bold">{t('Spinner')}</div><div className="text-xs text-slate-500 mt-1">{t('Masuk ke event spinner.')}</div><ArrowRight className="w-4 h-4 mt-3 text-slate-500" />
            </button>
            <button onClick={() => navigate?.('/game/blindbox')} className="rounded-2xl border border-emerald-500/20 bg-slate-900 p-4 text-left hover:border-emerald-400/60 transition-colors">
              <Gift className="w-5 h-5 text-emerald-400 mb-2" /><div className="font-bold">{t('Blind Box')}</div><div className="text-xs text-slate-500 mt-1">{t('Buka Blind Box dengan saldo akun.')}</div><ArrowRight className="w-4 h-4 mt-3 text-slate-500" />
            </button>
          </section>
        </main>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => !isPosting && setIsCreateOpen(false)}>
          <div className="w-full max-w-lg rounded-3xl border border-cyan-500/20 bg-[#08101f] p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-cyan-400 font-bold">{t('Community')}</div>
                <h3 className="text-xl font-black mt-1">{t('Upload / Create Post')}</h3>
              </div>
              <button onClick={() => !isPosting && setIsCreateOpen(false)} className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              maxLength={5000}
              rows={6}
              placeholder={t('Tulis sesuatu untuk dibagikan ke komunitas...')}
              className="w-full mt-5 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none resize-none focus:border-cyan-500/50"
            />
            <div className="text-[10px] text-slate-600 text-right mt-1">{postContent.length}/5000</div>

            <input
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder={t('URL media (opsional)')}
              className="w-full mt-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white outline-none focus:border-cyan-500/50"
            />

            {postError && <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">{postError}</div>}

            <button
              onClick={() => void createPost()}
              disabled={isPosting}
              className="w-full mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300 disabled:opacity-50"
            >
              <Send className="w-4 h-4" /> {isPosting ? t('Menerbitkan...') : t('Terbitkan Postingan')}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
