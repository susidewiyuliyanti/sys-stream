import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  Copy,
  Check,
  Megaphone,
  MessageCircle,
  Video,
  Target,
  Lightbulb,
  RefreshCw
} from 'lucide-react';

type AgentTask =
  | 'content'
  | 'reply'
  | 'campaign'
  | 'video_script'
  | 'strategy';

const TASKS = [
  {
    id: 'content' as AgentTask,
    label: 'Content Generator',
    description: 'Buat caption, posting, hook, CTA, dan konten promosi.',
    icon: <Megaphone className="w-5 h-5" />
  },
  {
    id: 'reply' as AgentTask,
    label: 'Comments & DM',
    description: 'Buat draft jawaban komentar dan pesan komunitas.',
    icon: <MessageCircle className="w-5 h-5" />
  },
  {
    id: 'video_script' as AgentTask,
    label: 'Video Script',
    description: 'Buat script TikTok, Shorts, Reels, dan YouTube.',
    icon: <Video className="w-5 h-5" />
  },
  {
    id: 'campaign' as AgentTask,
    label: 'Campaign',
    description: 'Buat konsep campaign dan kalender konten.',
    icon: <Target className="w-5 h-5" />
  },
  {
    id: 'strategy' as AgentTask,
    label: 'Strategy',
    description: 'Analisis strategi marketing dan community growth.',
    icon: <Lightbulb className="w-5 h-5" />
  }
];

export default function AIAgentPanel() {
  const [task, setTask] = useState<AgentTask>('content');
  const [platform, setPlatform] = useState('general');
  const [language, setLanguage] = useState('id');
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const selected = TASKS.find(x => x.id === task) || TASKS[0];

  const runAgent = async () => {
    if (!prompt.trim()) {
      setError('Instruksi AI Agent wajib diisi.');
      return;
    }

    setLoading(true);
    setError('');
    setOutput('');

    try {
      const response = await fetch('/api/ai-agent', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          task,
          prompt: prompt.trim(),
          language,
          platform,
          context: {
            product: 'SYS STREAM',
            verified_context_only: true,
            admin_approval_required_for_publication: true
          }
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'AI Agent gagal memproses permintaan.');
      }

      setOutput(String(data.output || ''));
    } catch (e: any) {
      setError(e?.message || 'AI Agent gagal memproses permintaan.');
    } finally {
      setLoading(false);
    }
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError('Output tidak dapat disalin.');
    }
  };

  return (
    <div className="space-y-6">

      <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-violet-300 text-xs font-black uppercase">
              <Bot className="w-4 h-4" />
              SYS STREAM AI AGENT
            </div>

            <h2 className="text-2xl font-black mt-2">
              AI Marketing & Community Center
            </h2>

            <p className="text-sm text-slate-400 mt-2 max-w-3xl">
              Buat konten, script video, campaign, strategi, dan draft
              balasan komunitas dari satu dashboard admin.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold text-emerald-300">
              AI CORE
            </span>
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-[330px_minmax(0,1fr)] gap-6">

        <div className="space-y-4">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
              Agent Task
            </div>

            <div className="space-y-2">
              {TASKS.map(item => (
                <button
                  key={item.id}
                  onClick={() => setTask(item.id)}
                  className={`w-full text-left rounded-xl border p-3 ${
                    task === item.id
                      ? 'border-violet-500/50 bg-violet-500/10'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-violet-300">
                      {item.icon}
                    </div>

                    <div>
                      <div className="text-sm font-bold">
                        {item.label}
                      </div>

                      <div className="text-[11px] text-slate-500 mt-1">
                        {item.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-4">

            <div className="text-xs font-black uppercase tracking-wider text-slate-500">
              Settings
            </div>

            <label className="block">
              <span className="text-xs font-semibold text-slate-400">
                Platform
              </span>

              <select
                value={platform}
                onChange={e => setPlatform(e.target.value)}
                className="mt-2 w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2.5 text-sm"
              >
                <option value="general">General</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
                <option value="youtube-shorts">YouTube Shorts</option>
                <option value="instagram">Instagram</option>
                <option value="twitter">X / Twitter</option>
                <option value="telegram">Telegram</option>
                <option value="discord">Discord</option>
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-slate-400">
                Language
              </span>

              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="mt-2 w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2.5 text-sm"
              >
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English</option>
              </select>
            </label>

          </div>
        </div>

        <div className="space-y-6">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs font-black uppercase text-violet-300">
                  {selected.label}
                </div>

                <div className="text-xs text-slate-500 mt-1">
                  {selected.description}
                </div>
              </div>

              <Sparkles className="w-5 h-5 text-violet-300" />
            </div>

            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Tulis perintah untuk AI Agent..."
              className="w-full min-h-[200px] rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-sm leading-6 outline-none resize-y"
            />

            {error && (
              <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 text-xs p-3">
                {error}
              </div>
            )}

            <button
              onClick={() => void runAgent()}
              disabled={loading || !prompt.trim()}
              className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white font-extrabold py-3"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  AI sedang bekerja...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Run AI Agent
                </>
              )}
            </button>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">

            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">

              <div>
                <div className="text-sm font-black">
                  AI Output
                </div>

                <div className="text-[11px] text-slate-500 mt-1">
                  Draft hasil AI — review admin sebelum publikasi.
                </div>
              </div>

              <button
                onClick={() => void copyOutput()}
                disabled={!output}
                className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold disabled:opacity-40"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>

            </div>

            <div className="min-h-[300px] p-5">

              {output ? (
                <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-200">
                  {output}
                </pre>
              ) : (
                <div className="min-h-[260px] flex items-center justify-center text-center">
                  <div>
                    <Bot className="w-10 h-10 mx-auto text-slate-700 mb-3" />
                    <div className="text-sm font-bold text-slate-500">
                      Belum ada output
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      Pilih task dan jalankan AI Agent.
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="text-xs font-black text-amber-300 mb-2">
              AI SAFETY
            </div>

            <ul className="text-xs text-slate-400 leading-6 list-disc pl-5">
              <li>AI tidak mengarang aturan Airdrop, reward, saldo, eligibility, tanggal, atau link.</li>
              <li>Tidak melakukan spam atau fake engagement.</li>
              <li>Konten publik harus dapat direview admin.</li>
              <li>Social media automation akan menggunakan API resmi.</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
