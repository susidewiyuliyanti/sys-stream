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
  'Send Lion Emote �Y��'
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
      const label = item.length > maxLen ? item.slice(0, maxLen) + '�?�' : item;
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
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-3 select-none">
      <div className="rounded-2xl bg-[#0f0f12] border border-white/[0.08] overflow-hidden">

        {/* HEADER */}
        <div className="px-4 sm:px-5 py-3 border-b border-white/[0.08]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/[0.08] text-white/75 text-xs font-semibold">
                RODA KEBERUNTUNGAN
              </span>

              <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
                {segments.length} Peserta
              </span>

              {isSpinning && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  LIVE SPIN
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowCustomNominalModal(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/15 transition-colors text-xs font-semibold"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>{t('prize_label')}: {formatCurrency(activePrizeNominal)}</span>
              </button>

              {userProfile && (
                <button
                  onClick={onOpenProfile}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/15 transition-colors text-xs font-semibold"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  Rp {(userProfile.walletBalance ?? 15000).toLocaleString('id-ID')}
                </button>
              )}

              <button
                onClick={() => setShowDurationModal(true)}
                disabled={isSpinning}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 transition-colors text-xs font-semibold"
              >
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                {formatDurationText(spinDuration)}
                <Sliders className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="p-3 sm:p-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

            {/* WHEEL */}
            <div className="lg:col-span-7 rounded-xl bg-[#09090b] border border-white/[0.07] overflow-hidden">

              <div className="px-4 py-3 border-b border-white/[0.07] flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-white/35 font-semibold">
                    Lucky Wheel
                  </p>
                  <p className="text-xs text-white/50 mt-0.5">
                    Putar roda untuk menentukan pemenang
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {PRESET_CHIPS.slice(0, 3).map((chip) => (
                    <button
                      key={chip.value}
                      onClick={() => onUpdatePrizeNominal(chip.value)}
                      className={`hidden sm:block px-2 py-1 rounded-md text-[10px] font-semibold border transition-colors ${
                        activePrizeNominal === chip.value
                          ? 'bg-amber-400 text-black border-amber-300'
                          : 'bg-white/[0.03] text-white/45 border-white/[0.07] hover:text-white hover:bg-white/[0.07]'
                      }`}
                    >
                      {formatCurrency(chip.value)}
                    </button>
                  ))}
                </div>
              </div>

              {isSpinning && (
                <div className="mx-3 mt-3 px-3 py-2.5 rounded-lg bg-cyan-500/[0.07] border border-cyan-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-xs font-mono font-semibold text-cyan-300">
                      {t('spinning_label')} {formatDigitalCountdown(spinTimeRemaining)}
                    </span>
                  </div>

                  <button
                    onClick={handleStopSpinEarly}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 text-xs font-semibold"
                  >
                    <Square className="w-3 h-3 fill-current" />
                    {t('btn_stop')}
                  </button>
                </div>
              )}

              {/* WHEEL STAGE */}
              <div className="relative flex flex-col items-center justify-center py-5 sm:py-7 px-2">

                <div className="relative z-20 -mb-4">
                  <div
                    className={`w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[30px] border-t-amber-400 transition-transform duration-75 origin-top ${
                      pointerTick ? 'rotate-12 scale-110' : ''
                    }`}
                  />
                </div>

                <div className="relative w-[290px] h-[290px] sm:w-[370px] sm:h-[370px]">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={400}
                    className="w-full h-full rounded-full"
                  />

                  <div className="absolute inset-0 rounded-full pointer-events-none border border-white/[0.08]" />
                </div>

                <div className="mt-5 w-full max-w-sm">
                  {isSpinning ? (
                    <button
                      onClick={handleStopSpinEarly}
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/15 text-red-300 font-bold text-sm transition-colors"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      {t('btn_stop')} · {formatDigitalCountdown(spinTimeRemaining)}
                    </button>
                  ) : (
                    <button
                      onClick={spinWheel}
                      disabled={segments.length === 0}
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-30 text-black font-black text-sm transition-colors"
                    >
                      <RotateCw className="w-5 h-5" />
                      {t('btn_spin')}
                      <span className="font-mono text-black/60">
                        · {formatDurationText(spinDuration)}
                      </span>
                    </button>
                  )}

                  <div className="mt-2 text-center text-[10px] text-white/30">
                    Tekan <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-white/60 font-mono">Spasi</kbd> untuk spin / stop
                  </div>
                </div>
              </div>
            </div>

            {/* PARTICIPANTS */}
            <div className="lg:col-span-5 rounded-xl bg-[#111114] border border-white/[0.07] overflow-hidden">

              <div className="px-4 py-3 border-b border-white/[0.07]">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-white/35 font-semibold">
                      {t('participants_list')}
                    </p>
                    <p className="text-xs text-white/50 mt-0.5">
                      {segments.length} peserta aktif
                    </p>
                  </div>

                  <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Users className="w-4 h-4 text-cyan-400" />
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4 space-y-3">

                {/* ADD */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t('input_participant_placeholder')}
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddSegment();
                    }}
                    className="flex-1 min-w-0 px-3 py-2.5 rounded-lg bg-black/20 border border-white/[0.08] text-white text-xs placeholder-white/25 focus:outline-none focus:border-cyan-500/40"
                  />

                  <button
                    onClick={handleAddSegment}
                    className="px-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/15 text-xs font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* TOOLS */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleSyncFromLeaderboard}
                    className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-white/[0.04] border border-white/[0.07] text-white/60 hover:text-white hover:bg-white/[0.07] text-[11px] font-semibold transition-colors"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    {t('from_score')}
                  </button>

                  <button
                    onClick={() => setShowBulkModal(true)}
                    className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-white/[0.04] border border-white/[0.07] text-white/60 hover:text-white hover:bg-white/[0.07] text-[11px] font-semibold transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-cyan-400" />
                    {t('paste_bulk')}
                  </button>
                </div>

                {/* PRESETS */}
                <div className="rounded-lg bg-black/15 border border-white/[0.06] p-2.5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase tracking-wider text-white/30 font-semibold">
                      Preset
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={handleLoadTantangan}
                      className="flex items-center justify-center gap-1 px-2 py-2 rounded-md bg-white/[0.04] hover:bg-orange-500/10 border border-white/[0.06] text-white/55 hover:text-orange-300 text-[10px] font-semibold"
                    >
                      <Flame className="w-3 h-3" />
                      {t('preset_challenge')}
                    </button>

                    <button
                      onClick={handleShuffleSegments}
                      className="flex items-center justify-center gap-1 px-2 py-2 rounded-md bg-white/[0.04] hover:bg-purple-500/10 border border-white/[0.06] text-white/55 hover:text-purple-300 text-[10px] font-semibold"
                    >
                      <Shuffle className="w-3 h-3" />
                      Shuffle
                    </button>

                    <button
                      onClick={handleClearWheel}
                      className="px-2 py-2 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/45 hover:text-white text-[10px] font-semibold"
                    >
                      {t('preset_empty')}
                    </button>
                  </div>
                </div>

                {/* LIST */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-white/30 font-semibold">
                    Daftar Kursi / Peserta
                  </span>

                  <span className="text-[10px] font-mono text-white/30">
                    {segments.length}/100
                  </span>
                </div>

                <div className="max-h-[310px] overflow-y-auto pr-1 space-y-1.5">
                  {segments.map((seg, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-black/15 border border-white/[0.06] hover:border-white/[0.12] transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{
                            backgroundColor:
                              SEGMENT_COLORS[idx % SEGMENT_COLORS.length]
                          }}
                        />

                        <span className="text-xs text-white/75 truncate">
                          {seg}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteSegment(idx)}
                        className="p-1 rounded-md text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Remove participant"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER INFO */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] text-white/30">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.07] text-white/50">Space</kbd>
              <span className="ml-1">Spin / Stop</span>
            </span>

            <span>
              <span className="text-amber-400">●</span>
              <span className="ml-1">Hadiah {formatCurrency(activePrizeNominal)}</span>
            </span>

            <span>
              <Clock className="inline w-3 h-3 mr-1 text-cyan-400" />
              Maks. 10 menit
            </span>

            <span>Maks. 100 kursi</span>
          </div>
        </div>
      </div>

      {/* DURATION MODAL */}
      {showDurationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#111114] border border-white/[0.1] overflow-hidden shadow-2xl">

            <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Durasi Putaran
                </h3>
                <p className="text-[11px] text-white/40 mt-1">
                  Maksimal 10 menit
                </p>
              </div>

              <span className="px-2 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] font-semibold">
                MAX 10:00
              </span>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/35 font-semibold mb-2">
                  Pilihan Cepat
                </p>

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
                        className={`px-2 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                          isSelected
                            ? 'bg-cyan-500 text-black border-cyan-400'
                            : 'bg-white/[0.03] text-white/60 border-white/[0.07] hover:bg-white/[0.07] hover:text-white'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.07]">
                <p className="text-[10px] uppercase tracking-wider text-white/35 font-semibold mb-2">
                  Custom
                </p>

                <div className="flex items-center justify-center gap-3">
                  <div className="text-center">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={customMinInput}
                      onChange={(e) =>
                        setCustomMinInput(
                          Math.max(
                            0,
                            Math.min(10, parseInt(e.target.value) || 0)
                          )
                        )
                      }
                      className="w-20 px-2 py-2.5 text-center rounded-lg bg-black/20 border border-white/[0.08] text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-500/40"
                    />
                    <p className="text-[9px] text-white/30 mt-1">MENIT</p>
                  </div>

                  <span className="text-xl font-bold text-white/30 pb-4">:</span>

                  <div className="text-center">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={customSecInput}
                      onChange={(e) =>
                        setCustomSecInput(
                          Math.max(
                            0,
                            Math.min(59, parseInt(e.target.value) || 0)
                          )
                        )
                      }
                      className="w-20 px-2 py-2.5 text-center rounded-lg bg-black/20 border border-white/[0.08] text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-500/40"
                    />
                    <p className="text-[9px] text-white/30 mt-1">DETIK</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-white/[0.08] flex justify-end gap-2">
              <button
                onClick={() => setShowDurationModal(false)}
                className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-white/60 text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={handleApplyCustomDuration}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WINNER MODAL */}
      {showWinnerModal && winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-[#111114] border border-amber-400/30 overflow-hidden shadow-2xl">

            <div className="px-5 pt-6 pb-4 text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center">
                <Award className="w-7 h-7 text-amber-400" />
              </div>

              <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-amber-400 font-bold">
                {t('winner_modal_title')}
              </p>

              <h2 className="mt-1 text-2xl font-black text-white break-words">
                {winner}
              </h2>

              <div className="mt-4 px-4 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm font-bold">
                {t('prize_label')}: {formatCurrency(activePrizeNominal)}
              </div>
            </div>

            <div className="px-5 pb-5 space-y-2">
              <button
                onClick={handleAwardWinner}
                className="w-full py-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Award className="w-4 h-4" />
                {t('give_prize')}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleEliminateWinner}
                  className="py-2.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.07] text-white/70 text-xs font-semibold"
                >
                  {t('eliminate_winner')}
                </button>

                <button
                  onClick={() => {
                    setShowWinnerModal(false);
                    spinWheel();
                  }}
                  className="py-2.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/20 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t('btn_spin')}
                </button>
              </div>

              <button
                onClick={() => setShowWinnerModal(false)}
                className="w-full py-2 text-xs text-white/35 hover:text-white/70"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK IMPORT MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#111114] border border-white/[0.1] overflow-hidden shadow-2xl">

            <div className="px-5 py-4 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Copy className="w-4 h-4 text-cyan-400" />
                {t('paste_bulk')}
              </h3>

              <p className="text-[11px] text-white/40 mt-1">
                Satu peserta per baris.
              </p>
            </div>

            <div className="p-5">
              <textarea
                rows={8}
                placeholder={`@john_live
@mary_stream
@alex_gaming
@sarah_beauty`}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="w-full p-3 rounded-lg bg-black/20 border border-white/[0.08] text-white placeholder-white/20 text-xs font-mono focus:outline-none focus:border-cyan-500/40 resize-none"
              />
            </div>

            <div className="px-5 py-3 border-t border-white/[0.08] flex justify-end gap-2">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 rounded-lg bg-white/[0.05] text-white/60 hover:bg-white/[0.08] text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={handleBulkImport}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM PRIZE MODAL */}
      {showCustomNominalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-[#111114] border border-white/[0.1] overflow-hidden shadow-2xl">

            <div className="px-5 py-4 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                Custom Prize Amount
              </h3>

              <p className="text-[11px] text-white/40 mt-1">
                Masukkan nominal hadiah.
              </p>
            </div>

            <div className="p-5">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/35 font-semibold">
                  {country.currencySymbol}
                </span>

                <input
                  type="number"
                  placeholder="50000"
                  value={customNominalInput}
                  onChange={(e) => setCustomNominalInput(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 rounded-lg bg-black/20 border border-white/[0.08] text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500/40"
                />
              </div>
            </div>

            <div className="px-5 py-3 border-t border-white/[0.08] flex justify-end gap-2">
              <button
                onClick={() => setShowCustomNominalModal(false)}
                className="px-4 py-2 rounded-lg bg-white/[0.05] text-white/60 hover:bg-white/[0.08] text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={handleApplyCustomNominal}
                className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
