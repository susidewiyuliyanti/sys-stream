import React, { useState } from 'react';
import { Send, X, Loader2 } from 'lucide-react';
import { useLanguage } from '../i18n';
import { useGame } from '../context/GameContext';

export default function AIChat() {
  const { t, language } = useLanguage();
  const { isLoggedIn } = useGame();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isLoggedIn) return null;

  const ask = async () => {
    const text = message.trim();
    if (!text || loading) return;

    setLoading(true);
    setError('');
    setReply('');
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, language }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(String(data.error || t('AI is temporarily unavailable.')));
      }
      setReply(String(data.message || ''));
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('AI is temporarily unavailable.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <section
          role="dialog"
          aria-label={t('Miss SYS')}
          className="fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-50 mx-auto flex max-h-[min(68dvh,560px)] w-auto max-w-[390px] flex-col overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-950 shadow-2xl shadow-black/50 sm:inset-x-auto sm:bottom-20 sm:right-4 sm:mx-0 sm:w-[min(92vw,390px)]"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3">
            <div className="min-w-0">
              <div className="text-sm font-black text-white">{t('Miss SYS')}</div>
              <div className="text-[11px] text-slate-400">{t('Read-only account assistant')}</div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t('Close')}
              className="ml-3 shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {!reply && !error && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-sm text-slate-300">
                {t('Ask about your balance, airdrop rewards, or recent transactions.')}
              </div>
            )}
            {reply && (
              <div className="whitespace-pre-wrap break-words rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 text-sm leading-6 text-slate-200">
                {reply}
              </div>
            )}
            {error && (
              <div className="mt-3 break-words rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-300">
                {error}
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-slate-800 p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void ask();
                  }
                }}
                rows={2}
                maxLength={2000}
                placeholder={t('Ask Miss SYS...')}
                className="min-w-0 flex-1 resize-none rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={() => void ask()}
                disabled={!message.trim() || loading}
                aria-label={t('Send')}
                className="shrink-0 rounded-xl bg-cyan-400 p-3 text-slate-950 transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        aria-label={t('Miss SYS')}
        title={t('Miss SYS')}
        aria-expanded={open}
        className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-3 z-40 inline-flex max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-full border border-cyan-400/40 bg-slate-900 px-3 py-2.5 text-xs font-black text-cyan-300 shadow-xl shadow-black/30 hover:border-cyan-300 hover:text-white sm:bottom-5 sm:right-4 sm:px-4 sm:py-3 sm:text-sm"
      >
        <span>{t('Miss SYS')}</span>
      </button>
    </>
  );
}
