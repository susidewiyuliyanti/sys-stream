import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  CircleDot,
  Eye,
  Gift,
  LockKeyhole,
  Radio,
  RefreshCw,
  Search,
  Target,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';

interface Props {
  navigate?: (path: string) => void;
}

type LiveRoom = {
  id: string;
  streamer: string;
  title: string;
  category: string;
  viewers: number;
  avatar: string;
  tags: string[];
};

const LIVE_ROOMS: LiveRoom[] = [
  {
    id: 'cyberneko-live',
    streamer: 'CYBERNEKO',
    title: 'Main tebak nomor & spin bareng 🔥',
    category: 'Games',
    viewers: 284,
    avatar: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=160&auto=format&fit=crop&q=80',
    tags: ['Tebak Nomor', 'Spinner'],
  },
  {
    id: 'blindbox-arena',
    streamer: 'BlindBox Arena',
    title: 'Blind Box Night — ikut event malam ini',
    category: 'Event',
    viewers: 176,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&auto=format&fit=crop&q=80',
    tags: ['Blind Box', 'Event'],
  },
  {
    id: 'neon-chat',
    streamer: 'NEON STREAM',
    title: 'Santai, ngobrol & komunitas SYS STREAM',
    category: 'Talk',
    viewers: 92,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80',
    tags: ['Chat', 'Community'],
  },
];

