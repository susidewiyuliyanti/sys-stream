import React from 'react';
import { X, Shield, FileText, CheckCircle2, AlertCircle, Scale, Coins } from 'lucide-react';

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[85vh] bg-[#0c121e] border border-amber-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white font-['Poppins']"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">Terms & Conditions of Service</h3>
              <p className="text-xs text-white/50">Please read carefully before accessing and using the application</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs sm:text-sm text-white/80 leading-relaxed custom-scrollbar">
          
          {/* Section 1 */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Scale className="w-4 h-4" />
              <h4>1. General Provisions & Account Registration</h4>
            </div>
            <p className="text-white/70">
              By logging in and utilizing the <strong>SYS Streamer</strong> platform, you agree to be bound by all of these terms and conditions.
            </p>
            <ul className="list-disc list-inside space-y-1 text-white/60 pl-1">
              <li>Users must authenticate using a valid and active personal Google account.</li>
              <li>Users are strictly prohibited from creating multiple or clone accounts to manipulate rewards, referrals, or events.</li>
              <li>Users remain fully responsible for maintaining the security of their own devices and login credentials.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Coins className="w-4 h-4" />
              <h4>2. Wallet Balance, Deposits, and Withdrawals</h4>
            </div>
            <p className="text-white/70">
              Wallet balance management across the platform is subject to the following verification policies:
            </p>
            <ul className="list-disc list-inside space-y-1 text-white/60 pl-1">
              <li>Every deposit submission must provide valid transaction proof or a Transaction Hash (TxID) from supported payment networks.</li>
              <li>All deposit requests are verified by the designated Admin/Owner before balance is credited to the user's wallet.</li>
              <li>Withdrawals may only be processed to verified accounts or digital wallets corresponding to account ownership.</li>
              <li>Fraudulent deposit submissions (fabricated receipts or manipulated hashes) will result in immediate permanent account termination.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Shield className="w-4 h-4" />
              <h4>3. Game Integrity & Fair Play</h4>
            </div>
            <p className="text-white/70">
              All interactive game modules including the 3D Blind Box and Lucky Wheel operate under transparent and synchronized algorithms:
            </p>
            <ul className="list-disc list-inside space-y-1 text-white/60 pl-1">
              <li>Use of bots, automated scripts, or modified clients to manipulate game outcomes is strictly prohibited.</li>
              <li>Daily rewards, claim quotas, and jackpot probabilities are governed by verified server-side logic.</li>
              <li>All decisions by the system administration team regarding gameplay disputes are final.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <AlertCircle className="w-4 h-4" />
              <h4>4. Data Privacy & Security</h4>
            </div>
            <p className="text-white/70">
              We prioritize the privacy and security of user data. Information obtained through Google authentication is strictly used for account validation, transaction records, and personalized interactive stream experiences. We never sell or share user data with unauthorized third parties.
            </p>
          </div>

          {/* Section 5 */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <h4>5. Policy Amendments</h4>
            </div>
            <p className="text-white/70">
              The platform administrators reserve the right to amend or update these Terms & Conditions as necessary to maintain system integrity and comply with applicable standards. Updates take effect upon publication.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-black/40 flex items-center justify-between gap-4">
          <span className="text-[11px] text-white/40">Last Updated: September 2026</span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
