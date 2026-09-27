import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sound } from '../services/sound';
import confetti from 'canvas-confetti';
import {
  RotateCw,
  Plus,
  Trash2,
  Users,
  Copy,
  Flame,
  Award,
  DollarSign,
  Settings,
  Check,
  RefreshCw,
  Clock,
  Square,
  Sliders,
  Shuffle,
  Wallet
} from 'lucide-react';
import { PlayerScore, UserProfile } from '../types';
import { useAppConfig } from '../context/AppConfigContext';

interface LuckyWheelProps {
  onAwardPrize: (playerName: string, rupiah: number) => void;
  activePrizeNominal: number;
  onUpdatePrizeNominal: (nominal: number) => void;
  players: PlayerScore[];
  userProfile?: UserProfile | null;
  onUpdateWalletBalance?: (newBalance: number) => void;
  onOpenProfile?: () => void;
}

const PRESET_CHIPS = [
  { label: 'Rp 10K', value: 10000 },
  { label: 'Rp 25K', value: 25000 },
  { label: 'Rp 50K', value: 50000 },
  { label: 'Rp 100K', value: 100000 },
  { label: 'Rp 250K', value: 250000 },
  { label: 'Rp 500K', value: 500000 },
];

// Presets for Spin Duration (up to 10 minutes = 600s)
const SPIN_DURATION_PRESETS = [
  { label: '5 Sec', seconds: 5, group: 'Fast' },
  { label: '8 Sec', seconds: 8, group: 'Fast' },
  { label: '15 Sec', seconds: 15, group: 'Fast' },
  { label: '30 Sec', seconds: 30, group: 'Fast' },
  { label: '1 Min', seconds: 60, group: 'Minutes' },
  { label: '2 Min', seconds: 120, group: 'Minutes' },
  { label: '3 Min', seconds: 180, group: 'Minutes' },
  { label: '5 Min', seconds: 300, group: 'Long' },
  { label: '7 Min', seconds: 420, group: 'Long' },
  { label: '10 Min (Max)', seconds: 600, group: 'Max' },
];

const DEFAULT_SEGMENTS = [
  '@budi_live',
  '@siti_stream',
  '@andi_gaming',
  '@ratna_tiktok',
  '@rizky_santuy',
  '@maya_cantik',
  '@denny_caknan',
  '@dewi_persik'
];

const TANTANGAN_PRESETS = [
  'Push Up 10x on Camera',
  'Sing a Viral TikTok Song',
  'Dance for 15 Seconds',
  'Rhyme for the Host',
  'Imitate an Angry Cat',
  'Share a Spooky Story',
  'Drink a Glass of Water',
  'Send Lion Emote 🦁'
];

const SEGMENT_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
  '#ec4899', '#14b8a6', '#84cc16', '#d946ef'
];

