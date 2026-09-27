import React, { useState } from 'react';
import { Banknote } from '../types';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ShieldCheck,
  Copy,
  Check,
  Award,
  CheckCircle2,
  Search,
  HelpCircle
} from 'lucide-react';

interface HostSecretAnswerProps {
  banknote: Banknote;
  maskInfo: {
    maskedDisplay: string;
    originalDigits: string;
    maskIndices: number[];
    visibleDigits: string[];
  };
  isAnswerRevealed: boolean;
  level: number;
  onAnswerCorrect: () => void;
  isHostPeekVisible: boolean;
  onToggleHostPeek: () => void;
  showSecretModal: boolean;
  onToggleSecretModal: () => void;
}

export const HostSecretAnswer: React.FC<HostSecretAnswerProps> = ({
  banknote,
  maskInfo,
  isAnswerRevealed,
  level,
  onAnswerCorrect,
  isHostPeekVisible,
  onToggleHostPeek,
  showSecretModal,
  onToggleSecretModal,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [viewerGuessTest, setViewerGuessTest] = useState<string>('');
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Extract the exact hidden digits that viewers need to guess
  const secretDigits = maskInfo.maskIndices
    .map((idx) => maskInfo.originalDigits[idx])
    .join('');

  // Handle quick copy
  const handleCopy = () => {
    navigator.clipboard.writeText(secretDigits);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Test viewer guess against secret digits
  const cleanGuess = viewerGuessTest.trim().replace(/\D/g, '');
  const isGuessMatch = cleanGuess.length > 0 && cleanGuess === secretDigits;

  const showAnswerContent = isHostPeekVisible || isHovered || isAnswerRevealed;

  return (
    <>
      {/* DISCREET HOST-ONLY SECRET BAR */}
      <div className="w-full bg-gradient-to-r from-amber-950/40 via-neutral-900/90 to-amber-950/40 border border-amber-500/40 rounded-2xl p-2.5 sm:p-3 shadow-lg flex flex-wrap items-center justify-between gap-3 relative overflow-hidden">
        {/* Left: Security Tag & Quick Peek Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/50 text-xs font-mono font-black tracking-wider">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>KUNCI JAWABAN HOST ONLY</span>
          </div>

          <button
            onClick={onToggleHostPeek}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              isHostPeekVisible
                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/30'
                : 'bg-white/10 hover:bg-white/20 text-white/90 border border-white/15'
            }`}
            title="Click to peek / hide answer key [Shortcut: H]"
          >
            {isHostPeekVisible ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Close Peek (H)</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Peek Answer (H)</span>
              </>
            )}
          </button>
        </div>

        {/* Center: The Confidential Serial Number Display (Protected by Blur Curtain) */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={onToggleHostPeek}
          className="flex-1 min-w-[240px] flex items-center justify-center cursor-pointer group"
          title="Hover or click to peek answer (Only the Host can see this)"
        >
          {showAnswerContent ? (
            <div className="flex items-center gap-2 font-mono text-xs sm:text-sm animate-in fade-in duration-150">
              <span className="text-white/60 font-semibold hidden sm:inline">Secret Digits:</span>
              <div className="px-2.5 py-0.5 rounded bg-amber-400 text-black font-black text-sm sm:text-base tracking-widest shadow-[0_0_15px_rgba(251,191,36,0.6)]">
                {secretDigits}
              </div>
              <span className="text-white/40 font-mono">|</span>
              <span className="text-white/70 text-xs font-bold">
                Serial No:{' '}
                <span className="text-cyan-300">
                  {banknote.prefix}{' '}
                  {maskInfo.originalDigits.split('').map((char, idx) => {
                    const isSecret = maskInfo.maskIndices.includes(idx);
                    return (
                      <span
                        key={idx}
                        className={
                          isSecret
                            ? 'text-yellow-400 font-black underline decoration-yellow-400'
                            : 'text-white/80'
                        }
                      >
                        {char}
                      </span>
                    );
                  })}
                </span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-mono text-white/50 group-hover:text-white/80 transition-colors">
              <span className="tracking-widest text-amber-400/80 font-bold">
                •••••••••••• (CLICK / HOVER TO PEEK)
              </span>
            </div>
          )}
        </div>

        {/* Right: Quick Action Buttons (Salin, Modal Detail, Status Aman) */}
        <div className="flex items-center gap-1.5">
          {showAnswerContent && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all text-xs flex items-center gap-1"
              title="Copy secret digits to clipboard"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          )}

          <button
            onClick={onToggleSecretModal}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1"
            title="Open full answer key & verify chat guess"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Key Details</span>
          </button>

          <div
            className="hidden md:flex items-center gap-1 text-[11px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30"
            title="OBS viewer screen is safe and does not see this secret number"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Live Screen Safe</span>
          </div>
        </div>
      </div>

      {/* MODAL / JENDELA KUNCI JAWABAN LENGKAP HOST (POPUP AMAN) */}
      {showSecretModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-neutral-900 border-2 border-amber-400 shadow-[0_0_50px_rgba(251,191,36,0.3)] flex flex-col gap-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider">
                    Host Answer Key (Secret)
                  </h3>
                  <p className="text-[11px] text-white/50">For streamer / host only</p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                Level {level}
              </span>
            </div>

            {/* BIG HIGHLIGHTED SECRET ANSWER */}
            <div className="flex flex-col items-center justify-center bg-black/80 p-4 rounded-2xl border border-amber-400/40 text-center gap-1 shadow-inner">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                Secret Digits to Guess:
              </span>
              <div className="font-mono text-4xl sm:text-5xl font-black text-yellow-300 tracking-widest my-1 drop-shadow-[0_0_20px_rgba(253,224,71,0.6)]">
                {secretDigits}
              </div>
              <span className="text-[11px] text-white/60">
                (Viewers in TikTok Live comments must guess the digits above)
              </span>
            </div>

            {/* FULL METADATA & SERIAL DETAILS */}
            <div className="bg-neutral-950 p-3.5 rounded-2xl border border-white/10 flex flex-col gap-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-white/60">Full Serial Number:</span>
                <span className="font-mono font-black text-cyan-300 text-sm">
                  {banknote.prefix} {banknote.digits}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-white/60">Currency:</span>
                <span className="font-bold text-white">
                  {banknote.country} ({banknote.symbol} {banknote.denomination})
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-white/60">Figure / Design:</span>
                <span className="font-semibold text-white/90 text-right truncate max-w-[200px]">
                  {banknote.figureOrLandmark}
                </span>
              </div>
            </div>

            {/* LIVE CHAT QUICK GUESS VERIFIER */}
            <div className="flex flex-col gap-2 pt-1">
              <span className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-cyan-400" />
                Quick Test Viewer Guess:
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Type chat guess (e.g. ${secretDigits})...`}
                  value={viewerGuessTest}
                  onChange={(e) => setViewerGuessTest(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-black border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-amber-400 font-mono"
                />
                {isGuessMatch && (
                  <button
                    onClick={() => {
                      onAnswerCorrect();
                      onToggleSecretModal();
                    }}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1 animate-bounce"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Validate Correct!</span>
                  </button>
                )}
              </div>
              {cleanGuess.length > 0 && (
                <div
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
                    isGuessMatch
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-red-500/20 text-red-300 border border-red-500/40'
                  }`}
                >
                  {isGuessMatch ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>MATCH! This viewer's guess is 100% CORRECT!</span>
                    </>
                  ) : (
                    <>
                      <HelpCircle className="w-4 h-4" />
                      <span>Incorrect. The correct answer is &quot;{secretDigits}&quot;.</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-[11px] text-white/50">Shortcut: Press [H] to peek</span>
              <button
                onClick={onToggleSecretModal}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
