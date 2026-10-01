import React from 'react';

interface Props {
  navigate?: (path: string) => void;
}

export default function TermsPage({ navigate }: Props) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-10">
      <article className="max-w-4xl mx-auto">
        <button onClick={() => navigate?.('/login')} className="text-cyan-400 hover:text-cyan-300 text-sm mb-8">
          ← Back
        </button>
        <h1 className="text-3xl font-black mb-2">Terms &amp; Conditions</h1>
        <p className="text-slate-500 text-sm mb-8">Last updated: October 1, 2026</p>

        <div className="space-y-7 text-sm leading-7 text-slate-300">
          <section><h2 className="text-lg font-bold text-white mb-2">1. Acceptance of Terms</h2><p>By creating an account or using SYS STREAM, you agree to these Terms &amp; Conditions and applicable laws and regulations. If you do not agree, do not use the platform.</p></section>
          <section><h2 className="text-lg font-bold text-white mb-2">2. Eligibility and Account</h2><p>You are responsible for providing accurate registration information, protecting your credentials, and all activity performed through your account. You must be legally permitted to use the services in your jurisdiction.</p></section>
          <section><h2 className="text-lg font-bold text-white mb-2">3. Deposits and Digital Assets</h2><p>SYS STREAM may support deposits using cryptocurrency or other digital-asset payment methods made available by the platform or its payment providers. A deposit is credited only after the applicable payment has been received and verified. Network fees, blockchain confirmation times, exchange-rate movements, and payment-provider requirements may affect a transaction.</p><p className="mt-2">You are responsible for sending funds using the correct network, asset, and payment instructions. Transactions sent to an incorrect address or unsupported network may be irreversible.</p></section>
          <section><h2 className="text-lg font-bold text-white mb-2">4. Game Balance and Lock</h2><p>Your available balance and locked balance are maintained according to the platform's transaction records. A lock may temporarily restrict the locked amount according to the selected game rules and duration. Locked funds are not necessarily immediately withdrawable or spendable until the applicable lock conditions are satisfied.</p></section>
          <section><h2 className="text-lg font-bold text-white mb-2">5. Games, Rewards and Results</h2><p>Games and reward mechanisms operate according to the rules displayed by SYS STREAM. Results are processed using the platform's server-side transaction logic. Rewards, eligibility, limits, and settlement conditions may vary by game and may be subject to applicable law.</p><p className="mt-2">SYS STREAM does not guarantee profit, income, or recovery of any amount used in a game. Users should only use funds they can afford to lose.</p></section>
          <section><h2 className="text-lg font-bold text-white mb-2">6. Prohibited Conduct</h2><p>You may not use SYS STREAM for fraud, money laundering, unauthorized payments, account abuse, manipulation of game outcomes, automated attacks, exploitation of vulnerabilities, impersonation, or any activity that violates applicable law or third-party rights.</p></section>
          <section><h2 className="text-lg font-bold text-white mb-2">7. Suspensions and Account Review</h2><p>SYS STREAM may restrict, suspend, or terminate accounts where there is suspected fraud, abuse, security risk, violation of these Terms, or a legal or regulatory requirement. Where appropriate, transactions may be reviewed before settlement.</p></section>
          <section><h2 className="text-lg font-bold text-white mb-2">8. Service Availability</h2><p>The platform may be temporarily unavailable because of maintenance, security incidents, network failures, blockchain conditions, third-party services, or circumstances beyond reasonable control.</p></section>
          <section><h2 className="text-lg font-bold text-white mb-2">9. Limitation of Liability</h2><p>To the extent permitted by applicable law, SYS STREAM is not responsible for losses caused by user error, incorrect blockchain transfers, compromised credentials, unsupported networks, third-party payment providers, or events outside the platform's reasonable control. Nothing in these Terms excludes liability that cannot legally be excluded.</p></section>
          <section><h2 className="text-lg font-bold text-white mb-2">10. Changes</h2><p>SYS STREAM may update these Terms when necessary. Material changes may be communicated through the platform. Continued use after an update constitutes acceptance of the revised Terms to the extent permitted by law.</p></section>
          <section><h2 className="text-lg font-bold text-white mb-2">11. Contact</h2><p>For questions about these Terms, please use the official contact channel provided by SYS STREAM.</p></section>
        </div>
      </article>
    </div>
  );
}
