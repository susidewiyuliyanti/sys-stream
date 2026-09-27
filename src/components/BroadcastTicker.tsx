import React from 'react';
import { PlayerScore } from '../types';
import { useAppConfig } from '../context/AppConfigContext';
import { SysLogo } from './SysLogo';
import { Trophy, DollarSign, Radio } from 'lucide-react';

interface BroadcastTickerProps {
  players: PlayerScore[];
  activePrizeNominal: number;
  activeGameTitle: string;
}

export const BroadcastTicker: React.FC<BroadcastTickerProps> = ({
  players,
  activePrizeNominal,
  activeGameTitle
}) => {
  const { formatCurrency, country, t } = useAppConfig();

  const topPlayers = [...players]
    .sort((a, b) => b.rupiah - a.rupiah || b.score - a.score)
    .slice(0, 5);

  return (
    <div className="w-full bg-black/90 border-t border-white/10 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs select-none z-20">
      {/* Brand & Live Badge and Current Active Game */}
      <div className="flex items-center gap-3">
        <SysLogo size="sm" showText={false} />
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-600/30 border border-red-500/50 text-red-400 font-bold font-mono text-[10px]">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>ON AIR</span>
          </div>
          <span className="text-white/90 font-bold">SYS Streamer</span>
          <span className="text-white/40">&bull;</span>
          <span className="text-white/80 font-semibold">{activeGameTitle}</span>
          <span className="text-white/40">&bull;</span>
          <span className="text-yellow-400 font-bold font-mono flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            <span>{t('prize_label')}: {formatCurrency(activePrizeNominal)}</span>
          </span>
        </div>
      </div>

      {/* Top Players Streamer Ticker & Copyright */}
      <div className="flex items-center gap-3 overflow-x-auto">
        <span className="text-[11px] text-white/50 flex items-center gap-1 font-semibold uppercase tracking-wider">
          <Trophy className="w-3 h-3 text-yellow-400" />
          {t('leaderboard')}:
        </span>
        {topPlayers.length === 0 ? (
          <span className="text-white/40 italic text-[11px]">-</span>
        ) : (
          topPlayers.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center gap-1.5 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10 shrink-0"
            >
              <span>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
              <span className="font-bold text-white/90">{p.name}</span>
              <span className="text-emerald-400 font-mono font-bold text-[11px]">
                {formatCurrency(p.rupiah)}
              </span>
            </div>
          ))
        )}
        <div className="hidden lg:flex items-center pl-2 border-l border-white/15 text-[10px] text-amber-200/60 font-medium whitespace-nowrap">
          All Reserve @SYS Agency
        </div>
      </div>
    </div>
  );
};
