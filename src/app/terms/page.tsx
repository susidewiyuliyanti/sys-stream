import React from 'react';
import { useLanguage } from '../../i18n';
import { ArrowLeft, CheckCircle2, FileText, ShieldCheck, WalletCards } from 'lucide-react';

interface Props {
  navigate?: (path: string) => void;
}

export const TERMS_VERSION = '2026-10-01';

const TERM_TRANSLATIONS: Record<string, {titles:string[]; bodies:string[][]; important:string}> = {
id:{titles:['Penerimaan Ketentuan','Kelayakan & Akun','Deposit & Aset Digital','Saldo Tersedia & Saldo Terkunci','Game, Reward & Penyelesaian','Perilaku yang Dilarang','Peninjauan & Penangguhan Akun','Ketersediaan Layanan','Batasan Tanggung Jawab','Perubahan Ketentuan','Kontak'],bodies:[
['Dengan membuat akun atau menggunakan SYS STREAM, Anda menyatakan telah membaca dan menyetujui Syarat & Ketentuan ini. Jika tidak setuju, jangan membuat atau menggunakan akun.'],
['Anda bertanggung jawab memberikan informasi pendaftaran yang benar, menjaga kredensial, dan seluruh aktivitas akun. Anda harus diizinkan secara hukum menggunakan layanan di yurisdiksi Anda.'],
['SYS STREAM dapat mendukung pembayaran aset kripto atau aset digital lain melalui platform atau penyedia pembayaran. Deposit dikreditkan setelah diterima dan diverifikasi. Biaya jaringan, konfirmasi blockchain, perubahan kurs, dan persyaratan penyedia dapat memengaruhi transaksi.','Gunakan aset, jaringan, jumlah, dan instruksi pembayaran yang benar. Transfer ke alamat atau jaringan yang salah dapat tidak dapat dibatalkan.'],
['Saldo tersedia dan saldo terkunci dicatat berdasarkan transaksi platform. Saat dana dikunci, dana dipisahkan dari saldo tersedia selama periode dan aturan yang berlaku.'],
['Game dan reward berjalan sesuai aturan yang ditampilkan SYS STREAM. Aksi game, lock, reward, dan penyelesaian diproses melalui catatan server. SYS STREAM tidak menjamin keuntungan, pendapatan, atau pengembalian dana. Gunakan hanya dana yang sanggup Anda tanggung risikonya.'],
['Anda dilarang menggunakan SYS STREAM untuk penipuan, pencucian uang, pembayaran tanpa izin, penyalahgunaan akun, manipulasi hasil game, serangan otomatis, eksploitasi kerentanan, penyamaran identitas, atau pelanggaran hukum/hak pihak ketiga.'],
['SYS STREAM dapat membatasi, menangguhkan, atau menghentikan akun jika ada dugaan fraud, penyalahgunaan, risiko keamanan, pelanggaran ketentuan, atau kewajiban hukum. Transaksi dapat ditinjau sebelum penyelesaian.'],
['Layanan dapat sementara tidak tersedia karena pemeliharaan, insiden keamanan, kegagalan jaringan, kondisi blockchain, layanan pihak ketiga, atau keadaan di luar kendali wajar.'],
['Sejauh diizinkan hukum, SYS STREAM tidak bertanggung jawab atas kerugian akibat kesalahan pengguna, transfer blockchain yang salah, kredensial yang disusupi, jaringan yang tidak didukung, penyedia pembayaran pihak ketiga, atau kejadian di luar kendali wajar.'],
['SYS STREAM dapat memperbarui ketentuan bila diperlukan. Perubahan material dapat disampaikan melalui platform dan versi baru mungkin memerlukan peninjauan serta persetujuan ulang.'],
['Untuk pertanyaan tentang ketentuan ini, gunakan kanal kontak resmi SYS STREAM.']],important:'Ketentuan ini menjelaskan cara kerja SYS STREAM dan sebaiknya ditinjau penasihat hukum yang berkualifikasi sebelum peluncuran komersial.'},
en:{titles:['Acceptance of Terms','Eligibility & Account','Deposits & Digital Assets','Available Balance & Locked Balance','Games, Rewards & Settlement','Prohibited Conduct','Account Review & Suspension','Service Availability','Limitation of Liability','Changes to These Terms','Contact'],bodies:[
['By creating an account or using SYS STREAM, you confirm that you have read and agree to these Terms & Conditions. If you do not agree, do not create or use an account.'],
['You are responsible for accurate registration information, protecting credentials, and all account activity. You must be legally permitted to use the service in your jurisdiction.'],
['SYS STREAM may support cryptocurrency or other digital-asset payments. A deposit is credited only after receipt and verification. Network fees, blockchain confirmations, exchange-rate movements, and provider requirements may affect transactions.','Use the correct asset, network, amount, and payment instructions. Transfers to incorrect addresses or unsupported networks may be irreversible.'],
['Available and locked balances are maintained from platform transaction records. Locked amounts are separated from available balance for the applicable period and rules.'],
['Games and rewards operate according to displayed SYS STREAM rules. Game actions, locks, rewards and settlement use server-side records. SYS STREAM does not guarantee profit, income or recovery; use only funds you can afford to lose.'],
['You may not use SYS STREAM for fraud, money laundering, unauthorized payments, account abuse, game manipulation, automated attacks, vulnerability exploitation, impersonation, or unlawful activity.'],
['SYS STREAM may restrict, suspend or terminate accounts for suspected fraud, abuse, security risks, violations or legal requirements. Transactions may be reviewed before settlement.'],
['The service may be temporarily unavailable due to maintenance, security incidents, network failures, blockchain conditions, third-party services or circumstances beyond reasonable control.'],
['To the extent permitted by law, SYS STREAM is not responsible for losses caused by user error, incorrect blockchain transfers, compromised credentials, unsupported networks, third-party providers or events outside reasonable control.'],
['SYS STREAM may update these Terms when necessary. Material changes may be communicated through the platform and a future version may require renewed acceptance.'],
['For questions about these Terms, use the official SYS STREAM contact channel.']],important:'These terms describe how SYS STREAM operates and should be reviewed by qualified legal counsel before commercial launch.'}
};
export default function TermsPage({ navigate }: Props) {
  const { language, t } = useLanguage();
  const tr = TERM_TRANSLATIONS[language] || TERM_TRANSLATIONS.en;
  const sections = [
    ['Acceptance of Terms','By creating an account or using SYS STREAM, you confirm that you have read and agree to these Terms & Conditions. If you do not agree, do not create or use an account.'],
    ['Eligibility & Account','You are responsible for providing accurate registration information, protecting your credentials, and all activity performed through your account. You must be legally permitted to use the service in your jurisdiction.'],
    ['Deposits & Digital Assets','SYS STREAM may support cryptocurrency or other digital-asset payment methods made available by the platform or its payment providers. A deposit is credited only after the applicable payment is received and verified. Network fees, blockchain confirmation times, exchange-rate movements, and provider requirements may affect a transaction.','You are responsible for using the correct asset, network, amount, and payment instructions. Transfers sent to an incorrect address or unsupported network may be irreversible.'],
    ['Available Balance & Locked Balance','Your available balance and locked balance are maintained from the platform transaction records. When an amount is locked, that amount is separated from the available balance for the applicable lock period and rules. Locked funds are not available for ordinary use until the relevant conditions are satisfied.'],
    ['Games, Rewards & Settlement','Games and reward mechanisms operate according to the rules displayed by SYS STREAM. Game actions, locks, rewards, and settlement are processed using server-side transaction records. Eligibility, limits, reward amounts, and settlement conditions may vary by game.','SYS STREAM does not guarantee profit, income, or recovery of any amount used in a game. Use only funds you can afford to lose.'],
    ['Prohibited Conduct','You may not use SYS STREAM for fraud, money laundering, unauthorized payments, account abuse, manipulation of game outcomes, automated attacks, exploitation of vulnerabilities, impersonation, or activity that violates applicable law or third-party rights.'],
    ['Account Review & Suspension','SYS STREAM may restrict, suspend, or terminate an account when there is suspected fraud, abuse, a security risk, a violation of these Terms, or a legal or regulatory requirement. Transactions may be reviewed before settlement where appropriate.'],
    ['Service Availability','The service may be temporarily unavailable because of maintenance, security incidents, network failures, blockchain conditions, third-party services, or circumstances outside reasonable control.'],
    ['Limitation of Liability','To the extent permitted by applicable law, SYS STREAM is not responsible for losses caused by user error, incorrect blockchain transfers, compromised credentials, unsupported networks, third-party payment providers, or events outside the platform’s reasonable control. Nothing in these Terms excludes liability that cannot legally be excluded.'],
    ['Changes to These Terms','SYS STREAM may update these Terms when necessary. Material changes may be communicated through the platform. A future version may require you to review and accept the updated Terms before continuing to use affected services.'],
    ['Contact','For questions about these Terms, please use the official contact channel provided by SYS STREAM.'],
  ];

  return (
    <div className="min-h-screen bg-[#060a14] text-slate-100 px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate?.('/login')} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-300 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> {t('Back to account')}
        </button>

        <header className="rounded-3xl border border-cyan-500/20 bg-slate-900/70 backdrop-blur-xl p-6 sm:p-8 mb-6 shadow-[0_0_45px_rgba(6,182,212,0.08)]">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-[0.18em] mb-3">
                <FileText className="w-4 h-4" /> {t('Legal')}
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{t('Terms & Conditions')}</h1>
              <p className="text-slate-400 mt-2 text-sm leading-6">{t('Please read these terms before creating your SYS STREAM account.')}</p>
            </div>
            <div className="shrink-0 rounded-2xl border border-cyan-500/20 bg-slate-950/60 px-4 py-3">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">{t('Version')}</div>
              <div className="text-sm font-bold text-cyan-300 mt-1">{TERMS_VERSION}</div>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 mt-7">
            {[[ShieldCheck,'Account & Security'],[WalletCards,'Balance & Transactions'],[CheckCircle2,'Rules & Acceptance']].map(([Icon,label]) => (
              <div key={label as string} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <Icon className="w-5 h-5 text-cyan-400 mb-2" />
                <div className="text-xs font-bold text-slate-200">{label as string}</div>
              </div>
            ))}
          </div>
        </header>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:p-8">
          <div className="space-y-4">
            {sections.map(([title, body, extra], index) => (
              <section key={title} className="rounded-2xl border border-slate-800/80 bg-slate-950/45 p-5">
                <div className="flex gap-3">
                  <div className="text-xs font-black text-cyan-400 pt-1 w-7 shrink-0">{String(index + 1).padStart(2, '0')}</div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white">{tr.titles[index] || title}</h2>
                    <p className="text-sm leading-7 text-slate-300 mt-2">{tr.bodies[index]?.[0] || body}</p>
                    {(tr.bodies[index]?.[1] || extra) && <p className="text-sm leading-7 text-slate-400 mt-2">{tr.bodies[index]?.[1] || extra}</p>}
                  </div>
                </div>
              </section>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs leading-6 text-slate-400">
            <strong className="text-slate-200">{t('Important:')}</strong> {tr.important}
          </div>
          <div className="mt-6 text-xs text-slate-500">{t('Last updated:')} October 1, 2026 · Terms version {TERMS_VERSION}</div>
        </div>
      </div>
    </div>
  );
}
