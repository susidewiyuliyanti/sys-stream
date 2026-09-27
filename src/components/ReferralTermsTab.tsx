import React from 'react';
import {
  FileText,
  ShieldCheck,
  Gift,
  Coins,
  Award,
  Crown,
  AlertTriangle,
  Wallet,
  CheckCircle2,
  HelpCircle,
  Clock,
  Flame
} from 'lucide-react';
import {
  REFERRAL_BONUS_PER_MEMBER,
  NEW_MEMBER_WELCOME_BONUS,
  REFERRAL_TERMS_AND_CONDITIONS
} from '../constants/referralTiers';

interface ReferralTermsTabProps {
  onGoToCalculation?: () => void;
}

export const ReferralTermsTab: React.FC<ReferralTermsTabProps> = ({
  onGoToCalculation
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <FileText className="w-4 h-4" />
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">
                Official Referral Program Terms & Conditions
              </h3>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              Official guide covering program rules, transparent commissions, account verification criteria, and withdrawal procedures for Sultan Studio's referral program.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold self-start sm:self-auto shrink-0">
            <ShieldCheck className="w-4 h-4" />
            Verified & Secure
          </div>
        </div>
      </div>

      {/* Structured Terms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Member Baru Free Rp 15.000 */}
        <div className="p-4 sm:p-5 bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 rounded-2xl transition-all space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                Term 1
              </div>
              <h4 className="text-sm font-bold text-white">
                New Member Welcome Bonus: Free Rp {NEW_MEMBER_WELCOME_BONUS.toLocaleString('id-ID')}
              </h4>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every new member who joins through a referral link or enters a sponsor referral code is entitled to a free initial balance of <strong>15,000 IDR</strong>.
          </p>
          <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Awarded once per unique account after Google verification.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Balance is immediately active and can be used directly inside the app.</span>
            </div>
          </div>
        </div>

        {/* 2. Tiap 1 Member Rp 5.000 */}
        <div className="p-4 sm:p-5 bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 rounded-2xl transition-all space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                Term 2
              </div>
              <h4 className="text-sm font-bold text-white">
                Reward Rp {REFERRAL_BONUS_PER_MEMBER.toLocaleString('id-ID')} Per Joined Member
              </h4>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The Referrer receives an automatic, instant commission of <strong>5,000 IDR</strong> for each new member who successfully signs up using your link or code.
          </p>
          <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>No maximum cap on the number of members you can invite.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Commission is credited instantly to your account and is withdrawable.</span>
            </div>
          </div>
        </div>

        {/* 3. Bonus Milestone Bertingkat */}
        <div className="p-4 sm:p-5 bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 rounded-2xl transition-all space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Term 3
              </div>
              <h4 className="text-sm font-bold text-white">
                Target Achievement Bonuses (Milestones)
              </h4>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            In addition to base commissions per member, the referrer qualifies for extra cash bonuses upon reaching key referral milestones:
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="font-bold text-amber-300">50 Reff (Bonus)</div>
              <div className="font-black text-white font-mono">Rp 50.000</div>
              <div className="text-[10px] text-slate-400">Total payout Rp 300.000</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="font-bold text-amber-300">100 Reff (Bonus)</div>
              <div className="font-black text-white font-mono">Rp 100.000</div>
              <div className="text-[10px] text-slate-400">Total payout Rp 600.000</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <div className="font-bold text-amber-300">500 Reff (Bonus)</div>
              <div className="font-black text-white font-mono">Rp 750.000</div>
              <div className="text-[10px] text-slate-400">Total payout Rp 3.250.000</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-amber-500/40 bg-amber-500/10">
              <div className="font-bold text-amber-300">1,000 Reff (Bonus)</div>
              <div className="font-black text-white font-mono">Rp 1.000.000</div>
              <div className="text-[10px] text-amber-200">+ Event Prize & VIP</div>
            </div>
          </div>
        </div>

        {/* 4. Puncak Hadiah 1.000 Reff + Hadiah Event + Free VIP Sultan */}
        <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-950/40 via-slate-950 to-slate-900 border border-amber-500/40 rounded-2xl transition-all space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 flex items-center justify-center shrink-0 font-bold">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Term 4 (Grand Milestone)
              </div>
              <h4 className="text-sm font-bold text-white">
                1,000 Reff: 1M Bonus + 2.5M Event Prize + Lifetime VIP
              </h4>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Members who reach 1,000 verified referrals are awarded <strong>Grand Master VIP</strong> status and receive the supreme prize bundle:
          </p>
          <div className="text-[11px] text-slate-300 space-y-1 pt-1 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span><strong>Rp 5.000.000</strong> Base Commission (1,000 members × 5,000 IDR)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span><strong>Rp 1.000.000</strong> Cash Milestone Bonus for 1,000 Reff</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span><strong>Rp 2.500.000</strong> Special Event Cash Grand Prize</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-300 font-bold">
              <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Lifetime Sultan VIP Status (Zero Subscription Fees Forever)</span>
            </div>
          </div>
        </div>

        {/* 5. Syarat Validasi Akun & Anti-Fraud */}
        <div className="p-4 sm:p-5 bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 rounded-2xl transition-all space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                Term 5
              </div>
              <h4 className="text-sm font-bold text-white">
                Account Verification & Anti-Fraud Policy
              </h4>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            To preserve a fair and healthy community, all referrals are verified automatically by the security system:
          </p>
          <div className="text-[11px] text-slate-400 space-y-1.5 pt-1 border-t border-slate-800/80">
            <div className="flex items-start gap-1.5">
              <span className="text-rose-400 font-bold">•</span>
              <span>Self-referrals using multi-tab browser sessions, bot emulators, or automated scripts are strictly prohibited.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-rose-400 font-bold">•</span>
              <span>Referred members must be authentic users verified via official Google accounts.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-rose-400 font-bold">•</span>
              <span>Accounts suspected of fraudulent activity will be disqualified, rewards revoked, and accounts may be permanently suspended.</span>
            </div>
          </div>
        </div>

        {/* 6. Ketentuan Pencairan Saldo (Withdraw) */}
        <div className="p-4 sm:p-5 bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 rounded-2xl transition-all space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                Term 6
              </div>
              <h4 className="text-sm font-bold text-white">
                Withdrawal Guidelines & Payout Policies
              </h4>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Commissions and cash prizes can be withdrawn effortlessly to various supported payment methods:
          </p>
          <div className="text-[11px] text-slate-400 space-y-1.5 pt-1 border-t border-slate-800/80">
            <div className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span><strong>Supported Channels:</strong> Bank BCA, Mandiri, BRI, BNI as well as DANA, GoPay, OVO, ShopeePay.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span><strong>Minimum Withdrawal:</strong> Rp 50,000 / Rp 100,000 per withdrawal request.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span><strong>Processing Speed:</strong> Transfers are processed within 1 to 24 business hours following submission.</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Box to Calculation Tab */}
      {onGoToCalculation && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Would you like to explore your projected commission breakdown in detail?</span>
          </div>
          <button
            onClick={onGoToCalculation}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-colors self-start sm:self-auto"
          >
            Open Calculator & Projection Simulator
          </button>
        </div>
      )}
    </div>
  );
};
