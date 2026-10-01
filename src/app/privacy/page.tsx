import React from 'react';

interface Props {
  navigate?: (path: string) => void;
}

export default function PrivacyPage({ navigate }: Props) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-10">
      <article className="max-w-4xl mx-auto">
        <button onClick={() => navigate?.('/login')} className="text-cyan-400 hover:text-cyan-300 text-sm mb-8">
          ← Back
        </button>
        <h1 className="text-3xl font-black mb-2">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-8">Last updated: October 1, 2026</p>

        <div className="space-y-7 text-sm leading-7 text-slate-300">
          <section><h2 className="text-lg font-bold text-white mb-2">1. Scope</h2><p>This Privacy Policy explains how SYS STREAM may collect, use, store, and protect information when you use the platform.</p></section>
          <section><h2 className="text-lg font-bold text-white mb-2">2. Information We Collect</h2><p>Depending on the services you use, we may collect account information such as username and email address; authentication and security information; transaction information such as deposit amount, asset, network, transaction status, and related identifiers; game activity and reward records; profile information you choose to provide; and technical information such as IP address, device/browser information, logs, and timestamps.</p></section>
          <section><h2 className="text-lg font-bold text-white mb-2">3. How We Use Information</h2><p>Information may be used to create and authenticate accounts, process deposits and transactions, maintain balances and game records, provide rewards, prevent fraud and abuse, secure the platform, provide support, improve services, and comply with legal obligations.</p></section>
          <section><h2 className="text-lg font-bold text-white mb-2">4. Blockchain and Payment Information</h2><p>Blockchain transactions may be publicly visible on the relevant network and may not be erasable or reversible. SYS STREAM may receive transaction identifiers and payment-status information from payment providers or blockchain-related services to verify deposits.</p></section>
          <section><h2 className="text-lg font-bold text-white mb-2">5. Sharing of Information</h2><p>We may share information with service providers that help operate authentication, hosting, databases, payment processing, security, analytics, or customer support. Information may also be disclosed where required by law, legal process, or to protect users, the platform, or others.</p><p className="mt-2">We do not sell personal information merely because you use SYS STREAM. Any data sharing is limited to legitimate operational, legal, security, or service purposes.</p></section>
          <section><h2 className="text-lg font-bold text-white mb-2">6. Data Security</h2><p>We use reasonable technical and organizational safeguards designed to protect account and transaction information. No internet service can guarantee absolute security, so users should protect passwords, authentication tokens, and other account credentials.</p></section>
          <section><h2 className="text-lg font-bold text-white mb-2">7. Data Retention</h2><p>Information may be retained for as long as reasonably necessary to provide services, maintain transaction and security records, resolve disputes, prevent fraud, and satisfy legal or accounting obligations.</p></section>
          <section><h2 className="text-lg font-bold text-white mb-2">8. Your Choices and Rights</h2><p>Depending on your jurisdiction, you may have rights to request access, correction, deletion, restriction, or other treatment of personal information. Some records may need to be retained where required for legal, security, fraud-prevention, or transaction-record purposes.</p></section>
          <section><h2 className="text-lg font-bold text-white mb-2">9. Cookies and Local Storage</h2><p>SYS STREAM may use browser storage, cookies, or similar technologies for authentication, language preferences, security, and essential application functionality.</p></section>
          <section><h2 className="text-lg font-bold text-white mb-2">10. Children</h2><p>SYS STREAM is not intended for users who are not legally permitted to use financial or gaming-related services in their jurisdiction. We do not knowingly collect information from children in violation of applicable law.</p></section>
          <section><h2 className="text-lg font-bold text-white mb-2">11. Changes to This Policy</h2><p>This Privacy Policy may be updated when our services, legal requirements, or data practices change. The updated version will be published on this page with a revised date.</p></section>
          <section><h2 className="text-lg font-bold text-white mb-2">12. Contact</h2><p>For privacy questions or requests, please use the official contact channel provided by SYS STREAM.</p></section>
        </div>
      </article>
    </div>
  );
}
