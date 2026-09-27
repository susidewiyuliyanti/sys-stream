import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Clock, Settings2, Plus, Minus, Check } from 'lucide-react';

interface DigitalTimerProps {
  timeLeft: number;
  timerDuration: number;
  isTimerRunning: boolean;
  onTogglePlayPause: () => void;
  onReset: () => void;
  onSetDuration: (seconds: number) => void;
  onAdjustTime: (deltaSeconds: number) => void;
}

// Preset timers (seconds)
const PRESET_TIMERS = [
  { label: '15 Detik', seconds: 15, group: 'Kilat' },
  { label: '60 Detik', seconds: 60, group: 'Kilat' },
  { label: '5 Menit', seconds: 5 * 60, group: 'Menit' },
  { label: '15 Menit', seconds: 15 * 60, group: 'Menit' },
  { label: '30 Menit', seconds: 30 * 60, group: 'Menit' },
  { label: '1 Jam', seconds: 1 * 3600, group: 'Jam (Populer)' },
  { label: '2 Jam', seconds: 2 * 3600, group: 'Jam' },
  { label: '6 Jam', seconds: 6 * 3600, group: 'Jam' },
  { label: '12 Jam', seconds: 12 * 3600, group: 'Jam' },
  { label: '24 Jam (1 Hari)', seconds: 24 * 3600, group: 'Maksimal' },
];

