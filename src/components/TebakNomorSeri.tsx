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
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-3 select-none">
      {/* GAME HEADER */}
      <div className="rounded-xl bg-[#0f0f12] border border-white/[0.08] overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.08]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-white/[0.06] border border-white/[0.08] text-white/80 text-xs font-medium">
                Round {currentIndex + 1} / 400
              </span>

              <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium">
                {t('level_label')} {level}
              </span>

              <span className="px-2.5 py-1 rounded-md bg-white/[0.06] border border-white/[0.08] text-white/60 text-xs font-medium flex items-center gap-1.5">
                <Shuffle className="w-3 h-3" />
                {t('unique_shuffle')}
              </span>

              {currentBanknote.isCrypto && (
                <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium flex items-center gap-1.5">
                  <Coins className="w-3 h-3" />
                  CRYPTO
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-lg p-1">
                {[1, 2, 3, 4].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      setLevel(lvl);
                      setRevealedDigitsIndices([]);
                    }}
                    className={`min-w-9 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                      level === lvl
                        ? 'bg-cyan-500 text-black'
                        : 'text-white/60 hover:text-white hover:bg-white/[0.08]'
                    }`}
                    title={`Level ${lvl}`}
                  >
                    L{lvl}
                  </button>
                ))}
              </div>

              {userProfile && (
                <button
                  onClick={onOpenProfile}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors"
                  title="Buka profil dan dompet"
                >
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs text-white/50">Rp</span>
                  <span className="text-xs font-semibold text-white">
                    {(userProfile.walletBalance ?? 15000).toLocaleString('id-ID')}
                  </span>
                </button>
              )}

              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs text-white/70">
                  {formatHeaderDuration(timerDuration)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BANKNOTE STAGE */}
        <div className="p-3 sm:p-5">
          <div className="rounded-xl bg-[#09090b] border border-white/[0.06] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-white/35 font-semibold">
                  Tebak Nomor Seri
                </p>
                <p className="text-xs text-white/50 mt-0.5">
                  Identifikasi nomor seri pada uang berikut
                </p>
              </div>

              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className={`p-2 rounded-lg border transition-colors ${
                  isZoomed
                    ? 'bg-cyan-500 text-black border-cyan-400'
                    : 'bg-white/[0.04] text-white/60 border-white/[0.08] hover:text-white hover:bg-white/[0.08]'
                }`}
                title="Zoom [Z]"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2 sm:p-4">
              <BanknoteVisual
                banknote={currentBanknote}
                maskedDigits={maskInfo.visibleDigits}
                maskIndices={maskInfo.maskIndices}
                isRevealed={isAnswerRevealed}
                isZoomed={isZoomed}
                onToggleZoom={() => setIsZoomed(!isZoomed)}
              />
            </div>
          </div>

          {/* SERIAL NUMBER */}
          <div className="mt-4 rounded-xl bg-[#0f0f12] border border-white/[0.08] p-4">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              <span className="text-xs sm:text-sm font-semibold tracking-wide text-white/60 uppercase">
                {t('serial_number_label')}
              </span>

              {isAnswerRevealed ? (
                <span className="text-sm sm:text-base font-bold text-emerald-400 font-mono">
                  {currentBanknote.serialNumber}
                </span>
              ) : (
                <span className="text-sm sm:text-base font-bold text-cyan-300 font-mono">
                  {maskInfo.maskedDisplay}
                </span>
              )}

              {isAnswerRevealed && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold uppercase">
                  {t('revealed_label')}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              <div className="h-12 sm:h-14 min-w-16 px-3 flex items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.1]">
                <span className="font-mono font-bold text-lg sm:text-xl text-amber-300">
                  {currentBanknote.prefix.trim()}
                </span>
              </div>

              {maskInfo.originalDigits.split('').map((digit, idx) => {
                const isMaskedAndHidden =
                  maskInfo.maskIndices.includes(idx) && !isAnswerRevealed;

                return (
                  <div
                    key={idx}
                    className={`relative w-11 sm:w-14 h-12 sm:h-14 rounded-lg flex items-center justify-center transition-all ${
                      isMaskedAndHidden
                        ? 'bg-cyan-500/[0.06] border border-cyan-400/50'
                        : isAnswerRevealed && maskInfo.maskIndices.includes(idx)
                        ? 'bg-emerald-500/[0.08] border border-emerald-400/40'
                        : 'bg-white/[0.03] border border-white/[0.1]'
                    }`}
                  >
                    <span
                      className={`font-mono font-bold text-2xl sm:text-3xl ${
                        isMaskedAndHidden
                          ? 'text-cyan-300'
                          : isAnswerRevealed && maskInfo.maskIndices.includes(idx)
                          ? 'text-emerald-400'
                          : 'text-white'
                      }`}
                    >
                      {isMaskedAndHidden ? '?' : digit}
                    </span>

                    <span className="absolute bottom-0.5 right-1 text-[8px] font-mono text-white/20">
                      {idx + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TIMER */}
          <div className="mt-4 rounded-xl bg-[#0f0f12] border border-white/[0.08] overflow-hidden">
            <div className="px-4 py-2 border-b border-white/[0.06] flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-white/40 font-semibold">
                Timer
              </span>
              <span className="text-xs text-white/40">
                {formatHeaderDuration(timerDuration)}
              </span>
            </div>

            <div className="p-3">
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
          </div>

          {/* HOST CONTROLS */}
          <div className="mt-4 rounded-xl bg-[#0f0f12] border border-white/[0.08] p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-white/40 font-semibold">
                  Kontrol Game
                </p>
                <p className="text-xs text-white/35 mt-0.5">
                  Kontrol khusus streamer / host
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              <button
                onClick={() => setIsHostPeekVisible((prev) => !prev)}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold border transition-colors ${
                  isHostPeekVisible
                    ? 'bg-amber-400 text-black border-amber-300'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/15'
                }`}
                title="Intip kunci jawaban [H]"
              >
                {isHostPeekVisible ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                Kunci (H)
              </button>

              <button
                onClick={handleStartGame}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 text-xs font-semibold transition-colors"
                title="Mulai game"
              >
                <Play className="w-4 h-4" />
                Mulai Game
              </button>

              <button
                onClick={handleBocoran}
                disabled={isAnswerRevealed || maskInfo.maskIndices.length === 0}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/15 disabled:opacity-30 text-amber-300 border border-amber-500/20 text-xs font-semibold transition-colors"
                title="Bocoran [B]"
              >
                <HelpCircle className="w-4 h-4" />
                {t('btn_hint')}
              </button>

              <button
                onClick={handleAnswerCorrect}
                disabled={isAnswerRevealed}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/15 disabled:opacity-30 text-cyan-300 border border-cyan-500/20 text-xs font-semibold transition-colors"
                title="Jawaban benar [V / Enter]"
              >
                <CheckCircle2 className="w-4 h-4" />
                {t('btn_correct')}
              </button>

              <button
                onClick={handleResetTimer}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] text-xs font-semibold transition-colors"
                title="Reset Timer [R]"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>

              <button
                onClick={handleNextBanknote}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.08] text-xs font-semibold transition-colors"
                title="Next [Space]"
              >
                <SkipForward className="w-4 h-4" />
                {t('btn_skip')}
              </button>

              <button
                onClick={handleRandomizeCurrentSerial}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/15 text-purple-300 border border-purple-500/20 text-xs font-semibold transition-colors"
                title="Acak seri baru [A]"
              >
                <Shuffle className="w-4 h-4" />
                Acak Seri
              </button>

              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-semibold transition-colors ${
                  isZoomed
                    ? 'bg-cyan-500 text-black border-cyan-400'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border-white/[0.08]'
                }`}
                title="Zoom [Z]"
              >
                <Maximize2 className="w-4 h-4" />
                Zoom
              </button>
            </div>

            {/* LEADERBOARD */}
            <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder={t('spectator_username_placeholder')}
                value={winnerNameInput}
                onChange={(e) => setWinnerNameInput(e.target.value)}
                className="flex-1 min-w-0 px-3 py-2.5 text-xs rounded-lg bg-black/20 border border-white/[0.08] text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/40"
              />

              <button
                onClick={onOpenLeaderboard}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/15 text-yellow-300 border border-yellow-500/20 text-xs font-semibold transition-colors"
                title="Papan Skor [X]"
              >
                <Award className="w-4 h-4" />
                {t('btn_score')}
              </button>
            </div>
          </div>

          {/* HOST SECRET ANSWER */}
          <div className="mt-4">
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

          {/* KEYBOARD SHORTCUTS */}
          <div className="mt-4 rounded-xl bg-[#0f0f12] border border-white/[0.08] px-3 py-3">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] sm:text-[11px] text-white/40">
              <span className="font-semibold text-white/60 uppercase">
                Kontrol Streamer
              </span>

              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-amber-300">H / J</kbd>
                <span className="ml-1.5">Kunci</span>
              </span>

              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-cyan-300">Spasi</kbd>
                <span className="ml-1.5">Next</span>
              </span>

              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-cyan-300">1-4</kbd>
                <span className="ml-1.5">Level</span>
              </span>

              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-amber-300">B</kbd>
                <span className="ml-1.5">Bocoran</span>
              </span>

              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-cyan-300">V / Enter</kbd>
                <span className="ml-1.5">Benar</span>
              </span>

              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-purple-300">A</kbd>
                <span className="ml-1.5">Acak</span>
              </span>

              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-white/60">R</kbd>
                <span className="ml-1.5">Reset</span>
              </span>

              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-cyan-300">Z</kbd>
                <span className="ml-1.5">Zoom</span>
              </span>

              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-yellow-300">X</kbd>
                <span className="ml-1.5">Papan Skor</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
