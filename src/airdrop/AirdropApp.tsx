import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileVideo,
  Gift,
  ImagePlus,
  Link2,
  ListChecks,
  Menu,
  PlayCircle,
  Send,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
  Youtube,
} from 'lucide-react';
import { SysLogo } from '../components/SysLogo';

type TaskType = 'youtube' | 'social' | 'upload';

type Task = {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  reward: string;
  estimated: string;
  action: string;
};

const TASKS: Task[] = [
  {
    id: 'youtube-review',
    type: 'youtube',
    title: 'Review Video YouTube',
    description: 'Tonton video sampai selesai, lalu kirim penilaian dan bukti sesuai instruksi task.',
    reward: 'Reward task',
    estimated: '± 5 menit',
    action: 'Review video',
  },
  {
    id: 'social-follow',
    type: 'social',
    title: 'Social Media Task',
    description: 'Ikuti akun atau lakukan aktivitas sosial yang tercantum pada detail task.',
    reward: 'Reward task',
    estimated: '± 2 menit',
    action: 'Buka task',
  },
  {
    id: 'proof-upload',
    type: 'upload',
    title: 'Upload Bukti Aktivitas',
    description: 'Kirim screenshot atau bukti aktivitas setelah menyelesaikan task yang diminta.',
    reward: 'Reward task',
    estimated: '± 3 menit',
    action: 'Upload bukti',
  },
];

function typeIcon(type: TaskType) {
  if (type === 'youtube') return <Youtube className="w-5 h-5" />;
  if (type === 'upload') return <Upload className="w-5 h-5" />;
  return <Link2 className="w-5 h-5" />;
}

function typeLabel(type: TaskType) {
  if (type === 'youtube') return 'YOUTUBE';
  if (type === 'upload') return 'PROOF';
  return 'SOCIAL';
}

export default function AirdropApp() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tab, setTab] = useState<'tasks' | 'submissions'>('tasks');

  const availableTasks = useMemo(() => TASKS, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="max-w-7xl mx-auto h-16 px-4 flex items-center justify-between">
          <a href="https://sysstreamer.asia" className="shrink-0">
            <SysLogo size="md" showText />
          </a>
          <nav className="hidden md:flex items-center gap-2 text-sm">
            <button onClick={() => setTab('tasks')} className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900">Tasks</button>
            <button onClick={() => setTab('submissions')} className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900">My submissions</button>
            <a href="https://sysstreamer.asia/login" className="px-4 py-2 rounded-lg bg-slate-100 text-slate-950 font-bold">Login</a>
          </nav>
          <button className="md:hidden p-2 rounded-lg hover:bg-slate-900" onClick={() => setMenuOpen(v => !v)} aria-label="Open menu">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-slate-800 px-4 py-3 space-y-2">
            <button onClick={() => { setTab('tasks'); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900">Tasks</button>
            <button onClick={() => { setTab('submissions'); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-slate-900">My submissions</button>
            <a href="https://sysstreamer.asia/login" className="block px-3 py-2 rounded-lg bg-slate-100 text-slate-950 font-bold">Login</a>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-10 overflow-hidden relative">
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-amber-400"><ShieldCheck className="w-4 h-4" /> SYS STREAM TASK CENTER</div>
            <h1 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight">Complete tasks. Submit proof. Earn rewards.</h1>
            <p className="mt-4 text-slate-400 max-w-2xl">Selesaikan review video YouTube dan social task yang tersedia. Setiap task memiliki instruksi, bukti, dan proses review sebelum reward diproses.</p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-300">
              <span className="px-3 py-2 rounded-full bg-slate-800 border border-slate-700">✓ Instruksi per task</span>
              <span className="px-3 py-2 rounded-full bg-slate-800 border border-slate-700">✓ Proof submission</span>
              <span className="px-3 py-2 rounded-full bg-slate-800 border border-slate-700">✓ Review sebelum reward</span>
            </div>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            [<ListChecks className="w-5 h-5" />, 'Available tasks', '—'],
            [<Clock3 className="w-5 h-5" />, 'Pending review', '—'],
            [<CheckCircle2 className="w-5 h-5" />, 'Approved', '—'],
            [<Gift className="w-5 h-5" />, 'Rewards', '—'],
          ].map(([icon, label, value]) => (
            <div key={label as string} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs">{icon}{label}</div>
              <div className="mt-2 text-xl font-black">{value}</div>
            </div>
          ))}
        </section>

        <div className="mt-8 flex items-center gap-2 border-b border-slate-800">
          <button onClick={() => setTab('tasks')} className={`px-4 py-3 text-sm font-bold border-b-2 ${tab === 'tasks' ? 'border-amber-400 text-white' : 'border-transparent text-slate-500'}`}>Available Tasks</button>
          <button onClick={() => setTab('submissions')} className={`px-4 py-3 text-sm font-bold border-b-2 ${tab === 'submissions' ? 'border-amber-400 text-white' : 'border-transparent text-slate-500'}`}>My Submissions</button>
        </div>

        {tab === 'tasks' ? (
          <section className="mt-6 grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {availableTasks.map(task => (
              <article key={task.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-slate-300">{typeIcon(task.type)} {typeLabel(task.type)}</span>
                  <span className="text-xs text-slate-500">{task.estimated}</span>
                </div>
                <h2 className="mt-5 text-lg font-bold">{task.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400 flex-1">{task.description}</p>
                <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-slate-500">Reward</div>
                    <div className="font-bold text-amber-400">{task.reward}</div>
                  </div>
                  <button onClick={() => setSelectedTask(task)} className="px-4 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-sm hover:bg-amber-300">{task.action}</button>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
            <FileVideo className="w-10 h-10 mx-auto text-slate-600" />
            <h2 className="mt-4 font-bold">Belum ada submission</h2>
            <p className="mt-2 text-sm text-slate-500">Submission yang kamu kirim akan tampil di sini setelah akun terhubung.</p>
          </section>
        )}
      </main>

      <footer className="border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-xs text-slate-500 flex flex-wrap gap-3 justify-between">
          <span>SYS STREAM Airdrop & Task Center</span>
          <span>Task rewards are subject to review and program rules.</span>
        </div>
      </footer>

      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/70 p-4 flex items-center justify-center" onClick={() => setSelectedTask(null)}>
          <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-amber-400">{typeLabel(selectedTask.type)}</div>
                <h2 className="mt-1 text-xl font-black">{selectedTask.title}</h2>
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-2 rounded-lg hover:bg-slate-800" aria-label="Close"><X className="w-5 h-5" /></button>
            </div>
            <div className="mt-6 space-y-4">
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-4">
                <div className="text-xs text-slate-500">Task instructions</div>
                <p className="mt-2 text-sm text-slate-300">Detail task, target URL, reward, batas waktu, dan jenis bukti akan ditampilkan oleh sistem task saat task ini diaktifkan.</p>
              </div>
              <a href="https://sysstreamer.asia/login" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-amber-400 text-slate-950 font-bold"><ExternalLink className="w-4 h-4" /> Login to continue</a>
              <p className="text-xs text-slate-500 text-center">Login diperlukan untuk mengambil task dan mengirim submission.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
