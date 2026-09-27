import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Banknote, PlayerScore, UserProfile } from '../types';
import { BANKNOTES_DATA, acakTutup, getRandomizedBanknote } from '../data/banknotes';
import { BanknoteVisual } from './BanknoteVisual';
import { DigitalTimer } from './DigitalTimer';
import { HostSecretAnswer } from './HostSecretAnswer';
import { sound } from '../services/sound';
import { useAppConfig } from '../context/AppConfigContext';
import confetti from 'canvas-confetti';
import {
  Play,
  RotateCcw,
  SkipForward,
  HelpCircle,
  CheckCircle2,
  Maximize2,
  Award,
  Coins,
  Clock,
  Eye,
  EyeOff,
  Shuffle,
  Wallet
} from 'lucide-react';

interface TebakNomorSeriProps {
  onScoreUpdate: (points: number, rupiah: number, playerName?: string) => void;
  activePrizeNominal: number;
  players: PlayerScore[];
  onOpenLeaderboard: () => void;
  isStreamActive?: boolean;
  userProfile?: UserProfile | null;
  onUpdateWalletBalance?: (newBalance: number) => void;
  onOpenProfile?: () => void;
}

export const TebakNomorSeri: React.FC<TebakNomorSeriProps> = ({
  onScoreUpdate,
  activePrizeNominal,
  players,
  onOpenLeaderboard,
  userProfile,
  onUpdateWalletBalance,
  onOpenProfile
}) => {
  const { t } = useAppConfig();
  // Banknote and Game State
  const [banknotes] = useState<Banknote[]>(BANKNOTES_DATA);
  const [currentIndex, setCurrentIndex] = useState<number>(() => Math.floor(Math.random() * BANKNOTES_DATA.length));
  // Active Banknote with 100% uniquely randomized serial number per user session and round
  const [activeBanknote, setActiveBanknote] = useState<Banknote>(() => {
    const initialIdx = Math.floor(Math.random() * BANKNOTES_DATA.length);
    return getRandomizedBanknote(BANKNOTES_DATA[initialIdx]);
  });
  const [level, setLevel] = useState<number>(2); // 1, 2, 3, 4
  const [revealedDigitsIndices, setRevealedDigitsIndices] = useState<number[]>([]);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [winnerNameInput, setWinnerNameInput] = useState<string>('');

  // Host Secret Answer Peek State (Hanya Host Yang Bisa Melihat)
  const [isHostPeekVisible, setIsHostPeekVisible] = useState<boolean>(false);
  const [showSecretModal, setShowSecretModal] = useState<boolean>(false);

  // Host customizable timer (Default 1 Jam = 3600s, Maksimal 1 Hari = 86400s)
  const [timerDuration, setTimerDuration] = useState<number>(() => {
    const saved = localStorage.getItem('ls_timer_duration');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (parsed > 0 && parsed <= 86400) return parsed;
    }
    return 3600; // 1 Jam default
  });

  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const saved = localStorage.getItem('ls_timer_duration');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (parsed > 0 && parsed <= 86400) return parsed;
    }
    return 3600;
  });

  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Auto-next countdown timer ref
  const autoNextTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentBanknote = activeBanknote;

  // Calculate masked digits using acakTutup function
  const maskInfo = acakTutup(currentBanknote.serialNumber, level, revealedDigitsIndices);

  // Trigger confetti explosion
  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00ffcc', '#ffd700', '#ff007f', '#00ff00', '#ffffff']
      });
    } catch {
      // fallback
    }
  }, []);

  // Next Banknote Handler with guaranteed unique random serial number
  const handleNextBanknote = useCallback(() => {
    if (autoNextTimeoutRef.current) {
      clearTimeout(autoNextTimeoutRef.current);
      autoNextTimeoutRef.current = null;
    }
    setIsAnswerRevealed(false);
    setRevealedDigitsIndices([]);
    const nextIdx = Math.floor(Math.random() * banknotes.length);
    setCurrentIndex(nextIdx);
    setActiveBanknote(getRandomizedBanknote(banknotes[nextIdx]));
    setTimeLeft(timerDuration);
    setIsTimerRunning(true);
  }, [banknotes, timerDuration]);

  // Re-randomize current banknote serial number completely
  const handleRandomizeCurrentSerial = useCallback(() => {
    setActiveBanknote((prev) => getRandomizedBanknote(prev));
    setRevealedDigitsIndices([]);
    setIsAnswerRevealed(false);
    sound.playShuffleSound();
  }, []);

  // Start / Shuffles game with guaranteed unique random serial number
  const handleStartGame = useCallback(() => {
    if (autoNextTimeoutRef.current) {
      clearTimeout(autoNextTimeoutRef.current);
      autoNextTimeoutRef.current = null;
    }
    const randomLevel = Math.floor(Math.random() * 4) + 1;
    setLevel(randomLevel);
    setRevealedDigitsIndices([]);
    setIsAnswerRevealed(false);
    const randomIdx = Math.floor(Math.random() * banknotes.length);
    setCurrentIndex(randomIdx);
    setActiveBanknote(getRandomizedBanknote(banknotes[randomIdx]));
    setTimeLeft(timerDuration);
    setIsTimerRunning(true);
    sound.playBocoranChime();
  }, [banknotes, timerDuration]);

  // Bocoran (B): Reveals 1 masked digit and deducts 5 points
  const handleBocoran = useCallback(() => {
    if (isAnswerRevealed) return;

    // Find the currently masked indices that haven't been revealed yet
    const currentlyMasked = maskInfo.maskIndices;
    if (currentlyMasked.length === 0) return;

    // Reveal the first masked digit
    const digitToReveal = currentlyMasked[0];
    setRevealedDigitsIndices((prev) => [...prev, digitToReveal]);
    sound.playBocoranChime();

    // Deduct 5 points
    onScoreUpdate(-5, -5000);
  }, [isAnswerRevealed, maskInfo.maskIndices, onScoreUpdate]);

  // Mark answer as correct (V / Enter)
  const handleAnswerCorrect = useCallback(() => {
    if (isAnswerRevealed) return;

    setIsAnswerRevealed(true);
    setIsTimerRunning(false);
    sound.playVictoryFanfare();
    triggerConfetti();

    // Award standard +10 points & active prize nominal to designated winner or active player
    const chosenName = winnerNameInput.trim() || undefined;
    onScoreUpdate(10, activePrizeNominal, chosenName);
    setWinnerNameInput('');

    // Auto NEXT after 3 seconds as specified
    if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
    autoNextTimeoutRef.current = setTimeout(() => {
      handleNextBanknote();
    }, 3000);
  }, [isAnswerRevealed, triggerConfetti, winnerNameInput, onScoreUpdate, activePrizeNominal, handleNextBanknote]);

  // Set Duration Handler (Maksimal 24 Jam / 1 Hari = 86400s)
  const handleSetDuration = (seconds: number) => {
    const clamped = Math.min(86400, Math.max(10, seconds));
    setTimerDuration(clamped);
    setTimeLeft(clamped);
    setIsTimerRunning(true);
    localStorage.setItem('ls_timer_duration', clamped.toString());
  };

  // Adjust time (+ / - seconds)
  const handleAdjustTime = (deltaSeconds: number) => {
    setTimeLeft((prev) => {
      const nextVal = Math.min(86400, Math.max(0, prev + deltaSeconds));
      if (nextVal > 0 && !isTimerRunning) {
        setIsTimerRunning(true);
      }
      return nextVal;
    });
  };

  // Toggle Play / Pause
  const handleTogglePlayPause = () => {
    setIsTimerRunning((prev) => !prev);
  };

  // Reset Timer
  const handleResetTimer = () => {
    setTimeLeft(timerDuration);
    setIsTimerRunning(true);
    setIsAnswerRevealed(false);
    sound.playBocoranChime();
  };

  // Timer Tick and Expiry Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 6 && prev > 1) {
            sound.playCountdownTick(prev <= 3);
          }
          if (prev <= 1) {
            // Time up!
            sound.playTimeUp();
            setIsTimerRunning(false);
            setIsAnswerRevealed(true);

            // Auto NEXT after 3 seconds
            if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
            autoNextTimeoutRef.current = setTimeout(() => {
              handleNextBanknote();
            }, 3000);

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeLeft, handleNextBanknote]);

  // Host Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if host is actively typing in an input field
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea') return;

      switch (e.key) {
        case ' ': // Space: Next / Skip
          e.preventDefault();
          handleNextBanknote();
          break;
        case '1':
          setLevel(1);
          setRevealedDigitsIndices([]);
          break;
        case '2':
          setLevel(2);
          setRevealedDigitsIndices([]);
          break;
        case '3':
          setLevel(3);
          setRevealedDigitsIndices([]);
          break;
        case '4':
          setLevel(4);
          setRevealedDigitsIndices([]);
          break;
        case 'a':
        case 'A':
          handleRandomizeCurrentSerial();
          break;
        case 'b':
        case 'B':
          handleBocoran();
          break;
        case 'v':
        case 'V':
        case 'Enter':
          handleAnswerCorrect();
          break;
        case 'r':
        case 'R':
          handleResetTimer();
          break;
        case 'z':
        case 'Z':
          setIsZoomed((prev) => !prev);
          break;
        case 'x':
        case 'X':
          setIsTimerRunning(false);
          onOpenLeaderboard();
          break;
        case 'h':
        case 'H':
        case 'j':
        case 'J':
          setIsHostPeekVisible((prev) => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleNextBanknote,
    handleBocoran,
    handleAnswerCorrect,
    timerDuration,
    onOpenLeaderboard
  ]);

  // Clean up autoNext on unmount
  useEffect(() => {
    return () => {
      if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
    };
  }, []);

  // Format Duration description for top header
  const formatHeaderDuration = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h} Jam ${m > 0 ? `${m}m` : ''}`;
    if (m > 0) return `${m} Menit ${s > 0 ? `${s}s` : ''}`;
    return `${s} Detik`;
  };

  return (
    <div className="flex flex-col items-center justify-between w-full max-w-5xl mx-auto px-2 sm:px-4 py-2 select-none">
      {/* Top Status & Controls Header */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-3 bg-black/50 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/40">
            {currentIndex + 1} / 400
          </span>
          <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/40">
            {t('level_label')} {level} ({t('close_digits')} {level} DIGIT)
          </span>
          <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-mono text-xs font-bold border border-purple-500/40 flex items-center gap-1" title="Anti-Sama unique random">
            <Shuffle className="w-3 h-3 text-purple-400" /> {t('unique_shuffle')}
          </span>
          {currentBanknote.isCrypto && (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/40 flex items-center gap-1">
              <Coins className="w-3 h-3 text-amber-400" /> CRYPTO NOTE
            </span>
          )}
        </div>

        {/* Level Switcher Buttons 1 - 4 */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-white/60 font-semibold mr-1 hidden sm:inline">{t('level_label')}:</span>
          {[1, 2, 3, 4].map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                setLevel(lvl);
                setRevealedDigitsIndices([]);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                level === lvl
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 scale-105 border border-cyan-300'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
              title={`Level ${lvl}`}
            >
              L{lvl}
            </button>
          ))}
        </div>

        {/* Timer Duration & Unified Host Wallet Badge */}
        <div className="flex items-center gap-2">
          {userProfile && (
            <div
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold shadow-md cursor-pointer hover:bg-emerald-900/60 transition-all"
              title="Dompet Terpadu Host • Klik untuk Buka Profil & Deposit"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] text-white/70">Dompet:</span>
              <span className="text-emerald-300 font-black">
                Rp {(userProfile.walletBalance ?? 15000).toLocaleString('id-ID')}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t('timer_label')}: {formatHeaderDuration(timerDuration)}</span>
          </div>
        </div>
      </div>

      {/* Center 3D Banknote Showcase Card */}
      <div className="w-full relative my-1">
        <BanknoteVisual
          banknote={currentBanknote}
          maskedDigits={maskInfo.visibleDigits}
          maskIndices={maskInfo.maskIndices}
          isRevealed={isAnswerRevealed}
          isZoomed={isZoomed}
          onToggleZoom={() => setIsZoomed(!isZoomed)}
        />
      </div>

      {/* BIG SERIAL NUMBER DISPLAY WITH POPPINS EXTRABOLD & NEON MYSTERY QUESTION MARKS */}
      <div className="w-full my-3 flex flex-col items-center">
        {/* Label Teks Tepat di Atas Jajaran Digit */}
        <div className="text-center font-mono font-black text-sm sm:text-base tracking-widest text-cyan-300 mb-2 uppercase drop-shadow-md flex items-center gap-2">
          <span>{t('serial_number_label')}: {isAnswerRevealed ? currentBanknote.serialNumber : maskInfo.maskedDisplay}</span>
          {isAnswerRevealed && (
            <span className="text-xs bg-emerald-500 text-black px-2 py-0.5 rounded-full font-bold animate-pulse">
              {t('revealed_label')}
            </span>
          )}
        </div>

        {/* Row of 80px High-Contrast Digits */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-full overflow-x-auto p-2">
          {/* Country Prefix (e.g. IDR, USD, EUR, BTC) */}
          <div className="h-16 sm:h-20 px-3 sm:px-4 flex items-center justify-center bg-black/90 rounded-2xl border-2 border-white/20 shadow-xl">
            <span className="font-['Chakra_Petch',sans-serif] font-black text-2xl sm:text-3xl tracking-wider text-yellow-400">
              {currentBanknote.prefix.trim()}
            </span>
          </div>

          {/* Individual Digits Blocks */}
          {maskInfo.originalDigits.split('').map((digit, idx) => {
            const isMaskedAndHidden = maskInfo.maskIndices.includes(idx) && !isAnswerRevealed;

            return (
              <div
                key={idx}
                className={`relative w-12 sm:w-16 h-16 sm:h-20 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-2xl ${
                  isMaskedAndHidden
                    ? 'bg-black border-2 border-[#00ffcc] shadow-[0_0_20px_rgba(0,255,204,0.6),inset_0_0_12px_rgba(0,255,204,0.3)] scale-105 animate-pulse'
                    : isAnswerRevealed && maskInfo.maskIndices.includes(idx)
                    ? 'bg-emerald-950 border-2 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)]'
                    : 'bg-black/90 border border-white/30 text-white'
                }`}
              >
                {isMaskedAndHidden ? (
                  <span className="font-['Poppins',sans-serif] font-extrabold text-3xl sm:text-4xl text-[#00ffcc] drop-shadow-[0_0_12px_#00ffcc]">
                    ?
                  </span>
                ) : (
                  <span
                    className={`font-['Poppins',sans-serif] font-black text-3xl sm:text-4xl ${
                      isAnswerRevealed && maskInfo.maskIndices.includes(idx)
                        ? 'text-emerald-400'
                        : 'text-white'
                    }`}
                  >
                    {digit}
                  </span>
                )}

                {/* Corner small digit index */}
                <span className="absolute bottom-1 right-1.5 text-[9px] font-mono text-white/30 font-semibold">
                  {idx + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* TAMPILAN DIGITAL TIMER (CUSTOM 1 JAM S/D MAKSIMAL 1 HARI) */}
      <div className="w-full my-2">
        <DigitalTimer
          timeLeft={timeLeft}
          timerDuration={timerDuration}
          isTimerRunning={isTimerRunning}
          onTogglePlayPause={handleTogglePlayPause}
          onReset={handleResetTimer}
          onSetDuration={handleSetDuration}
          onAdjustTime={handleAdjustTime}
        />
      </div>

      {/* STREAMER GAMEPLAY ACTION BUTTONS */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mt-2 bg-neutral-950/80 p-3.5 sm:p-4 rounded-2xl border border-white/15">
        {/* Streamer Host Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {/* Tombol Kunci Jawaban Host (H) */}
          <button
            onClick={() => setIsHostPeekVisible((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
              isHostPeekVisible
                ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30'
                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
            }`}
            title="Intip Kunci Jawaban Rahasia (Hanya Host) [Shortcut: H]"
          >
            {isHostPeekVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="hidden sm:inline">Kunci (H)</span>
          </button>

          {/* Tombol MULAI */}
          <button
            onClick={handleStartGame}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-sm shadow-lg shadow-green-600/30 transition-all hover:scale-105 active:scale-95"
            title="Mulai acak uang dan reset timer [Host]"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>MULAI GAME</span>
          </button>

          {/* Tombol BOCORAN (B) */}
          <button
            onClick={handleBocoran}
            disabled={isAnswerRevealed || maskInfo.maskIndices.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 disabled:opacity-40 text-white font-bold text-sm shadow-lg shadow-amber-600/30 transition-all hover:scale-105 active:scale-95"
            title="Shortcut: B"
          >
            <HelpCircle className="w-4 h-4" />
            <span>{t('btn_hint')} <span className="text-yellow-200 text-xs">(-5)</span></span>
          </button>

          {/* Tombol JAWABAN BENAR (V / Enter) */}
          <button
            onClick={handleAnswerCorrect}
            disabled={isAnswerRevealed}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white font-extrabold text-sm shadow-lg shadow-cyan-600/30 transition-all hover:scale-105 active:scale-95 border border-cyan-300"
            title="Shortcut: V / Enter"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{t('btn_correct')}</span>
          </button>

          {/* Tombol Reset Timer (R) */}
          <button
            onClick={handleResetTimer}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
            title="Reset Timer [R]"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Tombol Next / Lewati (Space) */}
          <button
            onClick={handleNextBanknote}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all"
            title="Shortcut: Spasi"
          >
            <SkipForward className="w-4 h-4" />
            <span>{t('btn_skip')}</span>
          </button>

          {/* Tombol Acak Seri Baru (A) */}
          <button
            onClick={handleRandomizeCurrentSerial}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-400/40 font-bold text-xs transition-all hover:scale-105 active:scale-95"
            title="Shortcut: A"
          >
            <Shuffle className="w-4 h-4 text-purple-300" />
            <span>{t('btn_shuffle_serial')}</span>
          </button>

          {/* Tombol Zoom (Z) */}
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className={`p-2.5 rounded-xl transition-all ${
              isZoomed ? 'bg-cyan-500 text-black' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="Zoom [Z]"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Quick Winner Assigner to Leaderboard */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder={t('spectator_username_placeholder')}
            value={winnerNameInput}
            onChange={(e) => setWinnerNameInput(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg bg-neutral-900 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 w-full sm:w-44"
          />
          <button
            onClick={onOpenLeaderboard}
            className="px-3 py-1.5 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 font-bold text-xs border border-yellow-500/40 flex items-center gap-1 shrink-0"
            title="Papan Skor [X]"
          >
            <Award className="w-3.5 h-3.5" />
            {t('btn_score')}
          </button>
        </div>
      </div>

      {/* KUNCI JAWABAN KHUSUS HOST DI BAWAH (HANYA HOST YANG BISA MELIHAT) */}
      <div className="w-full my-3">
        <HostSecretAnswer
          banknote={currentBanknote}
          maskInfo={maskInfo}
          isAnswerRevealed={isAnswerRevealed}
          level={level}
          onAnswerCorrect={handleAnswerCorrect}
          isHostPeekVisible={isHostPeekVisible}
          onToggleHostPeek={() => setIsHostPeekVisible((prev) => !prev)}
          showSecretModal={showSecretModal}
          onToggleSecretModal={() => setShowSecretModal((prev) => !prev)}
        />
      </div>

      {/* Host Keyboard Shortcuts Legend Footer */}
      <div className="w-full mt-3 px-3 py-2 rounded-xl bg-black/40 border border-white/10 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-white/60">
        <span className="font-semibold text-white/80">KONTROL STREAMER:</span>
        <span><kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-amber-300 border border-neutral-700">H / J</kbd> Kunci Jawaban (Host)</span>
        <span><kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-cyan-300 border border-neutral-700">Spasi</kbd> Next</span>
        <span><kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-cyan-300 border border-neutral-700">1 - 4</kbd> Ganti Level</span>
        <span><kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-cyan-300 border border-neutral-700">B</kbd> Bocoran (-5 Poin)</span>
        <span><kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-cyan-300 border border-neutral-700">V / Enter</kbd> Jawaban Benar</span>
        <span><kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-purple-300 border border-neutral-700">A</kbd> Acak Seri Baru</span>
        <span><kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-cyan-300 border border-neutral-700">R</kbd> Reset Timer</span>
        <span><kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-cyan-300 border border-neutral-700">Z</kbd> Zoom Uang</span>
        <span><kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-cyan-300 border border-neutral-700">X</kbd> Papan Skor</span>
      </div>
    </div>
  );
};