export const LuckyWheel: React.FC<LuckyWheelProps> = ({
  onAwardPrize,
  activePrizeNominal,
  onUpdatePrizeNominal,
  players,
  userProfile,
  onUpdateWalletBalance,
  onOpenProfile
}) => {
  const { formatCurrency, country, t } = useAppConfig();
  // Wheel Items
  const [segments, setSegments] = useState<string[]>(() => {
    const saved = localStorage.getItem('ls_wheel_segments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return DEFAULT_SEGMENTS;
  });

  const [inputName, setInputName] = useState<string>('');
  const [bulkText, setBulkText] = useState<string>('');
  const [showBulkModal, setShowBulkModal] = useState<boolean>(false);
  const [showCustomNominalModal, setShowCustomNominalModal] = useState<boolean>(false);
  const [customNominalInput, setCustomNominalInput] = useState<string>('');

  // Customizable Spin Duration (Maksimal 10 Menit = 600 Detik)
  const [spinDuration, setSpinDuration] = useState<number>(() => {
    const saved = localStorage.getItem('ls_wheel_spin_duration');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (parsed >= 3 && parsed <= 600) return parsed;
    }
    return 8; // Default 8s
  });
  const [showDurationModal, setShowDurationModal] = useState<boolean>(false);
  const [customMinInput, setCustomMinInput] = useState<number>(() => Math.floor(spinDuration / 60));
  const [customSecInput, setCustomSecInput] = useState<number>(() => spinDuration % 60);
  const [spinTimeRemaining, setSpinTimeRemaining] = useState<number>(0);

  // Spinning Physics State
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [pointerTick, setPointerTick] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTickAngleRef = useRef<number>(0);
  const emergencyStopRef = useRef<boolean>(false);

  // Persist segments
  useEffect(() => {
    localStorage.setItem('ls_wheel_segments', JSON.stringify(segments));
  }, [segments]);

  // Persist spin duration
  useEffect(() => {
    localStorage.setItem('ls_wheel_spin_duration', spinDuration.toString());
  }, [spinDuration]);

  // Format seconds to label (e.g. "10 Min", "1m 30s", "8 Sec")
  const formatDurationText = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    if (m > 0 && s > 0) return `${m}m ${s}s`;
    if (m > 0) return `${m} Min`;
    return `${s} Sec`;
  };

  // Format digital countdown (MM:SS)
  const formatDigitalCountdown = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(m)}:${pad(s)}`;
  };

  // Draw the Canvas Wheel
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    ctx.clearRect(0, 0, width, height);

    if (segments.length === 0) {
      // Empty wheel placeholder
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 16px Poppins, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Tambahkan nama penonton', centerX, centerY);
      return;
    }

    const arcSize = (2 * Math.PI) / segments.length;

    // Draw outer golden frame
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 12, 0, 2 * Math.PI);
    ctx.fillStyle = '#111827';
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    // Decorative bulb studs around perimeter
    const bulbCount = Math.max(16, segments.length * 2);
    for (let b = 0; b < bulbCount; b++) {
      const angle = (b * 2 * Math.PI) / bulbCount + (rotationAngle * Math.PI) / 180;
      const bx = centerX + (radius + 6) * Math.cos(angle);
      const by = centerY + (radius + 6) * Math.sin(angle);

      ctx.beginPath();
      ctx.arc(bx, by, 3.5, 0, 2 * Math.PI);
      ctx.fillStyle = b % 2 === 0 ? '#fef08a' : '#f59e0b';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Draw Wheel Segments
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotationAngle * Math.PI) / 180);

    segments.forEach((item, index) => {
      const startAngle = index * arcSize;
      const endAngle = startAngle + arcSize;
      const color = SEGMENT_COLORS[index % SEGMENT_COLORS.length];

      // Slice
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff33';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text inside segment
      ctx.save();
      ctx.rotate(startAngle + arcSize / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;

      const fontSize = segments.length > 20 ? 11 : segments.length > 12 ? 13 : 15;
      ctx.font = `bold ${fontSize}px Poppins, sans-serif`;

      // Truncate long names cleanly
      const maxLen = segments.length > 16 ? 12 : 18;
      const label = item.length > maxLen ? item.slice(0, maxLen) + '…' : item;
      ctx.fillText(label, radius - 24, 0);
      ctx.restore();
    });

    ctx.restore();

    // Center Golden Hub / Cap
    ctx.beginPath();
    ctx.arc(centerX, centerY, 32, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e1b4b';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'black 13px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('LIVE', centerX, centerY);
  }, [segments, rotationAngle]);

  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Spin the Wheel with smooth physics deceleration up to 10 minutes
  const spinWheel = useCallback(() => {
    if (isSpinning || segments.length === 0) return;

    setIsSpinning(true);
    setWinner(null);
    setShowWinnerModal(false);
    emergencyStopRef.current = false;

    const totalDurationSeconds = spinDuration;
    const startRotation = rotationAngle;
    const startTime = performance.now();

    // Dynamic rotation scaling based on duration:
    // Short (5-15s): 8 to 15 full spins
    // Medium (30-60s): 35 to 70 full spins
    // Long (300-600s / 5-10 min): 300 to 650 full spins
    const rotSpeedFactor = totalDurationSeconds <= 10
      ? 1.8
      : totalDurationSeconds <= 60
      ? 1.25
      : 1.05;
    const extraSpins = Math.max(8, Math.floor(totalDurationSeconds * rotSpeedFactor)) + Math.floor(Math.random() * 5);
    
    // Truly cryptographically random angle (0 - 360 deg) for unrepeatable, unique user results
    let randomTargetAngle = Math.random() * 360;
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const u32 = new Uint32Array(1);
      window.crypto.getRandomValues(u32);
      randomTargetAngle = (u32[0] / (0xffffffff + 1)) * 360;
    }

    const totalTargetRotation = startRotation + extraSpins * 360 + randomTargetAngle;
    const totalDistance = totalTargetRotation - startRotation;

    // Deceleration window
    const decelSeconds = totalDurationSeconds <= 15
      ? totalDurationSeconds
      : Math.min(25, Math.max(12, totalDurationSeconds * 0.2));
    const cruiseSeconds = totalDurationSeconds - decelSeconds;

    // Steady speed during cruise phase
    const effectiveTime = cruiseSeconds + decelSeconds / 3;
    const v0 = totalDistance / effectiveTime;

    let lastTickTime = 0;
    const arcSize = 360 / segments.length;

    // Emergency early stop state tracking
    let isEarlyStopping = false;
    let earlyStopStartTime = 0;
    let earlyStopStartAngle = 0;
    let earlyStopDistance = 0;
    const EARLY_STOP_DURATION = 3.0; // 3 seconds smooth decelerate when host hits stop

    const animate = (now: number) => {
      const elapsedMs = now - startTime;
      const elapsedSecs = elapsedMs / 1000;

      // Check if emergency stop was requested
      if (emergencyStopRef.current && !isEarlyStopping) {
        isEarlyStopping = true;
        earlyStopStartTime = now;
        earlyStopStartAngle = rotationAngle;
        // Glide for 1.5 - 2 extra rotations to a clean stop
        earlyStopDistance = Math.max(360, (v0 * 0.5) * EARLY_STOP_DURATION);
      }

      let currentAngle: number;
      let isComplete = false;

      if (isEarlyStopping) {
        const earlyElapsed = (now - earlyStopStartTime) / 1000;
        const progress = Math.min(1, earlyElapsed / EARLY_STOP_DURATION);
        const eased = 1 - Math.pow(1 - progress, 3);
        currentAngle = earlyStopStartAngle + earlyStopDistance * eased;
        setSpinTimeRemaining(Math.max(0, Math.ceil(EARLY_STOP_DURATION - earlyElapsed)));
        if (progress >= 1) isComplete = true;
      } else if (totalDurationSeconds <= 15) {
        // Snappy cubic ease-out for short spins
        const progress = Math.min(1, elapsedSecs / totalDurationSeconds);
        const eased = 1 - Math.pow(1 - progress, 3);
        currentAngle = startRotation + totalDistance * eased;
        setSpinTimeRemaining(Math.max(0, Math.ceil(totalDurationSeconds - elapsedSecs)));
        if (progress >= 1) isComplete = true;
      } else {
        // Multi-phase long spin (cruise + suspenseful deceleration)
        setSpinTimeRemaining(Math.max(0, Math.ceil(totalDurationSeconds - elapsedSecs)));
        if (elapsedSecs <= cruiseSeconds) {
          currentAngle = startRotation + v0 * elapsedSecs;
        } else {
          const decelProgress = Math.min(1, (elapsedSecs - cruiseSeconds) / decelSeconds);
          const decelFactor = decelProgress - Math.pow(decelProgress, 2) + Math.pow(decelProgress, 3) / 3;
          const cruiseDistance = v0 * cruiseSeconds;
          const decelDistance = v0 * decelSeconds * decelFactor;
          currentAngle = startRotation + cruiseDistance + decelDistance;
        }
        if (elapsedSecs >= totalDurationSeconds) isComplete = true;
      }

      setRotationAngle(currentAngle);

      // Audio & Visual ratchet tick throttled safely (min 35ms between ticks)
      if (Math.abs(currentAngle - lastTickAngleRef.current) >= arcSize) {
        if (now - lastTickTime > 35) {
          sound.playRatchetTick(1 + Math.random() * 0.15);
          lastTickTime = now;
        }
        setPointerTick(true);
        setTimeout(() => setPointerTick(false), 40);
        lastTickAngleRef.current = currentAngle;
      }

      if (!isComplete) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Spin finished! Calculate winning slice
        setIsSpinning(false);
        setSpinTimeRemaining(0);

        const normalizedAngle = (360 - (currentAngle % 360)) % 360;
        // Pointer is at the top (270 degrees in standard polar coords)
        const adjustedPointerAngle = (normalizedAngle + 270) % 360;
        const winningIndex = Math.floor(adjustedPointerAngle / arcSize) % segments.length;
        const winningItem = segments[winningIndex] || segments[0];

        setWinner(winningItem);
        setShowWinnerModal(true);
        sound.playVictoryFanfare();

        try {
          confetti({
            particleCount: 160,
            spread: 90,
            origin: { y: 0.5 },
            colors: ['#ffd700', '#00ffcc', '#ff007f', '#ffffff']
          });
        } catch {}
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }, [isSpinning, segments, rotationAngle, spinDuration]);

  // Emergency early stop by host
  const handleStopSpinEarly = () => {
    if (isSpinning) {
      emergencyStopRef.current = true;
    }
  };

  // Spacebar shortcut to spin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea') return;

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (isSpinning) {
          handleStopSpinEarly();
        } else {
          spinWheel();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpinning, spinWheel]);

  // Add single segment
  const handleAddSegment = () => {
    const trimmed = inputName.trim();
    if (!trimmed) return;
    setSegments((prev) => [...prev, trimmed]);
    setInputName('');
  };

  // Delete segment
  const handleDeleteSegment = (idx: number) => {
    setSegments((prev) => prev.filter((_, i) => i !== idx));
  };

  // Bulk Import
  const handleBulkImport = () => {
    const lines = bulkText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (lines.length > 0) {
      setSegments((prev) => [...prev, ...lines]);
      setBulkText('');
      setShowBulkModal(false);
    }
  };

  // Sync from Leaderboard
  const handleSyncFromLeaderboard = () => {
    if (players.length === 0) {
      alert('Papan skor masih kosong! Tambahkan pemain di papan skor terlebih dahulu.');
      return;
    }
    const playerNames = players.map((p) => p.name);
    setSegments(playerNames);
  };

  // Load Presets
  const handleLoadTantangan = () => {
    setSegments(TANTANGAN_PRESETS);
  };

  // Shuffle Segments randomly (Anti-Sama)
  const handleShuffleSegments = () => {
    setSegments((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    });
    sound.playShuffleSound();
  };

  const handleClearWheel = () => {
    setSegments(['Kursi Kosong 1', 'Kursi Kosong 2', 'Kursi Kosong 3', 'Kursi Kosong 4']);
  };

  // Apply custom nominal
  const handleApplyCustomNominal = () => {
    const num = parseInt(customNominalInput.replace(/\D/g, ''), 10);
    if (num && num > 0) {
      onUpdatePrizeNominal(num);
      setShowCustomNominalModal(false);
      setCustomNominalInput('');
    }
  };

  // Apply custom duration (Maksimal 10 Menit = 600 Detik)
  const handleApplyCustomDuration = () => {
    const m = Math.min(10, Math.max(0, Number(customMinInput) || 0));
    const s = Math.min(59, Math.max(0, Number(customSecInput) || 0));
    let total = m * 60 + s;
    if (total > 600) total = 600; // Maksimal 10 menit
    if (total < 3) total = 3; // Minimal 3 detik
    setSpinDuration(total);
    setShowDurationModal(false);
  };

  // Eliminate winner from list
  const handleEliminateWinner = () => {
    if (!winner) return;
    setSegments((prev) => prev.filter((s) => s !== winner));
    setShowWinnerModal(false);
    setWinner(null);
  };

  // Award prize directly to leaderboard
  const handleAwardWinner = () => {
    if (!winner) return;
    onAwardPrize(winner, activePrizeNominal);
    setShowWinnerModal(false);
  };

  return (
    <div className="flex flex-col items-center justify-start w-full max-w-5xl mx-auto px-2 sm:px-4 py-2 select-none">
      {/* Quick Header with Active Prize Button & Duration Config */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-4 bg-black/60 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 shadow-xl">
        {/* Left: Active Prize Nominal */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCustomNominalModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-yellow-500/20 transition-all hover:scale-105 active:scale-95"
            title="Click to change the standard prize nominal"
          >
            <DollarSign className="w-4 h-4 stroke-[3]" />
            <span>💰 {t('prize_label')}: {formatCurrency(activePrizeNominal)}</span>
          </button>

          {/* Quick Chip Presets */}
          <div className="hidden sm:flex items-center gap-1">
            {PRESET_CHIPS.slice(0, 3).map((chip) => (
              <button
                key={chip.value}
                onClick={() => onUpdatePrizeNominal(chip.value)}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
                  activePrizeNominal === chip.value
                    ? 'bg-yellow-400 text-black font-extrabold border border-yellow-200'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {formatCurrency(chip.value)}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Unified Wallet & SPIN DURATION CONFIGURATOR */}
        <div className="flex items-center gap-2">
          {userProfile && (
            <div
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold shadow-md cursor-pointer hover:bg-emerald-900/80 transition-all"
              title="Dompet Terpadu Streamer • Klik untuk Buka Profil & Deposit"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] text-white/70">Dompet:</span>
              <span className="text-emerald-300 font-black">
                Rp {(userProfile.walletBalance ?? 15000).toLocaleString('id-ID')}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold shadow-md">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{formatDurationText(spinDuration)}</span>
          </div>

          <button
            onClick={() => setShowDurationModal(true)}
            disabled={isSpinning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition-all hover:scale-105 active:scale-95 border border-cyan-300"
            title="Configure Spinner Rotation Duration"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{t('set_duration')}</span>
          </button>
        </div>
      </div>

      {/* Main Wheel Arena */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center Canvas Lucky Wheel (Col 7) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative bg-neutral-950/70 p-4 sm:p-6 rounded-3xl border border-white/15 shadow-2xl">
          {/* Live Spinning Countdown & Emergency Stop Overlay */}
          {isSpinning && (
            <div className="w-full mb-3 px-4 py-2.5 bg-cyan-950/90 border-2 border-cyan-400 rounded-2xl flex items-center justify-between shadow-[0_0_25px_rgba(6,182,212,0.4)] animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-mono font-black text-cyan-300 text-sm tracking-wider">
                  {t('spinning_label')}: {formatDigitalCountdown(spinTimeRemaining)}
                </span>
              </div>

              <button
                onClick={handleStopSpinEarly}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg shadow-red-600/40 active:scale-95 border border-red-300 transition-all"
                title="Hentikan putaran lebih awal"
              >
                <Square className="w-3 h-3 fill-white" />
                <span>{t('btn_stop')}</span>
              </button>
            </div>
          )}

          {/* Top Ratchet Pointer */}
          <div className="relative flex flex-col items-center z-20 -mb-5">
            <div
              className={`w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[34px] border-t-yellow-400 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] transition-transform duration-75 origin-top ${
                pointerTick ? 'rotate-12 scale-110' : 'rotate-0'
              }`}
            />
          </div>

          {/* HTML5 Canvas Wheel */}
          <div className="relative w-[320px] h-[320px] sm:w-[380px] sm:h-[380px]">
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              className="w-full h-full rounded-full drop-shadow-[0_0_35px_rgba(245,158,11,0.25)]"
            />
          </div>

          {/* Spin Big Action Controls */}
          <div className="mt-6 flex flex-col items-center gap-2 w-full max-w-xs">
            {isSpinning ? (
              <button
                onClick={handleStopSpinEarly}
                className="flex items-center justify-center gap-3 w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-base tracking-wider uppercase shadow-xl shadow-red-600/30 transition-all hover:scale-105 active:scale-95 border-2 border-red-300 animate-pulse"
              >
                <Square className="w-5 h-5 fill-white" />
                <span>{t('btn_stop')} ({formatDigitalCountdown(spinTimeRemaining)})</span>
              </button>
            ) : (
              <button
                onClick={spinWheel}
                disabled={segments.length === 0}
                className="flex items-center justify-center gap-3 w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 disabled:opacity-50 text-black font-black text-lg tracking-wider uppercase shadow-xl shadow-yellow-500/30 transition-all hover:scale-105 active:scale-95 border-2 border-yellow-200"
              >
                <RotateCw className="w-5 h-5 stroke-[2.5]" />
                <span>{t('btn_spin')} ({formatDurationText(spinDuration)})</span>
              </button>
            )}

            <span className="text-[11px] text-white/50 text-center">
              Tekan <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded text-yellow-300 font-mono">Spasi</kbd>
            </span>
          </div>
        </div>

        {/* Right Controls & Segments List (Col 5) */}
        <div className="lg:col-span-5 flex flex-col gap-4 bg-neutral-950/70 p-4 sm:p-5 rounded-3xl border border-white/15 shadow-2xl">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              {t('participants_list')} ({segments.length})
            </span>
            <div className="flex items-center gap-1.5">
              {/* Ambil dari Papan Skor */}
              <button
                onClick={handleSyncFromLeaderboard}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center gap-1"
                title="Ambil dari skor"
              >
                <Award className="w-3.5 h-3.5" />
                {t('from_score')}
              </button>
              {/* Paste Banyak Sekaligus */}
              <button
                onClick={() => setShowBulkModal(true)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white/10 hover:bg-white/20 text-white/90 border border-white/20 flex items-center gap-1"
                title="Salin banyak komentar live TikTok sekaligus"
              >
                <Copy className="w-3.5 h-3.5" />
                {t('paste_bulk')}
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/60 font-medium">Preset:</span>
            <button
              onClick={handleLoadTantangan}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 flex items-center gap-1"
            >
              <Flame className="w-3 h-3" /> {t('preset_challenge')}
            </button>
            <button
              onClick={handleShuffleSegments}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 flex items-center gap-1"
              title="Anti-Sama"
            >
              <Shuffle className="w-3 h-3" /> {t('shuffle_wheel')}
            </button>
            <button
              onClick={handleClearWheel}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white/70"
            >
              {t('preset_empty')}
            </button>
          </div>

          {/* Quick Add Form Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={t('input_participant_placeholder')}
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddSegment();
              }}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-neutral-900 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={handleAddSegment}
              className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4" />
              {t('add_participant')}
            </button>
          </div>

          {/* Segments Scrollable List */}
          <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto pr-1">
            {segments.map((seg, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-900/80 border border-white/10 hover:border-white/25 transition-all text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: SEGMENT_COLORS[idx % SEGMENT_COLORS.length] }}
                  />
                  <span className="font-semibold text-white/90 truncate">{seg}</span>
                </div>
                <button
                  onClick={() => handleDeleteSegment(idx)}
                  className="p-1 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded transition-all"
                  title="Remove participant"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* POPUP PENGATURAN DURASI PUTARAN SPINNER (MAKSIMAL 10 MENIT) */}
      {showDurationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-neutral-900 border-2 border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.25)] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-extrabold text-cyan-300 flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                <span>Configure Spinner Spin Duration</span>
              </h3>
              <span className="text-[11px] font-mono text-yellow-400 font-bold bg-yellow-950/60 border border-yellow-500/40 px-2.5 py-0.5 rounded-lg">
                Max 10 Min
              </span>
            </div>

            <p className="text-xs text-white/70">
              Select a quick preset or customize a dramatic spin duration for TikTok Live / OBS broadcasts (up to 10 minutes):
            </p>

            {/* Presets Grid */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-white/60 uppercase">Quick Select:</span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {SPIN_DURATION_PRESETS.map((p) => {
                  const isSelected = spinDuration === p.seconds;
                  return (
                    <button
                      key={p.label}
                      onClick={() => {
                        setSpinDuration(p.seconds);
                        setShowDurationModal(false);
                      }}
                      className={`px-2 py-2 rounded-xl text-xs font-bold transition-all border ${
                        isSelected
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-300 shadow-md shadow-cyan-500/40 scale-105 font-black'
                          : 'bg-black/60 hover:bg-white/10 text-white/80 border-white/10'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Minutes and Seconds Input */}
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <span className="text-[11px] font-bold text-white/60 uppercase">
                Custom Minutes & Seconds:
              </span>
              <div className="flex items-center justify-center gap-3 bg-black/80 p-3 rounded-2xl border border-white/15">
                <div className="flex flex-col items-center">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={customMinInput}
                    onChange={(e) => setCustomMinInput(Math.max(0, Math.min(10, parseInt(e.target.value) || 0)))}
                    className="w-20 px-2 py-2 text-center bg-neutral-900 border border-cyan-500/60 rounded-xl text-lg font-mono font-black text-cyan-300 focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-[10px] text-white/60 font-bold mt-1">MINUTES (0-10)</span>
                </div>

                <span className="text-2xl font-bold text-cyan-400 pb-4">:</span>

                <div className="flex flex-col items-center">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={customSecInput}
                    onChange={(e) => setCustomSecInput(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    className="w-20 px-2 py-2 text-center bg-neutral-900 border border-cyan-500/60 rounded-xl text-lg font-mono font-black text-cyan-300 focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-[10px] text-white/60 font-bold mt-1">SECONDS (0-59)</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDurationModal(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white/80"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCustomDuration}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold text-xs shadow-lg shadow-green-600/30 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Duration</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WINNER MODAL */}
      {showWinnerModal && winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm p-6 rounded-3xl bg-gradient-to-b from-neutral-900 to-black border-2 border-yellow-400 shadow-[0_0_50px_rgba(245,158,11,0.5)] flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-yellow-400/20 border-2 border-yellow-400 flex items-center justify-center animate-bounce">
              <Award className="w-8 h-8 text-yellow-400" />
            </div>

            <div>
              <span className="text-xs font-extrabold tracking-widest text-yellow-400 uppercase">
                {t('winner_modal_title')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 break-words">
                {winner}
              </h2>
            </div>

            <div className="w-full py-2.5 px-4 rounded-xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 font-bold text-sm">
              {t('prize_label')}: {formatCurrency(activePrizeNominal)}
            </div>

            <div className="flex flex-col gap-2 w-full mt-2">
              <button
                onClick={handleAwardWinner}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-extrabold text-sm shadow-lg shadow-yellow-500/30 flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4" />
                <span>{t('give_prize')}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleEliminateWinner}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15"
                >
                  {t('eliminate_winner')}
                </button>
                <button
                  onClick={() => {
                    setShowWinnerModal(false);
                    spinWheel();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 font-bold text-xs border border-yellow-500/30 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{t('btn_spin')}</span>
                </button>
              </div>

              <button
                onClick={() => setShowWinnerModal(false)}
                className="mt-1 text-xs text-white/50 hover:text-white underline"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK PASTE MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md p-6 rounded-2xl bg-neutral-900 border border-white/20 shadow-2xl flex flex-col gap-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Copy className="w-4 h-4 text-cyan-400" />
              Paste Multiple Names at Once (TikTok Live)
            </h3>
            <p className="text-xs text-white/60">
              Copy live TikTok comments and paste below (1 line per participant).
            </p>
            <textarea
              rows={8}
              placeholder={`@john_live\n@mary_stream\n@alex_gaming\n@sarah_beauty\n...`}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              className="w-full p-3 text-xs font-mono rounded-xl bg-neutral-950 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white/80"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkImport}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Import into Wheel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM NOMINAL HADIAH MODAL */}
      {showCustomNominalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm p-6 rounded-2xl bg-neutral-900 border border-yellow-500/40 shadow-2xl flex flex-col gap-3">
            <h3 className="text-base font-bold text-yellow-300 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              ⚙️ Custom Prize Amount
            </h3>
            <p className="text-xs text-white/60">
              Enter any prize amount in {country.name} ({country.currencySymbol}).
            </p>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-sm font-bold text-white/50">{country.currencySymbol}</span>
              <input
                type="number"
                placeholder="50000"
                value={customNominalInput}
                onChange={(e) => setCustomNominalInput(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-sm font-mono font-bold rounded-xl bg-neutral-950 border border-yellow-500/50 text-yellow-300 focus:outline-none focus:border-yellow-400"
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setShowCustomNominalModal(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white/80"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCustomNominal}
                className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Apply Prize
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
