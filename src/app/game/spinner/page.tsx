import React, { useState, useRef } from 'react';
import { useGame } from '../../../context/GameContext';
import { useLanguage } from '../../../i18n';
import { sound } from '../../../lib/sound';
import {
  Users,
  Play,
  UserPlus,
  Trash2,
  Trophy,
  RotateCw,
  Sparkles,
  Gift,
  CheckCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const PALETTE = [
  '#0284c7', // Sky Blue
  '#7c3aed', // Violet
  '#db2777', // Pink
  '#ea580c', // Orange
  '#16a34a', // Emerald
  '#d97706', // Amber
  '#0d9488', // Teal
  '#e11d48', // Rose
  '#4f46e5', // Indigo
  '#65a30d', // Lime
];

export default function SpinnerGamePage() {
  const { user, viewerList, addViewer, removeViewer, clearViewers, showToast, requireAuth } = useGame();
  const { t } = useLanguage();

  const [newViewerInput, setNewViewerInput] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [winnerName, setWinnerName] = useState<string | null>(null);
  const [winnerHistory, setWinnerHistory] = useState<string[]>([
    'ValkyrieStrike',
    'ShadowBlade',
    'CryptoGhost_7',
  ]);

  const currentAngleRef = useRef(0);
  const viewers = viewerList;
  const segmentCount = viewers.length;
  const segmentAngle = 360 / segmentCount;

  const handleAddViewer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newViewerInput.trim()) return;
    addViewer(newViewerInput);
    setNewViewerInput('');
  };

  const spinWheel = () => {
    requireAuth(() => {
      if (isSpinning) return;
      if (viewers.length < 2) {
        showToast(t('Need More Viewers'), t('Add at least 2 viewer usernames to spin the raffle wheel.'), 'error');
        return;
      }

      setIsSpinning(true);
      setWinnerName(null);

      // Pick random winning viewer
      const winningIndex = Math.floor(Math.random() * viewers.length);
      const selectedWinner = viewers[winningIndex];

      // Align center of winning segment under top needle (270 degrees in SVG coordinates)
      const targetSegmentCenter = winningIndex * segmentAngle + segmentAngle / 2;
      const desiredAngle = (270 - targetSegmentCenter + 360) % 360;

      // 5 to 7 full rotations
      const extraRounds = (5 + Math.floor(Math.random() * 3)) * 360;
      const finalAngle =
        currentAngleRef.current +
        extraRounds +
        ((desiredAngle - (currentAngleRef.current % 360) + 360) % 360);

      currentAngleRef.current = finalAngle;
      setRotationAngle(finalAngle);

      // Mechanical tick sounds
      let tickCount = 0;
      const totalTicks = 32;
      const tickInterval = 4000 / totalTicks;

      const playTicks = () => {
        if (tickCount < totalTicks) {
          const pitch = 850 - tickCount * 14;
          sound.playWheelTick(pitch);
          tickCount++;
          setTimeout(playTicks, tickInterval * (1 + (tickCount / totalTicks) * 1.5));
        }
      };
      playTicks();

      // Settle after 4.2 seconds
      setTimeout(() => {
        setIsSpinning(false);
        setWinnerName(selectedWinner);
        setWinnerHistory((prev) => [selectedWinner, ...prev.slice(0, 7)]);
        sound.playJackpot();
        confetti({
          particleCount: 130,
          spread: 85,
          origin: { y: 0.5 },
        });
        showToast(t('Winner Picked!'), `${t('Congratulations')} @${selectedWinner}! ${t('Selected as Lucky Viewer!')}`, 'jackpot');
      }, 4200);
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <RotateCw className="w-7 h-7 text-cyan-400" />
            <span>{t('Viewer Username Raffle Spinner')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Streamer raffle wheel containing live viewer usernames. Spin to pick a random viewer giveaway winner!
          </p>
        </div>

        {/* Viewers Count Badge */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-2 px-3 self-start md:self-auto text-xs">
          <Users className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-300 font-bold">{viewers.length} Viewers on Wheel</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-center">
        {/* Left: Dynamic Viewer Username Wheel */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Pointer Marker at Top */}
          <div className="relative z-20 -mb-5 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-amber-400 filter drop-shadow-[0_4px_8px_rgba(251,191,36,0.6)]" />
            <div className="w-3 h-3 rounded-full bg-white shadow-md -mt-6 border-2 border-amber-600" />
          </div>

          {/* SVG Viewer Wheel */}
          <div className="relative z-10 w-72 h-72 sm:w-96 sm:h-96">
            <svg
              viewBox="0 0 400 400"
              className="w-full h-full drop-shadow-2xl"
              style={{
                transform: `rotate(${rotationAngle}deg)`,
                transition: isSpinning ? 'transform 4.2s cubic-bezier(0.12, 0.9, 0.2, 1)' : 'none',
              }}
            >
              {/* Outer Metallic Rim */}
              <circle cx="200" cy="200" r="195" fill="#030712" stroke="#0284c7" strokeWidth="6" />
              <circle cx="200" cy="200" r="188" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 4" />

              {/* Segments for each Viewer Username */}
              {viewers.map((viewerName, index) => {
                const startAngle = index * segmentAngle;
                const endAngle = (index + 1) * segmentAngle;
                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;

                const x1 = 200 + 185 * Math.cos(startRad);
                const y1 = 200 + 185 * Math.sin(startRad);
                const x2 = 200 + 185 * Math.cos(endRad);
                const y2 = 200 + 185 * Math.sin(endRad);

                const textAngle = startAngle + segmentAngle / 2;
                const textRad = (textAngle * Math.PI) / 180;
                const tx = 200 + 125 * Math.cos(textRad);
                const ty = 200 + 125 * Math.sin(textRad);

                const color = PALETTE[index % PALETTE.length];

                return (
                  <g key={index}>
                    <path
                      d={`M 200 200 L ${x1} ${y1} A 185 185 0 0 1 ${x2} ${y2} Z`}
                      fill={color}
                      stroke="#030712"
                      strokeWidth="2"
                    />
                    <text
                      x={tx}
                      y={ty}
                      fill="#ffffff"
                      fontSize={viewers.length > 12 ? '10' : viewers.length > 8 ? '11' : '13'}
                      fontWeight="bold"
                      fontFamily="Space Grotesk, sans-serif"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${textAngle + 90}, ${tx}, ${ty})`}
                    >
                      {viewerName.length > 14 ? `${viewerName.slice(0, 12)}…` : viewerName}
                    </text>
                  </g>
                );
              })}

              {/* Center Hub */}
              <circle cx="200" cy="200" r="30" fill="#030712" stroke="#38bdf8" strokeWidth="4" />
              <circle cx="200" cy="200" r="22" fill="#0f172a" />
              <text
                x="200"
                y="204"
                textAnchor="middle"
                fill="#38bdf8"
                fontSize="11"
                fontWeight="900"
                fontFamily="sans-serif"
              >
                WIN
              </text>
            </svg>
          </div>

          {/* Winner Callout Banner */}
          <div className="mt-6 h-10 flex items-center justify-center">
            {winnerName && (
              <div className="px-5 py-2 rounded-full text-xs font-black bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 flex items-center gap-1.5 animate-bounce">
                <Trophy className="w-4 h-4" />
                <span>Selected Winner: @{winnerName}!</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Streamer Viewer Management Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Streamer Username Manager
              </h2>
              <button
                onClick={() => showToast(t('Live Chat'), t('Tambahkan peserta yang benar-benar masuk dari live room.'), 'info')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t('Live Participants Only')}</span>
              </button>
            </div>

            {/* Add Viewer Form */}
            <form onSubmit={handleAddViewer} className="flex gap-2">
              <input
                type="text"
                placeholder="{t('Enter viewer username (e.g. TikTok_User)')}"
                value={newViewerInput}
                onChange={(e) => setNewViewerInput(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Add
              </button>
            </form>

            {/* Spin CTA Button */}
            <button
              onClick={spinWheel}
              disabled={isSpinning || viewers.length < 2}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSpinning ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>{t('Spinning for Winner...')}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Spin Raffle Wheel ({viewers.length} Viewers)</span>
                </>
              )}
            </button>

            {/* Viewers List on Wheel */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{t('Current Viewers on Wheel:')}</span>
                <button
                  onClick={clearViewers}
                  className="text-rose-400 hover:text-rose-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Clear All
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {viewers.map((name, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: PALETTE[idx % PALETTE.length] }}
                      />
                      <span className="font-bold text-white truncate">@{name}</span>
                    </div>
                    <button
                      onClick={() => removeViewer(name)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Winner History */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-300">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>{t('Recent Raffle Winners')}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {winnerHistory.map((w, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] font-semibold"
                >
                  🏆 @{w}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
