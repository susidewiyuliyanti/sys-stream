import React, { useState } from 'react';
import { PlayerScore } from '../types';
import { useAppConfig } from '../context/AppConfigContext';
import {
  Trophy,
  X,
  Plus,
  Trash2,
  RotateCcw,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus
} from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: PlayerScore[];
  onAddPlayer: (name: string) => void;
  onDeletePlayer: (id: string) => void;
  onAdjustScore: (id: string, pointDelta: number, rupiahDelta: number) => void;
  onResetAllScores: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  players,
  onAddPlayer,
  onDeletePlayer,
  onAdjustScore,
  onResetAllScores
}) => {
  const { formatCurrency, country, t } = useAppConfig();
  const [newPlayerName, setNewPlayerName] = useState<string>('');
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleAdd = () => {
    const trimmed = newPlayerName.trim();
    if (!trimmed) return;
    onAddPlayer(trimmed);
    setNewPlayerName('');
  };

  // Sort descending by score / rupiah
  const sortedPlayers = [...players].sort((a, b) => b.rupiah - a.rupiah || b.score - a.score);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-neutral-950 border-2 border-yellow-500/40 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.25)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-yellow-400 text-black flex items-center justify-center shadow-lg shadow-yellow-400/40">
              <Trophy className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                Live Broadcast Scoreboard ({t('leaderboard')})
              </h2>
              <p className="text-xs text-yellow-400/90 font-mono">
                Active Currency: {country.flag} {country.currencyCode} ({country.currencySymbol}) & Interactive Points
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls: Add New Player + Reset Session */}
        <div className="p-4 border-b border-white/10 bg-neutral-900/60 flex flex-wrap items-center justify-between gap-3">
          {/* Add Player Form */}
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <input
              type="text"
              placeholder="Add viewer name / @username..."
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
              }}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-neutral-950 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
            />
            <button
              onClick={handleAdd}
              disabled={!newPlayerName.trim()}
              className="px-3 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-black font-black text-xs flex items-center gap-1 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {/* Reset All Button */}
          <div>
            {confirmReset ? (
              <div className="flex items-center gap-1.5 animate-in fade-in">
                <span className="text-[11px] text-red-400 font-bold">Reset all scores?</span>
                <button
                  onClick={() => {
                    onResetAllScores();
                    setConfirmReset(false);
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-1 text-xs rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="px-3 py-2 text-xs rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-300 text-white/60 border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
                title="Clear all players and start a new broadcast session"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Session</span>
              </button>
            )}
          </div>
        </div>

        {/* Players List Scrollable Table */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-2.5 max-h-[50vh] scrollbar-thin scrollbar-thumb-white/20">
          {sortedPlayers.length === 0 ? (
            <div className="text-center py-10 text-sm text-white/40 italic">
              No players recorded yet. Players are automatically added when guessing correctly or added manually above.
            </div>
          ) : (
            sortedPlayers.map((player, idx) => (
              <div
                key={player.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all ${
                  idx === 0
                    ? 'bg-gradient-to-r from-yellow-500/20 via-neutral-900 to-neutral-900 border-yellow-500/50 shadow-md shadow-yellow-500/10'
                    : idx === 1
                    ? 'bg-gradient-to-r from-slate-400/20 via-neutral-900 to-neutral-900 border-slate-400/40'
                    : idx === 2
                    ? 'bg-gradient-to-r from-amber-700/20 via-neutral-900 to-neutral-900 border-amber-700/40'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                {/* Player Rank & Name */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0">
                    {idx === 0 ? (
                      <span className="text-xl">🥇</span>
                    ) : idx === 1 ? (
                      <span className="text-xl">🥈</span>
                    ) : idx === 2 ? (
                      <span className="text-xl">🥉</span>
                    ) : (
                      <span className="text-white/60 font-mono">#{idx + 1}</span>
                    )}
                  </div>

                  <div>
                    <span className="font-bold text-sm sm:text-base text-white">
                      {player.name}
                    </span>
                    <div className="text-[11px] text-white/50 font-mono flex items-center gap-2">
                      <span>{player.score} Points</span>
                      {player.lastWin && <span>&bull; Last win: {player.lastWin}</span>}
                    </div>
                  </div>
                </div>

                {/* Score & Quick Adjustment Buttons */}
                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
                  {/* Hadiah / Saldo Mata Uang Aktif */}
                  <div className="text-right px-3 py-1 bg-black/60 rounded-xl border border-white/15">
                    <div className="text-xs sm:text-sm font-mono font-black text-emerald-400">
                      {formatCurrency(player.rupiah)}
                    </div>
                  </div>

                  {/* Tombol Cepat Penyesuaian Skor */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onAdjustScore(player.id, 50, 50000)}
                      className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs border border-emerald-500/40 flex items-center cursor-pointer"
                      title="Add +50K"
                    >
                      +50K
                    </button>
                    <button
                      onClick={() => onAdjustScore(player.id, 10, 10000)}
                      className="px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-xs border border-cyan-500/40 flex items-center cursor-pointer"
                      title="Add +10K"
                    >
                      +10K
                    </button>
                    <button
                      onClick={() => onAdjustScore(player.id, -5, -5000)}
                      className="px-2 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-xs border border-red-500/40 cursor-pointer"
                      title="Deduct -5K"
                    >
                      -5K
                    </button>
                    <button
                      onClick={() => onDeletePlayer(player.id)}
                      className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                      title="Remove this player"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-neutral-900/60 flex items-center justify-between text-xs text-white/60">
          <span>Data automatically synchronized to local session</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