export const DigitalTimer: React.FC<DigitalTimerProps> = ({
  timeLeft,
  timerDuration,
  isTimerRunning,
  onTogglePlayPause,
  onReset,
  onSetDuration,
  onAdjustTime,
}) => {
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Custom input states (Hours, Minutes, Seconds)
  const initialHours = Math.floor(timerDuration / 3600);
  const initialMins = Math.floor((timerDuration % 3600) / 60);
  const initialSecs = timerDuration % 60;

  const [inputHours, setInputHours] = useState<number>(initialHours);
  const [inputMinutes, setInputMinutes] = useState<number>(initialMins);
  const [inputSeconds, setInputSeconds] = useState<number>(initialSecs);

  // Time calculations
  const totalSeconds = Math.max(0, Math.floor(timeLeft));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  // Percentage for the digital bar
  const progressPercent = Math.min(100, Math.max(0, (timeLeft / (timerDuration || 1)) * 100));

  // Determine state styling: danger (< 10s and hours==0 and mins==0), paused, or running
  const isUrgent = totalSeconds <= 10 && totalSeconds > 0;
  const isExpired = totalSeconds === 0;

  const handleApplyCustom = () => {
    // Validasi maksimal 1 hari (24 jam = 86400 detik)
    const h = Math.min(24, Math.max(0, Number(inputHours) || 0));
    const m = Math.min(59, Math.max(0, Number(inputMinutes) || 0));
    const s = Math.min(59, Math.max(0, Number(inputSeconds) || 0));

    let total = h * 3600 + m * 60 + s;
    if (total > 86400) total = 86400; // Cap 1 hari
    if (total < 1) total = 10; // Min 10 detik

    onSetDuration(total);
    setShowSettings(false);
  };

  return (
    <div className="w-full flex flex-col items-center bg-neutral-950/90 border-2 border-cyan-500/30 rounded-2xl p-3 sm:p-4 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative">
      {/* Top Header: Digital Timer Title + Settings Trigger */}
      <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono text-[11px] font-bold">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>DIGITAL BROADCAST TIMER</span>
          </div>
          <span className="text-[11px] text-white/50 hidden sm:inline">
            (Custom 1 Jam s/d Maks. 1 Hari)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick chip for current duration */}
          <span className="text-xs font-mono font-bold text-yellow-400 bg-yellow-950/50 border border-yellow-500/40 px-2.5 py-0.5 rounded-lg">
            Maks: {hours > 0 ? `${hours} Jam ` : ''}{minutes > 0 ? `${minutes} Mnt ` : ''}{seconds}s
          </span>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              showSettings
                ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/30'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
            }`}
            title="Open Custom Timer Settings"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Set Timer</span>
          </button>
        </div>
      </div>

      {/* POPUP / ACCORDION PENGATURAN TIMER CUSTOM (1 JAM S/D 1 HARI) */}
      {showSettings && (
        <div className="w-full mb-3 p-3.5 bg-neutral-900 border-2 border-yellow-400/60 rounded-xl flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-yellow-300 uppercase tracking-wide flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Select Game Duration (Max 24 Hours / 1 Day):
            </span>
            <span className="text-[10px] text-white/50 font-mono">1 Hour = 3600 Seconds</span>
          </div>

          {/* Quick Presets Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {PRESET_TIMERS.map((preset) => {
              const isSelected = timerDuration === preset.seconds;
              return (
                <button
                  key={preset.label}
                  onClick={() => {
                    onSetDuration(preset.seconds);
                    setShowSettings(false);
                  }}
                  className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    isSelected
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black border-yellow-200 shadow-md shadow-yellow-500/30 font-black'
                      : 'bg-black/60 hover:bg-white/10 text-white/80 border-white/10'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Custom Input (Jam : Menit : Detik) */}
          <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white/80">Custom Input:</span>
              <div className="flex items-center gap-1 font-mono">
                <div className="flex flex-col items-center">
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={inputHours}
                    onChange={(e) => setInputHours(Math.max(0, Math.min(24, parseInt(e.target.value) || 0)))}
                    className="w-14 px-2 py-1 text-center bg-black border border-cyan-500/50 rounded-lg text-sm font-bold text-cyan-300 focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-[9px] text-white/50 mt-0.5">HOURS</span>
                </div>
                <span className="text-lg font-bold text-cyan-400 pb-3">:</span>
                <div className="flex flex-col items-center">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={inputMinutes}
                    onChange={(e) => setInputMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    className="w-14 px-2 py-1 text-center bg-black border border-cyan-500/50 rounded-lg text-sm font-bold text-cyan-300 focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-[9px] text-white/50 mt-0.5">MINS</span>
                </div>
                <span className="text-lg font-bold text-cyan-400 pb-3">:</span>
                <div className="flex flex-col items-center">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={inputSeconds}
                    onChange={(e) => setInputSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    className="w-14 px-2 py-1 text-center bg-black border border-cyan-500/50 rounded-lg text-sm font-bold text-cyan-300 focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-[9px] text-white/50 mt-0.5">SECS</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleApplyCustom}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold text-xs shadow-md shadow-green-600/30 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Apply Timer</span>
            </button>
          </div>
        </div>
      )}

      {/* TAMPILAN DIGITAL TIMER BESAR (7-SEGMENT / MONOSPACE LED BROADCAST DISPLAY) */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
        {/* LED Digital Clock Face */}
        <div className="flex items-center gap-2 sm:gap-3 bg-black/90 p-3 sm:p-4 rounded-2xl border-2 border-white/20 shadow-[inset_0_0_20px_rgba(0,0,0,0.9)]">
          {/* Jam Block */}
          <div className="flex flex-col items-center">
            <div
              className={`w-16 sm:w-20 h-14 sm:h-16 rounded-xl flex items-center justify-center font-['Share_Tech_Mono','Chakra_Petch',monospace] text-3xl sm:text-4xl font-black tracking-widest transition-all ${
                isExpired
                  ? 'bg-red-950 text-red-500 border border-red-500/50 text-shadow-red'
                  : isUrgent
                  ? 'bg-red-950 text-red-400 border border-red-500 animate-pulse'
                  : !isTimerRunning
                  ? 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
                  : 'bg-cyan-950/80 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
              }`}
            >
              {pad(hours)}
            </div>
            <span className="text-[10px] font-mono font-bold text-white/60 mt-1 uppercase tracking-wider">
              HRS
            </span>
          </div>

          {/* Separator Colon */}
          <span
            className={`text-2xl sm:text-3xl font-black pb-4 ${
              isTimerRunning ? 'text-cyan-400 animate-pulse' : 'text-white/40'
            }`}
          >
            :
          </span>

          {/* Menit Block */}
          <div className="flex flex-col items-center">
            <div
              className={`w-16 sm:w-20 h-14 sm:h-16 rounded-xl flex items-center justify-center font-['Share_Tech_Mono','Chakra_Petch',monospace] text-3xl sm:text-4xl font-black tracking-widest transition-all ${
                isExpired
                  ? 'bg-red-950 text-red-500 border border-red-500/50 text-shadow-red'
                  : isUrgent
                  ? 'bg-red-950 text-red-400 border border-red-500 animate-pulse'
                  : !isTimerRunning
                  ? 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
                  : 'bg-cyan-950/80 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
              }`}
            >
              {pad(minutes)}
            </div>
            <span className="text-[10px] font-mono font-bold text-white/60 mt-1 uppercase tracking-wider">
              MINS
            </span>
          </div>

          {/* Separator Colon */}
          <span
            className={`text-2xl sm:text-3xl font-black pb-4 ${
              isTimerRunning ? 'text-cyan-400 animate-pulse' : 'text-white/40'
            }`}
          >
            :
          </span>

          {/* Detik Block */}
          <div className="flex flex-col items-center">
            <div
              className={`w-16 sm:w-20 h-14 sm:h-16 rounded-xl flex items-center justify-center font-['Share_Tech_Mono','Chakra_Petch',monospace] text-3xl sm:text-4xl font-black tracking-widest transition-all ${
                isExpired
                  ? 'bg-red-950 text-red-500 border border-red-500/50'
                  : isUrgent
                  ? 'bg-red-950 text-red-400 border border-red-500 animate-ping'
                  : !isTimerRunning
                  ? 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              }`}
            >
              {pad(seconds)}
            </div>
            <span className="text-[10px] font-mono font-bold text-white/60 mt-1 uppercase tracking-wider">
              SECS
            </span>
          </div>
        </div>

        {/* Digital Status & Fast Action Controls */}
        <div className="flex flex-col justify-center gap-2 flex-1 w-full md:w-auto">
          {/* Status Label */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isExpired
                    ? 'bg-red-500'
                    : isTimerRunning
                    ? 'bg-emerald-400 animate-ping'
                    : 'bg-amber-400'
                }`}
              />
              <span className="text-xs font-bold text-white">
                {isExpired
                  ? 'TIME EXPIRED! REVEAL & AUTO NEXT'
                  : isTimerRunning
                  ? 'TIMER RUNNING LIVE'
                  : 'TIMER PAUSED'}
              </span>
            </div>
            <span className="text-[11px] font-mono text-cyan-300 font-bold">
              {progressPercent.toFixed(0)}% Left
            </span>
          </div>

          {/* Digital Linear Progress Bar */}
          <div className="w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden border border-white/20">
            <div
              className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                isUrgent
                  ? 'bg-red-500 shadow-[0_0_10px_#ef4444]'
                  : isTimerRunning
                  ? 'bg-gradient-to-r from-cyan-400 via-emerald-400 to-green-500 shadow-[0_0_10px_#06b6d4]'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Streamer Host Fast Buttons (+1 Jam, +10 Menit, +1 Menit, -1 Menit, Play/Pause, Reset) */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {/* Play / Pause Toggle */}
            <button
              onClick={onTogglePlayPause}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                isTimerRunning
                  ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40'
              }`}
              title={isTimerRunning ? 'Pause Timer' : 'Resume Timer'}
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isTimerRunning ? 'Pause' : 'Resume'}</span>
            </button>

            {/* Reset Button */}
            <button
              onClick={onReset}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1 border border-white/15"
              title="Reset Timer to Initial Value"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>

            {/* Quick Adjustment Chips */}
            <button
              onClick={() => onAdjustTime(3600)}
              className="px-2 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 font-mono text-[11px] font-bold"
              title="Add 1 Hour"
            >
              +1 Hr
            </button>
            <button
              onClick={() => onAdjustTime(600)}
              className="px-2 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 font-mono text-[11px] font-bold"
              title="Add 10 Minutes"
            >
              +10 Min
            </button>
            <button
              onClick={() => onAdjustTime(60)}
              className="px-2 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 font-mono text-[11px] font-bold"
              title="Add 1 Minute"
            >
              +1 Min
            </button>
            <button
              onClick={() => onAdjustTime(-60)}
              className="px-2 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-500/30 font-mono text-[11px] font-bold"
              title="Subtract 1 Minute"
            >
              -1 Min
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
