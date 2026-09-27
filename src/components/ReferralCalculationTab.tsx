import React, { useState } from 'react';
import {
  Calculator,
  Gift,
  Award,
  Crown,
  TrendingUp,
  CheckCircle2,
  Coins,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import {
  REFERRAL_BONUS_PER_MEMBER,
  NEW_MEMBER_WELCOME_BONUS,
  calculateReferralBreakdown
} from '../constants/referralTiers';
import { playClick, playTick } from '../services/sound';

interface ReferralCalculationTabProps {
  currentReferralCount: number;
  onSelectMilestone?: (count: number) => void;
}

export const ReferralCalculationTab: React.FC<ReferralCalculationTabProps> = ({
  currentReferralCount,
  onSelectMilestone
}) => {
  const [simulatedCount, setSimulatedCount] = useState<number>(
    currentReferralCount > 0 ? currentReferralCount : 50
  );

  const breakdown = calculateReferralBreakdown(simulatedCount);
  const currentBreakdown = calculateReferralBreakdown(currentReferralCount);

  const presets = [
    { label: '1 Member', count: 1 },
    { label: '10 Members', count: 10 },
    { label: '50 Reff', count: 50, isMilestone: true },
    { label: '100 Reff', count: 100, isMilestone: true },
    { label: '500 Reff', count: 500, isMilestone: true },
    { label: '1,000 Reff', count: 1000, isMilestone: true, isSuper: true }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/50 via-slate-900 to-emerald-950/40 border border-amber-500/30 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Calculator className="w-4 h-4" />
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">
                Detailed Referral Reward Calculation
              </h3>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              Transparent reward scheme calculating per-member referral commissions, milestone achievement bonuses,
              and top grand event prizes up to <strong className="text-amber-300 font-bold">8,500,000 IDR + Free Lifetime Sultan VIP</strong>.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs self-start sm:self-auto shrink-0">
            <div className="text-[10px] text-slate-400">Your Current Referrals</div>
            <div className="text-sm font-black text-amber-300">{currentReferralCount} Members</div>
            <div className="text-[10px] text-emerald-400 font-semibold">
              Estimated: Rp {currentBreakdown.totalEarnings.toLocaleString('id-ID')}
            </div>
          </div>
        </div>
      </div>

      {/* 2 Core Foundation Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-xl flex items-start gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              New Member Bonus
            </div>
            <div className="text-lg font-black text-white">
              Free Rp {NEW_MEMBER_WELCOME_BONUS.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Every new member who joins through your link instantly receives a 15,000 IDR free balance in their account.
            </p>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-xl flex items-start gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              Direct Referrer Commission
            </div>
            <div className="text-lg font-black text-emerald-400">
              Rp {REFERRAL_BONUS_PER_MEMBER.toLocaleString('id-ID')} / Member
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              For every 1 member who registers and verifies via your link, your commission balance immediately gains 5,000 IDR.
            </p>
          </div>
        </div>
      </div>

      {/* Tabel Rincian Nominal Hadiah Milestone */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Milestone Reward & Bonus Breakdown Table
          </h4>
          <span className="text-[10px] text-slate-400">Total Accumulated Cash</span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="p-3 sm:p-3.5">Referral Target</th>
                <th className="p-3 sm:p-3.5">Base Reward (@5,000 IDR)</th>
                <th className="p-3 sm:p-3.5">Milestone Bonus</th>
                <th className="p-3 sm:p-3.5">Event Grand Prize</th>
                <th className="p-3 sm:p-3.5">VIP Access</th>
                <th className="p-3 sm:p-3.5 text-right">Total Cash Reward</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {/* Row 1 */}
              <tr className="hover:bg-slate-900/40 transition-colors">
                <td className="p-3 sm:p-3.5">
                  <div className="font-bold text-white">1 Member</div>
                  <div className="text-[10px] text-slate-400">First Step</div>
                </td>
                <td className="p-3 sm:p-3.5 font-mono text-slate-300">
                  Rp 5.000
                </td>
                <td className="p-3 sm:p-3.5 text-slate-500">-</td>
                <td className="p-3 sm:p-3.5 text-slate-500">-</td>
                <td className="p-3 sm:p-3.5 text-slate-400 text-[11px]">Standard</td>
                <td className="p-3 sm:p-3.5 text-right font-black font-mono text-emerald-400">
                  Rp 5.000
                </td>
              </tr>

              {/* Row 50 */}
              <tr className="hover:bg-slate-900/40 transition-colors">
                <td className="p-3 sm:p-3.5">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    50 Reff
                  </div>
                  <div className="text-[10px] text-slate-400">Promoter Level 1</div>
                </td>
                <td className="p-3 sm:p-3.5 font-mono text-slate-300">
                  Rp 250.000 <span className="text-[10px] text-slate-500">(50 × 5k)</span>
                </td>
                <td className="p-3 sm:p-3.5 font-mono font-bold text-amber-300">
                  + Rp 50.000
                </td>
                <td className="p-3 sm:p-3.5 text-slate-500">-</td>
                <td className="p-3 sm:p-3.5 text-slate-400 text-[11px]">Free VIP 7 Days</td>
                <td className="p-3 sm:p-3.5 text-right font-black font-mono text-emerald-400">
                  Rp 300.000
                </td>
              </tr>

              {/* Row 100 */}
              <tr className="hover:bg-slate-900/40 transition-colors">
                <td className="p-3 sm:p-3.5">
                  <div className="font-bold text-blue-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    100 Reff
                  </div>
                  <div className="text-[10px] text-slate-400">Partner Level 2</div>
                </td>
                <td className="p-3 sm:p-3.5 font-mono text-slate-300">
                  Rp 500.000 <span className="text-[10px] text-slate-500">(100 × 5k)</span>
                </td>
                <td className="p-3 sm:p-3.5 font-mono font-bold text-amber-300">
                  + Rp 100.000
                </td>
                <td className="p-3 sm:p-3.5 text-slate-500">-</td>
                <td className="p-3 sm:p-3.5 text-slate-400 text-[11px]">Free VIP 14 Days</td>
                <td className="p-3 sm:p-3.5 text-right font-black font-mono text-emerald-400">
                  Rp 600.000
                </td>
              </tr>

              {/* Row 500 */}
              <tr className="hover:bg-slate-900/40 transition-colors">
                <td className="p-3 sm:p-3.5">
                  <div className="font-bold text-yellow-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                    500 Reff
                  </div>
                  <div className="text-[10px] text-slate-400">Ambassador Level 3</div>
                </td>
                <td className="p-3 sm:p-3.5 font-mono text-slate-300">
                  Rp 2.500.000 <span className="text-[10px] text-slate-500">(500 × 5k)</span>
                </td>
                <td className="p-3 sm:p-3.5 font-mono font-bold text-amber-300">
                  + Rp 750.000
                </td>
                <td className="p-3 sm:p-3.5 text-slate-500">-</td>
                <td className="p-3 sm:p-3.5 text-slate-400 text-[11px]">Free VIP 60 Days</td>
                <td className="p-3 sm:p-3.5 text-right font-black font-mono text-emerald-400">
                  Rp 3.250.000
                </td>
              </tr>

              {/* Row 1000 - Highlighted */}
              <tr className="bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/20 border-t-2 border-amber-500/40">
                <td className="p-3 sm:p-3.5">
                  <div className="font-black text-amber-300 flex items-center gap-1.5 text-xs sm:text-sm">
                    <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                    1,000 Reff
                  </div>
                  <div className="text-[10px] text-amber-200 font-bold">Grand Master VIP</div>
                </td>
                <td className="p-3 sm:p-3.5 font-mono text-slate-200">
                  Rp 5.000.000 <span className="text-[10px] text-slate-400">(1,000 × 5k)</span>
                </td>
                <td className="p-3 sm:p-3.5 font-mono font-bold text-amber-300">
                  + Rp 1.000.000
                </td>
                <td className="p-3 sm:p-3.5 font-mono font-black text-cyan-300">
                  + Rp 2.500.000
                </td>
                <td className="p-3 sm:p-3.5">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 border border-amber-500/50 text-[10px] font-black inline-flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-300" />
                    FREE LIFETIME SULTAN VIP
                  </span>
                </td>
                <td className="p-3 sm:p-3.5 text-right">
                  <div className="text-sm sm:text-base font-black font-mono text-yellow-300">
                    Rp 8.500.000
                  </div>
                  <div className="text-[10px] text-amber-200 font-bold">Total Cash + Lifetime VIP</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Simulator & Calculator */}
      <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-700/80 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-400" />
              Interactive Referral Calculator & Simulator
            </h4>
            <p className="text-xs text-slate-400">
              Slide or input the referral count to calculate your projected commission and reward breakdown
            </p>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {presets.map((p) => (
              <button
                key={p.count}
                onClick={() => {
                  playClick();
                  setSimulatedCount(p.count);
                  if (onSelectMilestone) onSelectMilestone(p.count);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  simulatedCount === p.count
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Slider & Input */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Simulated Registered Referrals:</span>
              <strong className="text-amber-400 text-sm font-mono font-black">
                {simulatedCount} Host Streamers
              </strong>
            </div>
            <input
              type="range"
              min={1}
              max={1200}
              step={1}
              value={simulatedCount}
              onChange={(e) => {
                playTick();
                setSimulatedCount(Number(e.target.value));
              }}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>1 Reff</span>
              <span>50 Reff</span>
              <span>100 Reff</span>
              <span>500 Reff</span>
              <span>1,000 Reff</span>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 mb-1 block">Manual Count Input:</label>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={50000}
                value={simulatedCount}
                onChange={(e) => {
                  const val = Math.max(0, parseInt(e.target.value) || 0);
                  setSimulatedCount(val);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-400"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">
                Members
              </span>
            </div>
          </div>
        </div>

        {/* Calculation Result Summary Card */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Simulation Calculation Results ({simulatedCount} Members)</span>
            {simulatedCount >= 1000 && (
              <span className="text-amber-400 text-xs font-black flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" />
                Maximum VIP Achieved!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-400">Base Reward (@5,000 IDR)</div>
              <div className="text-base font-black text-slate-200 font-mono mt-0.5">
                Rp {breakdown.baseEarnings.toLocaleString('id-ID')}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {simulatedCount} × Rp 5,000
              </div>
            </div>

            <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-400">Milestone Bonus</div>
              <div className="text-base font-black text-amber-300 font-mono mt-0.5">
                Rp {breakdown.milestoneBonus.toLocaleString('id-ID')}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {simulatedCount >= 1000
                  ? 'Milestone 1,000 Reff'
                  : simulatedCount >= 500
                  ? 'Milestone 500 Reff'
                  : simulatedCount >= 100
                  ? 'Milestone 100 Reff'
                  : simulatedCount >= 50
                  ? 'Milestone 50 Reff'
                  : 'Under 50 Reff'}
              </div>
            </div>

            <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-400">Special Event Prize</div>
              <div className="text-base font-black text-cyan-300 font-mono mt-0.5">
                Rp {breakdown.eventPrize.toLocaleString('id-ID')}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {simulatedCount >= 1000 ? '1,000 Reff Event Active' : 'Available at 1,000 Reff'}
              </div>
            </div>

            <div className="p-3 bg-gradient-to-br from-amber-500/20 to-yellow-500/10 rounded-lg border border-amber-500/40">
              <div className="text-[10px] text-amber-300 font-bold">TOTAL CASH REWARDS</div>
              <div className="text-lg font-black text-yellow-300 font-mono mt-0.5">
                Rp {breakdown.totalEarnings.toLocaleString('id-ID')}
              </div>
              <div className="text-[10px] text-emerald-400 font-bold mt-1">
                {breakdown.isVipSultan ? '+ FREE LIFETIME SULTAN VIP' : 'Ready to withdraw to bank'}
              </div>
            </div>
          </div>

          {breakdown.isVipSultan && (
            <div className="p-3 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/10 border border-amber-500/40 rounded-xl flex items-center gap-3 text-xs text-amber-200">
              <Crown className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <strong className="text-white block">Grand Master VIP Status Unlocked Automatically!</strong>
                With 1,000 referrals, your account is upgraded to Lifetime Grand Master VIP with zero monthly subscription fees forever.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