export default function DashboardPage({ navigate }: Props) {
  const { user, isLoggedIn, refreshFinancialState, claimRegistrationBonus } = useGame();
  const [search, setSearch] = useState('');
  const [joinRoom, setJoinRoom] = useState<LiveRoom | null>(null);
  const [requestedRoomId, setRequestedRoomId] = useState<string | null>(null);
  const [isGoingLive, setIsGoingLive] = useState(false);

  const available = Number(user.coins || 0) / 100;
  const locked = Number(user.lockedBalance || 0);

  const filteredRooms = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return LIVE_ROOMS;
    return LIVE_ROOMS.filter((room) =>
      [room.streamer, room.title, room.category, ...room.tags].join(' ').toLowerCase().includes(q)
    );
  }, [search]);

  if (!isLoggedIn) return null;

  const requestJoin = (room: LiveRoom) => {
    setRequestedRoomId(room.id);
    setJoinRoom(null);
  };

  return (
    <section className="min-h-screen bg-[#050814] text-white px-4 py-5 sm:py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-cyan-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SYS STREAM
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-2">
              Halo, {user.username || 'User'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">Temukan streamer yang sedang live dan bergabung ke room.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsGoingLive(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-black text-slate-950 hover:bg-cyan-300 transition-colors"
            >
              <Radio className="w-4 h-4" /> Buka Room
            </button>
            <button
              onClick={() => void refreshFinancialState()}
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:border-cyan-500/50 transition-colors"
              aria-label="Refresh balance"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="grid sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500"><Wallet className="w-4 h-4 text-cyan-400" /> Available</div>
            <div className="text-xl font-black mt-2">{available.toFixed(2)} USDT</div>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-slate-900/80 p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500"><LockKeyhole className="w-4 h-4 text-amber-400" /> Locked</div>
            <div className="text-xl font-black mt-2">{locked.toFixed(2)} USDT</div>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/80 p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500"><Users className="w-4 h-4 text-emerald-400" /> Live Now</div>
            <div className="text-xl font-black mt-2">{LIVE_ROOMS.length} rooms</div>
          </div>
        </div>

        {user.registrationBonusGranted && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Registration Bonus</div>
              <div className="text-lg font-black mt-1 text-emerald-300">Rp15.000</div>
              <p className="text-xs text-slate-400">Bonus pendaftaran masih tersedia untuk diklaim.</p>
            </div>
            <button onClick={() => void claimRegistrationBonus()} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-400 text-slate-950 font-black hover:bg-emerald-300">
              <Gift className="w-4 h-4" /> Claim Bonus
            </button>
          </div>
        )}

        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-rose-400" />
                <h2 className="text-xl font-black">Live Now</h2>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-[10px] font-black text-rose-300">{LIVE_ROOMS.length}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Pilih streamer, lihat room, lalu kirim permintaan untuk bergabung.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari streamer atau room..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-9 pr-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredRooms.map((room) => {
              const requested = requestedRoomId === room.id;
              return (
                <article key={room.id} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-cyan-500/30 transition-colors">
                  <div className="relative h-40 bg-slate-950">
                    <img src={room.avatar} alt={room.streamer} className="w-full h-full object-cover opacity-85" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/10" />
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-2 py-1 text-[10px] font-black">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
                    </span>
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-lg bg-black/60 px-2 py-1 text-[10px] text-white backdrop-blur">
                      <Eye className="w-3 h-3" /> {room.viewers.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={room.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-cyan-500/30" />
                      <div className="min-w-0">
                        <h3 className="font-black text-sm truncate">{room.streamer}</h3>
                        <p className="text-[11px] text-slate-500">{room.category}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold mt-3 line-clamp-2 min-h-10">{room.title}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {room.tags.map((tag) => <span key={tag} className="px-2 py-1 rounded-lg bg-slate-800 text-[9px] text-slate-400">{tag}</span>)}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <button
                        onClick={() => navigate?.('/room/' + room.id)}
                        className="rounded-xl border border-slate-700 py-2.5 text-xs font-bold text-slate-300 hover:text-white hover:border-cyan-500/40"
                      >
                        Lihat Room
                      </button>
                      <button
                        onClick={() => requested ? undefined : requestJoin(room)}
                        className={`rounded-xl py-2.5 text-xs font-black transition-colors ${requested ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-cyan-400 text-slate-950 hover:bg-cyan-300'}`}
                      >
                        {requested ? 'Menunggu Approval' : 'Request Join'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid sm:grid-cols-3 gap-4">
          <button onClick={() => navigate?.('/game/tebak')} className="rounded-2xl border border-cyan-500/20 bg-slate-900 p-4 text-left hover:border-cyan-400/60 transition-colors">
            <Target className="w-5 h-5 text-cyan-400 mb-2" /><div className="font-bold">Tebak Nomor</div><div className="text-xs text-slate-500 mt-1">Ikuti permainan live.</div><ArrowRight className="w-4 h-4 mt-3 text-slate-500" />
          </button>
          <button onClick={() => navigate?.('/game/spinner')} className="rounded-2xl border border-purple-500/20 bg-slate-900 p-4 text-left hover:border-purple-400/60 transition-colors">
            <CircleDot className="w-5 h-5 text-purple-400 mb-2" /><div className="font-bold">Spinner</div><div className="text-xs text-slate-500 mt-1">Masuk ke event spinner.</div><ArrowRight className="w-4 h-4 mt-3 text-slate-500" />
          </button>
          <button onClick={() => navigate?.('/game/blindbox')} className="rounded-2xl border border-emerald-500/20 bg-slate-900 p-4 text-left hover:border-emerald-400/60 transition-colors">
            <Gift className="w-5 h-5 text-emerald-400 mb-2" /><div className="font-bold">Blind Box</div><div className="text-xs text-slate-500 mt-1">Buka Blind Box dengan saldo akun.</div><ArrowRight className="w-4 h-4 mt-3 text-slate-500" />
          </button>
        </section>
      </div>

      {joinRoom && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setJoinRoom(null)}>
          <div className="w-full max-w-sm rounded-3xl border border-cyan-500/20 bg-[#08101f] p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div><div className="text-xs uppercase tracking-wider text-cyan-400 font-bold">Join Room</div><h3 className="text-xl font-black mt-1">{joinRoom.streamer}</h3></div>
              <button onClick={() => setJoinRoom(null)} className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-3 mt-5 rounded-2xl bg-slate-900 p-3">
              <img src={joinRoom.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
              <div><div className="font-bold text-sm">{joinRoom.title}</div><div className="text-xs text-slate-500 mt-1">Streamer akan menyetujui permintaan masuk.</div></div>
            </div>
            <button onClick={() => requestJoin(joinRoom)} className="w-full mt-4 rounded-xl bg-cyan-400 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300">Kirim Request Join</button>
          </div>
        </div>
      )}

      {isGoingLive && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsGoingLive(false)}>
          <div className="w-full max-w-md rounded-3xl border border-cyan-500/20 bg-[#08101f] p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div><div className="text-xs uppercase tracking-wider text-cyan-400 font-bold">Streamer</div><h3 className="text-xl font-black mt-1">Buka Room & Go Live</h3></div>
              <button onClick={() => setIsGoingLive(false)} className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm text-slate-400 mt-3">UI room streamer sudah disiapkan. Tahap berikutnya menghubungkan kamera/live stream, request approval, dan chat real-time ke backend produksi.</p>
            <button onClick={() => { setIsGoingLive(false); navigate?.('/room/my-room'); }} className="w-full mt-5 rounded-xl bg-cyan-400 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300">Masuk ke Room Saya</button>
          </div>
        </div>
      )}
    </section>
  );
};
